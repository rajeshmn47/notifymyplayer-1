/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
      "./src/**/*.{js,ts,jsx,tsx}",
      "./components/**/*.{js,ts,jsx,tsx}",
      "./src/components/**/*.{js,ts,jsx,tsx}", // Example for a nested structure
      "./src/pages/**/*.{js,ts,jsx,tsx}",
      "./src/* .*{js,ts,jsx,tsx}",
    ],
    darkMode: "class", 
    theme: {
      extend: {
        colors: {
          border: "hsl(var(--border))",
          input: "hsl(var(--input))",
          ring: "hsl(var(--ring))",
          background: "red",
          foreground: "green",
          primary: "blue",
          "primary-foreground": "red",
        },
        borderRadius: {
          lg: "var(--radius)",
        },
        fontFamily: {
          sans: ["var(--font-sans)", ...fontFamily.sans],
        },
      },
    },
    plugins: [require('@tailwindcss/forms')],
  }
  