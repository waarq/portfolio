import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      fontSize: {
        md: ["1rem", { lineHeight: "1.5rem" }],
      },
      colors: {
        paper: {
          DEFAULT: "#F7F4EE",
          card: "#FCFBF9",
        },
        ink: {
          DEFAULT: "#1B1B1B",
          soft: "#66635E",
        },
        accent: {
          terracotta: "#B76E56",
          olive: "#70755B",
          dusty: "#7B92A6",
        },
        dark: {
          bg: "#111111",
          card: "#171717",
          text: "#F2EFE9",
          soft: "#9A968E",
        },
      },
      fontFamily: {
        display: ["var(--font-geist-sans)", "system-ui", "sans-serif"],
        body: ["var(--font-geist-sans)", "system-ui", "sans-serif"],
        note: ["\"Instrument Serif\"", "serif"],
        serifhead: ["Cormorant", "serif"],
      },
      letterSpacing: {
        tightest2: "-0.045em",
        widest2: "0.28em",
      },
      transitionTimingFunction: {
        expensive: "cubic-bezier(0.16, 1, 0.3, 1)",
      },
      keyframes: {
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(18px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        driftCat: {
          "0%": { transform: "translateX(-40px)", opacity: "0" },
          "10%": { opacity: "1" },
          "90%": { opacity: "1" },
          "100%": { transform: "translateX(calc(100vw + 40px))", opacity: "0" },
        },
      },
      animation: {
        fadeUp: "fadeUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) both",
        driftCat: "driftCat 9s linear forwards",
      },
    },
  },
  plugins: [],
};

export default config;
