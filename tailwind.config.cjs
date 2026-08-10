module.exports = {
  content: ['./src/**/*.{astro,html,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Deep Pitch & Gold — dark football heritage palette
        pitch: {
          900: '#0a1a10', // deepest / footer
          800: '#0c1f14', // page background
          700: '#14301e', // card surface
          600: '#1b3d28', // insets / hover
        },
        line: {
          DEFAULT: '#2a4a34', // borders
          soft: '#213b2b',
        },
        cream: {
          DEFAULT: '#f4f1e8', // primary text
          muted: '#aebfB2',   // secondary text
          dim: '#7f9587',     // tertiary / timestamps
        },
        gold: {
          DEFAULT: '#d4af37',
          400: '#e6c24d',
          600: '#b8942a',
        },
        grass: { DEFAULT: '#4ade80', 600: '#22c55e' }, // confirmed
        rumor: { DEFAULT: '#fbbf24' },                 // rumour
        info:  { DEFAULT: '#7dd3fc', 600: '#38bdf8' }, // news / links / PL
      },
      fontFamily: {
        display: ['Newsreader', 'Georgia', 'serif'],
      },
    },
  },
  plugins: [],
};
