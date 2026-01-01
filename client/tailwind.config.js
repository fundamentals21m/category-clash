/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#6366f1',
        secondary: '#ec4899',
        success: '#22c55e',
        danger: '#ef4444',
        dark: '#1e1e2e',
        darker: '#11111b'
      },
      animation: {
        'pulse-fast': 'pulse 0.5s cubic-bezier(0.4, 0, 0.6, 1) infinite'
      }
    }
  },
  plugins: []
};
