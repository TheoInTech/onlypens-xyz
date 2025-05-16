"use client";

import React, { useRef, useState } from "react";
import classes from "./gradient-banner.module.css";

interface IGradientBannerProps {
  children: React.ReactNode;
  variant?: "purple" | "blue" | "purple-blue" | "blue-purple";
  className?: string;
  glowEffect?: boolean;
}

export const GradientBanner: React.FC<IGradientBannerProps> = ({
  children,
  variant = "purple",
  className = "",
  glowEffect = true,
}) => {
  const [isHovering, setIsHovering] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);

  // Handle mouse movement for the glow effect
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;

    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    cardRef.current.style.setProperty("--mouse-x", `${x}px`);
    cardRef.current.style.setProperty("--mouse-y", `${y}px`);
  };

  return (
    <div
      className={`${classes.gradientBanner} ${classes[variant]} ${
        glowEffect ? classes.hasGlow : ""
      } ${className}`}
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      style={
        {
          "--glow-opacity": isHovering ? 1 : 0,
        } as React.CSSProperties
      }
    >
      <div className={classes.glowingBorder}></div>
      <div className={classes.glossyBorder}></div>
      <div className={classes.inner}>
        <div className={classes.glowEffect} ref={glowRef}></div>
        <div className={classes.content}>{children}</div>
      </div>
    </div>
  );
};
