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
          black: "#0A0A0A",
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
        card: "0.75rem",
      },
    },
  },
  plugins: [],
};

export default config;
