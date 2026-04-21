import {
  format, subDays, differenceInDays, parseISO, startOfDay,
} from "date-fns";
import { CheckinRecord } from "../types";

/** Bugünden 14 gün geriye (dahil), soldan sağa en eski → en yeni. */
export function buildLast14Days(
  startDate: string,
  checkins: Record<string, CheckinRecord>
): { completed: boolean; dayNumber: number }[] {
  const start = startOfDay(parseISO(startDate));
  const out: { completed: boolean; dayNumber: number }[] = [];
  for (let i = 13; i >= 0; i -= 1) {
    const d = startOfDay(subDays(new Date(), i));
    if (d < start) {
      out.push({ completed: false, dayNumber: 0 });
      continue;
    }
    const key = format(d, "yyyy-MM-dd");
    const dayNumber = Math.min(66, Math.max(1, differenceInDays(d, start) + 1));
    out.push({
      completed: checkins[key]?.completed ?? false,
      dayNumber,
    });
  }
  return out;
}

/** Dün, yolculuk içindeyse ve tamamlanmadıysa (kayıt yok veya completed false) */
export function isMissedYesterday(
  startDate: string,
  checkins: Record<string, CheckinRecord>
): boolean {
  const start = startOfDay(parseISO(startDate));
  const y = startOfDay(subDays(new Date(), 1));
  if (y < start) return false;
  const key = format(y, "yyyy-MM-dd");
  return !checkins[key]?.completed;
}

/**
 * Dünden geriye, üst üste kaç gün yok / tamamsız; ilk tamamda durur. Yolculuk öncesi sayılmaz.
 */
export function countConsecutiveMissesFromYesterday(
  startDate: string,
  checkins: Record<string, CheckinRecord>
): number {
  const start = startOfDay(parseISO(startDate));
  const today0 = startOfDay(new Date());
  let n = 0;
  for (let i = 1; i <= 120; i += 1) {
    const d = startOfDay(subDays(today0, i));
    if (d < start) break;
    const key = format(d, "yyyy-MM-dd");
    if (checkins[key]?.completed) break;
    n += 1;
  }
  return n;
}
