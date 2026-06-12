/**
 * Check-in hızlı teyit soruları — habit.identitySlug ile eşleşir.
 * Metinler locale JSON (`checkInConfirmation.*`); TS sadece yedek.
 */

import i18n from "../i18n/config";

export interface CheckInConfirmationConfig {
  title: string;
  subtitle: string;
  /** Grid seçenekleri ("Diğer" UI'da ayrı eklenir). */
  options: string[];
}

const DEFAULT_CUSTOM: CheckInConfirmationConfig = {
  title: "Bugün bu kimlik yönünde neredeydin?",
  subtitle: "Küçük adım, yarım kalan veya sadece fark etmek — hepsi sayılır.",
  options: [
    "İstediğim gibi ilerledim",
    "Kısmen yaptım, yarıda kaldı",
    "Zorlandım ama yine de denedim",
    "Enerjim düşüktü, mini sürüm yaptım",
    "Başka öncelikler öne geçti",
    "Sadece niyet ettim, hareket az",
    "Bugün dinlenmeyi seçtim",
    "Hızlı bir not almak yeterli oldu",
  ],
};

const BY_SLUG: Record<string, CheckInConfirmationConfig> = {
  "mental-clarity": {
    title: "Zihni berrak biri olarak bugün neredeydin?",
    subtitle: "Dağınıklık da veri — yazmak veya fark etmek bile ilerlemedir.",
    options: [
      "Kaygıyı veya düşünceyi not ettim",
      "Zihnimi tek önceliğe indirdim",
      "Kısa nefes + tek cümle yeterli oldu",
      "Kararsızlığı azalttım, netleştim",
      "Sadece fark ettim, yazmadım",
      "Dağınık geçti — yine de gözlemledim",
      "Bugün zihin dinlenmesi gerekti",
      "Yarın için tek satır plan bıraktım",
    ],
  },
  "moving-body": {
    title: "Hareket eden biri olarak bugün neredeydin?",
    subtitle: "30 saniye bile sayılır — mükemmellik değil, görünürlük.",
    options: [
      "Planladığım hareketi tamamladım",
      "Kısa hareket / esneme yeterli oldu",
      "Yürüyüş veya merdiven bile ivme verdi",
      "Vücudumu dinledim, dinlendim",
      "Zaman yetmedi ama niyet vardı",
      "Yarım kaldı — yine de denedim",
      "Ağrı/yorgunluk vardı, mini sürüm",
      "Bugün hareket şart değildi",
    ],
  },
  "lifelong-learner": {
    title: "Öğrenen biri olarak bugün neredeydin?",
    subtitle: "Bir satır, bir sayfa, bir merak — hepsi öğrenme sinyali.",
    options: [
      "Küçük bir şey okudum veya izledim",
      "Not aldım veya tekrar ettim",
      "Kaynağı açıp tek adım attım",
      "Sadece merak ettim, kaydettim",
      "Bugün olmadı — sorun değil",
      "Yarın telafi için işaret bıraktım",
      "Öğrenmeyi iş/günlük hayata bağladım",
      "Kısa da olsa yeni bir fikir yakaladım",
    ],
  },
  "self-care": {
    title: "Kendine iyi bakan biri olarak bugün neredeydin?",
    subtitle: "İyilik küçük olabilir — sınır, mola, su, nefes.",
    options: [
      "Kendime küçük bir iyilik yaptım",
      "Dinlenmeye bilinçli izin verdim",
      "Sınır koydum veya hayır dedim",
      "Kısa mola + nefes aldım",
      "Farkındalık anı yakaladım",
      "Bugün zordu, yine de fark ettim",
      "Su / uyku / beslenmeye dikkat ettim",
      "Kendime yargısız davrandım",
    ],
  },
  creator: {
    title: "Üreten biri olarak bugün neredeydin?",
    subtitle: "Taslak, tek kelime, tek satır — üretim böyle başlar.",
    options: [
      "Üzerinde çalıştım, ilerleme oldu",
      "Taslak veya fikir çıkardım",
      "Az da olsa somut bir adım",
      "Sadece başlamak yetti",
      "Beklentimi düşürdüm, devam ettim",
      "Bugün üretim günü değildi",
      "Düzenleme yerine ham çıktı verdim",
      "Yarın için tek cümlelik plan yazdım",
    ],
  },
  "deep-focus": {
    title: "Odaklı çalışan biri olarak bugün neredeydin?",
    subtitle: "Derin blok, tek görev veya 5 dk odak — hepsi geçerli.",
    options: [
      "Tek göreve kilitlendim, iyi hissettim",
      "Kısa odak bloğu bile fark yarattı",
      "Dikkat dağıtıcıları bir süre kestim",
      "Başlamak zordu ama birkaç dk odaklandım",
      "Tek sekme / tek iş kuralını denedim",
      "Dağınık geçti — yine de fark ettim",
      "Bugün odak şart değildi, dinlendim",
      "Yarın için net odak planı kurdum",
    ],
  },
  "night-owl": {
    title: "Akşam ritmini koruyan biri olarak bugün neredeydin?",
    subtitle: "Gece sürümü her zaman küçük — uyku önceliğini koru.",
    options: [
      "Planladığım akşam adımını yaptım",
      "Enerji düşük ama mini adım attım",
      "Ekranı erken bırakmayı denedim",
      "Nefes veya sakin kapanış yaptım",
      "Gün yoğundu, yarına bıraktım",
      "Erken pes ettim — yargı yok",
      "Tek küçük şey bile ritmi korudu",
      "Bugün gece rutini atlandı",
    ],
  },
  "social-builder": {
    title: "Bağ kuran biri olarak bugün neredeydin?",
    subtitle: "Mesaj, dinleme veya minik etkileşim — bağlantı küçük başlar.",
    options: [
      "Birine ulaştım veya yazdım",
      "Minik bir etkileşim / selam",
      "Dinledim veya destek oldum",
      "Kendime zaman ayırdım — bu da bağ",
      "Bugün yalnız hissettim, fark ettim",
      "Atladım — yarın için niyet bıraktım",
      "Taslak mesaj yazdım, göndermedim bile",
      "Yüz yüze kısa bir temas oldu",
    ],
  },
  custom: DEFAULT_CUSTOM,
};

const KNOWN_SLUGS = new Set(Object.keys(BY_SLUG));

function tOrFallback(key: string, fallback: string): string {
  const v = i18n.t(key);
  return v === key ? fallback : v;
}

export function getCheckInConfirmationCopy(slug: string): CheckInConfirmationConfig {
  const resolved = KNOWN_SLUGS.has(slug) ? slug : "custom";
  const fallback = BY_SLUG[resolved] ?? DEFAULT_CUSTOM;
  const prefix = `checkInConfirmation.${resolved}`;
  const title = tOrFallback(`${prefix}.title`, fallback.title);
  const subtitle = tOrFallback(`${prefix}.subtitle`, fallback.subtitle);
  const optionsRaw = i18n.t(`${prefix}.options`, { returnObjects: true });
  return {
    title,
    subtitle,
    options:
      Array.isArray(optionsRaw) && optionsRaw.length > 0
        ? (optionsRaw as string[])
        : fallback.options,
  };
}

export function getCheckInConfirmationOtherLabel(): string {
  const key = "checkInConfirmation.other";
  const v = i18n.t(key);
  return v === key ? "Diğer" : v;
}
