/**
 * Identity Tags — davranış motorunu besleyen konfigürasyon.
 *
 * Her şablon = davranış politikası:
 *   - kimlik ifadesi
 *   - somut çapa
 *   - mikro-aksiyon (default)
 *   - recovery (düşük enerji / yüksek effort günü)
 *   - preferredActionIds (engine/actions.ts içindeki id'ler)
 *
 * Yeni şablon eklemek = yeni obje + ilgili aksiyon id'lerini
 * engine/actions.ts'e eklemek.
 */

import { MuscleType } from "../engine/types";
import { TIME_RANGES } from "./theme";

export const TEMPLATE_SCHEMA_VERSION = 1;

export const IDENTITY_TAG_IDS = [
  "clear_mind",
  "moving_person",
  "learner",
  "self_care",
  "creator",
  "focused_worker",
  "night_owl",
  "social_builder",
] as const;

export type IdentityTagId = (typeof IDENTITY_TAG_IDS)[number];

/**
 * Şablon kimliği → kebab-case slug (check-in teyidi soru seti, analitik, vb.).
 * Özel / şablonsuz onboarding için `custom` kullanılır.
 */
export const IDENTITY_SLUG_BY_TAG_ID: Record<IdentityTagId, string> = {
  clear_mind: "mental-clarity",
  moving_person: "moving-body",
  learner: "lifelong-learner",
  self_care: "self-care",
  creator: "creator",
  focused_worker: "deep-focus",
  night_owl: "night-owl",
  social_builder: "social-builder",
};

export function getIdentitySlugForTag(
  tagId: string | null | undefined
): string {
  if (tagId == null) return "custom";
  const slug = IDENTITY_SLUG_BY_TAG_ID[tagId as IdentityTagId];
  return slug ?? "custom";
}

export type Pillar = "mental" | "body" | "career" | "self";

export interface TemplatePhase {
  /** [startDay, endDay] — 66-gün yolculuğu içindeki aralık */
  days: [number, number];
  /** Faz odağı (UI metni) */
  focus: string;
}

export interface IdentityTemplate {
  id: IdentityTagId;
  version: number;
  pillar: Pillar;
  emoji: string;
  title: string;
  blurb: string;
  identityStatement: string;
  /** "{anchor}, {shortHabitLabel} yapacağım." cümlesindeki kısa eylem */
  shortHabitLabel: string;
  /**
   * Onboarding önizlemesi: seçilen çapa metnine göre anlamlı eylem cümlesi.
   * Eşleşme yoksa shortHabitLabel kullanılır.
   */
  anchorPreviewByAnchor?: Partial<Record<string, string>>;
  /** Stable anchor ID — see constants/anchors.ts */
  defaultAnchor: string;
  defaultTimeId: string; // theme TIME_RANGES id
  /** Ana mikro-aksiyon metni (UI kopya) */
  microActionInitial: string;
  /** Yüksek effort / düşük enerji günü için fallback */
  recoveryAction: string;
  whyPlaceholder: string;
  /** Bu şablonun en çok çalıştırdığı kas (primaryMuscle). */
  primaryMuscle: MuscleType;
  /**
   * Motor, aksiyon seçerken bu id'leri önceler (sıra = öncelik).
   * Kaynak: engine/actions.ts (TEMPLATE_ACTIONS + ACTIONS)
   */
  preferredActionIds: string[];
  /**
   * Effort > scaleDownThreshold ise recoveryAction / son preferred
   * seçilir. (1–10 skalası; default 7)
   */
  scaleDownThreshold?: number;
  phases: {
    phase_1: TemplatePhase;
    phase_2: TemplatePhase;
    phase_3: TemplatePhase;
  };
  /** Kimlik Aynası için şablona özel müdahale cümleleri */
  mirror: {
    /** Düşüş/yorgunluk anahtarı yansırsa söylenecek koruyucu cümle */
    lowEnergy: string;
    /** Direnç / kızgınlık anahtarı */
    resistance: string;
    /** Pozitif otomatikleşme işareti */
    identity: string;
  };
}

function timeIdOrFallback(id: string, fallback: string): string {
  return TIME_RANGES.some((r) => r.id === id) ? id : fallback;
}

const DEFAULT_PHASES: IdentityTemplate["phases"] = {
  phase_1: { days: [1, 22], focus: "Kuruluş — Sadece başlat" },
  phase_2: { days: [23, 44], focus: "Pekiştirme — Akışa gir" },
  phase_3: { days: [45, 66], focus: "Otomatikleşme — Kimlik ol" },
};

export const IDENTITY_TEMPLATES: readonly IdentityTemplate[] = [
  {
    id: "clear_mind",
    version: 1,
    pillar: "mental",
    emoji: "🧠",
    title: "Zihni berrak biri",
    blurb: "Kafandaki gürültüyü tek satırla boşalt.",
    identityStatement: "Ben, zihni berrak ve önceliklerini bilen biriyim.",
    shortHabitLabel: "tek kaygımı on saniyede not edeceğim",
    anchorPreviewByAnchor: {
      after_morning_drink: "tek kaygımı on saniyede not edeceğim",
      after_brush: "aklımdan geçen tek şeyi not edeceğim",
      after_phone_down: "o anki düşünceyi tek cümleye dökeceğim",
      before_bed: "yarına taşımak istemediğim tek kaygıyı yazacağım",
      after_lunch: "öğleden sonra kafamı en çok meşgul eden konuyu yazacağım",
      after_wake: "ilk iki dakikada zihnimdeki gürültüyü not edeceğim",
      after_start_work: "işe başlamadan önce önceliğimi tek satır yazacağım",
    },
    defaultAnchor: "after_morning_drink",
    defaultTimeId: timeIdOrFallback("sabah", "sabah"),
    microActionInitial:
      "Zihin sekmesine tek cümle yaz: şu an kafana takılan en büyük şey.",
    recoveryAction: "Zihin sekmesini aç; imleç beklesin — yeterli.",
    whyPlaceholder:
      "Zihnimin kalabalığını fark ediyorum çünkü…\n(Ör: dikkatim dağınık, erteliyorum…)",
    primaryMuscle: "focus",
    preferredActionIds: [
      "tpl-clear-mind-write",
      "tpl-clear-mind-open",
      "tpl-clear-breath-box",
      "tpl-clear-list-one",
      "tpl-clear-worry-out",
      "close-eyes",
      "blink-reset",
      "screen-blank",
      "micro-one-word",
    ],
    scaleDownThreshold: 7,
    phases: {
      phase_1: { days: [1, 22], focus: "Kuruluş — Kafandakini yaz." },
      phase_2: { days: [23, 44], focus: "Pekiştirme — Öncelikle ayır." },
      phase_3: { days: [45, 66], focus: "Otomatikleşme — Zihin sakin." },
    },
    mirror: {
      lowEnergy:
        "Zihni berrak biri olarak bugün sadece Zihin sekmesini açman yeter. Sistem seni koruyor.",
      resistance:
        "Zihni berrak biri, direnci yazıya döker. 10 saniye, tek cümle.",
      identity: "Dağınıklıktan netliğe. Zihnin artık boşluğu tanıyor.",
    },
  },
  {
    id: "moving_person",
    version: 1,
    pillar: "body",
    emoji: "🦿",
    title: "Hareket eden biri",
    blurb: "Her gün küçük hareket — mükemmellik değil, ivme.",
    identityStatement: "Ben, vücuduna saygı duyan ve her gün hareket eden biriyim.",
    shortHabitLabel: "küçük bir hareket yapacağım",
    anchorPreviewByAnchor: {
      after_arrive_home: "eve gelince kısa bir hareket yapacağım",
      after_morning_drink: "sabah içeceğinden sonra 30 sn hareket edeceğim",
      after_brush: "fırçaladıktan sonra 5 squat veya şınav deneyeceğim",
      after_phone_down: "telefonu koyunca omuz çevirip hareket edeceğim",
      before_bed: "yatmadan önce hafif esneme yapacağım",
      after_lunch: "öğle sonrası kısa yürüyüş veya zıplama yapacağım",
      after_wake: "uyanınca bir dakika esneme yapacağım",
      after_start_work: "işe başlamadan önce 30 sn hareket edeceğim",
    },
    defaultAnchor: "after_arrive_home",
    defaultTimeId: timeIdOrFallback("aksam", "aksam"),
    microActionInitial:
      "30 saniye olduğun yerde zıpla veya 1 şınav çek.",
    recoveryAction:
      "Sadece spor ayakkabılarını eline al ve 5 saniye bak.",
    whyPlaceholder:
      "Hareketi sürekli erteliyorum çünkü…\n(Ör: zaman yok, yorgunum…)",
    primaryMuscle: "activation",
    preferredActionIds: [
      "tpl-move-bounce-30",
      "tpl-move-pushup-1",
      "tpl-move-squat-1",
      "tpl-move-stretch-arms",
      "tpl-move-stairs-3",
      "tpl-move-shoes",
      "walk-5",
      "jump-once",
      "micro-stand-stretch",
    ],
    scaleDownThreshold: 7,
    phases: {
      phase_1: { days: [1, 22], focus: "Kuruluş — Harekete geç." },
      phase_2: { days: [23, 44], focus: "Pekiştirme — Süreyi büyüt." },
      phase_3: { days: [45, 66], focus: "Otomatikleşme — Vücut çağırır." },
    },
    mirror: {
      lowEnergy:
        "Hareket eden biri olarak bugün ayakkabılarına tek bakış yeter. Sistem seni koruyor.",
      resistance:
        "Direnç anı — 30 sn zıplama dirençten büyüktür. Şimdi.",
      identity: "Zorlanmıyorsun. Vücudun artık sıranı biliyor.",
    },
  },
  {
    id: "learner",
    version: 1,
    pillar: "career",
    emoji: "📚",
    title: "Öğrenen biri",
    blurb: "Bir satır bile yeter — başlamak kazançtır.",
    identityStatement: "Ben, her gün yeni bir tuğla koyan, öğrenen biriyim.",
    shortHabitLabel: "öğrenme kaynağımı açıp yalnızca ilk satıra bakacağım",
    anchorPreviewByAnchor: {
      after_phone_down: "kaynağı açıp yalnızca ilk satıra bakacağım",
      after_morning_drink: "sabah içeceğinden sonra ilk satıra bakacağım",
      after_brush: "fırçaladıktan sonra öğrenme penceresini açacağım",
      before_bed: "yarının tek öğrenme hedefini bir satır yazacağım",
      after_lunch: "öğle arasında ilk satıra bakacağım",
      after_wake: "uyanınca kaynağı açıp ilk satıra bakacağım",
      after_start_work: "işe başlarken tek öğrenme kaynağını açacağım",
    },
    defaultAnchor: "after_phone_down",
    defaultTimeId: timeIdOrFallback("gece", "gece"),
    microActionInitial:
      "Kaynağı (kitap/app/ders) aç ve sadece ilk satıra bak (15 sn).",
    recoveryAction:
      "Kaynağın sadece adını gör ve 'bu bana ait' de, kapat.",
    whyPlaceholder:
      "Öğrenmek istediğim şeyi büyüttüğüm için erteliyorum çünkü…",
    primaryMuscle: "consistency",
    preferredActionIds: [
      "tpl-learn-first-line",
      "tpl-learn-name",
      "tpl-learn-page-turn",
      "tpl-learn-one-fact",
      "tpl-learn-bookmark",
      "open-window",
      "read-one-word",
      "count-three",
      "tool-ready",
    ],
    scaleDownThreshold: 7,
    phases: {
      phase_1: { days: [1, 22], focus: "Kuruluş — Sadece aç." },
      phase_2: { days: [23, 44], focus: "Pekiştirme — 5 dk oku/çalış." },
      phase_3: { days: [45, 66], focus: "Otomatikleşme — Bilgi birikiyor." },
    },
    mirror: {
      lowEnergy:
        "Öğrenen biri olarak bugün kaynağı klasörde bile görmen yeter. Satır sonra.",
      resistance:
        "Direnç bilgiyi büyütüyor — açmak, büyümesini durdurur. Şimdi aç.",
      identity: "Her tuğla yerine. Artık 'öğreniyorum' değil, 'öğrenen biriyim'.",
    },
  },
  {
    id: "self_care",
    version: 1,
    pillar: "self",
    emoji: "💧",
    title: "Kendine bakan biri",
    blurb: "Su, nefes, küçük bakım — önce sen.",
    identityStatement: "Ben, kendi ihtiyaçlarını ihmal etmeyen, sistemli biriyim.",
    shortHabitLabel: "bir bardak su hazırlayıp en az bir yudum içeceğim",
    anchorPreviewByAnchor: {
      after_brush: "bir bardak su hazırlayıp bir yudum içeceğim",
      after_morning_drink: "içecekten önce bir yudum su içeceğim",
      after_phone_down: "ekrana dönmeden önce bir yudum su içeceğim",
      before_bed: "yatmadan önce son bir yudum su içeceğim",
      after_lunch: "öğle arasında suyu hatırlayıp bir yudum içeceğim",
      after_wake: "ilk iş olarak masaya su koyup bir yudum alacağım",
      after_start_work: "işe başlarken masaya su koyacağım",
    },
    defaultAnchor: "after_brush",
    defaultTimeId: timeIdOrFallback("sabah", "sabah"),
    microActionInitial: "Bir bardak suyu masaya koy ve bir yudum al.",
    recoveryAction: "Bardağı sadece masaya koy. Yudum sonra.",
    whyPlaceholder:
      "Kendimi son sıraya atıyorum çünkü…\n(Ör: herkes önce, ben sonra…)",
    primaryMuscle: "recovery",
    preferredActionIds: [
      "tpl-self-water",
      "tpl-self-glass",
      "tpl-self-wash-face",
      "tpl-self-lotion-hand",
      "tpl-self-posture",
      "drink-water",
      "micro-sip",
      "hand-on-heart",
      "slow-exhale-3",
    ],
    scaleDownThreshold: 7,
    phases: {
      phase_1: { days: [1, 22], focus: "Kuruluş — Su + nefes." },
      phase_2: { days: [23, 44], focus: "Pekiştirme — Ritüel oturuyor." },
      phase_3: { days: [45, 66], focus: "Otomatikleşme — Kendine saygı." },
    },
    mirror: {
      lowEnergy:
        "Kendine bakan biri olarak bugün bardağı görmek bile yeterli.",
      resistance:
        "Bir yudum, erteleme cümlesinden kısa. Şimdi.",
      identity: "Kendine dönen el, alışkanlık değil — karakter.",
    },
  },
  {
    id: "creator",
    version: 1,
    pillar: "career",
    emoji: "✍️",
    title: "Yaratan biri",
    blurb: "Mükemmellik yok; dosyayı açmak üretmektir.",
    identityStatement: "Ben, her gün bir şeyler yaratan ve üretimini kesmeyenin biriyim.",
    shortHabitLabel: "yaratıcı işime küçük bir dokunuş yapacağım",
    anchorPreviewByAnchor: {
      after_morning_drink: "yaratıcı dosyamı açıp imleci ilk satıra götüreceğim",
      after_brush: "rutin sonrası yaratıcı işime dokunacağım",
      after_phone_down: "üretim alanıma tek bir dokunuş yapacağım",
      before_bed: "yarının tek üretim satırını not edeceğim",
      after_lunch: "öğle arasında yaratıcı işime dokunacağım",
      after_wake: "güne yaratıcı dosyamı açarak başlayacağım",
      after_start_work: "işe başlarken üretim dosyamı açacağım",
    },
    defaultAnchor: "after_morning_drink",
    defaultTimeId: timeIdOrFallback("sabah", "sabah"),
    microActionInitial:
      "Dosyayı aç ve sadece ilk satıra imleç götür. Yazmak zorunda değilsin — sadece aç.",
    recoveryAction: "Kafandaki tek fikri bir kelimeyle not et, kapat.",
    whyPlaceholder:
      "Yaratmayı erteliyorum çünkü…\n(Ör: mükemmel olmak zorundayım, korku…)",
    primaryMuscle: "consistency",
    preferredActionIds: [
      "tpl-creator-open",
      "tpl-creator-word",
      "tpl-creator-idea",
      "tpl-creator-title-only",
      "tpl-creator-rough-line",
      "pen-cap-off",
      "micro-pen-paper",
      "count-three",
      "no-explain",
    ],
    scaleDownThreshold: 7,
    phases: {
      phase_1: { days: [1, 22], focus: "Kuruluş — Sadece aç." },
      phase_2: { days: [23, 44], focus: "Pekiştirme — Her gün bir parça." },
      phase_3: { days: [45, 66], focus: "Otomatikleşme — Yaratıcılık kimliğin." },
    },
    mirror: {
      lowEnergy:
        "Yaratan biri olarak bugün sadece dosyayı açman yeter. Sistem seni koruyor.",
      resistance:
        "Direnç yaratıcılığın bir parçası. Tek kelime, dirençten daha büyük.",
      identity: "Küçük çıktılar birikir. Yaratan biri artık sadece fikir değilsin.",
    },
  },
  {
    id: "focused_worker",
    version: 1,
    pillar: "career",
    emoji: "🎯",
    title: "Odaklı çalışan biri",
    blurb: "Tek sekme, tek iş — dağınıklığı kes.",
    identityStatement: "Ben, dikkatini seçen ve tek işe tam odaklanabilen biriyim.",
    shortHabitLabel: "tek göreve odak geçişi yapacağım",
    anchorPreviewByAnchor: {
      after_start_work: "işe başlarken tek sekmede tek göreve kilitleneceğim",
      after_morning_drink: "içecekten sonra tüm sekmeleri kapatıp tek göreve geçeceğim",
      after_brush: "sabah rutininden sonra tek görev seçeceğim",
      after_phone_down: "telefonu koyunca tek göreve 5 dk odak vereceğim",
      before_bed: "yarının tek önceliğini yazıp işi kapatacağım",
      after_lunch: "öğle sonrası tek pencerede odak bloğu açacağım",
      after_wake: "bugünün ana işini seçip ona kilitleneceğim",
    },
    defaultAnchor: "after_start_work",
    defaultTimeId: timeIdOrFallback("sabah", "sabah"),
    microActionInitial:
      "Tüm sekmeleri kapat, tek bir görev bırak. Sadece o ekranla kal.",
    recoveryAction: "Şu anki tek görevini yüksek sesle söyle, 1 dk o işe bak.",
    whyPlaceholder:
      "Dikkatsizlikten şikayetim var çünkü…\n(Ör: her şey önüme geliyor, bildirimler…)",
    primaryMuscle: "focus",
    preferredActionIds: [
      "tpl-focus-tab",
      "tpl-focus-task",
      "tpl-focus-timer",
      "tpl-focus-notify-off",
      "tpl-focus-desk-one",
      "tpl-focus-5min",
      "mute-notifications",
      "phone-down",
      "single-task-say",
      "stop-scroll-thumb",
    ],
    scaleDownThreshold: 8,
    phases: {
      phase_1: { days: [1, 22], focus: "Kuruluş — Sekmeleri kapat." },
      phase_2: { days: [23, 44], focus: "Pekiştirme — Derinlik süresi artar." },
      phase_3: { days: [45, 66], focus: "Otomatikleşme — Odak artık refleks." },
    },
    mirror: {
      lowEnergy:
        "Odaklı çalışan biri olarak bugün sadece tek sekme bırakman yeter.",
      resistance:
        "Dikkat dağıtıcıları kapatmak da bir üretim hareketidir. Şimdi kapat.",
      identity: "Derinlik seçiyorsun. Bu artık çalışma tarzın.",
    },
  },
  {
    id: "night_owl",
    version: 1,
    pillar: "self",
    emoji: "🌙",
    title: "Düzenli uyuyan biri",
    blurb: "Ekranı kapat — uykunu koru.",
    identityStatement: "Ben, uykusunu ciddiye alan ve geceleri kapatan biriyim.",
    shortHabitLabel: "ekranı kapatıp uykuya geçiş ritüelimi yapacağım",
    anchorPreviewByAnchor: {
      before_bed: "ekranı kapatıp uyku ritüeline geçeceğim",
      after_phone_down: "ekranı kapatıp on saniye nefesle günü kapatacağım",
      after_brush: "telefonu odadan çıkarıp uyku ritüeline geçeceğim",
      after_morning_drink: "akşam için uyku sınırımı hatırlatacağım",
      after_lunch: "bu akşam yatış saatimi netleştireceğim",
      after_wake: "bugün için yatış ritüel saatimi belirleyeceğim",
      after_start_work: "akşam ekran sınırımı kendime hatırlatacağım",
    },
    defaultAnchor: "before_bed",
    defaultTimeId: timeIdOrFallback("gece", "gece"),
    microActionInitial:
      "Ekranı kapat. 10 saniye sadece gözlerini kapat, nefes al.",
    recoveryAction: "Telefonu ters çevir, 4 sn nefes al — yeter.",
    whyPlaceholder:
      "Geç saate kadar uyanık kalıyorum çünkü…\n(Ör: ekrandan kopamıyorum, düşünceler…)",
    primaryMuscle: "resistance",
    preferredActionIds: [
      "tpl-sleep-phone",
      "tpl-sleep-screen",
      "tpl-sleep-breath",
      "tpl-sleep-dim-light",
      "tpl-sleep-gratitude",
      "tpl-sleep-alarm-set",
      "phone-down",
      "box-breath-4",
      "micro-phone-away",
    ],
    scaleDownThreshold: 6,
    phases: {
      phase_1: { days: [1, 22], focus: "Kuruluş — Telefonu kapat." },
      phase_2: { days: [23, 44], focus: "Pekiştirme — Ritüel oturuyor." },
      phase_3: { days: [45, 66], focus: "Otomatikleşme — Gece sinyali beyin bilir." },
    },
    mirror: {
      lowEnergy:
        "Düzenli uyuyan biri olarak bugün sadece telefonu ters çevirmen yeter.",
      resistance:
        "Ekranı kapatmak bir kayıp değil — birikiminin korunması. Şimdi kapat.",
      identity: "Beynin dinlenmeyi hak ediyor. Bu artık seni tanımlar.",
    },
  },
  {
    id: "social_builder",
    version: 1,
    pillar: "self",
    emoji: "🤝",
    title: "Bağ kuran biri",
    blurb: "Küçük temas — ilişki büyür.",
    identityStatement: "Ben, insanlarla gerçek bağ kuran ve ilişkilerini besleyen biriyim.",
    shortHabitLabel: "biriyle küçük bir temas kuracağım",
    anchorPreviewByAnchor: {
      after_lunch: "biriyle kısa bir temas kuracağım",
      after_morning_drink: "birine kısa bir merhaba yazacağım",
      after_brush: "aklıma gelen birine küçük temas planlayacağım",
      after_phone_down: "birinin adını yazıp gün içi mesajımı hatırlatacağım",
      before_bed: "sevdiğim birine iyi geceler düşüneceğim",
      after_wake: "bugün kiminle bağ kurmak istediğimi yazacağım",
      after_start_work: "işe başlarken birine kısa check-in planlayacağım",
    },
    defaultAnchor: "after_lunch",
    defaultTimeId: timeIdOrFallback("ogle", "ogle"),
    microActionInitial:
      "Aklına gelen birinin adını yaz. Bir şey söylemek zorunda değilsin — sadece düşün.",
    recoveryAction: "Birini düşün ve 'nasılsın' demeyi planla — yazmasan da olur.",
    whyPlaceholder:
      "İlişkilerimi ihmal ediyorum çünkü…\n(Ör: zamanım yok, ne diyeceğimi bilmiyorum…)",
    primaryMuscle: "consistency",
    preferredActionIds: [
      "tpl-social-name",
      "tpl-social-msg",
      "tpl-social-smile",
      "tpl-social-send-hi",
      "tpl-social-voice-draft",
      "tpl-social-wave-plan",
      "say-identity",
      "anchor-touch",
      "micro-pen-paper",
    ],
    scaleDownThreshold: 7,
    phases: {
      phase_1: { days: [1, 22], focus: "Kuruluş — İsim yaz." },
      phase_2: { days: [23, 44], focus: "Pekiştirme — Mesaj gönder." },
      phase_3: { days: [45, 66], focus: "Otomatikleşme — Bağ kurmak refleks." },
    },
    mirror: {
      lowEnergy:
        "Bağ kuran biri olarak bugün sadece birini düşünmen yeter. Sistem seni koruyor.",
      resistance:
        "Mükemmel bir şey söylemek zorunda değilsin. Tek kelime, hiçbir şeyden büyük.",
      identity: "Her gün bir temas. Bu artık ilişki kurma biçimin.",
    },
  },
] as const;

const BY_ID: Record<string, IdentityTemplate> = Object.fromEntries(
  IDENTITY_TEMPLATES.map((t) => [t.id, t])
);

/** Onboarding 2. adımda önizleme: çapa + şablona uygun eylem metni */
export function previewHabitPhraseForAnchor(
  template: IdentityTemplate | null | undefined,
  selectedAnchorId: string | null,
  habitFallback: string
): string {
  const { localizeAnchorPreview, localizeShortHabitLabel } =
    require("../i18n/localizeContent") as typeof import("../i18n/localizeContent");
  if (!template) return habitFallback;
  if (!selectedAnchorId) {
    return localizeShortHabitLabel(template.id, template.shortHabitLabel);
  }
  const mapped = template.anchorPreviewByAnchor?.[selectedAnchorId];
  if (mapped) {
    return localizeAnchorPreview(template.id, selectedAnchorId, mapped);
  }
  return localizeShortHabitLabel(template.id, template.shortHabitLabel);
}

export function getIdentityTemplate(
  id: string | null | undefined
): IdentityTemplate | null {
  if (!id) return null;
  return BY_ID[id] ?? null;
}

export function isIdentityTagId(id: string): id is IdentityTagId {
  return (IDENTITY_TAG_IDS as readonly string[]).includes(id);
}

export function getTemplatePhaseFocus(
  tpl: IdentityTemplate,
  dayNumber: number
): string {
  const { phase_1, phase_2, phase_3 } = tpl.phases;
  if (dayNumber <= phase_1.days[1]) return phase_1.focus;
  if (dayNumber <= phase_2.days[1]) return phase_2.focus;
  return phase_3.focus;
}
