/**
 * Status hesaplayıcı.
 *  green  → davranış stabil
 *  yellow → düşüş riski
 *  red    → kopuş (müdahale gerekli)
 */

import { format, subDays, parseISO, startOfDay } from "date-fns";
import { UserBehaviorData, Status } from "./types";

export interface StatusResult {
  status: Status;
  reason: string;
  consecutiveMisses: number;
  consecutiveLateChecks: number;
  last3AvgAuto: number | null;
}

function dateKey(d: Date): string {
  return format(d, "yyyy-MM-dd");
}

export function calculateStatus(d: UserBehaviorData): StatusResult {
  const start = startOfDay(parseISO(d.startDate));

  // Dünden geriye doğru ardışık kaçırma
  let misses = 0;
  for (let i = 1; i <= 7; i += 1) {
    const day = startOfDay(subDays(new Date(), i));
    if (day < start) break;
    if (!d.checkins[dateKey(day)]?.completed) misses += 1;
    else break;
  }

  // Ardışık "geç" işaretleme (≥ 20:00)
  let late = 0;
  for (let i = 1; i <= 7; i += 1) {
    const day = startOfDay(subDays(new Date(), i));
    if (day < start) break;
    const c = d.checkins[dateKey(day)];
    if (!c?.completed || !c.completedAt) break;
    const h = new Date(c.completedAt).getHours();
    if (h >= 20) late += 1;
    else break;
  }

  // Son 3 günün ortalama otomatiklik puanı
  const vals: number[] = [];
  for (let i = 1; i <= 3; i += 1) {
    const day = startOfDay(subDays(new Date(), i));
    if (day < start) continue;
    const c = d.checkins[dateKey(day)];
    if (c?.completed && c.automaticityRating != null) {
      vals.push(c.automaticityRating);
    }
  }
  const last3Avg =
    vals.length > 0 ? vals.reduce((a, b) => a + b, 0) / vals.length : null;

  let status: Status = "green";
  let reason = "Davranış stabil. Sistem yolunda.";

  if (misses >= 2) {
    status = "red";
    reason = `${misses} gün üst üste boşluk. Toparlanma modu açıldı.`;
  } else if (last3Avg != null && last3Avg < 4 && late >= 2) {
    status = "red";
    reason = "Otomatiklik düşüyor ve günler geç kalıyor. Müdahale gerekli.";
  } else if (misses === 1) {
    status = "yellow";
    reason = "Dün kaçtı. Sistem seni geri çekiyor — tek küçük adım yeter.";
  } else if (last3Avg != null && last3Avg < 5) {
    status = "yellow";
    reason = "Son 3 günde otomatiklik düşük. Riskli ama düzelir.";
  } else if (late >= 1 && !d.todayDone) {
    status = "yellow";
    reason = "Geç saatlere kayıyor. Bugün erken bir adım iyi olur.";
  } else if (d.todayDone) {
    reason = "Bugün tamam. Kas çalışıyor.";
  }

  return {
    status,
    reason,
    consecutiveMisses: misses,
    consecutiveLateChecks: late,
    last3AvgAuto: last3Avg,
  };
}
