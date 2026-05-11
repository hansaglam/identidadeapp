import { create } from "zustand";
import { differenceInDays, parseISO } from "date-fns";
import { getISOWeek, getISOWeekYear } from "date-fns";
import * as SecureStore from "expo-secure-store";
import { UserProfile, CompletedHabit } from "../types";
import type { DisciplineMuscles } from "../types/discipline";
import { loadProfile, saveProfile, clearAllData } from "../utils/storage";
import { uuid } from "../utils/uuid";
import { normalizeProfile } from "../utils/profileDefaults";
import { randomJourneyTreeType } from "../utils/journeyTree";
import {
  addXpToDisciplineState,
  DISCIPLINE_DEFAULT_LEVELS,
  DISCIPLINE_DEFAULT_XP,
} from "../utils/disciplineProgress";

const DEFAULT_NOTIF_HOUR = 9;
const DEFAULT_NOTIF_MINUTE = 0;

interface UserState {
  profile: UserProfile | null;
  isLoading: boolean;
  /** Profil AsyncStorage’dan okunamadığında true (yeniden deneme için). */
  profileLoadFailed: boolean;
  loadProfile: (opts?: { quiet?: boolean }) => Promise<void>;
  completeOnboarding: (data: {
    habitName: string;
    habitAnchor: string;
    habitWhy: string;
    identityTagId: string | null;
  }) => Promise<void>;
  setName: (name: string) => Promise<void>;
  setPremium: (isPremium: boolean, purchaseToken?: string) => Promise<void>;
  setNotificationTime: (hour: number, minute: number) => Promise<void>;
  setHapticsEnabled: (enabled: boolean) => Promise<void>;
  markPremiumGateShown: (gate: "day7" | "day22") => Promise<void>;
  updateProfile: (patch: Partial<UserProfile>) => Promise<void>;
  /** Mini görev / canlı aksiyon sonrası disiplin kası XP (kalıcı) */
  addDisciplineMuscleXp: (muscle: keyof DisciplineMuscles, amount: number) => Promise<void>;
  clearData: () => Promise<void>;
  /** Returns how many days into the 66-day journey (1-based, min 1) */
  dayNumber: () => number;
  /** 66. gün sonrası: arşive ekleyip yeni tur (check-in temizliği ayrı yapılmalı) */
  stackNewJourney: (args: {
    snapshotAvgAuto: number | null;
    snapshotCompletedDays: number;
    nextHabitName: string;
    nextHabitAnchor: string;
  }) => Promise<void>;
  /** Returns ISO week number for SDT keying */
  currentWeek: () => string; // "YYYY-Www"
}

async function persist(profile: UserProfile): Promise<void> {
  await saveProfile(profile);
}

export const useUserStore = create<UserState>((set, get) => ({
  profile: null,
  isLoading: true,
  profileLoadFailed: false,

  loadProfile: async (opts) => {
    const quiet = opts?.quiet === true;
    if (!quiet) {
      set({ isLoading: true, profileLoadFailed: false });
    }
    try {
      const raw = await loadProfile();
      const profile = raw ? normalizeProfile(raw) : null;
      if (quiet) {
        set({ profile, profileLoadFailed: false });
      } else {
        set({ profile, isLoading: false, profileLoadFailed: false });
      }
    } catch {
      if (quiet) {
        set({ profileLoadFailed: true });
      } else {
        set({ profile: null, isLoading: false, profileLoadFailed: true });
      }
      if (__DEV__) console.warn("[userStore] loadProfile failed");
    }
  },

  completeOnboarding: async ({
    habitName,
    habitAnchor,
    habitWhy,
    identityTagId,
  }) => {
    const id = uuid();
    const now = new Date().toISOString();
    const profile: UserProfile = {
      id,
      createdAt: now,
      identityTagId,
      habitName,
      habitAnchor,
      habitWhy,
      journeyTreeType: randomJourneyTreeType(),
      startDate: now,          // day-1 = today
      isPremium: false,
      purchaseToken: null,
      name: "",
      notificationHour: DEFAULT_NOTIF_HOUR,
      notificationMinute: DEFAULT_NOTIF_MINUTE,
      hapticsEnabled: true,
      premiumGateDay7Shown: false,
      premiumGateDay22Shown: false,
      contextPreset: null,
      restModeUntilISO: null,
      notifyMorningEnabled: true,
      notifyEveningEnabled: true,
      notifyWeekendEnabled: true,
      notifyPhaseMilestones: true,
      firstWeekGuideDismissed: false,
      hasOpenedJourneyTab: false,
    };
    const normalized = normalizeProfile(profile);
    try {
      await persist(normalized);
      await SecureStore.setItemAsync("user_id", id);
    } catch (e) {
      if (__DEV__) console.warn("[userStore] completeOnboarding persist failed", e);
      throw e;
    }
    set({ profile: normalized });
  },

  setName: async (name) => {
    const { profile } = get();
    if (!profile) return;
    const updated = normalizeProfile({ ...profile, name });
    await persist(updated);
    set({ profile: updated });
  },

  setPremium: async (isPremium, purchaseToken) => {
    const { profile } = get();
    if (!profile) return;
    const updated = normalizeProfile({
      ...profile,
      isPremium,
      purchaseToken: isPremium
        ? (purchaseToken ?? profile.purchaseToken)
        : null,
    });
    await persist(updated);
    set({ profile: updated });
  },

  setNotificationTime: async (notificationHour, notificationMinute) => {
    const { profile } = get();
    if (!profile) return;
    const updated = normalizeProfile({
      ...profile,
      notificationHour,
      notificationMinute,
    });
    await persist(updated);
    set({ profile: updated });
  },

  setHapticsEnabled: async (hapticsEnabled) => {
    const { profile } = get();
    if (!profile) return;
    const updated = normalizeProfile({ ...profile, hapticsEnabled });
    await persist(updated);
    set({ profile: updated });
  },

  markPremiumGateShown: async (gate) => {
    const { profile } = get();
    if (!profile) return;
    const updated = normalizeProfile({
      ...profile,
      ...(gate === "day7" ? { premiumGateDay7Shown: true } : {}),
      ...(gate === "day22" ? { premiumGateDay22Shown: true } : {}),
    });
    await persist(updated);
    set({ profile: updated });
  },

  updateProfile: async (patch) => {
    const { profile } = get();
    if (!profile) return;
    const updated = normalizeProfile({ ...profile, ...patch });
    await persist(updated);
    set({ profile: updated });
  },

  addDisciplineMuscleXp: async (muscle, amount) => {
    const { profile } = get();
    if (!profile || amount <= 0) return;
    const baseLevels = {
      ...DISCIPLINE_DEFAULT_LEVELS,
      ...profile.disciplineMuscles,
    };
    const baseXp = {
      ...DISCIPLINE_DEFAULT_XP,
      ...profile.disciplineMuscleXp,
    };
    const { levels, xp } = addXpToDisciplineState(baseLevels, baseXp, muscle, amount);
    const updated: UserProfile = {
      ...profile,
      disciplineMuscles: levels,
      disciplineMuscleXp: xp,
    };
    await persist(updated);
    set({ profile: normalizeProfile(updated) });
  },

  stackNewJourney: async ({
    snapshotAvgAuto,
    snapshotCompletedDays,
    nextHabitName,
    nextHabitAnchor,
  }) => {
    const { profile } = get();
    if (!profile) return;
    const now = new Date().toISOString();
    const entry: CompletedHabit = {
      habitName: profile.habitName,
      habitAnchor: profile.habitAnchor,
      journeyStartDate: profile.startDate,
      completedAt: now,
      avgAutomaticity: snapshotAvgAuto,
      completedDaysCount: snapshotCompletedDays,
    };
    const updated = normalizeProfile({
      ...profile,
      habitName: nextHabitName.trim() || profile.habitName,
      habitAnchor: nextHabitAnchor.trim() || profile.habitAnchor,
      journeyTreeType: randomJourneyTreeType(),
      startDate: now,
      completedHabits: [...(profile.completedHabits ?? []), entry],
      journeySequence: (profile.journeySequence ?? 0) + 1,
      stackingOfferPending: false,
    });
    await persist(updated);
    set({ profile: updated });
  },

  clearData: async () => {
    await clearAllData();
    set({ profile: null });
  },

  dayNumber: () => {
    const { profile } = get();
    if (!profile?.startDate) return 1;
    const diff = differenceInDays(new Date(), parseISO(profile.startDate));
    return Math.max(1, diff + 1);
  },

  currentWeek: () => {
    const now = new Date();
    const week = getISOWeek(now);
    const year = getISOWeekYear(now);
    return `${year}-W${String(week).padStart(2, "0")}`;
  },
}));
