/**
 * Notification system — "hatırlatma" değil "müdahale" tonu.
 *
 * Sabah: Gün + kimlik dili.
 * Akşam: Riskli gün sinyali + müdahale teklifi.
 * Faz geçişleri: Milestone'da tek seferlik.
 */
import * as Notifications from "expo-notifications";
import { SchedulableTriggerInputTypes } from "expo-notifications";
import { Platform } from "react-native";
import { format, addDays, parseISO, differenceInDays } from "date-fns";
import { tr } from "date-fns/locale";
import { UserProfile } from "../types";

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

// ─── Morning "Müdahale" ─────────────────────────────────────────────────────

function getMorningCopy(dayN: number, habitName: string): { title: string; body: string } {
  const h = habitName.toLowerCase();

  if (dayN <= 7) {
    return {
      title: `Gün ${dayN} — Beyin yeni yol açıyor.`,
      body: `Bugün ${h} için en küçük adımı at. Başlamak yeterli.`,
    };
  }
  if (dayN <= 22) {
    return {
      title: `Gün ${dayN} — Kuruluş fazındasın.`,
      body: `Disiplin kası güçleniyor. ${h} sahibi gibi davranma zamanı.`,
    };
  }
  if (dayN <= 44) {
    return {
      title: `Gün ${dayN} — Artık "yapan biri"sin.`,
      body: `"${h}" kimliğin pekişiyor. Bugün bir oy daha kullan.`,
    };
  }
  return {
    title: `Gün ${dayN} — Otomatikleşme yaklaşıyor.`,
    body: `Beynin artık enerji harcamadan yapıyor. Farkında ol, devam et.`,
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

export async function scheduleEveningReminderToday(
  habitName: string
): Promise<void> {
  const granted = await requestNotificationPermissions();
  if (!granted) return;

  const today = format(new Date(), "yyyy-MM-dd");
  const id = eveningId(today);

  const trigger = new Date();
  trigger.setHours(EVENING_HOUR, EVENING_MINUTE, 0, 0);
  if (trigger <= new Date()) return;

  await Notifications.cancelScheduledNotificationAsync(id).catch(() => {});
  await Notifications.scheduleNotificationAsync({
    identifier: id,
    content: {
      title: "Bugünkü disiplin durumun: Riskli.",
      body: `${habitName} için henüz harekete geçmedin. 2 dakika yeter — küçült ama bırakma.`,
    },
    trigger: { type: SchedulableTriggerInputTypes.DATE, date: trigger },
  });
}

export async function cancelEveningReminderToday(): Promise<void> {
  const today = format(new Date(), "yyyy-MM-dd");
  await Notifications.cancelScheduledNotificationAsync(eveningId(today)).catch(() => {});
}

// ─── Phase transition notifications ─────────────────────────────────────────

interface PhaseConfig {
  dayOffset: number;
  title: string;
  body: string;
}

const PHASE_TRANSITIONS: PhaseConfig[] = [
  {
    dayOffset: 21,
    title: "Kuruluş fazı tamamlandı.",
    body: "22 gün. Beyin artık farklı çalışıyor. Pekiştirme başlıyor.",
  },
  {
    dayOffset: 43,
    title: "Son faz: Otomatikleşme.",
    body: "44 gün. Artık seçmiyorsun — yapıyorsun. Kimliğin netleşiyor.",
  },
  {
    dayOffset: 65,
    title: "66 Gün tamamlandı.",
    body: "Bu artık kim olduğunun bir parçası. Kimse alamaz.",
  },
];

export async function schedulePhaseTransitions(startDate: string): Promise<void> {
  const granted = await requestNotificationPermissions();
  if (!granted) return;

  const start = parseISO(startDate);

  for (const phase of PHASE_TRANSITIONS) {
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
  await scheduleMorningNotifications(profile);
  if (!todayCheckedIn) {
    await scheduleEveningReminderToday(profile.habitName);
  }
}
