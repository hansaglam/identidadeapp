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
    blurb:
      "Dikkat yoğunken zihnine nefes alanı açmak. Küçük bir yazı veya Zihin sekmesi — aynı yönde küçült.",
    identityStatement: "Ben, zihni berrak ve önceliklerini bilen biriyim.",
    shortHabitLabel: "kafamdaki en büyük kaygıyı on saniyede not edeceğim",
    anchorPreviewByAnchor: {
      "Kahvemi içtikten sonra":
        "kafamdaki tek kaygıyı on saniyede not edeceğim",
      "Dişlerimi fırçaladıktan sonra":
        "aklımdan geçen tek şeyi hemen not edeceğim",
      "Telefonu elimden bıraktıktan sonra":
        "o anki düşünceyi tek cümleye dökeceğim",
      "Yatağa girmeden önce":
        "yarına taşımak istemediğim tek kaygıyı yazıp bırakacağım",
      "Öğle yemeğinden sonra":
        "öğleden sonra kafamı en çok meşgul eden konuyu on saniyede yazacağım",
      "Uyandıktan hemen sonra":
        "ilk iki dakikada zihnimdeki gürültüyü not edeceğim",
    },
    defaultAnchor: "Kahvemi içtikten sonra",
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
      "close-eyes",
      "one-thing",
      "screen-blank",
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
    blurb: "‘Ya hep ya hiç’e son. Küçük hareket = ivme — kendi temponda.",
    identityStatement: "Ben, vücuduna saygı duyan ve her gün hareket eden biriyim.",
    shortHabitLabel: "bir küçük hareket yapacağım — örneğin bir şınav veya otuz saniye zıplama",
    anchorPreviewByAnchor: {
      "Eve geldikten ve ayakkabılarımı çıkardıktan sonra":
        "bir küçük hareket yapacağım; örneğin bir şınav veya otuz saniye zıplama",
      "Kahvemi içtikten sonra": "yerimde otuz saniye hareket edeceğim",
      "Dişlerimi fırçaladıktan sonra":
        "fırçaladıktan sonra beş şınav veya squat deneyeceğim",
      "Telefonu elimden bıraktıktan sonra":
        "telefonu koyunca omuz çevirip otuz saniye hareket edeceğim",
      "Yatağa girmeden önce":
        "yatmadan önce hafif esneme veya on squat yapacağım",
      "Öğle yemeğinden sonra":
        "öğle sonrası kısa yürüyüş veya zıplama yapacağım",
      "Uyandıktan hemen sonra":
        "uyanınca bir dakika esneme veya yerinde zıplama yapacağım",
    },
    defaultAnchor: "Eve geldikten ve ayakkabılarımı çıkardıktan sonra",
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
      "tpl-move-shoes",
      "walk-5",
      "shake-shoulders",
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
    blurb:
      "Büyük hedefi küçült: bir satır, bir ilk sayfa bile başlangıçtır. Başlatmayı hafif tut.",
    identityStatement: "Ben, her gün yeni bir tuğla koyan, öğrenen biriyim.",
    shortHabitLabel: "öğrenme kaynağımı açıp yalnızca ilk satıra bakacağım",
    anchorPreviewByAnchor: {
      "Kahvemi içtikten sonra":
        "öğrenme kaynağımı açıp yalnızca ilk satıra bakacağım",
      "Dişlerimi fırçaladıktan sonra":
        "öğrenme penceremi açıp yalnızca ilk satıra bakacağım",
      "Telefonu elimden bıraktıktan sonra":
        "kaynağı açıp yalnızca ilk satıra bakacağım",
      "Yatağa girmeden önce":
        "yarının tek öğrenme hedefini bir satırda yazıp bırakacağım",
      "Öğle yemeğinden sonra":
        "kaynağı açıp yalnızca ilk satıra bakacağım",
      "Uyandıktan hemen sonra":
        "öğrenme kaynağımı açıp yalnızca ilk satıra bakacağım",
    },
    defaultAnchor: "Telefonu elimden bıraktıktan sonra",
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
      "open-window",
      "one-thing",
      "count-three",
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
    blurb:
      "Kendini son sıraya atma ritüeli: önce bardak, sonra nefes — en düşük direnç.",
    identityStatement: "Ben, kendi ihtiyaçlarını ihmal etmeyen, sistemli biriyim.",
    shortHabitLabel: "bir bardak su hazırlayıp en az bir yudum içeceğim",
    anchorPreviewByAnchor: {
      "Kahvemi içtikten sonra":
        "kahveye başlamadan bir bardak su içeceğim",
      "Dişlerimi fırçaladıktan sonra":
        "bir bardak su hazırlayıp en az bir yudum içeceğim",
      "Telefonu elimden bıraktıktan sonra":
        "ekrana dönmeden önce bir yudum su içeceğim",
      "Yatağa girmeden önce": "yatağa girmeden son bir yudum su içeceğim",
      "Öğle yemeğinden sonra":
        "öğle arasında suyu hatırlayıp bir yudum içeceğim",
      "Uyandıktan hemen sonra":
        "ilk iş olarak masaya su koyup bir yudum alacağım",
    },
    defaultAnchor: "Dişlerimi fırçaladıktan sonra",
    defaultTimeId: timeIdOrFallback("sabah", "sabah"),
    microActionInitial: "Bir bardak suyu masaya koy ve bir yudum al.",
    recoveryAction: "Bardağı sadece masaya koy. Yudum sonra.",
    whyPlaceholder:
      "Kendimi son sıraya atıyorum çünkü…\n(Ör: herkes önce, ben sonra…)",
    primaryMuscle: "recovery",
    preferredActionIds: [
      "tpl-self-water",
      "tpl-self-glass",
      "drink-water",
      "deep-breath",
      "stand-up",
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
    blurb:
      "Mükemmellik yok; küçük dokunuş bile sayılır. Dosyayı aç, yazmak şart değil.",
    identityStatement: "Ben, her gün bir şeyler yaratan ve üretimini kesmeyenin biriyim.",
    shortHabitLabel: "yaratıcı işime küçük bir dokunuş yapacağım",
    anchorPreviewByAnchor: {
      "Kahvemi içtikten sonra":
        "yaratıcı dosyamı açıp imleci ilk satıra götüreceğim",
      "Dişlerimi fırçaladıktan sonra":
        "rutin sonrası yaratıcı işime küçük bir dokunuş yapacağım",
      "Telefonu elimden bıraktıktan sonra":
        "üretim alanıma tek bir dokunuş yapacağım",
      "Yatağa girmeden önce":
        "yarının tek üretim satırını not edeceğim",
      "Öğle yemeğinden sonra":
        "öğle arasında yaratıcı işime küçük bir dokunuş yapacağım",
      "Uyandıktan hemen sonra":
        "güne yaratıcı dosyamı açarak başlayacağım",
    },
    defaultAnchor: "Kahvemi içtikten sonra",
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
      "one-thing",
      "count-three",
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
    blurb: "Çoklu görev yok: önce tek sekme tek iş. Derinlik için küçük bloklar.",
    identityStatement: "Ben, dikkatini seçen ve tek işe tam odaklanabilen biriyim.",
    shortHabitLabel: "bir derin odak geçişi yapacağım",
    anchorPreviewByAnchor: {
      "Bilgisayarımı açtıktan sonra": "bir derin odak geçişi yapacağım",
      "Kahvemi içtikten sonra":
        "tüm sekmeleri kapatıp tek göreve kilitleneceğim",
      "Dişlerimi fırçaladıktan sonra":
        "sabah rutininden sonra tek sekmede tek görev seçeceğim",
      "Telefonu elimden bıraktıktan sonra":
        "tek göreve beş dakika tam odak vereceğim",
      "Yatağa girmeden önce":
        "işi kapatıp yarının tek önceliğini yazacağım",
      "Öğle yemeğinden sonra":
        "tek pencerede derin odak bloğu açacağım",
      "Uyandıktan hemen sonra":
        "bugünün tek ana işini seçip ona kilitleneceğim",
    },
    defaultAnchor: "Bilgisayarımı açtıktan sonra",
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
      "close-eyes",
      "phone-down",
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
    blurb:
      "Ekran bitmiyor uyku bitiyor. Bilinçli kapanış: ekran kapanır beynin nefes alır.",
    identityStatement: "Ben, uykusunu ciddiye alan ve geceleri kapatan biriyim.",
    shortHabitLabel: "ekranı kapatıp uykuya geçiş ritüelimi yapacağım",
    anchorPreviewByAnchor: {
      "Kahvemi içtikten sonra":
        "ekranı erken azaltıp yavaşlama sinyali vereceğim",
      "Dişlerimi fırçaladıktan sonra":
        "telefonu odadan çıkarıp uyku ritüeline geçeceğim",
      "Telefonu elimden bıraktıktan sonra":
        "ekranı kapatıp on saniye nefesle günü kapatacağım",
      "Yatağa girmeden önce":
        "ekranı kapatıp uykuya geçiş ritüelimi yapacağım",
      "Öğle yemeğinden sonra":
        "akşam için uyku sınırımı kendime hatırlatacağım",
      "Uyandıktan hemen sonra":
        "bugün için yatış ritüel saatimi netleştireceğim",
    },
    defaultAnchor: "Yatağa girmeden önce",
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
      "close-eyes",
      "deep-breath",
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
    blurb:
      "Büyük jest şart değil: minik temaslar; mesaj, selam, iyi dilek. Bağ her gün biraz büyür.",
    identityStatement: "Ben, insanlarla gerçek bağ kuran ve ilişkilerini besleyen biriyim.",
    shortHabitLabel: "biriyle küçük bir temas kuracağım",
    anchorPreviewByAnchor: {
      "Kahvemi içtikten sonra":
        "birine kısa bir merhaba veya nasılsın yazacağım",
      "Dişlerimi fırçaladıktan sonra":
        "aklıma gelen birine küçük bir temas planlayacağım",
      "Telefonu elimden bıraktıktan sonra":
        "birinin adını yazıp gün içi mesajımı hatırlatacağım",
      "Yatağa girmeden önce":
        "sevdiğim birine iyi geceler veya kısa bir not düşüneceğim",
      "Öğle yemeğinden sonra": "biriyle küçük bir temas kuracağım",
      "Uyandıktan hemen sonra":
        "bugün kiminle bağ kurmak istediğimi tek cümle yazacağım",
    },
    defaultAnchor: "Öğle yemeğinden sonra",
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
      "say-identity",
      "anchor-touch",
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
  selectedAnchor: string | null,
  habitFallback: string
): string {
  if (!template) return habitFallback;
  if (!selectedAnchor) return template.shortHabitLabel;
  const mapped = template.anchorPreviewByAnchor?.[selectedAnchor];
  return mapped ?? template.shortHabitLabel;
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
