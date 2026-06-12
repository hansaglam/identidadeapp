import {
  format,
  isBefore,
  parseISO,
  startOfDay,
  subDays,
} from "date-fns";
import type { CheckinRecord, UserProfile } from "../types";
import type { DisciplineMuscles } from "../types/discipline";
import {
  DISCIPLINE_DEFAULT_LEVELS,
  DISCIPLINE_MAX_LEVEL,
} from "./disciplineProgress";
import {
  computeResilienceStats,
  filterCheckinsUntil,
  type ResilienceStats,
} from "./resilienceStats";

const MUSCLE_KEYS: (keyof DisciplineMuscles)[] = [
  "karar",
  "direnc",
  "baglam",
  "energi",
  "sosyal",
];

const WEIGHT_MUSCLE = 0.5;
const WEIGHT_CONSISTENCY = 0.35;
const WEIGHT_RESILIENCE = 0.15;

export interface DisciplineScoreComponents {
  muscle: number;
  consistency: number;
  resilience: number;
}

export interface DisciplineScoreResult {
  score: number;
  weeklyDelta: number;
  components: DisciplineScoreComponents;
  nextMilestone: number | null;
  remainingToMilestone: number;
  atMax: boolean;
}

function muscleGrowthScore(muscles: DisciplineMuscles): number {
  if (DISCIPLINE_MAX_LEVEL <= 1) return 0;
  const sum = MUSCLE_KEYS.reduce((acc, key) => {
    const lv = Math.max(1, Math.min(DISCIPLINE_MAX_LEVEL, muscles[key]));
    return acc + ((lv - 1) / (DISCIPLINE_MAX_LEVEL - 1)) * 100;
  }, 0);
  return sum / MUSCLE_KEYS.length;
}

function consistencyLast7(
  startDate: string,
  checkins: Record<string, CheckinRecord>,
  asOf: Date
): number {
  const start = startOfDay(parseISO(startDate));
  const end = startOfDay(asOf);
  let valid = 0;
  let completed = 0;

  for (let i = 0; i < 7; i += 1) {
    const d = subDays(end, i);
    if (isBefore(d, start)) continue;
    valid += 1;
    const key = format(d, "yyyy-MM-dd");
    if (checkins[key]?.completed === true) completed += 1;
  }

  if (valid === 0) return 0;
  return (completed / valid) * 100;
}

function resilienceComponentScore(resilience: ResilienceStats): number {
  if (resilience.status === "untested" || resilience.comebackRate == null) {
    return 0;
  }
  return resilience.comebackRate * resilience.experienceMultiplier;
}

function resolveMilestone(score: number): {
  nextMilestone: number | null;
  remainingToMilestone: number;
  atMax: boolean;
} {
  if (score >= 100) {
    return { nextMilestone: null, remainingToMilestone: 0, atMax: true };
  }
  let next = Math.ceil(score / 10) * 10;
  if (next <= score) next += 10;
  if (next > 100) next = 100;
  return {
    nextMilestone: next,
    remainingToMilestone: next - score,
    atMax: false,
  };
}

function computeRawScore(
  profile: UserProfile,
  checkins: Record<string, CheckinRecord>,
  asOf: Date
): { score: number; components: DisciplineScoreComponents } {
  const muscles = profile.disciplineMuscles ?? DISCIPLINE_DEFAULT_LEVELS;
  const muscle = muscleGrowthScore(muscles);
  const consistency = consistencyLast7(profile.startDate, checkins, asOf);
  const resilienceStats = computeResilienceStats(profile.startDate, checkins, asOf);
  const resilience = resilienceComponentScore(resilienceStats);

  const raw =
    muscle * WEIGHT_MUSCLE +
    consistency * WEIGHT_CONSISTENCY +
    resilience * WEIGHT_RESILIENCE;

  return {
    score: Math.min(100, Math.max(0, Math.round(raw))),
    components: {
      muscle: Math.round(muscle),
      consistency: Math.round(consistency),
      resilience: Math.round(resilience),
    },
  };
}

export function computeDisciplineScore(
  profile: UserProfile,
  checkins: Record<string, CheckinRecord>,
  asOf: Date = new Date()
): DisciplineScoreResult {
  const { score, components } = computeRawScore(profile, checkins, asOf);
  const weekAgoCheckins = filterCheckinsUntil(checkins, subDays(asOf, 7));
  const scoreWeekAgo = computeRawScore(profile, weekAgoCheckins, subDays(asOf, 7)).score;
  const milestone = resolveMilestone(score);

  return {
    score,
    weeklyDelta: score - scoreWeekAgo,
    components,
    ...milestone,
  };
}
