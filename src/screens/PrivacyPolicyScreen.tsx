import React from "react";
import { View, Text, ScrollView } from "react-native";
import { Header } from "../components/ui/Header";

interface PrivacyPolicyScreenProps {
  onBack: () => void;
}

export function PrivacyPolicyScreen({ onBack }: PrivacyPolicyScreenProps) {
  return (
    <View className="flex-1 bg-background">
      <Header title="Privacy Policy" onBack={onBack} showBack />
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingHorizontal: 24, paddingVertical: 24, gap: 20 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Ownership and Operations */}
        <View style={{ gap: 10 }}>
          <Text style={{ fontSize: 16, fontWeight: "700", color: "#111827" }}>
            Ownership and Operations
          </Text>
          <Text style={{ fontSize: 14, color: "#374151", lineHeight: 22, textAlign: "justify" }}>
            JivaPlants is developed and operated by Mahesh Athalye. StoriesForMemories LLC supports JivaPlants by managing marketing activities, partnerships, and community programs. StoriesForMemories LLC does not own the JivaPlants application and does not independently collect or process user data unless explicitly stated in this Privacy Policy. All data collection and processing within the JivaPlants app is managed by the app owner and operator, Mahesh Athalye, in accordance with this Privacy Policy.
          </Text>
          <Text style={{ fontSize: 14, color: "#374151", lineHeight: 22, textAlign: "justify" }}>
            If any data is shared with StoriesForMemories LLC for marketing communications or community programs, such sharing will be disclosed to users and will only occur with user consent where required by applicable law.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}
