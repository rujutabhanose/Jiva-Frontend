import React from "react";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  FlatList,
} from "react-native";
import { Header } from "../components/ui/Header";
import { Card } from "../components/ui/Card";
import tipsData from "../data/searchable_plant_care_tips.json";
import { Search, X } from "lucide-react-native";

const CATEGORIES = [
  "All",
  "Watering",
  "Light",
  "Soil",
  "Fertilizing",
  "Pests",
  "Temperature",
  "Repotting",
  "Humidity",
  "Pruning",
  "General",
];

const CATEGORY_COLORS: Record<string, string> = {
  Watering: "#3B82F6",
  Light: "#F59E0B",
  Soil: "#92400E",
  Fertilizing: "#10B981",
  Pests: "#EF4444",
  Temperature: "#F59E0B",
  Repotting: "#F97316",
  Humidity: "#06B6D4",
  Pruning: "#EC4899",
  General: "#6B7280",
};

interface Tip {
  id: string;
  title: string;
  body: string;
  category: string;
  tags: string[];
}

interface PlantCareTipsScreenProps {
  onBack: () => void;
}

export function PlantCareTipsScreen({ onBack }: PlantCareTipsScreenProps) {
  const [query, setQuery] = React.useState("");
  const [selectedCategory, setSelectedCategory] = React.useState("All");

  const allTips: Tip[] = tipsData.tips as Tip[];

  const filteredTips = React.useMemo(() => {
    const q = query.toLowerCase().trim();
    return allTips.filter((tip) => {
      const matchesCategory =
        selectedCategory === "All" || tip.category === selectedCategory;

      if (!matchesCategory) return false;
      if (!q) return true;

      return (
        tip.title.toLowerCase().includes(q) ||
        tip.body.toLowerCase().includes(q) ||
        tip.tags.some((tag) => tag.toLowerCase().includes(q))
      );
    });
  }, [query, selectedCategory, allTips]);

  return (
    <View className="flex-1 bg-background">
      <Header title="Plant Care Tips" onBack={onBack} showBack />

      {/* Search bar */}
      <View className="px-4 pt-3 pb-2">
        <View
          className="flex-row items-center bg-muted rounded-xl px-3 h-11"
          style={{ gap: 8 }}
        >
          <Search size={18} color="#6B7280" />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search tips, categories, keywords..."
            placeholderTextColor="#9CA3AF"
            autoCorrect={false}
            autoCapitalize="none"
            style={{ flex: 1, fontSize: 14, color: "#111827" }}
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery("")} activeOpacity={0.7}>
              <X size={16} color="#6B7280" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Category pills */}
      <View style={{ height: 48 }}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: 16,
            alignItems: "center",
            gap: 8,
          }}
        >
          {CATEGORIES.map((cat) => {
            const isActive = selectedCategory === cat;
            const color = cat === "All" ? "#3F6B3A" : (CATEGORY_COLORS[cat] ?? "#3F6B3A");
            return (
              <TouchableOpacity
                key={cat}
                activeOpacity={0.7}
                onPress={() => setSelectedCategory(cat)}
                style={{
                  paddingHorizontal: 14,
                  paddingVertical: 7,
                  borderRadius: 20,
                  backgroundColor: isActive ? color : "#F3F4F6",
                  borderWidth: 1,
                  borderColor: isActive ? color : "#E5E7EB",
                }}
              >
                <Text
                  style={{
                    fontSize: 13,
                    fontWeight: "500",
                    color: isActive ? "#FFFFFF" : "#374151",
                  }}
                >
                  {cat}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Tips list */}
      <FlatList
        data={filteredTips}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 32, gap: 10 }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={{ alignItems: "center", marginTop: 64 }}>
            <Text style={{ fontSize: 40, marginBottom: 12 }}>🌿</Text>
            <Text style={{ fontSize: 15, fontWeight: "600", color: "#111827", marginBottom: 4 }}>
              No tips found
            </Text>
            <Text style={{ fontSize: 13, color: "#6B7280", textAlign: "center", paddingHorizontal: 24 }}>
              Try a different keyword or category
            </Text>
          </View>
        }
        renderItem={({ item }) => {
          const chipColor = CATEGORY_COLORS[item.category] ?? "#6B7280";
          return (
            <Card padding="lg" className="bg-[#F2F6F5]">
              <View style={{ gap: 6 }}>
                {/* Category chip */}
                <View
                  style={{
                    alignSelf: "flex-start",
                    backgroundColor: chipColor + "22",
                    borderRadius: 10,
                    paddingHorizontal: 8,
                    paddingVertical: 2,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 11,
                      fontWeight: "600",
                      color: chipColor,
                      letterSpacing: 0.3,
                    }}
                  >
                    {item.category.toUpperCase()}
                  </Text>
                </View>

                {/* Title */}
                <Text style={{ fontSize: 14, fontWeight: "600", color: "#111827" }}>
                  {item.title}
                </Text>

                {/* Body */}
                <Text style={{ fontSize: 13, color: "#6B7280", lineHeight: 19 }}>
                  {item.body}
                </Text>
              </View>
            </Card>
          );
        }}
      />
    </View>
  );
}
