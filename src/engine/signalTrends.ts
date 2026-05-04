/**
 * Son günlerdeki check-in serisinden yolculuk eğilimi (tamamen cihaz içi).
 */

import { format, parseISO, subDays, startOfDay } from "date-fns";
import { CheckinRecord } from "../types";

export type JourneyTrend = "improving" | "stable" | "declining" | "unknown";

type DaySample = { completed: boolean; auto: number | null };

function mean(nums: number[]): number {
  if (nums.length === 0) return 0;
  return nums.reduce((a, b) => a + b, 0) / nums.length;
}

/**
 * `startDate` sonrası son `windowDays` günü ikiye böler: tamamlanma oranı ve
 * otomatiklik ortalaması karşılaştırılır.
 */
export function computeJourneyTrend(
  startDate: string,
  checkins: Record<string, CheckinRecord>,
  windowDays = 14
): JourneyTrend {
  const start = startOfDay(parseISO(startDate));
  const today = new Date();
  const days: DaySample[] = [];

  for (let i = windowDays - 1; i >= 0; i--) {
    const d = subDays(today, i);
    if (startOfDay(d) < start) continue;
    const key = format(d, "yyyy-MM-dd");
    const c = checkins[key];
    days.push({
      completed: c?.completed ?? false,
      auto:
        c?.completed && c.automaticityRating != null
          ? c.automaticityRating
          : null,
    });
  }

  if (days.length < 5) return "unknown";

  const mid = Math.floor(days.length / 2);
  const older = days.slice(0, mid);
  const newer = days.slice(mid);

  const rateOlder =
    older.filter((x) => x.completed).length / Math.max(1, older.length);
  const rateNewer =
    newer.filter((x) => x.completed).length / Math.max(1, newer.length);

  const autosOld = older
    .filter((x) => x.auto != null)
    .map((x) => x.auto as number);
  const autosNew = newer
    .filter((x) => x.auto != null)
    .map((x) => x.auto as number);

  let delta = 0;
  if (rateNewer - rateOlder >= 0.2) delta += 2;
  else if (rateOlder - rateNewer >= 0.2) delta -= 2;
  else if (rateNewer - rateOlder >= 0.1) delta += 1;
  else if (rateOlder - rateNewer >= 0.1) delta -= 1;

  if (autosOld.length >= 2 && autosNew.length >= 2) {
    const mOld = mean(autosOld);
    const mNew = mean(autosNew);
    if (mNew - mOld >= 1.2) delta += 2;
    else if (mOld - mNew >= 1.2) delta -= 2;
    else if (mNew - mOld >= 0.6) delta += 1;
    else if (mOld - mNew >= 0.6) delta -= 1;
  }

  if (delta >= 2) return "improving";
  if (delta <= -2) return "declining";
  return "stable";
}
