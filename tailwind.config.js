/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx}",
    "./src/components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Paleta D'Hages Turismo (Azul, Amarelo e tons neutros)
        primary: { // Novo nome para a cor principal (Azul)
          50: "#e8eff7",
          100: "#c2d6eb",
          200: "#99b7d8",
          300: "#6a94bf",
          400: "#4478a8",
          500: "#245f8f",
          600: "#0D4B83", // Azul Principal da Logo
          700: "#0c447a",
          800: "#0a3c6b",
          900: "#09335d",
          950: "#041b34",
        },
        secondary: { // Novo nome para a cor de destaque (Amarelo/Dourado)
          50: "#fffbe6",
          100: "#fff7c1",
          200: "#fff08a",
          300: "#ffe74d",
          400: "#FFC107", // Amarelo de Destaque
          500: "#e6ad00",
          600: "#b38500",
          700: "#805c00",
          800: "#4d3300",
          900: "#1a0b00",
          950: "#0d0600",
        },
        neutral: { // Novo nome para os tons neutros (anteriormente background/graytone)
          50: "#f8f8f8", // Cinza Claro
          100: "#f0f0f0",
          200: "#dedede",
          300: "#c3c3c3",
          400: "#a9a9a9",
          500: "#8f8f8f",
          600: "#737373",
          700: "#595959",
          800: "#3f3f3f",
          900: "#262626", // Ideal para textos
          950: "#151515",
          1000: "#0a0a0a",
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui'],
        serif: ['Playfair Display', 'ui-serif', 'Georgia'],
        title: ['Great Vibes', 'cursive'],
      },
    },
  },
  darkMode: "class",
  plugins: [
    require('tailwind-scrollbar-hide'),
  ],
}