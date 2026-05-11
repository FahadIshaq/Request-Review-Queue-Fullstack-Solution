import type { Config } from "tailwindcss";
import defaultTheme from "tailwindcss/defaultTheme";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // Brand palette derived from the logo navy (#1a2340 ≈ brand-900)
        brand: {
          50: "#f3f5fb",
          100: "#e1e6f3",
          200: "#c2ccea",
          300: "#9aaad9",
          400: "#7587c4",
          500: "#566aaf",
          600: "#42548f",
          700: "#37446e",
          800: "#2a3457",
          900: "#1a2340",
          950: "#0f1428",
        },
        ink: {
          DEFAULT: "#0f172a",
          muted: "#475569",
          subtle: "#94a3b8",
        },
      },
      fontFamily: {
        sans: [
          "var(--font-sans)",
          ...defaultTheme.fontFamily.sans,
        ],
      },
      letterSpacing: {
        "tightish": "-0.011em",
      },
      boxShadow: {
        soft:
          "0 1px 2px 0 rgba(15,23,42,0.04), 0 0 0 1px rgba(15,23,42,0.04)",
        card:
          "0 1px 3px 0 rgba(15,23,42,0.06), 0 1px 2px -1px rgba(15,23,42,0.06)",
        lift:
          "0 10px 30px -12px rgba(15,23,42,0.18), 0 4px 12px -4px rgba(15,23,42,0.08)",
        ring: "0 0 0 1px rgba(15,23,42,0.06)",
      },
      keyframes: {
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(2px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "fade-in": "fade-in 200ms ease-out both",
      },
    },
  },
  plugins: [],
};

export default config;
