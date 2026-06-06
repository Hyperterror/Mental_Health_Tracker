import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        "primary": "#C8B6A6",
        "on-primary": "#FFFFFF",
        "primary-container": "#F1EBE4",
        "on-primary-container": "#4D453E",
        "surface": "#FDFBF9",
        "on-surface": "#2D2926",
        "surface-variant": "#F2EBE3",
        "on-surface-variant": "#857D75",
        "outline": "#D1C7BD",
        "outline-variant": "#E8E2DA",
        "wellness-low": "#E6F4EA",
        "wellness-text": "#1E7E34"
      },
      fontFamily: {
        "headline": ["Public Sans", "sans-serif"],
        "display": ["Public Sans", "sans-serif"],
        "body": ["Inter", "sans-serif"],
        "label": ["Public Sans", "sans-serif"]
      },
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.5rem",
        "xl": "0.75rem",
      },
    },
  },
  plugins: [],
};

export default config;
