import AsyncStorage from "@react-native-async-storage/async-storage";
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";

import type { CheckinRecord, MindDumpEntry, SDTScore, UserProfile } from "../types";
import type { TomorrowTodoList } from "../store/tomorrowPlanStore";
import type { DailyPersistBlob, Habit, JourneyReflection } from "../store/habitStore";
import type { Muscles, RecentAction } from "../engine";
import i18n from "../i18n/config";

export const BACKUP_STORAGE_KEYS = {
  tomorrowPlans: "journey:tomorrow-plans:v1",
  habitDaily: "habit:daily:v1",
  habitDefinition: "habit:definition:v1",
  habitReflections: "habit:reflections:v1",
  behaviorState: "behavior:state:v1",
} as const;

export interface BehaviorBackupState {
  muscles: Muscles;
  recentActions: RecentAction[];
  lastActionAt: string | null;
  totalActions: number;
}

export interface ExportPayloadV1 {
  exportedAt: string;
  schemaVersion: 1;
  profile: UserProfile;
  checkins: CheckinRecord[];
  mindDumps: MindDumpEntry[];
}

export interface ExportPayloadV2 {
  exportedAt: string;
  schemaVersion: 2;
  profile: UserProfile;
  checkins: CheckinRecord[];
  mindDumps: MindDumpEntry[];
  tomorrowPlans: Record<string, TomorrowTodoList>;
  habitDaily: DailyPersistBlob;
  habitDefinition: Habit | null;
  habitReflections: JourneyReflection[];
  sdtScores: SDTScore[];
  behaviorState: BehaviorBackupState;
}

export type ExportPayload = ExportPayloadV1 | ExportPayloadV2;

export function isExportPayloadV2(p: ExportPayload): p is ExportPayloadV2 {
  return p.schemaVersion === 2;
}

export async function shareAppDataBackup(payload: ExportPayload): Promise<void> {
  const json = JSON.stringify(payload, null, 2);
  const versionTag = payload.schemaVersion === 2 ? "v2" : "v1";
  const name = `rito-yedek-${versionTag}-${payload.exportedAt.slice(0, 10)}.json`;
  const base = FileSystem.cacheDirectory ?? "";
  const path = `${base}${name}`;
  await FileSystem.writeAsStringAsync(path, json, {
    encoding: FileSystem.EncodingType.UTF8,
  });

  const canShare = await Sharing.isAvailableAsync();
  if (!canShare) {
    throw new Error("Paylaşım bu cihazda kullanılamıyor.");
  }
  await Sharing.shareAsync(path, {
    mimeType: "application/json",
    dialogTitle: i18n.t("profile.data.backupShareTitle"),
  });
}

export async function persistV2ExtraStorage(payload: ExportPayloadV2): Promise<void> {
  await AsyncStorage.setItem(
    BACKUP_STORAGE_KEYS.tomorrowPlans,
    JSON.stringify(payload.tomorrowPlans)
  );
  await AsyncStorage.setItem(
    BACKUP_STORAGE_KEYS.habitDaily,
    JSON.stringify(payload.habitDaily)
  );
  if (payload.habitDefinition) {
    await AsyncStorage.setItem(
      BACKUP_STORAGE_KEYS.habitDefinition,
      JSON.stringify(payload.habitDefinition)
    );
  } else {
    await AsyncStorage.removeItem(BACKUP_STORAGE_KEYS.habitDefinition);
  }
  await AsyncStorage.setItem(
    BACKUP_STORAGE_KEYS.habitReflections,
    JSON.stringify(payload.habitReflections)
  );
  await Promise.all(
    payload.sdtScores.map(async (score) => {
      await AsyncStorage.setItem(`sdt:${score.week}`, JSON.stringify(score));
    })
  );
  await AsyncStorage.setItem(
    BACKUP_STORAGE_KEYS.behaviorState,
    JSON.stringify(payload.behaviorState)
  );
}
