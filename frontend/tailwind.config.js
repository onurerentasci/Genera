module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#007BFF',
          dark: '#0056B3',
        },
        secondary: {
          DEFAULT: '#6C63FF',
          dark: '#4A47A3',
        },
        background: {
          light: '#F5F5F5',
          dark: '#1A1A2E',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['Roboto Mono', 'monospace'],
      },
    },
  },
  plugins: [],
};