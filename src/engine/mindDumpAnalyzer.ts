/**
 * Mind Dump → Aksiyon (AI-ready, şimdilik kural tabanlı).
 *
 * Kullanıcı düşüncelerini yazar. Sistem ruh halini sezer ve
 * uygun kasta tek bir aksiyon önerir.
 */

import { MindDumpEntry } from "../types";
import { Action, MuscleType } from "./types";
import { pickAction } from "./actions";

interface MoodMap {
  muscle: MuscleType;
  keywords: string[];
}

const MAPS: MoodMap[] = [
  {
    muscle: "activation",
    keywords: [
      "tembel",
      "yorgun",
      "uykulu",
      "isteksiz",
      "ağır",
      "üşeniyorum",
      "lazy",
      "tired",
    ],
  },
  {
    muscle: "focus",
    keywords: [
      "dağınık",
      "odaklan",
      "ekran",
      "telefon",
      "kafam karışık",
      "scattered",
      "distract",
    ],
  },
  {
    muscle: "recovery",
    keywords: [
      "üzgün",
      "kötü",
      "moralim",
      "boş",
      "yıkıldım",
      "vazgeç",
      "sad",
      "down",
    ],
  },
  {
    muscle: "resistance",
    keywords: [
      "kızgın",
      "öfke",
      "stres",
      "sinir",
      "istemiyorum",
      "angry",
      "frustrated",
    ],
  },
  {
    muscle: "consistency",
    keywords: [
      "kararsız",
      "şüphe",
      "bırak",
      "anlamı yok",
      "confused",
    ],
  },
];

export interface MindDumpAnalysis {
  detectedMuscle: MuscleType;
  matchedKeyword: string | null;
  suggestedAction: Action;
}

export function analyzeMindDump(text: string): MindDumpAnalysis {
  const lower = text.toLocaleLowerCase("tr-TR");

  for (const map of MAPS) {
    for (const kw of map.keywords) {
      if (lower.includes(kw)) {
        return {
          detectedMuscle: map.muscle,
          matchedKeyword: kw,
          suggestedAction: pickAction(map.muscle),
        };
      }
    }
  }

  return {
    detectedMuscle: "activation",
    matchedKeyword: null,
    suggestedAction: pickAction("activation"),
  };
}

/**
 * Son 24 saat içinde yazılmış mind dump'lardan en güncelini analiz eder.
 */
export function analyzeRecentMindDumps(
  entries: MindDumpEntry[]
): MindDumpAnalysis | null {
  if (entries.length === 0) return null;
  const sorted = [...entries].sort((a, b) =>
    b.createdAt.localeCompare(a.createdAt)
  );
  const latest = sorted[0]!;
  const ageMs = Date.now() - new Date(latest.createdAt).getTime();
  if (ageMs > 24 * 60 * 60 * 1000) return null;
  return analyzeMindDump(latest.content);
}
