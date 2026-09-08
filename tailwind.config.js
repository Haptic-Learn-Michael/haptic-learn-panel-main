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
        brand: {
          bg: '#1A0533',
          surface: '#22063F',
          elevated: '#2C0B50',
          sidebar: '#130328',
          primary: '#FF6B35',
          'primary-hover': '#e85c28',
          secondary: '#FFD166',
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
