import { addDays, format, parseISO } from "date-fns";
import { tr } from "date-fns/locale";
import type { CheckinRecord } from "../types";
import type { TomorrowTodoList } from "../store/tomorrowPlanStore";

export type JourneyDayStatus = "done" | "missed" | "future" | "today" | "before_start";

export interface JourneyDayDetail {
  day: number;
  dateISO: string;
  dateLabel: string;
  status: JourneyDayStatus;
  lines: string[];
}

export function isoDateForJourneyDay(startDateISO: string, day: number): string {
  const start = parseISO(startDateISO);
  return format(addDays(start, Math.max(0, day - 1)), "yyyy-MM-dd");
}

export function buildJourneyDayDetail(
  startDateISO: string,
  day: number,
  currentDayNumber: number,
  checkins: Record<string, CheckinRecord>,
  listsByDate: Record<string, TomorrowTodoList> = {}
): JourneyDayDetail {
  const dateISO = isoDateForJourneyDay(startDateISO, day);
  let dateLabel: string;
  try {
    dateLabel = format(parseISO(dateISO), "d MMMM yyyy, EEEE", { locale: tr });
  } catch {
    dateLabel = `Gün ${day}`;
  }

  const rec = checkins[dateISO];
  const done = rec?.completed === true;

  let status: JourneyDayStatus;
  if (day > currentDayNumber && currentDayNumber <= 66) {
    status = "future";
  } else if (day > 66 || currentDayNumber > 66) {
    status = day <= currentDayNumber && !done ? "missed" : done ? "done" : "future";
  } else if (day === currentDayNumber) {
    status = done ? "done" : "today";
  } else if (done) {
    status = "done";
  } else {
    status = "missed";
  }

  const lines: string[] = [`Gün ${day} / 66`];

  if (status === "future") {
    lines.push("Bu gün henüz gelmedi.");
    return { day, dateISO, dateLabel, status, lines };
  }

  if (status === "today" && !done) {
    lines.push("Bugün — check-in veya mikro adım bekliyor.");
    return { day, dateISO, dateLabel, status, lines };
  }

  if (!done) {
    lines.push("Check-in yapılmadı.");
    return { day, dateISO, dateLabel, status, lines };
  }

  lines.push("Check-in tamamlandı.");
  if (rec?.automaticityRating != null) {
    lines.push(`Otomatiklik: ${rec.automaticityRating}/10`);
  }
  if (rec?.effortRating != null) {
    lines.push(`Çaba: ${rec.effortRating}/10`);
  }
  if (rec?.completedAt) {
    try {
      const t = format(parseISO(rec.completedAt), "HH:mm", { locale: tr });
      lines.push(`Saat: ${t}`);
    } catch {
      /* skip */
    }
  }
  if (rec?.checkInNote) {
    lines.push(`Not: ${rec.checkInNote}`);
  }
  if (rec?.checkInDetail?.trim()) {
    lines.push(`Detay: ${rec.checkInDetail.trim()}`);
  }

  const dayPlan = listsByDate[dateISO]?.items ?? [];
  const primary = dayPlan.find((i) => i.isPrimary) ?? dayPlan[0];
  if (primary?.text) {
    lines.push(`Plan (o gün): ${primary.text}`);
  }

  return { day, dateISO, dateLabel, status, lines };
}
