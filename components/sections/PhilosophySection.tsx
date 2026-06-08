'use client';

import { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { animateKineticText, createParallax } from '@/lib/gsap';

gsap.registerPlugin(ScrollTrigger);

const PILLARS = [
  {
    number: '01',
    title: 'Clinical Rigour',
    body: 'Every treatment programme is grounded in peer-reviewed science. We do not offer procedures that are not supported by robust clinical evidence.',
  },
  {
    number: '02',
    title: 'Discretion as Standard',
    body: 'Our Mayfair address is unmarked. All client records are held under medical confidentiality. We serve royalty, executives, and public figures with absolute privacy.',
  },
  {
    number: '03',
    title: 'Individual Artistry',
    body: 'No two faces are the same. Our practitioners spend a minimum of 45 minutes understanding your anatomy, concerns, and desired outcomes before any treatment is planned.',
  },
];

export function PhilosophySection() {
  const sectionRef   = useRef<HTMLElement>(null);
  const bgRef        = useRef<HTMLDivElement>(null);
  const headlineRef  = useRef<HTMLHeadingElement>(null);
  const pillarsRef   = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Parallax on background image
      if (bgRef.current) {
        createParallax(bgRef.current, 0.35);
      }

      // Kinetic headline
      if (headlineRef.current) {
        animateKineticText(headlineRef.current, {
          type: 'words',
          duration: 1.1,
          stagger: 0.06,
          y: 70,
          start: 'top 80%',
        });
      }

      // Pillars stagger
      const pillars = pillarsRef.current?.querySelectorAll('[data-pillar]');
      if (pillars?.length) {
        gsap.fromTo(pillars,
          { opacity: 0, x: -30 },
          {
            opacity: 1, x: 0,
            duration: 0.9,
            stagger: 0.2,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: pillarsRef.current,
              start: 'top 80%',
              once: true,
            },
          }
        );
      }
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="philosophy"
      className="section-padding relative overflow-hidden"
    >
      {/* Parallax background */}
      <div ref={bgRef} className="absolute inset-0 -top-20 -bottom-20 will-change-transform">
        <div className="absolute inset-0 bg-gradient-to-br from-obsidian-900 to-obsidian-950" />
        {/* Decorative radial */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] aspect-square
                        bg-gradient-radial-gold opacity-40" />
      </div>

      <div className="container-luxury relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">

          {/* Left: Headline */}
          <div>
            <p className="label-overline mb-6">Our Philosophy</p>
            <h2
              ref={headlineRef}
              className="font-display text-fluid-5xl text-pearl font-normal leading-[0.9] tracking-tight"
            >
              Longevity is not a destination.{' '}
              <em className="italic text-gradient-gold">It is a practice.</em>
            </h2>

            <div className="mt-10 border-l-2 border-champagne-DEFAULT/30 pl-6">
              <p className="font-body text-pearl/55 text-fluid-lg leading-relaxed italic">
                &ldquo;The finest aesthetic results are invisible to the untrained eye.
                They are felt by the patient in the way they carry themselves.&rdquo;
              </p>
              <p className="font-mono text-xs text-champagne-DEFAULT/60 mt-3 tracking-widest uppercase">
                — Dr Sarah Chen, Medical Director
              </p>
            </div>
          </div>

          {/* Right: Pillars */}
          <div ref={pillarsRef} className="flex flex-col gap-8">
            {PILLARS.map((pillar) => (
              <div
                key={pillar.number}
                data-pillar
                className="flex gap-6"
                style={{ opacity: 0 }}
              >
                {/* Number */}
                <span className="font-mono text-[11px] text-champagne-DEFAULT/40 tracking-widest shrink-0 mt-1">
                  {pillar.number}
                </span>

                {/* Content */}
                <div>
                  <h3 className="font-display text-xl text-pearl font-normal mb-2">
                    {pillar.title}
                  </h3>
                  <p className="font-body text-pearl/45 text-sm leading-relaxed">
                    {pillar.body}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
