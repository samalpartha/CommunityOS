/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        heading: ['Russo One', 'sans-serif'],
        body: ['Chakra Petch', 'sans-serif'],
        sans: ['Chakra Petch', 'sans-serif'],
      },
      colors: {
        primary: '#E11D48',
        secondary: '#FB7185',
        cta: '#2563EB',
        success: '#10B981',
        warning: '#F59E0B',
        error: '#DC2626',
      },
      boxShadow: {
        'sm': '0 1px 2px rgba(0, 0, 0, 0.05)',
        'md': '0 4px 6px rgba(0, 0, 0, 0.1)',
        'lg': '0 10px 15px rgba(0, 0, 0, 0.1)',
        'xl': '0 20px 25px rgba(0, 0, 0, 0.15)',
      },
    },
  },
  plugins: [],
}
