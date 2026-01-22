import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Header } from '../components/ui/Header';
import { AlertCircle, Eye, Target, Stethoscope, ShieldCheck } from 'lucide-react-native';

interface ConditionDetailScreenProps {
  condition: string;
  onBack: () => void;
  onScanForThis: () => void;
}

export function ConditionDetailScreen({ condition, onBack, onScanForThis }: ConditionDetailScreenProps) {
  // Mock data - in a real app this would come from a database
  const conditionData = {
    nitrogen: {
      title: 'Nitrogen Deficiency',
      overview: 'Nitrogen is essential for plant growth and the production of chlorophyll. When plants lack nitrogen, they cannot produce enough chlorophyll, leading to yellowing leaves.',
      symptoms: [
        'Yellowing of older leaves (starts from bottom)',
        'Stunted growth and small leaves',
        'Pale green or yellow color overall',
        'Reduced fruit and flower production'
      ],
      causes: [
        'Poor soil fertility',
        'Heavy rainfall washing away nutrients',
        'Sandy soil with low organic matter',
        'Over-cropping without replenishment'
      ],
      treatment: [
        'Apply nitrogen-rich fertilizer (urea, ammonium nitrate)',
        'Add compost or well-rotted manure',
        'Use blood meal or fish emulsion for organic option',
        'Monitor pH levels (should be 6.0-7.0)'
      ],
      prevention: [
        'Regular soil testing',
        'Crop rotation with legumes',
        'Add organic matter annually',
        'Use slow-release fertilizers'
      ]
    }
  };
  
  const data = conditionData[condition as keyof typeof conditionData] || conditionData.nitrogen;

  return (
    <View className="flex-1 bg-background">
      <Header
        title={data.title}
        showBack
        onBack={onBack}
      />

      <ScrollView className="flex-1">
        <View className="max-w-lg mx-auto px-6 py-6 space-y-4">
          {/* Overview */}
          <Card className="bg-[#F2F6F5]">
            <View className="flex items-start gap-3 mb-3">
              <View className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                <Eye size={20} color="#3F7C4C" strokeWidth={2} />
              </View>
              <Text className="text-lg font-semibold">Overview</Text>
            </View>
            <Text className="text-muted-foreground">{data.overview}</Text>
          </Card>

          {/* Symptoms */}
          <Card className="bg-[#F2F6F5]">
            <View className="flex items-start gap-3 mb-3">
              <View className="w-10 h-10 bg-destructive/10 rounded-xl flex items-center justify-center flex-shrink-0">
                <Stethoscope size={20} color="#B55C4C" strokeWidth={2} />
              </View>
              <Text className="text-lg font-semibold">Typical Symptoms</Text>
            </View>
            <View className="space-y-2">
              {data.symptoms.map((symptom, index) => (
                <View key={index} className="flex items-start gap-2">
                  <Text className="text-primary mt-0.5">•</Text>
                  <Text className="text-sm flex-1">{symptom}</Text>
                </View>
              ))}
            </View>
          </Card>

          {/* Causes */}
          <Card className="bg-[#F2F6F5]">
            <View className="flex items-start gap-3 mb-3">
              <View className="w-10 h-10 bg-warning/10 rounded-xl flex items-center justify-center flex-shrink-0">
                <Target size={20} color="#D08A4E" strokeWidth={2} />
              </View>
              <Text className="text-lg font-semibold">Typical Causes</Text>
            </View>
            <View className="space-y-2">
              {data.causes.map((cause, index) => (
                <View key={index} className="flex items-start gap-2">
                  <Text className="text-primary mt-0.5">•</Text>
                  <Text className="text-sm flex-1">{cause}</Text>
                </View>
              ))}
            </View>
          </Card>

          {/* Treatment */}
          <Card className="bg-primary/5 border-primary/20">
            <View className="flex items-start gap-3 mb-3">
              <View className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center flex-shrink-0">
                <AlertCircle size={20} color="#3F7C4C" strokeWidth={2} />
              </View>
              <Text className="text-lg font-semibold">Standard Treatments</Text>
            </View>
            <View className="space-y-2">
              {data.treatment.map((step, index) => (
                <View key={index} className="flex items-start gap-2">
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

          {/* Prevention */}
          <Card className="bg-success/5 border-success/20">
            <View className="flex items-start gap-3 mb-3">
              <View className="w-10 h-10 bg-success/20 rounded-xl flex items-center justify-center flex-shrink-0">
                <ShieldCheck size={20} color="#3F7C4C" strokeWidth={2} />
              </View>
              <Text className="text-lg font-semibold">Preventive Tips</Text>
            </View>
            <View className="space-y-2">
              {data.prevention.map((tip, index) => (
                <View key={index} className="flex items-start gap-2">
                  <Text className="text-primary mt-0.5">•</Text>
                  <Text className="text-sm flex-1">{tip}</Text>
                </View>
              ))}
            </View>
          </Card>

          {/* CTA */}
          <Button
            variant="primary"
            size="lg"
            fullWidth
            onPress={onScanForThis}
          >
            <Text className="text-on-primary font-medium">Scan a Plant for This Issue</Text>
          </Button>
        </View>
      </ScrollView>
    </View>
  );
}