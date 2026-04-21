/**
 * Tahmin sistemi.
 * Otomatik davranışa kaç gün kaldığını lineer regresyonla tahmin eder.
 *
 * Hedef: ortalama otomatiklik puanının 8'e ulaşması (Lally tarzı proxy).
 */

import { format, parseISO, addDays } from "date-fns";
import { UserBehaviorData } from "./types";

const TARGET_AUTO = 8;
const MAX_DAYS = 120;

export function calculatePredictionDays(d: UserBehaviorData): number {
  const pts: { x: number; y: number }[] = [];
  for (let day = 1; day <= d.dayNumber; day += 1) {
    const date = format(addDays(parseISO(d.startDate), day - 1), "yyyy-MM-dd");
    const c = d.checkins[date];
    if (c?.completed && c.automaticityRating != null) {
      pts.push({ x: day, y: c.automaticityRating });
    }
  }

  const fallback = Math.max(0, 66 - d.dayNumber);

  if (pts.length < 3) return fallback;

  const n = pts.length;
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
  if (Math.abs(den) < 1e-9) return fallback;

  const b = (n * sumXY - sumX * sumY) / den;
  const a = (sumY - b * sumX) / n;

  // Eğim hemen hemen düz veya negatifse — tahmin yapma
  if (b <= 0.01) {
    if (a >= TARGET_AUTO) return 0;
    return fallback;
  }

  const targetDay = (TARGET_AUTO - a) / b;
  const daysFromNow = Math.round(targetDay - d.dayNumber);
  return Math.max(0, Math.min(MAX_DAYS, daysFromNow));
}
