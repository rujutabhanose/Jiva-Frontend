import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Header } from '../components/ui/Header';
import { Mail } from 'lucide-react-native';

interface SignInScreenProps {
  onSignIn: (email: string, password: string) => void;
  onBack: () => void;
  onRegister: () => void;
}

export function SignInScreen({ onSignIn, onBack, onRegister }: SignInScreenProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({ email: '', password: '' });

  const handleSubmit = () => {
    // Basic validation
    const newErrors = { email: '', password: '' };

    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);

    if (!newErrors.email && !newErrors.password) {
      onSignIn(email, password);
    }
  };

  return (
    <View className="flex-1 bg-background">
      <Header
        title="Sign In"
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
            <Text className="text-2xl font-bold mb-2">Welcome back</Text>
            <Text className="text-muted-foreground">
              Sign in to save your plant diagnoses and track progress
            </Text>
          </View>

          {/* Email/Password Form */}
          <View className="space-y-6 mb-8">
            <Input
              type="email"
              label="Email"
              placeholder="your@email.com"
              value={email}
              onChangeText={setEmail}
              error={errors.email}
            />

            <Input
              type="password"
              label="Password"
              placeholder="Enter Password"
              value={password}
              onChangeText={setPassword}
              error={errors.password}
            />
          </View>

          <Button
  variant="primary"
  size="lg"
  fullWidth
  onPress={handleSubmit}
  className="mb-6 rounded-xl"
>Sign In
          </Button>

          {/* Register Link */}
          <View className="text-center mb-6">
            <View className="flex-row justify-center items-center mb-6">
  <Text className="text-sm text-muted-foreground">
    Don't have an account?{' '}
  </Text>
  <TouchableOpacity onPress={onRegister}>
    <Text className="text-sm text-primary font-medium ml-1">
      Create account
    </Text>
  </TouchableOpacity>
</View>
          </View>

          {/* Privacy Note */}
          <View className="mt-8 p-4 bg-muted/50 rounded-xl">
            <Text className="text-xs text-center text-muted-foreground">
              Your plant images are processed securely and privately. We never share your data without permission.
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}