/**
 * Homepage — Static Site Generation (SSG)
 * ─────────────────────────────────────────────────────────────────────────────
 * Pre-rendered at build time via Next.js App Router.
 * Dynamic content (blog, pricing) uses SSR in separate routes.
 *
 * Sections:
 *   1. Hero — WebGL fluid shader + kinetic type
 *   2. Marquee — Trust signals
 *   3. Philosophy — Brand narrative + parallax
 *   4. Treatments — Service cards + anatomy visualiser
 *   5. Results — Before/After sliders
 *   6. Practitioners — Team credibility
 *   7. Statistics — Animated counters
 *   8. Testimonials — Client quotes
 *   9. CTA — Final booking push
 *  10. Footer
 */

import type { Metadata } from 'next';
import { HeroSection }          from '@/components/sections/HeroSection';
import { MarqueeSection }       from '@/components/sections/MarqueeSection';
import { PhilosophySection }    from '@/components/sections/PhilosophySection';
import { TreatmentsSection }    from '@/components/sections/TreatmentsSection';
import { ResultsSection }       from '@/components/sections/ResultsSection';
import { PractitionersSection } from '@/components/sections/PractitionersSection';
import { StatisticsSection }    from '@/components/sections/StatisticsSection';
import { TestimonialsSection }  from '@/components/sections/TestimonialsSection';
import { CtaSection }           from '@/components/sections/CtaSection';
import { Footer }               from '@/components/sections/Footer';

// ─── SSG: generate at build time ──────────────────────────────────────────────
// revalidate = false means this page is fully static (ISR disabled).
// For ISR (rebuild every N seconds): export const revalidate = 3600;
export const dynamic    = 'force-static';
export const revalidate = false;

// ─── Page-level metadata ───────────────────────────────────────────────────────
export const metadata: Metadata = {
  title:       'Aura Longevity | Elite Aesthetics & Anti-Ageing Clinic Mayfair London',
  description: 'Mayfair\'s foremost private aesthetics clinic. Advanced facial contouring, longevity medicine, and bespoke wellness programmes. Book a private consultation.',
  alternates: { canonical: 'https://auralongvity.co.uk' },
};

export default function HomePage() {
  return (
    <>
      {/* ── 1. Hero — WebGL fluid shader over editorial hero image ──────── */}
      <HeroSection />

      {/* ── 2. Marquee — Moving trust strip ─────────────────────────────── */}
      <MarqueeSection />

      {/* ── 3. Philosophy ────────────────────────────────────────────────── */}
      <PhilosophySection />

      {/* ── 4. Treatments + 3D Anatomy Visualiser ────────────────────────── */}
      <TreatmentsSection />

      {/* ── 5. Before / After Results ────────────────────────────────────── */}
      <ResultsSection />

      {/* ── 6. Practitioners ─────────────────────────────────────────────── */}
      <PractitionersSection />

      {/* ── 7. Statistics — Animated counters ────────────────────────────── */}
      <StatisticsSection />

      {/* ── 8. Testimonials ──────────────────────────────────────────────── */}
      <TestimonialsSection />

      {/* ── 9. Final CTA ─────────────────────────────────────────────────── */}
      <CtaSection />

      {/* ── 10. Footer ───────────────────────────────────────────────────── */}
      <Footer />
    </>
  );
}
