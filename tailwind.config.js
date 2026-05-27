/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        genea: {
          navy: '#0A2F6B',
          blue: '#1565C0',
          bright: '#2196F3',
          light: '#E3F2FD',
        }
      }
    }
  },
  plugins: [],
}

