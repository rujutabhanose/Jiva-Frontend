import React from "react";
import { Modal as RNModal, View, Text, TouchableOpacity, ScrollView } from "react-native";
import { X } from "lucide-react-native";
import { cn } from "./utils";

interface ModalProps {
  visible: boolean;
  title?: string;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
}

export function Modal({ visible, title, onClose, children, className }: ModalProps) {
  return (
    <RNModal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View className="flex-1 items-center justify-center">
        <TouchableOpacity
          className="absolute inset-0 bg-black/50"
          onPress={onClose}
        />
        <ScrollView
          className={cn(
            "bg-card border border-border rounded-2xl shadow-lg p-6 w-full max-w-md",
            className
          )}
          style={{ maxHeight: '80%' }}
          contentContainerStyle={{ flexGrow: 1 }}
        >
          {title && (
            <View className="flex flex-row items-center justify-between mb-4">
              <Text className="text-lg font-semibold">{title}</Text>
              <TouchableOpacity
                onPress={onClose}
                className="flex items-center justify-center w-8 h-8 rounded-lg"
              >
                <X size={20} color="#1F2933" />
              </TouchableOpacity>
            </View>
          )}
          <View>{children}</View>
        </ScrollView>
      </View>
    </RNModal>
  );
}