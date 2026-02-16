/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}", // This ensures it scans all React files
  ],
  theme: {
    extend: {
      // You can add custom colors here later if you want to be fancy
    },
  },
  plugins: [],
}