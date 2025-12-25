// src/navigation/RootNavigator.tsx
import React from "react";
import { View, Modal } from "react-native";
import { useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import * as ExpoSplashScreen from 'expo-splash-screen';
import { SplashScreen } from "../screens/SplashScreen";
import { AuthNavigator } from "./AuthNavigator";
import { MainNavigator } from "./MainNavigator";
import { OnboardingScreen } from "../screens/OnboardingScreen";
import { ScanStartScreen } from "../screens/ScanStartScreen";
import { CameraScreen } from "../screens/CameraScreen";
import { ImagePreviewScreen } from "../screens/ImagePreviewScreen";
import { AnalysisScreen } from "../screens/AnalysisScreen";
import { DiagnosisScreen } from "../screens/DiagnosisScreen";
import { PlantIdentificationScreen } from "../screens/PlantIdentificationScreen";
import { ScanLimitScreen } from "../screens/ScanLimitScreen";
import { HistoryDetailScreen } from "../screens/HistoryDetailScreen";
import { ConditionDetailScreen } from "../screens/ConditionDetailScreen";
import { LearnScreen } from "../screens/LearnScreen";
import { OfflineScreen } from "../screens/OfflineScreen";
import { ErrorScreen } from "../screens/ErrorScreen";
import { UpgradeModal } from "../components/UpgradeModal";
import { CameraPermissionModal } from "../components/CameraPermissionModal";
import { RootNavigationState, AppScreen, MainTabScreen } from "./types";
import Toast from "react-native-toast-message";
import { storage, UserType, PlantType } from "../utils/storage";
import { PlantIdentificationResult, DiagnosisResult, deleteAccount } from "../services/api";

interface RootNavigatorProps {
  userId: string;
  scansUsed: number;
  scansLimit: number;
  isPro: boolean;
  canScan: boolean;
  history: any[];
  currentScan: any | null;
  saveScan: (scan: any, backendMeta?: any) => Promise<void>;
  setCurrentScan: (scan: any | null) => void;
  updateScanNotes: (scanId: string, notes: string) => void;
  deleteScan: (scanId: string) => Promise<void>;
  upgradeToPro: () => Promise<{ success: boolean; message: string }>;
  redeemCoupon: (couponCode: string) => Promise<{ success: boolean; message: string }>;
  clearUserHistory: () => Promise<void>;
  reloadUserData: () => Promise<void>;
}

export function RootNavigator({
  userId,
  scansUsed,
  scansLimit,
  isPro,
  canScan,
  history,
  currentScan,
  saveScan,
  setCurrentScan,
  updateScanNotes,
  deleteScan,
  upgradeToPro,
  redeemCoupon,
  clearUserHistory,
  reloadUserData,
}: RootNavigatorProps) {
  console.log('[RootNavigator] Rendering with userId:', userId);
  const [cameraPermission] = useCameraPermissions();
  const [rootState, setRootState] = React.useState<RootNavigationState>('splash');
  const [modalScreen, setModalScreen] = React.useState<AppScreen | null>(null);
  const [activeTab, setActiveTab] = React.useState<MainTabScreen>('home');

  React.useEffect(() => {
    console.log('[RootNavigator] modalScreen state changed to:', modalScreen);
  }, [modalScreen]);
  const [capturedImage, setCapturedImage] = React.useState<string | null>(null);
  const [imageSource, setImageSource] = React.useState<'camera' | 'gallery'>('camera');
  const [scanMode, setScanMode] = React.useState<'identify' | 'diagnose'>('diagnose');
  const [isOnline, setIsOnline] = React.useState(true);
  const [hasError, setHasError] = React.useState(false);
  const [userData, setUserData] = React.useState<any>(null);
  const [showUpgradeModal, setShowUpgradeModal] = React.useState(false);
  const [showCameraPermissionModal, setShowCameraPermissionModal] = React.useState(false);
  const [plantIdentificationResult, setPlantIdentificationResult] = React.useState<PlantIdentificationResult | null>(null);
  const [diagnosisResult, setDiagnosisResult] = React.useState<DiagnosisResult | null>(null);
  const [pendingIdentificationScan, setPendingIdentificationScan] = React.useState<any | null>(null);
  const [pendingDiagnosisScan, setPendingDiagnosisScan] = React.useState<any | null>(null);

  // Load user data when component mounts or when returning to main
  React.useEffect(() => {
    const loadUserData = async () => {
      const data = await storage.getUserData();
      setUserData(data);
    };
    if (rootState === 'main') {
      loadUserData();
    }
  }, [rootState, modalScreen]);


  // Hide native splash screen once component mounts
  React.useEffect(() => {
    const hideSplash = async () => {
      try {
        await ExpoSplashScreen.hideAsync();
      } catch (error) {
        console.warn('Error hiding splash screen:', error);
      }
    };
    hideSplash();
  }, []);

  // Network status detection (disabled for React Native - would need @react-native-community/netinfo)
  React.useEffect(() => {
    // TODO: Implement network detection using @react-native-community/netinfo
    // For now, assume always online
    setIsOnline(true);
  }, []);

  // Navigation handlers
  const handleSplashComplete = async () => {
    try {
      // Check if user has a valid authentication token
      const isAuthenticated = await storage.isAuthenticated();

      if (isAuthenticated) {
        // User has token, navigate to main app (Home)
        setActiveTab('home'); // Always start on home screen
        setRootState('main');
      } else {
        // No token, navigate to auth screen
        setRootState('auth');
      }
    } catch (error) {
      console.error('Error checking authentication:', error);
      // On error, default to auth screen
      setRootState('auth');
    }
  };

  const handleAuthenticated = async (token?: string) => {
    // Save token if provided
    if (token) {
      await storage.setToken(token);
    }
    // Reload user data to fetch the new user's scans and info
    await reloadUserData();
    // Reset to home tab when logging in
    setActiveTab('home');
    setRootState('main');
  };

  const handleLogout = async () => {
    // Clear all auth data and user history
    await storage.clearAll();
    await clearUserHistory(); // Clear scan history when logging out
    setRootState('auth');
    Toast.show({ type: 'success', text1: 'Logged out successfully' });
  };

  const handleDeleteAccount = async () => {
    try {
      const token = await storage.getToken();
      if (!token) {
        Toast.show({
          type: 'error',
          text1: 'Not Authenticated',
          text2: 'Please log in again to delete your account'
        });
        await storage.clearAll();
        setRootState('auth');
        return;
      }

      // Call API to delete account
      await deleteAccount(token);

      // Clear local data and logout
      await storage.clearAll();

      // Navigate to auth screen
      setRootState('auth');

      Toast.show({
        type: 'success',
        text1: 'Account Deleted',
        text2: 'Your account has been permanently deleted'
      });
    } catch (error: any) {
      console.error('Delete account error:', error);

      // Handle session expiry specifically
      if (error.statusCode === 401 || error.userFriendlyError?.type === 'UNAUTHORIZED') {
        Toast.show({
          type: 'error',
          text1: 'Session Expired',
          text2: 'Please log in again to delete your account'
        });
        // Clear expired token and redirect to login
        await storage.clearAll();
        setRootState('auth');
        return;
      }

      Toast.show({
        type: 'error',
        text1: 'Delete Failed',
        text2: error.userFriendlyError?.message || 'Failed to delete account. Please try again.'
      });
    }
  };

  const handleNavigate = (screen: AppScreen | MainTabScreen | string) => {
    console.log('[RootNavigator] handleNavigate called with:', screen);
    // Parse mode from query string if present (e.g., "scan-start?mode=identify")
    if (typeof screen === 'string' && screen.includes('?mode=')) {
      const [baseScreen, queryString] = screen.split('?');
      const params = new URLSearchParams(queryString);
      const mode = params.get('mode') as 'identify' | 'diagnose';

      console.log('[RootNavigator] Parsed mode:', mode, 'baseScreen:', baseScreen);

      if (mode) {
        setScanMode(mode);
        
        // Check scan limits for diagnose mode immediately
        // Plant identification is FREE, so always allow
        if (mode === 'diagnose' && !canScan) {
          // User exhausted free scans - show upgrade modal
          console.log('[RootNavigator] Scan limit reached, showing upgrade modal');
          setShowUpgradeModal(true);
          return; // Don't open scan-start screen
        }
      }
      console.log('[RootNavigator] Setting modalScreen to:', baseScreen);
      setModalScreen(baseScreen as AppScreen);
    } else {
      console.log('[RootNavigator] Setting modalScreen to:', screen);
      setModalScreen(screen as AppScreen);
    }
  };

  const handleScanStart = () => {
    console.log('[handleScanStart] scanMode:', scanMode, 'canScan:', canScan, 'scansUsed:', scansUsed, 'scansLimit:', scansLimit, 'isPro:', isPro);

    // Plant identification is FREE - always allow
    // Only check scan limits for diagnosis (paid feature)
    if (scanMode === 'diagnose' && !canScan) {
      // Show upgrade modal for diagnosis when scan limit reached
      console.log('[handleScanStart] Showing upgrade modal - scan limit reached');
      setShowUpgradeModal(true);
    } else {
      // Check if camera permission is already granted
      if (cameraPermission?.granted) {
        // Permission already granted, go directly to camera
        console.log('[handleScanStart] Opening camera directly');
        setModalScreen('camera');
      } else {
        // Need to request permission, show modal
        console.log('[handleScanStart] Showing permission modal');
        setShowCameraPermissionModal(true);
      }
    }
  };

  const handleSelectPlan = async (plan: 'monthly' | 'yearly') => {
    // This will be handled by UpgradeModal with RevenueCat
    // Just close the modal, UpgradeModal will handle the purchase
    setShowUpgradeModal(false);
  };

  const handleCameraCapture = (imageData: string) => {
    console.log('[RootNavigator] handleCameraCapture called with image data length:', imageData?.length);
    setCapturedImage(imageData);
    setImageSource('camera');
    console.log('[RootNavigator] Setting modal screen to image-preview');
    setModalScreen('image-preview');
  };

  const handleGallerySelect = (imageData: string) => {
    console.log('[RootNavigator] handleGallerySelect called with image data length:', imageData?.length);
    setCapturedImage(imageData);
    setImageSource('gallery');
    setModalScreen('image-preview');
  };

  const openGalleryPicker = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.9,
        base64: true,
      });

      if (!result.canceled && result.assets?.length) {
        const asset = result.assets[0];
        const imageData = asset.base64
          ? `data:image/jpeg;base64,${asset.base64}`
          : asset.uri;

        handleGallerySelect(imageData);
      }
    } catch (error: any) {
      if (error.message?.includes('permission')) {
        Toast.show({
          type: 'error',
          text1: 'Permission Required',
          text2: 'Please enable photo library access in Settings',
        });
      } else {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: 'Failed to select image',
        });
      }
    }
  };

  const handleAnalysisComplete = (result: PlantIdentificationResult | DiagnosisResult, scanType: 'diagnose' | 'identify') => {
    if (scanType === 'diagnose') {
      const diagnosisData = result as DiagnosisResult;
      setDiagnosisResult(diagnosisData);

      const newScan = {
        id: Date.now().toString(), // Temporary ID, will be replaced by backend ID
        image: capturedImage || '',
        condition: diagnosisData.condition,
        confidence: diagnosisData.confidence,
        date: new Date(),
        symptoms: diagnosisData.symptoms || [],
        causes: diagnosisData.causes || [],
        treatment: diagnosisData.treatment || [],
        mode: 'diagnosis' as const,
        category: diagnosisData.category,
        severity: diagnosisData.severity,
        health_score: (diagnosisData as any).health_score,
        diagnosis_data: diagnosisData,
      };

      // Store diagnosis scan temporarily - only save when user clicks Save button
      setPendingDiagnosisScan(newScan);
      setModalScreen('diagnosis');
    } else {
      const identificationData = result as PlantIdentificationResult;
      setPlantIdentificationResult(identificationData);

      // Store identification scan temporarily - only save when user clicks Save button
      const newScan = {
        id: Date.now().toString(), // Temporary ID, will be replaced by backend ID
        image: capturedImage || '',
        plant_name: identificationData.plant_name,
        confidence: identificationData.confidence_percent || (identificationData.confidence * 100) || 0,
        date: new Date(),
        mode: 'identification' as const,
        plantInfo: (identificationData as any).plantInfo || null,
      };

      setPendingIdentificationScan(newScan);
      setModalScreen('plant-identification');
    }
  };

  const handleViewHistory = (scan: any) => {
    console.log('[RootNavigator] handleViewHistory called with scan:', scan);
    console.log('[RootNavigator] Scan mode:', scan?.mode);
    console.log('[RootNavigator] Scan has treatment:', !!scan?.treatment);
    setCurrentScan(scan);
    setModalScreen('history-detail');
    console.log('[RootNavigator] Modal screen set to history-detail');
  };

  const handleBackToMain = () => {
    setModalScreen(null);
    setCapturedImage(null);
    setPlantIdentificationResult(null);
    setDiagnosisResult(null);
    setPendingIdentificationScan(null); // Discard unsaved identification
    setPendingDiagnosisScan(null); // Discard unsaved diagnosis
    setScanMode('diagnose'); // Reset to default
  };

  const handleRetry = () => {
    setHasError(false);
    setModalScreen(null);
  };

  const handlePreferencesUpdate = async (userType: UserType | null, plantTypes: PlantType[]) => {
    // Save preferences
    await storage.updateOnboardingData(userType, plantTypes);

    // Reload user data
    const data = await storage.getUserData();
    setUserData(data);

    Toast.show({ type: 'success', text1: 'Preferences updated successfully!' });
    setModalScreen(null);
  };

  // Show splash screen
  if (rootState === 'splash') {
    return (
      <SplashScreen
        onComplete={handleSplashComplete}
        duration={4000}
      />
    );
  }

  // Show offline screen
  if (!isOnline) {
    return <OfflineScreen onRetry={() => setIsOnline(true)} />;
  }

  // Show error screen
  if (hasError) {
    return (
      <ErrorScreen
        title="Something went wrong"
        message="We encountered an unexpected error. Please try again."
        onRetry={handleRetry}
      />
    );
  }

  // Show auth flow
  if (rootState === 'auth') {
    return <AuthNavigator onAuthenticated={handleAuthenticated} />;
  }

  // Show main app with modal screens
  return (
    <>
      {/* Main app - always rendered but may be covered by modals */}
      <View style={{ display: modalScreen ? 'none' : 'flex', flex: 1 }}>
        <MainNavigator
          scansUsed={scansUsed}
          scansLimit={scansLimit}
          isPro={isPro}
          history={history}
          userData={userData}
          onNavigate={handleNavigate}
          onSelectScan={handleViewHistory}
          onJoinBeta={() => Toast.show({ type: 'success', text1: 'Beta program functionality coming soon' })}
          onLogout={handleLogout}
          onUpgrade={() => setShowUpgradeModal(true)}
          onDeleteAccount={handleDeleteAccount}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />
      </View>

      {/* Modal/Full Screen overlays */}
      {modalScreen === 'scan-start' && (
        <ScanStartScreen
          onCamera={handleScanStart}
          onGallery={handleGallerySelect}
          onBack={handleBackToMain}
        />
      )}

      {modalScreen === 'camera' && (
        <CameraScreen
          onCapture={handleCameraCapture}
          onClose={() => setModalScreen('scan-start')}
          mode={scanMode}
        />
      )}

      {modalScreen === 'image-preview' && capturedImage && (
        <ImagePreviewScreen
          image={capturedImage}
          mode={scanMode}
          source={imageSource}
          onRetake={() => {
            if (imageSource === 'gallery') {
              // Directly open gallery picker again
              openGalleryPicker();
            } else {
              setModalScreen('camera');
            }
          }}
          onContinue={() => {
            if (scanMode === 'diagnose') {
              setModalScreen('analysis-diagnose');
            } else {
              setModalScreen('analysis-identify');
            }
          }}
        />
      )}

      {modalScreen === 'analysis-diagnose' && capturedImage && (
        <AnalysisScreen
          scanType="diagnose"
          image={capturedImage}
          onComplete={(result) => handleAnalysisComplete(result, 'diagnose')}
          onCancel={() => setModalScreen('image-preview')}
          onPaymentRequired={() => {
            setModalScreen(null);
            setShowUpgradeModal(true);
          }}
        />
      )}

      {modalScreen === 'analysis-identify' && capturedImage && (
        <AnalysisScreen
          scanType="identify"
          image={capturedImage}
          onComplete={(result) => handleAnalysisComplete(result, 'identify')}
          onCancel={() => setModalScreen('image-preview')}
          onPaymentRequired={() => {
            setModalScreen(null);
            setShowUpgradeModal(true);
          }}
        />
      )}

      {modalScreen === 'diagnosis' && pendingDiagnosisScan && (
        <DiagnosisScreen
          image={pendingDiagnosisScan.image}
          condition={pendingDiagnosisScan.condition}
          confidence={pendingDiagnosisScan.confidence}
          symptoms={pendingDiagnosisScan.symptoms}
          causes={pendingDiagnosisScan.causes}
          treatment={pendingDiagnosisScan.treatment}
          onBack={handleBackToMain}
          onSave={async () => {
            if (pendingDiagnosisScan) {
              try {
                await saveScan(pendingDiagnosisScan);
                Toast.show({ type: 'success', text1: 'Diagnosis saved to history' });
                // Stay on diagnosis page - user can click "Scan" or back button
              } catch (error) {
                console.error('[RootNavigator] Error saving diagnosis:', error);
                Toast.show({
                  type: 'error',
                  text1: 'Failed to save diagnosis',
                  text2: error instanceof Error ? error.message : 'Please try again'
                });
              }
            }
          }}
          onScanAnother={() => {
            setCapturedImage(null);
            setPendingDiagnosisScan(null);
            setModalScreen('scan-start');
          }}
        />
      )}

      {modalScreen === 'plant-identification' && capturedImage && plantIdentificationResult && (
        <PlantIdentificationScreen
          image={capturedImage}
          plant_name={plantIdentificationResult.plant_name}
          confidence={
            (plantIdentificationResult as any).confidence_percent !== undefined
              ? (plantIdentificationResult as any).confidence_percent
              : (plantIdentificationResult.confidence !== undefined
                  ? plantIdentificationResult.confidence * 100
                  : 0)
          }
          plantInfo={(plantIdentificationResult as any).plantInfo || null}
          onBack={handleBackToMain}
          onSave={async () => {
            // Save the pending identification scan to history
            if (pendingIdentificationScan) {
              try {
                await saveScan(pendingIdentificationScan);
                Toast.show({ type: 'success', text1: 'Plant information saved' });
                // Stay on identification page - user can click "Scan" or back button
              } catch (error) {
                console.error('[RootNavigator] Error saving identification:', error);
                Toast.show({
                  type: 'error',
                  text1: 'Failed to save plant information',
                  text2: error instanceof Error ? error.message : 'Please try again'
                });
              }
            }
          }}
          onScanAnother={() => {
            setCapturedImage(null);
            setPlantIdentificationResult(null);
            setPendingIdentificationScan(null);
            setModalScreen('scan-start');
          }}
        />
      )}

      {modalScreen === 'scan-limit' && (
        <ScanLimitScreen
          onUpgrade={() => Toast.show({ type: 'success', text1: 'Upgrade functionality coming soon' })}
          onJoinBeta={() => Toast.show({ type: 'success', text1: 'Beta program functionality coming soon' })}
          onBack={handleBackToMain}
        />
      )}

      <Modal
        visible={modalScreen === 'history-detail' && !!currentScan}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => {
          console.log('[RootNavigator] Modal onRequestClose called');
          setModalScreen(null);
          setCurrentScan(null);
        }}
      >
        {currentScan && (
          <HistoryDetailScreen
            scan={currentScan}
            onBack={() => {
              console.log('[RootNavigator] History detail onBack called');
              setModalScreen(null);
              setCurrentScan(null);
            }}
            onEditNotes={(notes: string) => updateScanNotes(currentScan.id, notes)}
            onDelete={async () => {
              try {
                await deleteScan(currentScan.id);
                Toast.show({ type: 'success', text1: 'Scan deleted' });
                setModalScreen(null);
                setCurrentScan(null);
              } catch (error) {
                console.error('[RootNavigator] Error deleting scan:', error);
                Toast.show({ type: 'error', text1: 'Failed to delete scan' });
              }
            }}
          />
        )}
      </Modal>

      {modalScreen === 'condition-detail' && currentScan && (
        <ConditionDetailScreen
          condition={currentScan.condition}
          onBack={() => setModalScreen('history-detail')}
          onScanForThis={() => setModalScreen('scan-start')}
        />
      )}

      {modalScreen === 'learn' && (
        <LearnScreen
          onNavigate={(screen: string) => setModalScreen(screen as AppScreen)}
          onConditionSelect={() => Toast.show({ type: 'success', text1: 'Condition details coming soon' })}
        />
      )}

      {modalScreen === 'edit-preferences' && (
        <OnboardingScreen
          userName={userData?.name}
          initialUserType={userData?.userType}
          initialPlantTypes={userData?.plantTypes || []}
          onComplete={handlePreferencesUpdate}
          onSkip={() => setModalScreen(null)}
          onBack={() => setModalScreen(null)}
          showSkip={false}
          mode="edit"
        />
      )}

      {/* Upgrade Modal */}
      {console.log('[RootNavigator] Passing deviceId to UpgradeModal:', userId)}
      <UpgradeModal
        visible={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        onSelectPlan={handleSelectPlan}
        onRedeemCoupon={redeemCoupon}
        onUpgradeSuccess={async () => {
          // Refresh user data after successful purchase
          await reloadUserData();
          const result = await upgradeToPro();
          if (!result.success) {
            Toast.show({
              type: 'error',
              text1: 'Upgrade failed',
              text2: result.message,
            });
          }
        }}
        deviceId={userId}
        scansUsed={scansUsed}
        scansLimit={scansLimit}
      />

      {/* Camera Permission Modal */}
      <CameraPermissionModal
        visible={showCameraPermissionModal}
        onClose={() => setShowCameraPermissionModal(false)}
        onGranted={() => {
          setShowCameraPermissionModal(false);
          setModalScreen('camera');
        }}
        onDenied={() => {
          setShowCameraPermissionModal(false);
          setModalScreen('scan-start');
        }}
      />
    </>
  );
}
