/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        jungle: {
          950: "#0b1a0f",
          900: "#0f2415",
          800: "#16351f",
          700: "#1f4a2b",
          600: "#2b6339",
          500: "#3a8049",
        },
        banana: "#f4c542",
        mango: "#e8792b",
        blood: "#b3231c",
      },
      fontFamily: {
        display: ["'Luckiest Guy'", "cursive"],
      },
    },
  },
  plugins: [],
};
