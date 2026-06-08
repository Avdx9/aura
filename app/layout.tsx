import type { Metadata, Viewport } from 'next';
import { Playfair_Display, Cormorant_Garamond } from 'next/font/google';
import localFont from 'next/font/local';
import { LenisProvider } from '@/context/LenisContext';
import { BookingProvider } from '@/context/BookingContext';
import { CustomCursor } from '@/components/ui/CustomCursor';
import { Navigation } from '@/components/ui/Navigation';
import { BookingDrawer } from '@/components/booking/BookingDrawer';
import { Toaster } from 'react-hot-toast';
import '@/styles/globals.css';

// ─── Typography ────────────────────────────────────────────────────────────────
// High-contrast luxury display serif — Didot-esque
const playfairDisplay = Playfair_Display({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800', '900'],
  style: ['normal', 'italic'],
  variable: '--font-display',
  display: 'swap',
  preload: true,
});

// Editorial body serif — refined, legible
const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  style: ['normal', 'italic'],
  variable: '--font-body',
  display: 'swap',
  preload: true,
});

// Geometric mono for clinical data/pricing
const geistMono = localFont({
  src: '../public/fonts/GeistMono-Regular.woff2',
  variable: '--font-mono',
  display: 'swap',
  fallback: ['Courier New'],
});

// ─── Metadata ──────────────────────────────────────────────────────────────────
export const metadata: Metadata = {
  metadataBase: new URL('https://auralongvity.co.uk'),
  title: {
    default: 'Aura Longevity | Elite Aesthetics & Anti-Ageing Clinic Mayfair London',
    template: '%s | Aura Longevity Mayfair',
  },
  description:
    'Aura Longevity is Mayfair\'s premier private aesthetics and anti-ageing clinic. Expert practitioners. Bespoke treatment programmes. Discretion guaranteed.',
  keywords: [
    'aesthetics clinic Mayfair',
    'anti-ageing London',
    'luxury skincare London',
    'facial contouring Mayfair',
    'private aesthetics clinic London',
    'Botox Mayfair',
    'dermal fillers London',
    'longevity medicine London',
  ],
  openGraph: {
    type: 'website',
    locale: 'en_GB',
    url: 'https://auralongvity.co.uk',
    siteName: 'Aura Longevity',
    title: 'Aura Longevity | Elite Aesthetics & Anti-Ageing Clinic Mayfair',
    description:
      'Mayfair\'s premier private aesthetics and anti-ageing clinic. Bespoke treatment programmes delivered by expert practitioners.',
    images: [
      {
        url: '/images/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Aura Longevity Clinic — Mayfair London',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Aura Longevity | Elite Aesthetics Mayfair',
    description: 'Mayfair\'s premier private aesthetics clinic.',
    images: ['/images/og-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: 'https://auralongvity.co.uk',
  },
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/icon-16.png', sizes: '16x16', type: 'image/png' },
      { url: '/icon-32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180' }],
  },
};

export const viewport: Viewport = {
  themeColor: '#0e0b07',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

// ─── Root Layout ───────────────────────────────────────────────────────────────
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en-GB"
      className={`${playfairDisplay.variable} ${cormorant.variable} ${geistMono.variable}`}
      suppressHydrationWarning
    >
      <head>
        {/* Preconnect to critical third-party origins */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://cdn.sanity.io" />

        {/* Structured Data — Local Business */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'MedicalBusiness',
              name: 'Aura Longevity',
              description: 'Elite private aesthetics and anti-ageing clinic in Mayfair, London.',
              url: 'https://auralongvity.co.uk',
              telephone: '+44-20-7000-0000',
              address: {
                '@type': 'PostalAddress',
                streetAddress: '12 Harley Street',
                addressLocality: 'Mayfair',
                addressRegion: 'London',
                postalCode: 'W1G 9PQ',
                addressCountry: 'GB',
              },
              geo: {
                '@type': 'GeoCoordinates',
                latitude: 51.5195,
                longitude: -0.1469,
              },
              openingHoursSpecification: [
                {
                  '@type': 'OpeningHoursSpecification',
                  dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
                  opens: '09:00',
                  closes: '19:00',
                },
                {
                  '@type': 'OpeningHoursSpecification',
                  dayOfWeek: ['Saturday'],
                  opens: '10:00',
                  closes: '17:00',
                },
              ],
              priceRange: '£££',
            }),
          }}
        />
      </head>

      <body className="bg-obsidian-950 text-pearl overflow-x-hidden">
        {/* Global Providers */}
        <LenisProvider>
          <BookingProvider>
            {/* Luxury cursor — desktop only */}
            <CustomCursor />

            {/* Global navigation */}
            <Navigation />

            {/* Main content */}
            <main>{children}</main>

            {/* Slide-out booking drawer — rendered as a React portal */}
            <BookingDrawer />

            {/* Toast notifications */}
            <Toaster
              position="bottom-right"
              toastOptions={{
                style: {
                  background: '#1c170f',
                  color: '#f5f0e8',
                  border: '1px solid rgba(201, 169, 110, 0.3)',
                  fontFamily: 'var(--font-body)',
                  fontSize: '0.875rem',
                  letterSpacing: '0.02em',
                },
              }}
            />
          </BookingProvider>
        </LenisProvider>
      </body>
    </html>
  );
}
