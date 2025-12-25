import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Card } from '../components/ui/Card';
import { Header } from '../components/ui/Header';
import { BottomNav } from '../components/ui/BottomNav';
import { Droplet, Wind, Bug, Flame, AlertCircle, Sprout } from 'lucide-react-native';

interface LearnScreenProps {
  onNavigate: (screen: string) => void;
  onConditionSelect: (condition: string) => void;
}

const getIconColor = (colorClass: string): string => {
  switch (colorClass) {
    case 'text-info':
      return '#626C71';
    case 'text-destructive':
      return '#B55C4C';
    case 'text-warning':
      return '#D08A4E';
    case 'text-primary':
      return '#3F7C4C';
    default:
      return '#3F7C4C';
  }
};

export function LearnScreen({ onNavigate, onConditionSelect }: LearnScreenProps) {
  const conditions = [
    {
      id: 'nitrogen',
      icon: Droplet,
      title: 'Nitrogen Deficiency',
      description: 'Yellowing of older leaves, stunted growth',
      color: 'text-info'
    },
    {
      id: 'phosphorus',
      icon: Flame,
      title: 'Phosphorus Deficiency',
      description: 'Purple or dark green leaves, poor root development',
      color: 'text-destructive'
    },
    {
      id: 'potassium',
      icon: Sprout,
      title: 'Potassium Deficiency',
      description: 'Brown leaf edges, weak stems',
      color: 'text-warning'
    },
    {
      id: 'fungal',
      icon: AlertCircle,
      title: 'Fungal Issues',
      description: 'Spots on leaves, wilting, mold growth',
      color: 'text-primary'
    },
    {
      id: 'bacterial',
      icon: Bug,
      title: 'Bacterial Issues',
      description: 'Leaf spots, cankers, wilting',
      color: 'text-destructive'
    },
    {
      id: 'overwatering',
      icon: Droplet,
      title: 'Overwatering',
      description: 'Yellowing leaves, root rot, fungus gnats',
      color: 'text-info'
    },
    {
      id: 'underwatering',
      icon: Wind,
      title: 'Underwatering',
      description: 'Dry, crispy leaves, drooping',
      color: 'text-warning'
    },
    {
      id: 'pests',
      icon: Bug,
      title: 'Pest Infestation',
      description: 'Holes in leaves, sticky residue, visible insects',
      color: 'text-destructive'
    }
  ];

  return (
    <View className="flex-1 bg-background pb-20">
      <Header
        title="Learn"
        showBeta
      />

      <ScrollView className="flex-1">
        <View className="max-w-lg mx-auto px-6 py-6">
          <View className="mb-6">
            <Text className="text-xl font-bold mb-2">Plant Health Guide</Text>
            <Text className="text-muted-foreground">
              Learn about common plant issues and how to treat them
            </Text>
          </View>

          <View className="space-y-3">
            {conditions.map((condition) => {
              const Icon = condition.icon;
              return (
                <TouchableOpacity
                  key={condition.id}
                  onPress={() => onConditionSelect(condition.id)}
                >
                  <Card padding="md">
                    <View className="flex items-start gap-3">
                      <View className={`w-12 h-12 bg-${condition.color}/10 rounded-xl flex items-center justify-center flex-shrink-0`}>
                        <Icon size={24} color={getIconColor(condition.color)} strokeWidth={2} />
                      </View>
                      <View className="flex-1">
                        <Text className="text-base font-semibold mb-1">{condition.title}</Text>
                        <Text className="text-sm text-muted-foreground">
                          {condition.description}
                        </Text>
                      </View>
                    </View>
                  </Card>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </ScrollView>

      <BottomNav active="home" onNavigate={onNavigate} />
    </View>
  );
}