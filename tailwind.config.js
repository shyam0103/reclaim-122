/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        paper: { DEFAULT: '#FAFAF8', dark: '#121214' },
        ink: { DEFAULT: '#1C1C1E', dark: '#F2F2F0' },
        muted: { DEFAULT: '#8E8E93', dark: '#9A9AA0' },
        surface: { DEFAULT: '#FFFFFF', dark: '#1C1C1F' },
        line: { DEFAULT: '#E8E7E3', dark: '#2C2C2E' },
        status: {
          green: '#3F9A6E',
          blue: '#4A7FE0',
          red: '#C4573F',
          yellow: '#D9A441',
          none: '#D5D3CE'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif']
      },
      borderRadius: {
        card: '20px'
      }
    }
  },
  plugins: []
}
