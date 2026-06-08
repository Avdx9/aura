'use client';

import { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useBooking } from '@/context/BookingContext';
import { animateKineticText } from '@/lib/gsap';

gsap.registerPlugin(ScrollTrigger);

export function CtaSection() {
  const sectionRef  = useRef<HTMLElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const ctaRef      = useRef<HTMLDivElement>(null);

  const { open: openBooking } = useBooking();

  useEffect(() => {
    const ctx = gsap.context(() => {
      if (headlineRef.current) {
        animateKineticText(headlineRef.current, {
          type: 'words', duration: 1.1, stagger: 0.06, y: 70, start: 'top 85%',
        });
      }

      gsap.fromTo(ctaRef.current,
        { opacity: 0, y: 30 },
        {
          opacity: 1, y: 0, duration: 0.9, ease: 'power2.out',
          scrollTrigger: { trigger: ctaRef.current, start: 'top 88%', once: true },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="section-padding relative overflow-hidden bg-obsidian-950"
    >
      {/* Decorative background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-radial-gold" />
        {/* Thin gold lines — decorative */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-24 bg-gradient-to-b from-transparent to-champagne-DEFAULT/20" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-px h-24 bg-gradient-to-t from-transparent to-champagne-DEFAULT/20" />
      </div>

      <div className="container-luxury relative z-10 text-center">
        {/* Overline */}
        <p className="label-overline mb-8">Begin Your Journey</p>

        {/* Headline */}
        <h2
          ref={headlineRef}
          className="font-display text-fluid-5xl text-pearl font-normal leading-tight max-w-3xl mx-auto tracking-tight"
        >
          Your transformation begins with a single conversation
        </h2>

        <p className="font-body text-pearl/45 text-fluid-lg mt-8 max-w-md mx-auto leading-relaxed">
          Private consultations by appointment. Complimentary for all new patients.
          Complete discretion guaranteed.
        </p>

        {/* CTA buttons */}
        <div ref={ctaRef} className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-12 opacity-0">
          <button
            onClick={() => openBooking()}
            className="btn-primary text-sm"
            data-cursor-text="Book"
          >
            <span>Book Private Consultation</span>
          </button>

          <a
            href="tel:+442070000000"
            className="btn-outline text-sm"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
              <path d="M2 2.5C2 2.5 3 5.5 5 7.5C7 9.5 10 10.5 10 10.5L11.5 8.5L9 7L8 8.5C8 8.5 6.5 7.5 5.5 6.5C4.5 5.5 3.5 4 3.5 4L5 3L3.5 0.5L2 2.5Z"
                    fill="currentColor" className="text-champagne-DEFAULT/60"/>
            </svg>
            <span>+44 20 7000 0000</span>
          </a>
        </div>

        {/* Address */}
        <p className="font-mono text-xs text-pearl/20 mt-12 tracking-widest">
          12 Harley Street, Mayfair, London W1G 9PQ · Monday – Friday 9am–7pm · Saturday 10am–5pm
        </p>
      </div>
    </section>
  );
}
