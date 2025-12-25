// src/screens/SplashScreen.tsx
import { useEffect, useState, useRef } from "react";
import { View, Text, Animated, Easing, ActivityIndicator, Image } from "react-native";
import { Leaf } from "lucide-react-native";
import { LinearGradient } from 'expo-linear-gradient';
import funFactsData from "../../assets/funfacts.json";

interface SplashScreenProps {
  onComplete: () => void;
  duration?: number; // Duration in milliseconds (default: 3000ms)
}

export function SplashScreen({ onComplete, duration = 3000 }: SplashScreenProps) {
  const [funFact, setFunFact] = useState("");
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const funFactFadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Select a random fun fact immediately
    const facts = funFactsData.fun_facts;
    const randomIndex = Math.floor(Math.random() * facts.length);
    const selectedFact = facts[randomIndex];
    setFunFact(selectedFact);

    // Start main animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 1000,
        easing: Easing.out(Easing.back(1.2)),
        useNativeDriver: true,
      }),
    ]).start();

    // Animate fun fact with a slight delay
    setTimeout(() => {
      Animated.timing(funFactFadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }).start();
    }, 700);

    // Complete splash screen after duration
    const timer = setTimeout(() => {
      onComplete();
    }, duration);

    return () => clearTimeout(timer);
  }, [onComplete, duration, fadeAnim, scaleAnim, funFactFadeAnim]);

  return (
    <LinearGradient
      colors={['#F7F4EC', '#E3F2E5']}
      style={{ flex: 1 }}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <View className="flex-1 flex flex-col items-center justify-center px-6 relative">
        {/* Animated background elements */}
        <View className="absolute inset-0 overflow-hidden">
          {/* Top left decoration */}
          <View className="absolute -top-10 -left-10 w-40 h-40 rounded-full bg-primary/5" />
          {/* Bottom right decoration */}
          <View className="absolute -bottom-10 -right-10 w-60 h-60 rounded-full bg-primary/5" />
        </View>

        {/* Main content container */}
        <Animated.View
          style={{
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          }}
          className="relative z-10 flex flex-col items-center max-w-md"
        >
          {/* Logo */}
          <View className="relative items-center justify-center">
            {/* App Icon */}
            <Image
              source={require("../../assets/icon.png")}
              style={{ width: 128, height: 128, borderRadius: 64 }}
              resizeMode="contain"
            />
          </View>

          {/* Brand name */}
          <View className="mt-6">
            <Text className="text-3xl font-semibold text-primary text-center">
              Jiva Plants
            </Text>
            <Text className="text-sm text-muted-foreground text-center mt-2">
              Your Plant Health Assistant
            </Text>
          </View>

          {/* Fun Fact Section */}
          {funFact && (
            <Animated.View
            style={{
              opacity: funFactFadeAnim,
              transform: [{
                translateY: funFactFadeAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [10, 0],
                }),
              }],
            }}
            className="mt-10 px-6 max-w-sm z-20"
            >
              <View className="flex flex-col items-center">
                <Text className="text-xs font-semibold text-primary uppercase mb-2 tracking-wide text-center">
                  Did you know?
                  </Text>
                  <Text className="text-sm text-foreground leading-relaxed text-center">
                    {funFact}
                  </Text>
                </View>
              </Animated.View>
            )}

          {/* Loading indicator */}
          <View className="mt-8">
            <ActivityIndicator size="small" color="#3F7C4C" />
          </View>
        </Animated.View>

        {/* Version info */}
        <View className="absolute bottom-8">
          <Text className="text-xs text-muted-foreground text-center">
            Version 1.0.0 · Beta Preview
          </Text>
        </View>
      </View>
    </LinearGradient>
  );
}
