// Storage utility for managing authentication tokens
// Uses AsyncStorage for React Native
import AsyncStorage from '@react-native-async-storage/async-storage';

const TOKEN_KEY = 'jiva_auth_token';
const USER_KEY = 'jiva_user_data';

// User type options
export type UserType = 'Home gardener' | 'Nursery' | 'Farmer' | 'Other';

// Plant type options
export type PlantType = 'Houseplants' | 'Vegetables' | 'Fruits' | 'Flowers' | 'Trees/Shrubs' | 'Other';

// User data interface
export interface UserData {
  name: string;
  email: string;
  country?: string;
  userType?: UserType | null;
  plantTypes?: PlantType[];
  onboardingSkipped?: boolean;
}

export const storage = {
  // Token management
  async setToken(token: string): Promise<void> {
    try {
      await AsyncStorage.setItem(TOKEN_KEY, token);
    } catch (error) {
      console.error('Error saving token:', error);
    }
  },

  async getToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(TOKEN_KEY);
    } catch (error) {
      console.error('Error getting token:', error);
      return null;
    }
  },

  async removeToken(): Promise<void> {
    try {
      await AsyncStorage.removeItem(TOKEN_KEY);
    } catch (error) {
      console.error('Error removing token:', error);
    }
  },

  // User data management
  async setUserData(userData: Partial<UserData>): Promise<void> {
    try {
      // Merge with existing data, but don't overwrite with null/undefined values
      const existingData = await this.getUserData();
      console.log('[Storage] setUserData - existing data:', existingData);
      console.log('[Storage] setUserData - new data to merge:', userData);

      // Filter out null/undefined values from new data to preserve existing preferences
      const filteredUserData: Partial<UserData> = {};
      for (const [key, value] of Object.entries(userData)) {
        if (value !== null && value !== undefined) {
          (filteredUserData as any)[key] = value;
        }
      }
      console.log('[Storage] setUserData - filtered data (nulls removed):', filteredUserData);

      const mergedData = existingData
        ? { ...existingData, ...filteredUserData }
        : { ...filteredUserData };
      console.log('[Storage] setUserData - merged result:', mergedData);
      await AsyncStorage.setItem(USER_KEY, JSON.stringify(mergedData));
      console.log('[Storage] setUserData - successfully saved to AsyncStorage');
    } catch (error) {
      console.error('Error saving user data:', error);
    }
  },

  async getUserData(): Promise<UserData | null> {
    try {
      const data = await AsyncStorage.getItem(USER_KEY);
      const parsed = data ? JSON.parse(data) : null;
      console.log('[Storage] Getting user data - raw:', data);
      console.log('[Storage] Getting user data - parsed:', parsed);
      return parsed;
    } catch (error) {
      console.error('Error getting user data:', error);
      return null;
    }
  },

  async removeUserData(): Promise<void> {
    try {
      await AsyncStorage.removeItem(USER_KEY);
    } catch (error) {
      console.error('Error removing user data:', error);
    }
  },

  // Onboarding data management
  async updateOnboardingData(userType: UserType | null, plantTypes: PlantType[]): Promise<void> {
    try {
      const userData = await this.getUserData();
      console.log('[Storage] Updating onboarding data, existing userData:', userData);
      // Preserve name, email, and country when updating onboarding data
      await this.setUserData({
        ...userData,
        userType,
        plantTypes,
        onboardingSkipped: false
        // name, email, country are preserved via spread operator
      });
      console.log('[Storage] Onboarding data updated, new userData:', await this.getUserData());
    } catch (error) {
      console.error('Error updating onboarding data:', error);
    }
  },

  async hasCompletedOnboarding(): Promise<boolean> {
    try {
      const userData = await this.getUserData();
      return !!(userData?.userType || userData?.plantTypes?.length) || userData?.onboardingSkipped === true;
    } catch (error) {
      console.error('Error checking onboarding status:', error);
      return false;
    }
  },

  // Clear auth token only - preserve user data and preferences
  async clearAll(): Promise<void> {
    await this.removeToken();
    // Don't remove user data to preserve preferences across logout/login
    // await this.removeUserData();
  },

  // Check if user is authenticated
  async isAuthenticated(): Promise<boolean> {
    const token = await this.getToken();
    return !!token;
  }
};
