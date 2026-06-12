/**
 * Bildirim sistemi — "hatırlatma" değil "müdahale" tonu.
 *
 * Android 12+ (API 31+): SCHEDULE_EXACT_ALARM — izin yoksa modal + inexact yedek (uygulama açıkken
 * setInterval ile yaklaşık tetikleme). RECEIVE_BOOT_COMPLETED ile yeniden başlatma sonrası
 * zamanlanmış bildirimler OS tarafından yeniden kurulur (tam alarm izni + expo-notifications).
 *
 * Yaz saati (DST): Tüm tek seferlik tarihler date-fns `set` ile yerel saat diliminde üretilir;
 * tekrarlayan WEEKLY/DAILY tetikleyiciler OS saat dilimine göre güncellenir.
 */
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from "expo-notifications";
import { SchedulableTriggerInputTypes } from "expo-notifications";
import {
  format,
  addDays,
  parseISO,
  differenceInDays,
  set,
  getDay,
  startOfMinute,
  startOfDay,
  isBefore,
} from "date-fns";
import { AppState, Platform } from "react-native";
import type { TomorrowTodoList } from "../store/tomorrowPlanStore";
import { UserProfile, CheckinRecord } from "../types";
import { isRestModeActive } from "./restMode";
import {
  getMorningNotification,
  getEveningNotification,
  getStreakCelebrationCopy,
  getRecoveryPush,
  getPhaseMilestoneNotifications,
  type Status as NStatus,
} from "./notificationCopy";
import { countConsecutiveMissesFromYesterday } from "./journeyHome";
import * as NotificationPerms from "./notificationPermissions";
import {
  getCachedExactAlarmStatus,
  needsExactAlarmPermissionCheck,
  promptExactAlarmIfNeeded,
  registerExactAlarmAppStateRefresh,
  setCachedExactAlarmStatus,
  type ExactAlarmStatus,
} from "./exactAlarmPermission";

// ─── iOS foreground + Android heads-up ───────────────────────────────────────

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

// ─── Navigation payload types (notification data) ───────────────────────────

export type NotificationData = {
  type?: "habit" | "plan" | "morning" | "evening" | "phase" | "default";
  habitId?: string;
  screen?: "Home" | "Journey" | "MindDump";
  openTaskSheet?: boolean;
};

export type HabitReminderTime = { hour: number; minute: number } | string;

type InexactReminder = {
  id: string;
  fireAtISO: string;
  title: string;
  body: string;
  data: NotificationData;
};

const INEXACT_STORE_KEY = "notifications:inexact:v1";
const EXACT_PROBE_ID = "__exact_alarm_probe__";
const HABIT_ID_PREFIX = "habit:";

let inexactInterval: ReturnType<typeof setInterval> | null = null;
let exactAlarmStatus: ExactAlarmStatus = "unknown";

// ─── Identifier helpers ──────────────────────────────────────────────────────

const morningId = (date: string) => `morning:${date}`;
const eveningId = (date: string) => `evening:${date}`;
const habitReminderId = (habitId: string, suffix: string) =>
  `${HABIT_ID_PREFIX}${habitId}:${suffix}`;

function weekendDay(date: Date): boolean {
  const d = date.getDay();
  return d === 0 || d === 6;
}

function wantsMorningPulse(profile: UserProfile, targetDate: Date): boolean {
  if (profile.notifyMorningEnabled === false) return false;
  if (isRestModeActive(profile, targetDate)) return false;
  if (profile.notifyWeekendEnabled === false && weekendDay(targetDate)) return false;
  return true;
}

function wantsEveningPulse(profile: UserProfile, onDate = new Date()): boolean {
  if (profile.notifyEveningEnabled === false) return false;
  if (isRestModeActive(profile, onDate)) return false;
  if (profile.notifyWeekendEnabled === false && weekendDay(onDate)) return false;
  return true;
}

function getPrimaryTodoText(list: TomorrowTodoList | undefined): string | null {
  if (!list?.items.length) return null;
  const primary = list.items.find((i) => i.isPrimary) ?? list.items[0];
  return primary?.text?.trim() || null;
}

// ─── Check-in helpers (notification context) ─────────────────────────────────

function computeLast3AvgAuto(
  startDate: string,
  checkins: Record<string, CheckinRecord>
): number | null {
  const start = startOfDay(parseISO(startDate));
  const vals: number[] = [];
  for (let i = 1; i <= 3; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const day = startOfDay(d);
    if (isBefore(day, start)) continue;
    const key = format(day, "yyyy-MM-dd");
    const c = checkins[key];
    if (c?.completed && c.automaticityRating != null) {
      vals.push(c.automaticityRating);
    }
  }
  if (vals.length === 0) return null;
  return vals.reduce((a, b) => a + b, 0) / vals.length;
}

function computeYesterdayEffort(
  startDate: string,
  checkins: Record<string, CheckinRecord>
): number | null {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const day = startOfDay(yesterday);
  const start = startOfDay(parseISO(startDate));
  if (isBefore(day, start)) return null;
  const key = format(day, "yyyy-MM-dd");
  const c = checkins[key];
  if (!c?.completed || c.effortRating == null) return null;
  return c.effortRating;
}

function computeCurrentStreak(
  startDate: string,
  checkins: Record<string, CheckinRecord>
): number {
  const start = startOfDay(parseISO(startDate));
  let streak = 0;
  for (let i = 1; i <= 66; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const day = startOfDay(d);
    if (isBefore(day, start)) break;
    const key = format(day, "yyyy-MM-dd");
    if (checkins[key]?.completed) streak++;
    else break;
  }
  return streak;
}

function computeStatusFromCheckins(
  startDate: string,
  checkins: Record<string, CheckinRecord>
): NStatus {
  const misses = countConsecutiveMissesFromYesterday(startDate, checkins);
  const avg = computeLast3AvgAuto(startDate, checkins);
  if (misses >= 2) return "red";
  if (misses === 1) return "yellow";
  if (avg != null && avg < 4) return "red";
  if (avg != null && avg < 5) return "yellow";
  return "green";
}

/** Yerel saat diliminde gün + saat (DST güvenli). */
export function atLocalTime(base: Date, hour: number, minute: number): Date {
  return startOfMinute(
    set(base, {
      hours: Math.min(23, Math.max(0, hour)),
      minutes: Math.min(59, Math.max(0, minute)),
      seconds: 0,
      milliseconds: 0,
    })
  );
}

export function normalizeHabitReminderTime(time: HabitReminderTime): {
  hour: number;
  minute: number;
} {
  if (typeof time === "string") {
    const match = time.trim().match(/^(\d{1,2})[:.](\d{2})$/);
    if (match) {
      return {
        hour: Math.min(23, Math.max(0, Number.parseInt(match[1]!, 10))),
        minute: Math.min(59, Math.max(0, Number.parseInt(match[2]!, 10))),
      };
    }
  }
  if (typeof time === "object" && time !== null && "hour" in time) {
    return {
      hour: Math.min(23, Math.max(0, time.hour)),
      minute: Math.min(59, Math.max(0, time.minute)),
    };
  }
  return { hour: 9, minute: 0 };
}

/** JS getDay() 0=Pazar → expo WEEKLY weekday 1=Pazar */
export function jsDayToExpoWeekday(jsDay: number): number {
  const d = ((jsDay % 7) + 7) % 7;
  return d + 1;
}

// ─── Exact alarm capability ──────────────────────────────────────────────────

export async function refreshExactAlarmStatus(): Promise<ExactAlarmStatus> {
  if (!needsExactAlarmPermissionCheck()) {
    exactAlarmStatus = "granted";
    await setCachedExactAlarmStatus("granted");
    return exactAlarmStatus;
  }

  const cached = await getCachedExactAlarmStatus();
  if (cached === "granted") {
    exactAlarmStatus = "granted";
    return exactAlarmStatus;
  }

  try {
    const fireAt = addDays(new Date(), 0);
    fireAt.setTime(Date.now() + 90_000);
    await Notifications.cancelScheduledNotificationAsync(EXACT_PROBE_ID);
    await Notifications.scheduleNotificationAsync({
      identifier: EXACT_PROBE_ID,
      content: { title: " ", body: " " },
      trigger: {
        type: SchedulableTriggerInputTypes.DATE,
        date: fireAt,
        channelId: NotificationPerms.getDefaultNotificationChannelId(),
      },
    });
    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    const row = scheduled.find((n) => n.identifier === EXACT_PROBE_ID);
    await Notifications.cancelScheduledNotificationAsync(EXACT_PROBE_ID).catch(() => {});

    let granted = false;
    if (row?.trigger && "value" in row.trigger) {
      const value = (row.trigger as { value?: number }).value;
      if (typeof value === "number") {
        granted = Math.abs(value - fireAt.getTime()) < 10_000;
      }
    } else {
      granted = !!row;
    }

    exactAlarmStatus = granted ? "granted" : "denied";
    await setCachedExactAlarmStatus(exactAlarmStatus);
    return exactAlarmStatus;
  } catch {
    exactAlarmStatus = "denied";
    await setCachedExactAlarmStatus("denied");
    return exactAlarmStatus;
  }
}

export function getExactAlarmStatus(): ExactAlarmStatus {
  return exactAlarmStatus;
}

// ─── Inexact fallback (app foreground / interval) ──────────────────────────

async function loadInexactReminders(): Promise<InexactReminder[]> {
  try {
    const raw = await AsyncStorage.getItem(INEXACT_STORE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as InexactReminder[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function saveInexactReminders(list: InexactReminder[]): Promise<void> {
  try {
    await AsyncStorage.setItem(INEXACT_STORE_KEY, JSON.stringify(list));
  } catch {
    /* ignore */
  }
}

async function registerInexactReminder(
  id: string,
  fireAt: Date,
  title: string,
  body: string,
  data: NotificationData
): Promise<void> {
  if (fireAt <= new Date()) return;
  const list = await loadInexactReminders();
  const next = list.filter((r) => r.id !== id);
  next.push({
    id,
    fireAtISO: fireAt.toISOString(),
    title,
    body,
    data,
  });
  await saveInexactReminders(next);
}

async function removeInexactReminder(id: string): Promise<void> {
  const list = await loadInexactReminders();
  await saveInexactReminders(list.filter((r) => r.id !== id));
}

async function tickInexactReminders(): Promise<void> {
  const list = await loadInexactReminders();
  if (!list.length) return;

  const now = new Date();
  const remaining: InexactReminder[] = [];

  for (const item of list) {
    const fireAt = parseISO(item.fireAtISO);
    if (isBefore(now, fireAt)) {
      remaining.push(item);
      continue;
    }
    if (now.getTime() - fireAt.getTime() > 5 * 60_000) {
      continue;
    }
    await Notifications.scheduleNotificationAsync({
      identifier: `inexact:${item.id}:${fireAt.getTime()}`,
      content: {
        title: item.title,
        body: item.body,
        data: item.data as Record<string, unknown>,
      },
      trigger: null,
    });
  }

  await saveInexactReminders(remaining);
}

export function startInexactReminderWatcher(): void {
  if (inexactInterval) return;
  inexactInterval = setInterval(() => {
    void tickInexactReminders();
  }, 60_000);
  void tickInexactReminders();
}

export function stopInexactReminderWatcher(): void {
  if (inexactInterval) {
    clearInterval(inexactInterval);
    inexactInterval = null;
  }
}

// ─── Unified schedule helper ─────────────────────────────────────────────────

type ScheduleArgs = {
  identifier: string;
  title: string;
  body: string;
  data?: NotificationData;
  trigger:
    | { kind: "date"; date: Date }
    | { kind: "weekly"; weekday: number; hour: number; minute: number }
    | { kind: "daily"; hour: number; minute: number };
};

async function scheduleReliableNotification(args: ScheduleArgs): Promise<void> {
  const channelId = NotificationPerms.getDefaultNotificationChannelId();
  const content = {
    title: args.title,
    body: args.body,
    data: (args.data ?? {}) as Record<string, unknown>,
  };

  await Notifications.cancelScheduledNotificationAsync(args.identifier).catch(() => {});

  const useExact =
    Platform.OS === "ios" ||
    exactAlarmStatus === "granted" ||
    !needsExactAlarmPermissionCheck();

  if (args.trigger.kind === "date") {
    if (args.trigger.date <= new Date()) return;

    if (useExact) {
      await Notifications.scheduleNotificationAsync({
        identifier: args.identifier,
        content,
        trigger: {
          type: SchedulableTriggerInputTypes.DATE,
          date: args.trigger.date,
          channelId,
        },
      });
      await removeInexactReminder(args.identifier);
      return;
    }

    await registerInexactReminder(
      args.identifier,
      args.trigger.date,
      args.title,
      args.body,
      args.data ?? { type: "default" }
    );
    return;
  }

  const weeklyOrDailyTrigger =
    args.trigger.kind === "weekly"
      ? {
          type: SchedulableTriggerInputTypes.WEEKLY as const,
          weekday: args.trigger.weekday,
          hour: args.trigger.hour,
          minute: args.trigger.minute,
          channelId,
        }
      : {
          type: SchedulableTriggerInputTypes.DAILY as const,
          hour: args.trigger.hour,
          minute: args.trigger.minute,
          channelId,
        };

  try {
    await Notifications.scheduleNotificationAsync({
      identifier: args.identifier,
      content,
      trigger: weeklyOrDailyTrigger,
    });
  } catch {
    const target = atLocalTime(new Date(), args.trigger.hour, args.trigger.minute);
    if (target <= new Date()) {
      target.setDate(target.getDate() + 1);
    }
    await registerInexactReminder(
      args.identifier,
      target,
      args.title,
      args.body,
      args.data ?? { type: "habit" }
    );
  }
}

// ─── Habit reminders ─────────────────────────────────────────────────────────

export async function cancelHabitReminders(habitId: string): Promise<void> {
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  const prefix = `${HABIT_ID_PREFIX}${habitId}:`;
  await Promise.all(
    scheduled
      .filter((n) => n.identifier.startsWith(prefix))
      .map((n) => Notifications.cancelScheduledNotificationAsync(n.identifier))
  );
  const inexact = await loadInexactReminders();
  await saveInexactReminders(inexact.filter((r) => !r.id.startsWith(prefix)));
}

/**
 * Alışkanlık hatırlatması — önce eski bildirimleri iptal eder, sonra haftalık/günlük tetikler.
 * @param days JS weekday: 0=Pazar … 6=Cumartesi; boş = her gün (DAILY)
 * @returns Oluşturulan bildirim identifier listesi (iptal için saklanabilir)
 */
export async function scheduleHabitReminder(
  habitId: string,
  time: HabitReminderTime,
  days: number[],
  options?: { title?: string; body?: string; habitName?: string }
): Promise<string[]> {
  const granted = await NotificationPerms.hasNotificationPermissions();
  if (!granted) return [];

  if (needsExactAlarmPermissionCheck() && exactAlarmStatus === "unknown") {
    await promptExactAlarmIfNeeded();
    await refreshExactAlarmStatus();
  }

  await cancelHabitReminders(habitId);

  const { hour, minute } = normalizeHabitReminderTime(time);
  const habitName = options?.habitName?.trim() || "Alışkanlığın";
  const title = options?.title ?? `${habitName} — küçük adım`;
  const body =
    options?.body ?? "Bugün kartındaki tek net hareketi seçmek için birkaç saniye yeter.";
  const data: NotificationData = {
    type: "habit",
    habitId,
    screen: "Home",
    openTaskSheet: true,
  };

  const identifiers: string[] = [];
  const uniqueDays = [...new Set(days.map((d) => ((d % 7) + 7) % 7))];

  if (uniqueDays.length === 0) {
    const id = habitReminderId(habitId, "daily");
    identifiers.push(id);
    await scheduleReliableNotification({
      identifier: id,
      title,
      body,
      data,
      trigger: { kind: "daily", hour, minute },
    });
    return identifiers;
  }

  for (const jsDay of uniqueDays) {
    const id = habitReminderId(habitId, `w${jsDay}`);
    identifiers.push(id);
    await scheduleReliableNotification({
      identifier: id,
      title,
      body,
      data,
      trigger: {
        kind: "weekly",
        weekday: jsDayToExpoWeekday(jsDay),
        hour,
        minute,
      },
    });
  }

  return identifiers;
}

// ─── Morning "Müdahale" ─────────────────────────────────────────────────────

export async function scheduleMorningNotifications(
  profile: UserProfile,
  days = 30,
  listsByDate: Record<string, TomorrowTodoList> = {},
  checkins: Record<string, CheckinRecord> = {}
): Promise<void> {
  const granted = await NotificationPerms.hasNotificationPermissions();
  if (!granted) return;

  const baseDate = new Date();
  const streak = computeCurrentStreak(profile.startDate, checkins);
  const misses = countConsecutiveMissesFromYesterday(profile.startDate, checkins);
  const status = computeStatusFromCheckins(profile.startDate, checkins);
  const last3Avg = computeLast3AvgAuto(profile.startDate, checkins);
  const lastEffort = computeYesterdayEffort(profile.startDate, checkins);

  for (let i = 0; i < days; i++) {
    const target = addDays(baseDate, i);
    const dateStr = format(target, "yyyy-MM-dd");
    const dayN = differenceInDays(target, parseISO(profile.startDate)) + 1;

    if (dayN < 1 || dayN > 66) continue;

    const trigger = atLocalTime(target, profile.notificationHour, profile.notificationMinute);
    if (trigger <= new Date()) continue;
    if (!wantsMorningPulse(profile, target)) continue;

    const plannedAction = getPrimaryTodoText(listsByDate[dateStr]);

    const ctx = {
      habitName: profile.habitName,
      dayNumber: dayN,
      streak: i === 0 ? streak : Math.max(0, streak),
      consecutiveMisses: i === 0 ? misses : 0,
      status: i === 0 ? status : ("green" as const),
      last3AvgAuto: i === 0 ? last3Avg : null,
      lastEffortRating: i === 0 ? lastEffort : null,
      plannedAction,
      todayDone: false,
    };
    const copy = getMorningNotification(ctx);

    await scheduleReliableNotification({
      identifier: morningId(dateStr),
      title: copy.title,
      body: copy.body,
      data: { type: "morning", screen: "Home" },
      trigger: { kind: "date", date: trigger },
    });

    if (i === 0) {
      const celebCopy = getStreakCelebrationCopy(profile.habitName, streak, dayN);
      if (celebCopy) {
        const celebTrigger = atLocalTime(target, profile.notificationHour, profile.notificationMinute + 1);
        if (celebTrigger > new Date()) {
          await scheduleReliableNotification({
            identifier: `streak-celeb:${dateStr}`,
            title: celebCopy.title,
            body: celebCopy.body,
            data: { type: "morning", screen: "Home" },
            trigger: { kind: "date", date: celebTrigger },
          });
        }
      }
    }
  }
}

export async function cancelAllMorningNotifications(): Promise<void> {
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  const morningIds = scheduled
    .filter((n) => n.identifier.startsWith("morning:"))
    .map((n) => n.identifier);
  await Promise.all(
    morningIds.map((id) => Notifications.cancelScheduledNotificationAsync(id))
  );
}

// ─── Evening "Müdahale" ─────────────────────────────────────────────────────

const EVENING_HOUR = 21;
const EVENING_MINUTE = 0;

export async function scheduleEveningReminderToday(
  profile: UserProfile,
  checkins: Record<string, CheckinRecord> = {},
  listsByDate: Record<string, TomorrowTodoList> = {}
): Promise<void> {
  const granted = await NotificationPerms.hasNotificationPermissions();
  if (!granted) return;

  const today = format(new Date(), "yyyy-MM-dd");
  const id = eveningId(today);

  const trigger = atLocalTime(new Date(), EVENING_HOUR, EVENING_MINUTE);
  if (!wantsEveningPulse(profile, new Date())) return;
  if (trigger <= new Date()) return;

  const dayN = differenceInDays(new Date(), parseISO(profile.startDate)) + 1;
  const streak = computeCurrentStreak(profile.startDate, checkins);
  const misses = countConsecutiveMissesFromYesterday(profile.startDate, checkins);
  const status = computeStatusFromCheckins(profile.startDate, checkins);
  const plannedAction = getPrimaryTodoText(listsByDate[today]);

  const ctx = {
    habitName: profile.habitName,
    dayNumber: dayN,
    streak,
    consecutiveMisses: misses,
    status,
    last3AvgAuto: computeLast3AvgAuto(profile.startDate, checkins),
    lastEffortRating: computeYesterdayEffort(profile.startDate, checkins),
    plannedAction,
    todayDone: false,
  };
  const copy = getEveningNotification(ctx);

  if (!copy.title) return;

  await scheduleReliableNotification({
    identifier: id,
    title: copy.title,
    body: copy.body,
    data: { type: "evening", screen: "Home" },
    trigger: { kind: "date", date: trigger },
  });
}

export async function cancelEveningReminderToday(): Promise<void> {
  const today = format(new Date(), "yyyy-MM-dd");
  await Notifications.cancelScheduledNotificationAsync(eveningId(today)).catch(() => {});
  await removeInexactReminder(eveningId(today));
}

async function cancelPhaseMilestoneNotifications(): Promise<void> {
  for (const phase of getPhaseMilestoneNotifications()) {
    const id = `phase:day${phase.dayOffset + 1}`;
    await Notifications.cancelScheduledNotificationAsync(id).catch(() => {});
  }
}

export async function schedulePhaseTransitions(profile: UserProfile): Promise<void> {
  const granted = await NotificationPerms.hasNotificationPermissions();
  if (!granted) return;

  if (profile.notifyPhaseMilestones === false) {
    await cancelPhaseMilestoneNotifications();
    return;
  }

  const start = parseISO(profile.startDate);

  for (const phase of getPhaseMilestoneNotifications()) {
    const triggerDate = atLocalTime(addDays(start, phase.dayOffset), 9, 30);
    if (triggerDate <= new Date()) continue;

    const id = `phase:day${phase.dayOffset + 1}`;
    await scheduleReliableNotification({
      identifier: id,
      title: phase.title,
      body: phase.body,
      data: { type: "phase", screen: "Journey" },
      trigger: { kind: "date", date: triggerDate },
    });
  }
}

// ─── Recovery notification (for missed days) ────────────────────────────────

export async function scheduleRecoveryPushIfNeeded(
  profile: UserProfile,
  checkins: Record<string, CheckinRecord>
): Promise<void> {
  const misses = countConsecutiveMissesFromYesterday(profile.startDate, checkins);
  if (misses < 2) return;

  const granted = await NotificationPerms.hasNotificationPermissions();
  if (!granted) return;

  const today = format(new Date(), "yyyy-MM-dd");
  const recoveryId = `recovery:${today}`;
  const copy = getRecoveryPush(profile.habitName, misses);

  const trigger = atLocalTime(new Date(), 10, 30);
  if (trigger <= new Date()) return;

  await scheduleReliableNotification({
    identifier: recoveryId,
    title: copy.title,
    body: copy.body,
    data: { type: "morning", screen: "Home" },
    trigger: { kind: "date", date: trigger },
  });
}

// ─── Full setup on app startup ───────────────────────────────────────────────

export async function setupNotifications(
  profile: UserProfile,
  todayCheckedIn: boolean,
  listsByDate: Record<string, TomorrowTodoList> = {},
  checkins: Record<string, CheckinRecord> = {}
): Promise<void> {
  if (needsExactAlarmPermissionCheck()) {
    await promptExactAlarmIfNeeded();
    await refreshExactAlarmStatus();
  } else {
    exactAlarmStatus = "granted";
  }

  await Promise.all([
    scheduleMorningNotifications(profile, 30, listsByDate, checkins),
    schedulePhaseTransitions(profile),
    scheduleRecoveryPushIfNeeded(profile, checkins),
  ]);
  if (!todayCheckedIn) {
    await scheduleEveningReminderToday(profile, checkins, listsByDate);
  } else {
    await cancelEveningReminderToday();
  }
}

/** Uygulama açılışında: kanal, exact alarm, inexact watcher, bildirim tıklama hazırlığı. */
export async function initNotificationSystem(
  onReschedule?: () => void | Promise<void>
): Promise<void> {
  await NotificationPerms.ensureAndroidNotificationChannel();
  startInexactReminderWatcher();

  if (needsExactAlarmPermissionCheck()) {
    await refreshExactAlarmStatus();
    registerExactAlarmAppStateRefresh(async () => {
      const prev = exactAlarmStatus;
      await refreshExactAlarmStatus();
      if (prev !== "granted" && exactAlarmStatus === "granted") {
        await onReschedule?.();
      }
    });
  }
}

export function handleNotificationResponseData(
  data: Record<string, unknown> | undefined
): NotificationData {
  if (!data || typeof data !== "object") return { type: "default", screen: "Home" };
  return {
    type: (data.type as NotificationData["type"]) ?? "default",
    habitId: typeof data.habitId === "string" ? data.habitId : undefined,
    screen: (data.screen as NotificationData["screen"]) ?? "Home",
    openTaskSheet: data.openTaskSheet === true || data.openTaskSheet === "true",
  };
}

export {
  requestNotificationPermissions,
  requestNotificationPermissionsFromUser,
  hasNotificationPermissions,
} from "./notificationPermissions";
