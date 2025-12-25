import React, { useState } from 'react';
import { View, Text, Modal, TouchableOpacity, ScrollView, TextInput, ActivityIndicator } from 'react-native';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { X, Check, Zap, Shield, Tag, AlertCircle } from 'lucide-react-native';
import { usePurchases } from '../hooks/usePurchases';
import Toast from 'react-native-toast-message';
import { PurchasesPackage } from 'react-native-purchases';
import { SafeAreaView } from 'react-native-safe-area-context';

interface UpgradeModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectPlan: (plan: 'monthly' | 'yearly') => void;
  onRedeemCoupon?: (couponCode: string) => Promise<{ success: boolean; message: string }>;
  onUpgradeSuccess?: () => void;
  deviceId?: string;
  scansUsed: number;
  scansLimit: number;
}

export function UpgradeModal({
  visible,
  onClose,
  onSelectPlan,
  onRedeemCoupon,
  onUpgradeSuccess,
  deviceId,
  scansUsed,
  scansLimit
}: UpgradeModalProps) {
  console.log('[UpgradeModal] Component rendering with deviceId prop:', deviceId);
  const { offerings, purchasePackage, isLoading: isPurchasing, error: purchaseError } = usePurchases();
  const [couponCode, setCouponCode] = useState('');
  const [isRedeeming, setIsRedeeming] = useState(false);
  const [couponError, setCouponError] = useState('');
  const [couponSuccess, setCouponSuccess] = useState('');
  const [isProcessingPurchase, setIsProcessingPurchase] = useState(false);
  const [showCoupon, setShowCoupon] = useState(false);

  const handlePurchase = async (pkg: PurchasesPackage, planType: 'monthly' | 'yearly') => {
    console.log('[UpgradeModal] handlePurchase called, using deviceId prop:', deviceId);
    setIsProcessingPurchase(true);
    try {
      const result = await purchasePackage(pkg, deviceId);
      
      if (result.success) {
        Toast.show({ 
          type: 'success', 
          text1: 'Upgrade Successful!',
          text2: result.message
        });
        
        // Call onSelectPlan for backward compatibility
        onSelectPlan(planType);
        
        // Call onUpgradeSuccess if provided
        if (onUpgradeSuccess) {
          onUpgradeSuccess();
        }
        
        // Close modal after short delay
        setTimeout(() => {
          onClose();
        }, 1500);
      } else {
        // Don't show error for user cancellation
        if (result.message !== 'Purchase was cancelled.') {
          Toast.show({ 
            type: 'error', 
            text1: 'Purchase Failed',
            text2: result.message
          });
        }
      }
    } catch (error: any) {
      console.error('[UpgradeModal] Purchase error:', error);
      Toast.show({ 
        type: 'error', 
        text1: 'Purchase Failed',
        text2: error.message || 'An error occurred during purchase'
      });
    } finally {
      setIsProcessingPurchase(false);
    }
  };

  const handleRedeemCoupon = async () => {
    if (!couponCode.trim()) {
      setCouponError('Please enter a coupon code');
      return;
    }

    if (!onRedeemCoupon) {
      setCouponError('Coupon redemption not available');
      return;
    }

    setIsRedeeming(true);
    setCouponError('');
    setCouponSuccess('');

    try {
      const result = await onRedeemCoupon(couponCode.trim());
      if (result.success) {
        setCouponSuccess(result.message);
        Toast.show({ 
          type: 'success', 
          text1: 'Coupon Redeemed!',
          text2: result.message
        });
        
        // Call onUpgradeSuccess if provided
        if (onUpgradeSuccess) {
          onUpgradeSuccess();
        }
        
        // Close modal after short delay
        setTimeout(() => {
          onClose();
        }, 2000);
      } else {
        setCouponError(result.message);
        Toast.show({ 
          type: 'error', 
          text1: 'Coupon Invalid',
          text2: result.message
        });
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to redeem coupon';
      setCouponError(errorMessage);
      Toast.show({ 
        type: 'error', 
        text1: 'Error',
        text2: errorMessage
      });
    } finally {
      setIsRedeeming(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <SafeAreaView style={{ flex: 1 }}>
        <View className="flex-1 bg-black/60 justify-center items-center p-6">
          <Card
  className="w-full max-w-md"
  style={{
    maxHeight: '90%', // ✅ Android needs this
  }}
>
  <ScrollView
    showsVerticalScrollIndicator={false}
    contentContainerStyle={{ paddingBottom: 24 }}
  >
            {/* Header */}
            <View className="flex-row items-start justify-between mb-4">
  <View className="flex-1 pr-4">
    <Text className="text-2xl font-extrabold mb-1">
      Diagnose plants instantly 🌱
    </Text>
    <Text className="text-sm text-muted-foreground">
      Stop guessing. Get accurate disease detection & treatment plans.
    </Text>
    <Text className="text-xs text-muted-foreground mt-2">
      You've used {scansUsed} of {scansLimit} free scans
    </Text>
  </View>

  <TouchableOpacity onPress={onClose} hitSlop={10}>
    <X size={22} color="#6B7280" />
  </TouchableOpacity>
</View>

            {/* Free Plan Exhausted */}
            <Card
  className="bg-warning/10 border-warning/30 mb-6"
  style={{ shadowOpacity: 0, elevation: 0 }}
>
              <View className="flex items-start gap-3">
                <View className="w-10 h-10 bg-warning/15 rounded-xl flex items-center justify-center">
  <Zap size={18} color="#D08A4E" strokeWidth={2} />
</View>
                <View className="flex-1">
                  <Text className="text-sm font-semibold mb-1">
  You’ve reached your free scan limit
</Text>
<Text className="text-xs text-muted-foreground">
  Your plant may worsen without timely diagnosis.
</Text>
                  <Text className="text-xs text-muted-foreground">
                    Upgrade to continue scanning and unlock premium features
                  </Text>
                </View>
              </View>
            </Card>

            {/* Pro Features */}
            {/* Pro Features */}
<View className="mb-6">
  <Text className="text-lg font-semibold mb-4">What you’ll unlock</Text>

  <View className="space-y-3">
    {[
      'Unlimited plant diagnosis scans',
      'Advanced disease diagnosis',
      'Detailed treatment plans',
      'Plant health history tracking',
      'Priority support',
    ].map((feature, idx) => (
      <View
        key={idx}
        className="flex-row items-center gap-3"
      >
        <View className="w-6 h-6 rounded-full bg-primary/10 items-center justify-center">
          <Check size={14} color="#3F7C4C" strokeWidth={3} />
        </View>
        <Text className="text-sm text-foreground flex-1">
          {feature}
        </Text>
      </View>
    ))}
  </View>
</View>

            {/* Upgrade Options Header */}
            <View className="mb-4">
              <Text className="text-lg font-semibold mb-2">Choose Your Upgrade Option</Text>
              <Text className="text-sm text-muted-foreground">
                Select a subscription plan or use a coupon code below
              </Text>
            </View>
            <Text className="text-xs text-muted-foreground text-center mb-3">
  Plant Lovers' Heaven 🌿
</Text>

            {/* Pricing Plans */}
            {isPurchasing && !offerings ? (
              <View className="py-8 items-center">
                <ActivityIndicator size="large" color="#3F7C4C" />
                <Text className="text-sm text-muted-foreground mt-4">Loading pricing plans...</Text>
              </View>
            ) : (
              <View className="space-y-4 mb-6">
                {/* Monthly Plan */}
                <TouchableOpacity
                  onPress={async () => {
                    if (!offerings?.availablePackages || offerings.availablePackages.length === 0) {
                      Toast.show({
                        type: 'error',
                        text1: 'No packages available',
                        text2: 'Please check your internet connection and try again'
                      });
                      return;
                    }

                    // Find monthly package (usually $rc_monthly or similar)
                    const monthlyPackage = offerings.availablePackages.find(
                      pkg => pkg.identifier.includes('monthly') || pkg.identifier.includes('month')
                    ) || offerings.availablePackages[0]; // Fallback to first package

                    await handlePurchase(monthlyPackage, 'monthly');
                  }}
                  disabled={isProcessingPurchase || isPurchasing || !offerings}
                  activeOpacity={0.7}
                >
                <Card
  className="border-2 border-border bg-background"
  style={{ shadowOpacity: 0, elevation: 0 }}
>
                <View className="flex-row items-center justify-between">
    <View className="flex-1">
      <Text className="text-lg font-bold mb-1">Monthly</Text>
      <Text className="text-sm text-muted-foreground">Billed monthly</Text>
    </View>
    <View className="items-end justify-center">
      <Text className="text-2xl font-bold">$2.99</Text>
      <Text className="text-xs text-muted-foreground">/month</Text>
    </View>
  </View>
</Card>

              </TouchableOpacity>

              {/* Yearly Plan (Popular) */}
              <TouchableOpacity
                onPress={async () => {
                  if (!offerings?.availablePackages) {
                    Toast.show({
                      type: 'error',
                      text1: 'No packages available',
                      text2: 'Please check your internet connection and try again'
                    });
                    return;
                  }

                  // Find yearly package (usually $rc_annual or similar)
                  const yearlyPackage = offerings.availablePackages.find(
                    pkg => pkg.identifier.includes('annual') || pkg.identifier.includes('year') || pkg.identifier.includes('yearly')
                  ) || offerings.availablePackages.find(
                    pkg => pkg !== offerings.availablePackages[0]
                  ) || offerings.availablePackages[0]; // Fallback

                  await handlePurchase(yearlyPackage, 'yearly');
                }}
                disabled={isProcessingPurchase || isPurchasing || !offerings}
                activeOpacity={0.7}
              >
                <Card
  className="border-2 border-primary bg-primary/5 relative"
  style={{ shadowOpacity: 0, elevation: 0 }}
>
  {/* MOST POPULAR badge */}
  <View
  style={{
    position: 'absolute',
    top: -12,
    left: 16,
    backgroundColor: '#3F7C4C',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  }}
>
    <Text className="text-xs text-on-primary font-bold">
      MOST POPULAR
    </Text>
  </View>

  <View className="flex-row items-center justify-between">
    <View className="flex-1">
      <Text className="text-lg font-extrabold mb-1">Yearly</Text>
      <Text className="text-sm text-muted-foreground">
        Best value • Billed annually
      </Text>
    </View>

    <View className="items-end">
      <Text className="text-sm text-muted-foreground line-through">
        $35.88
      </Text>
      <Text className="text-3xl font-extrabold text-primary">
        $32.29
      </Text>
      <Text className="text-xs text-primary font-semibold">
        $2.69 / month
      </Text>
    </View>
  </View>

  <Text className="text-xs text-green-600 font-semibold mt-2">
    Save $3.59 every year 🌱
  </Text>
</Card>
              </TouchableOpacity>
              </View>
            )}

            {/* Coupon Entry (Collapsed by default) */}
<View className="mb-4">
  {!showCoupon ? (
    <TouchableOpacity
      onPress={() => setShowCoupon(true)}
      activeOpacity={0.7}
    >
      <View className="flex-row items-center justify-center gap-2 py-2 opacity-80">
        <Tag size={16} color="#3F7C4C" />
        <Text className="text-sm text-primary font-semibold underline">
          Have a coupon code?
        </Text>
      </View>
    </TouchableOpacity>
  ) : (
    <Card
  className="border border-border bg-muted/30"
  style={{ shadowOpacity: 0, elevation: 0 }}
>
        Apply Coupon

      <View className="flex-row gap-4">
        <TextInput
          className="flex-1 border border-border rounded-lg px-4 py-3 text-base bg-background"
          placeholder="ENTER CODE"
          value={couponCode}
          onChangeText={(text) => {
            setCouponCode(text.toUpperCase());
            setCouponError('');
            setCouponSuccess('');
          }}
          autoCapitalize="characters"
          editable={!isRedeeming}
        />

        <Button
          size="md"
          onPress={handleRedeemCoupon}
          disabled={isRedeeming || !couponCode.trim()}
        >
          {isRedeeming ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text className="text-on-primary font-semibold">Apply</Text>
          )}
        </Button>
      </View>

      {couponError && (
        <Text className="text-xs text-destructive mt-2 text-center">
          {couponError}
        </Text>
      )}

      {couponSuccess && (
        <Text className="text-xs text-primary mt-2 text-center">
          {couponSuccess}
        </Text>
      )}
    </Card>
  )}
</View>

            {/* Payment Methods */}
            <View className="py-4 border-t border-border">
              <Text className="text-xs text-muted-foreground text-center mb-2">
                Payment methods accepted:
              </Text>
              <View className="flex-row justify-center items-center gap-4">
                <Text className="text-xs text-muted-foreground">Google Pay</Text>
                <Text className="text-xs text-muted-foreground">•</Text>
                <Text className="text-xs text-muted-foreground">Stripe</Text>
                <Text className="text-xs text-muted-foreground">•</Text>
                <Text className="text-xs text-muted-foreground">Credit Card</Text>
              </View>
            </View>

            {/* Trust Badges */}
            <View className="flex items-center gap-3 py-4 border-t border-border">
              <Shield size={16} color="#3F7C4C" strokeWidth={2} />
              <Text className="text-xs text-muted-foreground text-center">
                Secure payment • Cancel anytime
              </Text>
            </View>

            {/* Close Button */}
            <Button
              variant="outline"
              size="md"
              fullWidth
              onPress={onClose}
            >
              <Text className="text-muted-foreground">
  Continue with limited access
</Text>
            </Button>
          </ScrollView>
        </Card>
      </View>
      </SafeAreaView>
    </Modal>
  );
}
