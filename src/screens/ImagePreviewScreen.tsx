import { View, Text, ScrollView } from 'react-native';
import { Button } from '../components/ui/Button';
import { Header } from '../components/ui/Header';
import { Card } from '../components/ui/Card';
import { ImageWithFallback } from '../components/ImageWithFallback';
import {
  RotateCcw,
  Sparkles,
  Stethoscope,
  Image as ImageIcon,
} from 'lucide-react-native';

interface ImagePreviewScreenProps {
  image: string;
  mode: 'identify' | 'diagnose';
  source?: 'camera' | 'gallery';
  onRetake: () => void;
  onContinue: () => void;
}

export function ImagePreviewScreen({
  image,
  mode,
  source = 'camera',
  onRetake,
  onContinue,
}: ImagePreviewScreenProps) {
  const isIdentify = mode === 'identify';
  const PrimaryIcon = isIdentify ? Sparkles : Stethoscope;

  const isFromGallery = source === 'gallery';
  const RetakeIcon = isFromGallery ? ImageIcon : RotateCcw;
  const retakeText = isFromGallery ? 'Choose Another Photo' : 'Retake Photo';

  return (
    <View className="flex-1 bg-background">
      <Header title="Review Photo" showBack onBack={onRetake} />

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="px-6 pt-6">

          {/* Image Preview */}
          <Card padding="none" className="overflow-hidden mb-8">
            <ImageWithFallback
              src={image}
              alt="Plant photo preview"
              className="w-full object-cover"
              style={{ height: 320 }}
            />
          </Card>

          {/* Helper Text */}
          <View className="pt-3 mb-8">
            <Text className="text-sm text-muted-foreground text-center leading-relaxed px-4">
              Make sure the plant is clearly visible and in good lighting for best results.
            </Text>
          </View>

          {/* Actions */}
          <View className="pt-4">
            <Button
              variant="primary"
              size="lg"
              fullWidth
              onPress={onContinue}
              className="mb-6"
            >
                Continue
            </Button>

            <Button
              variant="outline"
              size="md"
              fullWidth
              onPress={onRetake}
            >
              <RetakeIcon size={18} color="#3F7C4C" strokeWidth={2} />
              <Text className="text-primary font-medium">
                {retakeText}
              </Text>
            </Button>
          </View>

        </View>
      </ScrollView>
    </View>
  );
}