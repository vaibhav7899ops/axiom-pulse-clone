import type { Config } from "tailwindcss"

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "#0c0e12",
        panel: "#12151c",
        ink: "#e6eaf0",
        sub: "#9aa4b2",
        up: "#34d399",
        down: "#f87171",
        accent: "#5b86ff"
      },
      boxShadow: {
        "soft": "0 1px 1px rgba(0,0,0,0.1), 0 6px 12px rgba(0,0,0,0.25)"
      },
      keyframes: {
        shimmer: {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(100%)" }
        }
      },
      animation: {
        shimmer: "shimmer 1.2s ease-in-out infinite"
      }
    }
  },
  darkMode: "class",
  plugins: [],
}
export default config
