/**
 * Onboarding'deki çapa cümlesinden "Şimdi yap" aksiyon havuzunu yönlendiren bağlam.
 * Profilde yalnızca serbest metin var; anahtar kelime + hazır çapa ifadeleriyle eşleşir.
 */

import { ANCHOR_PRESETS } from "../constants/theme";

export type AnchorActionContext =
  | "default"
  | "sleep_winddown"
  | "morning_routine"
  | "midday"
  | "phone_away";

/** `theme.ANCHOR_PRESETS` ile aynı sıra — tema değişince burayı güncelle */
const ANCHOR_PRESET_CONTEXT: AnchorActionContext[] = [
  "morning_routine", // Kahvemi içtikten sonra
  "morning_routine", // Dişlerimi fırçaladıktan sonra
  "phone_away", // Telefonu elimden bıraktıktan sonra
  "sleep_winddown", // Yatağa girmeden önce
  "midday", // Öğle yemeğinden sonra
  "morning_routine", // Uyandıktan hemen sonra
];

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
];

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

  const presetIdx = ANCHOR_PRESETS.indexOf(raw as (typeof ANCHOR_PRESETS)[number]);
  if (presetIdx >= 0) {
    return ANCHOR_PRESET_CONTEXT[presetIdx] ?? "default";
  }

  const n = normalizeForMatch(raw);

  if (PHONE_HINTS.some((h) => n.includes(normalizeForMatch(h)))) {
    return "phone_away";
  }
  if (SLEEP_HINTS.some((h) => n.includes(normalizeForMatch(h)))) {
    return "sleep_winddown";
  }
  if (MORNING_HINTS.some((h) => n.includes(normalizeForMatch(h)))) {
    return "morning_routine";
  }
  if (MIDDAY_HINTS.some((h) => n.includes(normalizeForMatch(h)))) {
    return "midday";
  }

  return "default";
}
