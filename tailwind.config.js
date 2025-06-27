/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'sans': ['Poppins', 'system-ui', 'sans-serif'],
      },
      colors: {
        primary: '#299ae4',
        'text-heading': '#1A1A1A',
        'text-body': '#333333',
      },
      fontSize: {
        '6xl': ['3.75rem', { lineHeight: '1.1' }],
      },
    },
  },
  plugins: [],
}