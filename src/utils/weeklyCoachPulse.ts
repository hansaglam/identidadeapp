/**
 * Haftalık koç nabzı — veriden 2–4 cümlelik hikâye (kişisel metin yok).
 */

import i18n from "../i18n/config";
import { buildWeeklyDigest } from "./weeklySummary";
import { getAverageAutomaticity } from "./profileMetrics";
import type { CheckinRecord } from "../types";
import type { SDTScore } from "../types";
import type { RecentAction, MuscleType } from "../engine";

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

function muscleLabel(type: MuscleType): string {
  const key = `home.muscle.${type}`;
  const v = i18n.t(key);
  return v === key ? type : v;
}

export function buildWeeklyCoachPulse(input: WeeklyCoachPulseInput): WeeklyCoachPulse {
  const digest = buildWeeklyDigest(input.startDate, input.checkins);
  const avgAuto = getAverageAutomaticity(input.checkins);
  const autoPct = avgAuto != null ? Math.round((avgAuto / 10) * 100) : null;
  const h = input.habitName.trim() || i18n.t("home.coachPulse.defaultHabit");
  const muscle = dominantMuscle(input.recentActions);

  const lines: string[] = [
    i18n.t("home.coachPulse.line.completedDays", { done: digest.completedDays }),
  ];

  if (autoPct != null) {
    lines.push(i18n.t("home.coachPulse.line.autoAvg", { pct: autoPct }));
  }

  if (input.currentStreak >= 3) {
    lines.push(i18n.t("home.coachPulse.line.streak", { count: input.currentStreak }));
  } else if (digest.missedDaysInWindow >= 2) {
    lines.push(
      i18n.t("home.coachPulse.line.missed", { count: digest.missedDaysInWindow })
    );
  }

  if (digest.completionTimePeak) {
    lines.push(digest.completionTimePeak);
  }

  if (input.latestSdt) {
    const { autonomy, competence, relatedness } = input.latestSdt;
    const low = [
      autonomy <= 2 ? i18n.t("home.coachPulse.dim.autonomy") : null,
      competence <= 2 ? i18n.t("home.coachPulse.dim.competence") : null,
      relatedness <= 2 ? i18n.t("home.coachPulse.dim.relatedness") : null,
    ].filter(Boolean);
    if (low.length > 0) {
      lines.push(
        i18n.t("home.coachPulse.line.sdtLow", { dims: low.join(", ") })
      );
    } else if (autonomy >= 4 && competence >= 4) {
      lines.push(i18n.t("home.coachPulse.line.sdtStrong"));
    }
  }

  if (muscle) {
    lines.push(
      i18n.t("home.coachPulse.line.muscle", { muscle: muscleLabel(muscle) })
    );
  }

  let suggestion = i18n.t("home.coachPulse.suggestion.default", { habit: h });
  if (digest.missedDaysInWindow >= 2) {
    suggestion = i18n.t("home.coachPulse.suggestion.missed");
  } else if (digest.slipProneWeekdayShort) {
    suggestion = i18n.t("home.coachPulse.suggestion.slipDay", {
      day: digest.slipProneWeekdayShort,
    });
  } else if (input.dayNumber <= 22) {
    suggestion = i18n.t("home.coachPulse.suggestion.phase1");
  }

  const headline =
    digest.completedDays >= 5
      ? i18n.t("home.coachPulse.headline.strong")
      : digest.completedDays >= 3
      ? i18n.t("home.coachPulse.headline.balanced")
      : i18n.t("home.coachPulse.headline.recovery");

  return { headline, lines: lines.slice(0, 4), suggestion };
}
