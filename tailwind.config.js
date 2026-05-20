/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,ts,jsx,tsx}', './components/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Georgia', 'serif'],
      },
      colors: {
        paper: '#faf9f6',
        ink: '#1a1a1a',
        border: '#e0ddd4',
        saffron: { DEFAULT: '#d4521e', light: '#fdf1ec', mid: '#f08060' },
        jade:    { DEFAULT: '#1a7a5a', light: '#edf7f3', mid: '#4db38a' },
        csr:     { indigo: '#3d3796', amber: '#a06010', violet: '#6b3fa0', rose: '#b03060', teal: '#0e7490' },
      },
    },
  },
  plugins: [],
}
