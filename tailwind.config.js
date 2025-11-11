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
        'surface': '#141414',
        'primary': '#d6d6d6',
        'primary-hover': '#454743',
        'secondary': '#5a6872',
        'secondary-hover': '#49555c',
        'main-action': '#2a3913',
        'main-action-hover': '#3b511c',
        'success': '#1f8b4d',
        'error': '#bb2717',
        'error-hover': '#a12113',
        'entry-action': '#2b380e',
        'entry-action-hover': '#3d5014',
        'tfa-action': '#3c511c',
        'tfa-action-hover': '#3d5014',
        'export-action': '#005764',
        'export-action-hover': '#004650',
        'generate-action': '#005764',
        'generate-action-hover': '#004650',
        'text-primary': '#ecf0f1',
        'text-muted': '#bdc3c7',
        'accent': '#005663',
        'accent-hover': '#004650',
        'security-note': '#661400',
        'security-note-border': '#5f0802',
        'tfa-add': '#3a5222',
        'tfa-add-hover': '#3b511c',
        'tfa-add-text': '#f0f0f0',
        'tfa-secondary': '#005562',
        'tfa-secondary-hover': '#00454f',
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