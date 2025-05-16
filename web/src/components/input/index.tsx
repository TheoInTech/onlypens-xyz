import React from "react";
import { Input as MantineInput, InputProps } from "@mantine/core";
import classes from "./input.module.css";

export interface IInputProps extends Omit<InputProps, "onChange"> {
  placeholder?: string;
  label?: React.ReactNode;
  description?: React.ReactNode;
  error?: React.ReactNode;
  withAsterisk?: boolean;
  required?: boolean;
  onChange?: (value: string) => void;
}

export const Input = ({
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
}: IInputProps) => {
  // Always call the hook, regardless of conditions
  const generatedId = React.useId();
  // Use provided id or generated one
  const inputId = id || generatedId;

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onChange?.(event.currentTarget.value);
  };

  // If we have any wrapper-related props, use Input.Wrapper
  if (label || description || error) {
    return (
      <MantineInput.Wrapper
        label={label}
        description={description}
        error={error}
        withAsterisk={withAsterisk}
        required={required}
        id={inputId}
        classNames={{
          root: classes.wrapper,
          label: classes.label,
          description: classes.description,
          ...(classNames || {}),
        }}
      >
        <MantineInput
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
          onChange={onChange ? handleChange : undefined}
          {...props}
        />
      </MantineInput.Wrapper>
    );
  }

  // Otherwise, just render the input
  return (
    <MantineInput
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
      onChange={onChange ? handleChange : undefined}
      {...props}
    />
  );
};

Input.displayName = "Input";
