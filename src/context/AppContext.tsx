import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_ENDPOINTS } from '../config/api';

interface Scan {
  id: string;
  image: string;
  condition?: string;
  plant_name?: string;
  confidence: number;
  date: Date;
  symptoms?: string[];
  causes?: string[];
  treatment?: string[];
  notes?: string;
  mode?: 'diagnosis' | 'identification';
  category?: string;
  severity?: string;
  health_score?: number;
  diagnosis_data?: any;
  pendingSync?: boolean;
  user_id?: string; // Track which user this scan belongs to
}

interface AppContextType {
  currentScreen: string;
  setCurrentScreen: (screen: string) => void;
  userId: string;
  scansUsed: number;
  scansLimit: number;
  isPro: boolean;
  history: Scan[];
  currentScan: Scan | null;
  saveScan: (scan: Scan, backendMeta?: any) => Promise<void>;
  setCurrentScan: (scan: Scan | null) => void;
  updateScanNotes: (scanId: string, notes: string) => void;
  deleteScan: (scanId: string) => Promise<void>;
  upgradeToPro: () => Promise<{ success: boolean; message: string }>;
  redeemCoupon: (couponCode: string) => Promise<{ success: boolean; message: string }>;
  canScan: boolean;
  clearUserHistory: () => Promise<void>; // Clear history when switching users
  reloadUserData: () => Promise<void>; // Reload user data after login
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEYS = {
  USER_ID: '@jiva:userId',
  SCANS_USED: '@jiva:scansUsed',
  IS_PRO: '@jiva:isPro',
  HISTORY: '@jiva:history',
};

function generateUserId(): string {
  // Generate a unique ID using timestamp + random string
  const timestamp = Date.now().toString(36);
  const randomStr = Math.random().toString(36).substring(2, 15);
  return `${timestamp}-${randomStr}`;
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [currentScreen, setCurrentScreen] = useState("welcome");
  const [userId, setUserId] = useState("");
  const [scansUsed, setScansUsed] = useState(0);
  const [isPro, setIsPro] = useState(false);
  const [history, setHistory] = useState<Scan[]>([]);
  const [currentScan, setCurrentScan] = useState<Scan | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const scansLimit = isPro ? Infinity : 1;
  const canScan = isPro || scansUsed < scansLimit;

  // Initialize user data from storage and sync with backend
  useEffect(() => {
    const initializeUser = async () => {
      console.log('[AppContext] Starting initialization...');
      try {
        // Check if user is authenticated (has token)
        const TOKEN_KEY = 'jiva_auth_token';
        const token = await AsyncStorage.getItem(TOKEN_KEY);

        if (!token) {
          console.log('[AppContext] No authentication token found - user must login/register first');
          // Set defaults for unauthenticated state
          setUserId('');
          setScansUsed(0);
          setIsPro(false);
          setHistory([]);
          setIsLoading(false);
          return;
        }

        // Get or create device ID for tracking purposes
        let storedUserId = await AsyncStorage.getItem(STORAGE_KEYS.USER_ID);
        if (!storedUserId) {
          storedUserId = generateUserId();
          await AsyncStorage.setItem(STORAGE_KEYS.USER_ID, storedUserId);
        }
        setUserId(storedUserId);
        console.log('[AppContext] Device ID:', storedUserId);

        // Sync with backend to get authenticated user data
        try {
          console.log('[AppContext] Fetching from:', API_ENDPOINTS.GET_OR_CREATE_DEVICE_USER);
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 5000);

          const response = await fetch(API_ENDPOINTS.GET_OR_CREATE_DEVICE_USER, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({
              device_id: storedUserId,
            }),
            signal: controller.signal,
          });

          clearTimeout(timeoutId);

          console.log('[AppContext] Response status:', response.status);
          if (response.ok) {
            const data = await response.json();
            console.log('[AppContext] Backend data:', JSON.stringify(data, null, 2));

            // DEBUG: Log isPro status from backend
            console.log('[AppContext DEBUG] Backend is_premium value:', data.is_premium);
            console.log('[AppContext DEBUG] Backend is_premium type:', typeof data.is_premium);
            console.log('[AppContext DEBUG] Setting isPro to:', data.is_premium);

            setScansUsed(data.scans_used);
            setIsPro(data.is_premium);

            // Update local storage with backend data
            await AsyncStorage.setItem(STORAGE_KEYS.SCANS_USED, data.scans_used.toString());
            await AsyncStorage.setItem(STORAGE_KEYS.IS_PRO, data.is_premium ? 'true' : 'false');

            console.log('[AppContext DEBUG] AsyncStorage IS_PRO set to:', data.is_premium ? 'true' : 'false');
          }
        } catch (backendError: any) {
          // Don't fail the app if backend is unavailable - just use local storage
          if (backendError.name === 'AbortError') {
            console.warn('[AppContext] Backend request timed out, using local storage');
          } else {
            console.warn('[AppContext] Backend unavailable, using local storage:', backendError.message || 'Connection error');
          }
          // Fall back to local storage
          try {
            const storedScansUsed = await AsyncStorage.getItem(STORAGE_KEYS.SCANS_USED);
            if (storedScansUsed) {
              setScansUsed(parseInt(storedScansUsed, 10));
            }

            const storedIsPro = await AsyncStorage.getItem(STORAGE_KEYS.IS_PRO);
            if (storedIsPro === 'true') {
              setIsPro(true);
            }
          } catch (storageError) {
            console.error('[AppContext] Error reading from storage:', storageError);
            // Use default values
            setScansUsed(0);
            setIsPro(false);
          }
        }

        // Load history from backend first, then fall back to local storage
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

          const response = await fetch(`${API_ENDPOINTS.GET_SCANS}?limit=50`, {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
            signal: controller.signal,
          });

          clearTimeout(timeoutId);
          if (response.ok) {
            const backendScans = await response.json();
            // Convert backend scan format to app format
            const convertedScans = backendScans.map((scan: any) => ({
              id: scan.id.toString(),
              image: scan.image_url || '',
              condition: scan.condition_name,
              plant_name: scan.mode === 'identification' ? scan.condition_name : undefined,
              confidence: scan.confidence * 100, // Convert from 0-1 to 0-100
              date: new Date(scan.created_at),
              symptoms: scan.symptoms || [],
              causes: scan.causes || [],
              treatment: scan.treatment || [],
              notes: scan.notes || '',
              mode: scan.mode || 'diagnosis',
              user_id: userId, // Add current user_id to scans
            }));
            setHistory(convertedScans);
            // Update local storage with backend data
            await AsyncStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(convertedScans));
          } else {
            // Fall back to local storage
            throw new Error('Backend unavailable');
          }
        } catch (historyError: any) {
          if (historyError.name === 'AbortError') {
            console.warn('[AppContext] History request timed out, using local storage');
          } else {
            console.warn('[AppContext] History unavailable, using local storage:', historyError.message || 'Connection error');
          }
          // Fall back to local storage
          try {
            const storedHistory = await AsyncStorage.getItem(STORAGE_KEYS.HISTORY);
            if (storedHistory) {
              const parsedHistory = JSON.parse(storedHistory);
              // Convert date strings back to Date objects and filter by current user
              const historyWithDates = parsedHistory
                .filter((scan: any) => !scan.user_id || scan.user_id === userId) // Only include scans for current user
                .map((scan: any) => ({
                  ...scan,
                  date: new Date(scan.date),
                }));
              setHistory(historyWithDates);
            }
          } catch (parseError) {
            console.error('[AppContext] Error parsing stored history:', parseError);
            setHistory([]); // Use empty array as fallback
          }
        }
      } catch (error) {
        console.error('[AppContext] Error loading user data:', error);
        // Even on error, we should continue with default values
        // Set default values to prevent app from being stuck
        if (!userId) {
          const defaultUserId = generateUserId();
          setUserId(defaultUserId);
          try {
            await AsyncStorage.setItem(STORAGE_KEYS.USER_ID, defaultUserId);
          } catch (e) {
            console.error('[AppContext] Error saving default user ID:', e);
          }
        }
      } finally {
        console.log('[AppContext] Initialization complete, setting isLoading to false');
        setIsLoading(false);
      }
    };

    initializeUser();
  }, []);

  // Sync scan count to backend
  const syncScanCountToBackend = async (newCount: number) => {
    try {
      const response = await fetch(API_ENDPOINTS.UPDATE_SCAN_COUNT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          device_id: userId,
          scan_count: newCount,
        }),
      });

      if (!response.ok) {
        // Try to parse error, but don't throw
        try {
          const errorData = await response.json();
          console.error('Failed to sync scan count to backend:', errorData.detail || errorData.message);
        } catch {
          console.error('Failed to sync scan count to backend:', response.status);
        }
      }
    } catch (error: any) {
      // Log but don't throw - app should continue working even if sync fails
      console.error('Error syncing scan count:', error);
      // Continue even if backend sync fails - app should never crash
    }
  };

  const saveScan = async (scan: Scan, backendMeta?: any) => {
    // Try to save scan to backend first
    let backendScanId: number | null = null;
    let savedToBackend = false;

    try {
      // Get auth token for authenticated request
      const { storage } = await import('../utils/storage');
      const token = await storage.getToken();

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

      const response = await fetch(API_ENDPOINTS.CREATE_SCAN, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
        body: JSON.stringify({
          device_id: userId,
          mode: scan.mode || 'diagnosis',
          image_url: scan.image || null,
          condition_name: scan.condition || scan.plant_name || 'Unknown',
          confidence: scan.confidence ? (scan.confidence > 1 ? scan.confidence / 100 : scan.confidence) : 0, // Backend expects 0-1 range, convert if in 0-100
          diagnosis_data: scan.diagnosis_data || null,
          symptoms: scan.symptoms || [],
          causes: scan.causes || [],
          treatment: scan.treatment || [],
          notes: scan.notes || '',
          category: scan.category || null,
          severity: scan.severity || null,
          health_score: scan.health_score || null,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        try {
          const backendScan = await response.json();
          if (backendScan && typeof backendScan.id === 'number' && backendScan.id > 0) {
            const newBackendScanId = backendScan.id;
            backendScanId = newBackendScanId;
            // Use backend ID instead of local ID and remove pendingSync flag
            scan = { ...scan, id: newBackendScanId.toString(), pendingSync: false };
            savedToBackend = true;
            console.log('[AppContext] Scan saved to backend with ID:', newBackendScanId);
          } else {
            console.warn('[AppContext] Invalid response format from backend');
          }
        } catch (parseError) {
          console.error('[AppContext] Error parsing backend response:', parseError);
          // Continue with local scan
        }
      } else {
        console.warn('[AppContext] Failed to save scan to backend, using local ID');
      }
    } catch (error: any) {
      if (error.name === 'AbortError') {
        console.warn('[AppContext] Save scan request timed out, saving locally only');
      } else {
        console.warn('[AppContext] Offline or backend unavailable, saving locally only:', error.message);
      }
      // Mark scan as pending sync when backend fails
      scan = { ...scan, pendingSync: true };
    }

    // Check for duplicates before adding (by ID or by timestamp + condition)
    const isDuplicate = history.some(existingScan => {
      // Same ID means definite duplicate
      if (existingScan.id === scan.id) return true;

      // Check if same scan within 5 seconds (potential double-save)
      const timeDiff = Math.abs(
        new Date(existingScan.date).getTime() - new Date(scan.date).getTime()
      );
      const sameCondition = (existingScan.condition || existingScan.plant_name) ===
                           (scan.condition || scan.plant_name);

      return timeDiff < 5000 && sameCondition;
    });

    if (isDuplicate) {
      console.warn('[AppContext] Duplicate scan detected, skipping save');
      return;
    }

    // Add user_id to scan for local filtering
    const scanWithUserId = { ...scan, user_id: userId };

    // Add scan to local history with backend ID if available
    setHistory(prev => [scanWithUserId, ...prev]);
    setCurrentScan(scanWithUserId);

    // Save to local storage
    try {
      const currentHistory = await AsyncStorage.getItem(STORAGE_KEYS.HISTORY);
      const historyArray = currentHistory ? JSON.parse(currentHistory) : [];
      historyArray.unshift(scanWithUserId);
      await AsyncStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(historyArray));
    } catch (error) {
      console.error('[AppContext] Error saving scan to local storage:', error);
      throw new Error('Failed to save scan locally');
    }

    // Increment scan counter for diagnosis scans (identification is free)
    if (scan.mode === 'diagnosis') {
      console.log('[AppContext] Incrementing scan counter for diagnosis scan');
      const newScansUsed = scansUsed + 1;
      setScansUsed(newScansUsed);
      await AsyncStorage.setItem(STORAGE_KEYS.SCANS_USED, newScansUsed.toString());

      // Sync to backend
      syncScanCountToBackend(newScansUsed);
    }

    if (backendMeta) {
      setIsPro(backendMeta.is_premium);
      await AsyncStorage.setItem(
        STORAGE_KEYS.IS_PRO,
        backendMeta.is_premium ? 'true' : 'false'
      );
    }
  };


  const updateScanNotes = async (scanId: string, notes: string) => {
    const updatedHistory = history.map((scan) =>
      scan.id === scanId ? { ...scan, notes } : scan
    );

    setHistory(updatedHistory);

    if (currentScan?.id === scanId) {
      setCurrentScan({ ...currentScan, notes });
    }

    // Persist to storage
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(updatedHistory));

      // Sync to backend if scanId is a valid integer (backend scan ID)
      // Backend IDs are integers (1, 2, 3...), local IDs are timestamps (1704123456789...)
      // Check if it's a small integer (backend ID) vs large number (timestamp-based local ID)
      const numericId = Number(scanId);
      if (!isNaN(numericId) && numericId > 0 && numericId < 2147483647) {
        // Valid integer ID that could be a backend ID (within SQL integer range)
        // Additional check: if it's a recent timestamp (last 10 years), it's likely a local ID
        const tenYearsAgo = Date.now() - (10 * 365 * 24 * 60 * 60 * 1000);
        const isLikelyTimestamp = numericId > tenYearsAgo / 1000;

        if (!isLikelyTimestamp) {
          // Likely a backend ID, sync to backend
          try {
            const response = await fetch(API_ENDPOINTS.UPDATE_SCAN_NOTES(numericId), {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ notes }),
            });

            if (!response.ok) {
              console.warn('[AppContext] Failed to sync notes to backend, scan may not exist on backend');
            }
          } catch (error) {
            console.error('Error syncing notes to backend:', error);
          }
        }
      }
    } catch (error) {
      console.error('Error updating scan notes:', error);
    }
  };

  const deleteScan = async (scanId: string) => {
    // Remove from local history
    const updatedHistory = history.filter((scan) => scan.id !== scanId);
    setHistory(updatedHistory);

    // Clear current scan if it's the one being deleted
    if (currentScan?.id === scanId) {
      setCurrentScan(null);
    }

    // Persist to local storage
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(updatedHistory));
    } catch (error) {
      console.error('[AppContext] Error updating local storage after delete:', error);
    }

    // Sync to backend if scanId is a backend ID
    const numericId = Number(scanId);
    if (!isNaN(numericId) && numericId > 0 && numericId < 2147483647) {
      // Valid integer ID that could be a backend ID (within SQL integer range)
      // Additional check: if it's a recent timestamp (last 10 years), it's likely a local ID
      const tenYearsAgo = Date.now() - (10 * 365 * 24 * 60 * 60 * 1000);
      const isLikelyTimestamp = numericId > tenYearsAgo / 1000;

      if (!isLikelyTimestamp) {
        // Likely a backend ID, delete from backend
        try {
          const response = await fetch(API_ENDPOINTS.DELETE_SCAN(numericId), {
            method: 'DELETE',
          });

          if (response.ok) {
            console.log('[AppContext] Scan deleted from backend successfully');
          } else {
            console.warn('[AppContext] Failed to delete scan from backend, it may not exist');
          }
        } catch (error) {
          console.error('[AppContext] Error deleting scan from backend:', error);
          // Continue anyway - local deletion was successful
        }
      } else {
        console.log('[AppContext] Scan only exists locally, skipping backend deletion');
      }
    }
  };

  const upgradeToPro = async (): Promise<{ success: boolean; message: string }> => {
    try {
      // Call backend first with timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

      const response = await fetch(API_ENDPOINTS.UPGRADE_TO_PRO, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          device_id: userId,
          plan: 'pro',
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // Parse response
      let data: any;
      try {
        data = await response.json();
      } catch (parseError) {
        if (!response.ok) {
          return {
            success: false,
            message: `Failed to upgrade (${response.status}). Please try again.`,
          };
        }
        // If response is OK but not JSON, still treat as success
        data = {};
      }

      if (!response.ok) {
        return {
          success: false,
          message: data.detail || data.message || `Failed to upgrade (${response.status})`,
        };
      }

      // Backend confirmed upgrade - now update local state
      console.log('[AppContext DEBUG] upgradeToPro - Setting isPro to true');
      setIsPro(true);
      await AsyncStorage.setItem(STORAGE_KEYS.IS_PRO, 'true');
      console.log('[AppContext DEBUG] upgradeToPro - Updated AsyncStorage to true');

      return {
        success: true,
        message: data.message || 'Successfully upgraded to Pro!',
      };
    } catch (error: any) {
      console.error('Error upgrading to pro:', error);

      // Categorize error for user-friendly message
      let errorMessage = 'Failed to upgrade to Pro';

      if (error.name === 'AbortError') {
        errorMessage = 'Request timed out. Please check your connection and try again.';
      } else if (error.message?.includes('fetch') || error.message?.includes('network')) {
        errorMessage = 'Network error. Please check your connection and try again.';
      } else if (error.message) {
        errorMessage = error.message;
      }

      return {
        success: false,
        message: errorMessage,
      };
    }
  };

  const redeemCoupon = async (couponCode: string): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await fetch(API_ENDPOINTS.REDEEM_COUPON, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          device_id: userId,
          coupon_code: couponCode,
        }),
      });

      let data: any;
      try {
        data = await response.json();
      } catch (parseError) {
        // If JSON parsing fails, return a user-friendly error
        return {
          success: false,
          message: response.ok 
            ? 'Invalid response from server. Please try again.'
            : `Server error (${response.status}). Please try again later.`,
        };
      }

      if (!response.ok) {
        // Special case: if user is already premium, update local state to match backend
        const errorMessage = data.detail || data.message || '';
        if (errorMessage.toLowerCase().includes('already premium')) {
          setIsPro(true);
          await AsyncStorage.setItem(STORAGE_KEYS.IS_PRO, 'true');
        }

        return {
          success: false,
          message: errorMessage || `Failed to redeem coupon (${response.status})`,
        };
      }

      // Validate response structure
      if (!data || typeof data !== 'object') {
        return {
          success: false,
          message: 'Invalid response from server. Please try again.',
        };
      }

      // Update local state
      setIsPro(true);
      await AsyncStorage.setItem(STORAGE_KEYS.IS_PRO, 'true');

      return {
        success: true,
        message: data.message || 'Coupon redeemed successfully!',
      };
    } catch (error: any) {
      console.error('Error redeeming coupon:', error);
      
      // Categorize error for user-friendly message
      let errorMessage = 'Failed to redeem coupon';
      
      if (error.message?.includes('fetch') || error.message?.includes('network')) {
        errorMessage = 'Network error. Please check your connection and try again.';
      } else if (error.message?.includes('timeout')) {
        errorMessage = 'Request timed out. Please try again.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      return {
        success: false,
        message: errorMessage,
      };
    }
  };

  const clearUserHistory = async () => {
    // Clear history state
    setHistory([]);
    setCurrentScan(null);

    // Clear local storage history
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.HISTORY);
      console.log('[AppContext] User history cleared');
    } catch (error) {
      console.error('[AppContext] Error clearing user history:', error);
    }
  };

  const reloadUserData = async () => {
    // This function can be called after login to refresh user data
    console.log('[AppContext] Reloading user data...');
    try {
      const TOKEN_KEY = 'jiva_auth_token';
      const token = await AsyncStorage.getItem(TOKEN_KEY);

      if (!token) {
        console.log('[AppContext] No token, cannot reload user data');
        return;
      }

      // Get device ID
      const storedUserId = await AsyncStorage.getItem(STORAGE_KEYS.USER_ID);
      if (!storedUserId) {
        console.log('[AppContext] No user ID found');
        return;
      }

      // Fetch user data from backend
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);

        const response = await fetch(API_ENDPOINTS.GET_OR_CREATE_DEVICE_USER, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            device_id: storedUserId,
          }),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (response.ok) {
          const data = await response.json();
          setScansUsed(data.scans_used);
          setIsPro(data.is_premium);
          await AsyncStorage.setItem(STORAGE_KEYS.SCANS_USED, data.scans_used.toString());
          await AsyncStorage.setItem(STORAGE_KEYS.IS_PRO, data.is_premium ? 'true' : 'false');
        }
      } catch (error) {
        console.warn('[AppContext] Error reloading user data:', error);
      }

      // Load history from backend
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);

        const response = await fetch(`${API_ENDPOINTS.GET_SCANS}?limit=50`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (response.ok) {
          const backendScans = await response.json();
          const convertedScans = backendScans.map((scan: any) => ({
            id: scan.id.toString(),
            image: scan.image_url || '',
            condition: scan.condition_name,
            plant_name: scan.mode === 'identification' ? scan.condition_name : undefined,
            confidence: scan.confidence * 100,
            date: new Date(scan.created_at),
            symptoms: scan.symptoms || [],
            causes: scan.causes || [],
            treatment: scan.treatment || [],
            notes: scan.notes || '',
            mode: scan.mode || 'diagnosis',
            user_id: storedUserId,
          }));
          setHistory(convertedScans);
          await AsyncStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(convertedScans));
        }
      } catch (error) {
        console.warn('[AppContext] Error loading history:', error);
      }
    } catch (error) {
      console.error('[AppContext] Error in reloadUserData:', error);
    }
  };

  // Provide default values during loading so useApp() doesn't throw
  // RootNavigator will show splash screen first
  return (
    <AppContext.Provider
      value={{
        currentScreen,
        setCurrentScreen,
        userId: userId || '', // Provide empty string as default
        scansUsed,
        scansLimit,
        isPro,
        history,
        currentScan,
        saveScan,
        setCurrentScan,
        updateScanNotes,
        deleteScan,
        upgradeToPro,
        redeemCoupon,
        canScan,
        clearUserHistory,
        reloadUserData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
}
