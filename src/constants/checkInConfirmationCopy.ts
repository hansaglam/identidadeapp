/**
 * Check-in hızlı teyit soruları — habit.identitySlug ile eşleşir.
 */

export interface CheckInConfirmationConfig {
  title: string;
  /** Grid seçenekleri ("Diğer" UI’da ayrı eklenIr). */
  options: string[];
}

const DEFAULT_CUSTOM: CheckInConfirmationConfig = {
  title: "Bugün bu kimlik yönünde neredeydin?",
  options: [
    "İstediğim gibi ilerledim",
    "Kısmen yaptım, yarıda kaldı",
    "Zorlandım ama denedim",
    "Enerjim düşüktü",
    "Başka öncelikler aldı",
    "Hızlıca not almak yeterli oldu",
  ],
};

const BY_SLUG: Record<string, CheckInConfirmationConfig> = {
  "mental-clarity": {
    title: "Zihin berraklığı için bugün ne yakaladın?",
    options: [
      "Kaygıyı/düşünceyi not ettim",
      "Zihnimi toparladım",
      "Çok kısa da olsa nefes aldım",
      "Kararsızlığı azalttım",
      "Sadece fark ettim",
      "Henüz olmadı",
    ],
  },
  "moving-body": {
    title: "Hareket tarafında bugün ne oldu?",
    options: [
      "Planladığım hareketi yaptım",
      "Kısa bir hareket yeterliydi",
      "Yürüyüş / esneme bile sayılır",
      "Zaman yetmedi",
      "Vücudumu dinledim",
      "Yarım kaldı",
    ],
  },
  "lifelong-learner": {
    title: "Öğrenme rutininde bugün neresin?",
    options: [
      "Küçük bir şey okudum/izledim",
      "Not aldım veya tekrar ettim",
      "Tek adım attım",
      "Bugün olmadı",
      "Sadece merak ettim",
      "Yarın telafi ederim",
    ],
  },
  "self-care": {
    title: "Kendine bakım için bugün ne var?",
    options: [
      "Küçük bir iyilik yaptım",
      "Dinlenmeye izin verdim",
      "Sınır koydum / hayır dedim",
      "Kısa mola verdim",
      "Farkındalık anı oldu",
      "Bugün zordu",
    ],
  },
  creator: {
    title: "Üretkenlik / yaratıcılık tarafında bugün?",
    options: [
      "Üzerinde çalıştım",
      "Taslak veya fikir çıktı",
      "Az da olsa ilerleme",
      "Beklentimi düşürdüm",
      "Sadece başlamak yetti",
      "Olmadı",
    ],
  },
  "deep-focus": {
    title: "Odak için bugün ne söylersin?",
    options: [
      "Derin çalışma bloğu yaptım",
      "Tek göreve kilitlendim",
      "Dikkat dağıtıcıyı kestim",
      "Kısa blok bile işe yaradı",
      "Bugün dağınıktı",
      "Denemedim",
    ],
  },
  "night-owl": {
    title: "Akşam rutininde bugün neresin?",
    options: [
      "Planladığım adımı yaptım",
      "Enerji düşük ama denedim",
      "Erken pes ettim",
      "Gün yoğundu",
      "Tek küçük şey",
      "Yarına bıraktım",
    ],
  },
  "social-builder": {
    title: "Bağlantı / iletişim tarafında bugün?",
    options: [
      "Birine ulaştım / yazdım",
      "Minik bir etkileşim",
      "Dinledim veya destek oldum",
      "Kendime zaman ayırdım",
      "Bugün yalnız hissettim",
      "Atladım",
    ],
  },
  custom: DEFAULT_CUSTOM,
};

export function getCheckInConfirmationCopy(slug: string): CheckInConfirmationConfig {
  return BY_SLUG[slug] ?? DEFAULT_CUSTOM;
}
