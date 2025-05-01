import React from "react";
import { Textarea as MantineTextarea, TextareaProps } from "@mantine/core";
import { Input } from "@mantine/core";
import classes from "./textarea.module.css";

export interface ITextareaProps extends TextareaProps {
  placeholder?: string;
  label?: React.ReactNode;
  description?: React.ReactNode;
  error?: React.ReactNode;
  withAsterisk?: boolean;
  required?: boolean;
  h?: number | string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, ITextareaProps>(
  (
    {
      variant = "filled",
      size = "sm",
      radius = "md",
      placeholder = "Textarea component",
      label,
      description,
      error,
      withAsterisk,
      required,
      id,
      classNames,
      h,
      ...props
    },
    ref
  ) => {
    // Always call the hook, regardless of conditions
    const generatedId = React.useId();
    // Use provided id or generated one
    const textareaId = id || generatedId;

    // Calculate styles for custom height
    const customStyles = h ? { minHeight: h } : {};

    // If we have any wrapper-related props, use Input.Wrapper
    if (label || description || error) {
      return (
        <Input.Wrapper
          label={label}
          description={description}
          error={error}
          withAsterisk={withAsterisk}
          required={required}
          id={textareaId}
          classNames={{
            root: classes.wrapper,
            label: classes.label,
            description: classes.description,
            ...(classNames || {}),
          }}
        >
          <MantineTextarea
            ref={ref}
            variant={variant}
            size={size}
            radius={radius}
            placeholder={placeholder}
            id={textareaId}
            error={!!error}
            styles={{ input: customStyles }}
            classNames={{
              input: classes.textarea,
              ...(classNames || {}),
            }}
            {...props}
          />
        </Input.Wrapper>
      );
    }

    // Otherwise, just render the textarea
    return (
      <MantineTextarea
        ref={ref}
        variant={variant}
        size={size}
        radius={radius}
        placeholder={placeholder}
        id={textareaId}
        error={!!error}
        styles={{ input: customStyles }}
        classNames={{
          input: classes.textarea,
          ...(classNames || {}),
        }}
        {...props}
      />
    );
  }
);

Textarea.displayName = "Textarea";
