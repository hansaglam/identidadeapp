import { endOfWeek, subWeeks } from "date-fns";
import type { CheckinRecord, UserProfile } from "../types";
import { computeDisciplineScore } from "./disciplineScore";
import { computeResilienceStats, filterCheckinsUntil } from "./resilienceStats";
import { buildWeeklyDigest } from "./weeklySummary";
import { getWeeklyMuscleDeltas, type WeeklyMuscleDeltaResult } from "./weeklyMuscleDelta";

export interface WeeklyGrowthReport {
  disciplineDelta: number;
  completedDays: number;
  completedDenom: number;
  comebacksThisWeek: number;
  muscleDelta: WeeklyMuscleDeltaResult;
  windowLabel: string;
}

function endOfPreviousISOWeek(asOf: Date = new Date()): Date {
  const prevWeekEnd = endOfWeek(subWeeks(asOf, 1), { weekStartsOn: 1 });
  return prevWeekEnd;
}

/** Bu ISO haftasında yeni geri dönüş sayısı */
function comebacksThisWeek(
  startDate: string,
  checkins: Record<string, CheckinRecord>,
  asOf: Date = new Date()
): number {
  const nowStats = computeResilienceStats(startDate, checkins, asOf);
  const prevWeekEnd = endOfPreviousISOWeek(asOf);
  const prevCheckins = filterCheckinsUntil(checkins, prevWeekEnd);
  const prevStats = computeResilienceStats(startDate, prevCheckins, prevWeekEnd);
  return Math.max(0, nowStats.comebacks - prevStats.comebacks);
}

export function buildWeeklyGrowthReport(
  profile: UserProfile,
  checkins: Record<string, CheckinRecord>
): WeeklyGrowthReport {
  const digest = buildWeeklyDigest(profile.startDate, checkins);
  const discipline = computeDisciplineScore(profile, checkins);
  const muscleDelta = getWeeklyMuscleDeltas(profile);

  return {
    disciplineDelta: discipline.weeklyDelta,
    completedDays: digest.completedDays,
    completedDenom: 7,
    comebacksThisWeek: comebacksThisWeek(profile.startDate, checkins),
    muscleDelta,
    windowLabel: digest.windowLabel,
  };
}
