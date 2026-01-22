// src/navigation/MainNavigator.tsx
import React from "react";
import { View } from "react-native";
import { HomeScreen } from "../screens/HomeScreen";
import { HistoryScreen } from "../screens/HistoryScreen";
import { ProfileScreen } from "../screens/ProfileScreen";
import { TabNavigator } from "./TabNavigator";
import { MainTabScreen, AppScreen } from "./types";

interface MainNavigatorProps {
  scansUsed: number;
  scansLimit: number;
  isPro: boolean;
  history: any[];
  userData?: any;
  onNavigate: (screen: AppScreen | MainTabScreen | string) => void;
  onSelectScan: (scan: any) => void;
  onJoinBeta: () => void;
  onLogout: () => void;
  onUpgrade?: () => void;
  onCancelSubscription?: () => void;
  onDeleteAccount?: () => void;
  activeTab?: MainTabScreen;
  onTabChange?: (tab: MainTabScreen) => void;
}

export function MainNavigator({
  scansUsed,
  scansLimit,
  isPro,
  history,
  userData,
  onNavigate,
  onSelectScan,
  onJoinBeta,
  onLogout,
  onUpgrade,
  onCancelSubscription,
  onDeleteAccount,
  activeTab: externalActiveTab,
  onTabChange: externalOnTabChange,
}: MainNavigatorProps) {
  const [internalActiveTab, setInternalActiveTab] = React.useState<MainTabScreen>('home');

  // Use external state if provided, otherwise use internal state
  const activeTab = externalActiveTab ?? internalActiveTab;
  const setActiveTab = externalOnTabChange ?? setInternalActiveTab;

  const handleTabChange = (tab: MainTabScreen) => {
    setActiveTab(tab);
  };

  const handleNavigate = (screen: string) => {
    console.log('[MainNavigator] handleNavigate called with:', screen);
    // If navigating to a tab, update active tab
    if (screen === 'home' || screen === 'history' || screen === 'profile') {
      setActiveTab(screen as MainTabScreen);
    } else {
      // Navigate to modal/full screen - pass as string to allow query params
      console.log('[MainNavigator] Passing to RootNavigator:', screen);
      onNavigate(screen);
    }
  };

  const handleEditPreferences = () => {
    // Navigate to edit preferences screen
    onNavigate('edit-preferences' as AppScreen);
  };

  const handleUpgrade = () => {
    // Show upgrade modal
    if (onUpgrade) {
      onUpgrade();
    }
  };

  return (
    <View className="flex-1 bg-background pb-20">
        {/* Tab content */}
        {activeTab === 'home' && (
          <HomeScreen
            scansUsed={scansUsed}
            scansLimit={scansLimit}
            isPro={isPro}
            onNavigate={handleNavigate}
            onUpgrade={handleUpgrade}
          />
        )}

        {activeTab === 'history' && (
          <HistoryScreen
            history={history}
            onSelectScan={onSelectScan}
            onNavigate={handleNavigate}
          />
        )}

        {activeTab === 'profile' && (
          <ProfileScreen
            isPro={isPro}
            userData={userData}
            onNavigate={handleNavigate}
            onJoinBeta={onJoinBeta}
            onLogout={onLogout}
            onEditPreferences={handleEditPreferences}
            onUpgrade={handleUpgrade}
            onCancelSubscription={onCancelSubscription}
            onDeleteAccount={onDeleteAccount}
          />
        )}

        {/* Bottom Tab Bar */}
        <TabNavigator
          activeTab={activeTab}
          onTabChange={handleTabChange}
        />
    </View>
  );
}
