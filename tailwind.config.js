/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // OLED Dark Theme Colors
        'theme-bg': '#000000',        // Pure black background
        'theme-surface': '#1a1a1a',   // Very dark gray surfaces
        'theme-primary': '#ffffff',   // White for primary buttons
        'theme-secondary': '#2a2a2a', // Dark gray for secondary
        'theme-success': '#4ade80',   // Light green
        'theme-error': '#ef4444',     // Light red
        'theme-text': '#ffffff',      // White text
        'theme-text-muted': '#9ca3af', // Light gray text
        'theme-accent': '#60a5fa',    // Light blue accents
        'theme-input': '#2a2a2a',     // Dark input backgrounds
        'theme-border': '#404040',    // Border color
      },
      boxShadow: {
        'main': '0 10px 15px -3px rgba(0, 0, 0, 0.3), 0 4px 6px -2px rgba(0, 0, 0, 0.2)',
        'modal': '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
      }
    }
  },
  plugins: [],
}
