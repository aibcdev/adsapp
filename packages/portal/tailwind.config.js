/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          emerald: "#10B981",
          dark: "#09090b",
        },
        aibc: {
          ink: "#fafafa",
          muted: "#a1a1aa",
          border: "#27272a",
          accent: "#10B981",
          card: "#18181b",
          surface: "#09090b",
        },
      },
      fontFamily: {
        sans: ['"Inter"', "system-ui", "sans-serif"],
        display: ['"Instrument Serif"', "serif"],
        serif: ['"Instrument Serif"', "serif"],
        mono: ['"JetBrains Mono"', "monospace"],
      },
      animation: {
        "float-slow": "float 6s ease-in-out infinite",
        "float-medium": "float 5s ease-in-out infinite",
        "float-fast": "float 4s ease-in-out infinite",
        "float-delayed": "float 7s ease-in-out infinite 1s",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-20px)" },
        },
        fadeInUp: {
          from: { opacity: "0", transform: "translateY(20px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};
