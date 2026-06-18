'use client';

/**
 * HeroSection
 * ─────────────────────────────────────────────────────────────────────────────
 * Full-viewport hero section composing:
 *   - HeroShaderCanvas: Three.js WebGL fluid distortion over editorial image
 *   - Kinetic typography: GSAP staggered word/char reveal on mount
 *   - Scroll CTA: animated chevron indicating scroll
 *   - Parallax: background drifts at 0.4x scroll speed relative to text
 *   - "Book Consultation" CTA that opens the BookingDrawer
 */

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { HeroShaderCanvas } from '@/components/shaders/HeroShaderCanvas';
import { useBooking } from '@/context/BookingContext';
import { useLenis } from '@/context/LenisContext';
import { splitTextIntoSpans } from '@/lib/gsap';

// ─── Hero data ─────────────────────────────────────────────────────────────────
const HERO_IMAGE  = '/images/hero-editorial.jpg';
const HERO_KICKER = 'Mayfair · Est. 2019';
const HERO_LINE_1 = 'The Art of';
const HERO_LINE_2 = 'Ageing';
const HERO_LINE_3 = 'Beautifully';
const HERO_BODY   = 'Precision aesthetic medicine for those who demand the exceptional.';

export function HeroSection() {
  const sectionRef   = useRef<HTMLElement>(null);
  const kickerRef    = useRef<HTMLParagraphElement>(null);
  const headline1Ref = useRef<HTMLSpanElement>(null);
  const headline2Ref = useRef<HTMLSpanElement>(null);
  const headline3Ref = useRef<HTMLSpanElement>(null);
  const bodyRef      = useRef<HTMLParagraphElement>(null);
  const ctaRef       = useRef<HTMLDivElement>(null);
  const scrollRef    = useRef<HTMLDivElement>(null);

  const { open: openBooking } = useBooking();
  const { scrollTo }          = useLenis();

  // ── GSAP Intro Animation ─────────────────────────────────────────────────
  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ delay: 0.15 });

      // Kicker label
      tl.fromTo(kickerRef.current,
        { opacity: 0, y: 12, letterSpacing: '0.5em' },
        { opacity: 1, y: 0,  letterSpacing: '0.3em', duration: 0.7, ease: 'power3.out' }
      );

      // Headline lines — individual word reveal
      [headline1Ref, headline2Ref, headline3Ref].forEach((ref, i) => {
        if (!ref.current) return;
        const spans = splitTextIntoSpans(ref.current, 'words');
        gsap.set(spans, { y: '110%', opacity: 0 });
        tl.to(spans, {
          y: 0,
          opacity: 1,
          duration: 0.65,
          stagger: 0.035,
          ease: 'power3.out',
        }, i === 0 ? '-=0.45' : '-=0.5');
      });

      // Body copy
      tl.fromTo(bodyRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0,  duration: 0.6, ease: 'power2.out' },
        '-=0.35'
      );

      // CTA buttons
      tl.fromTo(ctaRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0,  duration: 0.55, ease: 'power2.out' },
        '-=0.4'
      );

      // Scroll indicator
      tl.fromTo(scrollRef.current,
        { opacity: 0 },
        { opacity: 1,  duration: 0.5, ease: 'power2.out' },
        '-=0.25'
      );

    }, sectionRef);

    return () => ctx.revert();
  }, []);

  // ── Scroll to next section ───────────────────────────────────────────────
  const handleScrollDown = () => {
    const next = document.getElementById('marquee');
    if (next) scrollTo(next, { offset: 0, duration: 1.6 });
  };

  return (
    <section
      ref={sectionRef}
      className="relative w-full h-screen min-h-[680px] overflow-hidden grain-overlay"
      aria-label="Hero section"
    >
      {/* ── WebGL Shader Canvas ──────────────────────────────────────────── */}
      <HeroShaderCanvas
        imageSrc={HERO_IMAGE}
        className="absolute inset-0 w-full h-full z-0"
      />

      {/* ── Gradient overlay — obsidian vignette ────────────────────────── */}
      <div className="absolute inset-0 z-10 bg-gradient-to-b from-obsidian-950/10 via-transparent to-obsidian-950/90" />
      <div className="absolute inset-0 z-10 bg-gradient-to-r from-obsidian-950/60 via-transparent to-transparent" />

      {/* ── Content ──────────────────────────────────────────────────────── */}
      <div className="relative z-20 h-full flex flex-col justify-end pb-12 lg:pb-20 pt-[calc(var(--nav-height)+2rem)]">
        <div className="container-luxury">

          {/* Kicker / location */}
          <p
            ref={kickerRef}
            className="label-overline mb-6 opacity-0"
            aria-hidden="true"
          >
            {HERO_KICKER}
          </p>

          {/* Headline — three lines with italic on middle word */}
          <h1 className="font-display font-normal text-fluid-hero text-pearl leading-[0.95]
                          tracking-[-0.02em] mb-8 max-w-[90vw] lg:max-w-[18ch] break-words">
            {/* Line 1 */}
            <span
              ref={headline1Ref}
              className="block overflow-hidden"
              aria-hidden="true"
            >
              {HERO_LINE_1}
            </span>

            {/* Line 2 — italic champagne */}
            <span
              ref={headline2Ref}
              className="block overflow-hidden"
              aria-hidden="true"
            >
              <em className="not-italic text-gradient-gold italic">{HERO_LINE_2}</em>
            </span>

            {/* Line 3 */}
            <span
              ref={headline3Ref}
              className="block overflow-hidden"
              aria-hidden="true"
            >
              {HERO_LINE_3}
            </span>

            {/* Screen reader text — complete headline */}
            <span className="sr-only">
              {HERO_LINE_1} {HERO_LINE_2} {HERO_LINE_3}
            </span>
          </h1>

          {/* Body copy */}
          <p
            ref={bodyRef}
            className="font-body text-fluid-lg text-pearl/60 max-w-sm leading-relaxed mb-8 opacity-0"
          >
            {HERO_BODY}
          </p>

          {/* CTA row */}
          <div ref={ctaRef} className="flex flex-wrap items-center gap-4 opacity-0">
            <button
              onClick={() => openBooking()}
              className="btn-primary"
              data-cursor-text="Book"
            >
              <span>Book Private Consultation</span>
            </button>

            <button
              onClick={() => {
                const el = document.getElementById('treatments');
                if (el) scrollTo(el, { offset: -80 });
              }}
              className="btn-outline"
            >
              <span>Explore Treatments</span>
            </button>
          </div>

          {/* Statistics strip */}
          <div className="mt-10 flex gap-10 border-t border-pearl/10 pt-6">
            {[
              { value: '2,400+', label: 'Treatments Delivered' },
              { value: '98%',    label: 'Client Satisfaction' },
              { value: '12+',    label: 'Years of Excellence' },
            ].map(({ value, label }) => (
              <div key={label} className="hidden sm:block">
                <p className="font-mono text-xl text-champagne-DEFAULT">{value}</p>
                <p className="font-body text-xs text-pearl/30 tracking-wide mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Scroll indicator ─────────────────────────────────────────────── */}
      <div
        ref={scrollRef}
        className="absolute bottom-10 right-8 lg:right-16 z-20 flex flex-col items-center gap-2 opacity-0"
      >
        <button
          onClick={handleScrollDown}
          className="flex flex-col items-center gap-2 group"
          aria-label="Scroll down"
        >
          <span className="font-mono text-[9px] text-pearl/30 tracking-widest uppercase [writing-mode:vertical-lr]">
            Scroll
          </span>
          <div className="w-px h-12 bg-gradient-to-b from-pearl/20 to-champagne-DEFAULT/60 animate-float" />
        </button>
      </div>

      {/* ── Decorative corner lines ───────────────────────────────────────── */}
      <div className="absolute top-[var(--nav-height)] right-0 z-20 pointer-events-none">
        <div className="w-px h-24 bg-gradient-to-b from-champagne-DEFAULT/30 to-transparent ml-auto mr-8 lg:mr-16" />
      </div>
    </section>
  );
}
