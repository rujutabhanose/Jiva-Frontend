import { AppState, Platform, Linking } from 'react-native';
import Purchases, { CustomerInfo } from 'react-native-purchases';
import { useEffect, useRef, useCallback } from 'react';
import { REVENUECAT_DEV_MODE } from '../config/api';

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

  const redeemCode = useCallback(async (code?: string) => {
    if (Platform.OS === 'ios') {
      didOpenForRedemption.current = true;
      await Purchases.presentCodeRedemptionSheet();
    } else if (code) {
      didOpenForRedemption.current = true;
      const url = `https://play.google.com/redeem?code=${encodeURIComponent(code)}`;
      await Linking.openURL(url);
    } else {
      console.warn('[PromoCode] Android redemption requires a code.');
    }
  }, []);

  return { redeemCode };
}
