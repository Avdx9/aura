import type { MetadataRoute } from 'next';

const BASE_URL = 'https://auralongvity.co.uk';

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: BASE_URL,                    lastModified: now, changeFrequency: 'weekly',  priority: 1.0  },
    { url: `${BASE_URL}/treatments`,    lastModified: now, changeFrequency: 'weekly',  priority: 0.95 },
    { url: `${BASE_URL}/practitioners`, lastModified: now, changeFrequency: 'monthly', priority: 0.85 },
    { url: `${BASE_URL}/about`,         lastModified: now, changeFrequency: 'monthly', priority: 0.75 },
    { url: `${BASE_URL}/blog`,          lastModified: now, changeFrequency: 'weekly',  priority: 0.70 },
    { url: `${BASE_URL}/contact`,       lastModified: now, changeFrequency: 'yearly',  priority: 0.65 },
  ];

  const treatmentRoutes: MetadataRoute.Sitemap = [
    'facial-contouring', 'prp', 'profhilo', 'morpheus8',
    'nad-iv', 'iv-longevity', 'ozone', 'hormonal',
    'body-sculpting', 'skin-tightening',
  ].map((slug) => ({
    url:             `${BASE_URL}/treatments/${slug}`,
    lastModified:    now,
    changeFrequency: 'monthly' as const,
    priority:        0.80,
  }));

  return [...staticRoutes, ...treatmentRoutes];
}
