import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { useCheckinsStore } from "./checkinsStore";
import { useUserStore } from "./userStore";
import { uuid } from "../utils/uuid";
import {
  cancelPlanReminder,
  schedulePlanReminder,
  syncAllPlanReminders,
} from "../utils/tomorrowPlanNotifications";

const TOMORROW_PLANS_KEY = "journey:tomorrow-plans:v1";
const MAX_TOMORROW_TODOS = 3;

export interface TomorrowTodoItem {
  id: string;
  text: string;
  time: string;
  context: string;
  completed: boolean;
  isPrimary: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TomorrowTodoList {
  date: string;
  items: TomorrowTodoItem[];
  createdAt: string;
  updatedAt: string;
}

export type TomorrowTodoInput = Pick<TomorrowTodoItem, "text" | "time" | "context">;

interface TomorrowPlanState {
  listsByDate: Record<string, TomorrowTodoList>;
  isLoading: boolean;
  load: () => Promise<void>;
  addItem: (date: string, input: TomorrowTodoInput) => Promise<void>;
  updateItem: (date: string, id: string, input: TomorrowTodoInput) => Promise<void>;
  toggleItem: (date: string, id: string) => Promise<void>;
  deleteItem: (date: string, id: string) => Promise<void>;
  clearList: (date: string) => Promise<void>;
  /** Check-in sonrası bugünkü plan maddelerini tamamlanmış işaretle */
  markDayCompleted: (date: string) => Promise<void>;
}

type LegacyTomorrowPlan = {
  date: string;
  action: string;
  time: string;
  context: string;
  duration: string;
  createdAt: string;
  updatedAt: string;
};

function isTodoItem(value: unknown): value is TomorrowTodoItem {
  if (value == null || typeof value !== "object") return false;
  const p = value as Record<string, unknown>;
  return (
    typeof p.id === "string" &&
    typeof p.text === "string" &&
    typeof p.time === "string" &&
    typeof p.context === "string" &&
    typeof p.completed === "boolean" &&
    typeof p.isPrimary === "boolean" &&
    typeof p.createdAt === "string" &&
    typeof p.updatedAt === "string"
  );
}

function isTodoList(value: unknown): value is TomorrowTodoList {
  if (value == null || typeof value !== "object") return false;
  const p = value as Record<string, unknown>;
  return (
    typeof p.date === "string" &&
    Array.isArray(p.items) &&
    p.items.every(isTodoItem) &&
    typeof p.createdAt === "string" &&
    typeof p.updatedAt === "string"
  );
}

function isLegacyPlan(value: unknown): value is LegacyTomorrowPlan {
  if (value == null || typeof value !== "object") return false;
  const p = value as Record<string, unknown>;
  return (
    typeof p.date === "string" &&
    typeof p.action === "string" &&
    typeof p.time === "string" &&
    typeof p.context === "string" &&
    typeof p.duration === "string" &&
    typeof p.createdAt === "string" &&
    typeof p.updatedAt === "string"
  );
}

function normalizeList(date: string, value: unknown): TomorrowTodoList | null {
  if (isTodoList(value)) {
    const items = value.items.slice(0, MAX_TOMORROW_TODOS).map((item, index) => ({
      ...item,
      isPrimary: index === 0,
    }));
    return {
      ...value,
      date,
      items,
    };
  }

  if (isLegacyPlan(value)) {
    const now = new Date().toISOString();
    const supportText = [value.context, value.duration].filter(Boolean).join(" · ");
    return {
      date,
      createdAt: value.createdAt,
      updatedAt: value.updatedAt,
      items: [
        {
          id: uuid(),
          text: value.action,
          time: value.time,
          context: value.context,
          completed: false,
          isPrimary: true,
          createdAt: value.createdAt || now,
          updatedAt: value.updatedAt || now,
        },
        ...(supportText
          ? [
              {
                id: uuid(),
                text: supportText,
                time: "",
                context: "",
                completed: false,
                isPrimary: false,
                createdAt: now,
                updatedAt: now,
              },
            ]
          : []),
      ].slice(0, MAX_TOMORROW_TODOS),
    };
  }

  return null;
}

async function persist(listsByDate: Record<string, TomorrowTodoList>): Promise<void> {
  try {
    await AsyncStorage.setItem(TOMORROW_PLANS_KEY, JSON.stringify(listsByDate));
  } catch {
    /* ignore */
  }
}

async function syncRemindersForDate(
  date: string,
  listsByDate: Record<string, TomorrowTodoList>
): Promise<void> {
  const profile = useUserStore.getState().profile;
  if (!profile) return;
  const list = listsByDate[date];
  if (list?.items.length) {
    await schedulePlanReminder(profile, list);
  } else {
    await cancelPlanReminder(date);
  }
}

async function syncRemindersAfterPersist(
  listsByDate: Record<string, TomorrowTodoList>
): Promise<void> {
  const profile = useUserStore.getState().profile;
  if (!profile) return;
  await syncAllPlanReminders(profile, listsByDate);
}

export const useTomorrowPlanStore = create<TomorrowPlanState>((set, get) => ({
  listsByDate: {},
  isLoading: false,

  load: async () => {
    set({ isLoading: true });
    try {
      const raw = await AsyncStorage.getItem(TOMORROW_PLANS_KEY);
      if (!raw) {
        set({ listsByDate: {}, isLoading: false });
        return;
      }
      const parsed = JSON.parse(raw) as Record<string, unknown>;
      const listsByDate = Object.fromEntries(
        Object.entries(parsed).flatMap(([date, value]) => {
          const list = normalizeList(date, value);
          return list ? [[date, list]] : [];
        })
      ) as Record<string, TomorrowTodoList>;
      set({ listsByDate, isLoading: false });
      await persist(listsByDate);
      await syncRemindersAfterPersist(listsByDate);
    } catch {
      set({ listsByDate: {}, isLoading: false });
    }
  },

  addItem: async (date, input) => {
    const now = new Date().toISOString();
    const existing = get().listsByDate[date];
    const items = existing?.items ?? [];
    if (items.length >= MAX_TOMORROW_TODOS) return;
    const item: TomorrowTodoItem = {
      id: uuid(),
      text: input.text.trim(),
      time: input.time.trim(),
      context: input.context.trim(),
      completed: false,
      isPrimary: items.length === 0,
      createdAt: now,
      updatedAt: now,
    };
    const list: TomorrowTodoList = {
      date,
      createdAt: existing?.createdAt ?? now,
      items: [...items, item],
      updatedAt: now,
    };
    const listsByDate = { ...get().listsByDate, [date]: list };
    set({ listsByDate });
    await persist(listsByDate);
    await syncRemindersForDate(date, listsByDate);
  },

  updateItem: async (date, id, input) => {
    const existing = get().listsByDate[date];
    if (!existing) return;
    const now = new Date().toISOString();
    const items = existing.items.map((item) =>
      item.id === id
        ? {
            ...item,
            text: input.text.trim(),
            time: input.time.trim(),
            context: input.context.trim(),
            updatedAt: now,
          }
        : item
    );
    const listsByDate = {
      ...get().listsByDate,
      [date]: { ...existing, items, updatedAt: now },
    };
    set({ listsByDate });
    await persist(listsByDate);
    await syncRemindersForDate(date, listsByDate);
  },

  toggleItem: async (date, id) => {
    const checkin = useCheckinsStore.getState().checkins[date];
    if (checkin?.completed) return;
    const existing = get().listsByDate[date];
    if (!existing) return;
    const now = new Date().toISOString();
    const items = existing.items.map((item) =>
      item.id === id ? { ...item, completed: !item.completed, updatedAt: now } : item
    );
    const listsByDate = {
      ...get().listsByDate,
      [date]: { ...existing, items, updatedAt: now },
    };
    set({ listsByDate });
    await persist(listsByDate);
  },

  deleteItem: async (date, id) => {
    const existing = get().listsByDate[date];
    if (!existing) return;
    const now = new Date().toISOString();
    const items = existing.items
      .filter((item) => item.id !== id)
      .map((item, index) => ({ ...item, isPrimary: index === 0 }));
    const listsByDate = { ...get().listsByDate };
    if (items.length === 0) {
      delete listsByDate[date];
    } else {
      listsByDate[date] = { ...existing, items, updatedAt: now };
    }
    set({ listsByDate });
    await persist(listsByDate);
    await syncRemindersForDate(date, listsByDate);
  },

  clearList: async (date) => {
    const listsByDate = { ...get().listsByDate };
    delete listsByDate[date];
    set({ listsByDate });
    await persist(listsByDate);
    await cancelPlanReminder(date);
  },

  markDayCompleted: async (date) => {
    const existing = get().listsByDate[date];
    if (!existing) return;
    const now = new Date().toISOString();
    const items = existing.items.map((item) => ({
      ...item,
      completed: true,
      updatedAt: now,
    }));
    const listsByDate = {
      ...get().listsByDate,
      [date]: { ...existing, items, updatedAt: now },
    };
    set({ listsByDate });
    await persist(listsByDate);
    await cancelPlanReminder(date);
  },
}));
