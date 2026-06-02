/**
 * Haftalık koç nabzı — veriden 2–4 cümlelik hikâye (kişisel metin yok).
 */

import { buildWeeklyDigest } from "./weeklySummary";
import { getAverageAutomaticity } from "./profileMetrics";
import type { CheckinRecord } from "../types";
import type { SDTScore } from "../types";
import type { RecentAction } from "../engine";
import { MUSCLE_LABELS, type MuscleType } from "../engine";

export interface WeeklyCoachPulseInput {
  startDate: string;
  checkins: Record<string, CheckinRecord>;
  habitName: string;
  dayNumber: number;
  currentStreak: number;
  recentActions: RecentAction[];
  latestSdt: SDTScore | null;
}

export interface WeeklyCoachPulse {
  headline: string;
  lines: string[];
  suggestion: string;
}

function dominantMuscle(recent: RecentAction[]): MuscleType | null {
  if (recent.length === 0) return null;
  const counts: Partial<Record<MuscleType, number>> = {};
  const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  for (const r of recent) {
    try {
      if (new Date(r.at).getTime() < weekAgo) continue;
      counts[r.type] = (counts[r.type] ?? 0) + 1;
    } catch {
      /* skip */
    }
  }
  const ranked = (Object.entries(counts) as [MuscleType, number][]).sort((a, b) => b[1] - a[1]);
  return ranked[0]?.[0] ?? null;
}

export function buildWeeklyCoachPulse(input: WeeklyCoachPulseInput): WeeklyCoachPulse {
  const digest = buildWeeklyDigest(input.startDate, input.checkins);
  const avgAuto = getAverageAutomaticity(input.checkins);
  const autoPct = avgAuto != null ? Math.round((avgAuto / 10) * 100) : null;
  const h = input.habitName.trim() || "alışkanlığın";
  const muscle = dominantMuscle(input.recentActions);

  const lines: string[] = [
    `Son 7 günde ${digest.completedDays}/7 gün tamamlandı.`,
  ];

  if (autoPct != null) {
    lines.push(`Otomatiklik ortalaman yaklaşık %${autoPct}.`);
  }

  if (input.currentStreak >= 3) {
    lines.push(`${input.currentStreak} günlük seri devam ediyor — momentum korunuyor.`);
  } else if (digest.missedDaysInWindow >= 2) {
    lines.push(
      `${digest.missedDaysInWindow} gün kaçırıldı; bu hafta küçültme ve tek çapa öncelikli.`
    );
  }

  if (digest.completionTimePeak) {
    lines.push(digest.completionTimePeak);
  }

  if (input.latestSdt) {
    const { autonomy, competence, relatedness } = input.latestSdt;
    const low = [
      autonomy <= 2 ? "özerklik" : null,
      competence <= 2 ? "yetkinlik" : null,
      relatedness <= 2 ? "bağlanma" : null,
    ].filter(Boolean);
    if (low.length > 0) {
      lines.push(
        `SDT: ${low.join(", ")} düşük — alışkanlığı “zorunluluk” değil “seçim” gibi çerçevele.`
      );
    } else if (autonomy >= 4 && competence >= 4) {
      lines.push("SDT: özerklik ve yetkinlik güçlü — bu hafta aynı tempoda devam et.");
    }
  }

  if (muscle) {
    lines.push(`Son mikro adımların çoğu “${MUSCLE_LABELS[muscle]}” kasına dokundu.`);
  }

  let suggestion = `Bugün ${h} için tek net mikro adım seç; check-in öncesi 30 sn yeter.`;
  if (digest.missedDaysInWindow >= 2) {
    suggestion = "Yarın planına sadece 2 dk sürüm yaz; sabah hatırlatma ile başla.";
  } else if (digest.slipProneWeekdayShort) {
    suggestion = `${digest.slipProneWeekdayShort} günlerinde çapayı görünür kıl — hatırlatıcı veya not.`;
  } else if (input.dayNumber <= 22) {
    suggestion = "Kuruluş fazındasın: mükemmel değil, tekrar. Bugünkü adımı küçük tut.";
  }

  const headline =
    digest.completedDays >= 5
      ? "Güçlü hafta"
      : digest.completedDays >= 3
      ? "Dengeli hafta"
      : "Toparlanma haftası";

  return { headline, lines: lines.slice(0, 4), suggestion };
}
