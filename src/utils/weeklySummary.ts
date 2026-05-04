import { format, parseISO, subDays, differenceInDays } from "date-fns";
import { tr } from "date-fns/locale";
import { CheckinRecord } from "../types";

const DAY_NAMES_SHORT = ["Paz", "Pzt", "Sal", "Çar", "Per", "Cum", "Cmt"] as const;

function daypartForHour(h: number): string {
  if (h >= 6 && h < 12) return "sabah (≈06–12)";
  if (h >= 12 && h < 17) return "öğleden sonra (≈12–17)";
  if (h >= 17 && h < 22) return "akşam (≈17–22)";
  return "gece (≈22–06)";
}

export interface WeeklyDigest {
  completedDays: number;
  missedDaysInWindow: number;
  slipProneWeekdayShort: string | null;
  windowLabel: string;
  /** completedAt olan kayıtlara göre en sık gün içi dilim */
  completionTimePeak: string | null;
  /** Saat önermesi yaklaşık / eksik olduğunda kısa not */
  completionTimeCaveat: string | null;
}

export function isoLocalDate(d: Date): string {
  return format(d, "yyyy-MM-dd");
}

/** Bugünden geriye 7 gün (bugün dahıl); yol başlangıcından önceki günlere yazılmaz. */
export function buildWeeklyDigest(
  startDateISO: string,
  checkins: Record<string, CheckinRecord>
): WeeklyDigest {
  const start = parseISO(startDateISO);
  const windowEnd = new Date();
  const windowStart = subDays(windowEnd, 6);

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
    slipDay != null && slipMax > 0 ? DAY_NAMES_SHORT[slipDay] ?? null : null;

  const windowLabel = `${format(windowStart, "d MMM", { locale: tr })} — ${format(
    windowEnd,
    "d MMMM",
    { locale: tr }
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
    completionTimeCaveat =
      "Bu penceredeki tamamlanan günlerde saat kaydı yok (eski kayıtlar veya sıfırlanan giriş); dilim özeti çıkmıyor.";
  } else if (peakKey != null && peakVal > 0) {
    completionTimePeak = `Tamamlamalarında en sık görülen zaman dilimi: ${peakKey}.`;
    if (withTimestampCount < completedDays) {
      completionTimeCaveat =
        "Bazı tamamlamalarda saat bilgisi yok; dilim özeti yaklaşık bir yerel fotoğraf.";
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
