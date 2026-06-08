'use client';

/**
 * BookingDrawer
 * ─────────────────────────────────────────────────────────────────────────────
 * A React portal component that slides out from the right edge of the screen
 * as an overlay drawer — no page reload, no redirect.
 *
 * Architecture:
 *   - Rendered via createPortal to document.body (outside main DOM hierarchy)
 *   - Animated via CSS transitions (no GSAP dependency for this component)
 *   - Multi-step state managed by BookingContext
 *   - Form submission via Next.js Server Action (API key never exposed client-side)
 *
 * Steps:
 *   1. Service selection (category tabs + service cards)
 *   2. Practitioner selection (avatar + specialty chips)
 *   3. Date & time picker (calendar + available slot grid)
 *   4. Client details (name, email, phone, notes)
 *   5. Confirmation screen
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import { useBooking, type BookingService, type BookingPractitioner, type BookingStep } from '@/context/BookingContext';
import { submitBooking } from '@/app/api/booking/actions';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

// ─── Static data (would come from CMS/API in production) ──────────────────────
const SERVICES: BookingService[] = [
  { id: 'facial-contouring',    name: 'Advanced Facial Contouring',   duration: 90,  price: 2000, category: 'Face' },
  { id: 'prp-rejuvenation',     name: 'PRP Rejuvenation Therapy',     duration: 60,  price: 850,  category: 'Face' },
  { id: 'skin-booster',         name: 'Profhilo Skin Booster',        duration: 45,  price: 650,  category: 'Face' },
  { id: 'iv-longevity',         name: 'IV Longevity Infusion',        duration: 90,  price: 1200, category: 'Wellness' },
  { id: 'nad-therapy',          name: 'NAD+ Cellular Restoration',    duration: 120, price: 1800, category: 'Wellness' },
  { id: 'body-sculpting',       name: 'Precision Body Sculpting',     duration: 75,  price: 1400, category: 'Body' },
];

const PRACTITIONERS: BookingPractitioner[] = [
  { id: 'dr-chen',    name: 'Dr Sarah Chen',    title: 'Medical Director, MBBS GMC',       specialties: ['Facial Contouring', 'PRP', 'Anti-Ageing'],    avatar: '/images/practitioners/sarah-chen.png' },
  { id: 'dr-hassan',  name: 'Dr Omar Hassan',   title: 'Aesthetic Physician, MBBS MRCS',   specialties: ['Body Sculpting', 'Fillers', 'Laser'],          avatar: '/images/practitioners/omar-hassan.png' },
  { id: 'dr-novak',   name: 'Dr Elena Novak',   title: 'Longevity Physician, MD PhD',      specialties: ['IV Therapy', 'NAD+', 'Regenerative Medicine'], avatar: '/images/practitioners/elena-novak.png' },
];

// ─── Sub-components ────────────────────────────────────────────────────────────

// Step 1: Service Selection
function ServiceStep() {
  const { formData, updateFormData, setStep } = useBooking();
  const [activeCategory, setActiveCategory] = useState('Face');
  const categories = Array.from(new Set(SERVICES.map((s) => s.category)));
  const filtered = SERVICES.filter((s) => s.category === activeCategory);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="label-overline mb-4">Step 1 of 4</p>
        <h3 className="font-display text-2xl text-pearl font-normal leading-tight">
          Select Your Treatment
        </h3>
        <p className="text-pearl/50 text-sm mt-2 font-body">
          All treatments include a complimentary consultation.
        </p>
      </div>

      {/* Category tabs */}
      <div className="flex gap-2 border-b border-pearl/10">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={cn(
              'pb-3 px-1 font-mono text-xs tracking-widest uppercase transition-all duration-300',
              activeCategory === cat
                ? 'text-champagne-DEFAULT border-b-2 border-champagne-DEFAULT'
                : 'text-pearl/40 hover:text-pearl/70'
            )}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Service cards */}
      <div className="flex flex-col gap-3">
        {filtered.map((service) => (
          <button
            key={service.id}
            onClick={() => {
              updateFormData({ service });
              setStep('practitioner');
            }}
            className={cn(
              'group flex items-center justify-between p-4 text-left transition-all duration-400',
              'border border-pearl/10 hover:border-champagne-DEFAULT/40',
              'bg-obsidian-900/30 hover:bg-obsidian-900/60',
              formData.service?.id === service.id
                ? 'border-champagne-DEFAULT/60 bg-obsidian-900/60'
                : ''
            )}
            style={{
              clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))',
            }}
          >
            <div>
              <p className="text-pearl font-body text-sm font-medium leading-snug group-hover:text-champagne-DEFAULT transition-colors">
                {service.name}
              </p>
              <p className="text-pearl/40 font-mono text-xs mt-1">
                {service.duration} min
              </p>
            </div>
            <div className="text-right shrink-0 ml-4">
              <p className="text-champagne-DEFAULT font-mono text-sm">
                £{service.price.toLocaleString()}
              </p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

// Step 2: Practitioner Selection
function PractitionerStep() {
  const { formData, updateFormData, setStep } = useBooking();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="label-overline mb-4">Step 2 of 4</p>
        <h3 className="font-display text-2xl text-pearl font-normal leading-tight">
          Choose Your Practitioner
        </h3>
        <p className="text-pearl/50 text-sm mt-2 font-body">
          Each practitioner is GMC registered with a minimum of 10 years&apos; experience.
        </p>
      </div>

      <div className="flex flex-col gap-4">
        {PRACTITIONERS.map((practitioner) => (
          <button
            key={practitioner.id}
            onClick={() => {
              updateFormData({ practitioner });
              setStep('datetime');
            }}
            className={cn(
              'group flex items-start gap-4 p-4 text-left transition-all duration-400',
              'border border-pearl/10 hover:border-champagne-DEFAULT/40',
              'bg-obsidian-900/30 hover:bg-obsidian-900/60',
              formData.practitioner?.id === practitioner.id
                ? 'border-champagne-DEFAULT/60 bg-obsidian-900/60'
                : ''
            )}
            style={{
              clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))',
            }}
          >
            {/* Avatar */}
            <div className="w-14 h-14 shrink-0 bg-obsidian-800 overflow-hidden relative"
                 style={{ clipPath: 'polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px))' }}>
              <Image
                src={practitioner.avatar}
                alt={practitioner.name}
                fill
                className="object-cover object-top"
                sizes="56px"
              />
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <p className="text-pearl font-body text-sm font-medium group-hover:text-champagne-DEFAULT transition-colors">
                {practitioner.name}
              </p>
              <p className="text-pearl/40 font-mono text-xs mt-0.5 truncate">
                {practitioner.title}
              </p>
              {/* Specialties */}
              <div className="flex flex-wrap gap-1.5 mt-2">
                {practitioner.specialties.slice(0, 2).map((spec) => (
                  <span key={spec}
                    className="px-2 py-0.5 bg-champagne-DEFAULT/10 text-champagne-DEFAULT/70 font-mono text-[10px] tracking-wider">
                    {spec}
                  </span>
                ))}
              </div>
            </div>
          </button>
        ))}
      </div>

      <button
        onClick={() => setStep('service')}
        className="text-pearl/30 hover:text-pearl/60 font-mono text-xs tracking-widest uppercase transition-colors text-left"
      >
        ← Back
      </button>
    </div>
  );
}

// Step 3: Date & Time Selection
function DateTimeStep() {
  const { formData, updateFormData, setStep } = useBooking();
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');

  // Generate next 14 days (excluding Sundays)
  const availableDates = Array.from({ length: 14 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i + 1);
    return d;
  }).filter((d) => d.getDay() !== 0); // No Sundays

  const availableTimes = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '12:00', '14:00', '14:30', '15:00', '15:30', '16:00',
    '16:30', '17:00', '17:30', '18:00',
  ];

  // Some times booked (would come from Pabau API in production)
  const bookedTimes = ['10:30', '14:00', '16:30'];

  const handleConfirm = () => {
    if (!selectedDate || !selectedTime) return;
    updateFormData({
      slot: {
        date: selectedDate,
        time: selectedTime,
        practitionerId: formData.practitioner?.id ?? '',
      },
    });
    setStep('details');
  };

  const formatDate = (d: Date) =>
    d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="label-overline mb-4">Step 3 of 4</p>
        <h3 className="font-display text-2xl text-pearl font-normal leading-tight">
          Select Date & Time
        </h3>
      </div>

      {/* Date picker */}
      <div>
        <p className="font-mono text-xs text-pearl/40 tracking-widest uppercase mb-3">Available Dates</p>
        <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto pr-1 custom-scrollbar">
          {availableDates.map((date) => {
            const iso = date.toISOString().split('T')[0];
            const isSelected = selectedDate === iso;
            return (
              <button
                key={iso}
                onClick={() => setSelectedDate(iso)}
                className={cn(
                  'p-2.5 text-center transition-all duration-300 font-body text-xs leading-tight',
                  'border',
                  isSelected
                    ? 'border-champagne-DEFAULT bg-champagne-DEFAULT/15 text-champagne-DEFAULT'
                    : 'border-pearl/10 text-pearl/50 hover:border-pearl/30 hover:text-pearl/80'
                )}
                style={{
                  clipPath: 'polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px))',
                }}
              >
                {formatDate(date)}
              </button>
            );
          })}
        </div>
      </div>

      {/* Time slots */}
      {selectedDate && (
        <div>
          <p className="font-mono text-xs text-pearl/40 tracking-widest uppercase mb-3">Available Times</p>
          <div className="grid grid-cols-4 gap-2">
            {availableTimes.map((time) => {
              const isBooked   = bookedTimes.includes(time);
              const isSelected = selectedTime === time;
              return (
                <button
                  key={time}
                  onClick={() => !isBooked && setSelectedTime(time)}
                  disabled={isBooked}
                  className={cn(
                    'py-2 text-center font-mono text-xs transition-all duration-200',
                    'border',
                    isBooked
                      ? 'border-pearl/5 text-pearl/15 cursor-not-allowed line-through'
                      : isSelected
                        ? 'border-champagne-DEFAULT bg-champagne-DEFAULT/15 text-champagne-DEFAULT'
                        : 'border-pearl/10 text-pearl/50 hover:border-pearl/30 hover:text-pearl/80 cursor-pointer'
                  )}
                >
                  {time}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Confirm */}
      <button
        onClick={handleConfirm}
        disabled={!selectedDate || !selectedTime}
        className={cn(
          'btn-primary w-full justify-center mt-2',
          (!selectedDate || !selectedTime) && 'opacity-30 cursor-not-allowed'
        )}
      >
        <span>Continue</span>
      </button>

      <button
        onClick={() => setStep('practitioner')}
        className="text-pearl/30 hover:text-pearl/60 font-mono text-xs tracking-widest uppercase transition-colors text-left"
      >
        ← Back
      </button>
    </div>
  );
}

// Step 4: Client Details
function DetailsStep() {
  const { formData, updateFormData, setStep } = useBooking();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (field: string) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => updateFormData({ [field]: e.target.value } as any);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Server Action — API key never exposed to client
      const result = await submitBooking(formData);

      if (result.success) {
        setStep('confirm');
      } else {
        toast.error(result.error ?? 'Booking failed. Please call us directly.');
      }
    } catch {
      toast.error('An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClass = cn(
    'w-full bg-obsidian-900/40 border border-pearl/10 text-pearl font-body text-sm',
    'px-4 py-3 placeholder:text-pearl/25',
    'focus:outline-none focus:border-champagne-DEFAULT/50 focus:bg-obsidian-900/60',
    'transition-all duration-300'
  );

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6" noValidate>
      <div>
        <p className="label-overline mb-4">Step 4 of 4</p>
        <h3 className="font-display text-2xl text-pearl font-normal leading-tight">
          Your Details
        </h3>
        <p className="text-pearl/50 text-sm mt-2 font-body">
          All information is treated in strict confidence.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        <div>
          <label className="label-overline block mb-1.5">Full Name *</label>
          <input
            type="text"
            required
            value={formData.clientName}
            onChange={handleChange('clientName')}
            placeholder="Lady Sarah Ashworth"
            className={inputClass}
            style={{ clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 0 100%)' }}
          />
        </div>

        <div>
          <label className="label-overline block mb-1.5">Email Address *</label>
          <input
            type="email"
            required
            value={formData.clientEmail}
            onChange={handleChange('clientEmail')}
            placeholder="sarah@example.com"
            className={inputClass}
            style={{ clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 0 100%)' }}
          />
        </div>

        <div>
          <label className="label-overline block mb-1.5">Phone Number *</label>
          <input
            type="tel"
            required
            value={formData.clientPhone}
            onChange={handleChange('clientPhone')}
            placeholder="+44 7700 900000"
            className={inputClass}
            style={{ clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 0 100%)' }}
          />
        </div>

        <div>
          <label className="label-overline block mb-1.5">Notes (optional)</label>
          <textarea
            value={formData.notes}
            onChange={handleChange('notes')}
            rows={3}
            placeholder="Any relevant medical history or specific concerns..."
            className={cn(inputClass, 'resize-none')}
            style={{ clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 0 100%)' }}
          />
        </div>
      </div>

      {/* Summary card */}
      <div className="p-4 bg-obsidian-900/60 border border-champagne-DEFAULT/10 space-y-2 text-xs font-mono"
           style={{ clipPath: 'polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))' }}>
        <div className="flex justify-between text-pearl/40">
          <span className="uppercase tracking-widest">Treatment</span>
          <span className="text-pearl/70">{formData.service?.name}</span>
        </div>
        <div className="flex justify-between text-pearl/40">
          <span className="uppercase tracking-widest">Practitioner</span>
          <span className="text-pearl/70">{formData.practitioner?.name}</span>
        </div>
        <div className="flex justify-between text-pearl/40">
          <span className="uppercase tracking-widest">Date & Time</span>
          <span className="text-pearl/70">
            {formData.slot?.date} at {formData.slot?.time}
          </span>
        </div>
        <div className="line-champagne my-1" />
        <div className="flex justify-between">
          <span className="text-pearl/40 uppercase tracking-widest">Investment</span>
          <span className="text-champagne-DEFAULT">
            £{formData.service?.price.toLocaleString()}
          </span>
        </div>
      </div>

      <button
        type="submit"
        disabled={isSubmitting || !formData.clientName || !formData.clientEmail || !formData.clientPhone}
        className={cn(
          'btn-primary w-full justify-center relative overflow-hidden',
          (isSubmitting || !formData.clientName || !formData.clientEmail) && 'opacity-50 cursor-not-allowed'
        )}
      >
        <span>{isSubmitting ? 'Securing Your Appointment…' : 'Confirm Booking'}</span>
      </button>

      <button
        type="button"
        onClick={() => setStep('datetime')}
        className="text-pearl/30 hover:text-pearl/60 font-mono text-xs tracking-widest uppercase transition-colors text-left"
      >
        ← Back
      </button>
    </form>
  );
}

// Step 5: Confirmation
function ConfirmationStep() {
  const { close, reset } = useBooking();

  return (
    <div className="flex flex-col items-center justify-center h-full gap-8 text-center">
      {/* Success mark */}
      <div className="w-20 h-20 border border-champagne-DEFAULT/30 flex items-center justify-center"
           style={{ clipPath: 'polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))' }}>
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden>
          <path d="M6 16L13 23L26 9" stroke="#c9a96e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>

      <div className="space-y-3">
        <p className="label-overline">Appointment Confirmed</p>
        <h3 className="font-display text-3xl text-pearl font-normal">
          We Look Forward to<br />
          <em className="text-gradient-gold">Seeing You</em>
        </h3>
        <p className="text-pearl/50 font-body text-sm max-w-xs mx-auto leading-relaxed">
          A confirmation has been sent to your email address. 
          Our team will contact you within 2 hours to finalise your appointment.
        </p>
      </div>

      <div className="space-y-3 w-full">
        <button
          onClick={() => { reset(); close(); }}
          className="btn-outline w-full justify-center"
        >
          <span>Close</span>
        </button>
        <p className="text-pearl/25 font-mono text-xs">
          12 Harley Street, Mayfair, London W1G 9PQ
        </p>
      </div>
    </div>
  );
}

// ─── Progress Indicator ───────────────────────────────────────────────────────
function StepIndicator({ currentStep }: { currentStep: BookingStep }) {
  const steps: { key: BookingStep; label: string }[] = [
    { key: 'service',      label: 'Treatment' },
    { key: 'practitioner', label: 'Practitioner' },
    { key: 'datetime',     label: 'Schedule' },
    { key: 'details',      label: 'Details' },
  ];

  const stepIndex = steps.findIndex((s) => s.key === currentStep);

  if (currentStep === 'confirm') return null;

  return (
    <div className="flex gap-1 mb-6">
      {steps.map((step, i) => (
        <div
          key={step.key}
          className={cn(
            'h-0.5 flex-1 transition-all duration-500',
            i <= stepIndex ? 'bg-champagne-DEFAULT' : 'bg-pearl/10'
          )}
        />
      ))}
    </div>
  );
}

// ─── Main Drawer ──────────────────────────────────────────────────────────────
export function BookingDrawer() {
  const { isOpen, currentStep, close } = useBooking();
  const [isMounted, setIsMounted] = useState(false);
  const drawerRef = useRef<HTMLDivElement>(null);

  // Portal requires client-side mount
  useEffect(() => setIsMounted(true), []);

  // Keyboard trap — close on Escape
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) close();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, close]);

  // Focus management — trap focus within drawer when open
  useEffect(() => {
    if (isOpen && drawerRef.current) {
      const firstFocusable = drawerRef.current.querySelector<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      firstFocusable?.focus();
    }
  }, [isOpen, currentStep]);

  if (!isMounted) return null;

  const renderStep = () => {
    switch (currentStep) {
      case 'service':      return <ServiceStep />;
      case 'practitioner': return <PractitionerStep />;
      case 'datetime':     return <DateTimeStep />;
      case 'details':      return <DetailsStep />;
      case 'confirm':      return <ConfirmationStep />;
    }
  };

  return createPortal(
    <>
      {/* ── Backdrop ────────────────────────────────────────────────────────── */}
      <div
        className={cn(
          'fixed inset-0 bg-obsidian-950/70 backdrop-blur-sm z-overlay transition-all duration-700',
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        )}
        onClick={close}
        aria-hidden="true"
      />

      {/* ── Drawer ──────────────────────────────────────────────────────────── */}
      <div
        id="booking-drawer"
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        aria-label="Book a consultation"
        data-lenis-prevent
        className={cn(
          'fixed top-0 right-0 h-full z-modal',
          'flex flex-col',
          'bg-obsidian-950 border-l border-pearl/10',
          'transition-transform duration-700',
          'overflow-y-auto',
          isOpen ? 'translate-x-0' : 'translate-x-full'
        )}
        style={{ width: 'var(--drawer-width)' }}
      >
        {/* Drawer inner */}
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-pearl/10 shrink-0">
            {/* Logo mark */}
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 border border-champagne-DEFAULT/50"
                   style={{ clipPath: 'polygon(0 0, calc(100% - 5px) 0, 100% 5px, 100% 100%, 5px 100%, 0 calc(100% - 5px))' }}>
                <div className="w-full h-full bg-gradient-to-br from-champagne-DEFAULT/20 to-transparent" />
              </div>
              <div>
                <p className="font-display text-sm text-pearl font-normal tracking-wide">Aura Longevity</p>
                <p className="font-mono text-[10px] text-pearl/30 tracking-widest uppercase">Private Consultation</p>
              </div>
            </div>

            {/* Close */}
            <button
              onClick={close}
              className="w-9 h-9 flex items-center justify-center border border-pearl/10 hover:border-pearl/40 transition-colors"
              aria-label="Close booking drawer"
              style={{ clipPath: 'polygon(0 0, calc(100% - 5px) 0, 100% 5px, 100% 100%, 5px 100%, 0 calc(100% - 5px))' }}
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
                <path d="M1 1L13 13M13 1L1 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </button>
          </div>

          {/* Progress indicator */}
          <div className="px-6 pt-5">
            <StepIndicator currentStep={currentStep} />
          </div>

          {/* Step content */}
          <div className="flex-1 px-6 pb-6 overflow-y-auto" data-lenis-prevent>
            {renderStep()}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-pearl/5 shrink-0">
            <div className="flex items-center justify-between">
              <p className="font-mono text-[10px] text-pearl/20 tracking-widest uppercase">
                Secure booking
              </p>
              <div className="flex items-center gap-2">
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
                  <rect x="1" y="5" width="10" height="7" rx="1" stroke="currentColor" strokeWidth="1" opacity="0.3"/>
                  <path d="M3.5 5V3.5C3.5 2.12 4.62 1 6 1C7.38 1 8.5 2.12 8.5 3.5V5" stroke="currentColor" strokeWidth="1" opacity="0.3"/>
                </svg>
                <p className="font-mono text-[10px] text-pearl/20 tracking-widest uppercase">
                  256-bit encrypted
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Decorative corner accent */}
        <div className="absolute top-0 left-0 w-px h-24 bg-gradient-to-b from-champagne-DEFAULT/40 to-transparent" />
        <div className="absolute top-0 left-0 w-24 h-px bg-gradient-to-r from-champagne-DEFAULT/40 to-transparent" />
      </div>
    </>,
    document.body
  );
}
