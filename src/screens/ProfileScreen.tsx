import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Header } from '../components/ui/Header';
import { User, CreditCard, Shield, Info, LogOut, Leaf, MessageCircle } from 'lucide-react-native';
import { Switch } from '../components/ui/switch';
import { UserData } from '../utils/storage';
import { ChatbotModal } from '../components/ChatbotModal';
interface ProfileScreenProps {
  isPro: boolean;
  userData?: UserData | null;
  onNavigate: (screen: string) => void;
  onLogout: () => void;
  onEditPreferences?: () => void;
  onUpgrade?: () => void;
  onCancelSubscription?: () => void;
  onDeleteAccount?: () => void;
}

export function ProfileScreen({ isPro, userData, onNavigate, onLogout, onEditPreferences, onUpgrade, onCancelSubscription, onDeleteAccount }: ProfileScreenProps) {
  const [notificationsEnabled, setNotificationsEnabled] = React.useState(true);
  const [chatbotVisible, setChatbotVisible] = React.useState(false);

  const handleCancelSubscription = () => {
    Alert.alert(
      'Cancel Subscription',
      'Are you sure you want to cancel your Pro subscription?\n\nYou will lose access to:\n• Unlimited plant diagnosis scans\n• Advanced disease diagnosis\n• Detailed treatment plans\n• Priority support\n\nYour subscription will be cancelled immediately.',
      [
        {
          text: 'Keep Subscription',
          style: 'cancel',
        },
        {
          text: 'Cancel Subscription',
          style: 'destructive',
          onPress: () => {
            if (onCancelSubscription) {
              onCancelSubscription();
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to delete your account? This will permanently delete:\n\n• Your profile and account data\n• All your scan history\n• Your plant care records\n• Your subscription (if any)\n\nThis action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            if (onDeleteAccount) {
              onDeleteAccount();
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  return (
    <View className="flex-1 bg-background">
      <Header
        title="Profile"
      />

      <ScrollView 
        className="flex-1"
        contentContainerStyle={{ 
          paddingBottom: 40,
          paddingTop: 8,
        }}
        showsVerticalScrollIndicator={true}
        bounces={true}
        style={{ flex: 1 }}
      >
        <View className="max-w-lg mx-auto px-6 py-6" style={{ gap: 24, minHeight: '100%' }}>
          {/* User Info */}
          <Card
  className="bg-primary/5 border-primary/10"
  style={{ shadowOpacity: 0, elevation: 0 }}
>
          <View className="flex flex-row items-center gap-4">
            <View className="w-18 h-18 bg-primary/15 rounded-full items-center justify-center">
            <User size={34} color="#3F7C4C" />
    </View>

    <View className="flex-1">
      <Text className="text-xl font-semibold">
        {userData?.name || 'Plant Parent'}
      </Text>
      <Text className="text-sm text-muted-foreground">
        {userData?.email}
      </Text>
    </View>

    {isPro && <Badge variant="success">PRO</Badge>}
  </View>
</Card>

          {/* Account Section */}
          <TouchableOpacity
  activeOpacity={0.6}
  onPress={onLogout}
  className="w-full flex flex-row items-center gap-3 p-4"
>
  <LogOut size={20} color="#3F7C4C" strokeWidth={2} />
  <Text className="flex-1 text-left">Sign Out</Text>
</TouchableOpacity>

          {/* Plant Preferences Section */}
          <View>
            <Text className="mb-2 px-1 text-xs uppercase tracking-wide text-muted-foreground">Plant Preferences</Text>
            <Card className="bg-[#F2F6F5]">
              <View className="flex flex-row items-start gap-3 mb-4">
                <Leaf size={20} color="#3F7C4C" strokeWidth={2} />
                <View className="flex-1">
                  <View className="flex flex-row items-center justify-between mb-2">
                    <Text className="font-medium">Gardener Profile</Text>
                    {onEditPreferences && (
  <TouchableOpacity
    activeOpacity={0.8}
    onPress={onEditPreferences}
    className={`px-4 py-2 rounded-full ${
      !userData?.userType && (!userData?.plantTypes || userData.plantTypes.length === 0)
        ? 'bg-primary'
        : 'bg-primary/10'
    }`}
  >
    <Text
      className={`text-sm font-medium ${
        !userData?.userType && (!userData?.plantTypes || userData.plantTypes.length === 0)
          ? 'text-white'
          : 'text-primary'
      }`}
    >
      {!userData?.userType && (!userData?.plantTypes || userData.plantTypes.length === 0)
        ? 'Set your preferences'
        : 'Edit'}
    </Text>
  </TouchableOpacity>
)}
                  </View>
                  <View className="space-y-2">
                    <View>
                      <Text className="text-sm text-muted-foreground">User Type: </Text>
                      <Text className="text-sm">
                        {userData?.userType || <Text className="text-muted-foreground italic">Not set</Text>}
                      </Text>
                    </View>
                    <View>
                      <Text className="text-sm text-muted-foreground">Plant Types: </Text>
                      <Text className="text-sm">
                        {userData?.plantTypes && userData.plantTypes.length > 0 ? (
                          userData.plantTypes.join(', ')
                        ) : (
                          <Text className="text-muted-foreground italic">Not set</Text>
                        )}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            </Card>
          </View>

          {/* Subscription */}
          <View>
            <Text className="mb-2 px-1 text-xs uppercase tracking-wide text-muted-foreground">Subscription</Text>
            <Card
  className="bg-[#F2F6F5]"
  style={{ shadowOpacity: 0, elevation: 0 }}
>
              <View className="flex flex-row items-center justify-between mb-2">
                <View className="flex flex-row items-center gap-2">
                  <CreditCard size={20} color="#3F7C4C" strokeWidth={2} />
                  <Text>{isPro ? 'Jiva Plants Pro' : 'Free Plan'}</Text>
                </View>
                {isPro && <Badge variant="success">Active</Badge>}
              </View>
              {isPro ? (
                <>
                  <Text className="text-sm text-muted-foreground mb-2">
                    Unlimited plant scans, advanced disease detection, and priority support
                  </Text>
                  <TouchableOpacity
                    activeOpacity={0.85}
                    onPress={handleCancelSubscription}
                    className="mt-3 px-4 py-2 rounded-full self-start bg-destructive/10"
                  >
                    <Text className="text-sm font-medium text-destructive">
                      Cancel Subscription
                    </Text>
                  </TouchableOpacity>
                </>
              ) : (
                <>
                  <Text className="text-sm text-muted-foreground mb-2">
                    Unlimited plant scans, disease detection, and priority models
                  </Text>
                  <TouchableOpacity
                    activeOpacity={0.85}
                    onPress={onUpgrade}
                    className="mt-3 px-4 py-2 rounded-full self-start bg-primary"
                  >
                    <Text className="text-sm font-medium text-white">
                      Upgrade to Pro
                    </Text>
                  </TouchableOpacity>
                </>
              )}
            </Card>
          </View>

          {/* Notifications */}
          <View>
            <Text className="mb-2 px-1 text-xs uppercase tracking-wide text-muted-foreground">Notifications</Text>
            <Card
  padding="none"
  className="bg-[#F2F6F5]"
  style={{ shadowOpacity: 0, elevation: 0 }}
>
              <View className="flex flex-row items-center justify-between p-4">
                <Text className="text-sm">Scan Reminders</Text>
                <Switch
                  value={notificationsEnabled}
                  onValueChange={setNotificationsEnabled}
                />
              </View>
            </Card>
          </View>

          {/* Data & Privacy */}
          <View>
            <Text className="mb-2 px-1 text-xs uppercase tracking-wide text-muted-foreground">Data & Privacy</Text>
            <Card
  padding="none"
  className="bg-[#F2F6F5]"
  style={{ shadowOpacity: 0, elevation: 0 }}
>
              <TouchableOpacity activeOpacity={0.6} className="w-full flex flex-row items-center gap-3 p-4" onPress={() => onNavigate('privacy-policy')}>
                <Shield size={20} color="#3F7C4C" strokeWidth={2} />
                <Text className="flex-1 text-left">Privacy Policy</Text>
              </TouchableOpacity>
              <View className="border-t border-border" />
              <TouchableOpacity
                activeOpacity={0.6}
                className="w-full flex flex-row items-center gap-3 p-4"
                onPress={handleDeleteAccount}
              >
                <Shield size={20} color="#B55C4C" strokeWidth={2} />
                <Text className="flex-1 text-left text-destructive">Delete Account</Text>
              </TouchableOpacity>
            </Card>
          </View>

          {/* Help & FAQ */}
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => setChatbotVisible(true)}
            className="w-full flex flex-row items-center gap-3 p-4 bg-[#F2F6F5] rounded-2xl border border-primary/10"
          >
            <MessageCircle size={20} color="#3F7C4C" strokeWidth={2} />
            <View className="flex-1">
              <Text className="font-medium text-sm">Help & FAQ</Text>
              <Text className="text-xs text-muted-foreground">Get answers to common questions</Text>
            </View>
            <Text className="text-primary text-sm">Chat →</Text>
          </TouchableOpacity>

          {/* About */}
          <Card className="bg-[#F2F6F5]" style={{ shadowOpacity: 0, elevation: 0 }}>
            <View className="flex flex-row items-center gap-3 mb-2">
              <Info size={20} color="#3F7C4C" strokeWidth={2} />
              <Text className="font-medium">About Jiva Plants</Text>
            </View>
            <View className="space-y-1">
              <TouchableOpacity activeOpacity={0.6}>
                <Text className="text-sm text-primary">Open Source Licenses</Text>
              </TouchableOpacity>
              <TouchableOpacity activeOpacity={0.6}>
                <Text className="text-sm text-primary">Model & Dataset References</Text>
              </TouchableOpacity>
            </View>
          </Card>
        </View>
      </ScrollView>

      {/* Floating chatbot button — bottom-right */}
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={() => setChatbotVisible(true)}
        style={{
          position: 'absolute',
          bottom: 90,
          right: 20,
          width: 56,
          height: 56,
          borderRadius: 28,
          backgroundColor: '#3F7C4C',
          alignItems: 'center',
          justifyContent: 'center',
          elevation: 6,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 3 },
          shadowOpacity: 0.2,
          shadowRadius: 4,
        }}
      >
        <MessageCircle size={26} color="#fff" />
      </TouchableOpacity>

      <ChatbotModal visible={chatbotVisible} onClose={() => setChatbotVisible(false)} />

      {/* Footer */}
      <View className="py-4 px-6 border-t border-border gap-1">
        <Text className="text-[11px] text-muted-foreground text-center">
          Version 1.0.0
        </Text>
        <Text className="text-[11px] text-muted-foreground text-center">
          © 2026 JivaPlants. All rights reserved.
        </Text>
        <Text className="text-[11px] text-muted-foreground text-center">
          JivaPlants is developed by Mahesh Athalye.
        </Text>
        <Text className="text-[11px] text-muted-foreground text-center">
          Marketing and brand operations are managed by StoriesForMemories LLC.
        </Text>
      </View>
    </View>
  );
}