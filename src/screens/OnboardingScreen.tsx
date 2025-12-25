import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Header } from '../components/ui/Header';
import { UserType, PlantType } from '../utils/storage';
import { User, Leaf, Check } from 'lucide-react-native';

interface OnboardingScreenProps {
  userName?: string;
  initialUserType?: UserType | null;
  initialPlantTypes?: PlantType[];
  onComplete: (userType: UserType | null, plantTypes: PlantType[]) => void;
  onSkip: () => void;
  showSkip?: boolean;
  mode?: 'onboarding' | 'edit';
  onBack?: () => void;
}

const USER_TYPE_OPTIONS = [
  { value: 'Home gardener', label: 'Home Gardener', description: 'Growing plants at home for enjoyment' },
  { value: 'Nursery', label: 'Nursery', description: 'Commercial plant production and sales' },
  { value: 'Farmer', label: 'Farmer', description: 'Agricultural cultivation and farming' },
  { value: 'Other', label: 'Other', description: 'Other plant-related activities' },
];

const PLANT_TYPE_OPTIONS = [
  { value: 'Houseplants', label: 'Houseplants' },
  { value: 'Vegetables', label: 'Vegetables' },
  { value: 'Fruits', label: 'Fruits' },
  { value: 'Flowers', label: 'Flowers' },
  { value: 'Trees/Shrubs', label: 'Trees/Shrubs' },
  { value: 'Other', label: 'Other' },
];

export function OnboardingScreen({
  userName,
  initialUserType = null,
  initialPlantTypes = [],
  onComplete,
  onSkip,
  showSkip = true,
  mode = 'onboarding',
  onBack,
}: OnboardingScreenProps) {
  console.log('[OnboardingScreen] Rendering with props:', {
    userName,
    initialUserType,
    initialPlantTypes,
    showSkip,
    mode,
  });

  const [selectedUserType, setSelectedUserType] = React.useState<UserType | null>(initialUserType);
  const [selectedPlantTypes, setSelectedPlantTypes] = React.useState<PlantType[]>(initialPlantTypes);

  console.log('[OnboardingScreen] Current state:', {
    selectedUserType,
    selectedPlantTypes,
  });

  const togglePlantType = (plantType: PlantType) => {
    console.log('[OnboardingScreen] Toggling plant type:', plantType);
    setSelectedPlantTypes(prev => {
      const newTypes = prev.includes(plantType)
        ? prev.filter(t => t !== plantType)
        : [...prev, plantType];
      console.log('[OnboardingScreen] Updated plant types:', newTypes);
      return newTypes;
    });
  };

  const handleUserTypeSelect = (userType: UserType) => {
    console.log('[OnboardingScreen] User type selected:', userType);
    setSelectedUserType(userType);
  };

  const handleComplete = () => {
    console.log('[OnboardingScreen] Completing onboarding with:', {
      selectedUserType,
      selectedPlantTypes,
    });
    onComplete(selectedUserType, selectedPlantTypes);
  };

  const handleSkip = () => {
    console.log('[OnboardingScreen] Skipping onboarding');
    onSkip();
  };

  const isOnboarding = mode === 'onboarding';

  return (
    <View className="flex-1 bg-background">
      <Header
        title={isOnboarding ? 'Tell us about yourself' : 'Edit Preferences'}
        showBack={!isOnboarding}
        onBack={onBack}
      />
      {showSkip && isOnboarding && (
  <TouchableOpacity
    onPress={handleSkip}
    className="absolute top-12 right-4 z-10"
    activeOpacity={0.8}
  >
    <View className="px-4 py-2 rounded-full bg-muted/80 border border-border">
      <Text className="text-sm font-semibold text-foreground">
        Skip
      </Text>
    </View>
  </TouchableOpacity>
)}

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="px-6 pt-6">
          <View
  className="bg-card rounded-2xl px-6 py-8 border border-border"
  style={{ gap: 32 }}
>

            {/* Welcome */}
            {isOnboarding && (
              <View className="items-center" style={{ gap: 12 }}>
                <View className="px-4 py-2 rounded-full bg-primary/10">
                  <Text className="text-primary font-medium">
                    {userName ? `Welcome, ${userName}!` : 'Welcome!'}
                  </Text>
                </View>

                <Text className="text-2xl font-semibold text-center">
                  Tell us about yourself
                </Text>

                <Text className="text-muted-foreground text-center leading-relaxed px-4">
                  This helps us personalize tips, reminders, and plant care recommendations.
                </Text>
              </View>
            )}

            {/* USER TYPE */}
            <View style={{ gap: 12 }}>
              <View className="flex-row items-center" style={{ gap: 8 }}>
                <User size={20} color="#3F7C4C" strokeWidth={2} />
                <Text className="text-lg font-semibold">I am primarily a</Text>
              </View>

              <View style={{ gap: 12, paddingTop: 4 }}>
                {USER_TYPE_OPTIONS.map(option => {
                  const selected = selectedUserType === option.value;

                  return (
                    <TouchableOpacity
                      key={option.value}
                      activeOpacity={0.7}
                      onPress={() => handleUserTypeSelect(option.value as UserType)}
                    >
                      <Card
  padding="none"
  className={`${
    selected
      ? 'border-2 border-primary bg-primary/5'
      : 'border border-border bg-card'
  }`}
  style={{
    elevation: 0,                 // Android
    shadowColor: 'transparent',   // iOS
  }}
>
                        <View className="p-4 flex-row items-center" style={{ gap: 12 }}>
                          <View
                            className={`w-6 h-6 rounded-full border-2 items-center justify-center ${
                              selected
                                ? 'border-primary bg-primary'
                                : 'border-muted'
                            }`}
                          >
                            {selected && (
                              <Check size={14} color="white" strokeWidth={3} />
                            )}
                          </View>

                          <View className="flex-1" style={{ gap: 2 }}>
                            <Text className="font-semibold text-base">{option.label}</Text>
                            <Text className="text-sm text-muted-foreground">
                              {option.description}
                            </Text>
                          </View>
                        </View>
                      </Card>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* PLANT TYPES */}
            <View style={{ gap: 16 }}>
              <View className="flex-row items-center" style={{ gap: 8 }}>
                <Leaf size={20} color="#3F7C4C" strokeWidth={2} />
                <Text className="text-lg font-semibold">What do you grow?</Text>
                <Text className="text-sm text-muted-foreground">(select all)</Text>
              </View>

              <View className="flex-row flex-wrap" style={{ gap: 10 }}>
                {PLANT_TYPE_OPTIONS.map(option => {
                  const selected = selectedPlantTypes.includes(option.value);

                  return (
                    <TouchableOpacity
                      key={option.value}
                      activeOpacity={0.7}
                      onPress={() => togglePlantType(option.value as PlantType)}
                      className={`px-5 py-3 rounded-full border ${
                        selected
                          ? 'bg-primary border-primary'
                          : 'bg-card border-border'
                      }`}
                    >
                      <View className="flex-row items-center" style={{ gap: 6 }}>
                        {selected && <Check size={14} color="white" strokeWidth={2.5} />}
                        <Text
                          className={`font-medium text-sm ${
                            selected ? 'text-white' : 'text-foreground'
                          }`}
                        >
                          {option.label}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* ACTIONS */}
            <View className="pt-4" style={{ gap: 12 }}>
              <Button
                variant="primary"
                size="lg"
                fullWidth
                disabled={!selectedUserType}
                onPress={handleComplete}
              >
                {isOnboarding ? 'Continue' : 'Save Preferences'}
              </Button>
            </View>

            {isOnboarding && (
              <Text className="text-xs text-center text-muted-foreground leading-relaxed">
                You can always update these preferences later in settings.
              </Text>
            )}

          </View>
        </View>
      </ScrollView>
    </View>
  );
}