/**
 * Manages daily check-in records (AsyncStorage key: 'checkins:YYYY-MM-DD').
 *
 * Streak rules (penalty-free system):
 *   - Haftada 1 kurtarma günü: one missed day per ISO week can be rescued
 *   - Rescue = streak doesn't break (but that day doesn't count toward the streak number)
 *   - 2 consecutive ACTUAL misses (unrescued) = streak resets
 *   - 1 unrescued miss after rescue is exhausted = streak resets
 *   - totalDays66 = completed count since start, NEVER resets
 */
import { create } from "zustand";
import {
  format, subDays, differenceInDays, parseISO,
} from "date-fns";
import { getISOWeek, getISOWeekYear } from "date-fns";
import {
  loadAllCheckins, saveCheckin,
} from "../utils/storage";
import { CheckinRecord } from "../types";

// ─── StreakState ────────────────────────────────────────────────────────────

export interface StreakState {
  currentStreak: number;
  longestStreak: number;
  /** 0 or 1 — whether the rescue day for the current ISO week has been used */
  rescueDaysUsedThisWeek: number;
  /** Total completed days since habit start; never resets */
  totalDays66: number;
}

// ─── Helpers ───────────────────────────────────────────────────────────────

const todayStr = () => format(new Date(), "yyyy-MM-dd");

function isoWeekKey(dateStr: string): string {
  const d = parseISO(dateStr);
  return `${getISOWeekYear(d)}-W${String(getISOWeek(d)).padStart(2, "0")}`;
}

/**
 * Computes full streak state with the rescue-day rule.
 *
 * Walk backwards from today:
 *   - Completed day          → streak++, clear consecutive-miss counter
 *   - Missed + rescue avail  → mark rescue used for that week, "bridge" (streak doesn't break,
 *                              inMissGap=true so a *next* consecutive miss will break it)
 *   - Missed + no rescue     → break immediately (1 real miss = end of streak)
 *   - Missed while inMissGap → 2 consecutive real misses → break
 */
function computeStreakState(
  checkins: Record<string, CheckinRecord>
): StreakState {
  const today = new Date();
  const now = todayStr();
  const todayDone = checkins[now]?.completed ?? false;

  // totalDays66: all-time completions (never resets)
  const totalDays66 = Object.values(checkins).filter((r) => r.completed).length;

  // ── Current streak ─────────────────────────────────────────────────────
  let currentStreak = 0;
  const rescueUsedByWeek: Record<string, boolean> = {};
  let inMissGap = false; // true after a rescue is used — next miss = 2 consecutive → break

  // If today isn't checked in yet, start counting from yesterday (today is "pending")
  const startOffset = todayDone ? 0 : 1;

  for (let i = startOffset; i <= 100; i++) {
    const dateStr = format(subDays(today, i), "yyyy-MM-dd");
    const done = checkins[dateStr]?.completed ?? false;

    if (done) {
      currentStreak++;
      inMissGap = false;
    } else {
      if (inMissGap) {
        // 2nd consecutive real miss → stop here
        break;
      }

      const week = isoWeekKey(dateStr);
      if (!rescueUsedByWeek[week]) {
        // Use the rescue day for this week
        rescueUsedByWeek[week] = true;
        inMissGap = true; // next real miss will break the streak
        // streak does NOT increment for rescue days
      } else {
        // Rescue already used for this week → 1 unrescued miss → streak ends
        break;
      }
    }
  }

  // ── Longest streak (simple consecutive days, no rescue rule — personal record) ──
  const longestStreak = computeLongestStreak(checkins);

  // ── Rescue usage for the CURRENT week ─────────────────────────────────
  const currentWeek = isoWeekKey(now);
  const rescueDaysUsedThisWeek = rescueUsedByWeek[currentWeek] ? 1 : 0;

  return { currentStreak, longestStreak, rescueDaysUsedThisWeek, totalDays66 };
}

/** Simple longest streak: max consecutive calendar days completed. */
function computeLongestStreak(checkins: Record<string, CheckinRecord>): number {
  const completedDates = Object.keys(checkins)
    .filter((d) => checkins[d].completed)
    .sort();

  let longest = 0;
  let temp = 0;
  for (let i = 0; i < completedDates.length; i++) {
    if (i === 0) {
      temp = 1;
    } else {
      const diff = differenceInDays(
        parseISO(completedDates[i]),
        parseISO(completedDates[i - 1])
      );
      temp = diff === 1 ? temp + 1 : 1;
    }
    longest = Math.max(longest, temp);
  }
  return longest;
}

// ─── Store ─────────────────────────────────────────────────────────────────

interface CheckinsState {
  checkins: Record<string, CheckinRecord>;
  isLoading: boolean;
  load: () => Promise<void>;
  toggleToday: (dayNumber: number) => Promise<void>;
  /** Otomatiklik + çaba puanlarıyla bugünü tamamla. */
  completeTodayWithRatings: (dayNumber: number, automaticity: number, effort: number) => Promise<void>;
  getTodayCheckin: () => CheckinRecord | null;
  getStreakState: () => StreakState;
  /** @deprecated Use getStreakState().currentStreak */
  currentStreak: () => number;
  /** @deprecated Use getStreakState().longestStreak */
  longestStreak: () => number;
  completedCount: () => number;
  /** Returns 66 booleans: index 0 = day-1 of journey, index 65 = day-66 */
  last66Days: (startDate: string) => boolean[];
  completionRate: (startDate: string) => number;
  /** True if today has been completed and the streak was just reset (streak == 0 before today) */
  isStreakReset: () => boolean;
}

export const useCheckinsStore = create<CheckinsState>((set, get) => ({
  checkins: {},
  isLoading: false,

  load: async () => {
    set({ isLoading: true });
    const records = await loadAllCheckins();
    const map: Record<string, CheckinRecord> = {};
    records.forEach((r) => { map[r.date] = r; });
    set({ checkins: map, isLoading: false });
  },

  toggleToday: async (dayNumber) => {
    const date = todayStr();
    const { checkins } = get();
    const existing = checkins[date];

    if (existing?.completed) {
      const updated: CheckinRecord = {
        ...existing,
        completed: false,
        completedAt: null,
        automaticityRating: undefined,
        effortRating: undefined,
      };
      await saveCheckin(updated);
      set((s) => ({ checkins: { ...s.checkins, [date]: updated } }));
    } else {
      const record: CheckinRecord = {
        date,
        completed: true,
        completedAt: new Date().toISOString(),
        day: dayNumber,
      };
      await saveCheckin(record);
      set((s) => ({ checkins: { ...s.checkins, [date]: record } }));
    }
  },

  completeTodayWithRatings: async (dayNumber, automaticity, effort) => {
    const date = todayStr();
    const record: CheckinRecord = {
      date,
      completed: true,
      completedAt: new Date().toISOString(),
      day: dayNumber,
      automaticityRating: automaticity,
      effortRating: effort,
    };
    await saveCheckin(record);
    set((s) => ({ checkins: { ...s.checkins, [date]: record } }));
  },

  getTodayCheckin: () => {
    const { checkins } = get();
    return checkins[todayStr()] ?? null;
  },

  getStreakState: () => computeStreakState(get().checkins),

  currentStreak: () => computeStreakState(get().checkins).currentStreak,

  longestStreak: () => computeLongestStreak(get().checkins),

  completedCount: () =>
    Object.values(get().checkins).filter((r) => r.completed).length,

  last66Days: (startDate) => {
    const { checkins } = get();
    const start = parseISO(startDate);
    return Array.from({ length: 66 }, (_, i) => {
      const date = format(
        new Date(start.getFullYear(), start.getMonth(), start.getDate() + i),
        "yyyy-MM-dd"
      );
      return checkins[date]?.completed ?? false;
    });
  },

  completionRate: (startDate) => {
    const { checkins } = get();
    const daysSinceStart = Math.max(
      0, differenceInDays(new Date(), parseISO(startDate))
    );
    if (daysSinceStart === 0) return 0;
    const done = Object.values(checkins).filter((r) => r.completed).length;
    return Math.min(done / (daysSinceStart + 1), 1);
  },

  isStreakReset: () => {
    const { checkins } = get();
    const now = todayStr();
    const todayDone = checkins[now]?.completed ?? false;
    if (!todayDone) return false;
    // Check if streak was 0 before today completed (i.e., yesterday wasn't done
    // and rescue isn't covering it)
    const withoutToday = { ...checkins };
    delete withoutToday[now];
    const prevStreak = computeStreakState(withoutToday).currentStreak;
    return prevStreak === 0 && Object.values(checkins).some((r) => r.completed);
  },
}));
