// API Configuration
// Update this URL to match your backend server
// For Android Emulator: use 10.0.2.2 to access host machine's localhost
// For iOS Simulator: use localhost
// For physical device: use your computer's IP address
import { Platform } from 'react-native';
import Constants from 'expo-constants';

// Detect if running on physical device vs emulator/simulator
const isDevice = Constants.isDevice;

// Get the appropriate base URL based on platform and device type
function getApiBaseUrl(): string {
  if (!__DEV__) {
    return 'https://api.jivaplants.com'; // Production
  }

  // Running on physical device - use production server
  if (isDevice) {
    return 'https://api.jivaplants.com';
  }

  return 'https://api.jivaplants.com';
}

export const API_BASE_URL = getApiBaseUrl();

// RevenueCat Configuration - Platform-specific keys
// Get your keys from: https://app.revenuecat.com/settings/api-keys
const REVENUECAT_KEYS = {
  android: 'goog_pDPsssSURWwfWcergnclpenWTrC',
  ios: 'appl_xwEZFQSlbQZjWAJQptbEUQspMot',
};

function getRevenueCatApiKey(): string {
  if (Platform.OS === 'android') {
    return REVENUECAT_KEYS.android;
  } else {
    return REVENUECAT_KEYS.ios;
  }
}

// Set to false for production (currently using production keys)
export const REVENUECAT_DEV_MODE = false;

export const REVENUECAT_API_KEY = getRevenueCatApiKey();

export const API_ENDPOINTS = {
  // Auth endpoints
  REGISTER: `${API_BASE_URL}/api/v1/auth/register`,
  LOGIN: `${API_BASE_URL}/api/v1/auth/login`,
  LOGOUT: `${API_BASE_URL}/api/v1/auth/logout`,
  REFRESH: `${API_BASE_URL}/api/v1/auth/refresh`,
  RESEND_VERIFICATION: `${API_BASE_URL}/api/v1/auth/resend-verification`,
  FORGOT_PASSWORD: `${API_BASE_URL}/api/v1/auth/forgot-password`,
  VERIFY_RESET_OTP: `${API_BASE_URL}/api/v1/auth/verify-reset-otp`,
  RESET_PASSWORD: `${API_BASE_URL}/api/v1/auth/reset-password`,

  // User endpoints (all require authentication)
  PROFILE: `${API_BASE_URL}/api/v1/users/me`,
  UPGRADE_TO_PRO: `${API_BASE_URL}/api/v1/users/upgrade`,
  CANCEL_SUBSCRIPTION: `${API_BASE_URL}/api/v1/users/cancel-subscription`,

  DELETE_ACCOUNT: `${API_BASE_URL}/api/v1/users/me`,

  // Scan endpoints
  DIAGNOSE: `${API_BASE_URL}/api/v1/diagnose/`,
  IDENTIFY: `${API_BASE_URL}/api/v1/identify/`,

  // Scan history endpoints
  CREATE_SCAN: `${API_BASE_URL}/api/v1/scans/`,
  GET_SCANS: `${API_BASE_URL}/api/v1/scans/`,
  GET_SCAN: (scanId: number) => `${API_BASE_URL}/api/v1/scans/${scanId}`,
  UPDATE_SCAN_NOTES: (scanId: number) => `${API_BASE_URL}/api/v1/scans/${scanId}/notes`,
  DELETE_SCAN: (scanId: number) => `${API_BASE_URL}/api/v1/scans/${scanId}`,
  GET_SCAN_STATS: `${API_BASE_URL}/api/v1/scans/stats/summary`,

  // Coupon endpoints
  VALIDATE_COUPON: `${API_BASE_URL}/api/v1/coupons/validate`,
  REDEEM_COUPON: `${API_BASE_URL}/api/v1/coupons/redeem`,

  // Feedback endpoints
  SUBMIT_DIAGNOSIS_FEEDBACK: `${API_BASE_URL}/api/v1/feedback/diagnosis`,
};
