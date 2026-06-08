/**
 * Treatments Page — Server-Side Rendering (SSR)
 * ─────────────────────────────────────────────────────────────────────────────
 * Rendered on every request so pricing is always live and accurate.
 * In production: fetches treatment data from Sanity CMS via API route.
 */

import type { Metadata } from 'next';
import { Footer } from '@/components/sections/Footer';

export const dynamic    = 'force-dynamic'; // SSR — never cache
export const revalidate = 0;

export const metadata: Metadata = {
  title:       'Treatments | Aura Longevity Mayfair',
  description: 'Explore our full range of elite aesthetic and longevity treatments. Facial contouring, PRP, NAD+ IV therapy, and precision body sculpting. Prices from £650.',
  alternates:  { canonical: 'https://auralongvity.co.uk/treatments' },
};

// ─── Mock data (replace with Sanity fetch in production) ──────────────────────
async function getTreatments() {
  // In production:
  // const client = createClient({ projectId, dataset, apiVersion, useCdn: false });
  // return client.fetch(`*[_type == "treatment"] | order(category asc, price asc)`);

  return [
    { id: 'facial-contouring',  name: 'Advanced Facial Contouring',   category: 'Face',      price: 2000, duration: 90  },
    { id: 'prp',                name: 'PRP Rejuvenation Therapy',      category: 'Face',      price: 850,  duration: 60  },
    { id: 'profhilo',           name: 'Profhilo Skin Remodelling',     category: 'Face',      price: 650,  duration: 45  },
    { id: 'morpheus8',          name: 'Morpheus8 RF Microneedling',    category: 'Face',      price: 1200, duration: 75  },
    { id: 'nad-iv',             name: 'NAD+ IV Cellular Restoration',  category: 'Wellness',  price: 1800, duration: 120 },
    { id: 'iv-longevity',       name: 'Bespoke IV Longevity',          category: 'Wellness',  price: 1200, duration: 90  },
    { id: 'ozone',              name: 'Ozone Therapy',                 category: 'Wellness',  price: 750,  duration: 60  },
    { id: 'hormonal',           name: 'Hormonal Optimisation',         category: 'Wellness',  price: 2500, duration: 0   },
    { id: 'body-sculpting',     name: 'Precision Body Sculpting',      category: 'Body',      price: 1400, duration: 75  },
    { id: 'skin-tightening',    name: 'Skin Tightening',               category: 'Body',      price: 1100, duration: 90  },
  ];
}

export default async function TreatmentsPage() {
  const treatments = await getTreatments();
  const categories = Array.from(new Set(treatments.map((t) => t.category)));

  return (
    <>
      <main className="min-h-screen bg-obsidian-950 pt-[var(--nav-height)]">
        {/* Page header */}
        <div className="container-luxury py-20 border-b border-pearl/8">
          <p className="label-overline mb-4">Our Treatments</p>
          <h1 className="font-display text-fluid-5xl text-pearl font-normal leading-tight max-w-2xl">
            Precision medicine,<br />
            <em className="italic text-gradient-gold">bespoke to you.</em>
          </h1>
          <p className="font-body text-pearl/45 mt-6 max-w-md text-fluid-base leading-relaxed">
            All prices shown are per session. A complimentary consultation is
            included with every treatment booking.
          </p>
        </div>

        {/* Treatment listings by category */}
        <div className="container-luxury py-16">
          {categories.map((category) => {
            const categoryTreatments = treatments.filter((t) => t.category === category);
            return (
              <section key={category} className="mb-16">
                <h2 className="label-overline mb-6 pb-4 border-b border-pearl/8">
                  {category}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {categoryTreatments.map((treatment) => (
                    <div
                      key={treatment.id}
                      className="group flex items-center justify-between p-5 card-luxury"
                      style={{
                        clipPath: 'polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))',
                      }}
                    >
                      <div>
                        <p className="font-body text-pearl text-sm font-normal group-hover:text-champagne-DEFAULT transition-colors">
                          {treatment.name}
                        </p>
                        <p className="font-mono text-xs text-pearl/30 mt-1">
                          {treatment.duration > 0 ? `${treatment.duration} min` : 'Programme'}
                        </p>
                      </div>
                      <p className="font-mono text-sm text-champagne-DEFAULT shrink-0 ml-4">
                        from £{treatment.price.toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            );
          })}

          <p className="font-mono text-xs text-pearl/20 tracking-wide">
            Prices correct as of {new Date().toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}.
            All treatments require a consultation. Prices may vary based on individual assessment.
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}
