/**
 * Push bildirim içerik üretici — i18n havuzları + davranış segmentasyonu.
 *
 * Sinyaller: status (green/yellow/red), streak, consecutiveMisses, phase,
 * plannedAction, last3AvgAuto, lastEffortRating.
 */
import i18n from "../i18n/config";

export type Status = "green" | "yellow" | "red";

export interface NotificationContext {
  habitName: string;
  dayNumber: number;
  streak: number;
  consecutiveMisses: number;
  status: Status;
  last3AvgAuto: number | null;
  /** Dünkü check-in eforu (1–10); akşam küçültme önerisi için */
  lastEffortRating: number | null;
  plannedAction: string | null;
  todayDone: boolean;
}

export interface NotifCopy {
  title: string;
  body: string;
}

type PushPoolItem = {
  title: string;
  body: string;
  bodyPlanned?: string;
};

const PUSH = "notifications.push";

function tArrayPool(key: string): PushPoolItem[] {
  const raw = i18n.t(key, { returnObjects: true });
  if (Array.isArray(raw) && raw.length > 0) return raw as PushPoolItem[];
  return [];
}

function tPoolItem(key: string): PushPoolItem | null {
  const raw = i18n.t(key, { returnObjects: true });
  if (raw && typeof raw === "object" && !Array.isArray(raw) && "title" in raw) {
    return raw as PushPoolItem;
  }
  return null;
}

function tMilestones(key: string): Record<string, PushPoolItem> {
  const raw = i18n.t(key, { returnObjects: true });
  if (raw && typeof raw === "object" && !Array.isArray(raw)) {
    return raw as Record<string, PushPoolItem>;
  }
  return {};
}

function habitLabel(ctx: NotificationContext): string {
  const h = ctx.habitName.trim();
  if (h) return h;
  const fb = i18n.t(`${PUSH}.habitFallback`);
  return fb === `${PUSH}.habitFallback` ? "alışkanlığın" : fb;
}

function phaseNum(day: number): 1 | 2 | 3 {
  if (day <= 22) return 1;
  if (day <= 44) return 2;
  return 3;
}

function buildParams(ctx: NotificationContext): Record<string, string | number> {
  const pn = phaseNum(ctx.dayNumber);
  const phaseKey = `${PUSH}.phase.${pn}`;
  const phaseLabel = i18n.t(phaseKey);
  return {
    habit: habitLabel(ctx),
    day: ctx.dayNumber,
    streak: ctx.streak,
    misses: ctx.consecutiveMisses,
    phase: phaseLabel === phaseKey ? String(pn) : phaseLabel,
    daysLeft: Math.max(0, 66 - ctx.dayNumber),
    plan: ctx.plannedAction?.trim() ?? "",
    autoAvg:
      ctx.last3AvgAuto != null ? Math.round(ctx.last3AvgAuto * 10) / 10 : 0,
  };
}

function renderTpl(
  template: string,
  params: Record<string, string | number>
): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key: string) => {
    const v = params[key];
    return v !== undefined && v !== "" ? String(v) : "";
  });
}

function itemToCopy(item: PushPoolItem, ctx: NotificationContext): NotifCopy {
  const params = buildParams(ctx);
  const plan = ctx.plannedAction?.trim();
  const bodyTpl = plan && item.bodyPlanned ? item.bodyPlanned : item.body;
  return {
    title: renderTpl(item.title, params),
    body: renderTpl(bodyTpl, params),
  };
}

function pickFromPool(
  poolKey: string,
  seed: number,
  ctx: NotificationContext
): NotifCopy | null {
  const pool = tArrayPool(poolKey);
  if (!pool.length) return null;
  return itemToCopy(pool[Math.abs(seed) % pool.length]!, ctx);
}

function getMilestoneMorning(
  ctx: NotificationContext
): NotifCopy | null {
  const milestones = tMilestones(`${PUSH}.morning.milestones`);
  const item = milestones[String(ctx.dayNumber)];
  return item ? itemToCopy(item, ctx) : null;
}

const MILESTONE_DAYS = new Set([7, 14, 21, 23, 30, 44, 45, 60]);

// ─── Morning ────────────────────────────────────────────────────────────────

export function getMorningNotification(ctx: NotificationContext): NotifCopy {
  const seed = ctx.dayNumber + new Date().getDate();

  if (ctx.dayNumber <= 3) {
    const early = pickFromPool(`${PUSH}.morning.early`, seed, ctx);
    if (early) return early;
  }

  if (ctx.dayNumber === 66) {
    const d66 = tPoolItem(`${PUSH}.morning.day66`);
    if (d66) return itemToCopy(d66, ctx);
  }

  if (MILESTONE_DAYS.has(ctx.dayNumber) && seed % 3 === 0) {
    const milestone = getMilestoneMorning(ctx);
    if (milestone) return milestone;
  }

  if (ctx.status === "red" || ctx.consecutiveMisses >= 2) {
    const red = pickFromPool(`${PUSH}.morning.red`, seed, ctx);
    if (red) return red;
  }

  if (ctx.status === "yellow" || ctx.consecutiveMisses === 1) {
    const yellow = pickFromPool(`${PUSH}.morning.yellow`, seed, ctx);
    if (yellow) return yellow;
  }

  if (ctx.last3AvgAuto != null && ctx.last3AvgAuto >= 6) {
    const high = pickFromPool(`${PUSH}.morning.greenHighAuto`, seed, ctx);
    if (high) return high;
  }

  if (ctx.last3AvgAuto != null && ctx.last3AvgAuto < 4) {
    const low = pickFromPool(`${PUSH}.morning.greenLowAuto`, seed, ctx);
    if (low) return low;
  }

  const green = pickFromPool(`${PUSH}.morning.green`, seed, ctx);
  if (green) return green;

  return {
    title: i18n.t("notifications.eveningTitle"),
    body: `${habitLabel(ctx)}: ${i18n.t("home.behavior.doNow")}`,
  };
}

// ─── Evening ────────────────────────────────────────────────────────────────

export function getEveningNotification(ctx: NotificationContext): NotifCopy {
  const seed = ctx.dayNumber + new Date().getDate();

  if (ctx.todayDone) {
    return { title: "", body: "" };
  }

  if (ctx.consecutiveMisses >= 1 || ctx.status === "red") {
    const recovery = pickFromPool(`${PUSH}.evening.recovery`, seed, ctx);
    if (recovery) return recovery;
  }

  if (
    ctx.lastEffortRating != null &&
    ctx.lastEffortRating >= 7 &&
    ctx.consecutiveMisses === 0
  ) {
    const effort = pickFromPool(`${PUSH}.evening.highEffort`, seed, ctx);
    if (effort) return effort;
  }

  if (ctx.streak >= 3 || ctx.status === "yellow") {
    const urgent = pickFromPool(`${PUSH}.evening.urgent`, seed, ctx);
    if (urgent) return urgent;
  }

  if (ctx.dayNumber <= 7) {
    const first = pickFromPool(`${PUSH}.evening.gentleFirstWeek`, seed, ctx);
    if (first) return first;
  }

  const gentle = pickFromPool(`${PUSH}.evening.gentle`, seed, ctx);
  if (gentle) return gentle;

  return {
    title: getEveningNotificationTitle(),
    body: pickEveningNotificationBodyI18n(ctx.habitName, seed),
  };
}

// ─── Streak celebration ─────────────────────────────────────────────────────

export function getStreakCelebrationCopy(
  habitName: string,
  streak: number,
  _dayNumber: number
): NotifCopy | null {
  if (streak < 3) return null;

  const ctx: NotificationContext = {
    habitName,
    dayNumber: _dayNumber,
    streak,
    consecutiveMisses: 0,
    status: "green",
    last3AvgAuto: null,
    lastEffortRating: null,
    plannedAction: null,
    todayDone: false,
  };

  const milestones = tMilestones(`${PUSH}.streak.milestones`);
  const specific = milestones[String(streak)];
  if (specific) return itemToCopy(specific, ctx);

  if (streak % 7 === 0) {
    const weekly = tPoolItem(`${PUSH}.streak.weekly`);
    if (weekly) return itemToCopy(weekly, ctx);
  }

  if (streak % 5 === 0) {
    const every5 = tPoolItem(`${PUSH}.streak.every5`);
    if (every5) return itemToCopy(every5, ctx);
  }

  return null;
}

// ─── Recovery push (2+ missed days) ─────────────────────────────────────────

export function getRecoveryPush(
  habitName: string,
  missedDays: number
): NotifCopy {
  const seed = missedDays + new Date().getDate();
  const ctx: NotificationContext = {
    habitName,
    dayNumber: 1,
    streak: 0,
    consecutiveMisses: missedDays,
    status: "red",
    last3AvgAuto: null,
    lastEffortRating: null,
    plannedAction: null,
    todayDone: false,
  };
  const copy = pickFromPool(`${PUSH}.recovery`, seed, ctx);
  if (copy) return copy;
  return {
    title: "Geri dönme zamanı",
    body: `${missedDays} gün ara verdin. ${habitLabel(ctx)}: Yolculuk devam ediyor — bugün kartını aç.`,
  };
}

// ─── Phase milestone + legacy evening helpers ───────────────────────────────

function tOr(key: string, fallback: string, params?: Record<string, string | number>): string {
  const v = i18n.t(key, params);
  return v === key ? fallback : v;
}

function tArray<T>(key: string, fallback: T[]): T[] {
  const raw = i18n.t(key, { returnObjects: true });
  if (Array.isArray(raw) && raw.length > 0) return raw as T[];
  return fallback;
}

export function getEveningNotificationTitle(): string {
  return tOr("notifications.eveningTitle", "Gün bitmeden: Bugün kartı");
}

export function pickEveningNotificationBodyI18n(
  habitName: string,
  calendarDaySeed: number
): string {
  const h = habitName.trim() || i18n.t(`${PUSH}.habitFallback`);
  const fallbacks = [
    `${h} için henüz hareket yok. En küçük sürüm yeter.`,
    `Gün bitmeden: ${h}. Tek net adım yeter.`,
    `${h}: küçült, sonra aksiyona geç.`,
    `Bugün kartındaki mikro-adım ${h} için şimdi yeter.`,
  ];
  const bodies = tArray("notifications.eveningBodies", fallbacks);
  const template = bodies[Math.abs(calendarDaySeed) % bodies.length] ?? bodies[0]!;
  return template.replace(/\{\{habit\}\}/g, h);
}

export type PhaseMilestoneNotification = {
  dayOffset: number;
  title: string;
  body: string;
};

const FALLBACK_MILESTONES: PhaseMilestoneNotification[] = [
  { dayOffset: 6, title: "7 günlük kuruluş 🌱", body: "İlk hafta tamam — devam et." },
  { dayOffset: 13, title: "14 gün", body: "Örüntü kuruluyor — küçük adım yeter." },
  { dayOffset: 21, title: "Kuruluş tamamlandı 🎯", body: "Pekiştirme başlıyor." },
  { dayOffset: 29, title: "30 gün", body: "Yarı yoldasın." },
  { dayOffset: 43, title: "Otomatikleşme 🚀", body: "Son faz başlıyor." },
  { dayOffset: 59, title: "60 gün 🌟", body: "Bitiş yakın." },
  { dayOffset: 65, title: "66 gün 🎉", body: "Tamamlandı." },
];

export function getPhaseMilestoneNotifications(): PhaseMilestoneNotification[] {
  const raw = i18n.t("notifications.phaseMilestones", { returnObjects: true });
  if (Array.isArray(raw) && raw.length > 0) {
    return raw as PhaseMilestoneNotification[];
  }
  return FALLBACK_MILESTONES;
}
