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
        duocal: {
          void: "#090D16",
          slate: "#0F172A",
          glow: "#2563EB",
          accent: "#3B82F6",
          muted: "#1E293B",
          border: "#1E3A5F",
        },
      },
      boxShadow: {
        glow: "0 0 20px rgba(37, 99, 235, 0.35)",
        "glow-lg": "0 0 40px rgba(59, 130, 246, 0.4)",
        card: "0 4px 24px rgba(0, 0, 0, 0.5), 0 0 1px rgba(59, 130, 246, 0.3)",
      },
      animation: {
        float: "float 6s ease-in-out infinite",
        pulseGlow: "pulseGlow 2s ease-in-out infinite",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-8px)" },
        },
        pulseGlow: {
          "0%, 100%": { boxShadow: "0 0 20px rgba(37, 99, 235, 0.3)" },
          "50%": { boxShadow: "0 0 40px rgba(59, 130, 246, 0.6)" },
        },
      },
      backgroundImage: {
        "grid-pattern":
          "linear-gradient(rgba(37,99,235,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(37,99,235,0.05) 1px, transparent 1px)",
      },
    },
  },
  plugins: [],
};

export default config;
