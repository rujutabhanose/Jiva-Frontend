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
        <View className="flex-1 items-center px-6 pt-12 max-w-md mx-auto w-full">
          {/* Logo */}
          <View className="items-center mb-10">
            <Image
              source={require("../../assets/icon.png")}
              style={{ width: 42, height: 42 }}
              resizeMode="contain"
            />
            <Text className="text-xl font-semibold mt-4">Jiva Plants</Text>
            <Text className="text-sm text-muted-foreground mt-1">
            Your Plant Health Assistant
            </Text>
          </View>

          {/* Hero Card */}
          <Card className="w-full mb-10 bg-[#FBFAF6]">
            <View className="px-6 py-8 gap-6">
              {/* Hero image */}
              <View className="items-center">
                <View className="w-28 h-28 rounded-3xl bg-[#E9EFE6] items-center justify-center">
                  <Image
                    source={require("../../assets/welcome-photo.png")}
                    style={{ width: 88, height: 88 }}
                    resizeMode="contain"
                  />
                </View>
              </View>

              {/* Headline */}
              <View className="gap-2">
                <Text className="text-2xl font-bold text-center leading-snug">
                  Scan your plants.
                  {"\n"}Catch problems early.
                </Text>
                <Text className="text-sm text-muted-foreground text-center leading-relaxed">
                  Identify diseases, nutrient deficiencies, and plant stress by
                  simply taking a photo of your plant’s leaves.
                </Text>
              </View>

              {/* Features */}
              <View className="gap-3 mt-2">
                {[
                  "AI-powered diagnosis for common plant issues",
                  "Clear treatment and care recommendations",
                  "Save and revisit past scans anytime",
                  "Built for home gardeners & nurseries",
                ].map((item) => (
                  <View key={item} className="flex-row items-start gap-3">
                    <View className="w-1.5 h-1.5 rounded-full bg-primary mt-2" />
                    <Text className="text-sm text-muted-foreground flex-1">
                      {item}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          </Card>

          {/* CTAs */}
          <View className="w-full items-center gap-4">
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
          <Text className="text-[11px] text-muted-foreground text-center mt-6 px-4 leading-relaxed">
            By continuing, you agree this is a prototype and not a substitute for
            professional agricultural advice.
          </Text>
        </View>

        {/* Footer */}
        <View className="py-4 border-t border-border">
          <Text className="text-[11px] text-muted-foreground text-center">
            Beta preview
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}