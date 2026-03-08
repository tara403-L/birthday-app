/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        gold: "#F5C518",
        "near-black": "#1A1A1A",
        charcoal: "#2A2A2A",
        "light-gray": "#F4F4F4",
      },
      fontFamily: {
        sans: ["Inter", "DM Sans", "system-ui", "sans-serif"],
      },
      borderRadius: {
        card: "2px",
      },
    },
  },
  plugins: [],
};
