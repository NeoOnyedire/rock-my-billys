/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      screens: {
        xs: "420px",
      },
      colors: {
        jungle: {
          950: "#08130b",
          900: "#0f2415",
          800: "#16351f",
          700: "#1f4a2b",
          600: "#2b6339",
          500: "#3a8049",
          400: "#4f9c5e",
        },
        banana: {
          DEFAULT: "#f4c542",
          light: "#ffe08a",
          dark: "#d9a520",
        },
        mango: "#e8792b",
        blood: {
          DEFAULT: "#c22c22",
          light: "#e8493c",
          dark: "#8f1e17",
        },
      },
      fontFamily: {
        display: ["'Luckiest Guy'", "cursive"],
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(244,197,66,0.15), 0 8px 24px -8px rgba(0,0,0,0.6)",
        "glow-lg": "0 0 40px -8px rgba(244,197,66,0.25), 0 20px 40px -12px rgba(0,0,0,0.7)",
        "banana-glow": "0 0 24px rgba(244,197,66,0.45)",
        card: "0 4px 16px -4px rgba(0,0,0,0.5), 0 1px 0 rgba(255,255,255,0.04) inset",
      },
      backgroundImage: {
        "jungle-radial": "radial-gradient(circle at 20% -10%, rgba(58,128,73,0.35), transparent 45%), radial-gradient(circle at 100% 0%, rgba(232,121,43,0.12), transparent 40%)",
        "banana-gradient": "linear-gradient(135deg, #ffe08a 0%, #f4c542 55%, #d9a520 100%)",
        "blood-gradient": "linear-gradient(135deg, #e8493c 0%, #c22c22 60%, #8f1e17 100%)",
      },
      keyframes: {
        fadeUp: {
          "0%": { opacity: 0, transform: "translateY(8px)" },
          "100%": { opacity: 1, transform: "translateY(0)" },
        },
        floaty: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-4px)" },
        },
        popIn: {
          "0%": { opacity: 0, transform: "scale(0.92)" },
          "100%": { opacity: 1, transform: "scale(1)" },
        },
      },
      animation: {
        fadeUp: "fadeUp 0.35s ease-out both",
        floaty: "floaty 3s ease-in-out infinite",
        popIn: "popIn 0.25s ease-out both",
      },
    },
  },
  plugins: [],
};
