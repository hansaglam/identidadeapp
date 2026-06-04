import { format, parseISO, subDays, differenceInDays } from "date-fns";
import { CheckinRecord } from "../types";
import i18n from "../i18n/config";
import { getDateFnsLocale } from "./dateFnsLocale";

function daypartForHour(h: number): string {
  if (h >= 6 && h < 12) return i18n.t("profile.weeklySummary.daypart.morning");
  if (h >= 12 && h < 17) return i18n.t("profile.weeklySummary.daypart.afternoon");
  if (h >= 17 && h < 22) return i18n.t("profile.weeklySummary.daypart.evening");
  return i18n.t("profile.weeklySummary.daypart.night");
}

function weekdayShort(dayIndex: number): string {
  const days = i18n.t("profile.weeklySummary.weekdays", { returnObjects: true });
  if (Array.isArray(days) && typeof days[dayIndex] === "string") {
    return days[dayIndex] as string;
  }
  const fallback = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  return fallback[dayIndex] ?? "";
}

export interface WeeklyDigest {
  completedDays: number;
  missedDaysInWindow: number;
  slipProneWeekdayShort: string | null;
  windowLabel: string;
  completionTimePeak: string | null;
  completionTimeCaveat: string | null;
}

export function isoLocalDate(d: Date): string {
  return format(d, "yyyy-MM-dd");
}

/** Bugünden geriye 7 gün (bugün dahil); yol başlangıcından önceki günlere yazılmaz. */
export function buildWeeklyDigest(
  startDateISO: string,
  checkins: Record<string, CheckinRecord>
): WeeklyDigest {
  const start = parseISO(startDateISO);
  const windowEnd = new Date();
  const windowStart = subDays(windowEnd, 6);
  const locale = getDateFnsLocale();

  let completedDays = 0;
  let missedDaysInWindow = 0;
  const missesByWeekday: number[] = [0, 0, 0, 0, 0, 0, 0];

  const hourBuckets: Record<string, number> = {};

  for (let i = 0; i < 7; i++) {
    const d = subDays(windowEnd, i);
    if (differenceInDays(d, start) < 0) continue;
    const key = isoLocalDate(d);
    const rec = checkins[key];
    const done = rec?.completed ?? false;
    if (done) {
      completedDays++;
      if (rec.completedAt) {
        try {
          const h = parseISO(rec.completedAt).getHours();
          const part = daypartForHour(h);
          hourBuckets[part] = (hourBuckets[part] ?? 0) + 1;
        } catch {
          /* ignore malformed ISO */
        }
      }
    } else {
      missedDaysInWindow++;
      const wd = d.getDay();
      missesByWeekday[wd]++;
    }
  }

  let slipDay: number | null = null;
  let slipMax = 0;
  for (let wd = 0; wd < 7; wd++) {
    if (missesByWeekday[wd] > slipMax) {
      slipMax = missesByWeekday[wd];
      slipDay = wd;
    }
  }

  const slipProneWeekdayShort =
    slipDay != null && slipMax > 0 ? weekdayShort(slipDay) : null;

  const windowLabel = `${format(windowStart, "d MMM", { locale })} — ${format(
    windowEnd,
    "d MMMM",
    { locale }
  )}`;

  let peakKey: string | null = null;
  let peakVal = 0;
  for (const [label, cnt] of Object.entries(hourBuckets)) {
    if (cnt > peakVal) {
      peakVal = cnt;
      peakKey = label;
    }
  }

  let completionTimePeak: string | null = null;
  let completionTimeCaveat: string | null = null;

  const withTimestampCount = Object.values(hourBuckets).reduce((a, n) => a + n, 0);

  if (completedDays > 0 && withTimestampCount === 0) {
    completionTimeCaveat = i18n.t("profile.weeklySummary.noTimestamp");
  } else if (peakKey != null && peakVal > 0) {
    completionTimePeak = i18n.t("profile.weeklySummary.peak", { part: peakKey });
    if (withTimestampCount < completedDays) {
      completionTimeCaveat = i18n.t("profile.weeklySummary.partialTimestamp");
    }
  }

  return {
    completedDays,
    missedDaysInWindow,
    slipProneWeekdayShort,
    windowLabel,
    completionTimePeak,
    completionTimeCaveat,
  };
}
