import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Home, ScanLine, History, User } from 'lucide-react-native';

interface BottomNavProps {
  active: 'home' | 'scan' | 'history' | 'profile';
  onNavigate: (tab: 'home' | 'scan' | 'history' | 'profile') => void;
}

export function BottomNav({ active, onNavigate }: BottomNavProps) {
  const tabs = [
    { id: 'home' as const, label: 'Home', icon: Home },
    { id: 'scan' as const, label: 'Scan', icon: ScanLine },
    { id: 'history' as const, label: 'History', icon: History },
    { id: 'profile' as const, label: 'Profile', icon: User }
  ];

  return (
    <SafeAreaView edges={['bottom']} className="bg-card border-t border-border">
      <View className="max-w-lg mx-auto flex flex-row items-center justify-around px-4 py-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = active === tab.id;
          const iconColor = isActive ? '#3F7C4C' : '#6B7280';

          return (
            <TouchableOpacity
              key={tab.id}
              onPress={() => onNavigate(tab.id)}
              className="flex flex-col items-center gap-1 px-4 py-2 rounded-lg"
            >
              <Icon size={24} color={iconColor} strokeWidth={isActive ? 2.5 : 2} />
              <Text className={`text-xs ${isActive ? 'text-primary' : 'text-muted-foreground'}`}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </SafeAreaView>
  );
}