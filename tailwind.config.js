/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Noctis Obscuro inspired colors
        noctis: {
          bg: '#1b1a1c',
          surface: '#252329',
          border: '#363440',
          text: '#e4e4e7',
          muted: '#9d9cab',
          accent: '#7b68ee',
          accent2: '#16a085',
          accent3: '#f39c12',
          success: '#2ecc71',
          warning: '#e67e22',
          error: '#e74c3c',
          blue: '#3498db',
          purple: '#9b59b6',
          pink: '#e91e63',
          cyan: '#1abc9c',
          orange: '#ff6b35',
        }
      },
    },
  },
  corePlugins: {
    preflight: false,
  },
  plugins: [],
}
