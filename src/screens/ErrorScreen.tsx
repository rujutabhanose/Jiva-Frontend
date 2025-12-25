import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Header } from '../components/ui/Header';
import { AlertCircle, RotateCw, Lightbulb } from 'lucide-react-native';

interface ErrorScreenProps {
  title: string;
  message: string;
  onRetry: () => void;
}

export function ErrorScreen({ title, message, onRetry }: ErrorScreenProps) {
  const tips = [
    'Ensure good natural lighting',
    'Hold camera steady and focus clearly',
    'Get close enough to see leaf details',
    'Avoid reflections on wet leaves',
    'Photograph the affected area directly'
  ];

  return (
    <View className="flex-1 bg-background">
      <Header title="Error" showBack onBack={onRetry} />

      <ScrollView className="flex-1 px-6 py-6">
        <View className="max-w-md mx-auto space-y-8">
          {/* Error Icon */}
          <View className="text-center space-y-4">
            <View className="w-20 h-20 bg-red-100 rounded-3xl flex items-center justify-center mx-auto">
              <AlertCircle size={40} color="#B55C4C" strokeWidth={2} />
            </View>
            <View>
              <Text className="text-2xl font-bold mb-2 text-center">{title}</Text>
              <Text className="text-muted-foreground text-center">
                {message}
              </Text>
            </View>
          </View>

          {/* Reasons */}
          <Card>
            <View className="space-y-2">
              <View className="flex items-start gap-2">
                <Text className="text-red-500 mt-0.5">•</Text>
                <Text className="text-muted-foreground flex-1">Poor lighting or image too dark</Text>
              </View>
              <View className="flex items-start gap-2">
                <Text className="text-red-500 mt-0.5">•</Text>
                <Text className="text-muted-foreground flex-1">Blurry or out of focus image</Text>
              </View>
              <View className="flex items-start gap-2">
                <Text className="text-red-500 mt-0.5">•</Text>
                <Text className="text-muted-foreground flex-1">Subject not clearly visible</Text>
              </View>
              <View className="flex items-start gap-2">
                <Text className="text-red-500 mt-0.5">•</Text>
                <Text className="text-muted-foreground flex-1">Photo doesn't show plant parts</Text>
              </View>
            </View>
          </Card>

          {/* Tips */}
          <Card className="bg-primary/5">
            <View className="flex items-center gap-2 mb-4">
              <Lightbulb size={20} color="#3F7C4C" strokeWidth={2} />
              <Text className="text-lg font-semibold">Tips for Better Photos</Text>
            </View>
            <View className="space-y-2">
              {tips.map((tip, index) => (
                <View key={index} className="flex items-start gap-2">
                  <Text className="text-primary mt-0.5">•</Text>
                  <Text className="text-muted-foreground flex-1">{tip}</Text>
                </View>
              ))}
            </View>
          </Card>

          {/* Actions */}
          <View className="space-y-3">
            <Button
              variant="primary"
              size="lg"
              fullWidth
              onPress={onRetry}
            >
              <View className="flex flex-row items-center">
                <RotateCw size={20} color="#FEFCE8" strokeWidth={2} />
                <Text className="text-on-primary font-medium ml-2">Try Again</Text>
              </View>
            </Button>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}