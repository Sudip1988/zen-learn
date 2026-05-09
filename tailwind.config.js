/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        zen: {
          // Deep dark base — VS Code Zen Mode inspired
          void: "#080c14",      // deepest background
          bg: "#080c14",        // alias for backward compat
          surface: "#0f1827",   // card / panel surfaces
          elevated: "#141e2e",  // elevated modals / drawers
          border: "#1a2738",    // subtle separator
          // Violet accent
          accent: "#7c3aed",
          "accent-hover": "#6d28d9",
          "accent-dim": "rgba(124,58,237,0.15)",
          // Typography
          text: "#e2e8f0",
          "text-secondary": "#8892a4",
          muted: "#4a5568",
        },
      },
      boxShadow: {
        "glow-accent": "0 0 0 3px rgba(124,58,237,0.18)",
        "glow-sm": "0 0 20px rgba(124,58,237,0.12)",
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "slide-up": "slideUp 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
        "fade-in": "fadeIn 0.2s ease-out",
        "cursor-blink": "cursorBlink 1.1s step-end infinite",
        "dot-bounce": "dotBounce 1.4s ease-in-out infinite",
      },
      keyframes: {
        slideUp: {
          "0%": { transform: "translateY(100%)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        cursorBlink: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0" },
        },
        dotBounce: {
          "0%, 80%, 100%": { transform: "translateY(0)", opacity: "0.4" },
          "40%": { transform: "translateY(-6px)", opacity: "1" },
        },
      },
      fontFamily: {
        mono: ["'JetBrains Mono'", "ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
      },
    },
  },
  plugins: [],
};
