# Aura Longevity — Production Codebase

> Elite aesthetics & longevity clinic website. Built to £15,000 enterprise standard.
> Next.js 14 App Router · GSAP · Lenis · Three.js · WebGL GLSL Shaders

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS + custom CSS modules |
| Animation | GSAP 3 + ScrollTrigger |
| Smooth Scroll | Lenis (@studio-freight/lenis) |
| 3D / WebGL | Three.js + custom GLSL shaders |
| CMS | Sanity (headless) |
| Booking API | Pabau (server-side only) |
| Deployment | Vercel (London region lhr1) |
| Fonts | Playfair Display + Cormorant Garamond |

---

## Directory Structure

```
aura-longevity/
├── app/
│   ├── layout.tsx              # Root layout: Lenis + Booking providers, fonts, SEO
│   ├── page.tsx                # Homepage (SSG — build-time static)
│   ├── not-found.tsx           # Custom 404
│   ├── sitemap.ts              # Auto XML sitemap
│   ├── robots.ts               # robots.txt
│   ├── treatments/
│   │   └── page.tsx            # Treatments listing (SSR — always fresh)
│   └── api/
│       ├── booking/
│       │   └── actions.ts      # Server Action: Pabau API integration
│       └── revalidate/
│           └── route.ts        # Sanity webhook ISR revalidation
│
├── components/
│   ├── shaders/
│   │   ├── HeroShaderCanvas.tsx   # Three.js WebGL canvas component
│   │   ├── heroVertex.glsl        # Vertex shader (passthrough)
│   │   └── heroFragment.glsl      # Fragment shader (fluid distortion)
│   ├── three/
│   │   └── AnatomyVisualizer.tsx  # GLTF 3D anatomy model + GSAP ScrollTrigger
│   ├── booking/
│   │   └── BookingDrawer.tsx      # React portal slide-out booking form
│   ├── ui/
│   │   ├── Navigation.tsx         # Global nav with scroll state
│   │   ├── CustomCursor.tsx       # Dual-ring luxury cursor
│   │   └── BeforeAfterSlider.tsx  # clip-path drag reveal slider
│   └── sections/
│       ├── HeroSection.tsx        # Hero: WebGL + kinetic type + GSAP intro
│       ├── MarqueeSection.tsx     # GSAP infinite scroll marquee
│       ├── PhilosophySection.tsx  # Brand narrative + parallax
│       ├── TreatmentsSection.tsx  # Service cards + anatomy visualiser
│       ├── ResultsSection.tsx     # Before/After sliders
│       ├── PractitionersSection.tsx
│       ├── StatisticsSection.tsx  # Animated counters
│       ├── TestimonialsSection.tsx
│       ├── CtaSection.tsx
│       └── Footer.tsx
│
├── context/
│   ├── LenisContext.tsx        # Lenis smooth scroll + GSAP ScrollTrigger sync
│   └── BookingContext.tsx      # Booking drawer global state
│
├── hooks/
│   └── useScrollProgress.ts   # useScrollProgress, useInView, useMousePosition
│
├── lib/
│   ├── gsap.ts                 # GSAP utilities: split text, parallax, counters
│   └── utils.ts                # cn(), formatCurrency(), lerp(), etc.
│
├── styles/
│   └── globals.css             # Tailwind base + design system CSS vars
│
├── public/
│   ├── fonts/                  # Self-hosted GeistMono
│   ├── images/                 # Hero, editorial, results, grain texture
│   ├── models/                 # face-anatomy.glb (DRACO compressed)
│   └── draco/                  # DRACO decoder WASM files
│
├── package.json
├── next.config.js
├── tailwind.config.js
├── tsconfig.json
├── vercel.json
└── .env.local.example
```

---

## Quick Start

### 1. Clone & Install

```bash
git clone https://github.com/your-org/aura-longevity.git
cd aura-longevity
npm install
```

### 2. Environment Variables

```bash
cp .env.local.example .env.local
# Fill in all values in .env.local — never commit this file
```

### 3. DRACO Decoder

Copy the DRACO decoder files into `/public/draco/`:
```bash
# From node_modules
cp -r node_modules/three/examples/jsm/libs/draco/ public/draco/
```

### 4. Assets Required

Add these to `/public/`:
```
images/
  hero-editorial.jpg      # 2560×1440px editorial hero photograph
  grain.png               # Seamless grain texture (200×200px)
  og-image.jpg            # 1200×630px Open Graph image
  results/
    before-1.jpg, after-1.jpg
    before-2.jpg, after-2.jpg
    before-3.jpg, after-3.jpg
  practitioners/
    sarah-chen.jpg
    omar-hassan.jpg
    elena-novak.jpg
models/
  face-anatomy.glb        # DRACO-compressed, <500KB
fonts/
  GeistMono-Regular.woff2
```

### 5. Run Development

```bash
npm run dev
# → http://localhost:3000
```

### 6. Production Build

```bash
npm run build
npm run start
```

---

## Deploy to Vercel

### Option A — Vercel CLI (recommended)

```bash
npm install -g vercel
vercel login
vercel --prod
```

### Option B — GitHub Integration

1. Push to GitHub: `git push origin main`
2. Import repo at vercel.com/new
3. Add all environment variables in Vercel dashboard
4. Deploy — Vercel auto-detects Next.js

### Environment Variables (Vercel Dashboard)

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_SANITY_PROJECT_ID` | Sanity project ID |
| `NEXT_PUBLIC_SANITY_DATASET` | `production` |
| `SANITY_API_TOKEN` | Sanity read token (secret) |
| `PABAU_API_KEY` | Pabau booking API key (secret) |
| `PABAU_API_BASE_URL` | Pabau API base URL |
| `NEXT_PUBLIC_SITE_URL` | `https://auralongvity.co.uk` |
| `REVALIDATION_SECRET` | Webhook revalidation secret |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | Google Analytics 4 ID |

---

## Key Architecture Decisions

### SSG vs SSR
- **Homepage** (`/`): `force-static` — pre-rendered at build time. Zero TTFB.
- **Treatments** (`/treatments`): `force-dynamic` — SSR ensures live pricing from CMS.
- **Blog** (`/blog`): ISR with `revalidate: 3600` — static, refreshed hourly.

### Lenis + GSAP Sync
Lenis intercepts native scroll events. GSAP ScrollTrigger is wired to read
Lenis's virtual scroll position via `scrollerProxy`. The `gsap.ticker` drives
both systems from a single `requestAnimationFrame` loop, preventing drift.
See: `context/LenisContext.tsx`

### WebGL Shader
A Three.js `ShaderMaterial` on an orthographic plane overlays the hero image.
Mouse position drives `uMouse` uniform. Distortion is strictly boundary-masked
so it never bleeds outside the image. Performance: single draw call, no AA.
See: `components/shaders/HeroShaderCanvas.tsx` + `heroFragment.glsl`

### Booking Security
`PABAU_API_KEY` is consumed exclusively in `app/api/booking/actions.ts` — a
Next.js Server Action. It never touches the client bundle. Input is sanitised
server-side before any API call.

### 3D Anatomy Model
Load the GLTF with DRACOLoader (target < 500KB). Mesh names must match
the `LAYER_CONFIG` keys in `AnatomyVisualizer.tsx`. GSAP ScrollTrigger
drives both Y-rotation and per-layer opacity dissolve via `updateLayerOpacity()`.

---

## Performance Targets

| Metric | Target |
|---|---|
| Lighthouse Performance | ≥ 95 |
| Lighthouse Accessibility | ≥ 95 |
| Lighthouse SEO | 100 |
| Lighthouse Best Practices | 100 |
| LCP | < 1.8s |
| CLS | < 0.05 |
| FID / INP | < 100ms |

---

## Extending the CMS

Install and configure Sanity Studio:
```bash
npm create sanity@latest -- --project-id YOUR_PROJECT_ID --dataset production
```

Define schemas for: `treatment`, `practitioner`, `post`, `testimonial`, `siteSettings`.
Hook the webhook to `/api/revalidate?secret=YOUR_SECRET` in Sanity settings.

---

*Built to enterprise standard. All code is production-ready.*
