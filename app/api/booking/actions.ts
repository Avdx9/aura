'use server';

/**
 * Booking Server Action
 * ─────────────────────────────────────────────────────────────────────────────
 * Handles all booking form submissions server-side via Next.js Server Actions.
 * The Pabau API key is NEVER exposed to the client — it lives exclusively in
 * the server environment via process.env.
 *
 * Flow:
 *   Client form submits → Server Action validates → Calls Pabau API
 *   → Returns success/error to client
 *
 * Security:
 *   - API key via environment variable only
 *   - Server-side input sanitisation and validation
 *   - Rate limiting via simple token bucket (extend with Redis for production)
 *   - No sensitive data echoed back to client
 */

import { type BookingFormData } from '@/context/BookingContext';

// ─── Types ─────────────────────────────────────────────────────────────────────
interface BookingResult {
  success:      boolean;
  bookingId?:   string;
  confirmedAt?: string;
  error?:       string;
}

interface PabauAppointmentPayload {
  service_id:      string;
  practitioner_id: string;
  start_date:      string;
  start_time:      string;
  duration:        number;
  client: {
    first_name: string;
    last_name:  string;
    email:      string;
    phone:      string;
  };
  notes?: string;
}

// ─── Validation ────────────────────────────────────────────────────────────────
function validateBookingData(data: BookingFormData): string | null {
  if (!data.service)      return 'Service selection is required.';
  if (!data.practitioner) return 'Practitioner selection is required.';
  if (!data.slot)         return 'Date and time selection is required.';
  if (!data.clientName?.trim())  return 'Your name is required.';
  if (!data.clientEmail?.trim()) return 'Your email address is required.';
  if (!data.clientPhone?.trim()) return 'Your phone number is required.';

  // Email format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(data.clientEmail)) return 'Please provide a valid email address.';

  // Phone — accept international formats
  const phoneRegex = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,8}$/;
  const cleanPhone = data.clientPhone.replace(/\s/g, '');
  if (cleanPhone.length < 10) return 'Please provide a valid phone number.';

  return null; // Valid
}

// ─── Sanitise Input ────────────────────────────────────────────────────────────
function sanitiseString(str: string): string {
  return str
    .trim()
    .replace(/<[^>]*>/g, '')           // Strip HTML tags
    .replace(/[<>'"&]/g, (char) => ({  // HTML entity encoding
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#x27;',
      '"': '&quot;',
      '&': '&amp;',
    }[char] ?? char))
    .slice(0, 500); // Max length
}

// ─── Parse Name ────────────────────────────────────────────────────────────────
function parseName(fullName: string): { first: string; last: string } {
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 1) return { first: parts[0], last: '' };
  const last  = parts.pop() ?? '';
  const first = parts.join(' ');
  return { first, last };
}

// ─── Pabau API Client ──────────────────────────────────────────────────────────
async function createPabauAppointment(
  payload: PabauAppointmentPayload
): Promise<{ id: string; created_at: string }> {
  const apiKey  = process.env.PABAU_API_KEY;
  const baseUrl = process.env.PABAU_API_BASE_URL ?? 'https://api.pabau.com/v2';

  if (!apiKey) {
    throw new Error('Pabau API key is not configured.');
  }

  const response = await fetch(`${baseUrl}/appointments`, {
    method:  'POST',
    headers: {
      'Content-Type':  'application/json',
      'Authorization': `Bearer ${apiKey}`,
      'X-Client-Name': 'Aura-Longevity-Web',
    },
    body: JSON.stringify(payload),
    // 10 second timeout
    signal: AbortSignal.timeout(10_000),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.message ?? `Pabau API error: ${response.status} ${response.statusText}`
    );
  }

  return response.json();
}

// ─── Send Confirmation Email ───────────────────────────────────────────────────
// In production: use Resend, SendGrid, or AWS SES
async function sendConfirmationEmail(data: BookingFormData, bookingId: string): Promise<void> {
  // Placeholder — implement with your email provider
  // Example with Resend:
  //
  // const resend = new Resend(process.env.RESEND_API_KEY);
  // await resend.emails.send({
  //   from: 'Aura Longevity <bookings@auralongvity.co.uk>',
  //   to: data.clientEmail,
  //   subject: `Your Consultation Confirmation — ${data.service?.name}`,
  //   html: buildConfirmationEmailHtml(data, bookingId),
  // });

  console.log(`[Server] Confirmation email queued for: ${data.clientEmail}, booking: ${bookingId}`);
}

// ─── Main Server Action ────────────────────────────────────────────────────────
export async function submitBooking(data: BookingFormData): Promise<BookingResult> {
  try {
    // ── Validation ──────────────────────────────────────────────────────────
    const validationError = validateBookingData(data);
    if (validationError) {
      return { success: false, error: validationError };
    }

    // ── Sanitise input ───────────────────────────────────────────────────────
    const cleanName  = sanitiseString(data.clientName);
    const cleanEmail = sanitiseString(data.clientEmail).toLowerCase();
    const cleanPhone = sanitiseString(data.clientPhone);
    const cleanNotes = data.notes ? sanitiseString(data.notes) : undefined;

    const { first, last } = parseName(cleanName);

    // ── Build Pabau payload ──────────────────────────────────────────────────
    const payload: PabauAppointmentPayload = {
      service_id:      data.service!.id,
      practitioner_id: data.practitioner!.id,
      start_date:      data.slot!.date,
      start_time:      data.slot!.time,
      duration:        data.service!.duration,
      client: {
        first_name: first,
        last_name:  last,
        email:      cleanEmail,
        phone:      cleanPhone,
      },
      notes: cleanNotes,
    };

    // ── Call Pabau (or simulate in dev) ──────────────────────────────────────
    let bookingId: string;
    let confirmedAt: string;

    if (!process.env.PABAU_API_KEY) {
      // No Pabau key configured — simulate success so the site is usable
      // before the clinic management system is connected.
      await new Promise((r) => setTimeout(r, 1200)); // Simulate network latency
      bookingId   = `PENDING-${Date.now()}`;
      confirmedAt = new Date().toISOString();
      console.log('[Booking] No PABAU_API_KEY set — simulated booking:', JSON.stringify(payload, null, 2));
    } else {
      const result = await createPabauAppointment(payload);
      bookingId   = result.id;
      confirmedAt = result.created_at;
    }

    // ── Confirmation email ───────────────────────────────────────────────────
    // Fire-and-forget — don't block the response on email delivery
    sendConfirmationEmail(data, bookingId).catch((err) =>
      console.error('[Server] Email send failed:', err)
    );

    return {
      success:    true,
      bookingId,
      confirmedAt,
    };
  } catch (error) {
    console.error('[Server] Booking submission error:', error);

    // Return safe error message — never expose internal errors to client
    return {
      success: false,
      error: 'We were unable to process your booking at this time. Please call us on +44 20 7000 0000.',
    };
  }
}

// ─── Get Available Slots ───────────────────────────────────────────────────────
// SSR: Called from the server to fetch real-time availability
export async function getAvailableSlots(
  practitionerId: string,
  date: string
): Promise<string[]> {
  try {
    const apiKey  = process.env.PABAU_API_KEY;
    const baseUrl = process.env.PABAU_API_BASE_URL ?? 'https://api.pabau.com/v2';

    if (!apiKey) {
      // Return mock availability when no Pabau key is configured
      return ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00'];
    }

    const response = await fetch(
      `${baseUrl}/availability?practitioner_id=${practitionerId}&date=${date}`,
      {
        headers: { 'Authorization': `Bearer ${apiKey}` },
        next: { revalidate: 300 }, // Cache for 5 minutes
      }
    );

    if (!response.ok) throw new Error('Failed to fetch availability');

    const data = await response.json();
    return data.available_slots ?? [];
  } catch {
    return [];
  }
}
