/**
 * Aksiyon kataloğu.
 *
 * Kurallar:
 *  - Aynı anda yalnız BİR aksiyon
 *  - Süre 3–15 sn
 *  - Sıfır düşünme: kullanıcı tekrar "ne yapmalıyım" diye sormamalı
 */

import { Action, MuscleType } from "./types";

export const ACTIONS: Action[] = [
  // ── Activation: harekete geç ────────────────────────────────────────
  { id: "stand-up", title: "Şimdi ayağa kalk", type: "activation", duration: 3 },
  { id: "walk-5", title: "5 adım yürü", type: "activation", duration: 5 },
  { id: "shake-shoulders", title: "Omuzlarını silk", type: "activation", duration: 3 },
  { id: "open-window", title: "Pencereyi aç", type: "activation", duration: 5 },
  { id: "drink-water", title: "Bir yudum su iç", type: "activation", duration: 5 },

  // ── Consistency: küçük tekrar ───────────────────────────────────────
  { id: "anchor-touch", title: "Çapana dokun", type: "consistency", duration: 5 },
  { id: "say-identity", title: "Kim olduğunu yüksek sesle söyle", type: "consistency", duration: 5 },
  { id: "two-minute", title: "2 dakikalık versiyonu yap", type: "consistency", duration: 15 },
  { id: "tiny-rep", title: "Tek tekrar yap", type: "consistency", duration: 10 },

  // ── Resistance: direnci aş ──────────────────────────────────────────
  { id: "deep-breath", title: "Derin nefes al", type: "resistance", duration: 5 },
  { id: "count-three", title: "3'e kadar say ve başla", type: "resistance", duration: 5 },
  { id: "phone-down", title: "Telefonu yüz üstü çevir", type: "resistance", duration: 3 },
  { id: "no-explain", title: "Açıklamadan başla", type: "resistance", duration: 5 },

  // ── Focus: dikkati topla ────────────────────────────────────────────
  { id: "close-eyes", title: "10 saniye gözlerini kapat", type: "focus", duration: 10 },
  { id: "one-thing", title: "Sadece bir şeye bak", type: "focus", duration: 10 },
  { id: "screen-blank", title: "Ekrandan başını kaldır", type: "focus", duration: 5 },

  // ── Recovery: geri dönüş ────────────────────────────────────────────
  { id: "soft-restart", title: "Sadece başla. Tek adım yeter.", type: "recovery", duration: 5 },
  { id: "smile", title: "Aynaya gülümse", type: "recovery", duration: 5 },
  { id: "stretch", title: "Sırtını ger", type: "recovery", duration: 10 },
  { id: "comeback", title: "Geri dönüyorum, sıfırdan değil", type: "recovery", duration: 5 },
];

export const ACTIONS_BY_TYPE: Record<MuscleType, Action[]> = {
  activation: ACTIONS.filter((a) => a.type === "activation"),
  consistency: ACTIONS.filter((a) => a.type === "consistency"),
  resistance: ACTIONS.filter((a) => a.type === "resistance"),
  focus: ACTIONS.filter((a) => a.type === "focus"),
  recovery: ACTIONS.filter((a) => a.type === "recovery"),
};

/**
 * Aksiyon seçici. Aynı dakikada aynı aksiyon (idempotent),
 * son birkaç aksiyonu hariç tutar (tekrar etmesin).
 */
export function pickAction(
  muscle: MuscleType,
  excludeIds: string[] = []
): Action {
  const pool = ACTIONS_BY_TYPE[muscle].filter((a) => !excludeIds.includes(a.id));
  const list = pool.length > 0 ? pool : ACTIONS_BY_TYPE[muscle];
  const idx = Math.floor((Date.now() / 60000) % list.length);
  return list[idx]!;
}

export function getActionById(id: string): Action | null {
  return ACTIONS.find((a) => a.id === id) ?? null;
}
