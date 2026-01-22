import { View, TouchableOpacity, Text, StyleSheet, BackHandler } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useEffect, useRef } from 'react';
import { StatusBar } from 'expo-status-bar';
import { X } from 'lucide-react-native';

interface CameraScreenProps {
  onCapture: (imageUri: string) => void;
  onClose: () => void;
  mode?: 'identify' | 'diagnose';
}

export function CameraScreen({ onCapture, onClose, mode = 'diagnose' }: CameraScreenProps) {
  const cameraRef = useRef<CameraView>(null);
  const [permission, requestPermission] = useCameraPermissions();

  // Handle Android back button
  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      onClose();
      return true; // Prevent default back behavior
    });

    return () => backHandler.remove();
  }, [onClose]);

  // Request permission on mount if not already granted
  useEffect(() => {
    if (permission && !permission.granted && permission.canAskAgain) {
      requestPermission();
    }
  }, [permission, requestPermission]);

  if (!permission) return <View style={styles.container} />;

  if (!permission.granted)
    return (
      <View style={styles.container}>
        <View style={styles.permissionDenied}>
          <Text style={styles.permissionText}>Camera permission denied</Text>
          <TouchableOpacity onPress={onClose} style={styles.backButton}>
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </View>
    );

  const handleCapture = async () => {
    if (!cameraRef.current) return;

    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.9,
        base64: false,
      });

      if (photo?.uri) {
        onCapture(photo.uri);
      }
    } catch (error) {
      console.error('Error capturing photo:', error);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar hidden />

      <CameraView
        ref={cameraRef}
        style={StyleSheet.absoluteFillObject}
        facing="back"
      />

      {/* Top Controls - Back Button */}
      <View style={styles.topControls}>
        <TouchableOpacity
          onPress={onClose}
          style={styles.backButtonContainer}
          accessibilityLabel="Go back"
        >
          <View style={styles.backButtonIcon}>
            <X size={24} color="#FEFCE8" strokeWidth={2} />
          </View>
        </TouchableOpacity>
      </View>

      {/* Instruction Hint */}
      <View style={styles.hintContainer}>
        <View style={styles.hintBadge}>
          <Text style={styles.hintText}>
            {mode === 'identify'
              ? 'Point camera at a leaf'
              : 'Point camera at the affected leaf'}
          </Text>
        </View>
      </View>

      {/* Bottom Controls */}
      <View style={styles.controls}>
        <TouchableOpacity
          style={styles.captureButton}
          onPress={handleCapture}
          accessibilityLabel="Capture photo"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  topControls: {
    position: 'absolute',
    top: 50,
    left: 20,
    right: 20,
    zIndex: 10,
  },
  backButtonContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonIcon: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  hintContainer: {
    position: 'absolute',
    top: 110,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 10,
  },
  hintBadge: {
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
  hintText: {
    color: '#FEFCE8',
    fontSize: 14,
    fontWeight: '500',
  },
  controls: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 10,
  },
  captureButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#FEFCE8',
    borderWidth: 4,
    borderColor: '#3F7C4C',
  },
  permissionDenied: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#F7F4EC',
  },
  permissionText: {
    fontSize: 16,
    color: '#1F2933',
    marginBottom: 20,
    textAlign: 'center',
  },
  backButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#3F7C4C',
    borderRadius: 8,
  },
  backButtonText: {
    color: '#FEFCE8',
    fontSize: 16,
    fontWeight: '600',
  },
});