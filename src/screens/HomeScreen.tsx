import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Animated,
  Easing,
} from "react-native";
import { Header } from "../components/ui/Header";
import { Card } from "../components/ui/Card";
import { ProgressBar } from "../components/ui/ProgressBar";
import { storage } from "../utils/storage";
import plantCareTipsData from "../data/plant_care_tips.json";
import { Check, Crown } from "lucide-react-native";
// UpgradeModal removed - using the one from RootNavigator via onUpgrade prop

/* ----------------------------------
   Fade + Slide wrapper
----------------------------------- */
const FadeInItem = ({ children }: { children: React.ReactNode }) => {
  const opacity = React.useRef(new Animated.Value(0)).current;
  const translateY = React.useRef(new Animated.Value(12)).current;

  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 350,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 350,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View style={{ opacity, transform: [{ translateY }] }}>
      {children}
    </Animated.View>
  );
};

interface HomeScreenProps {
  scansUsed: number;
  scansLimit: number;
  isPro: boolean;
  onNavigate: (screen: string) => void;
  onUpgrade: () => void;
}

export function HomeScreen({
  scansUsed,
  scansLimit,
  isPro,
  onNavigate,
  onUpgrade,
}: HomeScreenProps) {
  const [userName, setUserName] = React.useState("");
  const [randomTip, setRandomTip] = React.useState("");

  /* ----------------------------------
     Hero floating animation
  ----------------------------------- */
  const floatAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: -8,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const percent =
    isPro || scansLimit === Infinity || scansLimit <= 0
      ? 0
      : Math.round((scansUsed / scansLimit) * 100);

  React.useEffect(() => {
    const loadUserName = async () => {
      const userData = await storage.getUserData();
      if (userData?.name && userData.name !== "Guest") {
        setUserName(userData.name.trim());
      } else if (userData?.email) {
        const name = userData.email.split("@")[0];
        setUserName(name.charAt(0).toUpperCase() + name.slice(1));
      }
    };

    const tips = plantCareTipsData.tips;
    const tip = tips[Math.floor(Math.random() * tips.length)]
      .replace(/\[web:\d+\]/g, "")
      .trim();

    loadUserName();
    setRandomTip(tip);
  }, []);

  return (
    <View className="flex-1 bg-background">
      <Header title="Jiva Plants" showBeta />

      <ScrollView className="flex-1">
        {/* Hero */}
        <Animated.View
          style={{ transform: [{ translateY: floatAnim }] }}
          className="items-center mt-4 mb-2"
        >
          <Image
            source={require("../../assets/home-hero.png")}
            style={{ width: 220, height: 160 }}
            resizeMode="contain"
          />
        </Animated.View>

        <View className="px-4 pt-4 space-y-8">
          {userName && (
            <FadeInItem>
              <View className="px-2">
                <Text className="text-xl font-semibold">
                  Welcome back, {userName}!
                </Text>
                <Text className="text-sm text-muted-foreground mt-1">
                  Let’s take care of your plants 🌱
                </Text>
              </View>
            </FadeInItem>
          )}

          <View className="space-y-8">
            <View className="h-px bg-border/60 mx-2 my-2" />

            <Text className="text-base font-semibold px-2 mb-4">
              What would you like to do?
            </Text>

            {/* Identify Plant */}
            <FadeInItem>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => onNavigate("scan-start?mode=identify")}
                className="mb-6"
              >
                <Card padding="lg" className="bg-[#F2F6F5]">
                  <View className="flex-row items-center gap-4">
                    <View className="w-16 h-16 rounded-2xl border border-border bg-white items-center justify-center">
                      <View className="w-12 h-12 rounded-xl bg-[#F2F6F5] items-center justify-center">
                        <Image
                          source={require("../../assets/identify-plant.png")}
                          style={{ width: 34, height: 34 }}
                          resizeMode="contain"
                        />
                      </View>
                    </View>

                    <View className="flex-1">
                      <Text className="font-semibold mb-1">Identify Plant</Text>
                      <Text className="text-sm text-muted-foreground">
                        Discover what plant you have
                      </Text>
                      <Text className="text-xs text-primary mt-1 font-medium">
                        Free · Unlimited
                      </Text>
                    </View>
                  </View>
                </Card>
              </TouchableOpacity>
            </FadeInItem>

            {/* Diagnose Plant */}
            <FadeInItem>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => onNavigate("scan-start?mode=diagnose")}
              >
                <Card padding="lg" className="bg-[#F2F6F5]">
                  <View className="flex-row items-center gap-4">
                    <View className="w-16 h-16 rounded-2xl border border-border bg-white items-center justify-center">
                      <View className="w-12 h-12 rounded-xl bg-[#F2F6F5] items-center justify-center">
                        <Image
                          source={require("../../assets/diagnose-plant.png")}
                          style={{ width: 34, height: 34 }}
                          resizeMode="contain"
                        />
                      </View>
                    </View>

                    <View className="flex-1">
                      <Text className="font-semibold mb-1">
                        Revive Your Plant
                      </Text>
                      <Text className="text-sm text-muted-foreground">
                        Cure and care for your plants
                      </Text>
                      {!isPro && (
                        <Text className="text-xs text-muted-foreground mt-1">
                          Diagnose and identify deficiencies
                        </Text>
                      )}
                    </View>
                  </View>
                </Card>
              </TouchableOpacity>
            </FadeInItem>

            {!isPro && scansLimit !== Infinity && (
              <View className="mt-4 px-6">
                <ProgressBar value={percent} />
                <Text className="text-xs text-muted-foreground mt-2 text-center">
                  {scansUsed} of {scansLimit} diagnosis scans used
                </Text>
              </View>
            )}
          </View>

          {/* Upgrade Card (RESTORED FULL UI) */}
          {!isPro && scansLimit !== Infinity && (
            <FadeInItem>
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={onUpgrade}
                className="mt-6 px-2"
              >
                <View
                  style={{
                    borderRadius: 20,
                    backgroundColor: "#FBF7F2",
                    padding: 20,
                    elevation: 4,
                  }}
                >
                  <View className="flex-row gap-4">
                    <View
                      style={{
                        width: 48,
                        height: 48,
                        borderRadius: 24,
                        backgroundColor: "#FFD700",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Crown size={24} color="#3F6B3A" />
                    </View>

                    <View className="flex-1">
                      <Text className="text-base font-bold text-primary mb-1">
                        Upgrade to Pro
                      </Text>
                      <Text className="text-sm text-muted-foreground mb-2">
                        Unlimited diagnoses & premium insights
                      </Text>

                      <View className="flex-row gap-3">
                        {["Unlimited", "AI Powered"].map((label) => (
                          <View key={label} className="flex-row items-center gap-1">
                            <Check size={12} color="#3F6B3A" />
                            <Text className="text-xs font-medium text-primary">
                              {label}
                            </Text>
                          </View>
                        ))}
                      </View>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            </FadeInItem>
          )}

          {/* Tip */}
          <FadeInItem>
            <View className="mt-8 px-2">
              <Card padding="lg" className="bg-muted">
                <View className="flex-row gap-4">
                  <Image
                    source={require("../../assets/tip-leaf.png")}
                    style={{ width: 40, height: 40 }}
                    resizeMode="contain"
                  />
                  <View className="flex-1">
                    <Text className="text-sm font-semibold mb-1">
                      Plant Care Tip
                    </Text>
                    <Text className="text-sm text-muted-foreground">
                      {randomTip}
                    </Text>
                  </View>
                </View>
              </Card>
            </View>
          </FadeInItem>
        </View>
      </ScrollView>

      {/* UpgradeModal is now handled in RootNavigator */}
    </View>
  );
}