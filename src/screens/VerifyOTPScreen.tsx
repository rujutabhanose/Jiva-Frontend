import React, { useState, useRef, useEffect } from 'react';
import { View, Text, ScrollView, TextInput, KeyboardAvoidingView, Platform, TouchableOpacity } from 'react-native';
import { Button } from '../components/ui/Button';
import { Header } from '../components/ui/Header';

interface VerifyOTPScreenProps {
  email: string;
  onVerify: (otp: string) => void;
  onResend: () => void;
  onBack: () => void;
  isLoading?: boolean;
  isResending?: boolean;
  error?: string | null;
}

const OTP_LENGTH = 6;

export function VerifyOTPScreen({
  email,
  onVerify,
  onResend,
  onBack,
  isLoading,
  isResending,
  error,
}: VerifyOTPScreenProps) {
  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const [resendCooldown, setResendCooldown] = useState(0);
  const inputRefs = useRef<(TextInput | null)[]>([]);

  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleChange = (text: string, index: number) => {
    if (text.length > 1) {
      // Handle paste
      const pastedCode = text.slice(0, OTP_LENGTH).split('');
      const newOtp = [...otp];
      pastedCode.forEach((char, i) => {
        if (index + i < OTP_LENGTH) {
          newOtp[index + i] = char;
        }
      });
      setOtp(newOtp);

      // Focus on the last filled input or the next empty one
      const nextIndex = Math.min(index + pastedCode.length, OTP_LENGTH - 1);
      inputRefs.current[nextIndex]?.focus();
    } else {
      const newOtp = [...otp];
      newOtp[index] = text;
      setOtp(newOtp);

      // Auto-focus next input
      if (text && index < OTP_LENGTH - 1) {
        inputRefs.current[index + 1]?.focus();
      }
    }
  };

  const handleKeyPress = (key: string, index: number) => {
    if (key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleSubmit = () => {
    const otpString = otp.join('');
    if (otpString.length === OTP_LENGTH) {
      onVerify(otpString);
    }
  };

  const handleResend = () => {
    if (resendCooldown === 0) {
      onResend();
      setResendCooldown(60); // 60 second cooldown
    }
  };

  const isOtpComplete = otp.every((digit) => digit !== '');

  return (
    <View className="flex-1 bg-background">
      <Header
        title="Verify Code"
        showBack
        onBack={onBack}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1"
      >
        <ScrollView
          contentContainerStyle={{
            paddingHorizontal: 24,
            paddingVertical: 32,
            flexGrow: 1,
          }}
          showsVerticalScrollIndicator={false}
        >
          <View className="mb-8">
            <Text className="text-2xl font-bold mb-2">Enter verification code</Text>
            <Text className="text-muted-foreground">
              We've sent a 6-digit code to{'\n'}
              <Text className="font-medium text-foreground">{email}</Text>
            </Text>
          </View>

          {/* OTP Input Boxes */}
          <View className="flex-row justify-between mb-8">
            {otp.map((digit, index) => (
              <TextInput
                key={index}
                ref={(ref) => (inputRefs.current[index] = ref)}
                className="w-12 h-14 border-2 border-border rounded-xl text-center text-xl font-bold bg-background"
                style={{
                  borderColor: digit ? '#2d5a27' : '#e5e7eb',
                }}
                value={digit}
                onChangeText={(text) => handleChange(text, index)}
                onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key, index)}
                keyboardType="number-pad"
                maxLength={1}
                selectTextOnFocus
              />
            ))}
          </View>

          {error && (
            <View className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl">
              <Text className="text-red-600 text-sm text-center">{error}</Text>
            </View>
          )}

          <Button
            variant="primary"
            size="lg"
            fullWidth
            onPress={handleSubmit}
            className="mb-6 rounded-xl"
            disabled={isLoading || !isOtpComplete}
          >
            {isLoading ? 'Verifying...' : 'Verify Code'}
          </Button>

          {/* Resend Code */}
          <View className="flex-row justify-center items-center">
            <Text className="text-sm text-muted-foreground">Didn't receive the code? </Text>
            {resendCooldown > 0 ? (
              <Text className="text-sm text-muted-foreground">
                Resend in {resendCooldown}s
              </Text>
            ) : (
              <TouchableOpacity onPress={handleResend} disabled={isResending}>
                <Text className="text-sm text-primary font-medium">
                  {isResending ? 'Sending...' : 'Resend Code'}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
