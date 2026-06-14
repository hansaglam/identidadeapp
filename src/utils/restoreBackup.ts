import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";
import * as FileSystem from "expo-file-system/legacy";

import type { CheckinRecord, MindDumpEntry, SDTScore, UserProfile } from "../types";
import type { ExportPayload, ExportPayloadV2 } from "./exportBackup";
import {
  BACKUP_STORAGE_KEYS,
  persistV2ExtraStorage,
} from "./exportBackup";
import { clearAllData, saveProfile, saveCheckin, saveMindDump } from "./storage";
import { normalizeProfile } from "./profileDefaults";
import { useBehaviorStore } from "../store/useBehaviorStore";
import { useUserStore } from "../store/userStore";
import { useCheckinsStore } from "../store/checkinsStore";
import { useMindDumpStore } from "../store/mindDumpStore";
import { useSDTStore } from "../store/sdtStore";
import { useHabitStore } from "../store/habitStore";
import { useTomorrowPlanStore } from "../store/tomorrowPlanStore";
import { useIAPStore } from "../store/iapStore";

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

function roughCheckin(v: unknown): v is CheckinRecord {
  if (!isRecord(v)) return false;
  return (
    typeof v.date === "string" &&
    typeof v.completed === "boolean" &&
    (v.completedAt === null || typeof v.completedAt === "string") &&
    typeof v.day === "number"
  );
}

function roughMindDump(v: unknown): v is MindDumpEntry {
  if (!isRecord(v)) return false;
  return (
    typeof v.id === "string" &&
    typeof v.content === "string" &&
    typeof v.createdAt === "string" &&
    typeof v.updatedAt === "string"
  );
}

function roughSdtScore(v: unknown): v is SDTScore {
  if (!isRecord(v)) return false;
  return (
    typeof v.week === "string" &&
    typeof v.autonomy === "number" &&
    typeof v.competence === "number" &&
    typeof v.relatedness === "number" &&
    typeof v.answeredAt === "string"
  );
}

function parseBaseFields(parsed: Record<string, unknown>):
  | { error: string }
  | {
      exportedAt: string;
      profile: UserProfile;
      checkins: CheckinRecord[];
      mindDumps: MindDumpEntry[];
    } {
  if (typeof parsed.exportedAt !== "string") return { error: "Yedek tarihi eksik." };
  if (!isRecord(parsed.profile)) return { error: "Profil alanı eksik." };
  const id = parsed.profile.id;
  const startDate = parsed.profile.startDate;
  if (typeof id !== "string" || typeof startDate !== "string") {
    return { error: "Profil kimliği veya başlangıç tarihi eksik." };
  }
  if (!Array.isArray(parsed.checkins) || !Array.isArray(parsed.mindDumps)) {
    return { error: "Check-in veya zihin notu listesi eksik." };
  }
  const checkinsOk = parsed.checkins.every(roughCheckin);
  const dumpsOk = parsed.mindDumps.every(roughMindDump);
  if (!checkinsOk || !dumpsOk) {
    return { error: "Kayıtlar bozuk veya tanınmayan bir sürümde olabilir." };
  }
  return {
    exportedAt: parsed.exportedAt,
    profile: parsed.profile as unknown as UserProfile,
    checkins: parsed.checkins as CheckinRecord[],
    mindDumps: parsed.mindDumps as MindDumpEntry[],
  };
}

/** JSON ağacından yedek şeması doğrulama — v1 ve v2. */
export function parseExportPayloadFromUnknown(parsed: unknown): ExportPayload | { error: string } {
  if (!isRecord(parsed)) return { error: "Dosya beklenen formatta değil." };
  const version = parsed.schemaVersion;
  if (version !== 1 && version !== 2) {
    return { error: "Bu yedek sürümü desteklenmiyor." };
  }

  const base = parseBaseFields(parsed);
  if ("error" in base) return base;

  if (version === 1) {
    return {
      exportedAt: base.exportedAt,
      schemaVersion: 1,
      profile: base.profile,
      checkins: base.checkins,
      mindDumps: base.mindDumps,
    };
  }

  if (!isRecord(parsed.tomorrowPlans)) {
    return { error: "Yarın planları alanı eksik (v2)." };
  }
  if (!isRecord(parsed.habitDaily)) {
    return { error: "Günlük alışkanlık alanı eksik (v2)." };
  }
  if (!Array.isArray(parsed.sdtScores) || !parsed.sdtScores.every(roughSdtScore)) {
    return { error: "SDT skorları eksik veya bozuk (v2)." };
  }
  if (!isRecord(parsed.behaviorState)) {
    return { error: "Davranış durumu eksik (v2)." };
  }

  const habitReflections = Array.isArray(parsed.habitReflections)
    ? parsed.habitReflections
    : [];

  return {
    exportedAt: base.exportedAt,
    schemaVersion: 2,
    profile: base.profile,
    checkins: base.checkins,
    mindDumps: base.mindDumps,
    tomorrowPlans: parsed.tomorrowPlans as ExportPayloadV2["tomorrowPlans"],
    habitDaily: parsed.habitDaily as unknown as ExportPayloadV2["habitDaily"],
    habitDefinition: (parsed.habitDefinition ?? null) as ExportPayloadV2["habitDefinition"],
    habitReflections: habitReflections as ExportPayloadV2["habitReflections"],
    sdtScores: parsed.sdtScores as SDTScore[],
    behaviorState: parsed.behaviorState as unknown as ExportPayloadV2["behaviorState"],
  };
}

const SCREENSHOT_DEMO_PROFILE_PREFIX = "screenshot-demo-";

/** Mağaza screenshot yedeği — profile.id ile tanınır; premium korunur. */
export function isScreenshotDemoProfile(profileId: string): boolean {
  return profileId.startsWith(SCREENSHOT_DEMO_PROFILE_PREFIX);
}

async function clearV2StorageKeys(): Promise<void> {
  await Promise.all([
    AsyncStorage.removeItem(BACKUP_STORAGE_KEYS.tomorrowPlans),
    AsyncStorage.removeItem(BACKUP_STORAGE_KEYS.habitDaily),
    AsyncStorage.removeItem(BACKUP_STORAGE_KEYS.habitDefinition),
    AsyncStorage.removeItem(BACKUP_STORAGE_KEYS.habitReflections),
    AsyncStorage.removeItem(BACKUP_STORAGE_KEYS.behaviorState),
  ]);
}

/** Yedekleri diske uygula; v1 davranış sayaçlarını sıfırlar, v2 tam durumu yazar. */
export async function applyExportPayload(payload: ExportPayload): Promise<void> {
  const screenshotDemo = isScreenshotDemoProfile(payload.profile.id);
  const keepPremium = screenshotDemo && payload.profile.isPremium === true;
  const profile = normalizeProfile({
    ...payload.profile,
    isPremium: keepPremium,
    purchaseToken: keepPremium ? "screenshot-demo" : null,
  });
  await clearAllData();
  await clearV2StorageKeys();
  try {
    await SecureStore.setItemAsync("user_id", profile.id);
  } catch {
    /* onboarding dışında kritik olmayabilir */
  }
  await saveProfile(profile);
  await Promise.all(payload.checkins.map((c) => saveCheckin(c)));
  await Promise.all(payload.mindDumps.map((m) => saveMindDump(m)));

  if (payload.schemaVersion === 2) {
    await persistV2ExtraStorage(payload);
  } else {
    await useBehaviorStore.getState().reset();
  }
}

export async function readJsonUri(uri: string): Promise<unknown> {
  const raw = await FileSystem.readAsStringAsync(uri, {
    encoding: FileSystem.EncodingType.UTF8,
  });
  return JSON.parse(raw) as unknown;
}

/** Depolama + zustand önbelleği senkron. */
export async function reloadAllStoresAfterRestore(): Promise<void> {
  await useUserStore.getState().loadProfile({ quiet: true });
  await Promise.all([
    useCheckinsStore.getState().load(),
    useMindDumpStore.getState().load(),
    useSDTStore.getState().load(),
    useBehaviorStore.getState().load(),
    useHabitStore.getState().load(),
    useTomorrowPlanStore.getState().load(),
  ]);
  await useIAPStore.getState().syncSubscriptionStatus();
}
