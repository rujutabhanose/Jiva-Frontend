import React, { useState } from 'react';
import { View, Text, Modal, TouchableOpacity, Pressable, ScrollView, TextInput, ActivityIndicator } from 'react-native';
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
  const { offerings, purchasePackage, isLoading: isPurchasing, error: purchaseError, retryFetchOfferings } = usePurchases();
  const [couponCode, setCouponCode] = useState('');
  const [isRedeeming, setIsRedeeming] = useState(false);
  const [couponError, setCouponError] = useState('');
  const [couponSuccess, setCouponSuccess] = useState('');
  const [isProcessingPurchase, setIsProcessingPurchase] = useState(false);
  const [showCoupon, setShowCoupon] = useState(false);
  const [purchaseErrorMessage, setPurchaseErrorMessage] = useState<string | null>(null);

  // Derive packages from offerings once, reuse in both the press handlers and the price display
  const monthlyPackage = offerings?.availablePackages.find(
    pkg => pkg.identifier.includes('monthly') || pkg.identifier.includes('month')
  ) ?? offerings?.availablePackages[0];

  const yearlyPackage = offerings?.availablePackages.find(
    pkg => pkg.identifier.includes('annual') || pkg.identifier.includes('year') || pkg.identifier.includes('yearly')
  ) ?? offerings?.availablePackages.find(pkg => pkg !== offerings?.availablePackages[0])
    ?? offerings?.availablePackages[0];

  const isButtonsDisabled = isProcessingPurchase || isPurchasing || !offerings || (!monthlyPackage && !yearlyPackage);

  // Prices from RevenueCat — locale-aware and always up to date
  const monthlyPriceString = monthlyPackage?.product.priceString ?? '—';
  const yearlyPriceString = yearlyPackage?.product.priceString ?? '—';

  // Derived display values for yearly card
  const yearlyPriceNum = yearlyPackage?.product.price ?? 0;
  const monthlyPriceNum = monthlyPackage?.product.price ?? 0;
  const currencyCode = yearlyPackage?.product.currencyCode ?? 'USD';
  const fmt = (n: number) => n.toLocaleString('en-US', { style: 'currency', currency: currencyCode, minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const perMonthString = yearlyPriceNum > 0 ? fmt(yearlyPriceNum / 12) : '—';
  const fullYearlyString = monthlyPriceNum > 0 ? fmt(monthlyPriceNum * 12) : '—';
  const yearlySavingsString = monthlyPriceNum > 0 && yearlyPriceNum > 0 ? fmt(monthlyPriceNum * 12 - yearlyPriceNum) : null;

  const handlePurchase = async (pkg: PurchasesPackage, planType: 'monthly' | 'yearly') => {
    setPurchaseErrorMessage(null);
    setIsProcessingPurchase(true);
    try {
      const result = await purchasePackage(pkg, deviceId);

      if (result.success) {
        onSelectPlan(planType);
        if (onUpgradeSuccess) {
          onUpgradeSuccess();
        }
        setTimeout(() => {
          onClose();
        }, 1500);
      } else {
        if (result.message !== 'Purchase was cancelled.') {
          setPurchaseErrorMessage(result.message);
        }
      }
    } catch (error: any) {
      console.error('[UpgradeModal] Purchase error:', error);
      setPurchaseErrorMessage(error.message || 'An error occurred during purchase');
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

        if (onUpgradeSuccess) {
          onUpgradeSuccess();
        }

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
            className="w-full max-w-md bg-[#F2F6F5]"
            style={{ maxHeight: '90%' }}
          >
            {purchaseErrorMessage && (
              <View style={{ backgroundColor: '#FEE2E2', borderColor: '#FCA5A5', borderWidth: 1, borderRadius: 10, margin: 12, padding: 12 }}>
                <Text style={{ color: '#B91C1C', fontSize: 13, textAlign: 'center', fontWeight: '600' }}>
                  {purchaseErrorMessage}
                </Text>
              </View>
            )}

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
                      You've reached your free scan limit
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
              <View className="mb-6">
                <Text className="text-lg font-semibold mb-4">What you'll unlock</Text>
                <View className="space-y-3">
                  {[
                    'Unlimited plant diagnosis scans',
                    'Advanced disease diagnosis',
                    'Detailed treatment plans',
                    'Plant health history tracking',
                    'Priority support',
                  ].map((feature, idx) => (
                    <View key={idx} className="flex-row items-center gap-3">
                      <View className="w-6 h-6 rounded-full bg-primary/10 items-center justify-center">
                        <Check size={14} color="#3F7C4C" strokeWidth={3} />
                      </View>
                      <Text className="text-sm text-foreground flex-1">{feature}</Text>
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
              ) : !offerings && purchaseError ? (
                <View className="py-8 items-center gap-3">
                  <AlertCircle size={32} color="#D08A4E" />
                  <Text className="text-sm text-muted-foreground text-center">
                    Could not load subscription plans. Please check your connection and try again.
                  </Text>
                  <TouchableOpacity
                    onPress={retryFetchOfferings}
                    className="mt-2 px-6 py-3 bg-primary rounded-xl"
                    activeOpacity={0.8}
                  >
                    <Text className="text-white font-semibold text-sm">Retry</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View className="space-y-4 mb-6">
                  {/* Monthly Plan */}
                  <Pressable
                    onPress={async () => {
                      if (!monthlyPackage) {
                        setPurchaseErrorMessage('No packages available. Please check your internet connection and try again.');
                        return;
                      }
                      await handlePurchase(monthlyPackage, 'monthly');
                    }}
                    disabled={isButtonsDisabled}
                    style={{ opacity: isButtonsDisabled ? 0.5 : 1 }}
                  >
                    <Card className="border-2 border-border bg-[#F2F6F5]" style={{ shadowOpacity: 0, elevation: 0 }}>
                      <View className="flex-row items-center justify-between">
                        <View className="flex-1">
                          <Text className="text-lg font-bold mb-1">Monthly</Text>
                          <Text className="text-sm text-muted-foreground">Billed monthly</Text>
                        </View>
                        <View className="items-end justify-center">
                          <Text className="text-2xl font-bold">{monthlyPriceString}</Text>
                          <Text className="text-xs text-muted-foreground">/month</Text>
                        </View>
                      </View>
                    </Card>
                  </Pressable>

                  <View className="h-4" />

                  {/* Yearly Plan (Popular) */}
                  <Pressable
                    onPress={async () => {
                      if (!yearlyPackage) {
                        setPurchaseErrorMessage('No packages available. Please check your internet connection and try again.');
                        return;
                      }
                      await handlePurchase(yearlyPackage, 'yearly');
                    }}
                    disabled={isButtonsDisabled}
                    style={{ opacity: isButtonsDisabled ? 0.5 : 1 }}
                  >
                    <Card className="border-2 border-primary bg-primary/5 relative" style={{ shadowOpacity: 0, elevation: 0 }}>
                      <View style={{ position: 'absolute', top: -12, left: 16, backgroundColor: '#3F7C4C', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 }}>
                        <Text className="text-xs text-white font-bold">MOST POPULAR</Text>
                      </View>
                      <View className="flex-row items-center justify-between">
                        <View className="flex-1">
                          <Text className="text-lg font-extrabold mb-1">Yearly</Text>
                          <Text className="text-sm text-muted-foreground">Best value • Billed annually</Text>
                        </View>
                        <View className="items-end">
                          {fullYearlyString !== '—' && (
                            <Text className="text-sm text-muted-foreground line-through">{fullYearlyString}</Text>
                          )}
                          <Text className="text-3xl font-extrabold text-primary">{yearlyPriceString}</Text>
                          {perMonthString !== '—' && (
                            <Text className="text-xs text-primary font-semibold">{perMonthString} / month</Text>
                          )}
                        </View>
                      </View>
                      {yearlySavingsString && (
                        <Text className="text-xs text-green-600 font-semibold mt-2">
                          Save {yearlySavingsString} every year 🌱
                        </Text>
                      )}
                    </Card>
                  </Pressable>
                </View>
              )}

              {/* Coupon Entry (Collapsed by default) */}
              <View className="mb-4">
                {!showCoupon ? (
                  <TouchableOpacity onPress={() => setShowCoupon(true)} activeOpacity={0.7}>
                    <View className="flex-row items-center justify-center gap-2 py-2 opacity-80">
                      <Tag size={16} color="#3F7C4C" />
                      <Text className="text-sm text-primary font-semibold underline">
                        Have a coupon code?
                      </Text>
                    </View>
                  </TouchableOpacity>
                ) : (
                  <Card className="border border-border bg-[#F2F6F5]" style={{ shadowOpacity: 0, elevation: 0 }}>
                    <Text className="text-sm font-semibold mb-3">Apply Coupon</Text>
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
                      <Text className="text-xs text-destructive mt-2 text-center">{couponError}</Text>
                    )}
                    {couponSuccess && (
                      <Text className="text-xs text-primary mt-2 text-center">{couponSuccess}</Text>
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

              {/* Close Link */}
              <TouchableOpacity onPress={onClose} activeOpacity={0.7}>
                <Text className="text-sm text-muted-foreground text-center underline">
                  Continue with limited access
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </Card>
        </View>
      </SafeAreaView>
    </Modal>
  );
}
