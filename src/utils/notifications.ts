/**
 * Notification system — "hatırlatma" değil "müdahale" tonu.
 *
 * Sabah: Gün + kimlik dili.
 * Akşam: Riskli gün sinyali + müdahale teklifi.
 * Faz geçişleri: Milestone'da tek seferlik.
 */
import * as Notifications from "expo-notifications";
import { SchedulableTriggerInputTypes } from "expo-notifications";
import { format, addDays, parseISO, differenceInDays } from "date-fns";
import {
  NOTIFICATION_EVENING_TITLE,
  pickEveningNotificationBody,
  PHASE_MILESTONE_NOTIFICATIONS,
} from "../constants/purposeCopy";
import { UserProfile } from "../types";
import { isRestModeActive } from "./restMode";


Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

// ─── Permissions ────────────────────────────────────────────────────────────

export async function requestNotificationPermissions(): Promise<boolean> {
  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === "granted") return true;
  const { status } = await Notifications.requestPermissionsAsync();
  return status === "granted";
}

// ─── Identifier helpers ──────────────────────────────────────────────────────

const morningId = (date: string) => `morning:${date}`;
const eveningId = (date: string) => `evening:${date}`;

function weekendDay(date: Date): boolean {
  const d = date.getDay();
  return d === 0 || d === 6;
}

function wantsMorningPulse(profile: UserProfile, targetDate: Date): boolean {
  if (profile.notifyMorningEnabled === false) return false;
  if (isRestModeActive(profile, targetDate)) return false;
  if (profile.notifyWeekendEnabled === false && weekendDay(targetDate)) return false;
  return true;
}

function wantsEveningPulse(profile: UserProfile, onDate = new Date()): boolean {
  if (profile.notifyEveningEnabled === false) return false;
  if (isRestModeActive(profile, onDate)) return false;
  if (profile.notifyWeekendEnabled === false && weekendDay(onDate)) return false;
  return true;
}

// ─── Morning "Müdahale" ─────────────────────────────────────────────────────

/** Sabah bildirimi — Welcome / Bugün vaadiyle uyumlu (kart + check-in dilini bağlar). */
function getMorningCopy(dayN: number, habitName: string): { title: string; body: string } {
  const h = habitName.trim() || "bu alışkanlık";

  if (dayN <= 3) {
    return {
      title: `Gün ${dayN} — Beyin yeni yol açıyor.`,
      body: `Bugün kartında net seçim: ${h} için 1 küçük adım. Düşünmeden başla.`,
    };
  }
  if (dayN <= 7) {
    return {
      title: `Gün ${dayN} — Yol inşa edilirken.`,
      body: `${h}: Bugün kartındaki mikro-hedefi seç — on saniye bile yeter; sonra dürüst check-in zamanı.`,
    };
  }

  if (dayN <= 14) {
    return {
      title: `Gün ${dayN} — Alışkanlık kurulurken.`,
      body: `${h} yapan biri gibi küçük bir adım daha. Bugün ekranındaki kart seni sıkıştırmadan yönlendirir.`,
    };
  }
  if (dayN <= 22) {
    return {
      title: `Gün ${dayN} — Kuruluş fazı bitmek üzere.`,
      body: `22. güne yaklaşıyorsun. İzini sürdür: Bugün kartı + check-in.`,
    };
  }

  if (dayN === 23) {
    return {
      title: "Pekiştirme başlıyor.",
      body: `${h} küçültülmüş tekrarda oturuyor. Bugün yine karttaki tek net eylemi seç.`,
    };
  }
  if (dayN <= 35) {
    return {
      title: `Gün ${dayN} — Momentum.`,
      body: `${h} için küçük olsa da yönün seçildi.`,
    };
  }
  if (dayN <= 44) {
    return {
      title: `Gün ${dayN} — ${66 - dayN} gün daha.`,
      body: `Kaçırmanın ardından bile toparlama zamanı — Bugün kartı en küçük sürümü hatırlatır.`,
    };
  }

  if (dayN === 45) {
    return {
      title: "Son faz: Otomatikleşme.",
      body: `${h} seçimleri alışkanlığa dönüşüyor — Bugün kartı mikro-tekrardan vazgeçme.`,
    };
  }
  if (dayN <= 60) {
    return {
      title: `Gün ${dayN} — Kimlik netleşiyor.`,
      body: `${66 - dayN} gün kaldı. Zor bir günde bile Bugün’de yön seçmek yeter.`,
    };
  }
  if (dayN < 66) {
    return {
      title: `Gün ${dayN} — Bitiş çizgisi.`,
      body: `${66 - dayN} gün kaldı. ${h}: kart + check-in akışına güven.`,
    };
  }
  return {
    title: "66 gün tamam.",
    body: `${h} artık kim olduğunun parçası. Kaçırdığında yapı hep burada.`,
  };
}

export async function scheduleMorningNotifications(
  profile: UserProfile,
  days = 30
): Promise<void> {
  const granted = await requestNotificationPermissions();
  if (!granted) return;

  const today = new Date();

  for (let i = 0; i < days; i++) {
    const target = addDays(today, i);
    const dateStr = format(target, "yyyy-MM-dd");
    const dayN = differenceInDays(target, parseISO(profile.startDate)) + 1;

    if (dayN < 1 || dayN > 66) continue;

    const trigger = new Date(
      target.getFullYear(),
      target.getMonth(),
      target.getDate(),
      profile.notificationHour,
      profile.notificationMinute,
      0
    );

    if (trigger <= new Date()) continue;

    await Notifications.cancelScheduledNotificationAsync(morningId(dateStr)).catch(() => {});
    if (!wantsMorningPulse(profile, target)) continue;

    const copy = getMorningCopy(dayN, profile.habitName);

    await Notifications.scheduleNotificationAsync({
      identifier: morningId(dateStr),
      content: { title: copy.title, body: copy.body },
      trigger: { type: SchedulableTriggerInputTypes.DATE, date: trigger },
    });
  }
}

export async function cancelAllMorningNotifications(): Promise<void> {
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  const morningIds = scheduled
    .filter((n) => n.identifier.startsWith("morning:"))
    .map((n) => n.identifier);
  await Promise.all(
    morningIds.map((id) => Notifications.cancelScheduledNotificationAsync(id))
  );
}

// ─── Evening "Müdahale" ─────────────────────────────────────────────────────

const EVENING_HOUR = 21;
const EVENING_MINUTE = 0;

export async function scheduleEveningReminderToday(profile: UserProfile): Promise<void> {
  const granted = await requestNotificationPermissions();
  if (!granted) return;

  const today = format(new Date(), "yyyy-MM-dd");
  const id = eveningId(today);

  const trigger = new Date();
  trigger.setHours(EVENING_HOUR, EVENING_MINUTE, 0, 0);

  await Notifications.cancelScheduledNotificationAsync(id).catch(() => {});

  if (!wantsEveningPulse(profile, new Date())) return;
  if (trigger <= new Date()) return;

  const calendarSeed = Number.parseInt(today.replace(/-/g, ""), 10);
  await Notifications.scheduleNotificationAsync({
    identifier: id,
    content: {
      title: NOTIFICATION_EVENING_TITLE,
      body: pickEveningNotificationBody(profile.habitName, calendarSeed),
    },
    trigger: { type: SchedulableTriggerInputTypes.DATE, date: trigger },
  });
}

export async function cancelEveningReminderToday(): Promise<void> {
  const today = format(new Date(), "yyyy-MM-dd");
  await Notifications.cancelScheduledNotificationAsync(eveningId(today)).catch(() => {});
}

async function cancelPhaseMilestoneNotifications(): Promise<void> {
  for (const phase of PHASE_MILESTONE_NOTIFICATIONS) {
    const id = `phase:day${phase.dayOffset + 1}`;
    await Notifications.cancelScheduledNotificationAsync(id).catch(() => {});
  }
}

/** Faz bildirimi; `notifyPhaseMilestones` kapalıysa hepsini iptal eder. */
export async function schedulePhaseTransitions(profile: UserProfile): Promise<void> {
  const granted = await requestNotificationPermissions();
  if (!granted) return;

  if (profile.notifyPhaseMilestones === false) {
    await cancelPhaseMilestoneNotifications();
    return;
  }

  const start = parseISO(profile.startDate);

  for (const phase of PHASE_MILESTONE_NOTIFICATIONS) {
    const triggerDate = addDays(start, phase.dayOffset);
    triggerDate.setHours(9, 30, 0, 0);
    if (triggerDate <= new Date()) continue;

    const id = `phase:day${phase.dayOffset + 1}`;
    await Notifications.cancelScheduledNotificationAsync(id).catch(() => {});
    await Notifications.scheduleNotificationAsync({
      identifier: id,
      content: { title: phase.title, body: phase.body },
      trigger: { type: SchedulableTriggerInputTypes.DATE, date: triggerDate },
    });
  }
}

// ─── Full setup on app startup ───────────────────────────────────────────────

export async function setupNotifications(
  profile: UserProfile,
  todayCheckedIn: boolean
): Promise<void> {
  await Promise.all([
    scheduleMorningNotifications(profile),
    schedulePhaseTransitions(profile),
  ]);
  if (!todayCheckedIn) {
    await scheduleEveningReminderToday(profile);
  } else {
    await cancelEveningReminderToday();
  }
}
