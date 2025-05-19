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
        primary: "#16519f",
        secondary: "#f07e74",
        dark: "#f8dd2e",
        light: "#4fcbe9",
      },
    },
  },
  plugins: [],
};
