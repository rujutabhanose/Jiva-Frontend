import React, { useState } from 'react';
import { View, Text, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Header } from '../components/ui/Header';

interface ResetPasswordScreenProps {
  onSubmit: (newPassword: string) => void;
  onBack: () => void;
  isLoading?: boolean;
  error?: string | null;
}

export function ResetPasswordScreen({ onSubmit, onBack, isLoading, error }: ResetPasswordScreenProps) {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState({ password: '', confirmPassword: '' });

  const handleSubmit = () => {
    const newErrors = { password: '', confirmPassword: '' };

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);

    if (!newErrors.password && !newErrors.confirmPassword) {
      onSubmit(password);
    }
  };

  return (
    <View className="flex-1 bg-background">
      <Header
        title="New Password"
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
            <Text className="text-2xl font-bold mb-2">Create new password</Text>
            <Text className="text-muted-foreground">
              Your new password must be at least 6 characters long.
            </Text>
          </View>

          <View className="space-y-6 mb-8">
            <Input
              type="password"
              label="New Password"
              placeholder="Enter new password"
              value={password}
              onChangeText={setPassword}
              error={errors.password}
              autoFocus
            />

            <Input
              type="password"
              label="Confirm Password"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              error={errors.confirmPassword}
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
            {isLoading ? 'Resetting...' : 'Reset Password'}
          </Button>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
