import { useState, useEffect, useCallback } from 'react';
import Purchases, {
  PurchasesOffering,
  PurchasesPackage,
  CustomerInfo,
  PURCHASES_ERROR_CODE
} from 'react-native-purchases';
import { API_ENDPOINTS, REVENUECAT_API_KEY, REVENUECAT_DEV_MODE } from '../config/api';

interface UsePurchasesReturn {
  offerings: PurchasesOffering | null;
  customerInfo: CustomerInfo | null;
  isLoading: boolean;
  error: string | null;
  purchasePackage: (pkg: PurchasesPackage, deviceId?: string) => Promise<{ success: boolean; message: string }>;
  restorePurchases: (deviceId?: string) => Promise<{ success: boolean; message: string }>;
  isPro: boolean;
}

export function usePurchases(): UsePurchasesReturn {
  const [offerings, setOfferings] = useState<PurchasesOffering | null>(null);
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPro, setIsPro] = useState(false);

  // Initialize RevenueCat SDK
  useEffect(() => {
    const initializeRevenueCat = async () => {
      try {
        // DEV MODE: Skip RevenueCat initialization
        if (REVENUECAT_DEV_MODE) {
          console.log('[RevenueCat] DEV MODE: Skipping RevenueCat initialization');
          // Create mock offerings for dev mode
          setOfferings({
            identifier: 'dev_offering',
            serverDescription: 'Development Mode Offering',
            availablePackages: [
              {
                identifier: 'monthly_pro',
                packageType: 'MONTHLY',
                product: {
                  identifier: 'monthly_pro',
                  description: 'Monthly Pro Subscription',
                  title: 'Monthly Pro',
                  price: 2.99,
                  priceString: '$2.99',
                  currencyCode: 'USD',
                  introPrice: null,
                  discounts: null,
                } as any,
                offeringIdentifier: 'dev_offering',
              } as any,
              {
                identifier: 'yearly_pro',
                packageType: 'ANNUAL',
                product: {
                  identifier: 'yearly_pro',
                  description: 'Yearly Pro Subscription',
                  title: 'Yearly Pro',
                  price: 32.29,
                  priceString: '$32.29',
                  currencyCode: 'USD',
                  introPrice: null,
                  discounts: null,
                } as any,
                offeringIdentifier: 'dev_offering',
              } as any,
            ],
            lifetime: null,
            annual: null,
            sixMonth: null,
            threeMonth: null,
            twoMonth: null,
            monthly: null,
            weekly: null,
          } as any);
          setIsLoading(false);
          return;
        }

        // PRODUCTION MODE: Initialize RevenueCat normally
        await Purchases.configure({ apiKey: REVENUECAT_API_KEY });

        // Set user ID if available (optional, for better analytics)
        // await Purchases.logIn(userId);

        // Fetch offerings and customer info
        await Promise.all([
          fetchOfferings(),
          fetchCustomerInfo(),
        ]);

        setIsLoading(false);
      } catch (err: any) {
        console.error('[RevenueCat] Initialization error:', err);
        setError(err.message || 'Failed to initialize RevenueCat');
        setIsLoading(false);
      }
    };

    initializeRevenueCat();
  }, []);

  const fetchOfferings = async () => {
    try {
      const offerings = await Purchases.getOfferings();
      if (offerings.current !== null) {
        setOfferings(offerings.current);
        console.log('[RevenueCat] Offerings loaded:', offerings.current);
      } else {
        console.warn('[RevenueCat] No current offering available');
      }
    } catch (err: any) {
      console.error('[RevenueCat] Error fetching offerings:', err);
      setError(err.message || 'Failed to fetch offerings');
    }
  };

  const fetchCustomerInfo = async () => {
    try {
      const info = await Purchases.getCustomerInfo();
      setCustomerInfo(info);

      // DEBUG: Log full entitlements object to diagnose pro status bug
      console.log('[RevenueCat DEBUG] Full entitlements object:', JSON.stringify(info.entitlements, null, 2));
      console.log('[RevenueCat DEBUG] Active entitlements:', Object.keys(info.entitlements.active));
      console.log('[RevenueCat DEBUG] Pro entitlement exists:', info.entitlements.active['pro'] !== undefined);
      console.log('[RevenueCat DEBUG] Pro entitlement value:', info.entitlements.active['pro']);

      const isProStatus = info.entitlements.active['pro'] !== undefined;
      setIsPro(isProStatus);
      console.log('[RevenueCat] Customer info loaded, isPro:', isProStatus);
      return info;
    } catch (err: any) {
      console.error('[RevenueCat] Error fetching customer info:', err);
      setError(err.message || 'Failed to fetch customer info');
      return null;
    }
  };

  const purchasePackage = useCallback(async (
    pkg: PurchasesPackage,
    deviceId?: string
  ): Promise<{ success: boolean; message: string }> => {
    try {
      setIsLoading(true);
      setError(null);

      console.log('[RevenueCat] Attempting to purchase package:', pkg.identifier);

      // DEV MODE: Mock purchase and directly upgrade via backend
      if (REVENUECAT_DEV_MODE) {
        console.log('[RevenueCat] DEV MODE: Simulating purchase');
        console.log('[RevenueCat] DEV MODE: Device ID provided:', deviceId);

        // Simulate purchase delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Check if device ID is provided
        if (!deviceId || deviceId.trim() === '') {
          console.error('[RevenueCat] DEV MODE: No device ID provided');
          return {
            success: false,
            message: 'Please log in or register to upgrade to Pro',
          };
        }

        // Sync with backend to update user's pro status (requires authentication)
        try {
          console.log('[RevenueCat] DEV MODE: Calling upgrade endpoint');

          // Get authentication token - required for upgrade
          const { storage } = await import('../utils/storage');
          const token = await storage.getToken();

          if (!token) {
            console.error('[RevenueCat] DEV MODE: No JWT token - user must be logged in');
            return {
              success: false,
              message: 'Please log in to upgrade to Pro',
            };
          }

          const plan = pkg.identifier.includes('annual') || pkg.identifier.includes('year') ? 'yearly' : 'monthly';

          console.log('[RevenueCat] DEV MODE: Using JWT-based upgrade');
          const response = await fetch(API_ENDPOINTS.UPGRADE_TO_PRO, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({ plan }),
          });

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error('[RevenueCat] DEV MODE: Upgrade failed:', response.status, errorData);
            throw new Error(errorData.detail || 'Failed to upgrade user');
          }

          const responseData = await response.json();
          console.log('[RevenueCat] DEV MODE: User upgraded successfully:', responseData);
          setIsPro(true);

          return {
            success: true,
            message: 'Purchase successful! You now have Pro access. (Dev Mode)',
          };
        } catch (backendError: any) {
          console.error('[RevenueCat] DEV MODE: Error upgrading user:', backendError);
          return {
            success: false,
            message: backendError.message || 'Failed to upgrade user',
          };
        }
      }

      // PRODUCTION MODE: Use RevenueCat
      const { customerInfo } = await Purchases.purchasePackage(pkg);

      // Check if purchase was successful
      const hasPro = customerInfo.entitlements.active['pro'] !== undefined;

      if (hasPro) {
        setIsPro(true);
        setCustomerInfo(customerInfo);
        console.log('[RevenueCat] Purchase successful!');

        // Sync with backend to update user's pro status (requires authentication)
        try {
          const { storage } = await import('../utils/storage');
          const token = await storage.getToken();
          const plan = pkg.identifier.includes('annual') || pkg.identifier.includes('year') ? 'yearly' : 'monthly';

          if (token) {
            const response = await fetch(API_ENDPOINTS.UPGRADE_TO_PRO, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
              },
              body: JSON.stringify({ plan }),
            });

            if (!response.ok) {
              console.warn('[RevenueCat] Failed to sync pro status to backend, but purchase was successful');
            } else {
              console.log('[RevenueCat] Pro status synced to backend successfully');
            }
          } else {
            console.warn('[RevenueCat] No auth token - cannot sync pro status to backend');
          }
        } catch (backendError) {
          console.error('[RevenueCat] Error syncing to backend:', backendError);
          // Don't fail the purchase if backend sync fails
        }

        return {
          success: true,
          message: 'Purchase successful! You now have Pro access.',
        };
      } else {
        return {
          success: false,
          message: 'Purchase completed but Pro entitlement not found.',
        };
      }
    } catch (err: any) {
      console.error('[RevenueCat] Purchase error:', err);

      // Handle user cancellation
      if (err.code === PURCHASES_ERROR_CODE.PURCHASE_CANCELLED_ERROR) {
        return {
          success: false,
          message: 'Purchase was cancelled.',
        };
      }

      // Handle other errors
      return {
        success: false,
        message: err.message || 'Failed to complete purchase. Please try again.',
      };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const restorePurchases = useCallback(async (deviceId?: string): Promise<{ success: boolean; message: string }> => {
    try {
      setIsLoading(true);
      setError(null);

      console.log('[RevenueCat] Restoring purchases...');

      // DEV MODE: Not applicable, just return no purchases
      if (REVENUECAT_DEV_MODE) {
        console.log('[RevenueCat] DEV MODE: Restore not applicable in dev mode');
        return {
          success: false,
          message: 'No purchases to restore in development mode.',
        };
      }

      // PRODUCTION MODE: Use RevenueCat
      const customerInfo = await Purchases.restorePurchases();
      const hasPro = customerInfo.entitlements.active['pro'] !== undefined;

      if (hasPro) {
        setIsPro(true);
        setCustomerInfo(customerInfo);

        // Sync with backend to update user's pro status (requires authentication)
        try {
          const { storage } = await import('../utils/storage');
          const token = await storage.getToken();

          if (token) {
            const response = await fetch(API_ENDPOINTS.UPGRADE_TO_PRO, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
              },
              body: JSON.stringify({
                plan: 'pro',
              }),
            });

            if (!response.ok) {
              console.warn('[RevenueCat] Failed to sync pro status to backend, but restore was successful');
            }
          } else {
            console.warn('[RevenueCat] No auth token - cannot sync pro status to backend');
          }
        } catch (backendError) {
          console.error('[RevenueCat] Error syncing to backend:', backendError);
        }

        return {
          success: true,
          message: 'Purchases restored successfully!',
        };
      } else {
        return {
          success: false,
          message: 'No active purchases found to restore.',
        };
      }
    } catch (err: any) {
      console.error('[RevenueCat] Restore error:', err);
      return {
        success: false,
        message: err.message || 'Failed to restore purchases.',
      };
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    offerings,
    customerInfo,
    isLoading,
    error,
    purchasePackage,
    restorePurchases,
    isPro,
  };
}

