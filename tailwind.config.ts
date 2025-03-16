import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './registry/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      keyframes: {
        shimmer: {
          '100%': { transform: 'translateX(100%)' }
        },
        'border-width': {
          '0%, 100%': { 'border-width': '1px' },
          '50%': { 'border-width': '2px' }
        },
        'border-dance': {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' }
        },
        'rainbow-spin': {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' }
        },
        'rainbow-glow': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.6' }
        }
      },
      animation: {
        'border-width': 'border-width 2s ease-in-out infinite',
        'border-dance': 'border-dance 4s ease infinite',
        'rainbow-spin': 'rainbow-spin 8s linear infinite',
        'rainbow-glow': 'rainbow-glow 3s ease-in-out infinite',
        'spin-slow': 'spin 3s linear infinite',
        'spin-slower': 'spin 4s linear infinite',
      }
    },
  },
  plugins: [require('tailwindcss-animate')],
};

export default config;
