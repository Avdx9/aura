'use client';

/**
 * LenisContext — v1.3 compatible
 * Lenis smooth scroll provider, synced with GSAP ScrollTrigger.
 */

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback,
  type ReactNode,
} from 'react';
import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// ─── Types ────────────────────────────────────────────────────────────────────
interface ScrollToOptions {
  offset?: number;
  duration?: number;
  easing?: (t: number) => number;
  immediate?: boolean;
  lock?: boolean;
  onComplete?: () => void;
}

interface LenisContextValue {
  lenis: Lenis | null;
  scrollTo: (target: string | number | HTMLElement, options?: ScrollToOptions) => void;
}

const LenisContext = createContext<LenisContextValue>({
  lenis: null,
  scrollTo: () => {},
});

// ─── Provider ─────────────────────────────────────────────────────────────────
export function LenisProvider({ children }: { children: ReactNode }) {
  const lenisRef = useRef<Lenis | null>(null);
  const [lenis, setLenis] = useState<Lenis | null>(null);

  useEffect(() => {
    const lenisInstance = new Lenis({
      duration: 1.4,
      easing: (t: number) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1.0,
      touchMultiplier: 1.5,
    });

    lenisRef.current = lenisInstance;
    setLenis(lenisInstance);

    // Sync Lenis scroll position → GSAP ScrollTrigger
    lenisInstance.on('scroll', () => {
      ScrollTrigger.update();
    });

    // Drive Lenis from GSAP's ticker (shared RAF loop)
    const tickerCallback = (time: number) => {
      lenisInstance.raf(time * 1000);
    };
    gsap.ticker.add(tickerCallback);
    gsap.ticker.lagSmoothing(0);

    // Tell ScrollTrigger to read from Lenis virtual scroll position
    ScrollTrigger.scrollerProxy(document.documentElement, {
      scrollTop(value?: number) {
        if (arguments.length && value !== undefined) {
          lenisRef.current?.scrollTo(value, { immediate: true });
        }
        return lenisRef.current?.scroll ?? window.scrollY;
      },
      getBoundingClientRect() {
        return {
          top: 0,
          left: 0,
          width: window.innerWidth,
          height: window.innerHeight,
        };
      },
    });

    ScrollTrigger.refresh();

    return () => {
      gsap.ticker.remove(tickerCallback);
      lenisInstance.destroy();
    };
  }, []);

  const scrollTo = useCallback(
    (target: string | number | HTMLElement, options: ScrollToOptions = {}) => {
      if (!lenisRef.current) return;
      lenisRef.current.scrollTo(target as any, {
        offset:    options.offset   ?? 0,
        duration:  options.duration ?? 1.6,
        easing:    options.easing   ?? ((t) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t))),
        immediate: options.immediate ?? false,
        lock:      options.lock     ?? false,
        onComplete: options.onComplete,
      });
    },
    []
  );

  return (
    <LenisContext.Provider value={{ lenis, scrollTo }}>
      {children}
    </LenisContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────
export function useLenis(): LenisContextValue {
  const context = useContext(LenisContext);
  if (!context) throw new Error('useLenis must be used within a LenisProvider');
  return context;
}
