import React from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ArrowLeft } from "lucide-react-native";

interface HeaderProps {
  title: string;
  onBack?: () => void;
  showBack?: boolean;

  rightAction?: React.ReactNode;
}

export function Header({
  title,
  onBack,
  showBack,

  rightAction,
}: HeaderProps) {
  return (
    <SafeAreaView edges={["top"]} className="bg-background">
      <View className="relative flex-row items-center h-[88px] px-4 overflow-hidden">

        {/* Background leaf */}
<View
  pointerEvents="none"
  style={{
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  }}
>
<Image
  source={require("../../../assets/leaf-line.png")}
  resizeMode="cover"
  style={{
    width: "100%",
    height: "100%",
    opacity: 0.15,
  }}
/>

</View>

        {/* LEFT */}
        <View className="w-12 items-start">
          {(onBack || showBack) && (
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={onBack}
              className="flex items-center justify-center w-9 h-9 rounded-xl"
            >
              <ArrowLeft size={20} color="#1B5E20" />
            </TouchableOpacity>
          )}
        </View>

        {/* CENTER */}
        <View className="absolute left-0 right-0 items-center">
          <Text
            style={{
              fontSize: 24,
              fontWeight: "700",
              letterSpacing: 0.4,
              color: "#1B5E20",
            }}
          >
            {title}
          </Text>

        </View>

        {/* RIGHT */}
        <View className="w-12 items-end">
          {rightAction}
        </View>
      </View>
    </SafeAreaView>
  );
}