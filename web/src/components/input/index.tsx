import React from "react";
import { Input as MantineInput, InputProps } from "@mantine/core";
import classes from "./input.module.css";

export interface IInputProps extends InputProps {
  placeholder?: string;
  label?: React.ReactNode;
  description?: React.ReactNode;
  error?: React.ReactNode;
  withAsterisk?: boolean;
  required?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, IInputProps>(
  (
    {
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
      ...props
    },
    ref
  ) => {
    // Always call the hook, regardless of conditions
    const generatedId = React.useId();
    // Use provided id or generated one
    const inputId = id || generatedId;

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
            ref={ref}
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
            {...props}
          />
        </MantineInput.Wrapper>
      );
    }

    // Otherwise, just render the input
    return (
      <MantineInput
        ref={ref}
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
        {...props}
      />
    );
  }
);

Input.displayName = "Input";
