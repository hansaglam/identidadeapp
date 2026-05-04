import { format } from "date-fns";
import { UserProfile } from "../types";

/**
 * Molada mıyız? `restModeUntilISO` tarihi (yyyy-MM-DD veya ISO) dahil:
 * bugünün tarihi ≤ bitiş tarihi ise bildirim / sert uyarıları yumuşatırız.
 */
export function isRestModeActive(
  profile: Pick<UserProfile, "restModeUntilISO"> | null,
  now = new Date()
): boolean {
  const end = profile?.restModeUntilISO?.trim().slice(0, 10);
  if (!end) return false;
  const today = format(now, "yyyy-MM-dd");
  return today <= end;
}
