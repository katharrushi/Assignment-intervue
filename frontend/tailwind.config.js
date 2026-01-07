// tailwind.config.js
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#7765DA",    // Figma purple
        secondary: "#5767D0",  // Figma blue
        accent: "#4F0DCE",     // Figma bold accent
        light: "#F2F2F2",      // Figma light background
        dark: "#373737",       // Figma dark text/bg
        muted: "#6E6E6E",      // Figma gray
      },
    },
  },
  plugins: [],
};
