import { format, parseISO, startOfDay } from "date-fns";
import type { RecentAction } from "../engine";

/** Bugün (yerel takvim) tamamlanmış davranış aksiyonu var mı? */
export function hasCompletedActionToday(
  recentActions: RecentAction[],
  actionId?: string
): boolean {
  const todayKey = format(new Date(), "yyyy-MM-dd");
  return recentActions.some((r) => {
    try {
      const day = format(startOfDay(parseISO(r.at)), "yyyy-MM-dd");
      if (day !== todayKey) return false;
      if (actionId) return r.id === actionId;
      return true;
    } catch {
      return false;
    }
  });
}
