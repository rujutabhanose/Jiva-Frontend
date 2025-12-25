// src/navigation/TabNavigator.tsx
import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Home, History, User } from "lucide-react-native";
import { MainTabScreen } from "./types";

interface TabNavigatorProps {
  activeTab: MainTabScreen;
  onTabChange: (tab: MainTabScreen) => void;
}

export function TabNavigator({ activeTab, onTabChange }: TabNavigatorProps) {
  const tabs: Array<{
    id: MainTabScreen;
    label: string;
    icon: typeof Home;
  }> = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'history', label: 'History', icon: History },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  return (
    <View className="absolute bottom-0 left-0 right-0 bg-surface border-t border-border">
      <View className="flex flex-row items-center justify-around max-w-md mx-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <TouchableOpacity
              key={tab.id}
              onPress={() => onTabChange(tab.id)}
              className="flex-1 flex flex-col items-center justify-center py-3 px-2"
            >
              {/* Active indicator */}
              {isActive && (
                <View className="absolute top-0 left-1/2 -ml-6 w-12 h-0.5 bg-primary rounded-full" />
              )}

              <Icon size={20} color={isActive ? '#3F7C4C' : '#6B7280'} strokeWidth={2} />

              <Text className={`text-xs mt-1 font-medium ${isActive ? 'text-primary' : 'text-muted-foreground'}`}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}
