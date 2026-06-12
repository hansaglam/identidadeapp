/**
 * Yarın planı todo listesi için ertesi gün hatırlatmaları.
 * Plan tarihinde (check-in günü) sabah veya kullanıcının yazdığı saatte bildirim.
 */
import * as Notifications from "expo-notifications";
import { SchedulableTriggerInputTypes } from "expo-notifications";
import { format, parseISO } from "date-fns";
import type { TomorrowTodoList } from "../store/tomorrowPlanStore";
import type { UserProfile } from "../types";
import { hasNotificationPermissions } from "./notificationPermissions";
import i18n from "../i18n/config";
import { isRestModeActive } from "./restMode";

const planReminderId = (date: string) => `plan:${date}`;

function weekendDay(date: Date): boolean {
  const d = date.getDay();
  return d === 0 || d === 6;
}

function wantsPlanPulse(profile: UserProfile, targetDate: Date): boolean {
  if (profile.notifyMorningEnabled === false) return false;
  if (isRestModeActive(profile, targetDate)) return false;
  if (profile.notifyWeekendEnabled === false && weekendDay(targetDate)) return false;
  return true;
}

/** "Sabah 07:00-08:00" gibi serbest metinden saat çıkarır. */
export function parsePlanTriggerTime(
  dateStr: string,
  timeLabel: string,
  fallbackHour: number,
  fallbackMinute: number
): Date {
  const base = parseISO(dateStr);
  let hour = fallbackHour;
  let minute = fallbackMinute;

  const match = timeLabel.match(/(\d{1,2})\s*[:.]\s*(\d{2})/);
  if (match) {
    hour = Math.min(23, Math.max(0, Number.parseInt(match[1]!, 10)));
    minute = Math.min(59, Math.max(0, Number.parseInt(match[2]!, 10)));
    const lower = timeLabel.toLocaleLowerCase("tr-TR");
    if (
      (lower.includes("öğleden sonra") ||
        lower.includes("aksam") ||
        lower.includes("akşam") ||
        lower.includes("ogle") ||
        lower.includes("öğle")) &&
      hour < 12
    ) {
      hour += 12;
    }
    if (lower.includes("gece") && hour < 12) {
      hour += 12;
    }
  } else {
    const lower = timeLabel.toLocaleLowerCase("tr-TR");
    if (lower.includes("sabah")) {
      hour = Math.min(hour, 9);
      minute = 0;
    } else if (lower.includes("öğle") || lower.includes("ogle")) {
      hour = 12;
      minute = 30;
    } else if (lower.includes("akşam") || lower.includes("aksam")) {
      hour = 19;
      minute = 0;
    }
  }

  return new Date(
    base.getFullYear(),
    base.getMonth(),
    base.getDate(),
    hour,
    minute,
    0
  );
}

export async function cancelPlanReminder(date: string): Promise<void> {
  await Notifications.cancelScheduledNotificationAsync(planReminderId(date)).catch(() => {});
}

export async function schedulePlanReminder(
  profile: UserProfile,
  list: TomorrowTodoList
): Promise<void> {
  const granted = await hasNotificationPermissions();
  if (!granted) return;

  const dateStr = list.date;
  const primary = list.items.find((i) => i.isPrimary) ?? list.items[0];
  if (!primary) {
    await cancelPlanReminder(dateStr);
    return;
  }

  const targetDate = parseISO(dateStr);
  if (!wantsPlanPulse(profile, targetDate)) {
    await cancelPlanReminder(dateStr);
    return;
  }

  const trigger = parsePlanTriggerTime(
    dateStr,
    primary.time,
    profile.notificationHour,
    profile.notificationMinute
  );

  await cancelPlanReminder(dateStr);

  if (trigger <= new Date()) return;

  const contextLine = primary.context ? ` · ${primary.context}` : "";
  const timeLine = primary.time ? ` (${primary.time})` : "";

  await Notifications.scheduleNotificationAsync({
    identifier: planReminderId(dateStr),
    content: {
      title: i18n.t("notifications.planReminder.title"),
      body: i18n.t("notifications.planReminder.body", {
        action: primary.text,
        time: timeLine,
        context: contextLine,
      }),
    },
    trigger: { type: SchedulableTriggerInputTypes.DATE, date: trigger },
  });
}

/** Gelecekteki tüm planlı günler için hatırlatmaları yeniler. */
export async function syncAllPlanReminders(
  profile: UserProfile,
  listsByDate: Record<string, TomorrowTodoList>
): Promise<void> {
  const today = format(new Date(), "yyyy-MM-dd");
  await Promise.all(
    Object.entries(listsByDate).map(async ([date, list]) => {
      if (date < today || !list.items.length) {
        await cancelPlanReminder(date);
        return;
      }
      await schedulePlanReminder(profile, list);
    })
  );
}
