// src/screens/WelcomeScreen.tsx
import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";

interface WelcomeScreenProps {
  onGetStarted: () => void;
  onSignIn?: () => void;
}

export function WelcomeScreen({
  onGetStarted,
  onSignIn,
}: WelcomeScreenProps) {
  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="flex-1 items-center px-6 pt-6 max-w-md mx-auto w-full">
          {/* Logo */}
          <View className="items-center mb-12">
            <Image
              source={require("../../assets/icon.png")}
              style={{ width: 72, height: 72 }}
              resizeMode="contain"
            />

            <Text className="text-2xl font-semibold mt-5">
              Jiva Plants
            </Text>
            <Text className="text-sm text-muted-foreground mt-1">
              Your Plant Health Assistant
            </Text>
          </View>

{/* Hero Section (No Card) */}
<View className="w-full mb-10 items-center">

  <Image
    source={require("../../assets/welcome-photo.webp")}
    style={{
      width: "100%",
      height: 260,
    }}
    resizeMode="contain"
  />

  <View className="mt-6 gap-3">
    <Text className="text-[24px] font-bold text-center leading-snug">
      Scan your plants.{"\n"}
      Catch problems early.
    </Text>

    <Text className="text-[14px] text-muted-foreground text-center leading-relaxed px-4">
      Identify diseases, nutrient deficiencies, and plant stress
      by simply taking a photo of your plant's leaves.
    </Text>
  </View>

</View>
          {/* CTAs */}
          <View className="w-full items-center gap-5">
            <Button fullWidth onPress={onGetStarted}>
              Get started
            </Button>

            {/* Sign in */}
            {onSignIn && (
              <View className="flex-row items-center">
                <Text className="text-sm text-muted-foreground">
                  Already have an account?{" "}
                </Text>
                <TouchableOpacity onPress={onSignIn}>
                  <Text className="text-sm text-primary font-medium">
                    Sign in
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Disclaimer */}
          <Text className="text-[11px] text-muted-foreground text-center mt-7 mb-6 px-5 leading-relaxed">
            By continuing, you agree this is not a substitute for
            professional agricultural advice.
          </Text>
        </View>

        {/* Footer */}
        <View className="py-4 px-6 border-t border-border gap-1">
          <Text className="text-[11px] text-muted-foreground text-center">
            © 2026 JivaPlants. All rights reserved.
          </Text>
          <Text className="text-[11px] text-muted-foreground text-center">
            JivaPlants is developed by Mahesh Athalye.
          </Text>
          <Text className="text-[11px] text-muted-foreground text-center">
            Marketing and brand operations are managed by StoriesForMemories LLC.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
