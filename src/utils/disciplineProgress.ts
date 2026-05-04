import type { DisciplineMuscles } from "../types/discipline";
import type { Action, MuscleType } from "../engine/types";

export const DISCIPLINE_XP_PER_LEVEL = 100;
export const DISCIPLINE_MAX_LEVEL = 50;

export const DISCIPLINE_DEFAULT_LEVELS: DisciplineMuscles = {
  karar: 1,
  direnc: 1,
  baglam: 1,
  energi: 1,
  sosyal: 1,
};

export const DISCIPLINE_DEFAULT_XP: DisciplineMuscles = {
  karar: 0,
  direnc: 0,
  baglam: 0,
  energi: 0,
  sosyal: 0,
};

/** Davranış motoru kası → profil disiplin kası */
export const ENGINE_MUSCLE_TO_DISCIPLINE: Record<MuscleType, keyof DisciplineMuscles> = {
  activation: "karar",
  consistency: "baglam",
  resistance: "direnc",
  focus: "energi",
  recovery: "karar",
};

export function xpForLiveAction(action: Action): number {
  switch (action.intensity) {
    case "high":
      return 22;
    case "medium":
      return 15;
    default:
      return 10;
  }
}

/**
 * Tek kasa XP ekler; 100 XP = 1 seviye (max DISCIPLINE_MAX_LEVEL).
 */
export function addXpToDisciplineState(
  levels: DisciplineMuscles,
  xp: DisciplineMuscles,
  muscle: keyof DisciplineMuscles,
  amount: number
): { levels: DisciplineMuscles; xp: DisciplineMuscles } {
  if (amount <= 0) return { levels: { ...levels }, xp: { ...xp } };

  const nextLevels = { ...levels };
  const nextXp = { ...xp };
  let curXp = nextXp[muscle] + Math.round(amount);
  let lv = nextLevels[muscle];

  while (curXp >= DISCIPLINE_XP_PER_LEVEL && lv < DISCIPLINE_MAX_LEVEL) {
    curXp -= DISCIPLINE_XP_PER_LEVEL;
    lv++;
  }

  if (lv >= DISCIPLINE_MAX_LEVEL) {
    lv = DISCIPLINE_MAX_LEVEL;
    curXp = Math.min(curXp, DISCIPLINE_XP_PER_LEVEL - 1);
  }

  nextXp[muscle] = curXp;
  nextLevels[muscle] = lv;
  return { levels: nextLevels, xp: nextXp };
}
