/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,js}"],
  theme: {
    extend: {
      colors: {
        "bookmark-dark": "#1a1b1e",
        "bookmark-darker": "#25262b",
        "bookmark-input": "#2c2d33",
        "bookmark-card": "#25262b",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        display: ["Plus Jakarta Sans", "Inter", "system-ui", "sans-serif"],
      },
      spacing: {
        popup: "700px",
      },
    },
  },
  plugins: [],
};
