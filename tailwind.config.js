/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        sh: {
          yellow: '#F5D100', // Speedhome Signature Yellow
          dark: '#2A2B2A',   // Speedhome Dark Text
          gray: '#F7F7F7',   // Light gray background
        }
      },
      fontFamily: {
        sans: ['var(--font-poppins)', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
