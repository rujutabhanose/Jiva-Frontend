import React from "react";
import { TouchableOpacity, Text, ActivityIndicator, TouchableOpacityProps } from "react-native";
import { cn } from "./utils";

type ButtonVariant = "primary" | "secondary" | "outline" | "ghost";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends Omit<TouchableOpacityProps, 'children'> {
  children?: React.ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  loading?: boolean;
  className?: string;
}

const baseClasses =
  "flex-row items-center justify-center rounded-xl gap-2";

const variantClasses: Record<ButtonVariant, string> = {
  primary: "bg-primary",
  secondary: "bg-secondary border border-border",
  outline: "bg-transparent border border-border",
  ghost: "bg-transparent",
};

const textVariantClasses: Record<ButtonVariant, string> = {
  primary: "text-primary-foreground",
  secondary: "text-secondary-foreground",
  outline: "text-foreground",
  ghost: "text-foreground",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "h-9 px-3",
  md: "h-11 px-4",
  lg: "h-12 px-5",
};

const textSizeClasses: Record<ButtonSize, string> = {
  sm: "text-sm",
  md: "text-base",
  lg: "text-base",
};

// Export buttonVariants for compatibility
export function buttonVariants({ variant = "primary", size = "md" }: { variant?: ButtonVariant, size?: ButtonSize } = {}) {
  return cn(baseClasses, variantClasses[variant], sizeClasses[size]);
}

export function Button({
  children,
  variant = "primary",
  size = "md",
  fullWidth,
  loading,
  className,
  disabled,
  ...props
}: ButtonProps) {
  const getActivityIndicatorColor = () => {
    switch (variant) {
      case "primary":
        return "#FEFCE8"; // text-on-primary
      case "secondary":
      case "outline":
      case "ghost":
      default:
        return "#3F7C4C"; // primary
    }
  };

  return (
    <TouchableOpacity
      className={cn(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        fullWidth && "w-full",
        (disabled || loading) && "opacity-60",
        className,
      )}
      disabled={loading || disabled}
      {...props}
    >
      {loading && (
        <ActivityIndicator size="small" color={getActivityIndicatorColor()} />
      )}
      {typeof children === 'string' ? (
        <Text
          className={cn(
            "font-medium",
            textVariantClasses[variant],
            textSizeClasses[size]
          )}
        >
          {children}
        </Text>
      ) : (
        children
      )}
    </TouchableOpacity>
  );
}