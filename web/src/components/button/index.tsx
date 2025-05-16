"use client";

import * as React from "react";
import {
  Button as MantineButton,
  type ButtonProps as MantineButtonProps,
  createPolymorphicComponent,
} from "@mantine/core";
import styles from "./button.module.css";
import { cn } from "@/lib/utils";

// Custom Button Props
interface CustomButtonProps extends MantineButtonProps {
  variant?:
    | "primary"
    | "secondary"
    | "outline"
    | "ghost"
    | "white"
    | "disabled"
    | "blue"
    | "green"
    | "red"
    | "midnight";
  size?: "default" | "small" | "icon";
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
}

type SizeClassType = {
  [key: string]:
    | {
        height: number;
        px: number;
        py: number;
        fz: number;
        borderRadius: number;
      }
    | {
        height: number;
        width: number;
        padding: number;
        borderRadius: string;
      };
};

type VariantStyleType = {
  [key: string]: {
    bg: string;
    color: string;
    shadow?: string;
    border?: string;
    cursor?: string;
    p?: number;
  };
};

const sizeClasses: SizeClassType = {
  default: { height: 60, px: 28, py: 18, fz: 18, borderRadius: 20 },
  small: { height: 44, px: 18, py: 10, fz: 16, borderRadius: 16 },
  icon: { height: 44, width: 44, padding: 0, borderRadius: "100%" },
};

const variantStyles: VariantStyleType = {
  primary: {
    bg: "var(--mantine-color-purple-3)",
    color: "#FFFFFF",
    shadow:
      "0px -4px 4px rgba(0,0,0,0.20) inset, 0px 0px 4px rgba(0,0,0,0.20) inset",
  },
  secondary: {
    bg: "var(--mantine-color-gray-1)",
    color: "var(--mantine-color-blue-4)",
    shadow: "0px 4px 28px rgba(0,0,0,0.06)",
  },
  outline: {
    bg: "transparent",
    color: "var(--mantine-color-gray-4)",
    border: "1px solid var(--mantine-color-gray-4)",
  },
  disabled: {
    bg: "var(--mantine-color-purple-3)",
    color: "var(--mantine-color-white)",
    shadow:
      "0px -4px 4px rgba(0,0,0,0.20) inset, 0px 0px 4px rgba(0,0,0,0.20) inset",
    cursor: "not-allowed",
  },
  ghost: {
    bg: "transparent",
    color: "var(--mantine-color-gray-4)",
    p: 0,
  },
  white: {
    bg: "var(--mantine-color-gray-1)",
    color: "var(--mantine-color-blue-4)",
    shadow: "0px 4px 8px 0px rgba(4,147,208,0.12)",
  },
  blue: {
    bg: "var(--mantine-color-blue-4)",
    color: "var(--mantine-color-white)",
    shadow: "0px 4px 8px 0px rgba(0,108,255,0.32)",
  },
  green: {
    bg: "var(--mantine-color-green-6)",
    color: "var(--mantine-color-white)",
    shadow: "0px 4px 8px 0px rgba(0,163,92,0.32)",
  },
  red: {
    bg: "var(--mantine-color-red-3)",
    color: "var(--mantine-color-white)",
    shadow: "0px 4px 8px 0px rgba(255,0,0,0.32)",
  },
  midnight: {
    bg: "var(--mantine-color-midnight-9)",
    color: "var(--mantine-color-white)",
    shadow: "0px 4px 8px 0px rgba(0,0,0,0.32)",
  },
};

// Create the base button component
const _Button = React.forwardRef<HTMLButtonElement, CustomButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "default",
      onClick,
      disabled,
      fullWidth = false,
      children,
      ...props
    },
    ref
  ) => {
    const effectiveVariant = disabled ? "disabled" : variant;

    const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
      if (onClick && !disabled) {
        onClick(e as unknown as React.MouseEvent<HTMLButtonElement>);
      }
    };

    const variantStyle = variantStyles[effectiveVariant];
    const sizeStyle = sizeClasses[size];

    // Get padding values based on size
    const getPadding = () => {
      if ("padding" in sizeStyle) {
        return `${sizeStyle.padding}px`;
      } else if ("px" in sizeStyle && "py" in sizeStyle) {
        return `${sizeStyle.py}px ${sizeStyle.px}px`;
      }
      return "0";
    };

    // Get font size based on size
    const getFontSize = () => {
      if ("fz" in sizeStyle) {
        return sizeStyle.fz;
      }
      return 18; // Default font size
    };

    // Helper to determine if foreground should be shown
    const shouldShowForeground = () => {
      if (disabled) return false;
      const noForegroundVariants = ["outline", "ghost", "white"];
      return !noForegroundVariants.includes(effectiveVariant);
    };

    return (
      <div
        className={cn(styles.button, styles[effectiveVariant], {
          [styles.fullWidth]: fullWidth,
          [styles.disabled]: disabled,
        })}
        onClick={disabled ? undefined : handleClick}
        style={disabled ? { pointerEvents: "none", opacity: 0.7 } : undefined}
      >
        {/* Foreground element */}
        {shouldShowForeground() && (
          <div
            className={cn(
              styles.foreground,
              styles[effectiveVariant],
              styles[size]
            )}
          />
        )}

        {/* Main Button */}
        <MantineButton
          ref={ref}
          disabled={disabled}
          className={className}
          fullWidth={fullWidth}
          styles={{
            root: {
              height: sizeStyle.height,
              padding: getPadding(),
              fontSize: getFontSize(),
              width: fullWidth ? "100%" : "auto",
              background: variantStyle.bg,
              color: variantStyle.color,
              borderRadius: sizeStyle.borderRadius,
              boxShadow: variantStyle.shadow,
              border: variantStyle.border,
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              whiteSpace: "nowrap",
              fontWeight: 600,
              transition: "all 0.2s",
              position: "relative",
              zIndex: 2,
              cursor:
                effectiveVariant === "disabled" ? "not-allowed" : "pointer",
              "&:hover": {
                filter:
                  effectiveVariant !== "disabled"
                    ? "brightness(1.1)"
                    : undefined,
                transform:
                  effectiveVariant !== "disabled" ? "scale(1.05)" : undefined,
              },
              "&:focus": {
                outline: "none",
              },
            },
            label: {
              position: "relative",
              zIndex: 20,
              textShadow:
                effectiveVariant === "primary"
                  ? "0 2px 4px rgba(0,0,0,0.5), 0 0 6px rgba(255,255,255,0.3)"
                  : undefined,
              fontWeight: effectiveVariant === "primary" ? 700 : 600,
              letterSpacing:
                effectiveVariant === "primary" ? "0.02em" : undefined,
              transition: "all 0.2s ease",
              "&:hover": {
                textShadow:
                  effectiveVariant === "primary"
                    ? "0 2px 4px rgba(0,0,0,0.5), 0 0 8px rgba(255,255,255,0.7)"
                    : undefined,
              },
            },
          }}
          {...props}
        >
          {children}
        </MantineButton>
      </div>
    );
  }
);

_Button.displayName = "Button";

// Create the polymorphic Button component
export const Button = createPolymorphicComponent<"button", CustomButtonProps>(
  _Button
);

export default Button;
