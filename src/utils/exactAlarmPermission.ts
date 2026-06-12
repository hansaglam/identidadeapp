/**
 * Android 12+ (API 31) SCHEDULE_EXACT_ALARM izni — ayarlar yönlendirmesi ve modal durumu.
 */
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AppState, Linking, Platform } from "react-native";

import { ANDROID_PACKAGE } from "../constants/brand";

const EXACT_ALARM_STATUS_KEY = "notifications:exact_alarm:status:v1";
const EXACT_ALARM_MODAL_DISMISSED_KEY = "notifications:exact_alarm:modal_dismissed:v1";

export type ExactAlarmStatus = "granted" | "denied" | "unknown";

type ModalListener = (visible: boolean) => void;
const modalListeners = new Set<ModalListener>();

export function subscribeExactAlarmModal(listener: ModalListener): () => void {
  modalListeners.add(listener);
  return () => modalListeners.delete(listener);
}

function emitModal(visible: boolean): void {
  modalListeners.forEach((l) => l(visible));
}

export function showExactAlarmPermissionModal(): void {
  emitModal(true);
}

export function hideExactAlarmPermissionModal(): void {
  emitModal(false);
}

export async function isExactAlarmModalDismissed(): Promise<boolean> {
  try {
    const v = await AsyncStorage.getItem(EXACT_ALARM_MODAL_DISMISSED_KEY);
    return v === "1";
  } catch {
    return false;
  }
}

export async function setExactAlarmModalDismissed(dismissed: boolean): Promise<void> {
  try {
    if (dismissed) {
      await AsyncStorage.setItem(EXACT_ALARM_MODAL_DISMISSED_KEY, "1");
    } else {
      await AsyncStorage.removeItem(EXACT_ALARM_MODAL_DISMISSED_KEY);
    }
  } catch {
    /* ignore */
  }
}

export async function getCachedExactAlarmStatus(): Promise<ExactAlarmStatus> {
  try {
    const v = await AsyncStorage.getItem(EXACT_ALARM_STATUS_KEY);
    if (v === "granted" || v === "denied") return v;
  } catch {
    /* ignore */
  }
  return "unknown";
}

export async function setCachedExactAlarmStatus(status: ExactAlarmStatus): Promise<void> {
  try {
    await AsyncStorage.setItem(EXACT_ALARM_STATUS_KEY, status);
  } catch {
    /* ignore */
  }
}

/** API 31 altında izin otomatik; iOS'ta her zaman tam zamanlama kullanılabilir. */
export function needsExactAlarmPermissionCheck(): boolean {
  if (Platform.OS !== "android") return false;
  const api = Platform.Version;
  return typeof api === "number" && api >= 31;
}

export async function openExactAlarmSettings(): Promise<void> {
  if (Platform.OS !== "android") {
    await Linking.openSettings();
    return;
  }
  try {
    await Linking.sendIntent("android.settings.REQUEST_SCHEDULE_EXACT_ALARM", [
      {
        key: "android.provider.extra.APP_PACKAGE",
        value: ANDROID_PACKAGE,
      },
    ]);
    return;
  } catch {
    /* fall through */
  }
  try {
    await Linking.openSettings();
  } catch {
    /* ignore */
  }
}

/**
 * Tam alarm izni gerekiyorsa ve durum bilinmiyorsa modal gösterir (bir kez).
 */
export async function promptExactAlarmIfNeeded(): Promise<ExactAlarmStatus> {
  if (!needsExactAlarmPermissionCheck()) {
    return "granted";
  }

  const cached = await getCachedExactAlarmStatus();
  if (cached === "granted") return "granted";

  const dismissed = await isExactAlarmModalDismissed();
  if (!dismissed) {
    showExactAlarmPermissionModal();
  }

  return cached === "denied" ? "denied" : "unknown";
}

/** Ayarlardan dönünce AppState ile yeniden değerlendirme için dinleyici. */
export function registerExactAlarmAppStateRefresh(
  onRefresh: () => void | Promise<void>
): () => void {
  const sub = AppState.addEventListener("change", (state) => {
    if (state === "active") {
      void onRefresh();
    }
  });
  return () => sub.remove();
}
