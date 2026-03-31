import { Linking, AppState, Platform } from 'react-native';
import Purchases, { CustomerInfo } from 'react-native-purchases';
import { useEffect, useRef, useCallback } from 'react';
import { REVENUECAT_DEV_MODE } from '../config/api';

const APPLE_APP_ID = '6759003923';

export function usePromoCodeRedemption(onProAccessGranted?: (customerInfo: CustomerInfo) => void) {
  const didOpenForRedemption = useRef(false);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', async (nextState) => {
      if (nextState === 'active' && didOpenForRedemption.current) {
        didOpenForRedemption.current = false;

        if (REVENUECAT_DEV_MODE) return;

        try {
          await Purchases.syncPurchases();
          const customerInfo = await Purchases.getCustomerInfo();
          const isPro = customerInfo.entitlements.active['pro'] !== undefined;
          if (isPro && onProAccessGranted) {
            onProAccessGranted(customerInfo);
          }
        } catch (e) {
          console.warn('[PromoCode] syncPurchases error:', e);
        }
      }
    });
    return () => subscription.remove();
  }, [onProAccessGranted]);

  const redeemCode = useCallback(async (code: string) => {
    didOpenForRedemption.current = true;

    if (Platform.OS === 'ios') {
      const url = `https://apps.apple.com/redeem?ctx=offercodes&id=${APPLE_APP_ID}&code=${encodeURIComponent(code)}`;
      await Linking.openURL(url);
    } else {
      const url = `https://play.google.com/redeem?code=${encodeURIComponent(code)}`;
      await Linking.openURL(url);
    }
  }, []);

  return { redeemCode };
}
