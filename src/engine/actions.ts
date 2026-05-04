/**
 * Aksiyon kataloğu (ağırlıklı, uygulamaya hazır).
 *
 * Kurallar:
 *  - Aynı anda yalnız BİR aksiyon
 *  - Süre 3–15 sn
 *  - Sıfır düşünme, net vücut hareketi
 *  - priority 1–5, intensity: düşük/orta/yüksek
 */

import { Action, MuscleType } from "./types";

export const ACTIONS: Action[] = [
  // ── Activation: harekete geç (priority 3–4) ─────────────────────────────
  { id: "stand-up", title: "Ayağa kalk", type: "activation", duration: 3, priority: 3, intensity: "medium" },
  { id: "walk-5", title: "5 adım yürü", type: "activation", duration: 5, priority: 4, intensity: "medium" },
  { id: "shake-shoulders", title: "Omuzlarını silk", type: "activation", duration: 3, priority: 3, intensity: "low" },
  { id: "open-window", title: "Pencereyi aç", type: "activation", duration: 5, priority: 3, intensity: "low" },
  { id: "drink-water", title: "Bir yudum su iç", type: "activation", duration: 5, priority: 4, intensity: "low" },
  {
    id: "interrupt-stand",
    title: "Şimdi ayağa kalk",
    type: "activation",
    duration: 3,
    priority: 5,
    intensity: "high",
    isInterrupt: true,
  },

  // ── Consistency: küçük tekrar (priority 2) ────────────────────────────
  { id: "anchor-touch", title: "Çapana dokun", type: "consistency", duration: 5, priority: 2, intensity: "medium" },
  { id: "say-identity", title: "Kim olduğunu yüksek sesle söyle", type: "consistency", duration: 5, priority: 2, intensity: "medium" },
  { id: "two-minute", title: "2 dakikalık versiyonu yap", type: "consistency", duration: 15, priority: 2, intensity: "medium" },
  { id: "tiny-rep", title: "Tek tekrar yap", type: "consistency", duration: 10, priority: 2, intensity: "medium" },

  // ── Resistance: direnci aş (priority 3) ────────────────────────────────
  { id: "deep-breath", title: "Derin nefes al", type: "resistance", duration: 5, priority: 3, intensity: "low" },
  { id: "count-three", title: "3'e kadar say ve başla", type: "resistance", duration: 5, priority: 3, intensity: "medium" },
  { id: "phone-down", title: "Telefonu yüz üstü çevir", type: "resistance", duration: 3, priority: 3, intensity: "low" },
  { id: "no-explain", title: "Açıklamadan başla", type: "resistance", duration: 5, priority: 3, intensity: "medium" },

  // ── Focus: dikkati topla (priority 2–3) ────────────────────────────────
  { id: "close-eyes", title: "10 saniye gözlerini kapat", type: "focus", duration: 10, priority: 2, intensity: "low" },
  { id: "one-thing", title: "Sadece bir şeye bak", type: "focus", duration: 10, priority: 2, intensity: "low" },
  { id: "screen-blank", title: "Ekrandan başını kaldır", type: "focus", duration: 5, priority: 3, intensity: "low" },

  // ── Recovery: geri dönüş (priority 4) ───────────────────────────────────
  { id: "soft-restart", title: "Ayağa kalk ve 1 adım at", type: "recovery", duration: 5, priority: 4, intensity: "low" },
  { id: "smile", title: "Aynaya gülümse", type: "recovery", duration: 5, priority: 4, intensity: "low" },
  { id: "stretch", title: "Kollarını yukarı kaldır, omuzlarını aç (bir kere)", type: "recovery", duration: 10, priority: 4, intensity: "medium" },
  { id: "comeback", title: "Parmak uçlarını aç, dirseklerini hafif oynat", type: "recovery", duration: 5, priority: 4, intensity: "low" },

  // ── Template: clear_mind ───────────────────────────────────────────────
  { id: "tpl-clear-mind-write", title: "Zihnini tek cümleye indir", type: "focus", duration: 10, priority: 2, intensity: "medium" },
  { id: "tpl-clear-mind-open", title: "Zihin ekranını aç, imleç yansın", type: "focus", duration: 5, priority: 3, intensity: "low" },

  // ── Template: moving_person ───────────────────────────────────────────
  { id: "tpl-move-bounce-30", title: "30 sn olduğun yerde zıpla", type: "activation", duration: 15, priority: 3, intensity: "high" },
  { id: "tpl-move-pushup-1", title: "1 şınav çek", type: "activation", duration: 10, priority: 4, intensity: "high" },
  { id: "tpl-move-shoes", title: "Spor ayakkabılarını eline al", type: "recovery", duration: 5, priority: 4, intensity: "low" },

  // ── Template: learner ──────────────────────────────────────────────
  { id: "tpl-learn-first-line", title: "Kaynağı aç, ilk satıra bak", type: "consistency", duration: 15, priority: 2, intensity: "medium" },
  { id: "tpl-learn-name", title: "Kaynağın adını gör ve kapat", type: "consistency", duration: 5, priority: 2, intensity: "low" },

  // ── Template: self_care ────────────────────────────────────────────
  { id: "tpl-self-water", title: "Bir bardak suyu masaya koy, yudum al", type: "recovery", duration: 10, priority: 4, intensity: "low" },
  { id: "tpl-self-glass", title: "Bardağı sadece masaya koy", type: "recovery", duration: 5, priority: 4, intensity: "low" },

  // ── Template: creator ─────────────────────────────────────────
  { id: "tpl-creator-open", title: "Dosyayı aç, ilk satıra imleç götür", type: "consistency", duration: 5, priority: 3, intensity: "low" },
  { id: "tpl-creator-word", title: "Sadece bir kelime yaz ya da çiz", type: "consistency", duration: 10, priority: 3, intensity: "medium" },
  { id: "tpl-creator-idea", title: "Kafandaki tek fikri cümleyle yaz", type: "focus", duration: 10, priority: 3, intensity: "medium" },

  // ── Template: focused_worker ──────────────────────────────────
  { id: "tpl-focus-tab", title: "Tüm sekmeleri kapat, sadece bir tane bırak", type: "resistance", duration: 5, priority: 4, intensity: "medium" },
  { id: "tpl-focus-task", title: "Şu anki tek görevini yüksek sesle söyle", type: "focus", duration: 5, priority: 4, intensity: "medium" },
  { id: "tpl-focus-timer", title: "25 dakika sayacını başlat, telefonu çevir", type: "resistance", duration: 5, priority: 3, intensity: "high" },

  // ── Template: night_owl (düzenli uyuyan) ──────────────────────
  { id: "tpl-sleep-screen", title: "Ekranı kapat, gözlerini 10 sn kapat", type: "focus", duration: 10, priority: 4, intensity: "low" },
  { id: "tpl-sleep-phone", title: "Telefonu uzağa koy, yüzünü çevir", type: "resistance", duration: 3, priority: 4, intensity: "low" },
  { id: "tpl-sleep-breath", title: "4 sn nefes al, 4 sn tut, 4 sn ver", type: "recovery", duration: 15, priority: 4, intensity: "low" },

  // ── Template: social_builder (sosyal bağ kuran) ───────────────
  { id: "tpl-social-name", title: "Aklına gelen birinin ismini yaz", type: "consistency", duration: 5, priority: 3, intensity: "low" },
  { id: "tpl-social-msg", title: "Tek cümlelik bir mesaj taslağı yaz", type: "consistency", duration: 10, priority: 3, intensity: "medium" },
  { id: "tpl-social-smile", title: "Bir sonraki karşılaşmada gülümse niyetiyle dur", type: "focus", duration: 5, priority: 2, intensity: "low" },
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
