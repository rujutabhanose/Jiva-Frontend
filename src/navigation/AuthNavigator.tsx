// src/navigation/AuthNavigator.tsx
import React from "react";
import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { WelcomeScreen } from "../screens/WelcomeScreen";
import { SignInScreen } from "../screens/SignInScreen";
import { RegisterScreen } from "../screens/RegisterScreen";
import { OnboardingScreen } from "../screens/OnboardingScreen";
import { AuthScreen } from "./types";
import Toast from "react-native-toast-message";
import { storage, UserType, PlantType } from "../utils/storage";
import { registerUser, loginUser, updateUserProfile } from "../services/api";

interface AuthNavigatorProps {
  onAuthenticated: (token?: string) => void;
}

export function AuthNavigator({ onAuthenticated }: AuthNavigatorProps) {
  const [currentScreen, setCurrentScreen] = React.useState<AuthScreen>('welcome');
  const [userName, setUserName] = React.useState<string>('');
  const [signInLoading, setSignInLoading] = React.useState(false);
  const [signInError, setSignInError] = React.useState<string | null>(null);

  const handleGetStarted = () => {
    setCurrentScreen('register');
  };

  const handleSignIn = async (email: string, password: string) => {
    console.log('[AuthNavigator] Sign in with:', email);
    setSignInLoading(true);
    setSignInError(null);

    try {
      // Call backend API to authenticate user
      const authResponse = await loginUser(email, password);
      console.log('[AuthNavigator] Login response:', authResponse);

      // Save token
      await storage.setToken(authResponse.access_token);

      // Save user data from backend
      await storage.setUserData({
        name: authResponse.user.name,
        email: authResponse.user.email,
        country: authResponse.user.country,
        userType: authResponse.user.userType as UserType | null,
        plantTypes: authResponse.user.plantTypes as PlantType[],
      });

      // DEBUG: Log premium status from backend
      console.log('[AuthNavigator DEBUG] Login - Backend isPremium:', authResponse.user.isPremium);
      console.log('[AuthNavigator DEBUG] Login - Backend isPremium type:', typeof authResponse.user.isPremium);

      // Clear previous premium status and set fresh value from backend
      await AsyncStorage.removeItem('@jiva:isPro');
      const isPro = authResponse.user.isPremium ? 'true' : 'false';
      await AsyncStorage.setItem('@jiva:isPro', isPro);
      await AsyncStorage.setItem('@jiva:scansUsed', '0'); // Reset on fresh login

      console.log('[AuthNavigator DEBUG] Login - Set isPro in AsyncStorage to:', isPro);
      console.log('[AuthNavigator] Sign in successful, name:', authResponse.user.name);
      setSignInLoading(false);
      Toast.show({ type: 'success', text1: `Welcome, ${authResponse.user.name}!` });
      onAuthenticated(authResponse.access_token);
    } catch (error: any) {
      console.error('[AuthNavigator] Error during sign in:', error);
      const errorMessage = error.userFriendlyError?.message || error.message || 'Sign in failed';
      setSignInLoading(false);
      setSignInError(errorMessage);
    }
  };

  const handleRegister = async (name: string, email: string, password: string, country: string) => {
    console.log('[AuthNavigator] Register with:', { name, email, country });

    try {
      // Get device ID and platform information
      const deviceId = await AsyncStorage.getItem('@jiva:userId');
      const platform = Platform.OS; // 'ios' or 'android'

      console.log('[AuthNavigator] Device info:', { deviceId, platform });

      // Call backend API to create user account
      // Note: We only send basic info now, onboarding data will be sent later
      const authResponse = await registerUser(name, email, password, country, null, undefined, deviceId || undefined, platform);
      console.log('[AuthNavigator] Registration response:', authResponse);

      // DEBUG: Log premium status from backend
      console.log('[AuthNavigator DEBUG] Backend isPremium:', authResponse.user.isPremium);
      console.log('[AuthNavigator DEBUG] Backend isPremium type:', typeof authResponse.user.isPremium);

      // Save token
      await storage.setToken(authResponse.access_token);

      // Save user data from backend
      await storage.setUserData({
        name: authResponse.user.name,
        email: authResponse.user.email,
        country: authResponse.user.country,
      });

      // IMPORTANT: Clear any previous premium status from AsyncStorage first to ensure fresh start
      // This prevents stale data from affecting new accounts
      await AsyncStorage.removeItem('@jiva:isPro');
      console.log('[AuthNavigator DEBUG] Cleared previous isPro from AsyncStorage');

      // Save premium status to sync with backend
      const isPro = authResponse.user.isPremium ? 'true' : 'false';
      await AsyncStorage.setItem('@jiva:isPro', isPro);
      await AsyncStorage.setItem('@jiva:scansUsed', '0'); // Reset on fresh registration

      console.log('[AuthNavigator DEBUG] Set isPro in AsyncStorage to:', isPro);

      // Save user name for onboarding
      setUserName(name);

      console.log('[AuthNavigator] Registration successful, navigating to onboarding');

      // Show success message
      Toast.show({
        type: 'success',
        text1: 'Account created!',
        text2: `Welcome, ${name}!`,
        visibilityTime: 3000,
      });

      // Navigate directly to onboarding screen
      setCurrentScreen('onboarding');
    } catch (error: any) {
      console.error('[AuthNavigator] Error during registration:', error);
      const errorMessage = error.userFriendlyError?.message || error.message || 'Registration failed';
      Toast.show({ type: 'error', text1: 'Registration failed', text2: errorMessage });
    }
  };

  const handleOnboardingComplete = async (userType: UserType | null, plantTypes: PlantType[]) => {
    console.log('[AuthNavigator] Onboarding complete with:', { userType, plantTypes });

    try {
      // Save onboarding data locally first
      console.log('[AuthNavigator] Saving onboarding data locally...');
      await storage.updateOnboardingData(userType, plantTypes);

      // Sync preferences to backend so they persist across logins
      console.log('[AuthNavigator] Syncing preferences to backend...');
      try {
        await updateUserProfile({
          userType: userType,
          plantTypes: plantTypes as string[],
        });
        console.log('[AuthNavigator] Preferences synced to backend successfully');
      } catch (syncError) {
        // Don't fail onboarding if backend sync fails - local storage is enough for now
        console.warn('[AuthNavigator] Failed to sync preferences to backend:', syncError);
      }

      console.log('[AuthNavigator] Onboarding data saved successfully');
      Toast.show({ type: 'success', text1: 'Profile updated!' });

      // Now proceed to main app
      console.log('[AuthNavigator] Getting token and authenticating...');
      const token = await storage.getToken();
      console.log('[AuthNavigator] Token retrieved, calling onAuthenticated');
      onAuthenticated(token || undefined);
    } catch (error) {
      console.error('[AuthNavigator] Error during onboarding completion:', error);
      Toast.show({ type: 'error', text1: 'Failed to save preferences', text2: String(error) });
    }
  };

  const handleOnboardingSkip = async () => {
    // Mark onboarding as skipped
    await storage.setUserData({ onboardingSkipped: true });

    Toast.show({ type: 'success', text1: 'You can complete this later in your profile' });

    // Proceed to main app
    const token = await storage.getToken();
    onAuthenticated(token || undefined);
  };

  return (
    <>
      {currentScreen === 'welcome' && (
        <WelcomeScreen
          onGetStarted={handleGetStarted}
          onSignIn={() => setCurrentScreen('signin')}
        />
      )}

      {currentScreen === 'signin' && (
        <SignInScreen
          onSignIn={handleSignIn}
          onBack={() => setCurrentScreen('welcome')}
          onRegister={() => setCurrentScreen('register')}
          isLoading={signInLoading}
          error={signInError}
        />
      )}

      {currentScreen === 'register' && (
        <RegisterScreen
          onRegister={handleRegister}
          onBack={() => setCurrentScreen('welcome')}
          onSignIn={() => setCurrentScreen('signin')}
        />
      )}

      {currentScreen === 'onboarding' && (
        <OnboardingScreen
          userName={userName}
          onComplete={handleOnboardingComplete}
          onSkip={handleOnboardingSkip}
        />
      )}
    </>
  );
}
