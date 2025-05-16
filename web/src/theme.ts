"use client";

import { createTheme } from "@mantine/core";

export const theme = createTheme({
  primaryColor: "purple",
  primaryShade: 3,

  colors: {
    purple: [
      "#f5e9ff", // 0
      "#e3cfff", // 1
      "#c39bff", // 2
      "#a264ff", // Main purple - 3
      "#8636fe", // 4
      "#7419fe", // 5
      "#6b09ff", // 6
      "#5a00e4", // 7
      "#5000cc", // 8
      "#4300b4", // 9
    ],
    blue: [
      "#e6f2ff", // 0
      "#cde0ff", // 1
      "#9bbeff", // 2
      "#649aff", // 3
      "#387bfe", // Main blue - 4
      "#1d68fe", // 5
      "#095eff", // 6
      "#004fe4", // 7
      "#0046cd", // 8
      "#003bb5", // 9
    ],
    gray: [
      "#f1f5fc", // 0
      "#e4e6ea", // Main white - 1
      "#c8cbd1", // 2
      "#aaaeb8", // 3
      "#9096a2", // 4
      "#7f8696", // 5
      "#767f90", // 6
      "#646c7e", // 7
      "#586072", // 8
      "#495367", // 9
    ],
    midnight: [
      "#e4e6e8", // 0
      "#c4cad3", // 1
      "#a2adbe", // 2
      "#8594ac", // 3
      "#7385a2", // 4
      "#697d9e", // 5
      "#586b8a", // 6
      "#3f526f", // 7
      "#1a2330", // 8
      "#0D1117", // Main black - 9
    ],
    green: [
      "#e4fef5", // 0
      "#d4f8eb", // 1
      "#aceed6", // 2
      "#80e3bf", // 3
      "#5cdbac", // 4
      "#44d6a0", // 5
      "#35d399", // Main green - 6
      "#24bb85", // 7
      "#14a675", // 8
      "#009063", // 9
    ],
    red: [
      "#ffe8e8", // 0
      "#ffd0d0", // 1
      "#fba0a0", // 2
      "#f86c6c", // Main red - 3
      "#f54040", // 4
      "#f32524", // 5
      "#f31515", // 6
      "#d90609", // 7
      "#c20006", // 8
      "#aa0002", // 9
    ],
  },
  cursorType: "pointer",
  focusRing: "never",
  black: "#0D1117",
  white: "#FAFAFA",
  fontSmoothing: true,
  fontFamily: "'Inter', sans-serif",
  headings: {
    fontFamily: "'Manrope', sans-serif",
    fontWeight: "bold",
    textWrap: "pretty",
    sizes: {
      h1: {
        fontSize: "2rem",
        fontWeight: "bold",
      },
      h2: {
        fontSize: "1.5rem",
        fontWeight: "bold",
      },
      h3: {
        fontSize: "1.25rem",
        fontWeight: "bold",
      },
      h4: {
        fontSize: "1rem",
        fontWeight: "bold",
      },
      h5: {
        fontSize: "0.875rem",
        fontWeight: "bold",
      },
      h6: {
        fontSize: "0.75rem",
        fontWeight: "bold",
      },
    },
  },
  fontSizes: {
    xs: "1rem",
    sm: "1.25rem",
    md: "1.75rem",
    lg: "2.5rem",
    xl: "3rem",
  },
});
