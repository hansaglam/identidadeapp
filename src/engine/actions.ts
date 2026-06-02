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
  // ── Activation: harekete geç ───────────────────────────────────────────
  { id: "stand-up", title: "Ayağa kalk", type: "activation", duration: 3, priority: 3, intensity: "medium" },
  { id: "walk-5", title: "5 adım yürü", type: "activation", duration: 5, priority: 4, intensity: "medium" },
  { id: "shake-shoulders", title: "Omuzlarını silk", type: "activation", duration: 3, priority: 3, intensity: "low" },
  { id: "open-window", title: "Pencereyi aç, 5 sn temiz hava al", type: "activation", duration: 5, priority: 3, intensity: "low" },
  { id: "drink-water", title: "Bir yudum su iç", type: "activation", duration: 5, priority: 4, intensity: "low" },
  { id: "stand-tall", title: "Dik dur, göğsünü 3 sn aç", type: "activation", duration: 5, priority: 3, intensity: "low" },
  { id: "jump-once", title: "Yerinde bir kez zıpla", type: "activation", duration: 3, priority: 3, intensity: "medium" },
  { id: "march-10", title: "Olduğun yerde 10 adım say", type: "activation", duration: 8, priority: 3, intensity: "medium" },
  { id: "tap-desk", title: "Masaya iki kez vur, sonra hareket et", type: "activation", duration: 3, priority: 2, intensity: "low" },
  { id: "wake-wrists", title: "Bileklerini 5 sn dairesel çevir", type: "activation", duration: 5, priority: 2, intensity: "low" },
  { id: "calf-raise-3", title: "3 kez parmak uçlarında yüksel", type: "activation", duration: 8, priority: 3, intensity: "medium" },
  { id: "light-on", title: "Işığı aç veya perdeyi arala", type: "activation", duration: 5, priority: 2, intensity: "low" },
  { id: "door-threshold", title: "Kapı eşiğine git, bir adım içeri", type: "activation", duration: 5, priority: 4, intensity: "medium" },
  {
    id: "interrupt-stand",
    title: "Şimdi ayağa kalk",
    type: "activation",
    duration: 3,
    priority: 5,
    intensity: "high",
    isInterrupt: true,
  },

  // ── Consistency: küçük tekrar / çapa ───────────────────────────────────
  { id: "anchor-touch", title: "Çapana dokun", type: "consistency", duration: 5, priority: 2, intensity: "medium" },
  { id: "say-identity", title: "Kim olduğunu yüksek sesle söyle", type: "consistency", duration: 5, priority: 2, intensity: "medium" },
  { id: "two-minute", title: "2 dakikalık versiyonu yap", type: "consistency", duration: 15, priority: 2, intensity: "medium" },
  { id: "tiny-rep", title: "Tek tekrar yap", type: "consistency", duration: 10, priority: 2, intensity: "medium" },
  { id: "habit-whisper", title: "Alışkanlığını fısıltıyla tekrar et", type: "consistency", duration: 5, priority: 2, intensity: "low" },
  { id: "anchor-visualize", title: "Çapayı gözünde canlandır, 5 sn", type: "consistency", duration: 5, priority: 2, intensity: "low" },
  { id: "one-line-plan", title: "Bugünkü tek adımı bir satıra yaz", type: "consistency", duration: 10, priority: 3, intensity: "medium" },
  { id: "tool-ready", title: "Gereken aracı masaya koy (kitap, mat, su…)", type: "consistency", duration: 8, priority: 3, intensity: "low" },
  { id: "smallest-version-say", title: "En küçük sürümü yüksek sesle söyle", type: "consistency", duration: 5, priority: 3, intensity: "medium" },
  { id: "repeat-anchor-twice", title: "Çapa cümlesini iki kez söyle", type: "consistency", duration: 8, priority: 2, intensity: "low" },
  { id: "identity-nod", title: "“Bunu yapan biriyim” de ve başını salla", type: "consistency", duration: 5, priority: 2, intensity: "low" },
  { id: "habit-object-touch", title: "Alışkanlık nesene bir kez dokun", type: "consistency", duration: 5, priority: 2, intensity: "low" },
  { id: "mark-done-intent", title: "“Şimdi yapıyorum” de ve çapaya git", type: "consistency", duration: 5, priority: 4, intensity: "medium" },

  // ── Resistance: direnci kır ─────────────────────────────────────────────
  { id: "deep-breath", title: "Derin nefes al", type: "resistance", duration: 5, priority: 3, intensity: "low" },
  { id: "count-three", title: "3'e kadar say ve başla", type: "resistance", duration: 5, priority: 3, intensity: "medium" },
  { id: "phone-down", title: "Telefonu yüz üstü çevir", type: "resistance", duration: 3, priority: 3, intensity: "low" },
  { id: "no-explain", title: "Açıklamadan başla", type: "resistance", duration: 5, priority: 3, intensity: "medium" },
  { id: "five-countdown", title: "5-4-3-2-1 say ve ilk hareketi yap", type: "resistance", duration: 8, priority: 4, intensity: "high" },
  { id: "shoulders-drop", title: "Omuzlarını bilinçli bırak, 5 sn", type: "resistance", duration: 5, priority: 2, intensity: "low" },
  { id: "unclench-jaw", title: "Çeneni gevşet, dili damağa bırak", type: "resistance", duration: 5, priority: 2, intensity: "low" },
  { id: "stop-scroll-thumb", title: "Başparmağını ekrandan 3 sn çek", type: "resistance", duration: 5, priority: 4, intensity: "medium" },
  { id: "say-start-now", title: "“Şimdi başlıyorum” de — erteleme yok", type: "resistance", duration: 5, priority: 4, intensity: "high" },
  { id: "box-breath-4", title: "4 sn al, 4 sn tut, 4 sn ver", type: "resistance", duration: 12, priority: 3, intensity: "low" },
  { id: "feet-flat-press", title: "Ayak tabanını yere bastır, 5 sn", type: "resistance", duration: 5, priority: 3, intensity: "low" },
  { id: "timer-3-start", title: "3 sn geri say ve harekete geç", type: "resistance", duration: 5, priority: 4, intensity: "medium" },

  // ── Focus: dikkati topla ────────────────────────────────────────────────
  { id: "close-eyes", title: "10 saniye gözlerini kapat", type: "focus", duration: 10, priority: 2, intensity: "low" },
  { id: "one-thing", title: "Sadece bir şeye bak", type: "focus", duration: 10, priority: 2, intensity: "low" },
  { id: "screen-blank", title: "Ekrandan başını kaldır", type: "focus", duration: 5, priority: 3, intensity: "low" },
  { id: "blink-reset", title: "10 kez göz kırp, sonra tek noktaya bak", type: "focus", duration: 8, priority: 2, intensity: "low" },
  { id: "mute-notifications", title: "Bildirimleri 1 saat sessize al", type: "focus", duration: 5, priority: 4, intensity: "medium" },
  { id: "desk-clear-one", title: "Masadan tek bir şeyi kaldır", type: "focus", duration: 8, priority: 3, intensity: "low" },
  { id: "read-one-word", title: "Görevindeki ilk kelimeyi oku", type: "focus", duration: 5, priority: 3, intensity: "low" },
  { id: "stare-one-point", title: "Duvar/noktaya 10 sn bak", type: "focus", duration: 10, priority: 2, intensity: "low" },
  { id: "headphones-on", title: "Kulaklığı tak veya sessiz moda geç", type: "focus", duration: 5, priority: 3, intensity: "low" },
  { id: "pen-cap-off", title: "Kalemin kapağını çıkar, yazmaya hazır ol", type: "focus", duration: 5, priority: 2, intensity: "low" },
  { id: "single-task-say", title: "Tek görevini yüksek sesle söyle", type: "focus", duration: 5, priority: 4, intensity: "medium" },

  // ── Recovery: toparlanma ────────────────────────────────────────────────
  { id: "soft-restart", title: "Ayağa kalk ve 1 adım at", type: "recovery", duration: 5, priority: 4, intensity: "low" },
  { id: "smile", title: "Aynaya gülümse", type: "recovery", duration: 5, priority: 4, intensity: "low" },
  { id: "stretch", title: "Kollarını yukarı kaldır, omuzlarını aç (bir kere)", type: "recovery", duration: 10, priority: 4, intensity: "medium" },
  { id: "comeback", title: "Parmak uçlarını aç, dirseklerini hafif oynat", type: "recovery", duration: 5, priority: 4, intensity: "low" },
  { id: "thank-self", title: "“Bugün de denedim” de", type: "recovery", duration: 5, priority: 3, intensity: "low" },
  { id: "slow-exhale-3", title: "3 kez yavaş nefes ver", type: "recovery", duration: 10, priority: 3, intensity: "low" },
  { id: "gentle-neck-roll", title: "Boynunu yavaşça bir yana eğ (tek)", type: "recovery", duration: 5, priority: 3, intensity: "low" },
  { id: "forgive-yesterday", title: "“Dün bitti, bugün var” de", type: "recovery", duration: 5, priority: 4, intensity: "low" },
  { id: "hand-on-heart", title: "Elini göğsüne koy, 5 sn nefes al", type: "recovery", duration: 8, priority: 3, intensity: "low" },
  { id: "step-outside", title: "Kapıya git, 5 sn dışarı bak", type: "recovery", duration: 8, priority: 4, intensity: "medium" },

  // ── Şablon: clear_mind ──────────────────────────────────────────────────
  { id: "tpl-clear-mind-write", title: "Zihnini tek cümleye indir", type: "focus", duration: 10, priority: 2, intensity: "medium" },
  { id: "tpl-clear-mind-open", title: "Zihin ekranını aç, imleç yansın", type: "focus", duration: 5, priority: 3, intensity: "low" },
  { id: "tpl-clear-breath-box", title: "4-4-4 nefes, sonra tek düşünceyi yaz", type: "focus", duration: 15, priority: 3, intensity: "low" },
  { id: "tpl-clear-list-one", title: "Kafandaki 3 şeyden birini seç, yaz", type: "focus", duration: 10, priority: 3, intensity: "medium" },
  { id: "tpl-clear-worry-out", title: "Endişeyi kağıda/ nota at, kapat", type: "focus", duration: 10, priority: 4, intensity: "medium" },

  // ── Şablon: moving_person ───────────────────────────────────────────────
  { id: "tpl-move-bounce-30", title: "30 sn olduğun yerde zıpla", type: "activation", duration: 15, priority: 3, intensity: "high" },
  { id: "tpl-move-pushup-1", title: "1 şınav çek", type: "activation", duration: 10, priority: 4, intensity: "high" },
  { id: "tpl-move-shoes", title: "Spor ayakkabılarını eline al", type: "recovery", duration: 5, priority: 4, intensity: "low" },
  { id: "tpl-move-squat-1", title: "1 squat yap", type: "activation", duration: 8, priority: 4, intensity: "medium" },
  { id: "tpl-move-stretch-arms", title: "Kollarını yukarı uzat, 5 sn tut", type: "activation", duration: 8, priority: 3, intensity: "low" },
  { id: "tpl-move-stairs-3", title: "3 basamak in veya çık", type: "activation", duration: 10, priority: 4, intensity: "medium" },

  // ── Şablon: learner ─────────────────────────────────────────────────────
  { id: "tpl-learn-first-line", title: "Kaynağı aç, ilk satıra bak", type: "consistency", duration: 15, priority: 2, intensity: "medium" },
  { id: "tpl-learn-name", title: "Kaynağın adını gör ve kapat", type: "consistency", duration: 5, priority: 2, intensity: "low" },
  { id: "tpl-learn-page-turn", title: "Bir sayfa çevir veya ileri kaydır", type: "consistency", duration: 8, priority: 3, intensity: "medium" },
  { id: "tpl-learn-one-fact", title: "Tek bir cümlelik bilgi oku", type: "consistency", duration: 12, priority: 3, intensity: "medium" },
  { id: "tpl-learn-bookmark", title: "Kaldığın yeri işaretle", type: "consistency", duration: 5, priority: 2, intensity: "low" },

  // ── Şablon: self_care ───────────────────────────────────────────────────
  { id: "tpl-self-water", title: "Bir bardak suyu masaya koy, yudum al", type: "recovery", duration: 10, priority: 4, intensity: "low" },
  { id: "tpl-self-glass", title: "Bardağı sadece masaya koy", type: "recovery", duration: 5, priority: 4, intensity: "low" },
  { id: "tpl-self-wash-face", title: "Yüzünü soğuk suyla 5 sn yıka", type: "recovery", duration: 10, priority: 3, intensity: "low" },
  { id: "tpl-self-lotion-hand", title: "Ellerine krem sür (tek el)", type: "recovery", duration: 10, priority: 2, intensity: "low" },
  { id: "tpl-self-posture", title: "Omuzlarını düzelt, 5 sn dik dur", type: "recovery", duration: 5, priority: 3, intensity: "low" },

  // ── Şablon: creator ─────────────────────────────────────────────────────
  { id: "tpl-creator-open", title: "Dosyayı aç, ilk satıra imleç götür", type: "consistency", duration: 5, priority: 3, intensity: "low" },
  { id: "tpl-creator-word", title: "Sadece bir kelime yaz ya da çiz", type: "consistency", duration: 10, priority: 3, intensity: "medium" },
  { id: "tpl-creator-idea", title: "Kafandaki tek fikri cümleyle yaz", type: "focus", duration: 10, priority: 3, intensity: "medium" },
  { id: "tpl-creator-title-only", title: "Sadece başlık satırı yaz", type: "consistency", duration: 8, priority: 3, intensity: "low" },
  { id: "tpl-creator-rough-line", title: "Taslak bir satır yaz, düzeltme yok", type: "consistency", duration: 12, priority: 4, intensity: "medium" },

  // ── Şablon: focused_worker ────────────────────────────────────────────
  { id: "tpl-focus-tab", title: "Tüm sekmeleri kapat, sadece bir tane bırak", type: "resistance", duration: 5, priority: 4, intensity: "medium" },
  { id: "tpl-focus-task", title: "Şu anki tek görevini yüksek sesle söyle", type: "focus", duration: 5, priority: 4, intensity: "medium" },
  { id: "tpl-focus-timer", title: "25 dakika sayacını başlat, telefonu çevir", type: "resistance", duration: 5, priority: 3, intensity: "high" },
  { id: "tpl-focus-notify-off", title: "Bildirimleri kapat veya odak modu aç", type: "focus", duration: 5, priority: 4, intensity: "medium" },
  { id: "tpl-focus-desk-one", title: "Masada sadece tek iş aracı bırak", type: "focus", duration: 10, priority: 3, intensity: "medium" },
  { id: "tpl-focus-5min", title: "5 dakikalık odak sayacı başlat", type: "resistance", duration: 5, priority: 3, intensity: "medium" },

  // ── Şablon: night_owl ───────────────────────────────────────────────────
  { id: "tpl-sleep-screen", title: "Ekranı kapat, gözlerini 10 sn kapat", type: "focus", duration: 10, priority: 4, intensity: "low" },
  { id: "tpl-sleep-phone", title: "Telefonu uzağa koy, yüzünü çevir", type: "resistance", duration: 3, priority: 4, intensity: "low" },
  { id: "tpl-sleep-breath", title: "4 sn nefes al, 4 sn tut, 4 sn ver", type: "recovery", duration: 15, priority: 4, intensity: "low" },
  { id: "tpl-sleep-dim-light", title: "Işığı kıs veya kapat", type: "resistance", duration: 5, priority: 3, intensity: "low" },
  { id: "tpl-sleep-alarm-set", title: "Yarın alarmını kontrol et", type: "consistency", duration: 8, priority: 2, intensity: "low" },
  { id: "tpl-sleep-gratitude", title: "Bugün için tek iyi şeyi fısılda", type: "recovery", duration: 8, priority: 3, intensity: "low" },

  // ── Şablon: social_builder ──────────────────────────────────────────────
  { id: "tpl-social-name", title: "Aklına gelen birinin ismini yaz", type: "consistency", duration: 5, priority: 3, intensity: "low" },
  { id: "tpl-social-msg", title: "Tek cümlelik bir mesaj taslağı yaz", type: "consistency", duration: 10, priority: 3, intensity: "medium" },
  { id: "tpl-social-smile", title: "Bir sonraki karşılaşmada gülümse niyetiyle dur", type: "focus", duration: 5, priority: 2, intensity: "low" },
  { id: "tpl-social-wave-plan", title: "Kime el sallayacağını düşün", type: "consistency", duration: 5, priority: 2, intensity: "low" },
  { id: "tpl-social-send-hi", title: "“Merhaba” veya “nasılsın” yaz, gönderme şart değil", type: "consistency", duration: 10, priority: 4, intensity: "medium" },
  { id: "tpl-social-voice-draft", title: "Sesli not için tek cümle kaydet", type: "consistency", duration: 12, priority: 3, intensity: "medium" },

  // ── Genel mikro adımlar (tüm şablonlar) ─────────────────────────────────
  { id: "micro-clap", title: "Bir kez alkışla", type: "activation", duration: 3, priority: 2, intensity: "low" },
  { id: "micro-stretch-neck", title: "Boynunu yavaşça sağa-sola çevir (bir kez)", type: "recovery", duration: 5, priority: 3, intensity: "low" },
  { id: "micro-feet", title: "Ayak tabanlarını yere bastır, 3 sn tut", type: "activation", duration: 5, priority: 3, intensity: "low" },
  { id: "micro-posture", title: "Omuzlarını geriye al, göğsünü 2 sn aç", type: "activation", duration: 5, priority: 3, intensity: "low" },
  { id: "micro-sip", title: "Su varsa bir yudum al", type: "recovery", duration: 5, priority: 3, intensity: "low" },
  { id: "micro-window", title: "Bir pencereye veya uzağa 5 sn bak", type: "focus", duration: 5, priority: 2, intensity: "low" },
  { id: "micro-name-habit", title: "Alışkanlığının adını yüksek sesle söyle", type: "consistency", duration: 5, priority: 2, intensity: "low" },
  { id: "micro-timer-10", title: "10 saniyelik sayaç başlat", type: "resistance", duration: 5, priority: 3, intensity: "medium" },
  { id: "micro-pen-paper", title: "Kalem veya telefon notunu aç", type: "consistency", duration: 5, priority: 2, intensity: "low" },
  { id: "micro-one-word", title: "Bugünkü niyeti tek kelimeyle yaz", type: "focus", duration: 10, priority: 2, intensity: "medium" },
  { id: "micro-shoes-on", title: "Ayakkabını giy veya eline al", type: "activation", duration: 5, priority: 3, intensity: "low" },
  { id: "micro-door", title: "Kapıya yürü, eşiğe bas", type: "activation", duration: 5, priority: 4, intensity: "medium" },
  { id: "micro-smile-mirror", title: "Kameraya veya aynaya 2 sn bak", type: "recovery", duration: 5, priority: 3, intensity: "low" },
  { id: "micro-inhale", title: "4 sn nefes al, 4 sn ver", type: "resistance", duration: 10, priority: 3, intensity: "low" },
  { id: "micro-stand-stretch", title: "Ayağa kalk, kollarını bir kez uzat", type: "activation", duration: 8, priority: 4, intensity: "medium" },
  { id: "micro-phone-away", title: "Telefonu bir kol uzaklığına koy", type: "resistance", duration: 5, priority: 4, intensity: "medium" },
  { id: "micro-anchor-say", title: "Çapanı yüksek sesle söyle", type: "consistency", duration: 5, priority: 3, intensity: "medium" },
  { id: "micro-tiny-rep-2", title: "En küçük tekrarı 2 kez yap", type: "consistency", duration: 12, priority: 3, intensity: "medium" },
  { id: "micro-commit", title: "“Şimdi başlıyorum” de ve hareket et", type: "resistance", duration: 5, priority: 4, intensity: "high" },
  { id: "micro-habit-start", title: "Alışkanlığın en küçük parçasını yap", type: "consistency", duration: 15, priority: 4, intensity: "medium" },
  { id: "micro-reset-breath", title: "Burnundan nefes al, ağızdan ver (3 kez)", type: "recovery", duration: 12, priority: 3, intensity: "low" },
];

export const ACTIONS_BY_TYPE: Record<MuscleType, Action[]> = {
  activation: ACTIONS.filter((a) => a.type === "activation"),
  consistency: ACTIONS.filter((a) => a.type === "consistency"),
  resistance: ACTIONS.filter((a) => a.type === "resistance"),
  focus: ACTIONS.filter((a) => a.type === "focus"),
  recovery: ACTIONS.filter((a) => a.type === "recovery"),
};

const MUSCLE_SEED: Record<MuscleType, number> = {
  activation: 11,
  consistency: 23,
  resistance: 37,
  focus: 41,
  recovery: 53,
};

/**
 * Aksiyon seçici. Aynı dakikada aynı kas için daha kararlı seed;
 * kesinti aksiyonları havuzdan çıkarılır.
 */
export function pickAction(
  muscle: MuscleType,
  excludeIds: string[] = [],
  seed?: number
): Action {
  const pool = ACTIONS_BY_TYPE[muscle].filter(
    (a) => !excludeIds.includes(a.id) && !a.isInterrupt
  );
  const list =
    pool.length > 0
      ? pool
      : ACTIONS_BY_TYPE[muscle].filter((a) => !a.isInterrupt);
  const base = seed ?? Date.now();
  const idx =
    Math.abs(Math.floor(base / 60000) + MUSCLE_SEED[muscle]) % list.length;
  return list[idx]!;
}

export function getActionById(id: string): Action | null {
  return ACTIONS.find((a) => a.id === id) ?? null;
}

/** Kas başına aksiyon sayısı (debug / içerik kontrolü). */
export function actionCatalogStats(): Record<MuscleType, number> {
  return {
    activation: ACTIONS_BY_TYPE.activation.length,
    consistency: ACTIONS_BY_TYPE.consistency.length,
    resistance: ACTIONS_BY_TYPE.resistance.length,
    focus: ACTIONS_BY_TYPE.focus.length,
    recovery: ACTIONS_BY_TYPE.recovery.length,
  };
}
