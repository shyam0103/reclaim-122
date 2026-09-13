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
        },
        // Per-goal accent identity colors — independent of daily status colors.
        // Inspired by how Apple Health gives every category its own icon color.
        goal: {
          discipline: '#8A7CF0',
          fitness: '#F2994A',
          pm: '#4A90E2',
          python: '#2BB673'
        },
        accent: {
          gold: '#E0B24A'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif']
      },
      borderRadius: {
        card: '22px',
        chip: '14px'
      },
      keyframes: {
        'fade-slide-up': {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        },
        'pop-in': {
          '0%': { opacity: '0', transform: 'scale(0.92)' },
          '100%': { opacity: '1', transform: 'scale(1)' }
        },
        'flame-pulse': {
          '0%, 100%': { transform: 'scale(1)', opacity: '1' },
          '50%': { transform: 'scale(1.12)', opacity: '0.85' }
        },
        shimmer: {
          '0%': { backgroundPosition: '-400px 0' },
          '100%': { backgroundPosition: '400px 0' }
        }
      },
      animation: {
        'fade-slide-up': 'fade-slide-up 0.5s cubic-bezier(0.16,1,0.3,1) both',
        'pop-in': 'pop-in 0.4s cubic-bezier(0.34,1.56,0.64,1) both',
        'flame-pulse': 'flame-pulse 2.2s ease-in-out infinite',
        shimmer: 'shimmer 1.6s linear infinite'
      },
      boxShadow: {
        soft: '0 1px 2px rgba(0,0,0,0.04), 0 8px 24px -12px rgba(0,0,0,0.12)',
        'soft-dark': '0 1px 2px rgba(0,0,0,0.3), 0 8px 24px -12px rgba(0,0,0,0.6)'
      }
    }
  },
  plugins: []
}
