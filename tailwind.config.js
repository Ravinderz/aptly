/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./App.tsx",
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: "#fed0b5",
        "primary-dark": "#d59f7e",
        secondary: "#f8b3a0",
        neutral: "#f89b7c",
        accent_primary: "#f57a38",
        accent_secondary: "#f58c5b",
      },
    },
  },
  plugins: [],
};
