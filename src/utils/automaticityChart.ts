import {
  format,
  subDays,
  startOfDay,
  parseISO,
} from "date-fns";
import { CheckinRecord } from "../types";

export type AutomaticityChartPoint = {
  dateKey: string;
  calendarDay: number;
  /** 1–10 veya veri yok */
  value: number | null;
};

/** Bugünden geriye `numDays` gün (bugün dahil, soldan sağa eski → yeni). Yolculuk öncesi günler value: null. */
export function buildAutomaticitySeriesLastDays(
  startDate: string,
  checkins: Record<string, CheckinRecord>,
  numDays: number
): AutomaticityChartPoint[] {
  const start = startOfDay(parseISO(startDate));
  const out: AutomaticityChartPoint[] = [];
  for (let i = numDays - 1; i >= 0; i -= 1) {
    const d = startOfDay(subDays(new Date(), i));
    const dateKey = format(d, "yyyy-MM-dd");
    if (d < start) {
      out.push({ dateKey, calendarDay: d.getDate(), value: null });
      continue;
    }
    const c = checkins[dateKey];
    const v =
      c?.completed && c.automaticityRating != null
        ? Math.min(10, Math.max(1, Math.round(c.automaticityRating)))
        : null;
    out.push({ dateKey, calendarDay: d.getDate(), value: v });
  }
  return out;
}

export function countSeriesPointsWithValue(series: AutomaticityChartPoint[]): number {
  return series.filter((p) => p.value != null).length;
}
