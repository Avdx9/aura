import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '404 — Page Not Found | Aura Longevity',
};

export default function NotFound() {
  return (
    <main className="min-h-screen bg-obsidian-950 flex flex-col items-center justify-center text-center px-6">
      {/* Decorative */}
      <div className="relative w-24 h-24 mb-10">
        <div className="absolute inset-0 border border-champagne-DEFAULT/20 rotate-45" />
        <div className="absolute inset-2 border border-champagne-DEFAULT/10 rotate-45" />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="font-mono text-xs text-champagne-DEFAULT/40 tracking-widest">404</span>
        </div>
      </div>

      <p className="label-overline mb-4">Page Not Found</p>

      <h1 className="font-display text-fluid-4xl text-pearl font-normal leading-tight max-w-md mb-6">
        This page has moved on.
      </h1>

      <p className="font-body text-pearl/40 text-fluid-base max-w-xs leading-relaxed mb-10">
        Perhaps what you are looking for can be found elsewhere on our site, or contact us directly.
      </p>

      <div className="flex flex-col sm:flex-row gap-4">
        <Link href="/" className="btn-primary">
          <span>Return Home</span>
        </Link>
        <Link href="/treatments" className="btn-outline">
          <span>View Treatments</span>
        </Link>
      </div>

      <a
        href="tel:+442070000000"
        className="mt-10 font-mono text-xs text-pearl/25 hover:text-pearl/50 transition-colors tracking-widest"
      >
        +44 20 7000 0000
      </a>
    </main>
  );
}
