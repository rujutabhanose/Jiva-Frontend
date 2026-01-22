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

      // Format the date with time
      const formattedDate = dateObj.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });

      // Get timezone offset in hours
      const timezoneOffset = -dateObj.getTimezoneOffset() / 60;
      const gmtString = timezoneOffset >= 0
        ? `GMT+${timezoneOffset}`
        : `GMT${timezoneOffset}`;

      return `${formattedDate} (${gmtString})`;
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
          <Card padding="none" className="shadow-none">
  <ImageWithFallback
    src={scan.image}
    alt={scan.condition || scan.plant_name || 'Plant scan'}
    className="w-full object-cover rounded-2xl"
    style={{ height: 260 }}
  />
</Card>


          {/* Condition */}
          <Card className="bg-[#F2F6F5] space-y-3">
  <Text className="text-xl font-bold text-foreground">
    {scan.condition || scan.plant_name || 'Unknown'}
  </Text>

  <View className="flex flex-row flex-wrap items-center gap-2">
    <Badge variant={scan.confidence >= 80 ? 'success' : 'warning'}>
      {Math.round(scan.confidence)}% confidence
    </Badge>

    {scan.mode && (
      <Badge variant="default">
        {scan.mode === 'identification' ? 'Identification' : 'Diagnosis'}
      </Badge>
    )}
  </View>

  <Text className="text-xs text-muted-foreground">
    Scanned on {formatDate(scan.date)}
  </Text>
</Card>

          {/* Treatment Summary - Only show for diagnosis with treatment data */}
          {scan.mode === 'diagnosis' && scan.treatment && scan.treatment.length > 0 && (
  <Card className="bg-primary/5 border-primary/15 shadow-none">
    <Text className="text-lg font-semibold mb-4">
      Treatment Steps
    </Text>

    <View className="space-y-3">
      {scan.treatment.map((step, index) => (
        <View key={index} className="flex flex-row items-start gap-3">
          <View className="px-2 py-0.5 rounded-full bg-primary/15 flex-shrink-0">
            <Text className="text-xs font-medium text-primary">
              {index + 1}
            </Text>
          </View>

          <Text className="text-sm leading-5 text-foreground flex-1">
            {step}
          </Text>
        </View>
      ))}
    </View>
  </Card>
)}

          {/* Notes Section */}
          <Card className="bg-[#F2F6F5]">
  <View className="flex flex-row items-center justify-between mb-3">
    <Text className="text-lg font-semibold">
      Your Notes
    </Text>

    {!isEditingNotes && (
      <TouchableOpacity
        onPress={() => setIsEditingNotes(true)}
        className="p-2 rounded-full bg-muted"
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
        className="w-full px-3 py-3 rounded-xl border border-border bg-background min-h-28 text-sm"
        textAlignVertical="top"
      />

      <View className="flex flex-row gap-2">
        <Button variant="primary" size="sm" onPress={handleSaveNotes} className="flex-1">
          <Text className="text-on-primary font-medium">Save</Text>
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
    <Text className="text-sm text-muted-foreground leading-5">
      {scan.notes || 'No notes yet. Add notes to track recovery and treatment progress.'}
    </Text>
  )}
</Card>
        </View>
      </ScrollView>
    </View>
  );
}