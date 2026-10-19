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
          offwhite: "#FAF9F5",
          yellow: "#EFB305",   // primary accent
          "yellow-dark": "#8A6400",
          black: "#0D0D0D", // Deep Navy — sampled directly from the generated hero images for an exact match; key name kept as "black" so every existing class updates automatically
          gray: "#5C5C5C",
          "gray-light": "#E4E4E0",
          success: "#1E5C2B",
          error: "#B3261E",
          amber: "#F59E0B", // status: warning/pending
        },
      },
      fontFamily: {
        sans: ["var(--font-space-grotesk)", "system-ui", "sans-serif"],
        mono: ["var(--font-space-mono)", "ui-monospace", "monospace"],
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
