/**
 * Davranış İşletim Sistemi global state'i.
 *
 * Sakladıkları:
 *  - muscles      → 5 disiplin kasının ham sayımları
 *  - recentActions → son 30 aksiyonun kayıtları
 *  - lastActionAt → en son aksiyon zamanı
 *  - totalActions → toplam aksiyon sayısı
 *
 * AsyncStorage'a kalıcılaştırılır. XP/seviye yok — sadece farkındalık.
 */

import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import {
  Action,
  Muscles,
  RecentAction,
  EMPTY_MUSCLES,
} from "../engine";

const STORAGE_KEY = "behavior:state:v1";

interface PersistedState {
  muscles: Muscles;
  recentActions: RecentAction[];
  lastActionAt: string | null;
  totalActions: number;
}

interface BehaviorState extends PersistedState {
  isLoading: boolean;
  load: () => Promise<void>;
  recordAction: (action: Action) => Promise<void>;
  reset: () => Promise<void>;
}

const INITIAL: PersistedState = {
  muscles: { ...EMPTY_MUSCLES },
  recentActions: [],
  lastActionAt: null,
  totalActions: 0,
};

async function persist(state: PersistedState): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Sessiz: storage olmasa bile sistem çalışmaya devam eder
  }
}

export const useBehaviorStore = create<BehaviorState>((set, get) => ({
  ...INITIAL,
  isLoading: false,

  load: async () => {
    set({ isLoading: true });
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<PersistedState>;
        set({
          muscles: { ...EMPTY_MUSCLES, ...(parsed.muscles ?? {}) },
          recentActions: parsed.recentActions ?? [],
          lastActionAt: parsed.lastActionAt ?? null,
          totalActions: parsed.totalActions ?? 0,
          isLoading: false,
        });
      } else {
        set({ ...INITIAL, isLoading: false });
      }
    } catch {
      set({ ...INITIAL, isLoading: false });
    }
  },

  recordAction: async (action) => {
    const now = new Date().toISOString();
    const current = get();
    const muscles: Muscles = {
      ...current.muscles,
      [action.type]: current.muscles[action.type] + 1,
    };
    const recentActions: RecentAction[] = [
      { id: action.id, type: action.type, at: now },
      ...current.recentActions,
    ].slice(0, 30);

    const next: PersistedState = {
      muscles,
      recentActions,
      lastActionAt: now,
      totalActions: current.totalActions + 1,
    };
    set({ ...next });
    await persist(next);
  },

  reset: async () => {
    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
    set({ ...INITIAL });
  },
}));
