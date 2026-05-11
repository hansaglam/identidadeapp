/**
 * Günlük check-in bayrağı (Bugün ekranı) + onboarding’de seçilen alışkanlık özeti.
 * Kalıcı check-in satırları checkinsStore’da; burada gün bayrağı ve Habit tanımı tutulur.
 */
import AsyncStorage from "@react-native-async-storage/async-storage";
import { format } from "date-fns";
import { create } from "zustand";
import { uuid } from "../utils/uuid";

const DAILY_STORAGE_KEY = "habit:daily:v1";
const HABIT_DEFINITION_KEY = "habit:definition:v1";
const REFLECTIONS_KEY = "habit:reflections:v1";

function todayStr(): string {
  return format(new Date(), "yyyy-MM-dd");
}

export interface HabitDailyPersisted {
  todayCheckedIn: boolean;
  lastCheckInDate: string;
}

/** Günlük check-in teyidi (Hızlı Teyit bottom sheet). */
export interface TodayCheckInConfirmation {
  date: string;
  note: string;
  detail: string | null;
}

export interface DailyPersistBlob extends HabitDailyPersisted {
  todayCheckIn: TodayCheckInConfirmation | null;
}

/** Onboarding sonrası kaydedilen seçimler + check-in teyidi için identitySlug. */
export interface Habit {
  id: string;
  identity: string;
  identityIcon: string;
  identitySlug: string;
  cue: string;
  timeSlot: string;
  why: string;
}

export type HabitOnboardingPayload = Omit<Habit, "id">;

/** Zaman Makinesi yorumları (yolculuk günü + tarih). */
export interface JourneyReflection {
  day: number;
  comment: string;
  date: string;
}

interface HabitState extends DailyPersistBlob {
  habit: Habit | null;
  reflections: JourneyReflection[];
  isLoading: boolean;
  load: () => Promise<void>;
  /** Yeni takvim gününde (ör. 00:00 sonrası) todayCheckedIn → false. */
  rollDayIfNeeded: () => Promise<void>;
  markCheckedInToday: () => Promise<void>;
  reconcileFromCheckin: (completedToday: boolean) => Promise<void>;
  resetWithJourney: () => Promise<void>;
  /** Onboarding tamamlanınca; kalıcı olarak yazar. */
  saveHabitFromOnboarding: (payload: HabitOnboardingPayload) => Promise<void>;
  /** Hızlı teyit sheet “Kaydet” sonrası, check-in API’sinden önce. */
  saveTodayCheckInConfirmation: (payload: TodayCheckInConfirmation) => Promise<void>;
  addJourneyReflection: (r: JourneyReflection) => Promise<void>;
}

function sanitizeTodayCheckIn(
  t: string,
  c: TodayCheckInConfirmation | null | undefined
): TodayCheckInConfirmation | null {
  if (!c || typeof c.date !== "string") return null;
  if (c.date !== t) return null;
  if (typeof c.note !== "string") return null;
  if (c.detail != null && typeof c.detail !== "string") return null;
  return { date: c.date, note: c.note, detail: c.detail };
}

async function persistDaily(blob: DailyPersistBlob): Promise<void> {
  try {
    await AsyncStorage.setItem(DAILY_STORAGE_KEY, JSON.stringify(blob));
  } catch {
    /* ignore */
  }
}

async function persistHabitDef(habit: Habit | null): Promise<void> {
  try {
    if (habit == null) {
      await AsyncStorage.removeItem(HABIT_DEFINITION_KEY);
    } else {
      await AsyncStorage.setItem(HABIT_DEFINITION_KEY, JSON.stringify(habit));
    }
  } catch {
    /* ignore */
  }
}

async function loadHabitDef(): Promise<Habit | null> {
  try {
    const raw = await AsyncStorage.getItem(HABIT_DEFINITION_KEY);
    if (!raw) return null;
    const p = JSON.parse(raw) as Partial<Habit>;
    if (
      typeof p.id === "string" &&
      typeof p.identity === "string" &&
      typeof p.identityIcon === "string" &&
      typeof p.identitySlug === "string" &&
      typeof p.cue === "string" &&
      typeof p.timeSlot === "string" &&
      typeof p.why === "string"
    ) {
      return p as Habit;
    }
    return null;
  } catch {
    return null;
  }
}

async function loadReflections(): Promise<JourneyReflection[]> {
  try {
    const raw = await AsyncStorage.getItem(REFLECTIONS_KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw) as unknown[];
    if (!Array.isArray(arr)) return [];
    return arr.filter((x): x is JourneyReflection => {
      if (x == null || typeof x !== "object") return false;
      const o = x as Record<string, unknown>;
      return (
        typeof o.day === "number" &&
        typeof o.comment === "string" &&
        typeof o.date === "string"
      );
    });
  } catch {
    return [];
  }
}

async function persistReflections(list: JourneyReflection[]): Promise<void> {
  try {
    await AsyncStorage.setItem(REFLECTIONS_KEY, JSON.stringify(list));
  } catch {
    /* ignore */
  }
}

function readDailyBlob(get: () => HabitState): DailyPersistBlob {
  const s = get();
  return {
    todayCheckedIn: s.todayCheckedIn,
    lastCheckInDate: s.lastCheckInDate,
    todayCheckIn: s.todayCheckIn,
  };
}

export const useHabitStore = create<HabitState>((set, get) => ({
  todayCheckedIn: false,
  lastCheckInDate: "",
  todayCheckIn: null,
  habit: null,
  reflections: [],
  isLoading: false,

  load: async () => {
    set({ isLoading: true });
    try {
      const t = todayStr();
      const raw = await AsyncStorage.getItem(DAILY_STORAGE_KEY);
      if (raw) {
        const p = JSON.parse(raw) as Partial<DailyPersistBlob>;
        const todayCheckIn = sanitizeTodayCheckIn(t, p.todayCheckIn ?? null);
        set({
          todayCheckedIn: Boolean(p.todayCheckedIn),
          lastCheckInDate: typeof p.lastCheckInDate === "string" ? p.lastCheckInDate : "",
          todayCheckIn,
          isLoading: false,
        });
      } else {
        set({
          todayCheckedIn: false,
          lastCheckInDate: "",
          todayCheckIn: null,
          isLoading: false,
        });
      }
      const habit = await loadHabitDef();
      const reflections = await loadReflections();
      set({ habit, reflections });

      await get().rollDayIfNeeded();
    } catch {
      set({ isLoading: false });
    }
  },

  rollDayIfNeeded: async () => {
    const t = todayStr();
    const { lastCheckInDate, todayCheckedIn, todayCheckIn } = get();
    let nextCheckIn = sanitizeTodayCheckIn(t, todayCheckIn);

    if (lastCheckInDate !== t && todayCheckedIn) {
      const next: DailyPersistBlob = {
        todayCheckedIn: false,
        lastCheckInDate,
        todayCheckIn: nextCheckIn,
      };
      set(next);
      await persistDaily(next);
      return;
    }

    if (todayCheckIn !== nextCheckIn) {
      const next: DailyPersistBlob = {
        todayCheckedIn,
        lastCheckInDate,
        todayCheckIn: nextCheckIn,
      };
      set(next);
      await persistDaily(next);
    }
  },

  markCheckedInToday: async () => {
    const t = todayStr();
    const blob = readDailyBlob(get);
    const next: DailyPersistBlob = {
      ...blob,
      todayCheckedIn: true,
      lastCheckInDate: t,
    };
    set(next);
    await persistDaily(next);
  },

  reconcileFromCheckin: async (completedToday) => {
    const t = todayStr();
    const blob = readDailyBlob(get);
    if (completedToday) {
      const next: DailyPersistBlob = {
        ...blob,
        todayCheckedIn: true,
        lastCheckInDate: t,
      };
      set(next);
      await persistDaily(next);
      return;
    }
    await get().rollDayIfNeeded();
  },

  resetWithJourney: async () => {
    const next: DailyPersistBlob = {
      todayCheckedIn: false,
      lastCheckInDate: "",
      todayCheckIn: null,
    };
    set({ ...next, reflections: [] });
    try {
      await AsyncStorage.removeItem(DAILY_STORAGE_KEY);
      await AsyncStorage.removeItem(REFLECTIONS_KEY);
    } catch {
      /* ignore */
    }
  },

  saveHabitFromOnboarding: async (payload) => {
    const habit: Habit = {
      id: uuid(),
      ...payload,
    };
    set({ habit });
    await persistHabitDef(habit);
  },

  saveTodayCheckInConfirmation: async (payload) => {
    const blob = readDailyBlob(get);
    const next: DailyPersistBlob = {
      ...blob,
      todayCheckIn: payload,
    };
    set(next);
    await persistDaily(next);
  },

  addJourneyReflection: async (r) => {
    const list = [...get().reflections, r];
    set({ reflections: list });
    await persistReflections(list);
  },
}));
