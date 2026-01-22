import React, { useState } from 'react';
import { View, Text, TextInput } from 'react-native';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { MessageCircleQuestion, ThumbsUp, ThumbsDown, Send, SkipForward, CheckCircle, Brain } from 'lucide-react-native';
import { submitDiagnosisFeedback } from '../services/api';

type FeedbackState = 'initial' | 'correction' | 'thanks' | 'skipped';

interface DiagnosisFeedbackCardProps {
  condition: string;
  scanId?: number;
  confidence?: number;
  modelType?: 'coleaf' | 'disease' | 'plant_id';
}

export function DiagnosisFeedbackCard({
  condition,
  scanId,
  confidence,
  modelType
}: DiagnosisFeedbackCardProps) {
  const [feedbackState, setFeedbackState] = useState<FeedbackState>('initial');
  const [correctedCondition, setCorrectedCondition] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleYes = async () => {
    setIsSubmitting(true);
    try {
      await submitDiagnosisFeedback({
        scanId,
        originalCondition: condition,
        isCorrect: true,
        confidence,
        modelType,
      });
      setFeedbackState('thanks');
    } catch (error) {
      console.error('Failed to submit feedback:', error);
      setFeedbackState('thanks');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNo = () => {
    setFeedbackState('correction');
  };

  const handleSubmitCorrection = async () => {
    setIsSubmitting(true);
    try {
      await submitDiagnosisFeedback({
        scanId,
        originalCondition: condition,
        isCorrect: false,
        correctedCondition: correctedCondition.trim() || undefined,
        confidence,
        modelType,
      });
      setFeedbackState('thanks');
    } catch (error) {
      console.error('Failed to submit feedback:', error);
      setFeedbackState('thanks');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSkip = async () => {
    setIsSubmitting(true);
    try {
      await submitDiagnosisFeedback({
        scanId,
        originalCondition: condition,
        isCorrect: false,
        confidence,
        modelType,
      });
      setFeedbackState('skipped');
    } catch (error) {
      console.error('Failed to submit feedback:', error);
      setFeedbackState('skipped');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (feedbackState === 'thanks') {
    return (
      <Card className="border-primary/30 bg-primary/5 mb-5">
        <View className="items-center py-2">
          <View className="w-12 h-12 bg-primary/15 rounded-full items-center justify-center mb-3">
            <Brain size={24} color="#3F7C4C" />
          </View>
          <Text className="text-base font-semibold text-primary mb-1">
            Thank you!
          </Text>
          <Text className="text-sm text-muted-foreground text-center">
            Your feedback helps our AI learn and improve diagnosis accuracy for everyone.
          </Text>
        </View>
      </Card>
    );
  }

  if (feedbackState === 'skipped') {
    return (
      <Card className="border-border bg-muted/30 mb-5">
        <View className="items-center py-2">
          <Text className="text-sm text-muted-foreground text-center">
            Feedback skipped. Thank you for using Jiva Plants!
          </Text>
        </View>
      </Card>
    );
  }

  if (feedbackState === 'correction') {
    return (
      <Card className="border-warning/40 mb-5">
        <View className="flex-row items-center gap-3 mb-4">
          <View className="w-10 h-10 bg-warning/15 rounded-xl items-center justify-center">
            <MessageCircleQuestion size={20} color="#D08A4E" />
          </View>
          <View className="flex-1">
            <Text className="text-base font-semibold">
              What's the correct diagnosis?
            </Text>
            <Text className="text-xs text-muted-foreground">
              Help us learn from this mistake
            </Text>
          </View>
        </View>

        <TextInput
          value={correctedCondition}
          onChangeText={setCorrectedCondition}
          placeholder="Enter the correct condition (optional)"
          placeholderTextColor="#6B7280"
          multiline
          numberOfLines={2}
          className="h-20 w-full rounded-xl border px-4 py-3 text-sm bg-background text-foreground border-border mb-4"
          style={{ textAlignVertical: 'top' }}
        />

        <View className="flex-row gap-3">
          <Button
            variant="outline"
            className="flex-1"
            onPress={handleSkip}
            disabled={isSubmitting}
          >
            <SkipForward size={16} color="#6B7280" />
            <Text className="text-muted-foreground font-medium">Skip</Text>
          </Button>

          <Button
            variant="primary"
            className="flex-1"
            onPress={handleSubmitCorrection}
            loading={isSubmitting}
            disabled={isSubmitting}
          >
            <Send size={16} color="#FEFCE8" />
            <Text className="text-primary-foreground font-medium">Submit</Text>
          </Button>
        </View>
      </Card>
    );
  }

  // Initial state
  return (
    <Card className="bg-[#F2F6F5] mb-5">
      <View className="flex-row items-center gap-3 mb-4">
        <View className="w-10 h-10 bg-primary/15 rounded-xl items-center justify-center">
          <MessageCircleQuestion size={20} color="#3F7C4C" />
        </View>
        <View className="flex-1">
          <Text className="text-base font-semibold">
            Is this diagnosis correct?
          </Text>
          <Text className="text-xs text-muted-foreground">
            Your feedback improves our accuracy
          </Text>
        </View>
      </View>

      <View className="flex-row gap-3">
        <Button
          variant="outline"
          className="flex-1 border-destructive/40"
          onPress={handleNo}
          disabled={isSubmitting}
        >
          <ThumbsDown size={16} color="#B55C4C" />
          <Text className="text-destructive font-medium">No</Text>
        </Button>

        <Button
          variant="primary"
          className="flex-1"
          onPress={handleYes}
          loading={isSubmitting}
          disabled={isSubmitting}
        >
          <ThumbsUp size={16} color="#FEFCE8" />
          <Text className="text-primary-foreground font-medium">Yes</Text>
        </Button>
      </View>
    </Card>
  );
}
