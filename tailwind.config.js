/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'bg': '#1a1a1a',
        'surface': '#2d2d2d',
        'primary': '#4a9eff',
        'success': '#2ecc71',
        'error': '#e74c3c',
        'text-primary': '#ecf0f1',
        'text-muted': '#bdc3c7',
        'accent': '#00bcd4',
        'input-bg': '#3c3c3c',
      },
      boxShadow: {
        'main': '0 10px 15px -3px rgba(0, 0, 0, 0.2), 0 4px 6px -2px rgba(0, 0, 0, 0.15)',
        'modal': '0 25px 50px -12px rgba(0, 0, 0, 0.4)',
      }
    }
  },
  plugins: [],
}