import { CheckinRecord } from "../types";
import { evaluateProactiveIntervention } from "./interventionEngine";
import { isMissedYesterday } from "./journeyHome";
import { estimateAutomationFromFirst14Linear, getAverageAutomaticity } from "./profileMetrics";

export type DisciplineSurfaceStatus = "on_track" | "at_risk" | "needs_intervention";

export interface DisciplineSurfaceLine {
  status: DisciplineSurfaceStatus;
  headline: string;
  detail: string;
}

/**
 * Uygulama dışı yüzeyler (widget / Live Activity) için kısa metinler.
 * Aynı mantık uygulama içi özetlerde de kullanılabilir.
 */
export function getDisciplineSurfaceLine(
  startDate: string,
  dayNumber: number,
  checkins: Record<string, CheckinRecord>,
  todayDone: boolean
): DisciplineSurfaceLine {
  const { trigger, last3Avg, lateStreak } = evaluateProactiveIntervention(
    startDate,
    checkins
  );
  if (trigger && !todayDone) {
    return {
      status: "needs_intervention",
      headline: "Müdahale gerekli",
      detail: "Otomatiklik düşüyor ve günler geç kalıyor. 5 sn antrenman.",
    };
  }
  const missedY = isMissedYesterday(startDate, checkins);
  if (!todayDone && (missedY || (last3Avg != null && last3Avg < 5) || lateStreak > 0)) {
    return {
      status: "at_risk",
      headline: "Riskli gün",
      detail: "Disiplin hattı sarıda. Bugünkü adımı küçük tut.",
    };
  }
  return {
    status: "on_track",
    headline: "Yoldasın",
    detail: "Disiplin hattı yeşil. Ritmi koru.",
  };
}

export function getWidgetSubline(
  startDate: string,
  dayNumber: number,
  checkins: Record<string, CheckinRecord>
): string {
  const avg = getAverageAutomaticity(checkins);
  const pct = avg == null ? null : Math.min(100, Math.round((avg / 10) * 100));
  const reg = estimateAutomationFromFirst14Linear(startDate, checkins);
  const parts: string[] = [];
  if (pct != null) parts.push(`Otomatiklik ~%${pct}`);
  if (dayNumber >= 14 && reg?.predictedDayAt7) {
    parts.push(`Tahmini otomatikleşme: Gün ${reg.predictedDayAt7}`);
  } else if (dayNumber < 14) {
    parts.push(`Gün 14'te kişisel tahmin açılır`);
  }
  return parts.join(" · ");
}
