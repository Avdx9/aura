'use client';

import { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Image from 'next/image';
import { useBooking } from '@/context/BookingContext';

gsap.registerPlugin(ScrollTrigger);

const PRACTITIONERS = [
  {
    id:           'dr-chen',
    name:         'Dr Sarah Chen',
    title:        'Medical Director',
    credentials:  'MBBS, GMC #7654321',
    specialties:  ['Facial Contouring', 'Regenerative Medicine', 'Anti-Ageing'],
    biography:    'Formerly of the Royal Free Hospital, Dr Chen has pioneered minimally-invasive facial rejuvenation techniques now adopted across Harley Street. She lectures internationally on aesthetic medicine.',
    image:        '/images/practitioners/sarah-chen.png',
    imageAlt:     'Dr Sarah Chen, Medical Director at Aura Longevity',
  },
  {
    id:           'dr-hassan',
    name:         'Dr Omar Hassan',
    title:        'Senior Aesthetic Physician',
    credentials:  'MBBS, MRCS, GMC #8765432',
    specialties:  ['Body Contouring', 'Dermal Fillers', 'Thread Lifting'],
    biography:    'Trained in both plastic surgery and aesthetic medicine, Dr Hassan brings surgical precision to non-invasive treatments. Widely published in peer-reviewed journals.',
    image:        '/images/practitioners/omar-hassan.png',
    imageAlt:     'Dr Omar Hassan, Senior Aesthetic Physician at Aura Longevity',
  },
  {
    id:           'dr-novak',
    name:         'Dr Elena Novak',
    title:        'Longevity Physician',
    credentials:  'MD, PhD (Molecular Biology), GMC #9876543',
    specialties:  ['IV Therapy', 'NAD+', 'Hormonal Optimisation'],
    biography:    'Dr Novak holds a doctorate in molecular biology from UCL, where her research into cellular senescence underpins our longevity protocols. She brings a deeply scientific approach to wellness.',
    image:        '/images/practitioners/elena-novak.png',
    imageAlt:     'Dr Elena Novak, Longevity Physician at Aura Longevity',
  },
];

export function PractitionersSection() {
  const sectionRef  = useRef<HTMLElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const cardsRef    = useRef<HTMLDivElement>(null);
  const { open: openBooking } = useBooking();

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(headlineRef.current,
        { opacity: 0, y: 50 },
        {
          opacity: 1, y: 0, duration: 1.1, ease: 'power3.out',
          scrollTrigger: { trigger: headlineRef.current, start: 'top 85%', once: true },
        }
      );

      const cards = cardsRef.current?.querySelectorAll('[data-practitioner-card]');
      if (cards?.length) {
        gsap.fromTo(cards,
          { opacity: 0, y: 60 },
          {
            opacity: 1, y: 0,
            duration: 0.9, stagger: 0.18, ease: 'power2.out',
            scrollTrigger: { trigger: cardsRef.current, start: 'top 80%', once: true },
          }
        );
      }
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="practitioners"
      className="section-padding bg-obsidian-900/20"
    >
      <div className="container-luxury">
        <div className="mb-14">
          <p className="label-overline mb-4">Our Team</p>
          <h2
            ref={headlineRef}
            className="font-display text-fluid-4xl text-pearl font-normal leading-tight max-w-2xl opacity-0"
          >
            Expertise you can trust.<br />
            <em className="italic text-gradient-gold">Credentials you can verify.</em>
          </h2>
        </div>

        <div ref={cardsRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {PRACTITIONERS.map((p) => (
            <article
              key={p.id}
              data-practitioner-card
              className="group flex flex-col card-luxury overflow-hidden"
              style={{
                opacity: 0,
                clipPath: 'polygon(0 0, calc(100% - 16px) 0, 100% 16px, 100% 100%, 16px 100%, 0 calc(100% - 16px))',
              }}
            >
              {/* Portrait */}
              <div className="relative aspect-[4/3] bg-obsidian-800 overflow-hidden">
                <Image
                  src={p.image}
                  alt={p.imageAlt}
                  fill
                  className="object-cover object-top transition-transform duration-700 group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />

                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-obsidian-950/80 via-transparent to-transparent" />

                {/* Credentials badge */}
                <div className="absolute bottom-4 left-4">
                  <span className="label-overline bg-obsidian-950/80 backdrop-blur-sm px-2.5 py-1.5">
                    {p.credentials}
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="flex flex-col flex-1 p-6">
                <div className="mb-4">
                  <h3 className="font-display text-xl text-pearl font-normal leading-snug">
                    {p.name}
                  </h3>
                  <p className="font-mono text-xs text-champagne-DEFAULT/60 tracking-wider uppercase mt-1">
                    {p.title}
                  </p>
                </div>

                <p className="font-body text-pearl/40 text-sm leading-relaxed flex-1 mb-5">
                  {p.biography}
                </p>

                {/* Specialties */}
                <div className="flex flex-wrap gap-2 mb-6">
                  {p.specialties.map((s) => (
                    <span
                      key={s}
                      className="px-2.5 py-1 bg-champagne-DEFAULT/8 border border-champagne-DEFAULT/15
                                 text-champagne-DEFAULT/60 font-mono text-[10px] tracking-wider uppercase"
                    >
                      {s}
                    </span>
                  ))}
                </div>

                {/* Book with */}
                <button
                  onClick={() => openBooking()}
                  className="flex items-center gap-2 font-mono text-xs text-pearl/30
                             hover:text-champagne-DEFAULT tracking-widest uppercase transition-colors duration-300 group/btn"
                >
                  <span>Book with {p.name.split(' ')[1]}</span>
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden
                       className="transition-transform duration-300 group-hover/btn:translate-x-1">
                    <path d="M2 6H10M7 3L10 6L7 9" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              </div>
            </article>
          ))}
        </div>

        {/* GMC verification note */}
        <div className="mt-10 flex items-center gap-3">
          <div className="w-5 h-5 border border-champagne-DEFAULT/30 flex items-center justify-center shrink-0">
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden>
              <path d="M1.5 5L4 7.5L8.5 2.5" stroke="#c9a96e" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <p className="font-mono text-[11px] text-pearl/25 tracking-wide">
            All practitioners are registered with the General Medical Council (GMC) and hold full medical indemnity insurance.
            You can verify registrations at <span className="text-pearl/40">gmc-uk.org</span>
          </p>
        </div>
      </div>
    </section>
  );
}
