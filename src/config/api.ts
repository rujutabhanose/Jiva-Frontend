// API Configuration
// Update this URL to match your backend server
// For Android Emulator: use 10.0.2.2 to access host machine's localhost
// For iOS Simulator: use localhost
// For physical device: use your computer's IP address
import { Platform } from 'react-native';
import Constants from 'expo-constants';

// Detect if running on physical device vs emulator/simulator
const isDevice = Constants.isDevice;

// Your computer's local IP address (for physical device testing)
const LOCAL_IP = '192.168.0.121';

// Get the appropriate base URL based on platform and device type
function getApiBaseUrl(): string {
  if (!__DEV__) {
    return 'https://your-production-api.com'; // Production
  }

  // Running on physical device - use computer's IP
  if (isDevice) {
    return `http://${LOCAL_IP}:8000`;
  }

  // Running on emulator/simulator
  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:8000';  // Android Emulator
  } else {
    return 'http://localhost:8000';  // iOS Simulator
  }
}

export const API_BASE_URL = getApiBaseUrl();

// RevenueCat Configuration
// Get your key from: https://app.revenuecat.com/settings/api-keys
// IMPORTANT: Replace this with your actual Public API Key from RevenueCat Dashboard
// Note: RevenueCat uses a single key for both iOS and Android

// Set to true to bypass RevenueCat and use mock purchases for development
export const REVENUECAT_DEV_MODE = true;

export const REVENUECAT_API_KEY = 'test_NXiVqrhMWaLrIbqvccrpvBTZofA';

export const API_ENDPOINTS = {
  // Auth endpoints
  REGISTER: `${API_BASE_URL}/api/v1/auth/register`,
  LOGIN: `${API_BASE_URL}/api/v1/auth/login`,
  LOGOUT: `${API_BASE_URL}/api/v1/auth/logout`,

  // User endpoints
  GET_OR_CREATE_DEVICE_USER: `${API_BASE_URL}/api/v1/users/device`,
  UPDATE_SCAN_COUNT: `${API_BASE_URL}/api/v1/users/scan-count`,
  UPGRADE_TO_PRO: `${API_BASE_URL}/api/v1/users/upgrade`,
  REDEEM_COUPON: `${API_BASE_URL}/api/v1/users/redeem-coupon`,
  VALIDATE_COUPON: `${API_BASE_URL}/api/v1/users/validate-coupon`,
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
};
