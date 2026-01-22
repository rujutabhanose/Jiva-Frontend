import React from 'react';
import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Header } from '../components/ui/Header';
import { ImageWithFallback } from '../components/ImageWithFallback';
import { ScanLine } from 'lucide-react-native';

interface Scan {
  id: string;
  image: string;
  condition?: string;
  plant_name?: string;
  confidence: number;
  date: Date;
  mode?: 'diagnosis' | 'identification';
  symptoms?: string[];
  causes?: string[];
  treatment?: string[];
  notes?: string;
  category?: string;
  severity?: string;
}

interface HistoryScreenProps {
  history: Scan[];
  onNavigate: (screen: string) => void;
  onSelectScan: (scan: Scan) => void;
}

export function HistoryScreen({ history, onNavigate, onSelectScan }: HistoryScreenProps) {
  // Sort all scans chronologically (newest first)
  const sortedHistory = [...history].sort((a, b) => {
    const dateA = a.date instanceof Date ? a.date.getTime() : new Date(a.date).getTime();
    const dateB = b.date instanceof Date ? b.date.getTime() : new Date(b.date).getTime();
    return dateB - dateA; // Descending order (newest first)
  });

  const formatDate = (date: Date) => {
    try {
      const now = new Date();
      const dateObj = date instanceof Date ? date : new Date(date);

      if (isNaN(dateObj.getTime())) {
        return 'Invalid date';
      }

      const diffMs = now.getTime() - dateObj.getTime();
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

      if (diffDays === 0) return 'Today';
      if (diffDays === 1) return 'Yesterday';
      if (diffDays < 7) return `${diffDays} days ago`;

      // Get timezone offset for absolute dates
      const timezoneOffset = -dateObj.getTimezoneOffset() / 60;
      const gmtString = timezoneOffset >= 0
        ? `GMT+${timezoneOffset}`
        : `GMT${timezoneOffset}`;

      return `${dateObj.toLocaleDateString()} (${gmtString})`;
    } catch (error) {
      console.error('[HistoryScreen] formatDate error:', error);
      return 'Unknown date';
    }
  };

  return (
    <View className="flex-1 bg-background">
      <Header
        title="Scan History"
        showBeta
      />

      <FlatList
        data={sortedHistory}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingHorizontal: 24, paddingVertical: 24 }}
        ListEmptyComponent={() => (
          <View className="flex flex-col items-center justify-center py-16 text-center">
            <View className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mb-4">
              <ScanLine size={40} color="#6B7280" strokeWidth={2} />
            </View>
            <Text className="text-lg font-semibold mb-2">No scans yet</Text>
            <Text className="text-muted-foreground mb-6 max-w-sm text-center">
              Start by scanning your first plant to track its health over time
            </Text>
            <TouchableOpacity onPress={() => onNavigate('scan-start')}>
              <Text className="text-primary">Scan your plant</Text>
            </TouchableOpacity>
          </View>
        )}
        renderItem={({ item: scan }) => (
          <TouchableOpacity
            key={scan.id}
            activeOpacity={0.7}
            style={{ marginBottom: 20 }}
            onPress={() => onSelectScan(scan)}
          >
            <Card padding="none" className="bg-[#F2F6F5]">
              <View style={{ flexDirection: 'row', gap: 12, padding: 12 }}>
                <ImageWithFallback
                  src={scan.image}
                  alt={scan.plant_name || scan.condition || 'Plant scan'}
                  className="rounded-lg object-cover flex-shrink-0"
                  style={{ width: 80, height: 80 }}
                />
                <View className="flex-1 min-w-0">
                  <Text className="text-base font-semibold mb-1" numberOfLines={1}>
                    {scan.plant_name || scan.condition || 'Unknown'}
                  </Text>
                  {scan.mode && (
                    <View className="flex flex-row items-center gap-2 mb-2">
                      <Badge variant="default">
                        {scan.mode === 'identification' ? 'Identify' : 'Diagnosis'}
                      </Badge>
                    </View>
                  )}
                  <Text className="text-xs text-muted-foreground">
                    {formatDate(scan.date)}
                  </Text>
                </View>
              </View>
            </Card>
          </TouchableOpacity>
        )}
        removeClippedSubviews={true}
        maxToRenderPerBatch={10}
        updateCellsBatchingPeriod={50}
        initialNumToRender={10}
        windowSize={10}
      />
    </View>
  );
}