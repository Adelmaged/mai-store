/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        burgundy: {
          DEFAULT: '#4A2535',
          50: '#FBF7F6',
          100: '#F3E9E8',
          200: '#E6D0CE',
          300: '#CDA39E',
          400: '#A56F65',
          500: '#7A453C',
          600: '#5C322B',
          700: '#4A2535',
          800: '#3A1D29',
          900: '#2E1720',
        },
        rose: {
          DEFAULT: '#D9A7B0',
          50: '#FDF5F6',
          100: '#FAEAEC',
          200: '#F2D0D6',
          300: '#E4AEB8',
          400: '#D9A7B0',
          500: '#C5838F',
          600: '#A9616E',
          700: '#8C4A55',
          800: '#6F3A44',
          900: '#532B34',
        },
        cream: '#FAF6F0',
        surface: '#FFFFFF',
        edge: '#EFE6DC',
        gold: {
          DEFAULT: '#C5A059',
          50: '#FBF8EF',
          100: '#F5ECD2',
          200: '#E9D7A2',
          300: '#D9BE77',
          400: '#C5A059',
          500: '#A8863F',
          600: '#856A30',
          700: '#634F24',
          800: '#42371A',
          900: '#2A2112',
        },
      },
      fontFamily: {
        cairo: ['Cairo', 'sans-serif'],
        playfair: ['"Playfair Display"', 'serif'],
      },
      boxShadow: {
        soft: '0 4px 20px -2px rgba(74, 37, 53, 0.08)',
        card: '0 8px 30px -4px rgba(74, 37, 53, 0.12)',
        lift: '0 16px 40px -8px rgba(74, 37, 53, 0.18)',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-in': {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        'slide-up': {
          '0%': { opacity: '0', transform: 'translateY(40px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'scale-in': {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.4s ease-out',
        'slide-in': 'slide-in 0.35s ease-out',
        'slide-up': 'slide-up 0.5s ease-out',
        'scale-in': 'scale-in 0.3s ease-out',
      },
    },
  },
  plugins: [],
};
