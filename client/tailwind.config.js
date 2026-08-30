/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        wireframe: {
          bg: '#CECED2',
          card: '#E2E2E6',
          lilac: '#E5B6F2',
          lilacHover: '#DB9EED',
          lilacLight: '#F3DBFB',
          lilacDark: '#C775E6',
          capsule: '#4D4D52',
          capsuleLight: '#626268',
          text: '#222226',
        }
      },
      animation: {
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        }
      }
    },
  },
  plugins: [],
}
