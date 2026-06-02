/**
 * Yerel analytics kuyruğundan ürün metrikleri (backend yokken).
 */

import { getEvents, type AnalyticsEvent } from "./analytics";

export interface EngagementSummary {
  totalEvents: number;
  actionCompleted: number;
  actionStarted: number;
  checkinCompleted: number;
  gateShown: number;
  gateActionFirst: number;
  gateSkipped: number;
  /** Aksiyon tamamlayan check-in'lerin oranı (0–100), yeterli veri yoksa null */
  actionBeforeCheckinRate: number | null;
  missRecovered: number;
  dailySessions: number;
  notificationTaps: number;
}

function countNamed(events: AnalyticsEvent[], name: AnalyticsEvent["name"]): number {
  return events.filter((e) => e.name === name).length;
}

export async function computeEngagementSummary(): Promise<EngagementSummary> {
  const events = await getEvents();
  const actionCompleted = countNamed(events, "action_completed");
  const checkinCompleted = countNamed(events, "checkin_completed");
  const gateActionFirst = countNamed(events, "checkin_gate_action_first");
  const gateSkipped = countNamed(events, "checkin_gate_skipped");

  let actionBeforeCheckinRate: number | null = null;
  if (checkinCompleted > 0) {
    const withAction = Math.min(gateActionFirst + actionCompleted, checkinCompleted);
    actionBeforeCheckinRate = Math.round((withAction / checkinCompleted) * 100);
  }

  return {
    totalEvents: events.length,
    actionCompleted,
    actionStarted: countNamed(events, "action_started"),
    checkinCompleted,
    gateShown: countNamed(events, "checkin_gate_shown"),
    gateActionFirst,
    gateSkipped,
    actionBeforeCheckinRate,
    missRecovered: countNamed(events, "miss_recovered"),
    dailySessions: countNamed(events, "app_session_daily"),
    notificationTaps: countNamed(events, "notification_opened"),
  };
}
