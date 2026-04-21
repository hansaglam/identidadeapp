import { NavigatorScreenParams } from "@react-navigation/native";
import type { DisciplineMuscles } from "./discipline";

export type { DisciplineMuscles } from "./discipline";
export { MUSCLE_NAMES } from "./discipline";

/** XP 0+; aynı anahtarlar */
export type DisciplineMuscleXP = DisciplineMuscles;

// ─── AsyncStorage data types ───────────────────────────────────────────────

/** key: 'user:profile' */
export interface UserProfile {
  id: string;
  createdAt: string;          // ISO – account creation
  habitName: string;          // "Egzersiz"
  habitAnchor: string;        // "Kahvemi aldıktan sonra"
  habitWhy: string;           // onboarding free text
  startDate: string;          // ISO – 66-day countdown starts here
  isPremium: boolean;
  purchaseToken: string | null;
  // UI prefs (persisted alongside profile for simplicity)
  name: string;               // optional display name
  notificationHour: number;   // default 9
  notificationMinute: number; // default 0
  hapticsEnabled: boolean;
  premiumGateDay7Shown: boolean;
  premiumGateDay22Shown: boolean;
  /** 5 disiplin kası seviyesi (1+); yoksa UI varsayılan 1 */
  disciplineMuscles?: DisciplineMuscles;
  /** Kas başına toplam XP; yoksa 0 kabul */
  disciplineMuscleXp?: DisciplineMuscleXP;
}

/** key: 'checkins:YYYY-MM-DD' */
export interface CheckinRecord {
  date: string;               // YYYY-MM-DD
  completed: boolean;
  completedAt: string | null; // ISO
  day: number;                // which of the 66 days
  /** Tamamlanma değerlendirmesi: 1–10 (yoksa kayıt öncesi / geri alındı) */
  automaticityRating?: number;
  effortRating?: number;
}

/** Bugünkü ekran durumu (UI; kalıcılık CheckinRecord üzerinden) */
export interface DailyLog {
  dayNumber: number;
  automaticityRating: number;
  effortRating: number;
  completed: boolean;
}

/** key: 'minddump:{timestamp}' where timestamp = Date.now() at creation */
export interface MindDumpEntry {
  id: string;                 // same as the timestamp part
  content: string;
  createdAt: string;          // ISO
  updatedAt: string;          // ISO
}

/** key: 'sdt:YYYY-Www' (ISO week, e.g. 'sdt:2024-W03') */
export interface SDTScore {
  week: string;               // 'YYYY-Www'
  autonomy: number;           // 1–5
  competence: number;         // 1–5
  relatedness: number;        // 1–5
  answeredAt: string;         // ISO
}

// ─── Navigation ───────────────────────────────────────────────────────────

export type AuthStackParamList = {
  Welcome: undefined;
  OnboardingStep1: undefined;
  OnboardingStep2: { habitName: string };
  OnboardingStep3: { habitName: string; anchorBehavior: string; anchorTime: string };
};

export type MainTabParamList = {
  Home: undefined;
  MindDump: undefined;
  Journey: undefined;
  Profile: undefined;
};

export type RootStackParamList = {
  Auth: NavigatorScreenParams<AuthStackParamList>;
  Main: NavigatorScreenParams<MainTabParamList>;
};
