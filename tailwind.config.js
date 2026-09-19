/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Nunito', 'sans-serif'],
        display: ['Fredoka', 'Nunito', 'sans-serif'],
      },
      colors: {
        // Theme flip: every `white` utility (text-white, bg-white/5, border-white/10…)
        // resolves to the warm "grape" ink, so existing pages read dark-on-cream
        // without editing each class. Use `snow` for a real white (text on colored
        // buttons, solid cards).
        white: 'rgb(var(--ink) / <alpha-value>)',
        snow: '#FFFFFF',
        brand: {
          base: '#FFF7E8',
          surface: '#FFFFFF',
          card: '#FFFFFF',
          elevated: '#FFFFFF',
          input: '#FFF1D6',
          primary: '#FF6B35',
          'primary-hover': '#F0561E',
          accent: '#FFC93C',
          'purple-deep': '#7C4DFF',
          'purple-mid': '#B39DFF',
          sky: '#4CC9F0',
          mint: '#2FD6A0',
          pink: '#FF6FA8',
        },
      },
      borderRadius: {
        xl: '1.1rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
      },
      boxShadow: {
        'primary-glow': '0 6px 0 0 #D9491A',
        surface: '0 4px 0 0 rgba(74,44,120,0.10)',
      },
    },
  },
  plugins: [],
}
