/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#0081D6',
        'text-heading': '#1A1A1A',
        'text-body': '#333333',
      },
    },
  },
  plugins: [],
}