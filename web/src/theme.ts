"use client";

import { createTheme } from "@mantine/core";

export const theme = createTheme({
  primaryColor: "purple",
  primaryShade: 3,

  colors: {
    purple: [
      "#f5e9ff",
      "#e3cfff",
      "#c39bff",
      "#a264ff", // Main purple
      "#8636fe",
      "#7419fe",
      "#6b09ff",
      "#5a00e4",
      "#5000cc",
      "#4300b4",
    ],
    blue: [
      "#e6f2ff",
      "#cde0ff",
      "#9bbeff",
      "#649aff",
      "#387bfe", // Main blue
      "#1d68fe",
      "#095eff",
      "#004fe4",
      "#0046cd",
      "#003bb5",
    ],
    gray: [
      "#f1f5fc",
      "#e4e6ea", // Main white
      "#c8cbd1",
      "#aaaeb8",
      "#9096a2",
      "#7f8696",
      "#767f90",
      "#646c7e",
      "#586072",
      "#495367",
    ],
    midnight: [
      "#e4e6e8",
      "#c4cad3",
      "#a2adbe",
      "#8594ac",
      "#7385a2",
      "#697d9e",
      "#586b8a",
      "#4d5f7c",
      "#3f526f",
      "#0D1117", // Main black
    ],
    green: [
      "#e4fef5",
      "#d4f8eb",
      "#aceed6",
      "#80e3bf",
      "#5cdbac",
      "#44d6a0",
      "#35d399", // Main green
      "#24bb85",
      "#14a675",
      "#009063",
    ],
    red: [
      "#ffe8e8",
      "#ffd0d0",
      "#fba0a0",
      "#f86c6c", // Main red
      "#f54040",
      "#f32524",
      "#f31515",
      "#d90609",
      "#c20006",
      "#aa0002",
    ],
  },
  cursorType: "pointer",
  focusRing: "never",
  black: "#0D1117",
  white: "#e4e6ea",
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
});
