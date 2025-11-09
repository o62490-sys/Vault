/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'bg': '#000000',
        'surface': '#0f0f0f',
        'primary': '#2b380e',
        'primary-dark': '#3d5014',
        'success': '#1f8b4d',
        'error': '#bb2717',
        'text-primary': '#ecf0f1',
        'text-muted': '#bdc3c7',
        'accent': '#005764',
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