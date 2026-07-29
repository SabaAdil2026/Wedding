import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: '1.5rem',
      screens: { '2xl': '1400px' },
    },
    extend: {
      fontFamily: {
        display: ['var(--font-playfair)', 'serif'],
        sans: ['var(--font-inter)', 'sans-serif'],
      },
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        gold: {
          50: '#fdf9ec',
          100: '#f9edc9',
          200: '#f2d98e',
          300: '#e9c157',
          400: '#e0a92f',
          500: '#c98f1f',
          600: '#a86f18',
          700: '#855218',
          800: '#6d4219',
          900: '#5c3819',
        },
        maroon: {
          50: '#fbebee',
          100: '#f2c9d1',
          200: '#e096a5',
          300: '#c65f76',
          400: '#a13850',
          500: '#7a1b2e',
          600: '#661624',
          700: '#4f111c',
          800: '#3b0a14',
          900: '#28060d',
        },
        ivory: '#FBF8F1',
        charcoal: '#0B0B0C',
        // Event colors
        sangeet: { DEFAULT: '#111113', accent: '#D4AF37' },
        haldi: { DEFAULT: '#C2621B', accent: '#F2A65A' },
        nikah: { DEFAULT: '#F4C6D7', accent: '#D4AF37' },
        reception: { DEFAULT: '#E8D9B5', accent: '#B08D57' },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      boxShadow: {
        gold: '0 0 0 1px rgba(212,175,55,0.35), 0 8px 30px rgba(0,0,0,0.12)',
        goldhover: '0 0 0 1.5px rgba(212,175,55,0.7), 0 12px 40px rgba(0,0,0,0.18)',
      },
      backgroundImage: {
        'gold-gradient': 'linear-gradient(135deg, #3B0A14 0%, #7A1B2E 45%, #D4AF37 100%)',
        'gold-line': 'linear-gradient(90deg, #3B0A14 0%, #D4AF37 100%)',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      animation: {
        shimmer: 'shimmer 2.5s linear infinite',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};

export default config;
