import { Platform } from "react-native";
import * as Notifications from "expo-notifications";
import i18n from "../i18n/config";
import { showNotificationPermissionRationale } from "./notificationPermissionPrompt";

const DEFAULT_CHANNEL_ID = "rito-reminders";

function channelLabel(key: "name" | "description"): string {
  const k = `notifications.channel.${key}`;
  const v = i18n.t(k);
  return v === k ? (key === "name" ? "Reminders" : "Habit and check-in reminders") : v;
}

export async function ensureAndroidNotificationChannel(): Promise<void> {
  if (Platform.OS !== "android") return;
  await Notifications.setNotificationChannelAsync(DEFAULT_CHANNEL_ID, {
    name: channelLabel("name"),
    description: channelLabel("description"),
    importance: Notifications.AndroidImportance.HIGH,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: "#2F9C86",
  });
}

export async function hasNotificationPermissions(): Promise<boolean> {
  const { status } = await Notifications.getPermissionsAsync();
  return status === "granted";
}

/** OS permission dialog only — call after in-app rationale or when already explained. */
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

/** User tapped enable — show rationale first, then OS dialog if they accept. */
export async function requestNotificationPermissionsFromUser(): Promise<boolean> {
  await ensureAndroidNotificationChannel();
  if (await hasNotificationPermissions()) return true;

  const choice = await showNotificationPermissionRationale();
  if (choice === "deny") return false;

  return requestNotificationPermissions();
}

export function getDefaultNotificationChannelId(): string | undefined {
  return Platform.OS === "android" ? DEFAULT_CHANNEL_ID : undefined;
}
