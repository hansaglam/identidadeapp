/**
 * Bildirim içerik üretici — "hatırlatma" değil "müdahale" tonu.
 *
 * Behavior engine status (green/yellow/red), streak, dayNumber, consecutiveMiss,
 * phase ve plannedAction sinyallerine göre dinamik bildirim mesajları üretir.
 *
 * Her havuz: en az 10 varyant → aynı tona düşmez, serinin çeşitlenmesi garantili.
 */

type Status = "green" | "yellow" | "red";

interface NotificationContext {
  habitName: string;
  dayNumber: number;
  streak: number;
  consecutiveMisses: number;
  status: Status;
  last3AvgAuto: number | null;
  plannedAction: string | null;
  todayDone: boolean;
}

interface NotifCopy {
  title: string;
  body: string;
}

function h(name: string): string {
  return name.trim() || "alışkanlığın";
}

function phase(day: number): "Kuruluş" | "Pekiştirme" | "Otomatikleşme" {
  if (day <= 22) return "Kuruluş";
  if (day <= 44) return "Pekiştirme";
  return "Otomatikleşme";
}

function daysLeft(day: number): number {
  return Math.max(0, 66 - day);
}

// ─── Morning Notifications — Green (iyi gidiyorsun) ──────────────────────────

const MORNING_GREEN: ((ctx: NotificationContext) => NotifCopy)[] = [
  (ctx) => ({
    title: `Gün ${ctx.dayNumber} — ${ctx.streak} gün üst üste 🔥`,
    body: ctx.plannedAction
      ? `Dün planladığın: "${ctx.plannedAction}". Hadi bir adım daha.`
      : `${h(ctx.habitName)} yolunda gidiyorsun. Bugün de küçük adımını seç.`,
  }),
  (ctx) => ({
    title: `${ctx.streak} günlük seri devam ediyor`,
    body: `${h(ctx.habitName)}: Bugün kartındaki tek hareketi yap, gün tamam.`,
  }),
  (ctx) => ({
    title: `Gün ${ctx.dayNumber} — Kas güçleniyor`,
    body: ctx.plannedAction
      ? `Planın: "${ctx.plannedAction}". ${h(ctx.habitName)} için hadi başla.`
      : `${h(ctx.habitName)} için bugün de bir mikro-adım yeter.`,
  }),
  (ctx) => ({
    title: "Çapa + tek hareket",
    body: `${h(ctx.habitName)}: Önce çapanı yap, sonra karttaki tek adımı seç — 30 saniye.`,
  }),
  (ctx) => ({
    title: `Gün ${ctx.dayNumber} — Kimlik oyu`,
    body: `"${h(ctx.habitName)} yapan biri olarak bugün bir oy daha": Kartı aç, işaretle.`,
  }),
  (ctx) => ({
    title: "Sabah ritmi",
    body: ctx.last3AvgAuto != null && ctx.last3AvgAuto >= 6
      ? `Otomatiklik yükseliyor. ${h(ctx.habitName)} için bugün de aynı küçük adım.`
      : `${h(ctx.habitName)}: Küçük sürümle başla — mükemmellik bekleme.`,
  }),
  (ctx) => ({
    title: `${phase(ctx.dayNumber)} fazındasın`,
    body: `${h(ctx.habitName)} için beyin bu fazda deseni oturuyor. Bugün de tekrar — kısa bile olsa.`,
  }),
  (ctx) => ({
    title: "Tekrar = iz",
    body: `Beyin her tekrarda daha az enerji harcıyor. ${h(ctx.habitName)} için bugün bir iz daha bırak.`,
  }),
  (ctx) => ({
    title: `Gün ${ctx.dayNumber} — ${daysLeft(ctx.dayNumber)} gün kaldı`,
    body: `${h(ctx.habitName)} için ${daysLeft(ctx.dayNumber)} gün daha. Bugün kartını aç, devam et.`,
  }),
  (ctx) => ({
    title: "Momentum gerçek",
    body: `${ctx.streak} günlük seri beyninde bir iz. ${h(ctx.habitName)} için bugün de küçük ama net bir adım.`,
  }),
  (ctx) => ({
    title: `Gün ${ctx.dayNumber} — İyi haber`,
    body: `${h(ctx.habitName)} yapan birinin sabahı. Kart açık — tek adımın hazır.`,
  }),
];

// ─── Morning Notifications — Yellow (dikkat, süreksizlik var) ────────────────

const MORNING_YELLOW: ((ctx: NotificationContext) => NotifCopy)[] = [
  (ctx) => ({
    title: `Gün ${ctx.dayNumber} — Kayma noktası`,
    body: `${h(ctx.habitName)}: Son günler zorladı ama bugün küçük sürümü seçersen yeterli.`,
  }),
  (ctx) => ({
    title: "Dünü bırak, bugüne bak",
    body: `${h(ctx.habitName)} için en küçük versiyonu bile say. Bugün kartını aç.`,
  }),
  (ctx) => ({
    title: `Gün ${ctx.dayNumber} — Tek adım yeter`,
    body: `Motivasyonu bekleme. ${h(ctx.habitName)} kartındaki net eylemi seç — 10 saniye bile sayılır.`,
  }),
  (ctx) => ({
    title: "Kayma haftası değil",
    body: `${h(ctx.habitName)}: Dün zor olsa da bugün 2 dk sürüm yeter — seri yeniden başlar.`,
  }),
  (ctx) => ({
    title: "Beyin eski yolu hatırlıyor",
    body: `1 gün ara normal. ${h(ctx.habitName)} için kartı aç, en küçük hareketi işaretle.`,
  }),
  (ctx) => ({
    title: "Mükemmellik tuzağı",
    body: `${h(ctx.habitName)}: Büyük olmak zorunda değil. 2 dk bile bu gün 'yaptım' yapar.`,
  }),
  (ctx) => ({
    title: `${phase(ctx.dayNumber)} fazında çatlak normal`,
    body: `Orta fazdaki düşüş çoğu zaman motivasyon eksikliği değil — alışkanlık henüz otomatik değil. ${h(ctx.habitName)} için bugün de bir adım.`,
  }),
  (ctx) => ({
    title: "Seri yeniden başlar",
    body: ctx.plannedAction
      ? `Planın: "${ctx.plannedAction}". ${h(ctx.habitName)} için hâlâ vakit var.`
      : `${h(ctx.habitName)}: Bugün kartı en küçük sürümü sunar — tamamlamak değil başlamak.`,
  }),
  (ctx) => ({
    title: "Kimlik sorusu",
    body: `"${h(ctx.habitName)} yapan biri bugün ne yapar?" — Kartı aç, küçük ama gerçek bir adım seç.`,
  }),
  (ctx) => ({
    title: `Gün ${ctx.dayNumber} — Yön seçimi`,
    body: `${h(ctx.habitName)} için bugün tam yapmak zorunda değilsin. Yalnızca yönünü seç.`,
  }),
];

// ─── Morning Notifications — Red (geri dönüş modunda) ────────────────────────

const MORNING_RED: ((ctx: NotificationContext) => NotifCopy)[] = [
  (ctx) => ({
    title: "Geri dönüş günü",
    body: `${ctx.consecutiveMisses} gün ara verdikten sonra geri dönmek de yolculuğun parçası. ${h(ctx.habitName)} için bugün en küçük adım yeter.`,
  }),
  (ctx) => ({
    title: "Beynin hâlâ bu yolu biliyor",
    body: `${h(ctx.habitName)}: Araların ardından geri dönmek sistemin parçası. Bugün kartını aç.`,
  }),
  (ctx) => ({
    title: "Düşmek yolculuğun parçası",
    body: `${h(ctx.habitName)} yapan biri düştüğünde kalkar. En küçük sürümle başla — cezasız.`,
  }),
  (ctx) => ({
    title: "Geri dönüş modu",
    body: `${h(ctx.habitName)}: Önce ayağa kalk, sonra tek mikro adım — check-in sonra gelir.`,
  }),
  (ctx) => ({
    title: "Yolculuk devam ediyor",
    body: `${ctx.consecutiveMisses} gün ara geri dönüşü engellemez. ${h(ctx.habitName)} kartını aç — en küçük sürüm bile hak ediyor.`,
  }),
  (ctx) => ({
    title: "Sıfırdan değil, devam",
    body: `${h(ctx.habitName)}: Ara verince sıfıra düşmezsin — birikim hâlâ orada. Bugün kartı açmak yeter.`,
  }),
  (ctx) => ({
    title: "Toparlanma da alışkanlık",
    body: `${h(ctx.habitName)}: En başarılı yolculuklar düzgün değil, dayanıklı olanlardır. Bugün devam.`,
  }),
  (ctx) => ({
    title: "Bugün bir adım at",
    body: ctx.plannedAction
      ? `Planın bekliyor: "${ctx.plannedAction}". Küçük de olsa ${h(ctx.habitName)} için bugün.`
      : `${h(ctx.habitName)}: Kartı aç, tek hareketi işaretle — bu yeter.`,
  }),
  (ctx) => ({
    title: "İzin kendine verdin",
    body: `Birkaç gün ara vermek insani. ${h(ctx.habitName)} için bugün geri dönmek yeterli bir seçim.`,
  }),
  (ctx) => ({
    title: `Gün ${ctx.dayNumber} — Yeniden başla`,
    body: `${h(ctx.habitName)}: Seri bitmiş olabilir ama yolculuk devam ediyor. Bugün küçük ama gerçek bir adım.`,
  }),
];

function pickFromPool<T>(pool: T[], seed: number): T {
  return pool[Math.abs(seed) % pool.length]!;
}

// ─── Özel gün mesajları ───────────────────────────────────────────────────────

function getMilestoneMorning(ctx: NotificationContext): NotifCopy | null {
  const d = ctx.dayNumber;
  const name = h(ctx.habitName);

  if (d === 7) return {
    title: "7 günlük kuruluş 🌱",
    body: `${name}: İlk hafta tamamlandı. Beyin yeni bir deseni fark etmeye başladı. Devam et.`,
  };
  if (d === 14) return {
    title: "2. hafta — Örüntü kuruluyor",
    body: `${name} için 14 gün. Nöronal iz güçleniyor — bugün de tekrar yeter.`,
  };
  if (d === 21) return {
    title: "21 gün — Kuruluş fazı bitiyor",
    body: `${name}: 22. günden itibaren pekiştirme başlıyor. Bugün kartın var — küçük ama net bir adım.`,
  };
  if (d === 23) return {
    title: "Pekiştirme fazına geçtin",
    body: `${name} artık ikinci fazda. Alışkanlık tekrarda oturuyor — bugün de devam.`,
  };
  if (d === 30) return {
    title: "30 gün — Yarı yoldasın 🎯",
    body: `${name}: 30 günlük yolculuk. Beyin artık bu deseni "biliyor". 36 gün daha.`,
  };
  if (d === 44) return {
    title: "Pekiştirme fazı tamamlandı",
    body: `${name}: Son faza giriyorsun. Bugünden itibaren otomatikleşme başlıyor — devam et.`,
  };
  if (d === 45) return {
    title: "Son faz: Otomatikleşme 🚀",
    body: `${name}: Seçimler alışkanlığa dönüşüyor. 21 gün daha — bugün kartını aç.`,
  };
  if (d === 60) return {
    title: "60 gün — Bitiş çizgisi görünüyor",
    body: `${name}: 6 gün kaldı. Bu yolculuk kimliğinin parçası haline geliyor.`,
  };
  return null;
}

// ─── Ana morning dispatcher ───────────────────────────────────────────────────

export function getMorningNotification(ctx: NotificationContext): NotifCopy {
  const seed = ctx.dayNumber + new Date().getDate();

  if (ctx.dayNumber <= 3) {
    return {
      title: `Gün ${ctx.dayNumber} — Beyin yeni yol açıyor`,
      body: `${h(ctx.habitName)} için bugün kartındaki tek net hareketi seç.${ctx.plannedAction ? ` Planın: "${ctx.plannedAction}".` : ""}`,
    };
  }

  if (ctx.dayNumber === 66) {
    return {
      title: "66 gün tamamlandı 🎉",
      body: `${h(ctx.habitName)} artık kim olduğunun parçası. Yapı her zaman burada.`,
    };
  }

  // Özel kilometre taşları
  const milestone = getMilestoneMorning(ctx);
  if (milestone && (seed % 3 === 0)) return milestone;

  if (ctx.status === "red" || ctx.consecutiveMisses >= 2) {
    return pickFromPool(MORNING_RED, seed)(ctx);
  }

  if (ctx.status === "yellow" || ctx.consecutiveMisses === 1) {
    return pickFromPool(MORNING_YELLOW, seed)(ctx);
  }

  return pickFromPool(MORNING_GREEN, seed)(ctx);
}

// ─── Evening Notifications — Gentle (bugün henüz yapmadı, sakin yaklaş) ──────

const EVENING_GENTLE: ((ctx: NotificationContext) => NotifCopy)[] = [
  (ctx) => ({
    title: "Gün bitmeden: Bugün kartı",
    body: `${h(ctx.habitName)} için henüz hareket yok. En küçük sürüm bile yeter.`,
  }),
  (ctx) => ({
    title: "Son tur",
    body: `${h(ctx.habitName)}: Bugün kartındaki mikro-adımı seç — 10 saniye bile işe yarar.`,
  }),
  (ctx) => ({
    title: "2 dakika kuralı",
    body: `${h(ctx.habitName)} için en küçük sürümü seç — tamamlamak değil, başlamak.`,
  }),
  (ctx) => ({
    title: "Gün kapanmadan",
    body: ctx.plannedAction
      ? `Planın: "${ctx.plannedAction}". ${h(ctx.habitName)} için hâlâ vakit var.`
      : `${h(ctx.habitName)}: Kartı aç, tek hareketi işaretle.`,
  }),
  (ctx) => ({
    title: "Bugün hâlâ sayılabilir",
    body: `${h(ctx.habitName)}: Gün bitmeden küçük de olsa bir hareket — akşam check-in'i yap.`,
  }),
  (ctx) => ({
    title: "Akşam ritmi",
    body: `${h(ctx.habitName)} için birkaç dakika kaldı. Kartı aç, ne kadar küçük olursa olsun seç.`,
  }),
  (ctx) => ({
    title: "Bilgi değil, tekrar",
    body: `Beyin enerjiyi yalnızca deneyimle öğrenir. ${h(ctx.habitName)}: Bu akşam bir tekrar daha.`,
  }),
  (ctx) => ({
    title: `Gün ${ctx.dayNumber} — Gece yarısından önce`,
    body: `${h(ctx.habitName)}: Bugün en küçük sürümü yap. Yarın planlamak için de kart açık.`,
  }),
  (ctx) => ({
    title: "Akşam hatırlatması",
    body: ctx.plannedAction
      ? `"${ctx.plannedAction}" hâlâ bekliyor. ${h(ctx.habitName)} için son şans.`
      : `${h(ctx.habitName)}: Gün geçmeden tek hareket — çok az da olsa yeterli.`,
  }),
  (ctx) => ({
    title: "Gün sonu bilançosu",
    body: `${h(ctx.habitName)}: Bugün henüz yok. Küçük ama gerçek bir adımla bitir.`,
  }),
];

// ─── Evening Notifications — Urgent (seri tehlikede) ─────────────────────────

const EVENING_URGENT: ((ctx: NotificationContext) => NotifCopy)[] = [
  (ctx) => ({
    title: "Seri kırılmak üzere ⚠️",
    body: `${ctx.streak} günlük serinizin devam etmesi için ${h(ctx.habitName)}: bugün en küçük adımı yap.`,
  }),
  (ctx) => ({
    title: "Bugün hâlâ sayılabilir",
    body: `${h(ctx.habitName)}: Motivasyonu bekleme — kartı aç, tek hareketi işaretle.`,
  }),
  (ctx) => ({
    title: `${ctx.streak} günlük seri`,
    body: `Bugün de ${h(ctx.habitName)} için en küçük adım — seri devam etsin.`,
  }),
  (ctx) => ({
    title: "Akşam çapası",
    body: `${h(ctx.habitName)}: Çapanı hatırla, sonra karttaki tek hareketi seç.`,
  }),
  (ctx) => ({
    title: "Gece yarısından önce",
    body: `${h(ctx.habitName)}: Seri ${ctx.streak} gün. Bugün de küçük ama gerçek bir adım.`,
  }),
  (ctx) => ({
    title: "Son dakika fırsatı",
    body: ctx.plannedAction
      ? `Sabah planladığın: "${ctx.plannedAction}". Hâlâ mümkün.`
      : `${h(ctx.habitName)}: Bugün kartını aç — 2 dakika yeter, seri kurtulur.`,
  }),
  (ctx) => ({
    title: "Küçük ama gerçek",
    body: `${ctx.streak} gün biriktirdin. ${h(ctx.habitName)}: Bugün de en küçük sürümle serinü koru.`,
  }),
  (ctx) => ({
    title: "Akşam müdahalesi",
    body: `${h(ctx.habitName)}: Büyük bir adım değil, sadece bugünkü küçük tekrar — seri devam ediyor.`,
  }),
  (ctx) => ({
    title: "Bir oy daha",
    body: `${h(ctx.habitName)} yapan biri olarak bugün son bir oy: kartı aç, işaretle.`,
  }),
  (ctx) => ({
    title: "Gün bitmeden karar",
    body: `${h(ctx.habitName)}: Seri ${ctx.streak} gün. Bugün 1 küçük adım + check-in = yeterli.`,
  }),
];

// ─── Evening Notifications — Recovery (kaçırmanın ardından) ──────────────────

const EVENING_RECOVERY: ((ctx: NotificationContext) => NotifCopy)[] = [
  (ctx) => ({
    title: "Geri dönüş fırsatı",
    body: `${h(ctx.habitName)}: Bugün yapabilirsen seri yeniden başlar. Tek küçük hareket yeter.`,
  }),
  (ctx) => ({
    title: "Düşmek yolun parçası",
    body: `${h(ctx.habitName)} yapan biri bugün kartını açar. Cezasız — yalnızca tek adım.`,
  }),
  (ctx) => ({
    title: "Yeniden başlat",
    body: `${h(ctx.habitName)}: Önce mikro adım, sonra check-in — sıra önemli.`,
  }),
  (ctx) => ({
    title: "Bu gece sayılır",
    body: `Kaçırdığın günlerin ardından tek küçük hareket ${h(ctx.habitName)} yolunu açık tutar.`,
  }),
  (ctx) => ({
    title: "Sıfırdan değil, devam",
    body: `${h(ctx.habitName)}: Birkaç gün ara verdikten sonra geri dönmek de bir seçim. Bugün kartını aç.`,
  }),
  (ctx) => ({
    title: "Beyin bu yolu biliyor",
    body: `${h(ctx.habitName)}: Aradan sonra geri dönmek beyne tanıdık geliyor — en küçük sürümle başla.`,
  }),
  (ctx) => ({
    title: "Toparlanma anı",
    body: `${h(ctx.habitName)}: Bu akşam tek küçük hareket bile yolculuğun devam ettiğini gösterir.`,
  }),
  (ctx) => ({
    title: "İzin verdin, şimdi dön",
    body: ctx.plannedAction
      ? `Planın: "${ctx.plannedAction}". ${h(ctx.habitName)}: Bu akşam geri dön.`
      : `${h(ctx.habitName)}: Birkaç günlük ara bitti. Bugün küçük ama gerçek bir adımla.`,
  }),
  (ctx) => ({
    title: "Yolculuk devam ediyor",
    body: `Mükemmel seri değil, uzun soluk yolculuk önemli. ${h(ctx.habitName)}: Bu akşam bir adım daha.`,
  }),
  (ctx) => ({
    title: "Gece yarısından önce",
    body: `${h(ctx.habitName)}: Bugün hâlâ mümkün. En küçük sürümle de olsa — bu gece sayılır.`,
  }),
];

export function getEveningNotification(ctx: NotificationContext): NotifCopy {
  const seed = ctx.dayNumber + new Date().getDate();

  if (ctx.todayDone) {
    return { title: "", body: "" };
  }

  if (ctx.consecutiveMisses >= 1 || ctx.status === "red") {
    return pickFromPool(EVENING_RECOVERY, seed)(ctx);
  }

  if (ctx.streak >= 3 || ctx.status === "yellow") {
    return pickFromPool(EVENING_URGENT, seed)(ctx);
  }

  return pickFromPool(EVENING_GENTLE, seed)(ctx);
}

// ─── Streak Celebration ───────────────────────────────────────────────────────

const STREAK_MILESTONE_COPY: Record<number, (name: string) => NotifCopy> = {
  7: (name) => ({
    title: "7 gün üst üste 🔥",
    body: `${h(name)}: İlk haftalık seri tamamlandı. Beyin yeni bir yol açıyor — devam et.`,
  }),
  14: (name) => ({
    title: "14 gün seri! 🌱",
    body: `${h(name)}: 2 haftadır kesintisiz. Nöronal iz güçleniyor. Devam et.`,
  }),
  21: (name) => ({
    title: "21 günlük seri 🏆",
    body: `${h(name)}: 3 hafta tamamlandı. Bu seri, kimliğinin bir parçası haline geliyor.`,
  }),
  30: (name) => ({
    title: "30 günlük seri 🎯",
    body: `${h(name)}: Yarı yolda! 30 günlük seri bu alışkanlığın gerçek olduğunu gösteriyor.`,
  }),
  44: (name) => ({
    title: "44 gün — Pekiştirme bitti 💪",
    body: `${h(name)}: Son faza giriyorsun. Bu seri otomatikleşmenin başlangıcı.`,
  }),
  60: (name) => ({
    title: "60 günlük seri 🌟",
    body: `${h(name)}: 6 gün kaldı. Bu yolculuk kim olduğunun parçası haline geliyor.`,
  }),
  66: (name) => ({
    title: "66 gün tamamlandı! 🎉",
    body: `${h(name)} artık kimliğinin parçası. Bu alışkanlık seni tanımlayanlardan biri.`,
  }),
};

export function getStreakCelebrationCopy(
  habitName: string,
  streak: number,
  dayNumber: number
): NotifCopy | null {
  if (streak < 3) return null;

  const specific = STREAK_MILESTONE_COPY[streak];
  if (specific) return specific(habitName);

  if (streak % 7 === 0) {
    return {
      title: `${streak} günlük seri 🔥`,
      body: `${h(habitName)} yapan biri olarak ${streak} günlük yolculuğun devam ediyor. Kimlik kazanımı gerçek.`,
    };
  }

  if (streak % 5 === 0) {
    return {
      title: `${streak} gün serisi`,
      body: `${h(habitName)}: ${streak} günlük tekrar beyne iz bırakıyor. Bugün de devam.`,
    };
  }

  return null;
}

// ─── Recovery Push (kaçırmanın ardından) ─────────────────────────────────────

const RECOVERY_COPY: ((name: string, missedDays: number) => NotifCopy)[] = [
  (name, missedDays) => ({
    title: "Geri dönme zamanı",
    body: `${missedDays} gün ara verdin. ${h(name)}: Yolculuğun geri kalanı hâlâ senin. Bugün kartını aç.`,
  }),
  (name, missedDays) => ({
    title: "Yolculuk devam ediyor",
    body: `${missedDays} günlük ara bir engel değil — toparlamak da bu yolculuğun parçası. ${h(name)} için bugün küçük bir adım.`,
  }),
  (name, missedDays) => ({
    title: "Sıfırdan değil, devam",
    body: `${h(name)}: ${missedDays} gün ara birikim silmez. Beyin hâlâ bu yolu biliyor — bugün geri dön.`,
  }),
  (name) => ({
    title: "Geri dönmek de alışkanlık",
    body: `${h(name)}: Her düşüşten sonra geri dönmek kasını güçlendirir. Bugün kartını aç.`,
  }),
  (name, missedDays) => ({
    title: "Toparlanma anı",
    body: `${missedDays} günden sonra tek küçük adım bile fark yaratır. ${h(name)}: Bugün o adımı at.`,
  }),
  (name) => ({
    title: "Kaçırmak değil, devam",
    body: `Mükemmel değil, dayanıklı olana yolculuk ödül veriyor. ${h(name)}: Bugün geri dön.`,
  }),
  (name, missedDays) => ({
    title: `${missedDays} gün ara — hâlâ erken`,
    body: `66 günlük yolun büyük kısmı önde. ${h(name)} kartını aç — küçük ama gerçek bir adım.`,
  }),
  (name) => ({
    title: "Kimlik oyu",
    body: `${h(name)}: Aralar geçici, alışkanlık kalıcı. Bugün kimliğin için bir oy daha.`,
  }),
];

export function getRecoveryPush(
  habitName: string,
  missedDays: number
): NotifCopy {
  const seed = missedDays + new Date().getDate();
  const pick = RECOVERY_COPY[Math.abs(seed) % RECOVERY_COPY.length]!;
  return pick(habitName, missedDays);
}
