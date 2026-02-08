import React, { useState } from 'react';
import { View, Text, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Header } from '../components/ui/Header';

interface ForgotPasswordScreenProps {
  onSubmit: (email: string) => void;
  onBack: () => void;
  isLoading?: boolean;
  error?: string | null;
}

export function ForgotPasswordScreen({ onSubmit, onBack, isLoading, error }: ForgotPasswordScreenProps) {
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');

  const handleSubmit = () => {
    setEmailError('');

    if (!email) {
      setEmailError('Email is required');
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setEmailError('Please enter a valid email');
      return;
    }

    onSubmit(email);
  };

  return (
    <View className="flex-1 bg-background">
      <Header
        title="Forgot Password"
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
            <Text className="text-2xl font-bold mb-2">Reset your password</Text>
            <Text className="text-muted-foreground">
              Enter your email address and we'll send you a code to reset your password.
            </Text>
          </View>

          <View className="space-y-6 mb-8">
            <Input
              type="email"
              label="Email"
              placeholder="your@email.com"
              value={email}
              onChangeText={setEmail}
              error={emailError}
              autoFocus
            />
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
            disabled={isLoading}
          >
            {isLoading ? 'Sending...' : 'Send Reset Code'}
          </Button>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
