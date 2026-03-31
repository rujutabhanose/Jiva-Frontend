// Navigation types and screen names

export type RootNavigationState = 'splash' | 'auth' | 'main';

export type AuthScreen =
  | 'welcome'
  | 'signin'
  | 'register'
  | 'onboarding'
  | 'carousel' /* new tutorial carousel after onboarding */
  | 'forgot-password'
  | 'verify-otp'
  | 'reset-password';

export type MainTabScreen = 'home' | 'history' | 'profile';

export type AppScreen =
  | 'scan-start'
  | 'camera'
  | 'image-preview'
  | 'image-crop'
  | 'analysis-diagnose'
  | 'analysis-identify'
  | 'diagnosis'
  | 'plant-identification'
  | 'scan-limit'
  | 'history-detail'
  | 'condition-detail'
  | 'learn'
  | 'plant-care-tips'
  | 'edit-preferences'
  | 'privacy-policy'
  | 'offline'
  | 'error'
  | 'upgrade';

export type NavigationScreen = RootNavigationState | AuthScreen | MainTabScreen | AppScreen;

export interface NavigationState {
  rootState: RootNavigationState;
  authScreen: AuthScreen;
  mainTab: MainTabScreen;
  modalScreen: AppScreen | null;
  isAuthenticated: boolean;
}
