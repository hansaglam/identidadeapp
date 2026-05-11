import { UserProfile } from "../types";
import { coerceJourneyTreeType } from "./journeyTree";

/**
 * AsyncStorage'dan gelen eksik / eski şemalar için güvenli varsayılanlar.
 * Eski `themeMode` alanı yüklendiğinde yok sayılır (tek açık tema).
 */
export function normalizeProfile(p: UserProfile): UserProfile {
  const next = { ...p };
  delete (next as { themeMode?: unknown }).themeMode;

  return {
    ...next,
    contextPreset: next.contextPreset ?? null,
    restModeUntilISO: next.restModeUntilISO ?? null,
    notifyMorningEnabled: next.notifyMorningEnabled !== false,
    notifyEveningEnabled: next.notifyEveningEnabled !== false,
    notifyWeekendEnabled: next.notifyWeekendEnabled !== false,
    notifyPhaseMilestones: next.notifyPhaseMilestones !== false,
    firstWeekGuideDismissed: next.firstWeekGuideDismissed ?? false,
    hasOpenedJourneyTab: next.hasOpenedJourneyTab ?? false,
    journeySequence: next.journeySequence ?? 0,
    completedHabits: next.completedHabits ?? [],
    stackingOfferPending: next.stackingOfferPending ?? false,
    journeyTreeType: coerceJourneyTreeType(next.journeyTreeType),
  };
}
