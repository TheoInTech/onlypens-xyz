import { Box } from "@mantine/core";
import React from "react";
import classes from "./amount-pill.module.css";
import clsx from "clsx";
import { getAmountFromDecimals } from "@/lib/utils";
import Image from "next/image";

type AmountPillSize = "sm" | "md" | "lg";

interface IAmountPill {
  amount: string;
  size?: AmountPillSize;
  fullWidth?: boolean;
}

export const AmountPill = ({
  amount,
  size = "sm",
  fullWidth = false,
}: IAmountPill) => {
  const usdcIconSize = size === "sm" ? 14 : size === "md" ? 18 : 24;

  return (
    <Box
      className={clsx(
        classes.amountPill,
        classes[size],
        fullWidth && classes.fullWidth
      )}
    >
      {getAmountFromDecimals(amount, 6)}{" "}
      <Image
        src="/assets/icons/usdc.png"
        alt="USDC"
        width={usdcIconSize}
        height={usdcIconSize}
      />
    </Box>
  );
};
