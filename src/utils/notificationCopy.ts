/**
 * Bildirim icerik uretici — "hatirlatma" degil "mudahale" tonu.
 *
 * Behavior engine status (green/yellow/red), streak, dayNumber, consecutiveMiss
 * gibi sinyallere gore dinamik bildirim mesajlari uretir.
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

// ─── Morning Notifications — status-aware ─────────────────────────────────

const MORNING_GREEN: ((ctx: NotificationContext) => NotifCopy)[] = [
  (ctx) => ({
    title: `Gün ${ctx.dayNumber} — ${ctx.streak} gün üst üste 🔥`,
    body: `${h(ctx.habitName)} yolunda gidiyorsun. Bugün de küçük adımını seç.`,
  }),
  (ctx) => ({
    title: `${ctx.streak} günlük seri devam ediyor`,
    body: `${h(ctx.habitName)}: Bugün kartındaki tek hareketi yap, gün tamam.`,
  }),
  (ctx) => ({
    title: `Gün ${ctx.dayNumber} — Kas güçleniyor`,
    body: ctx.plannedAction
      ? `Dün planladığın: "${ctx.plannedAction}". Hadi başla.`
      : `${h(ctx.habitName)} için bugün de bir mikro-adım yeter.`,
  }),
  (ctx) => ({
    title: "Çapa + tek hareket",
    body: `${h(ctx.habitName)}: Önce çapanı yap, sonra karttaki tek adımı seç — 30 sn.`,
  }),
  (ctx) => ({
    title: `Gün ${ctx.dayNumber} — Kimlik oyu`,
    body: `Bugün “yapan biri” için bir oy: ${h(ctx.habitName)} kartını aç.`,
  }),
  (ctx) => ({
    title: "Sabah ritmi",
    body: ctx.last3AvgAuto != null && ctx.last3AvgAuto >= 6
      ? `Otomatiklik yükseliyor. ${h(ctx.habitName)} için bugün de aynı küçük adım.`
      : `${h(ctx.habitName)}: Küçük sürümle başla — mükemmellik bekleme.`,
  }),
];

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
];

const MORNING_RED: ((ctx: NotificationContext) => NotifCopy)[] = [
  (ctx) => ({
    title: "Geri dönüş günü",
    body: `${ctx.consecutiveMisses} gün kaçırmak 66 günlük yolculuğun sadece %${Math.round((ctx.consecutiveMisses / 66) * 100)}'ü. ${h(ctx.habitName)} için bugün tek küçük adım yeter.`,
  }),
  (ctx) => ({
    title: "Beynin hâlâ bu yolu biliyor",
    body: `${h(ctx.habitName)}: Kaçırmanın ardından geri dönmek sistemin parçası. Bugün kartını aç.`,
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
    title: `${ctx.consecutiveMisses} gün ara — hâlâ erken`,
    body: `66 günlük yolun büyük kısmı önde. ${h(ctx.habitName)} kartını aç.`,
  }),
];

function pickFromPool<T>(pool: T[], seed: number): T {
  return pool[Math.abs(seed) % pool.length]!;
}

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

  if (ctx.status === "red" || ctx.consecutiveMisses >= 2) {
    return pickFromPool(MORNING_RED, seed)(ctx);
  }

  if (ctx.status === "yellow" || ctx.consecutiveMisses === 1) {
    return pickFromPool(MORNING_YELLOW, seed)(ctx);
  }

  return pickFromPool(MORNING_GREEN, seed)(ctx);
}

// ─── Evening Notifications — urgency-aware ────────────────────────────────

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
];

const EVENING_URGENT: ((ctx: NotificationContext) => NotifCopy)[] = [
  (ctx) => ({
    title: "⚠️ Seri kırılmak üzere",
    body: `${ctx.streak} günlük serin devam etsin mi? ${h(ctx.habitName)} için bugün en küçük adımı yap.`,
  }),
  (ctx) => ({
    title: "Bugün hâlâ sayılabilir",
    body: `${h(ctx.habitName)}: Motivasyonu bekleme — kartı aç, tek hareketi işaretle.`,
  }),
  (ctx) => ({
    title: `${ctx.streak} gün seri`,
    body: `Bugün de ${h(ctx.habitName)} için en küçük adım — seri devam etsin.`,
  }),
  (ctx) => ({
    title: "Akşam çapası",
    body: `${h(ctx.habitName)}: Çapanı hatırla, sonra karttaki tek hareketi seç.`,
  }),
];

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

// ─── Streak Celebration (next-day morning boost) ──────────────────────────

export function getStreakCelebrationCopy(
  habitName: string,
  streak: number,
  dayNumber: number
): NotifCopy | null {
  if (streak < 3) return null;

  const milestones = [7, 14, 21, 30, 44, 60, 66];
  const isMilestone = milestones.includes(streak);

  if (isMilestone) {
    return {
      title: `${streak} gün üst üste! 🏆`,
      body: `${h(habitName)}: Bu seri disiplinin kanıtı. Bugün de devam — küçük adımla.`,
    };
  }

  if (streak % 5 === 0) {
    return {
      title: `${streak} gün serisi 🔥`,
      body: `${h(habitName)} yapan biri olarak ${streak} günlük yolculuğun devam ediyor.`,
    };
  }

  return null;
}

// ─── Recovery Comeback Push ───────────────────────────────────────────────

export function getRecoveryPush(
  habitName: string,
  missedDays: number
): NotifCopy {
  const pct = Math.round((missedDays / 66) * 100);
  return {
    title: "Geri dönme zamanı",
    body: `${missedDays} gün → %${pct}. ${h(habitName)} yolculuğunun geri kalanı hâlâ senin. Bugün kartını aç.`,
  };
}
