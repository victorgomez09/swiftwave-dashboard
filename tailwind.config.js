/** @type {import('tailwindcss').Config} */
export default {
  darkMode: false,
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  safelist: ['hidden'],
  daisyui: {
    themes: ['light']
  },
  plugins: [require('@tailwindcss/forms'), require('@tailwindcss/typography'), require("daisyui")]
}
