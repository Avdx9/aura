'use client';

import { useRef, useEffect, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const TESTIMONIALS = [
  {
    id:     '1',
    quote:  'I have visited aesthetic clinics across London, Paris, and New York. Aura Longevity is, unequivocally, the finest. The results from my facial contouring programme were so natural that my friends simply assumed I had been on holiday.',
    client: 'Lady C.W.',
    detail: 'Facial Contouring Programme',
    stars:  5,
  },
  {
    id:     '2',
    quote:  'Dr Novak\'s NAD+ protocol was transformative. After three sessions I had more energy than I had experienced in fifteen years. The clinic\'s discretion and the quality of care are unmatched.',
    client: 'Mr T.A.',
    detail: 'NAD+ Longevity Programme',
    stars:  5,
  },
  {
    id:     '3',
    quote:  'The Profhilo treatment under Dr Chen\'s guidance was remarkable. My skin looks as it did in my early thirties. No surgery, no obvious signs — just a quiet confidence in how I look.',
    client: 'Mrs S.K.',
    detail: 'Profhilo Skin Remodelling',
    stars:  5,
  },
  {
    id:     '4',
    quote:  'Every aspect of the experience reflects the highest standard — the consultation, the treatment room, the aftercare protocol. They treat you as a medical patient, not a paying customer.',
    client: 'Dr P.M.',
    detail: 'Full Facial Rejuvenation',
    stars:  5,
  },
];

function StarRating({ count }: { count: number }) {
  return (
    <div className="flex gap-1" aria-label={`${count} out of 5 stars`}>
      {Array.from({ length: count }).map((_, i) => (
        <svg key={i} width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden>
          <path d="M5 1L6.18 3.64L9 4.09L7 6.14L7.45 9L5 7.64L2.55 9L3 6.14L1 4.09L3.82 3.64L5 1Z"
                fill="#c9a96e" />
        </svg>
      ))}
    </div>
  );
}

export function TestimonialsSection() {
  const sectionRef   = useRef<HTMLElement>(null);
  const trackRef     = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(sectionRef.current,
        { opacity: 0, y: 40 },
        {
          opacity: 1, y: 0, duration: 1, ease: 'power2.out',
          scrollTrigger: { trigger: sectionRef.current, start: 'top 80%', once: true },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  // Animate to active testimonial
  useEffect(() => {
    if (!trackRef.current) return;
    gsap.to(trackRef.current, {
      x: `-${active * 100}%`,
      duration: 0.7,
      ease: 'power3.inOut',
    });
  }, [active]);

  const prev = () => setActive((a) => (a > 0 ? a - 1 : TESTIMONIALS.length - 1));
  const next = () => setActive((a) => (a < TESTIMONIALS.length - 1 ? a + 1 : 0));

  return (
    <section
      ref={sectionRef}
      className="section-padding bg-obsidian-900/30 opacity-0"
      aria-label="Client testimonials"
    >
      <div className="container-luxury">
        <p className="label-overline mb-14">Client Testimonials</p>

        {/* Carousel */}
        <div className="relative overflow-hidden">
          <div
            ref={trackRef}
            className="flex will-change-transform"
            style={{ width: `${TESTIMONIALS.length * 100}%` }}
          >
            {TESTIMONIALS.map((t) => (
              <div
                key={t.id}
                className="flex-shrink-0 w-full"
                style={{ width: `${100 / TESTIMONIALS.length}%` }}
                aria-hidden={TESTIMONIALS.indexOf(t) !== active}
              >
                <blockquote className="max-w-3xl mx-auto text-center px-4 lg:px-0">
                  {/* Stars */}
                  <div className="flex justify-center mb-8">
                    <StarRating count={t.stars} />
                  </div>

                  {/* Quote */}
                  <p className="font-display text-fluid-2xl text-pearl/85 font-normal italic leading-relaxed mb-10">
                    &ldquo;{t.quote}&rdquo;
                  </p>

                  {/* Attribution */}
                  <footer>
                    <p className="font-mono text-xs text-champagne-DEFAULT tracking-widest uppercase">
                      {t.client}
                    </p>
                    <p className="font-body text-xs text-pearl/30 mt-1">
                      {t.detail}
                    </p>
                  </footer>
                </blockquote>
              </div>
            ))}
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-6 mt-12">
          {/* Previous */}
          <button
            onClick={prev}
            className="w-10 h-10 border border-pearl/15 flex items-center justify-center
                       hover:border-champagne-DEFAULT/40 transition-colors duration-300"
            aria-label="Previous testimonial"
            style={{ clipPath: 'polygon(0 0, calc(100% - 5px) 0, 100% 5px, 100% 100%, 5px 100%, 0 calc(100% - 5px))' }}
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
              <path d="M8 1L3 6L8 11" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" className="text-pearl/40" />
            </svg>
          </button>

          {/* Dots */}
          <div className="flex gap-2" role="tablist" aria-label="Testimonial navigation">
            {TESTIMONIALS.map((_, i) => (
              <button
                key={i}
                role="tab"
                aria-selected={i === active}
                aria-label={`Go to testimonial ${i + 1}`}
                onClick={() => setActive(i)}
                className="transition-all duration-400"
              >
                <span className={`block transition-all duration-400 rounded-full ${
                  i === active
                    ? 'w-6 h-1.5 bg-champagne-DEFAULT'
                    : 'w-1.5 h-1.5 bg-pearl/20 hover:bg-pearl/40'
                }`} />
              </button>
            ))}
          </div>

          {/* Next */}
          <button
            onClick={next}
            className="w-10 h-10 border border-pearl/15 flex items-center justify-center
                       hover:border-champagne-DEFAULT/40 transition-colors duration-300"
            aria-label="Next testimonial"
            style={{ clipPath: 'polygon(0 0, calc(100% - 5px) 0, 100% 5px, 100% 100%, 5px 100%, 0 calc(100% - 5px))' }}
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
              <path d="M4 1L9 6L4 11" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" className="text-pearl/40" />
            </svg>
          </button>
        </div>

        {/* Google review attribution */}
        <div className="flex items-center justify-center gap-2 mt-8">
          <span className="font-mono text-[10px] text-pearl/20 tracking-widest uppercase">
            Verified Google Reviews · 4.9 / 5.0
          </span>
        </div>
      </div>
    </section>
  );
}
