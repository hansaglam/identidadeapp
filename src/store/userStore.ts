import { create } from "zustand";
import { differenceInDays, parseISO } from "date-fns";
import { getISOWeek, getISOWeekYear } from "date-fns";
import * as SecureStore from "expo-secure-store";
import { UserProfile } from "../types";
import { loadProfile, saveProfile, clearAllData } from "../utils/storage";
import { uuid } from "../utils/uuid";

const DEFAULT_NOTIF_HOUR = 9;
const DEFAULT_NOTIF_MINUTE = 0;

interface UserState {
  profile: UserProfile | null;
  isLoading: boolean;
  loadProfile: () => Promise<void>;
  completeOnboarding: (data: {
    habitName: string;
    habitAnchor: string;
    habitWhy: string;
  }) => Promise<void>;
  setName: (name: string) => Promise<void>;
  setPremium: (isPremium: boolean, purchaseToken?: string) => Promise<void>;
  setNotificationTime: (hour: number, minute: number) => Promise<void>;
  setHapticsEnabled: (enabled: boolean) => Promise<void>;
  markPremiumGateShown: (gate: "day7" | "day22") => Promise<void>;
  updateProfile: (patch: Partial<UserProfile>) => Promise<void>;
  clearData: () => Promise<void>;
  /** Returns how many days into the 66-day journey (1-based, min 1) */
  dayNumber: () => number;
  /** Returns ISO week number for SDT keying */
  currentWeek: () => string; // "YYYY-Www"
}

async function persist(profile: UserProfile): Promise<void> {
  await saveProfile(profile);
}

export const useUserStore = create<UserState>((set, get) => ({
  profile: null,
  isLoading: true,

  loadProfile: async () => {
    set({ isLoading: true });
    const profile = await loadProfile();
    set({ profile, isLoading: false });
  },

  completeOnboarding: async ({ habitName, habitAnchor, habitWhy }) => {
    const id = uuid();
    const now = new Date().toISOString();
    const profile: UserProfile = {
      id,
      createdAt: now,
      habitName,
      habitAnchor,
      habitWhy,
      startDate: now,          // day-1 = today
      isPremium: false,
      purchaseToken: null,
      name: "",
      notificationHour: DEFAULT_NOTIF_HOUR,
      notificationMinute: DEFAULT_NOTIF_MINUTE,
      hapticsEnabled: true,
      premiumGateDay7Shown: false,
      premiumGateDay22Shown: false,
    };
    await persist(profile);
    await SecureStore.setItemAsync("user_id", id);
    set({ profile });
  },

  setName: async (name) => {
    const { profile } = get();
    if (!profile) return;
    const updated = { ...profile, name };
    await persist(updated);
    set({ profile: updated });
  },

  setPremium: async (isPremium, purchaseToken) => {
    const { profile } = get();
    if (!profile) return;
    const updated = {
      ...profile,
      isPremium,
      purchaseToken: isPremium
        ? (purchaseToken ?? profile.purchaseToken)
        : null,
    };
    await persist(updated);
    set({ profile: updated });
  },

  setNotificationTime: async (notificationHour, notificationMinute) => {
    const { profile } = get();
    if (!profile) return;
    const updated = { ...profile, notificationHour, notificationMinute };
    await persist(updated);
    set({ profile: updated });
  },

  setHapticsEnabled: async (hapticsEnabled) => {
    const { profile } = get();
    if (!profile) return;
    const updated = { ...profile, hapticsEnabled };
    await persist(updated);
    set({ profile: updated });
  },

  markPremiumGateShown: async (gate) => {
    const { profile } = get();
    if (!profile) return;
    const updated = {
      ...profile,
      ...(gate === "day7" ? { premiumGateDay7Shown: true } : {}),
      ...(gate === "day22" ? { premiumGateDay22Shown: true } : {}),
    };
    await persist(updated);
    set({ profile: updated });
  },

  updateProfile: async (patch) => {
    const { profile } = get();
    if (!profile) return;
    const updated = { ...profile, ...patch };
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
