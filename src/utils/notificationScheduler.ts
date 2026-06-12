/**
 * Bildirim zamanlamasını debounce + hash ile sınırlar — resume/focus jank önler.
 */
import { format } from "date-fns";
import type { TomorrowTodoList } from "../store/tomorrowPlanStore";
import type { CheckinRecord, UserProfile } from "../types";
import { setupNotifications } from "./notifications";

function setupHash(
  profile: UserProfile,
  todayDone: boolean,
  checkins: Record<string, CheckinRecord>
): string {
  const today = format(new Date(), "yyyy-MM-dd");
  const rec = checkins[today];
  return [
    profile.id,
    profile.notificationHour,
    profile.notificationMinute,
    profile.notifyMorningEnabled ?? true,
    profile.notifyEveningEnabled ?? true,
    profile.notifyPhaseMilestones ?? true,
    profile.notifyWeekendEnabled ?? true,
    profile.habitName,
    todayDone,
    rec?.completed ?? false,
    rec?.automaticityRating ?? "",
    rec?.effortRating ?? "",
    Object.keys(checkins).length,
  ].join("|");
}

let lastHash = "";
let pending: ReturnType<typeof setTimeout> | null = null;
let inFlight: Promise<void> | null = null;

export function invalidateNotificationScheduleCache(): void {
  lastHash = "";
}

type SetupArgs = {
  profile: UserProfile;
  todayDone: boolean;
  listsByDate: Record<string, TomorrowTodoList>;
  checkins: Record<string, CheckinRecord>;
  immediate?: boolean;
  debounceMs?: number;
};

export function requestNotificationSetup({
  profile,
  todayDone,
  listsByDate,
  checkins,
  immediate = false,
  debounceMs = 2500,
}: SetupArgs): void {
  const hash = setupHash(profile, todayDone, checkins);
  if (!immediate && hash === lastHash) return;

  if (pending) {
    clearTimeout(pending);
    pending = null;
  }

  const run = () => {
    lastHash = hash;
    inFlight = setupNotifications(profile, todayDone, listsByDate, checkins)
      .catch((e) => {
        if (__DEV__) console.warn("[notificationScheduler]", e);
        lastHash = "";
      })
      .finally(() => {
        inFlight = null;
      });
    return inFlight;
  };

  if (immediate) {
    void run();
    return;
  }

  pending = setTimeout(() => {
    pending = null;
    void run();
  }, debounceMs);
}

/** Profil/bildirim ayarı değişince — beklemeden yeniden zamanla */
export async function flushNotificationSetup(args: SetupArgs): Promise<void> {
  if (pending) {
    clearTimeout(pending);
    pending = null;
  }
  lastHash = "";
  requestNotificationSetup({ ...args, immediate: true });
  if (inFlight) await inFlight;
}
