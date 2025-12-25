# RevenueCat Integration Setup Guide

## Overview

The app uses RevenueCat (react-native-purchases) for in-app purchases. This allows users to purchase Pro subscriptions (monthly or yearly) using Google Pay, Stripe, or Credit Cards.

## Installation

1. **Install the package** (already added to package.json):
   ```bash
   cd mobile
   npm install
   ```

2. **For Expo projects**, you may need to rebuild the app:
   ```bash
   npx expo prebuild
   ```

## Configuration

### 1. Get RevenueCat API Keys

1. Sign up at [RevenueCat](https://www.revenuecat.com/)
2. Create a new project
3. Get your API keys:
   - iOS: `appl_...` (from RevenueCat dashboard)
   - Android: `goog_...` (from RevenueCat dashboard)

### 2. Update API Keys

Edit `mobile/src/hooks/usePurchases.ts`:

```typescript
const REVENUECAT_API_KEY = {
  ios: 'appl_YOUR_IOS_API_KEY_HERE', // Replace with your iOS API key
  android: 'goog_YOUR_ANDROID_API_KEY_HERE', // Replace with your Android API key
};
```

### 3. Configure Products in RevenueCat Dashboard

1. **Create Products**:
   - Monthly subscription: `$2.99/month`
   - Yearly subscription: `$32.29/year` (10% off from $35.88)

2. **Create Entitlement**:
   - Name: `pro`
   - Attach both products to this entitlement

3. **Create Offering**:
   - Name: `default`
   - Add both packages (monthly and yearly)
   - Set as current offering

### 4. Configure App Store Connect / Google Play Console

**For iOS (App Store Connect)**:
- Create in-app purchase products
- Monthly subscription: `$2.99/month`
- Yearly subscription: `$32.29/year`
- Link them in RevenueCat dashboard

**For Android (Google Play Console)**:
- Create subscription products
- Monthly subscription: `$2.99/month`
- Yearly subscription: `$32.29/year`
- Link them in RevenueCat dashboard

## How It Works

1. **Initialization**: 
   - SDK initializes on app start via `usePurchases` hook
   - Fetches offerings and customer info

2. **Purchase Flow**:
   - User clicks Monthly/Yearly plan in UpgradeModal
   - `handlePurchase` finds the correct package from offerings
   - Calls `purchasePackage` which triggers native payment UI
   - On success:
     - Sets `isPro=true` locally
     - Syncs with backend via `POST /api/v1/users/upgrade`
     - Updates UI

3. **Backend Sync**:
   - After successful purchase, calls backend to update user's `is_premium` flag
   - Backend endpoint: `POST /api/v1/users/upgrade`

## Testing

### Sandbox Testing

1. **iOS**: Use sandbox test accounts in App Store Connect
2. **Android**: Use test accounts in Google Play Console
3. RevenueCat automatically uses sandbox for testing

### Test Purchases

- Monthly: `$2.99/month`
- Yearly: `$32.29/year` (10% off)

## Package Identifiers

The hook automatically finds packages by identifier:
- Monthly: Looks for packages with `monthly` or `month` in identifier
- Yearly: Looks for packages with `annual`, `year`, or `yearly` in identifier

Common RevenueCat package identifiers:
- `$rc_monthly` - Monthly package
- `$rc_annual` - Yearly package

## Troubleshooting

1. **"No packages available"**:
   - Check internet connection
   - Verify offerings are configured in RevenueCat dashboard
   - Ensure products are linked in App Store/Play Console

2. **Purchase fails**:
   - Check RevenueCat dashboard for errors
   - Verify API keys are correct
   - Ensure products are approved in App Store/Play Console

3. **Backend sync fails**:
   - Purchase still succeeds, but backend won't be updated
   - Check backend logs for errors
   - Verify `device_id` is being passed correctly

## Notes

- The SDK initializes automatically when `usePurchases` hook is used
- Placeholder API keys are in the code - **must be replaced** before production
- Backend sync happens automatically after successful purchase
- User can restore purchases (not yet implemented in UI, but hook supports it)

