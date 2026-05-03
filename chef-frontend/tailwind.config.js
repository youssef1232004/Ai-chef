/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        accent: "#f1db25", 
      },
      fontFamily: {
        sans: ['Inter', 'Cairo', 'sans-serif'],
      }
    },
  },
  plugins: [],
}