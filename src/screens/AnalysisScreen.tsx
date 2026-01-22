import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { ProgressBar } from '../components/ui/ProgressBar';
import { Leaf, X } from 'lucide-react-native';
import {
  identifyPlant,
  diagnosePlant,
  PlantIdentificationResult,
  DiagnosisResult,
} from '../services/api';
import Toast from 'react-native-toast-message';
import { normalizePlantKey } from '../utils/formatters';
import { PLANT_INFO } from '../data/plants';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AnalysisScreenProps {
  scanType: 'diagnose' | 'identify';
  image: string;
  onComplete: (result: PlantIdentificationResult | DiagnosisResult) => void;
  onCancel: () => void;
  onPaymentRequired?: () => void;
  onSessionExpired?: () => void;
}

export function AnalysisScreen({
  scanType,
  image,
  onComplete,
  onCancel,
  onPaymentRequired,
  onSessionExpired,
}: AnalysisScreenProps) {
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);

  // Prevent duplicate API calls when useEffect runs multiple times
  const hasStartedAnalysis = useRef(false);

  // Animation values
  const scale = useSharedValue(1);
  const rotation = useSharedValue(0);
  const opacity = useSharedValue(0);

  const diagnoseSteps = [
    'Scanning for symptoms...',
    'Analyzing leaf patterns...',
    'Cross-referencing plant conditions...',
    'Generating diagnosis...',
  ];

  const identifySteps = [
    'Scanning leaf structure...',
    'Analyzing plant features...',
    'Matching with plant database...',
    'Identifying species...',
  ];

  const steps = scanType === 'diagnose' ? diagnoseSteps : identifySteps;

  useEffect(() => {
    // Prevent duplicate API calls
    if (hasStartedAnalysis.current) {
      return;
    }
    hasStartedAnalysis.current = true;

    // Start animations
    scale.value = withRepeat(
      withSequence(
        withTiming(1.1, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 1000, easing: Easing.inOut(Easing.ease) })
      ),
      -1
    );

    rotation.value = withRepeat(
      withSequence(
        withTiming(5, { duration: 500 }),
        withTiming(-5, { duration: 1000 }),
        withTiming(0, { duration: 500 })
      ),
      -1
    );

    let progressInterval: NodeJS.Timeout | undefined;
    let stepInterval: NodeJS.Timeout | undefined;

    const analyzeImage = async () => {
      try {
        // Get device_id from storage
        const deviceId = await AsyncStorage.getItem('@jiva:userId');
        if (!deviceId) {
          throw new Error('Device ID not found. Please restart the app.');
        }

        // Progress animation
        progressInterval = setInterval(() => {
          setProgress(prev => (prev >= 90 ? 90 : prev + 2));
        }, 50);

        stepInterval = setInterval(() => {
          setCurrentStep(prev =>
            prev >= steps.length - 1 ? prev : prev + 1
          );
        }, 1200);

        // API call
        let result: PlantIdentificationResult | DiagnosisResult;

        if (scanType === 'identify') {
          result = await identifyPlant(image);
        } else {
          result = await diagnosePlant(image);
        }

        // ✅ Enrich identify result with plantInfo (try local first, fallback to USDA from backend)
        if (scanType === 'identify' && 'plant_name' in result && result.plant_name) {
          const identifyResult = result as PlantIdentificationResult;
          const key = normalizePlantKey(identifyResult.plant_name);
          const localPlantInfo = (PLANT_INFO as any)[key];

          if (localPlantInfo) {
            // Use full local plant info if available
            result = {
              ...identifyResult,
              plantInfo: localPlantInfo,
            };
          } else if (identifyResult.scientific_name || identifyResult.family) {
            // Build basic plantInfo from USDA backend data
            result = {
              ...identifyResult,
              plantInfo: {
                commonName: identifyResult.plant_name,
                scientificName: identifyResult.scientific_name || identifyResult.plant_name,
                family: identifyResult.family || 'Unknown',
                description: `${identifyResult.plant_name} is a plant species${identifyResult.family ? ` belonging to the ${identifyResult.family} family` : ''}.`,
                careGuide: null, // No care guide from USDA
                characteristics: [],
                growthInfo: null,
              },
            };
          } else {
            result = {
              ...identifyResult,
              plantInfo: null,
            };
          }
        }

        // Finish
        setProgress(100);

        setTimeout(() => {
          onComplete(result);
        }, 500);
      } catch (error: any) {
        console.error('Analysis error:', error);

        // Check if this is a session expired error (401)
        if (error?.statusCode === 401 || error?.userFriendlyError?.type === 'UNAUTHORIZED') {
          console.warn('[AnalysisScreen] Session expired, redirecting to login');
          if (onSessionExpired) {
            onSessionExpired();
          } else {
            // Fallback: show error and cancel
            Toast.show({
              type: 'error',
              text1: 'Session Expired',
              text2: 'Your session has expired. Please log in again.',
            });
            onCancel();
          }
          return;
        }

        // Check if this is a payment required error (402)
        if (error?.statusCode === 402 || error?.userFriendlyError?.title === 'Free Scans Exhausted') {
          // Call the payment required callback instead of showing error
          if (onPaymentRequired) {
            onPaymentRequired();
          } else {
            // Fallback: show error and cancel
            Toast.show({
              type: 'error',
              text1: 'Free Scans Exhausted',
              text2: 'You\'ve used all your free scans. Upgrade to continue.',
              visibilityTime: 4000,
            });
            setTimeout(() => {
              onCancel();
            }, 1000);
          }
          return;
        }

        // Check if this is a bad image quality error
        if (error?.userFriendlyError?.type === 'BAD_IMAGE') {
          Alert.alert(
            error?.userFriendlyError?.title || 'Image Quality Issue',
            error?.userFriendlyError?.message || 'The image quality is not good enough or the leaf is not clearly visible. Please upload a clearer photo.',
            [
              {
                text: 'Try Again',
                onPress: () => onCancel(),
              },
            ],
            { cancelable: false }
          );
          return;
        }

        // Extract user-friendly error message
        let errorTitle = 'Analysis Failed';
        let errorMessage = 'Failed to analyze image. Please try again.';
        let canRetry = true;

        if (error?.userFriendlyError) {
          errorTitle = error.userFriendlyError.title;
          errorMessage = error.userFriendlyError.message;
          canRetry = error.userFriendlyError.canRetry;
        } else if (error instanceof Error) {
          errorMessage = error.message;
        }

        // Show user-friendly error message
        Toast.show({
          type: 'error',
          text1: errorTitle,
          text2: errorMessage,
          visibilityTime: 5000, // Show for 5 seconds for longer messages
        });

        // Small delay before canceling to let user read the message
        setTimeout(() => {
          onCancel();
        }, canRetry ? 1000 : 500);
      }
    };

    analyzeImage();

    return () => {
      if (progressInterval) clearInterval(progressInterval);
      if (stepInterval) clearInterval(stepInterval);
    };
  }, [scanType, image, onComplete, onCancel]);

  // Animated styles
  const animatedIconStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }, { rotate: `${rotation.value}deg` }],
  }));

  const animatedTextStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  useEffect(() => {
    opacity.value = 0;
    opacity.value = withTiming(1, { duration: 300 });
  }, [currentStep]);

  return (
    <View className="absolute inset-0 bg-background z-50">
      {/* Close button */}
      <View className="p-4 items-end">
        <TouchableOpacity onPress={onCancel} className="p-2 rounded-lg">
          <X size={20} color="#1F2933" strokeWidth={2} />
        </TouchableOpacity>
      </View>

      <View className="flex-1 items-center justify-center px-6">
        {/* Animated Icon */}
        <Animated.View
          style={animatedIconStyle}
          className="w-24 h-24 bg-primary/10 rounded-full items-center justify-center mb-8"
        >
          <Leaf size={48} color="#3F7C4C" strokeWidth={2} />
        </Animated.View>

        <Text className="text-2xl font-bold mb-2">
          Analyzing your plant
        </Text>
        <Text className="text-muted-foreground mb-8 text-center">
          Please wait while our we examine your plant
        </Text>

        <View className="w-full max-w-sm mb-6">
          <ProgressBar value={progress} showLabel />
        </View>

        <Animated.View style={animatedTextStyle}>
          <Text className="text-primary text-center">
            {steps[currentStep]}
          </Text>
        </Animated.View>
      </View>
    </View>
  );
}