'use client';

import { useState, useEffect, useRef, RefObject } from 'react';

/**
 * useScrollProgress
 * Returns a normalised scroll progress value [0.0 → 1.0] for a given element.
 * Syncs with Lenis via the native scroll event (Lenis fires this on its raf tick).
 */
export function useScrollProgress(
  ref: RefObject<HTMLElement>,
  options: { offset?: number } = {}
): number {
  const [progress, setProgress] = useState(0);
  const { offset = 0 } = options;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const calculate = () => {
      const rect    = el.getBoundingClientRect();
      const winH    = window.innerHeight;
      const elH     = rect.height;
      const start   = winH - offset;
      const end     = -elH + offset;
      const current = rect.top;
      const p       = 1 - (current - end) / (start - end);
      setProgress(Math.max(0, Math.min(1, p)));
    };

    window.addEventListener('scroll', calculate, { passive: true });
    calculate(); // Initial calc

    return () => window.removeEventListener('scroll', calculate);
  }, [ref, offset]);

  return progress;
}

/**
 * useInView
 * Returns true when the element is within the viewport.
 */
export function useInView(
  ref: RefObject<HTMLElement>,
  options: IntersectionObserverInit = {}
): boolean {
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect(); // Once only
        }
      },
      { threshold: 0.1, ...options }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [ref, options]);

  return inView;
}

/**
 * useMousePosition
 * Returns the mouse position normalised to [0, 1] relative to the viewport.
 */
export function useMousePosition(): { x: number; y: number } {
  const pos = useRef({ x: 0.5, y: 0.5 });
  const [, forceRender] = useState(0);

  useEffect(() => {
    const handle = (e: MouseEvent) => {
      pos.current = {
        x: e.clientX / window.innerWidth,
        y: e.clientY / window.innerHeight,
      };
      forceRender((n) => n + 1);
    };
    window.addEventListener('mousemove', handle, { passive: true });
    return () => window.removeEventListener('mousemove', handle);
  }, []);

  return pos.current;
}
