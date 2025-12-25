import React, { useState } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../components/ui/Button';
import { Header } from '../components/ui/Header';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { ImageWithFallback } from '../components/ImageWithFallback';
import {
  Leaf,
  BookmarkPlus,
  Sprout,
} from 'lucide-react-native';

interface PlantIdentificationScreenProps {
  image: string;
  plant_name: string;
  confidence: number;
  plantInfo?: {
    commonName: string;
    scientificName: string;
    family: string;
    description: string;
    careGuide: {
      water: string;
      light: string;
      temperature: string;
      humidity: string;
      soil: string;
    };
    characteristics: string[];
    growthInfo: {
      size: string;
      growthRate: string;
      lifecycle: string;
    };
  } | null;
  onBack: () => void;
  onSave: () => Promise<void>;
  onScanAnother: () => void;
}

export function PlantIdentificationScreen({
  image,
  plant_name,
  confidence,
  plantInfo,
  onBack,
  onSave,
  onScanAnother,
}: PlantIdentificationScreenProps) {
  const [isSaving, setIsSaving] = useState(false);

  return (
    <View className="flex-1 bg-background">
      <Header title="Plant Identified" showBack onBack={onBack} />

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="px-6 py-6">

          {/* IMAGE + CONFIDENCE */}
          <View className="mb-5">
            <View className="relative overflow-hidden rounded-2xl">
              <ImageWithFallback
                src={image}
                alt="Plant"
                className="w-full"
                style={{ height: 256 }}
              />
            </View>
          </View>

          {/* CONTENT */}
          {plantInfo ? (
            <>
              <Text className="text-2xl font-bold mb-1">
                {plantInfo.commonName}
              </Text>
              <Text className="text-sm italic text-muted-foreground mb-1">
                {plantInfo.scientificName}
              </Text>
              <Text className="text-sm text-muted-foreground mb-4">
                Family: {plantInfo.family}
              </Text>

              {/* Description */}
              <Card className="mb-4">
                <View className="flex-row gap-3">
                  <View className="w-10 h-10 bg-primary/10 rounded-xl items-center justify-center">
                    <Leaf size={20} color="#3F7C4C" strokeWidth={2} />
                  </View>
                  <View className="flex-1">
                    <Text className="text-lg font-semibold mb-2">
                      About this plant
                    </Text>
                    <Text className="text-sm text-muted-foreground leading-relaxed">
                      {plantInfo.description}
                    </Text>
                  </View>
                </View>
              </Card>

              {/* CARE GUIDE – ALWAYS VISIBLE */}
              <Card className="mb-4">
                <View className="flex-row items-center gap-3 mb-3">
                  <Sprout size={20} color="#3F7C4C" strokeWidth={2} />
                  <Text className="text-lg font-semibold">
                    Care Guide
                  </Text>
                </View>

                <View className="space-y-2">
                  <Text className="text-sm">💧 {plantInfo.careGuide.water}</Text>
                  <Text className="text-sm">☀️ {plantInfo.careGuide.light}</Text>
                  <Text className="text-sm">🌡 {plantInfo.careGuide.temperature}</Text>
                  <Text className="text-sm">💦 {plantInfo.careGuide.humidity}</Text>
                  <Text className="text-sm">🌱 {plantInfo.careGuide.soil}</Text>
                </View>
              </Card>
            </>
          ) : (
            <View>
              <Text className="text-2xl font-bold mb-3">
                {plant_name}
              </Text>
              <Card className="p-4">
                <Text className="text-sm text-muted-foreground">
                  Confidence: {confidence}%
                </Text>
                <Text className="text-sm text-muted-foreground mt-2">
                  Detailed information is not available for this plant yet.
                </Text>
              </Card>
            </View>
          )}
        </View>
      </ScrollView>

      {/* BOTTOM ACTIONS */}
      <SafeAreaView
        edges={['bottom']}
        className="bg-background border-t border-border"
      >
        <View className="p-4 space-y-3">

          {/* Save */}
          <Button
            variant="outline"
            onPress={async () => {
              setIsSaving(true);
              await onSave();
              setIsSaving(false);
            }}
            disabled={isSaving}
            className="h-12 rounded-xl flex-row items-center justify-center gap-2 px-4"
          >
            <BookmarkPlus size={18} color="#3F7C4C" />
            <Text className="text-primary font-medium">
              {isSaving ? 'Saving...' : 'Save'}
            </Text>
          </Button>

          {/* Primary CTA */}
          <Button
            variant="primary"
            size="lg"
            fullWidth
            onPress={onScanAnother}
            disabled={isSaving}
            className="rounded-xl"
          >
            Scan Another Plant
          </Button>

        </View>
      </SafeAreaView>
    </View>
  );
}