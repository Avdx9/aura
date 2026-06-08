'use client';

import { useRef, useEffect } from 'react';
import { gsap } from 'gsap';

const MARQUEE_ITEMS = [
  { text: 'CQC Registered Clinic', icon: '✦' },
  { text: 'GMC Registered Practitioners', icon: '✦' },
  { text: 'Award-Winning Results', icon: '✦' },
  { text: 'Mayfair, London', icon: '✦' },
  { text: 'By Appointment Only', icon: '✦' },
  { text: 'Discretion Guaranteed', icon: '✦' },
  { text: 'Harley Street Standard', icon: '✦' },
];

// Duplicate for seamless loop
const ITEMS = [...MARQUEE_ITEMS, ...MARQUEE_ITEMS, ...MARQUEE_ITEMS];

export function MarqueeSection() {
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const totalWidth = track.scrollWidth / 3; // One third (duplicated 3x)

    const anim = gsap.to(track, {
      x: `-=${totalWidth}`,
      duration: 28,
      ease: 'none',
      repeat: -1,
      modifiers: {
        x: gsap.utils.unitize((x: number) => {
          return x % totalWidth;
        }),
      },
    });

    // Pause on hover
    track.addEventListener('mouseenter', () => anim.pause());
    track.addEventListener('mouseleave', () => anim.play());

    return () => {
      anim.kill();
    };
  }, []);

  return (
    <div
      id="marquee"
      className="relative overflow-hidden py-5 border-y border-pearl/8 bg-obsidian-950"
      aria-label="Trust signals"
    >
      {/* Fade edges */}
      <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-obsidian-950 to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-obsidian-950 to-transparent z-10 pointer-events-none" />

      <div ref={trackRef} className="flex items-center gap-0 whitespace-nowrap will-change-transform">
        {ITEMS.map((item, i) => (
          <div
            key={i}
            className="flex items-center gap-6 px-6"
          >
            <span className="text-champagne-DEFAULT/50 text-xs">{item.icon}</span>
            <span className="font-mono text-[11px] text-pearl/35 tracking-[0.25em] uppercase">
              {item.text}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
