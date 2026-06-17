/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#E8ECF3',
          100: '#C5CDE2',
          200: '#8E9EC2',
          300: '#5A6F9E',
          400: '#2E4978',
          500: '#00184C',
          600: '#00133D',
          700: '#0B1A3D',
          800: '#000A20',
          900: '#000510',
        },
        secondary: {
          50: '#ECFAFF',
          100: '#C5F0FF',
          200: '#7BE0FF',
          300: '#43D3FF',
          400: '#1BA8D4',
          500: '#0A7A9E',
        },
        accent: {
          50: '#FFF8E6',
          100: '#FEEFC3',
          200: '#FBE38A',
          300: '#F9D35A',
          400: '#D4A82A',
          500: '#A67D1A',
        },
      },
      fontFamily: {
        heading: ['Galano Grotesque', 'Inter', 'sans-serif'],
        body: ['Galano Grotesque', 'Inter', 'sans-serif'],
        accent: ['Freestyle Script', 'cursive'],
      },
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
      },
      borderRadius: {
        '2xl': '16px',
        '3xl': '24px',
      },
    },
  },
  plugins: [],
}