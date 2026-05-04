import { format, subDays, parseISO, startOfDay } from "date-fns";
import { CheckinRecord } from "../types";

const LATE_AFTER_HOUR = 20; // 20:00'den sonraki check-in = "geç"

/**
 * Son 3 takvim günü (dün, evvelsi, 3. gün) için otomatiklik puanı ortalaması.
 * Puan yoksa o gün dahil edilmez; en az 2 gün puan yoksa null (tetik yok).
 */
export function getLast3DaysAverageAuto(
  startDate: string,
  checkins: Record<string, CheckinRecord>
): number | null {
  const start = startOfDay(parseISO(startDate));
  const vals: number[] = [];
  for (let i = 1; i <= 3; i += 1) {
    const d = startOfDay(subDays(new Date(), i));
    if (d < start) continue;
    const key = format(d, "yyyy-MM-dd");
    const c = checkins[key];
    if (c?.completed && c.automaticityRating != null) {
      vals.push(c.automaticityRating);
    }
  }
  if (vals.length < 3) return null;
  return vals.reduce((a, b) => a + b, 0) / vals.length;
}

/**
 * Üst üste, tamamlanmış günlerde "geç" check-in sayısı.
 * Kırılma: bir gün erken check-in (veya bugün) → sıfırlanır.
 */
export function getConsecutiveLateCheckStreak(
  startDate: string,
  checkins: Record<string, CheckinRecord>
): number {
  const start = startOfDay(parseISO(startDate));
  let streak = 0;
  for (let i = 1; i <= 5; i += 1) {
    const d = startOfDay(subDays(new Date(), i));
    if (d < start) break;
    const key = format(d, "yyyy-MM-dd");
    const c = checkins[key];
    if (!c?.completed || !c.completedAt) break;
    const t = new Date(c.completedAt);
    const h = t.getHours() + t.getMinutes() / 60;
    if (h >= LATE_AFTER_HOUR) streak += 1;
    else break;
  }
  return streak;
}

export type InterventionKind = "low_motivation_protocol" | null;

export function evaluateProactiveIntervention(
  startDate: string,
  checkins: Record<string, CheckinRecord>
): { trigger: InterventionKind; last3Avg: number | null; lateStreak: number } {
  const last3Avg = getLast3DaysAverageAuto(startDate, checkins);
  const lateStreak = getConsecutiveLateCheckStreak(startDate, checkins);
  if (last3Avg != null && last3Avg < 4 && lateStreak >= 2) {
    return { trigger: "low_motivation_protocol", last3Avg, lateStreak };
  }
  return { trigger: null, last3Avg, lateStreak };
}

/** Son N takvim günü (bugün hariç, dün=1) — yolculuk başlangıcından itibaren. */
export type DailyCheckinLog = {
  date: string;
  completed: boolean;
  automaticityRating: number | null;
};

export function getLastKCalendarDaysBeforeToday(
  startDate: string,
  checkins: Record<string, CheckinRecord>,
  k: number
): DailyCheckinLog[] {
  const start = startOfDay(parseISO(startDate));
  const out: DailyCheckinLog[] = [];
  for (let i = 1; i <= k; i += 1) {
    const d = startOfDay(subDays(new Date(), i));
    if (d < start) continue;
    const key = format(d, "yyyy-MM-dd");
    const c = checkins[key];
    out.push({
      date: key,
      completed: c?.completed ?? false,
      automaticityRating: c?.automaticityRating ?? null,
    });
  }
  return out;
}

/**
 * “Düşmeden önce” v2: ilk 7 yol günü kalibrasyon (tetikleme yok).
 * Bugün tamamlanmadıysa; son 3 günde düşük otomatiklik veya tutarsızlık.
 */
export function shouldTriggerProactiveIntervention(
  startDate: string,
  checkins: Record<string, CheckinRecord>,
  journeyDayNumber: number,
  todayDone: boolean
): boolean {
  if (journeyDayNumber < 7 || todayDone) return false;

  const last3 = getLastKCalendarDaysBeforeToday(startDate, checkins, 3);
  if (last3.length < 2) return false;

  const missedCount = last3.filter((l) => !l.completed).length;
  const rated = last3.filter((l) => l.completed && l.automaticityRating != null);
  const avgAuto =
    rated.length > 0
      ? rated.reduce((s, l) => s + (l.automaticityRating ?? 0), 0) / rated.length
      : null;

  if (missedCount >= 1) return true;
  if (avgAuto != null && avgAuto < 5 && rated.length >= 2) return true;
  return false;
}
