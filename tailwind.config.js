/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      // Aura Longevity Design System
      colors: {
        // Primary: Deep Obsidian + Warm Champagne
        obsidian: {
          50:  '#f5f3f0',
          100: '#e8e4dd',
          200: '#d0c9bb',
          300: '#b8ac98',
          400: '#9f8e75',
          500: '#877352',
          600: '#6d5c40',
          700: '#524430',
          800: '#372d1f',
          900: '#1c170f',
          950: '#0e0b07',
        },
        champagne: {
          50:  '#fffdf7',
          100: '#fef9eb',
          200: '#fdf1cc',
          300: '#fbe5a0',
          400: '#f8d26b',
          500: '#f4bb36',
          600: '#d99e1a',
          700: '#b67f0e',
          800: '#8c5f0a',
          900: '#634308',
          DEFAULT: '#c9a96e',
        },
        pearl: {
          DEFAULT: '#f5f0e8',
          warm: '#ede6d6',
          cool: '#f0eff0',
        },
        // Accent: Sage green for wellness
        sage: {
          50:  '#f3f6f2',
          100: '#e3ebe0',
          200: '#c5d6bf',
          300: '#9ab99a',
          400: '#6e9870',
          500: '#4a7550',
          600: '#375a3c',
          700: '#2a432e',
          800: '#1d2d20',
          900: '#101810',
        },
      },

      fontFamily: {
        // Display: Didot-esque high contrast serif
        display: ['var(--font-display)', 'Georgia', 'serif'],
        // Body: Elegant humanist sans
        body: ['var(--font-body)', 'Helvetica Neue', 'sans-serif'],
        // Mono: For clinical data
        mono: ['var(--font-mono)', 'Courier New', 'monospace'],
      },

      fontSize: {
        '2xs': ['0.625rem', { lineHeight: '1rem' }],
        'fluid-xs':   'clamp(0.75rem, 0.7rem + 0.25vw, 0.875rem)',
        'fluid-sm':   'clamp(0.875rem, 0.8rem + 0.375vw, 1rem)',
        'fluid-base': 'clamp(1rem, 0.9rem + 0.5vw, 1.125rem)',
        'fluid-lg':   'clamp(1.125rem, 1rem + 0.625vw, 1.375rem)',
        'fluid-xl':   'clamp(1.25rem, 1.1rem + 0.75vw, 1.625rem)',
        'fluid-2xl':  'clamp(1.5rem, 1.25rem + 1.25vw, 2.25rem)',
        'fluid-3xl':  'clamp(1.875rem, 1.5rem + 1.875vw, 3rem)',
        'fluid-4xl':  'clamp(2.25rem, 1.75rem + 2.5vw, 4rem)',
        'fluid-5xl':  'clamp(3rem, 2rem + 5vw, 6rem)',
        'fluid-6xl':  'clamp(3.75rem, 2.5rem + 6.25vw, 8rem)',
        'fluid-hero': 'clamp(4rem, 3rem + 8vw, 10rem)',
      },

      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
        '30': '7.5rem',
        '34': '8.5rem',
        '88': '22rem',
        '92': '23rem',
        '128': '32rem',
        '144': '36rem',
      },

      letterSpacing: {
        'ultra-wide': '0.3em',
        'super-wide': '0.5em',
      },

      lineHeight: {
        'display': '0.92',
        'tight-display': '0.85',
      },

      transitionTimingFunction: {
        'luxury': 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        'spring': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
        'smooth': 'cubic-bezier(0.43, 0.195, 0.02, 1)',
      },

      transitionDuration: {
        '400': '400ms',
        '600': '600ms',
        '800': '800ms',
        '1200': '1200ms',
        '1600': '1600ms',
        '2000': '2000ms',
      },

      animation: {
        'fade-up':         'fadeUp 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards',
        'fade-in':         'fadeIn 1.2s ease forwards',
        'shimmer':         'shimmer 2.5s infinite',
        'float':           'float 6s ease-in-out infinite',
        'grain':           'grain 8s steps(1) infinite',
        'cursor-glow':     'cursorGlow 0.3s ease forwards',
      },

      keyframes: {
        fadeUp: {
          '0%':   { opacity: '0', transform: 'translateY(40px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-12px)' },
        },
        grain: {
          '0%, 100%': { transform: 'translate(0, 0)' },
          '10%':      { transform: 'translate(-2%, -3%)' },
          '20%':      { transform: 'translate(3%, 2%)' },
          '30%':      { transform: 'translate(-1%, 4%)' },
          '40%':      { transform: 'translate(4%, -1%)' },
          '50%':      { transform: 'translate(-3%, 3%)' },
          '60%':      { transform: 'translate(2%, -4%)' },
          '70%':      { transform: 'translate(-4%, 1%)' },
          '80%':      { transform: 'translate(1%, -2%)' },
          '90%':      { transform: 'translate(-2%, 4%)' },
        },
      },

      backdropBlur: {
        'xs': '2px',
        '4xl': '72px',
      },

      boxShadow: {
        'luxury': '0 25px 80px -12px rgba(12, 8, 4, 0.5)',
        'luxury-sm': '0 8px 32px -8px rgba(12, 8, 4, 0.3)',
        'glow-gold': '0 0 40px rgba(201, 169, 110, 0.3)',
        'glow-gold-lg': '0 0 80px rgba(201, 169, 110, 0.2)',
        'inset-subtle': 'inset 0 1px 0 rgba(255,255,255,0.08)',
      },

      backgroundImage: {
        'gradient-champagne': 'linear-gradient(135deg, #c9a96e 0%, #f4d89a 50%, #c9a96e 100%)',
        'gradient-dark': 'linear-gradient(180deg, #0e0b07 0%, #1c170f 100%)',
        'gradient-hero': 'linear-gradient(to bottom, rgba(14,11,7,0) 0%, rgba(14,11,7,0.4) 60%, rgba(14,11,7,0.85) 100%)',
        'gradient-radial-gold': 'radial-gradient(ellipse at center, rgba(201,169,110,0.15) 0%, transparent 70%)',
        'noise': "url('/images/noise.png')",
      },

      aspectRatio: {
        'portrait': '3/4',
        'cinema': '21/9',
        'square': '1/1',
      },

      gridTemplateColumns: {
        'editorial': '1fr 2fr 1fr',
        'asymmetric': '3fr 2fr',
        'sidebar': '280px 1fr',
      },

      zIndex: {
        '60': '60',
        '70': '70',
        '80': '80',
        '90': '90',
        '100': '100',
        'overlay': '200',
        'modal': '300',
        'cursor': '9999',
      },
    },
  },
  plugins: [],
};
