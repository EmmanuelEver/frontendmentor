module.exports = {
  purge: [],
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {
      fontFamily : {
        primary: "Open sans",
        secondary: "Poppins"
      },
      colors: {
        primary: "rgb(255, 82, 191)",
        secondary: {
          100: "rgb(235, 251, 255)",
          200: "rgb(0, 37, 46)",
          300: "rgb(128, 141, 153)",
        },
      },
      backgroundImage:{
        hero: "url(./images/bg-hero-desktop.svg)",
        "hero-mobile":"url(./images/bg-hero-mobile.svg)",
      }
    },
  },
  variants: {
    extend: {},
  },
  plugins: [],
}
