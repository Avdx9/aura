'use client';

import { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { animateCounter } from '@/lib/gsap';

gsap.registerPlugin(ScrollTrigger);

const STATS = [
  { value: 2400,  prefix: '',   suffix: '+', decimals: 0, label: 'Treatments Delivered',   description: 'Across all specialties since 2019' },
  { value: 98,    prefix: '',   suffix: '%', decimals: 0, label: 'Client Satisfaction',     description: 'Based on post-treatment survey data' },
  { value: 12,    prefix: '',   suffix: '+', decimals: 0, label: 'Years of Excellence',     description: 'Combined practitioner experience' },
  { value: 4.9,   prefix: '',   suffix: '',  decimals: 1, label: 'Google Review Score',     description: 'From 340 verified reviews' },
];

export function StatisticsSection() {
  const sectionRef  = useRef<HTMLElement>(null);
  const counterRefs = useRef<(HTMLSpanElement | null)[]>([]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Section fade in
      gsap.fromTo(sectionRef.current,
        { opacity: 0 },
        {
          opacity: 1, duration: 0.8,
          scrollTrigger: { trigger: sectionRef.current, start: 'top 90%', once: true },
        }
      );

      // Counters
      counterRefs.current.forEach((el, i) => {
        if (!el) return;
        const stat = STATS[i];
        animateCounter(el, stat.value, {
          duration: 1.3,
          prefix:   stat.prefix,
          suffix:   stat.suffix,
          decimals: stat.decimals,
        });
      });

      // Stat cards stagger
      const cards = sectionRef.current?.querySelectorAll('[data-stat-card]');
      if (cards?.length) {
        gsap.fromTo(cards,
          { opacity: 0, y: 40 },
          {
            opacity: 1, y: 0,
            duration: 0.8, stagger: 0.12, ease: 'power2.out',
            scrollTrigger: { trigger: sectionRef.current, start: 'top 80%', once: true },
          }
        );
      }
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="science"
      className="py-20 bg-obsidian-950 opacity-0"
    >
      <div className="container-luxury">
        {/* Divider */}
        <div className="line-champagne mb-14 opacity-20" />

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-0 lg:divide-x lg:divide-pearl/8">
          {STATS.map((stat, i) => (
            <div
              key={stat.label}
              data-stat-card
              className="flex flex-col gap-2 lg:px-10 first:lg:pl-0 last:lg:pr-0"
              style={{ opacity: 0 }}
            >
              {/* Value */}
              <div className="flex items-baseline gap-0.5">
                {stat.prefix && (
                  <span className="font-mono text-xl text-champagne-DEFAULT/60">{stat.prefix}</span>
                )}
                <span
                  ref={(el) => { counterRefs.current[i] = el; }}
                  className="font-display text-5xl lg:text-6xl text-pearl font-normal tracking-tight"
                >
                  0
                </span>
                {stat.suffix && (
                  <span className="font-display text-3xl text-champagne-DEFAULT">{stat.suffix}</span>
                )}
              </div>

              {/* Label */}
              <p className="font-mono text-xs text-pearl/60 tracking-widest uppercase">
                {stat.label}
              </p>

              {/* Description */}
              <p className="font-body text-xs text-pearl/25 leading-relaxed">
                {stat.description}
              </p>
            </div>
          ))}
        </div>

        {/* Divider */}
        <div className="line-champagne mt-14 opacity-20" />
      </div>
    </section>
  );
}
