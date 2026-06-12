/**
 * Onboarding'deki çapa cümlesinden "Şimdi yap" aksiyon havuzunu yönlendiren bağlam.
 * Profilde yalnızca serbest metin var; anahtar kelime + hazır çapa ifadeleriyle eşleşir.
 */

import {
  ANCHOR_PRESET_CONTEXT,
  ANCHOR_PRESET_IDS,
  resolveAnchorId,
} from "../constants/anchors";

export type AnchorActionContext =
  | "default"
  | "sleep_winddown"
  | "morning_routine"
  | "midday"
  | "phone_away";

const SLEEP_HINTS = [
  "yatak",
  "yatmadan",
  "uyumadan",
  "uyku",
  "uyumak",
  "gece rutin",
  "geceyi",
];

const MORNING_HINTS = [
  "uyandı",
  "uyaninca",
  "kahve",
  "diş",
  "fırçala",
  "sabah",
  "wake",
  "morning",
  "brush",
  "coffee",
  "drink",
];

const WORK_HINTS = ["work", "laptop", "computer", "desk", "office", "is", "bilgisayar"];

const HOME_HINTS = ["home", "arrive", "eve", "geldi"];

const MIDDAY_HINTS = ["öğle", "öğlen", "yemekten", "yemek"];

const PHONE_HINTS = ["telefon", "ekran", "elimden"];

function normalizeForMatch(s: string): string {
  return s
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ")
    .replace(/ı/g, "i")
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ş/g, "s")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c");
}

export function inferAnchorActionContext(habitAnchor: string): AnchorActionContext {
  const raw = habitAnchor?.trim() ?? "";
  if (!raw) return "default";

  const anchorId = resolveAnchorId(raw);
  if (anchorId) {
    const presetIdx = ANCHOR_PRESET_IDS.indexOf(anchorId as (typeof ANCHOR_PRESET_IDS)[number]);
    if (presetIdx >= 0) {
      return ANCHOR_PRESET_CONTEXT[presetIdx] ?? "default";
    }
    if (anchorId === "after_arrive_home") return "morning_routine";
  }

  const n = normalizeForMatch(raw);

  if (PHONE_HINTS.some((h) => n.includes(normalizeForMatch(h)))) {
    return "phone_away";
  }
  if (SLEEP_HINTS.some((h) => n.includes(normalizeForMatch(h)))) {
    return "sleep_winddown";
  }
  if (WORK_HINTS.some((h) => n.includes(normalizeForMatch(h)))) {
    return "morning_routine";
  }
  if (HOME_HINTS.some((h) => n.includes(normalizeForMatch(h)))) {
    return "morning_routine";
  }
  if (MORNING_HINTS.some((h) => n.includes(normalizeForMatch(h)))) {
    return "morning_routine";
  }
  if (MIDDAY_HINTS.some((h) => n.includes(normalizeForMatch(h)))) {
    return "midday";
  }

  return "default";
}
