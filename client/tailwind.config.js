export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: '#0284c7',
        ink: '#0f172a',
        gold: '#f59e0b'
      },
      boxShadow: {
        soft: '0 16px 45px rgba(15, 23, 42, 0.12)',
        glow: '0 20px 60px rgba(2, 132, 199, 0.22)'
      }
    }
  },
  plugins: []
};
