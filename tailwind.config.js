/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,jsx,ts,tsx,md,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Brand colors
        primary: {
          DEFAULT: '#4f46e5', // Indigo - primary actions
          hover: '#4338ca',
          light: '#818cf8',
        },
        secondary: {
          DEFAULT: '#14b8a6', // Teal - secondary actions
          hover: '#0d9488',
          light: '#5eead4',
        },
        accent: {
          DEFAULT: '#f472b6', // Pink - accents
          hover: '#ec4899',
          light: '#f9a8d4',
        },
        
        // Semantic colors
        success: {
          DEFAULT: '#10b981', // Green
          light: '#86efac',
        },
        warning: {
          DEFAULT: '#f59e0b', // Amber
          light: '#fbbf24',
        },
        danger: {
          DEFAULT: '#ef4444', // Red
          hover: '#dc2626',
          light: '#fca5a5',
        },
        
        // Chart/Visualization colors
        chart: {
          1: '#4f46e5', // Indigo
          2: '#14b8a6', // Teal
          3: '#f59e0b', // Amber
          4: '#ef4444', // Red
          5: '#10b981', // Green
          6: '#f472b6', // Pink
          7: '#8b5cf6', // Purple
          8: '#06b6d4', // Cyan
        },
        
        // Neutral colors (using zinc scale for consistency)
        background: {
          DEFAULT: '#18181b', // zinc-900
          card: '#27272a',    // zinc-800
          hover: '#3f3f46',   // zinc-700
          input: '#27272a',   // zinc-800
        },
        foreground: {
          DEFAULT: '#fafafa', // zinc-50
          muted: '#a1a1aa',   // zinc-400
          subtle: '#71717a',  // zinc-500
        },
        border: {
          DEFAULT: '#3f3f46', // zinc-700
          light: '#52525b',   // zinc-600
        },
      },
      backgroundColor: {
        'panel': '#27272a',
        'panel-hover': '#3f3f46',
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
};
