import i18n from "../i18n/config";
import type { SDTScore } from "../types";

export interface SdtInsight {
  summary: string;
  tip: string;
}

function habitLabel(habitName: string): string {
  const trimmed = habitName.trim();
  if (trimmed) return trimmed;
  return i18n.t("journey.sdt.insight.defaultHabit");
}

export function buildSdtInsight(score: SDTScore, habitName: string): SdtInsight {
  const h = habitLabel(habitName);
  const { autonomy, competence, relatedness } = score;
  const params = { habit: h };
  const avg = (autonomy + competence + relatedness) / 3;

  if (avg >= 4) {
    return {
      summary: i18n.t("journey.sdt.insight.highAvg.summary", params),
      tip: i18n.t("journey.sdt.insight.highAvg.tip"),
    };
  }

  if (autonomy <= 2) {
    return {
      summary: i18n.t("journey.sdt.insight.lowAutonomy.summary", params),
      tip: i18n.t("journey.sdt.insight.lowAutonomy.tip"),
    };
  }

  if (competence <= 2) {
    return {
      summary: i18n.t("journey.sdt.insight.lowCompetence.summary", params),
      tip: i18n.t("journey.sdt.insight.lowCompetence.tip"),
    };
  }

  if (relatedness <= 2) {
    return {
      summary: i18n.t("journey.sdt.insight.lowRelatedness.summary", params),
      tip: i18n.t("journey.sdt.insight.lowRelatedness.tip"),
    };
  }

  if (autonomy >= 4 && competence < 3) {
    return {
      summary: i18n.t("journey.sdt.insight.highAutonomyLowCompetence.summary", params),
      tip: i18n.t("journey.sdt.insight.highAutonomyLowCompetence.tip"),
    };
  }

  return {
    summary: i18n.t("journey.sdt.insight.midBand.summary", params),
    tip: i18n.t("journey.sdt.insight.midBand.tip"),
  };
}
