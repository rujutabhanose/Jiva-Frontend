import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Header } from '../components/ui/Header';
import { Badge } from '../components/ui/Badge';
import { Lock, Check, Sparkles, Users, Zap } from 'lucide-react-native';

interface ScanLimitScreenProps {
  onBack: () => void;
  onUpgrade: () => void;
  onJoinBeta: () => void;
  onRestorePurchase?: () => void;
}

export function ScanLimitScreen({ onBack, onUpgrade, onJoinBeta, onRestorePurchase }: ScanLimitScreenProps) {
  const plans = [
    {
      name: 'Monthly',
      price: '$9.99',
      period: 'per month',
      recommended: false
    },
    {
      name: 'Yearly',
      price: '$79.99',
      period: 'per year',
      savings: 'Save 33%',
      recommended: true
    }
  ];

  const features = [
    { icon: Sparkles, text: 'Unlimited plant scans' },
    { icon: Zap, text: 'Deeper diagnosis & analysis' },
    { icon: Users, text: 'Priority support for nurseries' },
    { icon: Check, text: 'Export scan history' }
  ];

  return (
    <View className="flex-1 bg-background">
      <Header
        title="Upgrade to Pro"
        showBack
        onBack={onBack}
      />

      <ScrollView className="flex-1">
        <View className="max-w-lg mx-auto px-6 py-8 space-y-6">
          {/* Limit Reached Message */}
          <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20 text-center">
            <View className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock size={32} color="#3F7C4C" strokeWidth={2} />
            </View>
            <Text className="text-xl font-bold mb-2 text-center">You've used your free scan</Text>
            <Text className="text-muted-foreground text-center">
              Upgrade to Jiva Plants Pro for unlimited scans and advanced features
            </Text>
          </Card>

          {/* Features */}
          <View>
            <Text className="text-lg font-semibold mb-4">What you'll get:</Text>
            <View className="space-y-3">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <View key={index} className="flex items-center gap-3">
                    <View className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Icon size={20} color="#3F7C4C" strokeWidth={2} />
                    </View>
                    <Text className="flex-1">{feature.text}</Text>
                  </View>
                );
              })}
            </View>
          </View>

          {/* Pricing Plans */}
          <View>
            <Text className="text-lg font-semibold mb-4">Choose your plan:</Text>
            <View className="space-y-3">
              {plans.map((plan) => (
                <Card
                  key={plan.name}
                  className={`relative ${plan.recommended ? 'border-primary/50 bg-primary/5' : ''}`}
                >
                  {plan.recommended && (
                    <View className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <Badge variant="success">Recommended</Badge>
                    </View>
                  )}
                  <View className="flex items-center justify-between">
                    <View>
                      <Text className="text-base font-semibold mb-1">{plan.name}</Text>
                      <Text className="text-sm text-muted-foreground">{plan.period}</Text>
                      {plan.savings && (
                        <Badge variant="success" className="mt-2">{plan.savings}</Badge>
                      )}
                    </View>
                    <View className="text-right">
                      <Text className="text-2xl text-primary font-bold">{plan.price}</Text>
                    </View>
                  </View>
                </Card>
              ))}
            </View>
          </View>

          {/* CTA */}
          <View className="space-y-6 pt-4">
            <Button
              variant="primary"
              size="lg"
              fullWidth
              onPress={onUpgrade}
            >
              <Text className="text-on-primary font-medium">Upgrade to Jiva Plants Pro</Text>
            </Button>

            <Button
              variant="outline"
              size="md"
              fullWidth
              onPress={onJoinBeta}
            >
              <Text className="text-primary font-medium">Join Beta List (Free Upgrade)</Text>
            </Button>

            <TouchableOpacity onPress={onRestorePurchase} className="w-full py-2">
              <Text className="text-sm text-muted-foreground text-center">
                Restore Purchase
              </Text>
            </TouchableOpacity>
          </View>

          {/* Beta Note */}
          <Card className="bg-accent/10 border-accent/30">
            <Text className="text-sm text-center">
              💡 Nurseries & agricultural professionals can join our beta program for free unlimited scans
            </Text>
          </Card>
        </View>
      </ScrollView>
    </View>
  );
}