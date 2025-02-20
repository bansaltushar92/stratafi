import type { Config } from "tailwindcss";
import plugin from 'tailwindcss/plugin';
import type { PluginAPI } from 'tailwindcss/types/config';

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
        },
        secondary: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
        },
      },
      boxShadow: {
        'card': '0 2px 4px rgba(0,0,0,0.05), 0 1px 2px rgba(0,0,0,0.1)',
        'card-hover': '0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)',
        'button': '0 4px 6px -1px rgba(14, 165, 233, 0.2), 0 2px 4px -1px rgba(14, 165, 233, 0.1)',
      },
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
      },
      gridTemplateColumns: {
        'cards': 'repeat(auto-fill, minmax(320px, 1fr))',
      },
      animation: {
        'fade-in': 'fadeIn 0.2s ease-in-out',
        'slide-up': 'slideUp 0.2s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [
    plugin(function({ addUtilities }: PluginAPI) {
      addUtilities({
        '.transition-smooth': {
          'transition': 'all 0.2s ease-in-out',
        },
        '.gradient-primary': {
          'background': 'linear-gradient(135deg, #0ea5e9, #0284c7)',
        },
        '.gradient-hover': {
          'background': 'linear-gradient(135deg, #0284c7, #0369a1)',
        },
        '.card-grid': {
          'display': 'grid',
          'grid-template-columns': 'repeat(auto-fill, minmax(320px, 1fr))',
          'gap': '1.5rem',
          'padding': '1.5rem',
        },
        '.wallet-button': {
          '& .wallet-adapter-button': {
            'background': 'linear-gradient(to right, var(--tw-gradient-from) 0%, var(--tw-gradient-to) 100%)',
            '--tw-gradient-from': '#6366f1',
            '--tw-gradient-to': '#9333ea',
            'padding': '1rem 2.5rem',
            'font-size': '1.25rem',
            'border-radius': '0.5rem',
            'height': 'auto',
            'transition': 'all 0.2s ease-in-out',
            '&:hover': {
              '--tw-gradient-from': '#4f46e5',
              '--tw-gradient-to': '#7e22ce',
              'background': 'linear-gradient(to right, var(--tw-gradient-from) 0%, var(--tw-gradient-to) 100%)',
            },
            '&:not([disabled])': {
              'background': 'linear-gradient(to right, var(--tw-gradient-from) 0%, var(--tw-gradient-to) 100%)',
            }
          }
        },
      })
    }),
  ],
} satisfies Config;