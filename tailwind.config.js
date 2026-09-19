/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Lexend', 'sans-serif'],
        display: ['Syne', 'sans-serif'],
      },
      colors: {
        // Mirrors constants/theme.ts in haptic-learn-app-main — panel and
        // app share one palette instead of drifting into their own hues.
        brand: {
          base: '#0C0F0F',
          surface: '#121414',
          card: '#1E2020',
          elevated: '#282A2B',
          input: '#333535',
          primary: '#FF6B35',
          'primary-hover': '#e85c28',
          accent: '#EDC157',
          'purple-deep': '#25113E',
          'purple-mid': '#3B2754',
        },
      },
      boxShadow: {
        'primary-glow': '0 4px 20px rgba(255, 107, 53, 0.35)',
        'surface': '0 1px 3px rgba(0,0,0,0.4)',
      },
    },
  },
  plugins: [],
}
