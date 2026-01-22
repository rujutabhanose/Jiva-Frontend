import '../global.css';
import React from "react";
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as SplashScreen from 'expo-splash-screen';
import { AppProvider, useApp } from "./context/AppContext";
import { RootNavigator } from "./navigation/RootNavigator";
import Toast from 'react-native-toast-message';

// Keep the native splash screen visible while we load resources
SplashScreen.preventAutoHideAsync();

function AppContent() {
  const {
    userId,
    scansUsed,
    scansLimit,
    history,
    currentScan,
    saveScan,
    setCurrentScan,
    updateScanNotes,
    deleteScan,
    isPro,
    upgradeToPro,
    cancelSubscription,
    redeemCoupon,
    canScan,
    reloadUserData,
    incrementScansUsed,
  } = useApp();

  console.log('[App] AppContent rendering with userId:', userId);

  return (
    <RootNavigator
      userId={userId}
      scansUsed={scansUsed}
      scansLimit={scansLimit}
      isPro={isPro}
      canScan={canScan}
      history={history}
      currentScan={currentScan}
      saveScan={saveScan}
      setCurrentScan={setCurrentScan}
      updateScanNotes={updateScanNotes}
      deleteScan={deleteScan}
      upgradeToPro={upgradeToPro}
      cancelSubscription={cancelSubscription}
      redeemCoupon={redeemCoupon}
      reloadUserData={reloadUserData}
      incrementScansUsed={incrementScansUsed}
    />
  );
}

export default function App() {
  console.log('[App] App component rendering...');
  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <AppProvider>
        <AppContent />
      </AppProvider>
      <Toast />
    </SafeAreaProvider>
  );
}
