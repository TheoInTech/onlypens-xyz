import React from "react";
import {
  NumberInput as MantineNumberInput,
  NumberInputProps,
} from "@mantine/core";
import classes from "./number-input.module.css";

export interface INumberInputProps extends Omit<NumberInputProps, "onChange"> {
  placeholder?: string;
  label?: React.ReactNode;
  description?: React.ReactNode;
  error?: React.ReactNode;
  withAsterisk?: boolean;
  required?: boolean;
  onChange?: (value: string | number) => void;
}

export const NumberInput = ({
  variant = "filled",
  size = "sm",
  radius = "md",
  placeholder = "Input component",
  label,
  description,
  error,
  withAsterisk,
  required,
  id,
  classNames,
  onChange,
  ...props
}: INumberInputProps) => {
  // Always call the hook, regardless of conditions
  const generatedId = React.useId();
  // Use provided id or generated one
  const inputId = id || generatedId;

  // Handle the NumberInput onChange correctly
  const handleChange = (value: string | number) => {
    onChange?.(value);
  };

  // If we have any wrapper-related props, use wrapperProps from Mantine
  if (label || description || error) {
    return (
      <MantineNumberInput
        variant={variant}
        size={size}
        radius={radius}
        placeholder={placeholder}
        id={inputId}
        error={error}
        label={label}
        description={description}
        withAsterisk={withAsterisk}
        required={required}
        classNames={{
          root: classes.wrapper,
          label: classes.label,
          description: classes.description,
          input: classes.input,
          ...(classNames || {}),
        }}
        onChange={handleChange}
        {...props}
      />
    );
  }

  // Otherwise, just render the input
  return (
    <MantineNumberInput
      variant={variant}
      size={size}
      radius={radius}
      placeholder={placeholder}
      id={inputId}
      error={!!error}
      classNames={{
        input: classes.input,
        ...(classNames || {}),
      }}
      onChange={handleChange}
      {...props}
    />
  );
};

NumberInput.displayName = "NumberInput";
