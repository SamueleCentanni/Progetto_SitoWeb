// tailwind.config.js
import daisyui from 'daisyui';

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // enables manual dark mode toggling via class
  theme: {
    extend: {
      colors: {
        background: '#111827',        // dark background (gray-900)
        primary: '#F9FAFB',           // light text (gray-50)
        secondary: '#D1D5DB',         // soft text (gray-300)
        textLight: '#9CA3AF',         // muted text (gray-400)
        textMuted: '#6B7280',         // even more muted (gray-500)
        gradientTextStart: '#6366F1', // indigo-500
        gradientTextEnd: '#A78BFA',   // purple-400
      },
      backgroundImage: {
        btngradient_primary_inverted: 'linear-gradient(to top left, #6366f1, #a78bfa)', // existing
        btngradient_primary: 'linear-gradient(to bottom right, #6366f1, #a78bfa)',       // existing

        btngradient_secondary: 'linear-gradient(to top left, #581c87, #c4b5fd)',         // existing

        // New gradient palette suggestions:
        bg_gradient_dark_to_light: 'linear-gradient(to bottom right, #111827, #6366F1)',   // from background to gradientTextStart
        bg_gradient_purple_blue: 'linear-gradient(135deg, #581c87, #6366F1, #A78BFA)',    // dark purple to indigo to light purple
        bg_gradient_subtle: 'linear-gradient(90deg, #111827, #1f2937)',                    // subtle dark shades (background + gray-800)
        bg_gradient_text_focus: 'linear-gradient(90deg, #6366F1, #A78BFA)',               // existing text gradient

        // Smooth pastel-ish background:
        bg_gradient_pastel: 'linear-gradient(135deg, #D1D5DB, #A78BFA)',                   // secondary to gradientTextEnd
        text_gradient: 'linear-gradient(90deg, #6366f1, #a78bfa)',

      },

    },
  },
  plugins: [daisyui],
  daisyui: {
    themes: ['dark'], // or customize further with your own theme object
  },
};