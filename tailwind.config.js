/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        heritage: {
          bg: '#FBF9F5',
          card: '#FFFFFF',
          cardMuted: '#F5F2EB',
          text: '#1C1917',
          muted: '#57534E',
          border: '#E7E2D7',
          moss: '#2D5A43',
          mossHover: '#234634',
          mossLight: '#EBF3EE',
          basalt: '#A64B2A',
          basaltHover: '#8C3D21',
          basaltLight: '#FBEFEA',
          gold: '#C6923C',
          goldLight: '#FEF8EC',
        }
      },
      fontFamily: {
        serif: ['var(--font-serif)', 'Merriweather', 'Noto Serif', 'Georgia', 'serif'],
        sans: ['var(--font-sans)', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      borderRadius: {
        'xl': '0.875rem',
        '2xl': '1.25rem',
      },
      boxShadow: {
        'heritage-sm': '0 1px 3px rgba(28, 25, 23, 0.05), 0 1px 2px rgba(28, 25, 23, 0.03)',
        'heritage': '0 4px 20px -2px rgba(45, 90, 67, 0.08), 0 2px 6px -1px rgba(28, 25, 23, 0.04)',
        'heritage-hover': '0 12px 30px -4px rgba(45, 90, 67, 0.14), 0 4px 10px -2px rgba(28, 25, 23, 0.06)',
      }
    },
  },
  plugins: [],
};
