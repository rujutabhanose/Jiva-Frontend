import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Header } from '../components/ui/Header';
import { Card } from '../components/ui/Card';
import { Camera, Image, Lightbulb } from 'lucide-react-native';
import Toast from 'react-native-toast-message';

interface ScanStartScreenProps {
  onBack: () => void;
  onCamera: () => void;
  onGallery: (imageData: string) => void;
  mode?: 'identify' | 'diagnose';
}

export function ScanStartScreen({
  onBack,
  onCamera,
  onGallery,
  mode = 'diagnose',
}: ScanStartScreenProps) {
  const isIdentifyMode = mode === 'identify';

  const tips = isIdentifyMode
    ? [
        'Capture the leaf of the plant clearly',
        'Use good lighting – natural light works best',
        'Include the full leaf in the frame',
        'Avoid blurry or dark photos',
      ]
    : [
        'Capture the affected leaf of the plant',
        'Use good lighting – natural light works best',
        'Focus on affected leaves or problem areas',
        'Get close to show symptoms clearly',
        'Avoid blurry or dark photos',
      ];

  const handleGallery = async () => {
    try {
      // Let ImagePicker handle permissions automatically
      // This avoids the iOS limited library selection prompt
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.9,
        base64: true,
      });

      if (!result.canceled && result.assets?.length) {
        const asset = result.assets[0];

        onGallery(
          asset.base64
            ? `data:image/jpeg;base64,${asset.base64}`
            : asset.uri
        );
      }
    } catch (error: any) {
      // Handle permission denied or other errors
      if (error.message?.includes('permission')) {
        Toast.show({
          type: 'error',
          text1: 'Permission Required',
          text2: 'Please enable photo library access in Settings',
        });
      } else {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: 'Failed to select image',
        });
      }
    }
  };

  return (
    <View className="flex-1 bg-background">
      <Header title={isIdentifyMode ? "Identify Plant" : "Diagnose Plant"} showBeta showBack onBack={onBack} />

      <ScrollView className="flex-1 px-6 py-6">
        {/* Intro */}
<View className="mb-8">
  <Text className="text-xl font-semibold mb-1 text-foreground">
    {isIdentifyMode ? "Capture a leaf" : "Capture affected area"}
  </Text>
  <Text className="text-sm text-muted-foreground">
    {isIdentifyMode
      ? "Take a clear photo of a leaf — we'll identify your plant"
      : "Take a clear photo of the problem area — we'll diagnose the issue"}
  </Text>
</View>

        <TouchableOpacity onPress={onCamera} activeOpacity={0.85}>
  <Card
    padding="lg"
    className="mb-4 bg-[#F2F6F5] border-[#D6E3D3]"
  >
    <View className="flex-row items-center">
      <View className="w-16 h-16 bg-[#E2EFE6] rounded-2xl items-center justify-center mr-4">
        <Camera size={30} color="#3F6B3A" strokeWidth={2.2} />
      </View>

      <View className="flex-1">
        <Text className="text-base font-semibold mb-0.5">
          Use Camera
        </Text>
        <Text className="text-sm text-muted-foreground">
          Best for live plant photos
        </Text>
      </View>

      <Text className="text-xs font-semibold text-[#3F6B3A]">
        RECOMMENDED
      </Text>
    </View>
  </Card>
</TouchableOpacity>

        <TouchableOpacity onPress={handleGallery} activeOpacity={0.85}>
  <Card
    padding="lg"
    className="mb-10 bg-[#F2F6F5] border-[#E6DECF]"
  >
    <View className="flex-row items-center">
      <View
        style={{
          width: 56,
          height: 56,
          borderRadius: 16,
          backgroundColor: "#EFE8DC",
          alignItems: "center",
          justifyContent: "center",
          marginRight: 16,
        }}
      >
        <Image size={26} color="#6B7A5E" strokeWidth={2} />
      </View>

      <View className="flex-1">
        <Text className="text-base font-medium text-foreground mb-0.5">
          Upload from Gallery
        </Text>
        <Text className="text-sm text-muted-foreground">
          Choose an existing photo
        </Text>
      </View>
    </View>
  </Card>
</TouchableOpacity>

        {/* TIPS */}
        <Card className="bg-[#F2F6F5] border-[#E6DECF]">
  <View className="flex-row">
    <View className="w-9 h-9 bg-[#EFE6D8] rounded-lg items-center justify-center mr-3">
      <Lightbulb size={16} color="#9A6B3E" strokeWidth={2} />
    </View>

    <View className="flex-1">
      <Text className="text-sm font-semibold mb-2 text-[#6B5B45]">
        Tips for best results
      </Text>

      {tips.map((tip, index) => (
        <Text
          key={index}
          className="text-sm text-muted-foreground mb-1.5"
        >
          • {tip}
        </Text>
      ))}
    </View>
  </View>
</Card>
      </ScrollView>
    </View>
  );
}