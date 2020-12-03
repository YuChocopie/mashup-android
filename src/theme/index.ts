import colors from "./colors"

export const theme = {
  breakpoints: [576, 768, 991, 1220],
  space: [0, 5, 8, 10, 15, 20, 25, 30, 40, 50, 60, 70, 75, 80, 90, 100, 120],
  fontSizes: [10, 12, 14, 15, 16, 18, 24, 30, 36, 48, 80, 96],
  fontWeights: [100, 200, 300, 400, 500, 600, 700, 800, 900],
  fontFamily: ["'Fira Sans',sans-serif", "'Poppins', sans-serif"],
  lineHeights: {
    normal: 1,
    normalText: 1.5,
    title: 2,
    text: 2,
  },
  letterSpacings: {
    normal: "normal",
    tracked: "0.1em",
    tight: "-0.05em",
    mega: "0.25em",
  },
  borders: [
    0,
    "1px solid",
    "2px solid",
    "3px solid",
    "4px solid",
    "5px solid",
    "6px solid",
  ],
  radius: [3, 4, 5, 10, 20, 30, 60, 120, "50%"],
  widths: [36, 40, 45, 48, 54, 70, 81, 128, 256],
  heights: [36, 40, 44, 48, 50, 55, 70, 80, 120, 230],
  maxWidths: [16, 32, 64, 128, 256, 512, 768, 1024, 1536],
  colors,
  colorStyles: {
    primary: {
      color: colors.primary,
      backgroundColor: colors.primary,
      borderColor: colors.primary,
      "&:hover": {
        backgroundColor: colors.primaryHover,
        borderColor: colors.primaryHover,
      },
    },
  },
}
