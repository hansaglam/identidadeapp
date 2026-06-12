import {
  addDays,
  differenceInDays,
  format,
  parseISO,
  startOfDay,
  subDays,
} from "date-fns";
import type { CheckinRecord } from "../types";

export type ResilienceStatus = "untested" | "measured";

export interface ResilienceStats {
  falls: number;
  comebacks: number;
  /** null when falls === 0 (untested) */
  comebackRate: number | null;
  status: ResilienceStatus;
  /** min(1, comebacks × 0.2) — disiplin skoru dayanıklılık bileşeni için */
  experienceMultiplier: number;
}

function iterateJourneyDays(
  startDate: string,
  asOf: Date,
  fn: (dateKey: string, dayIndex: number) => void
): void {
  const start = startOfDay(parseISO(startDate));
  const end = startOfDay(asOf);
  if (end < start) return;
  const totalDays = differenceInDays(end, start) + 1;
  for (let i = 0; i < totalDays; i += 1) {
    const d = addDays(start, i);
    fn(format(d, "yyyy-MM-dd"), i + 1);
  }
}

/**
 * Düşüş serisi: en az bir tamamlanmış günden sonra başlayan ilk kaçırılmış gün = 1 düşüş.
 * Ardışık kaçırılan günler aynı seri. Geri dönüş = seriden sonraki ilk tamamlanan check-in.
 */
export function computeResilienceStats(
  startDate: string,
  checkins: Record<string, CheckinRecord>,
  asOfDate: Date = new Date()
): ResilienceStats {
  if (!startDate) {
    return {
      falls: 0,
      comebacks: 0,
      comebackRate: null,
      status: "untested",
      experienceMultiplier: 0,
    };
  }

  let falls = 0;
  let comebacks = 0;
  let hadFirstCompletion = false;
  let inFallEpisode = false;

  iterateJourneyDays(startDate, asOfDate, (dateKey) => {
    const completed = checkins[dateKey]?.completed === true;

    if (completed) {
      if (inFallEpisode) {
        comebacks += 1;
        inFallEpisode = false;
      }
      hadFirstCompletion = true;
      return;
    }

    if (!hadFirstCompletion) return;

    if (!inFallEpisode) {
      falls += 1;
      inFallEpisode = true;
    }
  });

  const status: ResilienceStatus = falls === 0 ? "untested" : "measured";
  const comebackRate =
    falls > 0 ? Math.min(100, Math.round((comebacks / falls) * 100)) : null;
  const experienceMultiplier = Math.min(1, comebacks * 0.2);

  return {
    falls,
    comebacks,
    comebackRate,
    status,
    experienceMultiplier,
  };
}

/** Bugünkü check-in, aktif bir düşüş serisinden sonra ilk tamamlama mı? */
export function isComebackCheckIn(consecutiveMissFromYesterday: number): boolean {
  return consecutiveMissFromYesterday >= 1;
}

export function filterCheckinsUntil(
  checkins: Record<string, CheckinRecord>,
  untilDate: Date
): Record<string, CheckinRecord> {
  const untilKey = format(startOfDay(untilDate), "yyyy-MM-dd");
  const out: Record<string, CheckinRecord> = {};
  for (const [key, rec] of Object.entries(checkins)) {
    if (key <= untilKey) out[key] = rec;
  }
  return out;
}

export function resilienceStatsDaysAgo(
  startDate: string,
  checkins: Record<string, CheckinRecord>,
  daysAgo: number
): ResilienceStats {
  return computeResilienceStats(
    startDate,
    filterCheckinsUntil(checkins, subDays(new Date(), daysAgo))
  );
}
