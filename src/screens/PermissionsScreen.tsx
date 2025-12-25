import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { useCameraPermissions } from 'expo-camera';
import { Button } from '../components/ui/Button';
import { Header } from '../components/ui/Header';
import { Camera, Image } from 'lucide-react-native';
import Toast from 'react-native-toast-message';

interface PermissionsScreenProps {
  onGranted: () => void;
  onDenied: () => void;
  onBack: () => void;
}

type PermissionStatus = 'pending' | 'granted' | 'denied';

export function PermissionsScreen({
  onGranted,
  onDenied,
  onBack,
}: PermissionsScreenProps) {
  const [cameraStatus, setCameraStatus] =
    React.useState<PermissionStatus>('pending');
  const [isChecking, setIsChecking] = React.useState(false);

  const [cameraPermission, requestCameraPermission] =
    useCameraPermissions();

  React.useEffect(() => {
    if (cameraPermission?.granted) {
      setCameraStatus('granted');
    } else if (cameraPermission?.canAskAgain === false) {
      setCameraStatus('denied');
    }
  }, [cameraPermission]);

  const requestPermissions = async () => {
    try {
      const result = await requestCameraPermission();

      if (result.granted) {
        setCameraStatus('granted');
        Toast.show({
          type: 'success',
          text1: 'Camera access granted',
        });
      } else {
        setCameraStatus('denied');
        Toast.show({
          type: 'error',
          text1: 'Camera access denied',
          text2: 'You can still upload photos from your gallery',
        });
      }

      return result.granted;
    } catch {
      setCameraStatus('denied');
      Toast.show({
        type: 'error',
        text1: 'Permission error',
        text2: 'Unable to request camera access',
      });
      return false;
    }
  };

  const handleContinue = async () => {
    if (cameraStatus === 'pending') {
      setIsChecking(true);
      const granted = await requestPermissions();
      setIsChecking(false);

      if (granted) {
        setTimeout(onGranted, 400);
      }
    } else if (cameraStatus === 'granted') {
      onGranted();
    } else {
      onDenied();
    }
  };

  return (
    <View className="flex-1 bg-background">
      <Header title="Permissions" showBack onBack={onBack} />

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="max-w-lg mx-auto px-6 pt-6 space-y-8">

          {/* Intro */}
          <View className="space-y-2">
            <Text className="text-2xl font-semibold">
              We need camera access
            </Text>
            <Text className="text-muted-foreground leading-relaxed">
              This helps us provide accurate plant diagnosis and better care
              recommendations.
            </Text>
          </View>

          {/* Permissions */}
          <View className="space-y-3">

            {/* Camera – primary */}
            <View className="rounded-2xl bg-primary/5 border border-primary/30 px-4 py-4 flex-row gap-4">
              <View className="w-10 h-10 rounded-xl bg-primary/15 items-center justify-center">
                <Camera size={22} color="#3F7C4C" strokeWidth={2} />
              </View>

              <View className="flex-1">
                <Text className="font-medium text-base">Camera</Text>
                <Text className="text-sm text-muted-foreground leading-snug">
                  Take photos of your plants to diagnose health issues
                </Text>
              </View>
            </View>

            {/* Photo Library – secondary */}
            <View className="rounded-2xl bg-card px-4 py-4 flex-row gap-4">
              <View className="w-10 h-10 rounded-xl bg-muted items-center justify-center">
                <Image size={22} color="#6B7280" strokeWidth={2} />
              </View>

              <View className="flex-1">
                <Text className="font-medium text-base">Photo Library</Text>
                <Text className="text-sm text-muted-foreground leading-snug">
                  Upload existing photos for analysis
                </Text>
              </View>
            </View>
          </View>

          {/* Denied helper */}
          {cameraStatus === 'denied' && (
            <View className="rounded-xl bg-warning/10 border border-warning/30 px-4 py-3">
              <Text className="text-sm text-warning-foreground leading-relaxed">
                Camera access was denied. You can still continue by uploading
                photos from your gallery.
              </Text>
            </View>
          )}

          {/* Actions */}
          <View className="pt-6 space-y-4">
            <Button
              variant="primary"
              size="lg"
              fullWidth
              loading={isChecking}
              disabled={isChecking}
              onPress={handleContinue}
            >
              {cameraStatus === 'pending'
                ? 'Grant Camera Access'
                : 'Continue'}
            </Button>

            <Text
              onPress={onDenied}
              className="text-center text-sm text-muted-foreground"
            >
              Skip for now
            </Text>
          </View>

        </View>
      </ScrollView>
    </View>
  );
}