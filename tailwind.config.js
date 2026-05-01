/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class', // <--- SANS ÇA, RIEN NE MARCHERA
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}