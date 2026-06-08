'use client';

import { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { BeforeAfterSlider } from '@/components/ui/BeforeAfterSlider';
import { animateKineticText } from '@/lib/gsap';

gsap.registerPlugin(ScrollTrigger);

const CASES = [
  {
    id:        'facial-contouring',
    treatment: 'Advanced Facial Contouring',
    timeframe: '6 weeks post-treatment',
    before:    '/images/results/before-1.png',
    after:     '/images/results/after-1.png',
    beforeAlt: 'Client before facial contouring treatment',
    afterAlt:  'Client after facial contouring treatment showing enhanced definition',
  },
  {
    id:        'prp',
    treatment: 'PRP Rejuvenation Therapy',
    timeframe: '8 weeks post-treatment',
    before:    '/images/results/before-2.png',
    after:     '/images/results/after-2.png',
    beforeAlt: 'Client before PRP treatment',
    afterAlt:  'Client after PRP treatment showing improved skin quality',
  },
  {
    id:        'skin-booster',
    treatment: 'Profhilo Skin Remodelling',
    timeframe: '4 weeks post-treatment',
    before:    '/images/results/before-3.png',
    after:     '/images/results/after-3.png',
    beforeAlt: 'Client before Profhilo treatment',
    afterAlt:  'Client after Profhilo treatment showing improved hydration',
  },
];

export function ResultsSection() {
  const sectionRef   = useRef<HTMLElement>(null);
  const headlineRef  = useRef<HTMLHeadingElement>(null);
  const slidersRef   = useRef<HTMLDivElement>(null);
  const disclaimerRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Headline kinetic reveal
      if (headlineRef.current) {
        animateKineticText(headlineRef.current, {
          type: 'words',
          duration: 1.0,
          stagger: 0.05,
          y: 60,
          start: 'top 85%',
        });
      }

      // Slider cards stagger
      const sliders = slidersRef.current?.querySelectorAll('[data-result-card]');
      if (sliders?.length) {
        gsap.fromTo(sliders,
          { opacity: 0, y: 50 },
          {
            opacity: 1, y: 0,
            duration: 0.9,
            stagger: 0.15,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: slidersRef.current,
              start: 'top 80%',
              once: true,
            },
          }
        );
      }

      // Disclaimer
      gsap.fromTo(disclaimerRef.current,
        { opacity: 0 },
        {
          opacity: 1,
          duration: 1,
          scrollTrigger: { trigger: disclaimerRef.current, start: 'top 90%', once: true },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="results"
      className="section-padding bg-obsidian-950"
      aria-label="Clinical results"
    >
      <div className="container-luxury">

        {/* Header */}
        <div className="mb-16">
          <p className="label-overline mb-4">Clinical Results</p>
          <h2
            ref={headlineRef}
            className="font-display text-fluid-4xl text-pearl font-normal leading-tight max-w-2xl"
          >
            Results that speak for themselves
          </h2>
          <p className="font-body text-pearl/45 mt-5 max-w-md text-fluid-base leading-relaxed">
            Every photograph is unretouched and taken under identical clinical lighting conditions.
          </p>
        </div>

        {/* Before/After grid */}
        <div
          ref={slidersRef}
          className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-8"
        >
          {CASES.map((c) => (
            <div
              key={c.id}
              data-result-card
              className="flex flex-col gap-4"
              style={{ opacity: 0 }}
            >
              {/* Slider */}
              <div
                className="aspect-portrait overflow-hidden"
                style={{ clipPath: 'polygon(0 0, calc(100% - 14px) 0, 100% 14px, 100% 100%, 14px 100%, 0 calc(100% - 14px))' }}
              >
                <BeforeAfterSlider
                  beforeSrc={c.before}
                  afterSrc={c.after}
                  beforeAlt={c.beforeAlt}
                  afterAlt={c.afterAlt}
                  treatment={c.timeframe}
                  initialPosition={45}
                  className="w-full h-full"
                />
              </div>

              {/* Card label */}
              <div className="flex items-start justify-between px-1">
                <div>
                  <p className="font-body text-sm text-pearl font-normal">{c.treatment}</p>
                  <p className="font-mono text-xs text-pearl/30 mt-0.5">{c.timeframe}</p>
                </div>
                <span className="text-champagne-DEFAULT/40 text-xs">✦</span>
              </div>
            </div>
          ))}
        </div>

        {/* Disclaimer */}
        <p
          ref={disclaimerRef}
          className="mt-10 font-mono text-[10px] text-pearl/20 tracking-wide leading-relaxed max-w-xl opacity-0"
        >
          Results may vary. All photographs are displayed with the express written consent of the patient.
          Treatment outcomes depend on individual patient factors. A thorough consultation is conducted
          prior to all treatments.
        </p>

        {/* Divider */}
        <div className="line-champagne mt-14 opacity-20" />
      </div>
    </section>
  );
}
