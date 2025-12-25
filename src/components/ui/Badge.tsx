import React from "react";
import { View, Text, ViewProps } from "react-native";
import { cn } from "./utils";

type BadgeVariant = "default" | "success" | "warning" | "outline" | "beta";

interface BadgeProps extends ViewProps {
  variant?: BadgeVariant;
  children?: React.ReactNode;
  className?: string;
}

const variantClasses: Record<BadgeVariant, string> = {
  default: "bg-muted",
  success: "bg-success/10 border border-success/30",
  warning: "bg-warning/10 border border-warning/30",
  outline: "border border-border bg-transparent",
  beta: "bg-accent/10 border border-accent/30",
};

const textVariantClasses: Record<BadgeVariant, string> = {
  default: "text-foreground",
  success: "text-success",
  warning: "text-warning",
  outline: "text-foreground",
  beta: "text-accent",
};

export function Badge({
  className,
  variant = "default",
  children,
  ...props
}: BadgeProps) {
  return (
    <View
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5",
        variantClasses[variant],
        className,
      )}
      {...props}
    >
      <Text className={cn("text-xs font-medium", textVariantClasses[variant])}>
        {children}
      </Text>
    </View>
  );
}