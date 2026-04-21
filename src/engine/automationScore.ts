/**
 * Otomatikleşme skoru (0–100).
 *
 * Bileşenler:
 *  - Ortalama otomatiklik puanı (50%)
 *  - Son 14 gün tutarlılık (30%)
 *  - Toparlanma başarısı (20%)
 */

import { format, subDays, parseISO, startOfDay } from "date-fns";
import { UserBehaviorData } from "./types";

export function calculateAutomationScore(d: UserBehaviorData): number {
  // 1) Ortalama otomatiklik
  const ratings = Object.values(d.checkins)
    .filter((c) => c.completed && c.automaticityRating != null)
    .map((c) => c.automaticityRating!);
  const avgAuto =
    ratings.length > 0 ? ratings.reduce((a, b) => a + b, 0) / ratings.length : 0;
  const autoPct = (avgAuto / 10) * 100;

  // 2) Son 14 gün tutarlılık
  const start = startOfDay(parseISO(d.startDate));
  let done = 0;
  let total = 0;
  for (let i = 0; i < 14; i += 1) {
    const day = startOfDay(subDays(new Date(), i));
    if (day < start) continue;
    total += 1;
    const key = format(day, "yyyy-MM-dd");
    if (d.checkins[key]?.completed) done += 1;
  }
  const consistencyPct = total > 0 ? (done / total) * 100 : 0;

  // 3) Toparlanma başarısı: kaçırılan günlerin kaçı 2 gün içinde geri kazanıldı?
  const sortedDates = Object.keys(d.checkins).sort();
  let attempts = 0;
  let recovered = 0;
  for (let i = 0; i < sortedDates.length; i += 1) {
    const c = d.checkins[sortedDates[i]!];
    if (!c?.completed) {
      attempts += 1;
      for (let j = i + 1; j <= i + 2 && j < sortedDates.length; j += 1) {
        if (d.checkins[sortedDates[j]!]?.completed) {
          recovered += 1;
          break;
        }
      }
    }
  }
  const recoveryPct = attempts > 0 ? (recovered / attempts) * 100 : 100;

  const score = autoPct * 0.5 + consistencyPct * 0.3 + recoveryPct * 0.2;
  return Math.max(0, Math.min(100, Math.round(score)));
}
