/**
 * Uygulama vaadi — Welcome, onboarding, Bugün ve Yolculuk aynı hikâyeyi anlatır.
 */

export const APP_PROMISE_LINE =
  "Her gün: tek küçük hareket + dürüst check-in — düştüğünde toparlan.";

/** Welcome ana başlık (iki satır) — marka + vaat özü */
export const APP_PROMISE_WELCOME_HEADLINE =
  "Motivasyon bir duygu değil.\nHer gün: tek hareket, dürüst check-in, düştüğünde yeniden bağlan.";

/** Welcome alt metin (satır içi iki cümleye sığar) */
export const APP_PROMISE_WELCOME_SUB =
  "Motivasyonu bekleme: Bugün kartındaki net adımı yap, sonra alışkanlığı değerlendir. Kaçırdığında yeniden bağlanmana yardım edeceğiz.";

/** Küçük rozet satırları — vaat ile uyumlu */
export const APP_PROMISE_TAGS = [
  "Tek net hareket",
  "Gerçek check-in",
  "Toparlanma için tasarlındı",
] as const;

/** Bugün başlığı altı ince şerit (her gün görünür) */
export function getHomePurposeKicker(_dayNumber: number): string {
  return APP_PROMISE_LINE;
}

/** 66 günlük fazların “tek fikri” — mikro-öğretim, slogan değil */
export const PHASE_ONE_IDEA: Record<1 | 2 | 3, string> = {
  1: "Bu fazda amaç küçültmek: zorlamak değil, aynı çapa ve zamanda küçük hareketi görünür kılmak. Bugün kartı küçük olsa bile sayılır.",
  2: "Bu fazda oyun ‘hatırla’dan çok ‘yine başladım’a kayar. Zor olduğunda bile en küçük sürüm her zaman seçenektir.",
  3: "Bu fazda hedef otomatiklik hissidir — duygudan önce tekrar. Zor bir günde bile yönünü seçmek kimliği sabit tutar.",
};

export function phaseIdFromDay(dayNumber: number): 1 | 2 | 3 {
  if (dayNumber <= 22) return 1;
  if (dayNumber <= 44) return 2;
  return 3;
}

/** “Şimdi yap” tamamlandığında toast — amaçla bağlantılı */
export const AFTER_LIVE_ACTION_TOAST_LINES = [
  "Bir mikro-adım kayda geçti. Disiplin de böyle oluşur.",
  "Tamam — bugün küçük olsa da yönünü seçtin.",
  "Kas bir tur daha güçlendi. Yarın kart yine tek net eyleme indirgenecek.",
] as const;

export function pickAfterLiveActionToast(seed: number): string {
  const i =
    Math.abs(seed) % AFTER_LIVE_ACTION_TOAST_LINES.length;
  return AFTER_LIVE_ACTION_TOAST_LINES[i]!;
}

/** Kimlik seçimi — genel kullanım çerçevesi */
export const ONBOARDING_IDENTITY_LEAD =
  "Sekiz yaygın yönde bir başlangıç seç ya da kimliğini kendin yaz. Sonraki adımda çapayı ve zamanı rutinine kilitleyeceksin.";

export const ONBOARDING_IDENTITY_PANEL_TITLE = "Aynı motor, senin yönün";

export const ONBOARDING_IDENTITY_PANEL_LINES = [
  "Bugün kartı: her gün tek net hareket + kısa check-in; düştüğünde toparlamak için tasarlı.",
  "Listede %100 örtüşen satır yokmuş gibi geliyorsa sorun değil — sana en yakınını seç; özü çapa ve alışkanlık adınla sen netleştirirsin.",
  "Tamamen özel bir ifade için alttaki “Kendi cümlemi yazacağım” seçeneğini kullan.",
] as const;

/** Çapa adımı — şablon = başlangıç önerisi */
export const ONBOARDING_ANCHOR_HINT =
  "Şablon yalnızca ilk öneriyi verir; çapayı ve saat aralığını burada rutinine göre değiştirebilirsin.";

/** Neden adımı — kimlik / motivasyon ayrımı */
export const ONBOARDING_WHY_SUB_LEAD =
  "Bu cümle sadece söz değil: Bugün ekranındaki küçük hareketler ve check-in ile her gün bağlantı kuracağın bağ. Zor düşündüğünde buraya dönebilirsin.";

export const ONBOARDING_WHY_SUB_TAIL =
  "Seçtiğin yön günlük ritmini şekillendirir; yazdığın “neden” ise onu senin için anlamlı tutar.";

/** Profil alt satırı — Welcome vaadiyle tek çizgi */
export const APP_PROMISE_PROFILE_TAGLINE =
  "Motivasyon bir duygu değil — her gün tek hareket, dürüst check-in, düştüğünde yeniden bağlan.";

/** Zihin — Bugün aksiyon motoruyla ilişki (beklenti yönetimi) */
export const MIND_DUMP_ENGINE_MICROCOPY =
  "Notların sadece bu cihazda kalır. Son birkaç nottaki kelime tonuna göre aksiyon öneri havuzu hafifçe ayarlanır — kişiyi okuyan yapay zekâ yok, kural tabanlıdır.";

/** Bugün — Zihin CTA alt satır */
export const HOME_MIND_DUMP_CTA_MICROCOPY =
  "Tek cümle bile Bugün önerisiyle daha uyumlu olmana yardım edebilir.";

/** Ücretsiz Zihin limiti (modal / banner) */
export const MIND_DUMP_FREE_LIMIT_EXPLAIN =
  "Ücretsiz planda bu cihazda en fazla 10 aktif Zihin notu tutabilirsin. Yer açmak için eski bir notu silebilir veya Premium ile sınırsız yazabilirsin.";

/** 8–9. not civarı erken uyarı */
export const MIND_DUMP_APPROACHING_LIMIT =
  "10 not ücretsiz sınırına yaklaşıyorsun. Yer açmak için bir not silebilir veya Premium ile sınırsız yazabilirsin.";

/** Push — akşam nudge başlığı (Bugün kartı ile bağlantı) */
export const NOTIFICATION_EVENING_TITLE = "Gün bitmeden: Bugün kartı";

const EVENING_NOTIFICATION_BODIES: ((h: string) => string)[] = [
  (h) =>
    `${h} için henüz hareket yok. Bugün kartındaki en küçük sürüm yeter — akşam dürüst check-in’i yap.`,
  (h) =>
    `Gün bitmeden bir tur: ${h}. Bugün ekranındaki tek net adımı seç; 10 saniye bile işe yarar.`,
  (h) =>
    `${h}: hâlâ “tamam” diyebilirsin. Bugün kartında küçült, sonra aksiyona geç.`,
  (h) =>
    `Motivasyonu bekleme — Bugün kartındaki mikro-adım ${h} için şimdi yeter.`,
];

/** Gün tarihinden (örn. yyyyMMdd) seçilen gövde; aynı gün tutarlı varyasyon */
export function pickEveningNotificationBody(
  habitName: string,
  calendarDaySeed: number
): string {
  const h = habitName.trim() || "alışkanlığın";
  const i =
    Math.abs(calendarDaySeed) % EVENING_NOTIFICATION_BODIES.length;
  return EVENING_NOTIFICATION_BODIES[i]!(h);
}

/** Faz milestone — push metinleri (schedulePhaseTransitions ile) */
export const PHASE_MILESTONE_NOTIFICATIONS: readonly {
  dayOffset: number;
  title: string;
  body: string;
}[] = [
  {
    dayOffset: 21,
    title: "Kuruluş fazı tamamlandı.",
    body:
      "22 gündür küçük tekrar + check-in. Pekiştirme fazına geçiyorsun; Bugün kartı yine tek net adımla devam.",
  },
  {
    dayOffset: 43,
    title: "Son faz: Otomatikleşme.",
    body:
      "Duygudan önce seçim zamanı — zor günde bile Bugün’de küçük sürüm her zaman seçenek.",
  },
  {
    dayOffset: 65,
    title: "66 gün tamamlandı.",
    body:
      "Bu artık kim olduğunun parçası. Kaçırdığında toparlamak için tasarladığın yapı hep burada.",
  },
];
