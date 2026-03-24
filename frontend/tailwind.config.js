/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        police: {
          blue: '#1e3a8a',
          dark: '#0f172a',
          light: '#3b82f6',
        }
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        sirenPulse: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(239, 68, 68, 0.4)' },
          '50%': { boxShadow: '0 0 22px 6px rgba(239, 68, 68, 0.35)' },
        },
        shieldShimmer: {
          '0%, 100%': { filter: 'brightness(1)' },
          '50%': { filter: 'brightness(1.12)' },
        },
        rippling: {
          '0%': { transform: 'scale(0)', opacity: '0.5' },
          '100%': { transform: 'scale(4)', opacity: '0' },
        },
      },
      animation: {
        fadeIn: 'fadeIn 0.45s ease-out forwards',
        'siren-pulse': 'sirenPulse 2s ease-in-out infinite',
        'shield-shimmer': 'shieldShimmer 3.5s ease-in-out infinite',
        rippling: 'rippling 0.6s ease-out forwards',
      },
    },
  },
  plugins: [],
}