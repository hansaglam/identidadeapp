/**
 * Basit offline event tracker.
 *
 * Amaç:
 *  - Hangi şablon ne kadar seçildi / ne kadar sürdürüldü?
 *  - Hangi aşamada drop-out oluyor?
 *  - Kişisel metin YOK; sadece id + küçük payload.
 *
 * Depolama: AsyncStorage'da son 200 event döngüsel tutulur.
 * Backend hazır olduğunda `flushEvents()` ile toplu gönderim yapılabilir.
 */

import AsyncStorage from "@react-native-async-storage/async-storage";

const KEY = "analytics:events:v1";
const MAX_EVENTS = 200;

export type AnalyticsEventName =
  | "onboarding_template_selected"
  | "onboarding_completed"
  | "action_started"
  | "action_completed"
  | "action_cancelled"
  | "template_changed"
  | "checkin_completed"
  | "miss_recovered";

export interface AnalyticsEvent {
  name: AnalyticsEventName;
  at: string; // ISO
  payload?: Record<string, string | number | boolean | null>;
}

let memoryBuffer: AnalyticsEvent[] | null = null;

async function load(): Promise<AnalyticsEvent[]> {
  if (memoryBuffer) return memoryBuffer;
  try {
    const raw = await AsyncStorage.getItem(KEY);
    memoryBuffer = raw ? (JSON.parse(raw) as AnalyticsEvent[]) : [];
  } catch {
    memoryBuffer = [];
  }
  return memoryBuffer;
}

async function persist(): Promise<void> {
  if (!memoryBuffer) return;
  try {
    await AsyncStorage.setItem(KEY, JSON.stringify(memoryBuffer));
  } catch {
    if (__DEV__) console.warn("[analytics] persist failed");
  }
}

export async function trackEvent(
  name: AnalyticsEventName,
  payload?: AnalyticsEvent["payload"]
): Promise<void> {
  const list = await load();
  list.push({ name, at: new Date().toISOString(), payload });
  if (list.length > MAX_EVENTS) {
    list.splice(0, list.length - MAX_EVENTS);
  }
  await persist();
}

export async function getEvents(): Promise<AnalyticsEvent[]> {
  return (await load()).slice();
}

export async function clearEvents(): Promise<void> {
  memoryBuffer = [];
  try {
    await AsyncStorage.removeItem(KEY);
  } catch {
    // ignore
  }
}

/**
 * İleride backend hazır olduğunda çağrılacak.
 * Başarı olunca local event kuyruğunu boşaltır.
 */
export async function flushEvents(
  send: (events: AnalyticsEvent[]) => Promise<boolean>
): Promise<void> {
  const events = await getEvents();
  if (events.length === 0) return;
  const ok = await send(events);
  if (ok) await clearEvents();
}
