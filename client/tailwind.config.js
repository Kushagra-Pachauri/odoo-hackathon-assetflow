/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Space Grotesk"', 'sans-serif'],
        sans: ['"IBM Plex Sans"', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'monospace'],
      },
      colors: {
        ink: '#14243B',
        paper: '#F1F2ED',
        line: '#D8D9D2',
        accent: '#1E7F91',
        status: {
          available: '#3F7D45',
          active: '#1E7F91',
          maintenance: '#B8720E',
          alert: '#A8321F',
          idle: '#8D97A6',
        },
      },
      borderRadius: {
        md: '6px',
      },
    },
  },
  plugins: [],
};