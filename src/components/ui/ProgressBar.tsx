import React from "react";
import { View, Text } from "react-native";
import { cn } from "./utils";

interface ProgressBarProps {
  value: number; // 0–100
  className?: string;
  showLabel?: boolean;
}

export function ProgressBar({
  value,
  className = "",
  showLabel = false,
}: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, value));

  return (
    <View className={cn("w-full", className)}>
      <View className="w-full h-2 bg-muted rounded-full overflow-hidden">
        <View
          className="h-full bg-primary rounded-full"
          style={{ width: `${clamped}%` }}
        />
      </View>
      {showLabel && (
        <Text className="text-xs text-muted-foreground mt-1">
          {Math.round(clamped)}%
        </Text>
      )}
    </View>
  );
}