import type { Config } from "tailwindcss";

// Docufast brand palette: white-dominant, yellow + black as accents
const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          white: "#FFFFFF",
          offwhite: "#FAFAF9",
          yellow: "#EAB308",   // primary accent
          "yellow-dark": "#CA8A04",
          black: "#013B65", // Deep Navy — sampled directly from the generated hero images for an exact match; key name kept as "black" so every existing class updates automatically
          gray: "#6B7280",
          "gray-light": "#E5E7EB",
          success: "#16A34A",
          error: "#DC2626",
          amber: "#F59E0B", // status: warning/pending
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      borderRadius: {
        card: "8px",
        input: "4px",
        block: "0px",
      },
    },
  },
  plugins: [],
};

export default config;
