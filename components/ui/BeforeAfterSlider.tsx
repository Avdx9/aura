'use client';

/**
 * BeforeAfterSlider
 * ─────────────────────────────────────────────────────────────────────────────
 * A custom drag-to-reveal before/after comparison component.
 *
 * Implementation:
 *   - Two absolutely-positioned images (before/after) layered exactly
 *   - "After" image uses clip-path: inset(0 X% 0 0) where X is derived
 *     from the drag/mouse position, updating in state
 *   - Custom drag handle: vertical hairline + chevrons
 *   - Zero latency: state updates directly on mousemove/touchmove
 *   - Touch-friendly: full touch event support for mobile
 *   - ARIA labelled for accessibility
 */

import {
  useState,
  useRef,
  useCallback,
  useEffect,
  type MouseEvent,
  type TouchEvent,
} from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

// ─── Types ─────────────────────────────────────────────────────────────────────
interface BeforeAfterSliderProps {
  beforeSrc:  string;
  afterSrc:   string;
  beforeAlt:  string;
  afterAlt:   string;
  label?:     string;       // e.g. "Facial Contouring Results"
  treatment?: string;       // e.g. "8 weeks post-treatment"
  className?: string;
  initialPosition?: number; // Default split position (0–100)
}

// ─── Component ────────────────────────────────────────────────────────────────
export function BeforeAfterSlider({
  beforeSrc,
  afterSrc,
  beforeAlt,
  afterAlt,
  label,
  treatment,
  className,
  initialPosition = 50,
}: BeforeAfterSliderProps) {
  const [position, setPosition]  = useState(initialPosition);
  const [isDragging, setIsDragging] = useState(false);
  const [isRevealing, setIsRevealing] = useState(false); // Intro animation state
  const containerRef = useRef<HTMLDivElement>(null);
  const positionRef  = useRef(initialPosition); // Ref for use in RAF loop

  // ── Intro animation on mount ───────────────────────────────────────────────
  useEffect(() => {
    // Animate the initial reveal: 0% → initialPosition% over 1.2s
    let start: number | null = null;
    const duration = 1200;
    const from = 0;
    const to   = initialPosition;

    const animate = (timestamp: number) => {
      if (!start) start = timestamp;
      const elapsed = timestamp - start;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = from + (to - from) * eased;
      setPosition(current);
      positionRef.current = current;
      if (progress < 1) requestAnimationFrame(animate);
      else setIsRevealing(true);
    };

    // Small delay to let the component render first
    const timer = setTimeout(() => requestAnimationFrame(animate), 600);
    return () => clearTimeout(timer);
  }, [initialPosition]);

  // ── Position calculation from event ───────────────────────────────────────
  const calculatePosition = useCallback((clientX: number): number => {
    const container = containerRef.current;
    if (!container) return 50;

    const rect = container.getBoundingClientRect();
    const x    = clientX - rect.left;
    const pct  = (x / rect.width) * 100;
    return Math.max(2, Math.min(98, pct)); // Clamp with 2% margin
  }, []);

  // ── Mouse handlers ─────────────────────────────────────────────────────────
  const handleMouseMove = useCallback((e: MouseEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    const newPos = calculatePosition(e.clientX);
    setPosition(newPos);
    positionRef.current = newPos;
  }, [isDragging, calculatePosition]);

  const handleMouseDown = useCallback((e: MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
    const newPos = calculatePosition(e.clientX);
    setPosition(newPos);
    positionRef.current = newPos;
  }, [calculatePosition]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Global mouseup to catch release outside container
  useEffect(() => {
    window.addEventListener('mouseup', handleMouseUp);
    return () => window.removeEventListener('mouseup', handleMouseUp);
  }, [handleMouseUp]);

  // ── Touch handlers ─────────────────────────────────────────────────────────
  const handleTouchMove = useCallback((e: TouchEvent<HTMLDivElement>) => {
    e.preventDefault(); // Prevent page scroll during drag
    const touch  = e.touches[0];
    const newPos = calculatePosition(touch.clientX);
    setPosition(newPos);
    positionRef.current = newPos;
  }, [calculatePosition]);

  const handleTouchStart = useCallback((e: TouchEvent<HTMLDivElement>) => {
    setIsDragging(true);
    const touch  = e.touches[0];
    const newPos = calculatePosition(touch.clientX);
    setPosition(newPos);
    positionRef.current = newPos;
  }, [calculatePosition]);

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  // ── Keyboard accessibility ─────────────────────────────────────────────────
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    const step = e.shiftKey ? 10 : 2;
    if (e.key === 'ArrowLeft') {
      setPosition((p) => Math.max(2, p - step));
    } else if (e.key === 'ArrowRight') {
      setPosition((p) => Math.min(98, p + step));
    }
  }, []);

  return (
    <div
      ref={containerRef}
      className={cn(
        'relative overflow-hidden select-none',
        'group',
        isDragging ? 'cursor-ew-resize' : 'cursor-default',
        className
      )}
      onMouseMove={handleMouseMove}
      onMouseDown={handleMouseDown}
      onTouchMove={handleTouchMove}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onKeyDown={handleKeyDown}
      role="slider"
      aria-label={`Before and after comparison${label ? `: ${label}` : ''}`}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(position)}
      aria-valuetext={`${Math.round(position)}% after`}
      tabIndex={0}
    >
      {/* ── Before image (base layer) ──────────────────────────────────────── */}
      <div className="relative w-full h-full">
        <Image
          src={beforeSrc}
          alt={beforeAlt}
          fill
          className="object-cover object-center pointer-events-none"
          sizes="(max-width: 768px) 100vw, 50vw"
          priority
          draggable={false}
        />
      </div>

      {/* ── After image (clipped overlay layer) ───────────────────────────── */}
      <div
        className="absolute inset-0 will-change-[clip-path]"
        style={{
          clipPath: `inset(0 ${100 - position}% 0 0)`,
          // Use CSS transition only when NOT dragging to prevent lag
          transition: isDragging ? 'none' : 'clip-path 0.05s linear',
        }}
      >
        <Image
          src={afterSrc}
          alt={afterAlt}
          fill
          className="object-cover object-center pointer-events-none"
          sizes="(max-width: 768px) 100vw, 50vw"
          draggable={false}
        />
      </div>

      {/* ── Drag handle ───────────────────────────────────────────────────── */}
      <div
        className={cn(
          'absolute top-0 bottom-0 flex items-center justify-center',
          'transition-transform duration-75',
          'z-10'
        )}
        style={{ left: `${position}%`, transform: 'translateX(-50%)' }}
        aria-hidden="true"
      >
        {/* Hairline */}
        <div className="absolute inset-y-0 w-px bg-pearl/70 shadow-[0_0_8px_rgba(255,255,255,0.3)]" />

        {/* Handle pill */}
        <div
          className={cn(
            'relative flex items-center gap-2 px-3 py-2',
            'bg-pearl/95 backdrop-blur-sm shadow-luxury-sm',
            'transition-all duration-300',
            isDragging && 'scale-110',
            'group-hover:scale-105'
          )}
          style={{
            clipPath: 'polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px))',
          }}
        >
          {/* Left chevron */}
          <svg width="10" height="14" viewBox="0 0 10 14" fill="none" aria-hidden>
            <path d="M7 1L1 7L7 13" stroke="#0e0b07" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>

          {/* Center divider */}
          <div className="w-px h-4 bg-obsidian-200/30" />

          {/* Right chevron */}
          <svg width="10" height="14" viewBox="0 0 10 14" fill="none" aria-hidden>
            <path d="M3 1L9 7L3 13" stroke="#0e0b07" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </div>

      {/* ── Labels ────────────────────────────────────────────────────────── */}
      {/* Before label */}
      <div className="absolute top-4 left-4 pointer-events-none">
        <span
          className={cn(
            'label-overline bg-obsidian-950/80 backdrop-blur-sm px-2.5 py-1.5',
            'transition-opacity duration-300',
            position < 20 ? 'opacity-0' : 'opacity-100'
          )}
        >
          Before
        </span>
      </div>

      {/* After label */}
      <div className="absolute top-4 right-4 pointer-events-none">
        <span
          className={cn(
            'label-overline bg-obsidian-950/80 backdrop-blur-sm px-2.5 py-1.5',
            'transition-opacity duration-300',
            position > 80 ? 'opacity-0' : 'opacity-100'
          )}
        >
          After
        </span>
      </div>

      {/* Treatment label */}
      {treatment && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 pointer-events-none">
          <span className="label-overline bg-obsidian-950/80 backdrop-blur-sm px-3 py-1.5 whitespace-nowrap">
            {treatment}
          </span>
        </div>
      )}

      {/* Drag hint — fades out after first interaction */}
      {!isRevealing && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="bg-obsidian-950/60 backdrop-blur-sm px-4 py-2 border border-pearl/10">
            <p className="label-overline opacity-70">Drag to reveal</p>
          </div>
        </div>
      )}
    </div>
  );
}
