/**
 * Sanity Webhook Revalidation Endpoint
 * ─────────────────────────────────────────────────────────────────────────────
 * Called by Sanity's webhook when content is published.
 * Triggers Next.js ISR cache revalidation for the affected pages.
 *
 * Configure in Sanity: Settings → API → Webhooks
 *   URL: https://auralongvity.co.uk/api/revalidate
 *   Secret: matches REVALIDATION_SECRET env var
 */

import { revalidatePath, revalidateTag } from 'next/cache';
import { type NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest): Promise<NextResponse> {
  // ── Auth check ─────────────────────────────────────────────────────────────
  const secret = req.nextUrl.searchParams.get('secret');

  if (secret !== process.env.REVALIDATION_SECRET) {
    return NextResponse.json(
      { error: 'Invalid revalidation secret.' },
      { status: 401 }
    );
  }

  // ── Parse Sanity webhook payload ───────────────────────────────────────────
  let body: { _type?: string; slug?: { current?: string } };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON payload.' }, { status: 400 });
  }

  const docType = body._type;
  const slug    = body.slug?.current;

  try {
    switch (docType) {
      case 'treatment':
        revalidatePath('/treatments');
        revalidateTag('treatments');
        if (slug) revalidatePath(`/treatments/${slug}`);
        break;

      case 'post':
        revalidatePath('/blog');
        revalidateTag('blog');
        if (slug) revalidatePath(`/blog/${slug}`);
        break;

      case 'practitioner':
        revalidatePath('/');
        revalidatePath('/practitioners');
        revalidateTag('practitioners');
        break;

      case 'siteSettings':
        revalidatePath('/', 'layout');
        break;

      default:
        // Revalidate everything as fallback
        revalidatePath('/');
    }

    return NextResponse.json({
      revalidated: true,
      type:        docType,
      slug,
      timestamp:   new Date().toISOString(),
    });
  } catch (err) {
    return NextResponse.json(
      { error: 'Revalidation failed.', detail: String(err) },
      { status: 500 }
    );
  }
}

// Reject non-POST requests
export function GET() {
  return NextResponse.json({ error: 'Method not allowed.' }, { status: 405 });
}
