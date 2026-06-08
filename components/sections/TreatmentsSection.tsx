'use client';

/**
 * TreatmentsSection
 * ─────────────────────────────────────────────────────────────────────────────
 * Two-panel layout:
 *   Left:  Service category tabs + treatment cards with GSAP stagger reveal
 *   Right: Three.js anatomy visualiser pinned while scrolling through services
 *
 * The anatomy model reacts to the active service category, rotating and
 * dissolving layers to show the relevant treatment zone.
 */

import { useRef, useEffect, useState, Suspense, lazy } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useBooking } from '@/context/BookingContext';
import { cn } from '@/lib/utils';

// Lazy-load the Three.js component — it's large and not needed for initial paint
const AnatomyVisualizer = lazy(() =>
  import('@/components/three/AnatomyVisualizer').then((mod) => ({
    default: mod.AnatomyVisualizer,
  }))
);

gsap.registerPlugin(ScrollTrigger);

// ─── Treatment data ────────────────────────────────────────────────────────────
const CATEGORIES = [
  {
    id: 'face',
    label: 'Face',
    headline: 'Facial Contouring & Rejuvenation',
    description: 'Our facial programmes combine the latest in regenerative medicine with precision injection techniques, tailored to your unique anatomy.',
    treatments: [
      { name: 'Advanced Facial Contouring', price: 2000, duration: '90 min', tag: 'Most Popular' },
      { name: 'Profhilo Skin Remodelling',  price: 650,  duration: '45 min', tag: null },
      { name: 'PRP Rejuvenation',           price: 850,  duration: '60 min', tag: 'Editor\'s Pick' },
      { name: 'Morpheus8 RF Microneedling', price: 1200, duration: '75 min', tag: null },
    ],
  },
  {
    id: 'wellness',
    label: 'Wellness & Longevity',
    headline: 'Longevity & Cellular Restoration',
    description: 'Science-backed longevity protocols addressing the root causes of ageing at a cellular level. Restore energy, cognitive clarity, and vitality.',
    treatments: [
      { name: 'NAD+ IV Restoration',       price: 1800, duration: '120 min', tag: 'Flagship' },
      { name: 'Bespoke IV Longevity',       price: 1200, duration: '90 min',  tag: null },
      { name: 'Ozone Therapy',              price: 750,  duration: '60 min',  tag: null },
      { name: 'Full Hormonal Optimisation', price: 2500, duration: 'Programme', tag: 'Premium' },
    ],
  },
  {
    id: 'body',
    label: 'Body',
    headline: 'Precision Body Sculpting',
    description: 'Non-surgical body contouring technologies that eliminate localised fat and tighten skin without downtime.',
    treatments: [
      { name: 'Precision Body Sculpting', price: 1400, duration: '75 min', tag: null },
      { name: 'Cellulite Reduction',      price: 900,  duration: '60 min', tag: null },
      { name: 'Skin Tightening',          price: 1100, duration: '90 min', tag: null },
      { name: 'Stretch Mark Therapy',     price: 800,  duration: '60 min', tag: null },
    ],
  },
];

// ─── Treatment Card ────────────────────────────────────────────────────────────
function TreatmentCard({
  treatment,
  index,
  onBook,
}: {
  treatment: (typeof CATEGORIES)[0]['treatments'][0];
  index: number;
  onBook: () => void;
}) {
  return (
    <div
      className={cn(
        'group relative flex items-center justify-between p-5 lg:p-6',
        'card-luxury transition-all duration-500 cursor-pointer',
        'border border-pearl/8 hover:border-champagne-DEFAULT/30',
      )}
      style={{
        clipPath: 'polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))',
        animationDelay: `${index * 80}ms`,
      }}
      onClick={onBook}
      data-gsap-fade-up
    >
      {treatment.tag && (
        <span className="absolute top-3 right-4 label-overline text-champagne-DEFAULT/60">
          {treatment.tag}
        </span>
      )}

      <div className="pr-4">
        <p className="font-body text-base text-pearl font-normal group-hover:text-champagne-DEFAULT transition-colors duration-300">
          {treatment.name}
        </p>
        <p className="font-mono text-xs text-pearl/30 mt-1">{treatment.duration}</p>
      </div>

      <div className="flex items-center gap-4 shrink-0">
        <p className="font-mono text-sm text-champagne-DEFAULT">
          £{treatment.price.toLocaleString()}
        </p>
        {/* Arrow */}
        <div className="w-7 h-7 border border-pearl/10 flex items-center justify-center
                        group-hover:border-champagne-DEFAULT/40 group-hover:bg-champagne-DEFAULT/5
                        transition-all duration-300"
             style={{ clipPath: 'polygon(0 0, calc(100% - 4px) 0, 100% 4px, 100% 100%, 4px 100%, 0 calc(100% - 4px))' }}>
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden>
            <path d="M2 8L8 2M8 2H4M8 2V6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" className="text-pearl/40 group-hover:text-champagne-DEFAULT transition-colors" />
          </svg>
        </div>
      </div>
    </div>
  );
}

// ─── Main Section ──────────────────────────────────────────────────────────────
export function TreatmentsSection() {
  const sectionRef    = useRef<HTMLElement>(null);
  const headlineRef   = useRef<HTMLHeadingElement>(null);
  const cardsRef      = useRef<HTMLDivElement>(null);
  const [activeCategory, setActiveCategory] = useState(0);
  const { open: openBooking } = useBooking();

  const category = CATEGORIES[activeCategory];

  // ── GSAP reveals ───────────────────────────────────────────────────────────
  useEffect(() => {
    const ctx = gsap.context(() => {
      // Headline
      gsap.fromTo(headlineRef.current,
        { opacity: 0, y: 60 },
        {
          opacity: 1, y: 0,
          duration: 1.1, ease: 'power3.out',
          scrollTrigger: {
            trigger: headlineRef.current,
            start: 'top 85%',
            once: true,
          },
        }
      );

      // Treatment cards stagger
      const cards = cardsRef.current?.querySelectorAll('[data-gsap-fade-up]');
      if (cards?.length) {
        gsap.fromTo(cards,
          { opacity: 0, y: 40 },
          {
            opacity: 1, y: 0,
            duration: 0.7,
            stagger: 0.08,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: cardsRef.current,
              start: 'top 80%',
              once: true,
            },
          }
        );
      }
    }, sectionRef);

    return () => ctx.revert();
  }, [activeCategory]);

  return (
    <section
      ref={sectionRef}
      id="treatments"
      className="section-padding bg-obsidian-950 relative"
    >
      {/* Section label */}
      <div className="container-luxury mb-16">
        <p className="label-overline mb-4">Our Treatments</p>
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <h2
            ref={headlineRef}
            className="font-display text-fluid-4xl text-pearl font-normal leading-tight max-w-xl"
          >
            Precision medicine.<br />
            <em className="italic text-gradient-gold">Visible results.</em>
          </h2>
          <p className="font-body text-pearl/50 max-w-xs text-fluid-base leading-relaxed lg:text-right">
            Every treatment plan is crafted individually following a thorough consultation with your practitioner.
          </p>
        </div>
      </div>

      {/* Category tabs */}
      <div className="container-luxury mb-10">
        <div className="flex gap-0 border-b border-pearl/10 overflow-x-auto">
          {CATEGORIES.map((cat, i) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(i)}
              className={cn(
                'px-6 py-3.5 font-mono text-xs tracking-widest uppercase transition-all duration-400 whitespace-nowrap',
                'border-b-2 -mb-px',
                i === activeCategory
                  ? 'text-champagne-DEFAULT border-champagne-DEFAULT'
                  : 'text-pearl/30 border-transparent hover:text-pearl/60'
              )}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Two-column: Cards + Anatomy */}
      <div className="container-luxury grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-start">

        {/* ── Left: Service cards ──────────────────────────────────────────── */}
        <div>
          <div className="mb-8">
            <h3 className="font-display text-2xl text-pearl font-normal leading-snug mb-3">
              {category.headline}
            </h3>
            <p className="font-body text-pearl/50 text-sm leading-relaxed">
              {category.description}
            </p>
          </div>

          <div ref={cardsRef} className="flex flex-col gap-3">
            {category.treatments.map((treatment, i) => (
              <TreatmentCard
                key={treatment.name}
                treatment={treatment}
                index={i}
                onBook={() => openBooking({
                  id: treatment.name.toLowerCase().replace(/\s+/g, '-'),
                  name: treatment.name,
                  duration: parseInt(treatment.duration) || 60,
                  price: treatment.price,
                  category: category.label,
                })}
              />
            ))}
          </div>

          {/* View all CTA */}
          <button
            onClick={() => openBooking()}
            className="mt-8 btn-outline"
          >
            <span>Schedule a Free Consultation</span>
          </button>
        </div>

        {/* ── Right: 3D Anatomy Visualiser ─────────────────────────────────── */}
        <div className="sticky top-24 h-[500px] lg:h-[600px]">
          <div className="relative h-full border border-pearl/8 bg-obsidian-900/20"
               style={{ clipPath: 'polygon(0 0, calc(100% - 20px) 0, 100% 20px, 100% 100%, 20px 100%, 0 calc(100% - 20px))' }}>

            <Suspense
              fallback={
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="label-overline text-pearl/20 animate-pulse">
                    Loading Anatomy Model…
                  </div>
                </div>
              }
            >
              <AnatomyVisualizer
                sectionRef={sectionRef}
                className="w-full h-full"
              />
            </Suspense>

            {/* Overlay labels */}
            <div className="absolute bottom-6 left-6 right-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="label-overline mb-1">Interactive 3D Model</p>
                  <p className="font-body text-xs text-pearl/30">Scroll to explore subdermal layers</p>
                </div>
                <div className="flex gap-2">
                  {['Skin', 'Muscle', 'Bone'].map((layer, i) => (
                    <span
                      key={layer}
                      className="px-2 py-1 bg-obsidian-950/80 border border-pearl/10 font-mono text-[9px] tracking-wider text-pearl/30 uppercase"
                    >
                      {layer}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
