"use client";

import React, { useState, useRef } from "react";
import classes from "./glass-card.module.css";
import cx from "clsx";

interface IGlassCardProps {
  children?: React.ReactNode;
  className?: string;
}

interface ITitleProps {
  children: React.ReactNode;
  className?: string;
}

export const GlassCardTitle: React.FC<ITitleProps> = ({
  children,
  className,
}) => {
  return <h3 className={cx(classes.title, className)}>{children}</h3>;
};

export const GlassCard: React.FC<IGlassCardProps> & {
  Title: typeof GlassCardTitle;
} = ({ children, className }) => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;

    const rect = cardRef.current.getBoundingClientRect();
    setPosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  return (
    <div
      ref={cardRef}
      className={cx(classes.glassCard, className)}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      style={
        {
          "--mouse-x": `${position.x}px`,
          "--mouse-y": `${position.y}px`,
          "--glow-opacity": isHovering ? 1 : 0,
        } as React.CSSProperties
      }
    >
      <div className={classes.glowEffect} />
      {children}
    </div>
  );
};

GlassCard.Title = GlassCardTitle;
