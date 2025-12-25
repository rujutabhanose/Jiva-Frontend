import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Header } from '../components/ui/Header';
import { ImageWithFallback } from '../components/ImageWithFallback';
import {
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  Target,
  Stethoscope,
  Save,
  ScanLine,
  ExternalLink,
} from 'lucide-react-native';
const flatCardStyle = {
  elevation: 0,               // Android
  shadowColor: 'transparent', // iOS
};


interface DiagnosisScreenProps {
  image: string;
  condition: string;
  confidence: number;
  symptoms: string[];
  causes: string[];
  treatment: string[];
  onBack: () => void;
  onSave: () => Promise<void>;
  onScanAnother: () => void;
}

export function DiagnosisScreen({
  image,
  condition,
  confidence,
  symptoms,
  causes,
  treatment,
  onBack,
  onSave,
  onScanAnother,
}: DiagnosisScreenProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [expanded, setExpanded] = useState({
    symptoms: true,
    causes: false,
    treatment: true,
    references: false,
  });

  const toggle = (key: keyof typeof expanded) =>
    setExpanded((p) => ({ ...p, [key]: !p[key] }));

  const confidenceVariant =
    confidence >= 80 ? 'success' : confidence >= 60 ? 'warning' : 'default';

  const confidenceLabel =
    confidence >= 80 ? 'High confidence'
    : confidence >= 60 ? 'Medium confidence'
    : 'Low confidence';

  const SectionHeader = ({
    title,
    icon,
    active,
    primary = false,
    onPress,
  }: {
    title: string;
    icon: React.ReactNode;
    active: boolean;
    primary?: boolean;
    onPress: () => void;
  }) => (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
      <View className="flex-row items-center justify-between mb-3">
        <View className="flex-row items-center gap-3">
          <View
            className={`w-9 h-9 rounded-xl items-center justify-center ${
              primary ? 'bg-primary/15' : 'bg-muted'
            }`}
          >
            {icon}
          </View>
          <Text
            className={`text-base ${
              primary ? 'font-bold text-primary' : 'font-semibold'
            }`}
          >
            {title}
          </Text>
        </View>
        {active ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
      </View>
    </TouchableOpacity>
  );

  const Bullet = () => (
    <View className="w-1.5 h-1.5 bg-primary rounded-full mt-2" />
  );

  return (
    <View className="flex-1 bg-background">
      <Header title="Diagnosis" showBack showBeta onBack={onBack} />

      <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
        <View className="max-w-lg mx-auto px-6 py-6 space-y-5">

          {/* IMAGE */}
          <Card padding="none" className="overflow-hidden">
            <ImageWithFallback
              src={image}
              alt="Diagnosed plant"
              className="w-full"
              style={{ height: 220 }}
            />
            <View className="px-4 py-2 bg-muted/40">
              <Text className="text-xs text-muted-foreground">
                Image used for diagnosis
              </Text>
            </View>
          </Card>

          {/* DIAGNOSIS SUMMARY */}
          <Card className="border-destructive/40">
            <View className="flex-row gap-4">
              <View className="w-14 h-14 bg-destructive/15 rounded-2xl items-center justify-center">
                <AlertTriangle size={26} color="#B55C4C" />
              </View>

              <View className="flex-1">
                <Text className="text-xl font-bold mb-1">
                  {condition}
                </Text>

                <Badge variant={confidenceVariant}>
                  {confidenceLabel} · {confidence}%
                </Badge>

                <Text className="text-xs text-muted-foreground mt-2 leading-relaxed">
                  Based on visible symptoms detected in the uploaded image.
                </Text>
              </View>
            </View>
          </Card>

          {/* SYMPTOMS */}
          <Card>
            <SectionHeader
              title="Identified Symptoms"
              icon={<Stethoscope size={16} color="#3F7C4C" />}
              active={expanded.symptoms}
              onPress={() => toggle('symptoms')}
            />
            {expanded.symptoms && (
              <View className="space-y-2">
                {symptoms.map((s, i) => (
                  <View key={i} className="flex-row gap-2">
                    <Bullet />
                    <Text className="text-sm flex-1 leading-relaxed">
                      {s}
                    </Text>
                  </View>
                ))}
              </View>
            )}
          </Card>

          {/* CAUSES */}
          <Card>
            <SectionHeader
              title="Likely Causes"
              icon={<Target size={16} color="#3F7C4C" />}
              active={expanded.causes}
              onPress={() => toggle('causes')}
            />
            {expanded.causes && (
              <View className="space-y-2">
                {causes.map((c, i) => (
                  <View key={i} className="flex-row gap-2">
                    <Bullet />
                    <Text className="text-sm flex-1 leading-relaxed">
                      {c}
                    </Text>
                  </View>
                ))}
              </View>
            )}
          </Card>

          {/* TREATMENT */}
          <Card
  className="border-primary/30 bg-primary/5"
  style={flatCardStyle}
>
            <SectionHeader
              title="Recommended Treatment"
              icon={<Stethoscope size={16} color="#2F6F44" />}
              active={expanded.treatment}
              primary
              onPress={() => toggle('treatment')}
            />
            {expanded.treatment && (
              <View className="space-y-4">
                {treatment.map((step, i) => (
                  <View key={i} className="flex-row gap-3">
                    <Text className="w-6 text-primary font-semibold text-sm text-center">
  {i + 1}.
</Text>
                    <Text className="text-sm flex-1 leading-relaxed">
                      {step}
                    </Text>
                  </View>
                ))}
              </View>
            )}
          </Card>

          {/* DISCLAIMER */}
          <Card
  className="bg-warning/10 border-warning/30"
  style={flatCardStyle}
>
            <Text className="text-xs text-center text-muted-foreground leading-relaxed">
              This diagnosis is informational only and should not replace
              professional agricultural advice.
            </Text>
          </Card>
        </View>
      </ScrollView>

      {/* BOTTOM ACTIONS */}
      <SafeAreaView edges={['bottom']} className="border-t border-border bg-background">
        <View className="flex-row gap-4 px-4 py-3 max-w-lg mx-auto">
          <Button
            variant="outline"
            className="flex-1"
            onPress={async () => {
              setIsSaving(true);
              await onSave();
              setIsSaving(false);
            }}
            disabled={isSaving}
          >
            <Save size={16} color="#3F7C4C" />
            <Text className="text-primary font-medium">
              {isSaving ? 'Saving…' : 'Save'}
            </Text>
          </Button>

          <Button
            variant="primary"
            className="flex-1"
            onPress={onScanAnother}
            disabled={isSaving}
          >
            <ScanLine size={16} color="#FEFCE8" />
            <Text className="text-on-primary font-medium">
              Scan Again
            </Text>
          </Button>
        </View>
      </SafeAreaView>
    </View>
  );
}