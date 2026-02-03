import defaultTheme from "tailwindcss/defaultTheme";

/** @type {import('tailwindcss').Config} */
const config = {
  darkMode: "class",
  content: [
    "./src/**/*.{ts,tsx,js,jsx}",
    "./app/**/*.{ts,tsx,js,jsx}",
    "./components/**/*.{ts,tsx,js,jsx}",
    "./docs/**/*.{md,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          light: "#93C5FD",
          DEFAULT: "#3B82F6",
          dark: "#1E40AF",
        },
      },
    },
    screens: {
      ...defaultTheme.screens,
      sm: "640px",
      md: "768px",
      lg: "1024px",
      xl: "1280px",
    },
  },
};

export default config;
