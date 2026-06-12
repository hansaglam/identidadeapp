/**
 * Stable anchor preset IDs — display text lives in i18n (`anchors.{id}.label`).
 * Habit stacking: pair new behavior with an existing routine (Tiny Habits / implementation intentions).
 */

export const ANCHOR_PRESET_IDS = [
  "after_wake",
  "after_brush",
  "after_morning_drink",
  "after_lunch",
  "after_phone_down",
  "before_bed",
  "after_start_work",
] as const;

export type AnchorPresetId = (typeof ANCHOR_PRESET_IDS)[number];

/** Template-specific anchor (e.g. movement after arriving home). */
export const ANCHOR_EXTRA_IDS = ["after_arrive_home"] as const;

export type AnchorId = AnchorPresetId | (typeof ANCHOR_EXTRA_IDS)[number];

export const ANCHOR_EMOJI_BY_ID: Record<AnchorId, string> = {
  after_wake: "⏰",
  after_brush: "🪥",
  after_morning_drink: "☕",
  after_lunch: "🍽️",
  after_phone_down: "📵",
  before_bed: "🛏️",
  after_start_work: "💻",
  after_arrive_home: "🏠",
};

/** Onboarding engine context — order matches ANCHOR_PRESET_IDS */
export const ANCHOR_PRESET_CONTEXT = [
  "morning_routine",
  "morning_routine",
  "morning_routine",
  "midday",
  "phone_away",
  "sleep_winddown",
  "morning_routine",
] as const;

/** Legacy Turkish labels saved in older profiles */
export const LEGACY_ANCHOR_TO_ID: Record<string, AnchorId> = {
  "Uyandıktan hemen sonra": "after_wake",
  "Dişlerimi fırçaladıktan sonra": "after_brush",
  "Kahvemi içtikten sonra": "after_morning_drink",
  "Öğle yemeğinden sonra": "after_lunch",
  "Telefonu elimden bıraktıktan sonra": "after_phone_down",
  "Yatağa girmeden önce": "before_bed",
  "Bilgisayarımı açtıktan sonra": "after_start_work",
  "Eve geldikten ve ayakkabılarımı çıkardıktan sonra": "after_arrive_home",
};

export function resolveAnchorId(raw: string): AnchorId | null {
  const t = raw.trim();
  if (!t) return null;
  if ((ANCHOR_PRESET_IDS as readonly string[]).includes(t)) return t as AnchorPresetId;
  if ((ANCHOR_EXTRA_IDS as readonly string[]).includes(t)) return t as AnchorId;
  return LEGACY_ANCHOR_TO_ID[t] ?? null;
}

export function isAnchorPresetId(id: string): id is AnchorPresetId {
  return (ANCHOR_PRESET_IDS as readonly string[]).includes(id);
}
