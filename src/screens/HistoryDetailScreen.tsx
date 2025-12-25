import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Header } from '../components/ui/Header';
import { ImageWithFallback } from '../components/ImageWithFallback';
import { Edit3, Trash2 } from 'lucide-react-native';

interface HistoryDetailScreenProps {
  scan: {
    id: string;
    image: string;
    condition?: string;
    plant_name?: string;
    confidence: number;
    date: Date;
    symptoms?: string[];
    causes?: string[];
    treatment?: string[];
    notes?: string;
    mode?: 'diagnosis' | 'identification';
  };
  onBack: () => void;
  onEditNotes: (notes: string) => void;
  onDelete: () => void;
}

export function HistoryDetailScreen({
  scan,
  onBack,
  onEditNotes,
  onDelete
}: HistoryDetailScreenProps) {
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [notes, setNotes] = useState(scan.notes || '');

  const handleSaveNotes = () => {
    onEditNotes(notes);
    setIsEditingNotes(false);
  };

  const formatDate = (date: Date) => {
    try {
      // Ensure date is a valid Date object
      const dateObj = date instanceof Date ? date : new Date(date);
      if (isNaN(dateObj.getTime())) {
        return 'Invalid date';
      }
      return dateObj.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      console.error('[HistoryDetailScreen] Error formatting date:', error);
      return 'Unknown date';
    }
  };

  return (
    <View className="flex-1 bg-background">
      <Header
        title="Scan Details"
        showBack
        onBack={onBack}
        rightAction={
          <TouchableOpacity
            onPress={onDelete}
            className="p-2 rounded-lg"
          >
            <Trash2 size={20} color="#B55C4C" strokeWidth={2} />
          </TouchableOpacity>
        }
      />

      <ScrollView className="flex-1">
        <View className="max-w-lg mx-auto px-6 py-6 space-y-4">
          {/* Image */}
          <Card padding="none">
            <ImageWithFallback
              src={scan.image}
              alt={scan.condition || scan.plant_name || 'Plant scan'}
              className="w-full object-cover rounded-xl"
              style={{ height: 256 }}
            />
          </Card>

          {/* Condition */}
          <Card>
            <Text className="text-xl font-bold mb-2">
              {scan.condition || scan.plant_name || 'Unknown'}
            </Text>
            <View className="flex flex-row items-center gap-2 mb-2">
              <Badge variant={scan.confidence >= 80 ? 'success' : 'warning'}>
                Confidence: {scan.confidence}%
              </Badge>
              {scan.mode && (
                <Badge variant="default">
                  {scan.mode === 'identification' ? 'Identification' : 'Diagnosis'}
                </Badge>
              )}
            </View>
            <Text className="text-sm text-muted-foreground">
              Scanned on {formatDate(scan.date)}
            </Text>
          </Card>

          {/* Treatment Summary - Only show for diagnosis with treatment data */}
          {scan.mode === 'diagnosis' && scan.treatment && scan.treatment.length > 0 && (
            <Card className="bg-primary/5 border-primary/20">
              <Text className="text-lg font-semibold mb-3">Treatment Steps</Text>
              <View className="space-y-2">
                {scan.treatment.map((step, index) => (
                  <View key={index} className="flex flex-row items-start gap-2">
                    <View className="w-5 h-5 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                      <Text className="text-on-primary text-xs font-semibold">
                        {index + 1}
                      </Text>
                    </View>
                    <Text className="text-sm flex-1">{step}</Text>
                  </View>
                ))}
              </View>
            </Card>
          )}

          {/* Notes Section */}
          <Card>
            <View className="flex flex-row items-center justify-between mb-3">
              <Text className="text-lg font-semibold">Your Notes</Text>
              {!isEditingNotes && (
                <TouchableOpacity
                  onPress={() => setIsEditingNotes(true)}
                  className="p-2 -mr-2 rounded-lg"
                >
                  <Edit3 size={16} color="#3F7C4C" strokeWidth={2} />
                </TouchableOpacity>
              )}
            </View>

            {isEditingNotes ? (
              <View className="space-y-3">
                <TextInput
                  value={notes}
                  onChangeText={setNotes}
                  placeholder="What did you do? Did the plant recover?"
                  multiline
                  numberOfLines={4}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background min-h-24"
                  textAlignVertical="top"
                />
                <View className="flex flex-row gap-2">
                  <Button
                    variant="primary"
                    size="sm"
                    onPress={handleSaveNotes}
                    className="flex-1"
                  >
                    <Text className="text-on-primary font-medium">Save Notes</Text>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onPress={() => {
                      setNotes(scan.notes || '');
                      setIsEditingNotes(false);
                    }}
                    className="flex-1"
                  >
                    <Text className="text-primary font-medium">Cancel</Text>
                  </Button>
                </View>
              </View>
            ) : (
              <Text className="text-sm text-muted-foreground">
                {scan.notes || 'No notes yet. Add notes to track your plant\'s progress.'}
              </Text>
            )}
          </Card>
        </View>
      </ScrollView>
    </View>
  );
}