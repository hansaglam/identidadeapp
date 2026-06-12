import type { UserProfile } from "../types";
import type { DisciplineMuscles } from "../types/discipline";
import {
  computeMuscleCompositeScores,
  findSnapshotByWeek,
  previousISOWeekKey,
} from "./disciplineSnapshot";

const MUSCLE_KEYS: (keyof DisciplineMuscles)[] = [
  "karar",
  "direnc",
  "baglam",
  "energi",
  "sosyal",
];

export interface MuscleWeeklyDelta {
  muscle: keyof DisciplineMuscles;
  delta: number;
}

export interface WeeklyMuscleDeltaResult {
  improved: MuscleWeeklyDelta | null;
  declined: MuscleWeeklyDelta | null;
  /** Geçen hafta snapshot var mı — yoksa UI kas satırı göstermez */
  hasBaseline: boolean;
  deltas: MuscleWeeklyDelta[];
}

/**
 * Haftalık kas değişimi = bu hafta composite − geçen hafta snapshot.
 * 7 gün tahmini YOK — yalnızca kayıtlı snapshot.
 */
export function getWeeklyMuscleDeltas(profile: UserProfile): WeeklyMuscleDeltaResult {
  const current = computeMuscleCompositeScores(profile);
  const prevWeekKey = previousISOWeekKey();
  const lastWeek = findSnapshotByWeek(profile.disciplineMuscleSnapshots, prevWeekKey);

  if (!lastWeek) {
    return {
      improved: null,
      declined: null,
      hasBaseline: false,
      deltas: MUSCLE_KEYS.map((muscle) => ({ muscle, delta: 0 })),
    };
  }

  const deltas: MuscleWeeklyDelta[] = MUSCLE_KEYS.map((muscle) => ({
    muscle,
    delta: current[muscle] - lastWeek.scores[muscle],
  }));

  let improved: MuscleWeeklyDelta | null = null;
  let declined: MuscleWeeklyDelta | null = null;

  for (const d of deltas) {
    if (d.delta > 0 && (improved == null || d.delta > improved.delta)) {
      improved = d;
    }
    if (d.delta < 0 && (declined == null || d.delta < declined.delta)) {
      declined = d;
    }
  }

  return {
    improved,
    declined,
    hasBaseline: true,
    deltas,
  };
}
