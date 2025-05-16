import { Box } from "@mantine/core";
import React from "react";
import classes from "./tone-niche-pill.module.css";
import clsx from "clsx";
import { ENicheKeywords, EToneKeywords } from "@/schema/enum.schema";

type ToneNichePillSize = "sm" | "md" | "lg";

interface IToneNichePill {
  value: EToneKeywords | ENicheKeywords;
  size?: ToneNichePillSize;
  fullWidth?: boolean;
}

export const ToneNichePill = ({
  value,
  size = "sm",
  fullWidth = false,
}: IToneNichePill) => {
  return (
    <Box
      className={clsx(
        classes.toneNichePill,
        classes[size],
        fullWidth && classes.fullWidth
      )}
    >
      {value}
    </Box>
  );
};
