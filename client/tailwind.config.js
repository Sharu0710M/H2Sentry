/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          dark: '#0f172a',    // slate-900 (navy/deep blue)
          primary: '#1e293b', // slate-800
          accent: '#0d9488',  // teal-600
          light: '#f8fafc',   // slate-50
        },
        safety: {
          normal: '#16a34a',  // green-600
          caution: '#eab308', // yellow-500
          elevated: '#f97316',// orange-500
          critical: '#dc2626',// red-600
        }
      }
    },
  },
  plugins: [],
}
