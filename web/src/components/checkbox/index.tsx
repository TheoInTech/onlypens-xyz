"use client";

import React from "react";
import { CheckboxProps } from "@mantine/core";
import classes from "./checkbox.module.css";
import { IconCheck } from "@tabler/icons-react";

interface ICheckboxProps extends Omit<CheckboxProps, "onChange" | "checked"> {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

export const Checkbox: React.FC<ICheckboxProps> = ({
  label,
  checked,
  onChange,
}) => {
  const handleClick = () => {
    onChange(!checked);
  };

  return (
    <div className={classes.pillCheckbox}>
      <div
        className={`${classes.pillLabel} ${checked ? classes.checked : ""}`}
        onClick={handleClick}
      >
        {label}
        {checked && (
          <span className={classes.checkIcon}>
            <IconCheck size={16} stroke={3} />
          </span>
        )}
      </div>
    </div>
  );
};
