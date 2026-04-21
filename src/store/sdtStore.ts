/**
 * SDT (Self-Determination Theory) weekly scores.
 * Stored under 'sdt:YYYY-Www' keys (ISO week format).
 * Scale: 1–5 per dimension (autonomy, competence, relatedness).
 */
import { create } from "zustand";
import { getISOWeek, getISOWeekYear } from "date-fns";
import { SDTScore } from "../types";
import { loadAllSDTScores, saveSDTScore, loadSDTScore } from "../utils/storage";

function buildWeekKey(date = new Date()): string {
  const week = getISOWeek(date);
  const year = getISOWeekYear(date);
  return `${year}-W${String(week).padStart(2, "0")}`;
}

interface SDTState {
  scores: SDTScore[];
  load: () => Promise<void>;
  saveScore: (answers: {
    autonomy: number;
    competence: number;
    relatedness: number;
  }) => Promise<void>;
  currentWeekKey: () => string;
  needsSurvey: () => boolean;
  latestScore: () => SDTScore | null;
}

export const useSDTStore = create<SDTState>((set, get) => ({
  scores: [],

  load: async () => {
    const scores = await loadAllSDTScores();
    set({ scores });
  },

  saveScore: async ({ autonomy, competence, relatedness }) => {
    const week = buildWeekKey();
    const score: SDTScore = {
      week,
      autonomy,
      competence,
      relatedness,
      answeredAt: new Date().toISOString(),
    };
    await saveSDTScore(score);

    const { scores } = get();
    const filtered = scores.filter((s) => s.week !== week);
    set({ scores: [score, ...filtered] });
  },

  currentWeekKey: () => buildWeekKey(),

  needsSurvey: () => {
    const { scores } = get();
    const thisWeek = buildWeekKey();
    return !scores.some((s) => s.week === thisWeek);
  },

  latestScore: () => {
    const { scores } = get();
    return scores.length ? scores[0] : null;
  },
}));
