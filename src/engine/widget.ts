/**
 * Widget / Live Activity veri ihracı.
 *
 * Widget'ın görevi sadece göstermek değil — TIKLANINCA AKSİYON TETİKLER.
 * Ön taraf (iOS Live Activity, Android Glance Widget) bu paketi okur
 * ve "Şimdi yap" CTA'sıyla aksiyonu açar.
 */

import { UserState, WidgetData, Status } from "./types";

export const STATUS_LABELS: Record<Status, string> = {
  green: "Yolda",
  yellow: "Riskli",
  red: "Müdahale Gerekli",
};

export const STATUS_EMOJI: Record<Status, string> = {
  green: "🟢",
  yellow: "🟡",
  red: "🔴",
};

export function exportWidgetData(state: UserState): WidgetData {
  return {
    status: state.status,
    statusLabel: STATUS_LABELS[state.status],
    statusEmoji: STATUS_EMOJI[state.status],
    automationScore: state.automationScore,
    predictionDays: state.predictionDays,
    suggestedAction: {
      id: state.suggestedAction.id,
      title: state.suggestedAction.title,
      duration: state.suggestedAction.duration,
    },
  };
}
