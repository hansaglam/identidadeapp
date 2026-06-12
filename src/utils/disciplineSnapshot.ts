import { format, getISOWeek, getISOWeekYear, subWeeks } from "date-fns";
import type { DisciplineMuscleSnapshot, UserProfile } from "../types";
import type { DisciplineMuscles } from "../types/discipline";

export type { DisciplineMuscleSnapshot };
import {
  DISCIPLINE_DEFAULT_LEVELS,
  DISCIPLINE_DEFAULT_XP,
  DISCIPLINE_XP_PER_LEVEL,
} from "./disciplineProgress";

export const MAX_DISCIPLINE_SNAPSHOT_WEEKS = 16;

export function currentISOWeekKey(date: Date = new Date()): string {
  const week = getISOWeek(date);
  const year = getISOWeekYear(date);
  return `${year}-W${String(week).padStart(2, "0")}`;
}

export function previousISOWeekKey(date: Date = new Date()): string {
  return currentISOWeekKey(subWeeks(date, 1));
}

/** Tek kas composite: level içi XP + seviye katkısı */
export function muscleCompositeScore(
  level: number,
  xp: number
): number {
  const lv = Math.max(1, level);
  const curXp = Math.max(0, Math.min(DISCIPLINE_XP_PER_LEVEL - 1, xp));
  return (lv - 1) * DISCIPLINE_XP_PER_LEVEL + curXp;
}

export function computeMuscleCompositeScores(profile: UserProfile): DisciplineMuscles {
  const levels = {
    ...DISCIPLINE_DEFAULT_LEVELS,
    ...profile.disciplineMuscles,
  };
  const xp = {
    ...DISCIPLINE_DEFAULT_XP,
    ...profile.disciplineMuscleXp,
  };
  return {
    karar: muscleCompositeScore(levels.karar, xp.karar),
    direnc: muscleCompositeScore(levels.direnc, xp.direnc),
    baglam: muscleCompositeScore(levels.baglam, xp.baglam),
    energi: muscleCompositeScore(levels.energi, xp.energi),
    sosyal: muscleCompositeScore(levels.sosyal, xp.sosyal),
  };
}

export function findSnapshotByWeek(
  snapshots: DisciplineMuscleSnapshot[] | undefined,
  weekKey: string
): DisciplineMuscleSnapshot | undefined {
  return (snapshots ?? []).find((s) => s.weekKey === weekKey);
}

function pruneSnapshots(weeks: DisciplineMuscleSnapshot[]): DisciplineMuscleSnapshot[] {
  if (weeks.length <= MAX_DISCIPLINE_SNAPSHOT_WEEKS) return weeks;
  return [...weeks]
    .sort((a, b) => a.weekKey.localeCompare(b.weekKey))
    .slice(-MAX_DISCIPLINE_SNAPSHOT_WEEKS);
}

/**
 * Bu haftanın güncel composite skorunu kaydeder (üzerine yazar).
 * Geçmiş haftalar korunur — haftalık delta = bu hafta vs geçen hafta snapshot.
 */
export function ensureDisciplineSnapshots(
  profile: UserProfile,
  asOf: Date = new Date()
): Pick<UserProfile, "disciplineMuscleSnapshots" | "disciplineSnapshotsInitialized"> {
  const weekKey = currentISOWeekKey(asOf);
  const date = format(asOf, "yyyy-MM-dd");
  const scores = computeMuscleCompositeScores(profile);
  const existing = [...(profile.disciplineMuscleSnapshots ?? [])];
  const idx = existing.findIndex((s) => s.weekKey === weekKey);

  const entry: DisciplineMuscleSnapshot = { weekKey, date, scores };
  if (idx >= 0) {
    existing[idx] = entry;
  } else {
    existing.push(entry);
  }

  return {
    disciplineMuscleSnapshots: pruneSnapshots(existing),
    disciplineSnapshotsInitialized: true,
  };
}

export function applyDisciplineSnapshotPatch(profile: UserProfile): UserProfile {
  const patch = ensureDisciplineSnapshots(profile);
  return { ...profile, ...patch };
}
