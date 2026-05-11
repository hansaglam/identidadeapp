import { JOURNEY_PHASES } from "../constants/theme";

export const JOURNEY_TREE_TYPES = ["oak", "cherry", "olive", "bamboo", "acacia"] as const;

export type JourneyTreeType = (typeof JOURNEY_TREE_TYPES)[number];

export function randomJourneyTreeType(): JourneyTreeType {
  return JOURNEY_TREE_TYPES[Math.floor(Math.random() * JOURNEY_TREE_TYPES.length)]!;
}

export function coerceJourneyTreeType(s: string | undefined | null): JourneyTreeType {
  if (s && (JOURNEY_TREE_TYPES as readonly string[]).includes(s)) {
    return s as JourneyTreeType;
  }
  return "oak";
}

/** 66 gün → 6 eşit blok (11’er gün), 0–5 indeks */
export function phaseIndexFromJourneyDay(day: number): number {
  const d = Math.min(66, Math.max(1, Math.round(day)));
  return Math.min(5, Math.floor((d - 1) / 11));
}

const TREE_MICRO_LABELS = [
  "İlk hafta",
  "Köklenme",
  "Ritim kurulumu",
  "Derin pekiştirme",
  "Otomatikleşme",
  "Son sprint",
] as const;

/** Ağaç altı açıklama: ana faz + 11 günlük blok */
export function journeyTreeCaptionLine(day: number): string {
  const d = Math.min(66, Math.max(1, Math.round(day)));
  const phase =
    JOURNEY_PHASES.find((p) => d >= p.startDay && d <= p.endDay) ?? JOURNEY_PHASES[0];
  const micro = TREE_MICRO_LABELS[phaseIndexFromJourneyDay(d)]!;
  return `${phase.label} Fazı · ${micro}`;
}
