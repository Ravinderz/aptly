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
        primary: "#6366f1",
        "primary-dark": "#d59f7e",
        secondary: "#F7F9FB",
        neutral: "#f89b7c",
        accent_primary: "#22B07D",
        accent_secondary: "#f58c5b",
        "border-color": "#E3E6EA",
      },
    },
  },
  plugins: [],
};
