import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  Platform,
  TextInput,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { cn } from "./utils";
import { ChevronDown } from "lucide-react-native";

export interface SelectProps {
  label?: string;
  error?: string;
  helperText?: string;
  options: { value: string; label: string }[];
  value?: string;
  onValueChange?: (value: string) => void;
  className?: string;
  enabled?: boolean;
}

export const Select = React.forwardRef<any, SelectProps>(
  (
    {
      className,
      label,
      error,
      helperText,
      options,
      value,
      onValueChange,
      enabled = true,
    },
    ref
  ) => {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState("");

    const selectedLabel =
      options.find(o => o.value === value)?.label ?? "Select your country";

    const filteredOptions = useMemo(() => {
      if (!query.trim()) return options;
      return options.filter(option =>
        option.label.toLowerCase().includes(query.toLowerCase())
      );
    }, [options, query]);

    /* ================= ANDROID ================= */
    if (Platform.OS === "android") {
      return (
        <View className="w-full">
          {label && (
            <Text className="text-sm font-medium mb-1.5">{label}</Text>
          )}

          <View
            className={cn(
              "h-11 w-full rounded-xl border border-border bg-background",
              error && "border-destructive",
              className
            )}
          >
            <Picker
              ref={ref}
              selectedValue={value}
              onValueChange={onValueChange}
              enabled={enabled}
            >
              {options.map(option => (
                <Picker.Item
                  key={option.value}
                  label={option.label}
                  value={option.value}
                />
              ))}
            </Picker>
          </View>

          {error && (
            <Text className="text-xs text-destructive mt-1.5">{error}</Text>
          )}
          {helperText && !error && (
            <Text className="text-xs text-muted-foreground mt-1.5">
              {helperText}
            </Text>
          )}
        </View>
      );
    }

    /* ================= iOS (MODAL + SEARCH) ================= */
    return (
      <View className="w-full">
        {label && (
          <Text className="text-sm font-medium mb-1.5">{label}</Text>
        )}

        <TouchableOpacity
          onPress={() => enabled && setOpen(true)}
          className={cn(
            "h-11 w-full rounded-xl border border-border bg-background px-4 flex-row items-center justify-between",
            error && "border-destructive",
            className
          )}
        >
          <Text
            numberOfLines={1}
            className={value ? "text-foreground" : "text-muted-foreground"}
          >
            {value ? selectedLabel : "Select your country"}
          </Text>
          <ChevronDown size={16} />
        </TouchableOpacity>

        {error && (
          <Text className="text-xs text-destructive mt-1.5">{error}</Text>
        )}
        {helperText && !error && (
          <Text className="text-xs text-muted-foreground mt-1.5">
            {helperText}
          </Text>
        )}

        <Modal visible={open} animationType="slide" transparent>
          <View className="flex-1 justify-end bg-black/40">
            <View className="bg-background rounded-t-2xl max-h-[85%]">

              {/* Header */}
              <View className="flex-row items-center justify-between px-4 py-3 border-b border-border">
                <Text className="font-medium">Select country</Text>
                <TouchableOpacity
                  onPress={() => {
                    setOpen(false);
                    setQuery("");
                  }}
                >
                  <Text className="text-primary font-medium">Done</Text>
                </TouchableOpacity>
              </View>

              {/* Search */}
              <View className="px-4 py-3">
                <TextInput
                  placeholder="Type to search (e.g. United)"
                  value={query}
                  onChangeText={setQuery}
                  autoFocus
                  className="border border-border rounded-xl px-4 py-3"
                />
              </View>

              {/* Picker */}
              <Picker
                selectedValue={value}
                onValueChange={(val) => {
                  onValueChange?.(val);
                }}
              >
                {filteredOptions.map(option => (
                  <Picker.Item
                    key={option.value}
                    label={option.label}
                    value={option.value}
                  />
                ))}
              </Picker>

            </View>
          </View>
        </Modal>
      </View>
    );
  }
);

Select.displayName = "Select";