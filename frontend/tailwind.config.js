/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#faf9f7',
          100: '#f5f3f0',
          200: '#ebe6e0',
          300: '#ddd5cc',
          400: '#cbbfb0',
          500: '#b8a894',
          600: '#a6947c',
          700: '#8a7a68',
          800: '#644F45', // Main brand color
          900: '#4a3a32',
        },
        secondary: {
          50: '#ffffff',
          100: '#fafbfc',
          200: '#f5f6f7',
          300: '#e8eaed',
          400: '#dadce0',
          500: '#bdc1c6',
          600: '#9aa0a6',
          700: '#80868b',
          800: '#644F45',
          900: '#4a3a32',
        },
        accent: {
          50: '#faf9f7',
          100: '#f5f3f0',
          200: '#ebe6e0',
          300: '#ddd5cc',
          400: '#cbbfb0',
          500: '#b8a894',
          600: '#a6947c',
          700: '#8a7a68',
          800: '#644F45',
          900: '#4a3a32',
        },
        neutral: {
          50: '#ffffff',
          100: '#fafafa',
          200: '#f5f5f5',
          300: '#e5e5e5',
          400: '#d4d4d4',
          500: '#a3a3a3',
          600: '#737373',
          700: '#525252',
          800: '#404040',
          900: '#262626',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'bounce-slow': 'bounce 2s infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}