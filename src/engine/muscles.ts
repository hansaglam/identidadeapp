/**
 * Disiplin Kasları — farkındalık sistemi.
 *
 * BU OYUN DEĞİL.
 *  - XP yok
 *  - Seviye yok
 *  - Rozet yok
 *
 * Yalnız sayım + öngörü:
 *  "Toparlanma kasın güçleniyor."
 *  "Aktivasyon kasın zayıf."
 */

import { Muscles, MuscleType, MuscleInsight } from "./types";

export const EMPTY_MUSCLES: Muscles = {
  activation: 0,
  consistency: 0,
  resistance: 0,
  focus: 0,
  recovery: 0,
};

export const MUSCLE_LABELS: Record<MuscleType, string> = {
  activation: "Aktivasyon",
  consistency: "Tutarlılık",
  resistance: "Direnç",
  focus: "Odak",
  recovery: "Toparlanma",
};

export const MUSCLE_DESCRIPTIONS: Record<MuscleType, string> = {
  activation: "Harekete geçme refleksi",
  consistency: "Küçük adımı tekrar etme",
  resistance: "İstemediğinde de yapma",
  focus: "Bir şeye odaklanabilme",
  recovery: "Düştükten sonra geri dönme",
};

export function findWeakestMuscle(m: Muscles): MuscleType {
  const entries = Object.entries(m) as [MuscleType, number][];
  entries.sort((a, b) => a[1] - b[1]);
  return entries[0]![0];
}

export function findStrongestMuscle(m: Muscles): MuscleType {
  const entries = Object.entries(m) as [MuscleType, number][];
  entries.sort((a, b) => b[1] - a[1]);
  return entries[0]![0];
}

/**
 * Mevcut kas sayımları + (varsa) önceki snapshot'a kıyas.
 * Yalnızca insight üretir; ödül yok.
 */
export function getInsights(
  current: Muscles,
  previous: Muscles | null
): MuscleInsight[] {
  const insights: MuscleInsight[] = [];

  const weak = findWeakestMuscle(current);
  insights.push({
    muscle: weak,
    trend: "weak",
    message: `${MUSCLE_LABELS[weak]} kasın zayıf — bu hafta odak burada.`,
  });

  if (previous) {
    (Object.keys(current) as MuscleType[]).forEach((k) => {
      const diff = current[k] - previous[k];
      if (diff >= 3) {
        insights.push({
          muscle: k,
          trend: "improving",
          message: `${MUSCLE_LABELS[k]} kasın güçleniyor.`,
        });
      }
    });
  }

  const strong = findStrongestMuscle(current);
  if (current[strong] >= 5 && strong !== weak) {
    insights.push({
      muscle: strong,
      trend: "improving",
      message: `${MUSCLE_LABELS[strong]} kasın istikrarlı.`,
    });
  }

  return insights;
}
