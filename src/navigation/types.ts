// Navigation types and screen names

export type RootNavigationState = 'splash' | 'auth' | 'main';

export type AuthScreen = 'welcome' | 'signin' | 'register' | 'onboarding';

export type MainTabScreen = 'home' | 'history' | 'profile';

export type AppScreen =
  | 'scan-start'
  | 'camera'
  | 'permissions'
  | 'image-preview'
  | 'analysis-diagnose'
  | 'analysis-identify'
  | 'diagnosis'
  | 'plant-identification'
  | 'scan-limit'
  | 'history-detail'
  | 'condition-detail'
  | 'learn'
  | 'edit-preferences'
  | 'offline'
  | 'error';

export type NavigationScreen = RootNavigationState | AuthScreen | MainTabScreen | AppScreen;

export interface NavigationState {
  rootState: RootNavigationState;
  authScreen: AuthScreen;
  mainTab: MainTabScreen;
  modalScreen: AppScreen | null;
  isAuthenticated: boolean;
}
