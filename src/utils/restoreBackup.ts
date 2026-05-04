import * as SecureStore from "expo-secure-store";
import * as FileSystem from "expo-file-system/legacy";

import type { CheckinRecord, MindDumpEntry, UserProfile } from "../types";
import type { ExportPayload } from "./exportBackup";
import { clearAllData, saveProfile, saveCheckin, saveMindDump } from "./storage";
import { normalizeProfile } from "./profileDefaults";
import { useBehaviorStore } from "../store/useBehaviorStore";
import { useUserStore } from "../store/userStore";
import { useCheckinsStore } from "../store/checkinsStore";
import { useMindDumpStore } from "../store/mindDumpStore";
import { useSDTStore } from "../store/sdtStore";

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

/** JSON ağacından yedek şeması doğrulama — güvenilir olmayan dosyaya karşı temel kontrol. */
export function parseExportPayloadFromUnknown(parsed: unknown): ExportPayload | { error: string } {
  if (!isRecord(parsed)) return { error: "Dosya beklenen formatta değil." };
  if (parsed.schemaVersion !== 1) return { error: "Bu yedek sürümü desteklenmiyor." };
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
    schemaVersion: 1,
    profile: parsed.profile as unknown as UserProfile,
    checkins: parsed.checkins as CheckinRecord[],
    mindDumps: parsed.mindDumps as MindDumpEntry[],
  };
}

/** Yedekleri diske uygula; davranış sayaçlarını sıfırlar (yedek bu veriyi içermez). */
export async function applyExportPayload(payload: ExportPayload): Promise<void> {
  const profile = normalizeProfile(payload.profile);
  await clearAllData();
  try {
    await SecureStore.setItemAsync("user_id", profile.id);
  } catch {
    /* onboarding dışında kritik olmayabilir */
  }
  await saveProfile(profile);
  await Promise.all(payload.checkins.map((c) => saveCheckin(c)));
  await Promise.all(payload.mindDumps.map((m) => saveMindDump(m)));
  await useBehaviorStore.getState().reset();
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
  ]);
}
