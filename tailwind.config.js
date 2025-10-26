/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0e6ff',
          100: '#d9bfff',
          200: '#b794ff',
          300: '#9469ff',
          400: '#713eff',
          500: '#4d13ff',
          600: '#3d0fd4',
          700: '#2e0ba8',
          800: '#1f077d',
          900: '#0f0352',
          950: '#080129',
        },
        gray: {
          50: '#f9fafb',
          100: '#f3f4f6',
          200: '#e5e7eb',
          300: '#d1d5db',
          400: '#9ca3af',
          500: '#6b7280',
          600: '#4b5563',
          700: '#374151',
          800: '#1f2937',
          900: '#111827',
          950: '#030712',
        },
        purple: {
          400: '#8A2BE2',
          500: '#7C3AED',
          600: '#6A1B9A',
          700: '#581C87',
        }
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'monospace'],
      },
      animation: {
        'float': 'float 3s ease-in-out infinite',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'shimmer': 'shimmer 2s infinite',
        'bounce-slow': 'bounce 3s infinite',
        'spin-slow': 'spin 5s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 5px rgba(138, 43, 226, 0.5)' },
          '50%': { boxShadow: '0 0 20px rgba(138, 43, 226, 0.8), 0 0 30px rgba(138, 43, 226, 0.6)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'cosmic': 'linear-gradient(135deg, #0F0F23 0%, #1A1A2E 50%, #16213E 100%)',
        'gift-gradient': 'linear-gradient(135deg, #8A2BE2 0%, #FF6B6B 100%)',
      },
      boxShadow: {
        'cosmic': '0 0 20px rgba(138, 43, 226, 0.3)',
        'cosmic-lg': '0 0 40px rgba(138, 43, 226, 0.4)',
        'gift': '0 0 30px rgba(255, 107, 107, 0.3)',
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
}
