import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        gold: {
          400: "#C8A847",
          500: "#A8892F",
          600: "#8B6914",
        },
        lol: {
          dark: "#010A13",
          darker: "#030E17",
          panel: "#0A1428",
          border: "#1E3A5F",
          blue: "#0BC4E3",
          gold: "#C8A847",
        },
      },
    },
  },
  plugins: [],
};

export default config;
