/**
 * Pure AsyncStorage key-value helpers.
 * All app data lives here — no SQLite.
 *
 * Key schema:
 *   user:profile           → UserProfile
 *   checkins:YYYY-MM-DD    → CheckinRecord
 *   minddump:{timestamp}   → MindDumpEntry (timestamp = Date.now() at creation)
 *   sdt:YYYY-Www           → SDTScore
 */
import AsyncStorage from "@react-native-async-storage/async-storage";
import { UserProfile, CheckinRecord, MindDumpEntry, SDTScore } from "../types";

// ─── Keys ──────────────────────────────────────────────────────────────────

const PROFILE_KEY = "user:profile";
const checkinKey = (date: string) => `checkins:${date}`;
const mindDumpKey = (ts: number) => `minddump:${ts}`;
const sdtKey = (week: string) => `sdt:${week}`;

// ─── Generic helpers ───────────────────────────────────────────────────────

async function get<T>(key: string): Promise<T | null> {
  const raw = await AsyncStorage.getItem(key);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    if (__DEV__) console.warn(`[storage] JSON parse failed for key: ${key}`);
    return null;
  }
}

async function set<T>(key: string, value: T): Promise<void> {
  await AsyncStorage.setItem(key, JSON.stringify(value));
}

async function remove(key: string): Promise<void> {
  await AsyncStorage.removeItem(key);
}

async function getByPrefix<T>(prefix: string): Promise<T[]> {
  const allKeys = await AsyncStorage.getAllKeys();
  const matched = allKeys.filter((k) => k.startsWith(prefix));
  if (!matched.length) return [];
  const values = await Promise.all(matched.map((k) => AsyncStorage.getItem(k)));
  return values
    .map((v, i) => {
      try {
        return v ? (JSON.parse(v) as T) : null;
      } catch {
        if (__DEV__) console.warn(`[storage] getByPrefix parse failed index ${i}`);
        return null;
      }
    })
    .filter((v): v is T => v !== null);
}

async function removeByPrefix(prefix: string): Promise<void> {
  const allKeys = await AsyncStorage.getAllKeys();
  const matched = allKeys.filter((k) => k.startsWith(prefix));
  await Promise.all(matched.map((k) => AsyncStorage.removeItem(k)));
}

// ─── User profile ──────────────────────────────────────────────────────────

export async function loadProfile(): Promise<UserProfile | null> {
  return get<UserProfile>(PROFILE_KEY);
}

export async function saveProfile(profile: UserProfile): Promise<void> {
  await set(PROFILE_KEY, profile);
}

export async function clearProfile(): Promise<void> {
  await remove(PROFILE_KEY);
}

// ─── Check-ins ─────────────────────────────────────────────────────────────

export async function loadCheckin(date: string): Promise<CheckinRecord | null> {
  return get<CheckinRecord>(checkinKey(date));
}

export async function saveCheckin(record: CheckinRecord): Promise<void> {
  await set(checkinKey(record.date), record);
}

export async function loadAllCheckins(): Promise<CheckinRecord[]> {
  return getByPrefix<CheckinRecord>("checkins:");
}

/** Yeni 66 günlük tur için tüm check-in kayıtlarını siler (profil ayrı güncellenmeli). */
export async function removeAllCheckins(): Promise<void> {
  await removeByPrefix("checkins:");
}

// ─── Mind dump ─────────────────────────────────────────────────────────────

export async function loadAllMindDumps(): Promise<MindDumpEntry[]> {
  const entries = await getByPrefix<MindDumpEntry>("minddump:");
  // Newest first (id = timestamp)
  return entries.sort((a, b) => Number(b.id) - Number(a.id));
}

export async function saveMindDump(entry: MindDumpEntry): Promise<void> {
  await set(mindDumpKey(Number(entry.id)), entry);
}

export async function updateMindDump(entry: MindDumpEntry): Promise<void> {
  await set(mindDumpKey(Number(entry.id)), entry);
}

export async function deleteMindDump(id: string): Promise<void> {
  await remove(mindDumpKey(Number(id)));
}

// ─── SDT scores ────────────────────────────────────────────────────────────

export async function loadSDTScore(week: string): Promise<SDTScore | null> {
  return get<SDTScore>(sdtKey(week));
}

export async function saveSDTScore(score: SDTScore): Promise<void> {
  await set(sdtKey(score.week), score);
}

export async function loadAllSDTScores(): Promise<SDTScore[]> {
  const scores = await getByPrefix<SDTScore>("sdt:");
  return scores.sort((a, b) => b.week.localeCompare(a.week));
}

// ─── Full data wipe ────────────────────────────────────────────────────────

export async function clearAllData(): Promise<void> {
  const { clearProactiveInterventionStorage } = await import(
    "./interventionStorage"
  );
  const { clearJourneyEducationPrefs } = await import("./journeyEducationPrefs");
  await Promise.all([
    clearProfile(),
    clearProactiveInterventionStorage(),
    removeByPrefix("checkins:"),
    removeByPrefix("minddump:"),
    removeByPrefix("sdt:"),
    clearJourneyEducationPrefs(),
  ]);
}
