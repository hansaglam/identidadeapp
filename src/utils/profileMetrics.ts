import { format, subDays, startOfDay, parseISO } from "date-fns";
import { CheckinRecord } from "../types";
import { buildLast14Days } from "./journeyHome";

function journeyDayToDateStr(startDate: string, journeyDay: number): string {
  const start = parseISO(startDate);
  const d = new Date(
    start.getFullYear(),
    start.getMonth(),
    start.getDate() + journeyDay - 1
  );
  return format(d, "yyyy-MM-dd");
}

/** İlk 14 yol gününde kaç gün otomatiklik puanı var (Lally için). */
export function countFirst14AutomationRatings(
  startDate: string,
  checkins: Record<string, CheckinRecord>
): number {
  let n = 0;
  for (let day = 1; day <= 14; day += 1) {
    const key = journeyDayToDateStr(startDate, day);
    const c = checkins[key];
    if (c?.completed && c.automaticityRating != null) n += 1;
  }
  return n;
}

/** Lally-tarzı: ilk 14 gündeki otomatiklik puanlarına doğrusal regresyon; eşik 7. */
export interface LinearAutomationEstimate {
  slopePerDay: number;
  /** Regresyon ile 7+ puanın öngörüldüğü yolculuk günü (1–66 sınırı) */
  predictedDayAt7: number | null;
  sampleSize: number;
}

/**
 * İlk 14 yol gününde (en az 3 puan gerekir) en küçük kareler doğrusu.
 * y ≈ a + b·gün; b = eğim/gün. Hedef 7 için gün = (7-a)/b.
 */
export function estimateAutomationFromFirst14Linear(
  startDate: string,
  checkins: Record<string, CheckinRecord>
): LinearAutomationEstimate | null {
  const pts: { x: number; y: number }[] = [];
  for (let day = 1; day <= 14; day += 1) {
    const key = journeyDayToDateStr(startDate, day);
    const c = checkins[key];
    if (c?.completed && c.automaticityRating != null) {
      pts.push({ x: day, y: c.automaticityRating });
    }
  }
  const n = pts.length;
  if (n < 3) return null;
  let sumX = 0;
  let sumY = 0;
  let sumXY = 0;
  let sumX2 = 0;
  pts.forEach(({ x, y }) => {
    sumX += x;
    sumY += y;
    sumXY += x * y;
    sumX2 += x * x;
  });
  const den = n * sumX2 - sumX * sumX;
  if (Math.abs(den) < 1e-9) return null;
  const b = (n * sumXY - sumX * sumY) / den;
  const a = (sumY - b * sumX) / n;
  let predictedDayAt7: number | null = null;
  if (b > 0.01) {
    const raw = (7 - a) / b;
    predictedDayAt7 = Math.round(Math.min(66, Math.max(15, raw)));
  } else if (b >= 0 && a >= 7) {
    predictedDayAt7 = 15;
  }
  return { slopePerDay: b, predictedDayAt7, sampleSize: n };
}

/** Tüm kayıtlı günlerde otomatiklik ortalaması (1–10), veri yoksa null. */
export function getAverageAutomaticity(
  checkins: Record<string, CheckinRecord>
): number | null {
  const vals = Object.values(checkins)
    .filter((r) => r.completed && r.automaticityRating != null)
    .map((r) => r.automaticityRating!);
  if (vals.length === 0) return null;
  return vals.reduce((a, b) => a + b, 0) / vals.length;
}

/** Son 14 gün: tamamlanan gün / 14 */
export function getLast14ConsistencyPercent(
  startDate: string,
  checkins: Record<string, CheckinRecord>
): number {
  const d = buildLast14Days(startDate, checkins);
  const n = d.filter((x) => x.completed).length;
  return Math.round((n / 14) * 100);
}

/**
 * Son 14 günde, puanı kayıtlı günler içinde 7+ otomatiklik olanların oranı.
 */
export function getLast14AutoTrendPercent(
  startDate: string,
  checkins: Record<string, CheckinRecord>
): number | null {
  const start = startOfDay(parseISO(startDate));
  let withRating = 0;
  let high = 0;
  for (let i = 13; i >= 0; i -= 1) {
    const d = startOfDay(subDays(new Date(), i));
    if (d < start) continue;
    const key = format(d, "yyyy-MM-dd");
    const c = checkins[key];
    if (!c?.completed || c.automaticityRating == null) continue;
    withRating += 1;
    if (c.automaticityRating >= 7) high += 1;
  }
  if (withRating === 0) return null;
  return Math.round((high / withRating) * 100);
}

/**
 * Ort. otomatiklik > 7 ise, tam otomasyona yaklaşma için tahmini 66 içi gün.
 * Basit ileri projeksiyon: düşük kalan 66-dayNumber, ortalamaya göre kısaltılır.
 */
export function getEstimatedAutomationJourneyDay(
  currentDay: number,
  averageAutomaticity: number | null
): number | null {
  if (averageAutomaticity == null || averageAutomaticity <= 7) return null;
  const remaining = 66 - currentDay;
  if (remaining <= 0) return 66;
  // avg 7-10: daha yüksek = daha kısa ek süre
  const boost = Math.max(0, (averageAutomaticity - 7) / 3);
  const add = Math.max(0, Math.round(remaining * (1 - boost * 0.35)));
  return Math.min(66, currentDay + Math.max(1, add));
}
