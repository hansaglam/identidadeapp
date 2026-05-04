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
      "bitkin",
      "enerjisiz",
      "hareketsiz",
      "ertel",
      "erteledim",
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
      "dikkatim",
      "bunaldım",
      "kaybol",
      "unuttum",
      "dağınıklık",
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
      "umutsuz",
      "çaresiz",
      "yalnız",
      "ağladım",
      "depres",
      "tüken",
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
      "bıktım",
      "kaygı",
      "endişe",
      "gergin",
      "panik",
      "angry",
      "frustrated",
      "anxious",
    ],
  },
  {
    muscle: "consistency",
    keywords: [
      "kararsız",
      "şüphe",
      "bırak",
      "anlamı yok",
      "boşa",
      "değmez",
      "güvensiz",
      "confused",
    ],
  },
];

export interface MindDumpAnalysis {
  detectedMuscle: MuscleType;
  matchedKeyword: string | null;
  /** Son birleştirilmiş analizde yakalanan tüm anahtar kelimeler (ilk 5) */
  aggregatedKeywords?: string[];
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

const RECENT_MS = 48 * 60 * 60 * 1000;
const MAX_ENTRIES = 5;

/**
 * Son 48 saat içindeki birkaç mind dump'ı birleştirir; tekrar eden temalar güçlenir.
 */
export function analyzeRecentMindDumps(
  entries: MindDumpEntry[]
): MindDumpAnalysis | null {
  if (entries.length === 0) return null;
  const sorted = [...entries].sort((a, b) =>
    b.createdAt.localeCompare(a.createdAt)
  );
  const fresh = sorted
    .filter(
      (e) => Date.now() - new Date(e.createdAt).getTime() <= RECENT_MS
    )
    .slice(0, MAX_ENTRIES);

  if (fresh.length === 0) return null;

  const muscleScores: Record<MuscleType, number> = {
    activation: 0,
    consistency: 0,
    resistance: 0,
    focus: 0,
    recovery: 0,
  };
  const keywords: string[] = [];

  for (const e of fresh) {
    const a = analyzeMindDump(e.content);
    if (a.matchedKeyword) {
      muscleScores[a.detectedMuscle] += 2;
      keywords.push(a.matchedKeyword);
    }
  }

  if (keywords.length === 0) {
    const latest = fresh[0]!;
    const single = analyzeMindDump(latest.content);
    if (!single.matchedKeyword) return null;
    return single;
  }

  const ranked = (Object.entries(muscleScores) as [MuscleType, number][]).sort(
    (x, y) => y[1] - x[1]
  );
  const bestMuscle = ranked[0]![0];

  return {
    detectedMuscle: bestMuscle,
    matchedKeyword: keywords[0] ?? null,
    aggregatedKeywords: [...new Set(keywords)].slice(0, 5),
    suggestedAction: pickAction(bestMuscle),
  };
}
