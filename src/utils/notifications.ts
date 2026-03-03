// expo-notifications requires a native development build (not Expo Go).
// We lazy-require it inside each function so the app doesn't crash on import
// when the native module is unavailable.

import AsyncStorage from '@react-native-async-storage/async-storage';
import tipsData from '../data/searchable_plant_care_tips.json';

const WEEKLY_TIPS_KEY = 'jiva_weekly_tips_enabled';
const WEEKLY_TIP_NOTIF_ID_KEY = 'jiva_weekly_tip_notif_id';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getNativeNotifications(): any {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    return require('expo-notifications');
  } catch {
    return null;
  }
}

export function setupNotificationHandler(): void {
  const Notifications = getNativeNotifications();
  if (!Notifications) return;
  try {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldShowBanner: true,
        shouldShowList: true,
        shouldPlaySound: false,
        shouldSetBadge: false,
      }),
    });
  } catch {
    // silently skip
  }
}

export async function requestNotificationPermissions(): Promise<boolean> {
  const Notifications = getNativeNotifications();
  if (!Notifications) return false;
  try {
    const { status: existing } = await Notifications.getPermissionsAsync();
    if (existing === 'granted') return true;
    const { status } = await Notifications.requestPermissionsAsync();
    return status === 'granted';
  } catch {
    return false;
  }
}

function randomTipBody(): string {
  const tips = tipsData.tips as { id: string; title: string; body: string }[];
  const tip = tips[Math.floor(Math.random() * tips.length)];
  return tip.body;
}

export async function scheduleWeeklyTip(): Promise<void> {
  const Notifications = getNativeNotifications();
  if (!Notifications) return;
  try {
    await cancelWeeklyTip();

    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: '🌿 Weekly Plant Care Tip',
        body: randomTipBody(),
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
        weekday: 1, // 1 = Sunday
        hour: 10,
        minute: 0,
      },
    });

    await AsyncStorage.setItem(WEEKLY_TIP_NOTIF_ID_KEY, id);
  } catch {
    // silently skip
  }
}

export async function cancelWeeklyTip(): Promise<void> {
  const Notifications = getNativeNotifications();
  if (!Notifications) return;
  try {
    const id = await AsyncStorage.getItem(WEEKLY_TIP_NOTIF_ID_KEY);
    if (id) {
      await Notifications.cancelScheduledNotificationAsync(id);
      await AsyncStorage.removeItem(WEEKLY_TIP_NOTIF_ID_KEY);
    }
  } catch {
    // silently skip
  }
}

export async function getWeeklyTipsEnabled(): Promise<boolean> {
  try {
    const val = await AsyncStorage.getItem(WEEKLY_TIPS_KEY);
    return val === null ? true : val === 'true';
  } catch {
    return true;
  }
}

export async function setWeeklyTipsEnabled(enabled: boolean): Promise<void> {
  try {
    await AsyncStorage.setItem(WEEKLY_TIPS_KEY, String(enabled));
  } catch {
    // silently skip
  }
}
