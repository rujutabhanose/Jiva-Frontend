import React from 'react';
import { View, Text, Modal, TouchableOpacity } from 'react-native';
import { useCameraPermissions } from 'expo-camera';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { X, Camera, AlertCircle } from 'lucide-react-native';
import Toast from 'react-native-toast-message';
import { SafeAreaView } from 'react-native-safe-area-context';

interface CameraPermissionModalProps {
  visible: boolean;
  onClose: () => void;
  onGranted: () => void;
  onDenied: () => void;
}

export function CameraPermissionModal({
  visible,
  onClose,
  onGranted,
  onDenied,
}: CameraPermissionModalProps) {
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [isChecking, setIsChecking] = React.useState(false);

  const handleRequestPermission = async () => {
    setIsChecking(true);
    try {
      const result = await requestCameraPermission();

      if (result.granted) {
        Toast.show({
          type: 'success',
          text1: 'Camera access granted',
        });
        setTimeout(() => {
          onGranted();
        }, 400);
      } else {
        Toast.show({
          type: 'error',
          text1: 'Camera access denied',
          text2: 'You can still upload photos from your gallery',
        });
        onDenied();
      }
    } catch {
      Toast.show({
        type: 'error',
        text1: 'Permission error',
        text2: 'Unable to request camera access',
      });
      onDenied();
    } finally {
      setIsChecking(false);
    }
  };

  const handleContinue = async () => {
    if (cameraPermission?.granted) {
      onGranted();
    } else if (cameraPermission?.canAskAgain === false) {
      Toast.show({
        type: 'error',
        text1: 'Camera permission denied',
        text2: 'Please enable camera access in Settings',
      });
      onDenied();
    } else {
      await handleRequestPermission();
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <SafeAreaView style={{ flex: 1 }}>
        <View className="flex-1 bg-black/60 justify-center items-center p-6">
          <Card className="w-full max-w-md">
            {/* Header */}
            <View className="flex-row items-start justify-between mb-6">
              <View className="flex-1 pr-4">
                <Text className="text-2xl font-bold mb-2">
                  Camera Access Required
                </Text>
                <Text className="text-sm text-muted-foreground leading-relaxed">
                  We need camera access to take photos of your plants for accurate diagnosis and identification.
                </Text>
              </View>
              <TouchableOpacity
                onPress={onClose}
                className="p-2 -mr-2 -mt-2"
              >
                <X size={24} color="#6B7280" strokeWidth={2} />
              </TouchableOpacity>
            </View>

            {/* Camera Permission Card */}
            <View className="mb-6">
              <View className="rounded-2xl bg-primary/5 border border-primary/30 px-4 py-4 flex-row gap-4">
                <View className="w-12 h-12 rounded-xl bg-primary/15 items-center justify-center">
                  <Camera size={24} color="#3F7C4C" strokeWidth={2} />
                </View>

                <View className="flex-1">
                  <Text className="font-semibold text-base mb-1">Camera</Text>
                  <Text className="text-sm text-muted-foreground leading-snug">
                    Take photos of your plants to diagnose health issues and identify species
                  </Text>
                </View>
              </View>
            </View>

            {/* Denied helper */}
            {cameraPermission?.canAskAgain === false && (
              <View className="rounded-xl bg-warning/10 border border-warning/30 px-4 py-3 mb-6 flex-row gap-3">
                <AlertCircle size={20} color="#D08A4E" strokeWidth={2} />
                <View className="flex-1">
                  <Text className="text-sm text-warning-foreground leading-relaxed">
                    Camera access was denied. You can still continue by uploading photos from your gallery.
                  </Text>
                </View>
              </View>
            )}

            {/* Actions */}
            <View className="space-y-6">
              <Button
                variant="primary"
                size="lg"
                fullWidth
                loading={isChecking}
                disabled={isChecking}
                onPress={handleContinue}
              >
                <Text className="text-on-primary font-semibold">
                  {cameraPermission?.granted ? 'Continue' : 'Grant Camera Access'}
                </Text>
              </Button>

              <Button
                variant="outline"
                size="md"
                fullWidth
                onPress={() => {
                  onDenied();
                  onClose();
                }}
              >
                <Text className="text-muted-foreground font-medium">
                  Use Gallery Instead
                </Text>
              </Button>
            </View>

            {/* Privacy note */}
            <Text className="text-xs text-muted-foreground text-center mt-4">
              We only use your camera when you take photos. Your privacy is protected.
            </Text>
          </Card>
        </View>
      </SafeAreaView>
    </Modal>
  );
}
