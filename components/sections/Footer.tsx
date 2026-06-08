import Link from 'next/link';

const TREATMENT_LINKS = [
  { label: 'Facial Contouring',     href: '/treatments/facial-contouring' },
  { label: 'PRP Rejuvenation',      href: '/treatments/prp' },
  { label: 'Profhilo',              href: '/treatments/profhilo' },
  { label: 'NAD+ IV Therapy',       href: '/treatments/nad-iv' },
  { label: 'Body Sculpting',        href: '/treatments/body-sculpting' },
  { label: 'Hormonal Optimisation', href: '/treatments/hormonal' },
];

const CLINIC_LINKS = [
  { label: 'About Aura',    href: '/about' },
  { label: 'Our Team',      href: '/practitioners' },
  { label: 'The Science',   href: '/science' },
  { label: 'Client Stories', href: '/testimonials' },
  { label: 'Journal',       href: '/blog' },
  { label: 'Contact',       href: '/contact' },
];

const LEGAL_LINKS = [
  { label: 'Privacy Policy',          href: '/privacy' },
  { label: 'Cookie Policy',           href: '/cookies' },
  { label: 'Terms & Conditions',      href: '/terms' },
  { label: 'Complaints Procedure',    href: '/complaints' },
];

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-obsidian-950 border-t border-pearl/8" role="contentinfo">
      {/* Main footer */}
      <div className="container-luxury py-16 lg:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">

          {/* Brand column */}
          <div className="lg:col-span-1">
            {/* Wordmark */}
            <div className="flex items-center gap-3 mb-6">
              <div className="relative w-7 h-7">
                <div className="absolute inset-0 border border-champagne-DEFAULT/50 rotate-45" />
                <div className="absolute inset-1 border border-champagne-DEFAULT/20 rotate-45" />
              </div>
              <div>
                <p className="font-display text-base text-pearl font-normal tracking-wide">Aura</p>
                <p className="font-mono text-[9px] text-champagne-DEFAULT tracking-[0.3em] uppercase">Longevity</p>
              </div>
            </div>

            <p className="font-body text-pearl/35 text-sm leading-relaxed mb-6">
              Mayfair&apos;s foremost private aesthetics and longevity clinic. By appointment only.
            </p>

            <div className="space-y-2">
              <p className="font-mono text-xs text-pearl/25 tracking-wide">12 Harley Street</p>
              <p className="font-mono text-xs text-pearl/25 tracking-wide">Mayfair, London</p>
              <p className="font-mono text-xs text-pearl/25 tracking-wide">W1G 9PQ</p>
            </div>

            {/* CQC registration */}
            <div className="mt-6 inline-flex items-center gap-2 px-3 py-2 border border-pearl/10 bg-obsidian-900/30">
              <div className="w-2 h-2 rounded-full bg-sage-500" />
              <span className="font-mono text-[10px] text-pearl/30 tracking-wider">CQC Registered</span>
            </div>
          </div>

          {/* Treatments */}
          <div>
            <h3 className="label-overline mb-5">Treatments</h3>
            <ul className="space-y-3">
              {TREATMENT_LINKS.map(({ label, href }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="font-body text-sm text-pearl/35 hover:text-pearl/70 transition-colors duration-300"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* The Clinic */}
          <div>
            <h3 className="label-overline mb-5">The Clinic</h3>
            <ul className="space-y-3">
              {CLINIC_LINKS.map(({ label, href }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="font-body text-sm text-pearl/35 hover:text-pearl/70 transition-colors duration-300"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact + Hours */}
          <div>
            <h3 className="label-overline mb-5">Contact</h3>
            <div className="space-y-3 mb-8">
              <a
                href="tel:+442070000000"
                className="block font-body text-sm text-pearl/35 hover:text-pearl/70 transition-colors"
              >
                +44 20 7000 0000
              </a>
              <a
                href="mailto:hello@auralongvity.co.uk"
                className="block font-body text-sm text-pearl/35 hover:text-pearl/70 transition-colors"
              >
                hello@auralongvity.co.uk
              </a>
            </div>

            <h4 className="label-overline mb-3">Hours</h4>
            <div className="space-y-1.5">
              {[
                { days: 'Mon – Fri', hours: '09:00 – 19:00' },
                { days: 'Saturday',  hours: '10:00 – 17:00' },
                { days: 'Sunday',    hours: 'Closed' },
              ].map(({ days, hours }) => (
                <div key={days} className="flex justify-between">
                  <span className="font-mono text-[11px] text-pearl/25">{days}</span>
                  <span className="font-mono text-[11px] text-pearl/40">{hours}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Legal bar */}
      <div className="border-t border-pearl/5">
        <div className="container-luxury py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="font-mono text-[10px] text-pearl/15 tracking-wide">
            © {year} Aura Longevity Ltd. All rights reserved. Company No. 12345678. Registered in England & Wales.
          </p>

          <div className="flex flex-wrap gap-4 justify-center">
            {LEGAL_LINKS.map(({ label, href }) => (
              <Link
                key={href}
                href={href}
                className="font-mono text-[10px] text-pearl/20 hover:text-pearl/40 transition-colors tracking-wide"
              >
                {label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
