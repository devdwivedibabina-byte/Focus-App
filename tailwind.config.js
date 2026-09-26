/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        paper: '#FAFAF8',
        ink: '#17191D',
        surface: {
          light: '#FFFFFF',
          dark: '#1E2126'
        },
        border: {
          light: '#E7E5DF',
          dark: '#2C3038'
        },
        moss: {
          DEFAULT: '#3B6255',
          light: '#EAF1EC',
          dark: '#4F8571'
        },
        amber: {
          DEFAULT: '#C98A3E',
          light: '#FBF1E3'
        },
        brick: {
          DEFAULT: '#C2554B',
          light: '#FBEAE8'
        },
        slate: {
          DEFAULT: '#6B7280'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Fraunces', 'ui-serif', 'Georgia', 'serif']
      },
      borderRadius: {
        card: '10px'
      },
      boxShadow: {
        card: '0 1px 2px rgba(23, 25, 29, 0.04)'
      }
    }
  },
  plugins: []
}
