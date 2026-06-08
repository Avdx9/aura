'use client';

/**
 * Navigation
 * ─────────────────────────────────────────────────────────────────────────────
 * Fixed global navigation that transitions from transparent to obsidian-backed
 * as the user scrolls past the hero section.
 * Includes the "Book Consultation" CTA that opens the BookingDrawer.
 */

import { useState, useEffect, useRef } from 'react';
import { useBooking } from '@/context/BookingContext';
import { useLenis } from '@/context/LenisContext';
import { cn } from '@/lib/utils';

const NAV_LINKS = [
  { label: 'Treatments',  href: '#treatments' },
  { label: 'Practitioners', href: '#practitioners' },
  { label: 'Science',     href: '#science' },
  { label: 'Results',     href: '#results' },
  { label: 'The Clinic',  href: '#clinic' },
];

export function Navigation() {
  const [scrolled, setScrolled]     = useState(false);
  const [menuOpen, setMenuOpen]     = useState(false);
  const [hidden, setHidden]         = useState(false);
  const lastScrollY                 = useRef(0);
  const { open: openBooking }       = useBooking();
  const { scrollTo }                = useLenis();

  // ── Scroll state detection ─────────────────────────────────────────────────
  useEffect(() => {
    const handleScroll = () => {
      const y = window.scrollY;

      // Scrolled past hero
      setScrolled(y > 80);

      // Auto-hide on rapid downscroll (> 200px past top)
      if (y > 200) {
        setHidden(y > lastScrollY.current && y - lastScrollY.current > 8);
      } else {
        setHidden(false);
      }

      lastScrollY.current = y;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavClick = (href: string) => {
    setMenuOpen(false);
    const target = document.querySelector(href);
    if (target) {
      scrollTo(target as HTMLElement, { offset: -80, duration: 1.8 });
    }
  };

  return (
    <>
      <header
        className={cn(
          'fixed top-0 left-0 right-0 z-90 transition-all duration-700',
          scrolled
            ? 'bg-obsidian-950/95 backdrop-blur-md border-b border-pearl/5'
            : 'bg-transparent',
          hidden && '-translate-y-full'
        )}
        style={{ height: 'var(--nav-height)' }}
      >
        <nav
          className="container-luxury h-full flex items-center justify-between"
          aria-label="Main navigation"
        >
          {/* ── Wordmark ──────────────────────────────────────────────────── */}
          <a
            href="/"
            className="flex items-center gap-3 group"
            aria-label="Aura Longevity — Home"
          >
            {/* Geometric mark */}
            <div className="relative w-7 h-7 shrink-0">
              <div className="absolute inset-0 border border-champagne-DEFAULT/60 rotate-45 transition-transform duration-500 group-hover:rotate-[405deg]" />
              <div className="absolute inset-1 border border-champagne-DEFAULT/30 rotate-45 transition-transform duration-700 group-hover:rotate-[405deg]" />
            </div>

            <div className="flex flex-col leading-none">
              <span className="font-display text-lg text-pearl tracking-wide font-normal">
                Aura
              </span>
              <span className="font-mono text-[9px] text-champagne-DEFAULT tracking-[0.3em] uppercase">
                Longevity
              </span>
            </div>
          </a>

          {/* ── Desktop Links ──────────────────────────────────────────────── */}
          <ul
            className="hidden lg:flex items-center gap-8"
            role="list"
          >
            {NAV_LINKS.map(({ label, href }) => (
              <li key={href}>
                <button
                  onClick={() => handleNavClick(href)}
                  className={cn(
                    'font-mono text-[11px] tracking-widest uppercase text-pearl/50',
                    'hover:text-pearl transition-colors duration-300',
                    'relative group'
                  )}
                >
                  {label}
                  <span className="absolute -bottom-1 left-0 w-0 h-px bg-champagne-DEFAULT transition-all duration-400 group-hover:w-full" />
                </button>
              </li>
            ))}
          </ul>

          {/* ── CTA + Mobile Toggle ────────────────────────────────────────── */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => openBooking()}
              className="hidden sm:flex btn-primary"
              aria-label="Book a consultation"
            >
              <span>Book Consultation</span>
            </button>

            {/* Mobile hamburger */}
            <button
              onClick={() => setMenuOpen((v) => !v)}
              className="lg:hidden w-10 h-10 flex flex-col items-center justify-center gap-1.5"
              aria-expanded={menuOpen}
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            >
              <span className={cn(
                'block w-6 h-px bg-pearl transition-all duration-400',
                menuOpen ? 'translate-y-[5px] rotate-45' : ''
              )} />
              <span className={cn(
                'block w-4 h-px bg-pearl/60 transition-all duration-300',
                menuOpen ? 'opacity-0 w-0' : ''
              )} />
              <span className={cn(
                'block w-6 h-px bg-pearl transition-all duration-400',
                menuOpen ? '-translate-y-[5px] -rotate-45' : ''
              )} />
            </button>
          </div>
        </nav>
      </header>

      {/* ── Mobile Menu ────────────────────────────────────────────────────── */}
      <div
        className={cn(
          'fixed inset-x-0 top-0 z-80 bg-obsidian-950 border-b border-pearl/10',
          'transition-transform duration-700 lg:hidden',
          'pt-[var(--nav-height)]',
          menuOpen ? 'translate-y-0' : '-translate-y-full'
        )}
        aria-hidden={!menuOpen}
      >
        <nav className="container-luxury py-10 flex flex-col gap-6">
          {NAV_LINKS.map(({ label, href }) => (
            <button
              key={href}
              onClick={() => handleNavClick(href)}
              className="font-display text-3xl text-pearl/70 hover:text-pearl text-left transition-colors duration-300 font-normal"
            >
              {label}
            </button>
          ))}
          <div className="mt-4">
            <button
              onClick={() => { openBooking(); setMenuOpen(false); }}
              className="btn-primary"
            >
              <span>Book Consultation</span>
            </button>
          </div>
        </nav>
      </div>
    </>
  );
}
