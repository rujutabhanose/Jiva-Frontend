import React from "react";
import { View, Text, ViewProps, TextProps } from "react-native";
import { cn } from "./utils";

interface CardProps extends ViewProps {
  padded?: boolean;
  padding?: "none" | "sm" | "md" | "lg";
  className?: string;
}

const paddingClasses = {
  none: "",
  sm: "p-3",
  md: "p-4",
  lg: "p-6",
};

export function Card({
  className,
  padded = true,
  padding,
  children,
  ...props
}: CardProps) {
  const paddingClass = padding
    ? paddingClasses[padding]
    : padded
    ? "p-4"
    : "";

  return (
    <View
      {...props}
      style={[
        { borderWidth: 1 },
        props.style,
      ]}
      className={cn(
        "bg-card border-border rounded-2xl shadow-sm",
        paddingClass,
        className,
      )}
    >
      {children}
    </View>
  );
}

interface CardHeaderProps extends ViewProps {
  className?: string;
}

export function CardHeader({
  className,
  ...props
}: CardHeaderProps) {
  return (
    <View
      className={cn("flex flex-col gap-1 mb-3", className)}
      {...props}
    />
  );
}

interface CardTitleProps extends TextProps {
  className?: string;
}

export function CardTitle({
  className,
  ...props
}: CardTitleProps) {
  return (
    <Text
      className={cn("text-base font-semibold", className)}
      {...props}
    />
  );
}

interface CardDescriptionProps extends TextProps {
  className?: string;
}

export function CardDescription({
  className,
  ...props
}: CardDescriptionProps) {
  return (
    <Text
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  );
}

interface CardContentProps extends ViewProps {
  className?: string;
}

export function CardContent({
  className,
  ...props
}: CardContentProps) {
  return (
    <View
      className={cn("space-y-3", className)}
      {...props}
    />
  );
}

interface CardFooterProps extends ViewProps {
  className?: string;
}

export function CardFooter({
  className,
  ...props
}: CardFooterProps) {
  return (
    <View
      className={cn("mt-4 flex items-center justify-between gap-2", className)}
      {...props}
    />
  );
}