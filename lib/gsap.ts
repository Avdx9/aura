/**
 * GSAP Animation Utilities
 * ─────────────────────────────────────────────────────────────────────────────
 * Centralised GSAP configuration and reusable animation helpers.
 *
 * This module handles:
 *   1. GSAP plugin registration (done once at module level)
 *   2. Text splitting utility for kinetic typography
 *   3. Scroll-triggered reveal functions (fade-up, line reveal, stagger)
 *   4. Parallax depth effect
 *   5. Counter animation for statistics
 *
 * Lenis syncs automatically via the context provider (see LenisContext.tsx).
 * All ScrollTrigger instances use the scrollerProxy set in that provider.
 */

import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText'; // Requires GSAP Club membership

// ─── Register Plugins ──────────────────────────────────────────────────────────
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
  // SplitText is a Club GSAP plugin — gracefully skip if not licensed
  try {
    gsap.registerPlugin(SplitText);
  } catch {
    // SplitText not available — manual split fallback used below
  }
}

// ─── Default Ease ─────────────────────────────────────────────────────────────
export const EASE_LUXURY   = 'power3.out';
export const EASE_CINEMATIC = 'expo.inOut';
export const EASE_SPRING   = 'back.out(1.4)';

// ─── Text Splitting ────────────────────────────────────────────────────────────
/**
 * Manually split element text into word/char spans for GSAP animation.
 * Falls back gracefully if SplitText plugin is not available.
 *
 * @param element - Target DOM element
 * @param type    - 'words' | 'chars' | 'lines'
 * @returns Array of created span elements
 */
export function splitTextIntoSpans(
  element: HTMLElement,
  type: 'words' | 'chars' | 'lines' = 'words'
): HTMLElement[] {
  const text = element.textContent ?? '';
  element.innerHTML = '';
  element.setAttribute('aria-label', text); // Preserve accessibility

  const spans: HTMLElement[] = [];

  if (type === 'words') {
    text.split(' ').forEach((word, i, arr) => {
      const wrapper = document.createElement('span');
      wrapper.className = 'split-word';
      wrapper.style.display = 'inline-block';
      wrapper.style.overflow = 'hidden';

      const inner = document.createElement('span');
      inner.className = 'split-word-inner';
      inner.style.display = 'inline-block';
      inner.textContent = word + (i < arr.length - 1 ? '\u00A0' : '');

      wrapper.appendChild(inner);
      element.appendChild(wrapper);
      spans.push(inner);
    });
  } else if (type === 'chars') {
    text.split('').forEach((char) => {
      const span = document.createElement('span');
      span.className = 'split-char';
      span.style.display = 'inline-block';
      span.textContent = char === ' ' ? '\u00A0' : char;
      element.appendChild(span);
      spans.push(span);
    });
  } else if (type === 'lines') {
    // Line splitting requires measuring — wrap all in a single span first
    const lineSpan = document.createElement('span');
    lineSpan.style.display = 'inline-block';
    lineSpan.textContent = text;
    element.appendChild(lineSpan);
    spans.push(lineSpan);
  }

  return spans;
}

// ─── Kinetic Typography Reveal ────────────────────────────────────────────────
/**
 * Creates a scroll-triggered kinetic typography animation.
 * Words/chars slide up from below their overflow:hidden container,
 * creating the classic luxury editorial text reveal effect.
 *
 * @param element   - Container element with text to animate
 * @param options   - Animation configuration
 */
export interface KineticTextOptions {
  type?:      'words' | 'chars';
  stagger?:   number;
  duration?:  number;
  ease?:      string;
  y?:         number;
  delay?:     number;
  start?:     string;  // ScrollTrigger start
  markers?:   boolean; // Debug only
  onComplete?: () => void;
}

export function animateKineticText(
  element: HTMLElement,
  options: KineticTextOptions = {}
): ScrollTrigger {
  const {
    type      = 'words',
    stagger   = 0.04,
    duration  = 1.0,
    ease      = EASE_LUXURY,
    y         = 80,
    delay     = 0,
    start     = 'top 85%',
    markers   = false,
    onComplete,
  } = options;

  const spans = splitTextIntoSpans(element, type);

  // Set initial state
  gsap.set(spans, { y, opacity: 0 });

  // Create trigger
  const trigger = ScrollTrigger.create({
    trigger: element,
    start,
    markers,
    onEnter: () => {
      gsap.to(spans, {
        y: 0,
        opacity: 1,
        duration,
        stagger,
        ease,
        delay,
        clearProps: 'all',
        onComplete,
      });
    },
    once: true,
  });

  return trigger;
}

// ─── Fade-Up Reveal ───────────────────────────────────────────────────────────
/**
 * Standard scroll-triggered fade-up for non-text elements.
 * Used for cards, images, and UI components.
 */
export interface FadeUpOptions {
  y?:        number;
  opacity?:  number;
  duration?: number;
  delay?:    number;
  stagger?:  number;
  ease?:     string;
  start?:    string;
  once?:     boolean;
}

export function animateFadeUp(
  elements: HTMLElement | HTMLElement[] | NodeListOf<HTMLElement>,
  options: FadeUpOptions = {}
): ScrollTrigger[] {
  const {
    y        = 50,
    opacity  = 0,
    duration = 0.9,
    delay    = 0,
    stagger  = 0.1,
    ease     = EASE_LUXURY,
    start    = 'top 88%',
    once     = true,
  } = options;

  const targets = elements instanceof NodeList
    ? Array.from(elements)
    : Array.isArray(elements) ? elements : [elements];

  gsap.set(targets, { y, opacity });

  const trigger = ScrollTrigger.create({
    trigger: targets[0],
    start,
    once,
    onEnter: () => {
      gsap.to(targets, {
        y: 0,
        opacity: 1,
        duration,
        delay,
        stagger,
        ease,
        clearProps: 'transform,opacity',
      });
    },
  });

  return [trigger];
}

// ─── Parallax Depth Effect ────────────────────────────────────────────────────
/**
 * Creates a smooth parallax depth effect between foreground and background.
 * Background moves at `speed` relative to scroll, creating perceived depth.
 *
 * @param bgElement   - Background element (moves slower)
 * @param fgElement   - Foreground element (moves at natural scroll speed)
 * @param speed       - Parallax multiplier (0.0 = fixed, 1.0 = normal)
 */
export function createParallax(
  bgElement: HTMLElement,
  speed: number = 0.4
): ScrollTrigger {
  gsap.set(bgElement, { willChange: 'transform' });

  return ScrollTrigger.create({
    trigger:    bgElement,
    start:      'top bottom',
    end:        'bottom top',
    scrub:      true,
    onUpdate:   (self) => {
      const movement = self.progress * 100 * speed;
      gsap.set(bgElement, {
        y: `${movement}%`,
        ease: 'none',
      });
    },
  });
}

// ─── Image Reveal (Clip-Path Wipe) ────────────────────────────────────────────
/**
 * Reveals an image from bottom to top using clip-path animation.
 * Creates a premium "wipe reveal" effect as the user scrolls.
 */
export function animateImageReveal(
  imageContainer: HTMLElement,
  options: { duration?: number; ease?: string; start?: string } = {}
): ScrollTrigger {
  const {
    duration = 1.4,
    ease     = EASE_CINEMATIC,
    start    = 'top 80%',
  } = options;

  gsap.set(imageContainer, { clipPath: 'inset(100% 0 0 0)' });

  return ScrollTrigger.create({
    trigger: imageContainer,
    start,
    once: true,
    onEnter: () => {
      gsap.to(imageContainer, {
        clipPath: 'inset(0% 0 0 0)',
        duration,
        ease,
      });
    },
  });
}

// ─── Horizontal Scroller ──────────────────────────────────────────────────────
/**
 * Creates a horizontal scroll section pinned within vertical scroll.
 * Used for the treatments gallery panel.
 */
export function createHorizontalScroll(
  container: HTMLElement,
  panels: HTMLElement[]
): ScrollTrigger {
  const totalWidth = panels.reduce((sum, p) => sum + p.offsetWidth, 0);

  return ScrollTrigger.create({
    trigger:    container,
    pin:        true,
    scrub:      1,
    start:      'top top',
    end:        () => `+=${totalWidth - window.innerWidth}`,
    animation:  gsap.to(panels, {
      x: () => -(totalWidth - window.innerWidth),
      ease: 'none',
    }),
  });
}

// ─── Counter Animation ────────────────────────────────────────────────────────
/**
 * Animates a number from 0 to its target value when it enters the viewport.
 * Used for clinic statistics (e.g. "2,400+ treatments").
 */
export function animateCounter(
  element: HTMLElement,
  target: number,
  options: {
    duration?: number;
    prefix?:   string;
    suffix?:   string;
    decimals?: number;
  } = {}
): void {
  const { duration = 2.5, prefix = '', suffix = '', decimals = 0 } = options;

  const counter = { value: 0 };

  ScrollTrigger.create({
    trigger: element,
    start:   'top 85%',
    once:    true,
    onEnter: () => {
      gsap.to(counter, {
        value: target,
        duration,
        ease: 'power2.out',
        onUpdate: () => {
          element.textContent =
            prefix +
            counter.value.toLocaleString('en-GB', {
              minimumFractionDigits: decimals,
              maximumFractionDigits: decimals,
            }) +
            suffix;
        },
      });
    },
  });
}

// ─── Cleanup Helper ───────────────────────────────────────────────────────────
/**
 * Kill all ScrollTrigger instances associated with a component.
 * Call in useEffect cleanup to prevent memory leaks.
 */
export function killScrollTriggers(triggers: ScrollTrigger[]): void {
  triggers.forEach((t) => t.kill());
}
