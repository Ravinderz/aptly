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
        // Indigo color palette system
        primary: {
          DEFAULT: "#6366f1", // Primary Indigo
          light: "#818cf8",   // Interactive states (indigo-400)
          dark: "#4f46e5",    // Headers and emphasis (indigo-600)
        },
        secondary: {
          DEFAULT: "#4CAF50", // India Green (success, prosperity)
          light: "#81C784",
          dark: "#2E7D32",
        },
        success: {
          DEFAULT: "#4CAF50", // Success Green (same as secondary for consistency)
          light: "#81C784",
          dark: "#2E7D32",
        },
        warning: "#FF9800",   // Warning Amber
        error: "#D32F2F",     // Error Red
        
        // Neutral colors (professional foundation)
        background: "#FAFAFA", // Primary app background
        surface: "#FFFFFF",    // Card backgrounds
        "text-primary": "#212121",   // Main content text
        "text-secondary": "#757575", // Supporting text
        divider: "#E0E0E0",          // Separators and borders
        "border-color": "#E0E0E0",
        
        // Legacy support (keeping existing colors for compatibility)
        "primary-dark": "#d59f7e",
        neutral: "#f89b7c",
        accent_primary: "#22B07D",
        accent_secondary: "#f58c5b",
        alert: "#DF3F40",
      },
      fontFamily: {
        inter: ['Inter', 'system-ui', 'sans-serif'],
        'noto-sans': ['Noto Sans', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'display-large': ['32px', { lineHeight: '40px', fontWeight: '700' }],
        'display-medium': ['28px', { lineHeight: '36px', fontWeight: '700' }],
        'display-small': ['24px', { lineHeight: '32px', fontWeight: '600' }],
        'headline-large': ['20px', { lineHeight: '28px', fontWeight: '600' }],
        'headline-medium': ['18px', { lineHeight: '24px', fontWeight: '600' }],
        'body-large': ['16px', { lineHeight: '24px', fontWeight: '400' }],
        'body-medium': ['14px', { lineHeight: '20px', fontWeight: '400' }],
        'label-large': ['12px', { lineHeight: '16px', fontWeight: '500' }],
      },
      spacing: {
        '18': '4.5rem', // 72px
        '88': '22rem',  // 352px
      },
    },
  },
  plugins: [],
};
