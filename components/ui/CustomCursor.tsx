'use client';

/**
 * CustomCursor
 * ─────────────────────────────────────────────────────────────────────────────
 * A split dual-element cursor replacing the browser default on desktop.
 * - Dot: snaps instantly to cursor position (no lag)
 * - Ring: follows with smooth lerp for fluid trailing motion
 * - Hover state: ring expands when over interactive elements
 * - Blend mode: mix-blend-mode: difference creates automatic light/dark inversion
 *
 * Rendered outside the React component tree in the root layout.
 * Auto-hidden on touch devices via CSS media query.
 */

import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

interface CursorPos {
  x: number;
  y: number;
}

const LERP_FACTOR = 0.12; // Ring lag (lower = more lag)
const HOVER_SELECTORS = 'a, button, [role="button"], [data-cursor-hover], input, textarea, select, label';

export function CustomCursor() {
  const dotRef    = useRef<HTMLDivElement>(null);
  const ringRef   = useRef<HTMLDivElement>(null);
  const rafRef    = useRef<number>(0);
  const mousePos  = useRef<CursorPos>({ x: -100, y: -100 });
  const ringPos   = useRef<CursorPos>({ x: -100, y: -100 });

  const [isHovering, setIsHovering] = useState(false);
  const [isClicking, setIsClicking] = useState(false);
  const [isVisible,  setIsVisible]  = useState(false);
  const [cursorText, setCursorText] = useState('');

  useEffect(() => {
    // Only on pointer devices
    if (window.matchMedia('(hover: none)').matches) return;

    const dot  = dotRef.current;
    const ring = ringRef.current;
    if (!dot || !ring) return;

    // ── Mouse tracking ─────────────────────────────────────────────────────
    const handleMove = (e: MouseEvent) => {
      mousePos.current = { x: e.clientX, y: e.clientY };
      if (!isVisible) setIsVisible(true);
    };

    // ── Hover detection ────────────────────────────────────────────────────
    const handleMouseOver = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest(HOVER_SELECTORS);
      if (target) {
        setIsHovering(true);
        // Check for custom cursor text
        const text = (target as HTMLElement).getAttribute('data-cursor-text');
        setCursorText(text ?? '');
      }
    };

    const handleMouseOut = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest(HOVER_SELECTORS);
      if (target) {
        setIsHovering(false);
        setCursorText('');
      }
    };

    const handleMouseDown = () => setIsClicking(true);
    const handleMouseUp   = () => setIsClicking(false);

    const handleMouseLeave = () => setIsVisible(false);
    const handleMouseEnter = () => setIsVisible(true);

    // ── RAF loop for smooth ring animation ─────────────────────────────────
    const animate = () => {
      rafRef.current = requestAnimationFrame(animate);

      const { x: mx, y: my } = mousePos.current;
      const { x: rx, y: ry } = ringPos.current;

      // Lerp ring toward mouse
      const newRx = rx + (mx - rx) * LERP_FACTOR;
      const newRy = ry + (my - ry) * LERP_FACTOR;
      ringPos.current = { x: newRx, y: newRy };

      // Apply transforms
      dot.style.transform  = `translate(${mx}px, ${my}px) translate(-50%, -50%)`;
      ring.style.transform = `translate(${newRx}px, ${newRy}px) translate(-50%, -50%)`;
    };

    rafRef.current = requestAnimationFrame(animate);

    // ── Attach listeners ───────────────────────────────────────────────────
    window.addEventListener('mousemove',     handleMove,      { passive: true });
    window.addEventListener('mouseover',     handleMouseOver, { passive: true });
    window.addEventListener('mouseout',      handleMouseOut,  { passive: true });
    window.addEventListener('mousedown',     handleMouseDown, { passive: true });
    window.addEventListener('mouseup',       handleMouseUp,   { passive: true });
    document.addEventListener('mouseleave',  handleMouseLeave);
    document.addEventListener('mouseenter',  handleMouseEnter);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('mousemove',    handleMove);
      window.removeEventListener('mouseover',    handleMouseOver);
      window.removeEventListener('mouseout',     handleMouseOut);
      window.removeEventListener('mousedown',    handleMouseDown);
      window.removeEventListener('mouseup',      handleMouseUp);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseenter', handleMouseEnter);
    };
  }, [isVisible]);

  return (
    <div
      className="custom-cursor"
      aria-hidden="true"
      style={{ opacity: isVisible ? 1 : 0, transition: 'opacity 0.3s' }}
    >
      {/* Dot — instant snap */}
      <div
        ref={dotRef}
        className={cn(
          'cursor-dot fixed top-0 left-0 pointer-events-none',
          'transition-transform duration-100',
          isClicking && 'scale-50'
        )}
      />

      {/* Ring — lerped */}
      <div
        ref={ringRef}
        className={cn(
          'cursor-ring fixed top-0 left-0 pointer-events-none',
          'flex items-center justify-center',
          isHovering && 'is-hovering',
          isClicking && 'is-clicking'
        )}
      >
        {/* Optional cursor text (e.g. "Drag", "View") */}
        {cursorText && (
          <span className="font-mono text-[9px] tracking-widest uppercase text-pearl/80 select-none">
            {cursorText}
          </span>
        )}
      </div>
    </div>
  );
}
