/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'brand-orange': '#F97316',
        'brand-red': '#DC2626',
        'brand-dark': '#111111',
        'brand-gray': '#222222',
      },
    },
  },
  plugins: [],
}
