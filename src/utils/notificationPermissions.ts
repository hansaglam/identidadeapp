import { Platform } from "react-native";
import * as Notifications from "expo-notifications";

const DEFAULT_CHANNEL_ID = "rito-reminders";

export async function ensureAndroidNotificationChannel(): Promise<void> {
  if (Platform.OS !== "android") return;
  await Notifications.setNotificationChannelAsync(DEFAULT_CHANNEL_ID, {
    name: "Hatırlatmalar",
    importance: Notifications.AndroidImportance.HIGH,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: "#2F9C86",
  });
}

export async function requestNotificationPermissions(): Promise<boolean> {
  await ensureAndroidNotificationChannel();
  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === "granted") return true;
  const { status } = await Notifications.requestPermissionsAsync({
    ios: {
      allowAlert: true,
      allowBadge: false,
      allowSound: true,
    },
  });
  return status === "granted";
}

export function getDefaultNotificationChannelId(): string | undefined {
  return Platform.OS === "android" ? DEFAULT_CHANNEL_ID : undefined;
}
