module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx,vue}"], // Paths to all of your templates
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {
      fontFamily: {
        khmer: ["Battambang", "Khmer OS Battambang", "sans-serif"],
      },
    },
  },
  variants: {
    extend: {
      width: ["responsive", "hover", "focus"],
    },
  },
  plugins: [],
};
