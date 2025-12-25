import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { WifiOff, History, BookOpen } from 'lucide-react-native';

interface OfflineScreenProps {
  onRetry: () => void;
  onViewHistory?: () => void;
  onViewKnowledge?: () => void;
}

export function OfflineScreen({ onRetry, onViewHistory, onViewKnowledge }: OfflineScreenProps) {
  return (
    <View className="min-h-screen bg-background flex flex-col items-center justify-center px-6">
      <View className="max-w-md w-full text-center space-y-8">
        {/* Icon */}
        <View className="w-24 h-24 bg-muted rounded-3xl flex items-center justify-center mx-auto">
          <WifiOff size={48} color="#6B7280" strokeWidth={2} />
        </View>

        {/* Message */}
        <View className="space-y-2">
          <Text className="text-2xl font-bold text-center">You're offline</Text>
          <Text className="text-muted-foreground text-center">
            Please check your internet connection to scan plants and revive them
          </Text>
        </View>

        {/* Quick Actions */}
        <View className="space-y-3">
          <TouchableOpacity onPress={onViewHistory}>
            <Card>
              <View className="flex items-center gap-4">
                <View className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                  <History size={24} color="#3F7C4C" strokeWidth={2} />
                </View>
                <View className="flex-1 text-left">
                  <Text className="text-base font-semibold mb-1">View Saved History</Text>
                  <Text className="text-muted-foreground text-sm">Access your past diagnoses</Text>
                </View>
              </View>
            </Card>
          </TouchableOpacity>

          <TouchableOpacity onPress={onViewKnowledge}>
            <Card>
              <View className="flex items-center gap-4">
                <View className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                  <BookOpen size={24} color="#3F7C4C" strokeWidth={2} />
                </View>
                <View className="flex-1 text-left">
                  <Text className="text-base font-semibold mb-1">Browse Knowledge Base</Text>
                  <Text className="text-muted-foreground text-sm">Learn about plant conditions</Text>
                </View>
              </View>
            </Card>
          </TouchableOpacity>
        </View>

        {/* Retry Button */}
        <Button
          variant="primary"
          size="lg"
          fullWidth
          onPress={onRetry}
        >
          <Text className="text-on-primary font-medium">Try Again</Text>
        </Button>

        {/* Info */}
        <Card className="bg-muted/50">
          <Text className="text-muted-foreground text-sm text-center">
            Some features require an internet connection to work
          </Text>
        </Card>
      </View>
    </View>
  );
}