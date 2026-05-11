import type { UserProfile, MindDumpEntry, CheckinRecord } from "../types";
import type {
  UserBehaviorData,
  Muscles,
  RecentAction,
} from "../engine/types";

export function buildUserBehaviorData(args: {
  profile: UserProfile;
  habitName: string;
  habitAnchor?: string;
  dayNumber: number;
  checkins: Record<string, CheckinRecord>;
  mindDumps: MindDumpEntry[];
  todayDone: boolean;
  muscles: Muscles;
  recentActions: RecentAction[];
  lastActionAt: string | null;
}): UserBehaviorData {
  return {
    startDate: args.profile.startDate,
    habitName: args.habitName,
    habitAnchor: args.habitAnchor,
    dayNumber: args.dayNumber,
    checkins: args.checkins,
    mindDumps: args.mindDumps,
    todayDone: args.todayDone,
    muscles: args.muscles,
    recentActions: args.recentActions,
    lastActionAt: args.lastActionAt,
    identityTagId: args.profile.identityTagId,
    contextPreset: args.profile.contextPreset ?? undefined,
  };
}
