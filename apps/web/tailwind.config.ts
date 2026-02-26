import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          navy: "#1e3a5f",
          "navy-light": "#2a4f7a",
          teal: "#0d9488",
          "teal-light": "#14b8a6",
        },
        score: {
          green: "#16a34a",
          "green-bg": "#dcfce7",
          yellow: "#ca8a04",
          "yellow-bg": "#fef9c3",
          red: "#dc2626",
          "red-bg": "#fee2e2",
        },
      },
      animation: {
        "fade-slide-up": "fadeSlideUp 0.4s ease-out forwards",
      },
    },
  },
  plugins: [],
};

export default config;
