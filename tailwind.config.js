module.exports = {
  purge: [],
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {
      fontFamily: {
        primary : "Ubuntu",
        secondary : "Overpass",
      },
      colors: {
        primary: {
          100: "hsl(356, 100%, 66%)",
          200: "hsl(355, 100%, 74%)",
          300: "hsl(208, 49%, 24%)",
        },
        secondary: {
          100: "hsl(240, 2%, 79%)",
          200: "hsl(207, 13%, 34%)",
          300: "hsl(240, 10%, 16%)",
        }
      },
      backgroundImage : {
        main: "linear-gradient(to bottom, #ff8f70, #ff7e66, #ff6c5e, #ff5758, #ff3d54);",
        sub: "linear-gradient(to bottom, #2c2d3f, #313248, #353751, #3a3c5b, #3f4164);",
        intro : "url(/images/bg-pattern-intro.svg)",
        circles: "url(/images/bg-pattern-circles.svg)",
      }
    },
  },
  variants: {
    extend: {},
  },
  plugins: [],
}
