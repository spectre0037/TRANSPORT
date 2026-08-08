/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        clay: {
          bg: 'var(--clay-bg)',
          surface: 'var(--clay-surface)',
          'surface-2': 'var(--clay-surface-2)',
          primary: 'var(--clay-primary)',
          'primary-light': 'var(--clay-primary-light)',
          accent: 'var(--clay-accent)',
          'accent-dark': 'var(--clay-accent-dark)',
          success: 'var(--clay-success)',
          warning: 'var(--clay-warning)',
          danger: 'var(--clay-danger)',
          text: 'var(--clay-text)',
          'text-muted': 'var(--clay-text-muted)',
          border: 'var(--clay-border)',
          male: 'var(--clay-male)',
          female: 'var(--clay-female)',
        },
      },
      fontFamily: {
        display: ['Poppins', 'Nunito', 'sans-serif'],
        sans: ['Poppins', 'Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        clay: '6px 6px 14px rgba(0, 0, 0, 0.06), -6px -6px 14px rgba(255, 255, 255, 0.7)',
        'clay-lg': '8px 8px 20px rgba(0, 0, 0, 0.08), -8px -8px 20px rgba(255, 255, 255, 0.8)',
        'clay-inset': 'inset 4px 4px 8px rgba(0, 0, 0, 0.04), inset -4px -4px 8px rgba(255, 255, 255, 0.6)',
      },
      borderRadius: {
        clay: '16px',
        'clay-lg': '24px',
      },
    },
  },
  plugins: [],
};
