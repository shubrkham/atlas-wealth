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
        background: "#0B1020",
        surface: "#131A2E",
        card: "#182135",
        "text-primary": "#F4F6F9",
        "text-secondary": "#A3ADC2",
        accent: "#D4AF37",
        positive: "#10B981",
        negative: "#EF4444",
      },
    },
  },
  plugins: [],
};

export default config;
