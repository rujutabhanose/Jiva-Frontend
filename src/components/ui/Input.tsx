import React from "react";
import {
  View,
  Text,
  TextInput,
  TextInputProps,
  KeyboardTypeOptions,
} from "react-native";
import { cn } from "./utils";

export interface InputProps extends Omit<TextInputProps, "className"> {
  label?: string;
  error?: string;
  helperText?: string;
  type?: "text" | "email" | "password" | "number" | "tel";
  className?: string;
}

export const Input = React.forwardRef<TextInput, InputProps>(
  (
    {
      className,
      label,
      error,
      helperText,
      type = "text",
      ...props
    },
    ref
  ) => {
    const getKeyboardType = (): KeyboardTypeOptions => {
      switch (type) {
        case "email":
          return "email-address";
        case "number":
          return "numeric";
        case "tel":
          return "phone-pad";
        default:
          return "default";
      }
    };

    const secureTextEntry = type === "password";
    const autoCapitalize = type === "email" || type === "password" ? "none" : "sentences";
    const autoCorrect = type === "email" || type === "password" ? false : true;

    return (
      <View className="w-full">
        {/* Label */}
        {label && (
          <Text className="text-sm font-medium text-foreground mb-2">
            {label}
          </Text>
        )}

        {/* Input */}
        <TextInput
          ref={ref}
          keyboardType={getKeyboardType()}
          secureTextEntry={secureTextEntry}
          autoCapitalize={autoCapitalize}
          autoCorrect={autoCorrect}
          placeholderTextColor="#6B7280"
          className={cn(
            "h-12 w-full rounded-xl border px-4 text-sm",
            "bg-background text-foreground",
            "border-border",
            "focus:border-primary",
            error && "border-destructive",
            className
          )}
          {...props}
        />

        {/* Error / Helper */}
        {error ? (
          <Text className="text-xs text-destructive mt-2">{error}</Text>
        ) : helperText ? (
          <Text className="text-xs text-muted-foreground mt-2">
            {helperText}
          </Text>
        ) : null}
      </View>
    );
  }
);

Input.displayName = "Input";