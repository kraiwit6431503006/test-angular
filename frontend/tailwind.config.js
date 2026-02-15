/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class', // สำคัญมาก
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#7C3AED', // purple-600
          light: '#A78BFA',   // purple-400
          dark: '#5B21B6',    // purple-800
        }
      }
    },
  },
  plugins: [],
}
