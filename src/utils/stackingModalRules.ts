/**
 * 66. gün sonrası "habit stacking" modalının ne zaman otomatik açılacağı ve hangi metin tonunun kullanılacağı.
 */

import i18n from "../i18n/config";

export type StackingModalCopyVariant =
  | "celebrate"
  | "resume"
  | "late"
  | "strong_nudge";

const STRONG_NUDGE_DAY = 73;

export function shouldOpenStackingModalOnFocus(
  dayNumber: number,
  todayDone: boolean,
  stackingOfferPending: boolean
): boolean {
  if (!stackingOfferPending) return false;
  if (dayNumber > STRONG_NUDGE_DAY) return true;
  if (dayNumber >= 67 && dayNumber <= 73 && todayDone) return true;
  if (dayNumber === 66 && todayDone) return true;
  return false;
}

export function getStackingModalCopyVariant(dayNumber: number): StackingModalCopyVariant {
  if (dayNumber > STRONG_NUDGE_DAY) return "strong_nudge";
  if (dayNumber >= 70) return "late";
  if (dayNumber >= 67) return "resume";
  return "celebrate";
}

export type StackingMindEvolution = {
  firstSnippet: string;
  lastSnippet: string;
  count: number;
} | null;

export function getStackingModalStrings(
  habitName: string,
  variant: StackingModalCopyVariant,
  evo: StackingMindEvolution
): {
  title: string;
  lead: string;
  chartTitle: string;
  chartSubtitle: string;
  evolutionIntro: string | null;
  evolutionClosing: string | null;
} {
  const h = habitName.trim() || i18n.t("stackingModal.defaultHabit");
  const hLower = h.charAt(0).toLowerCase() + h.slice(1);
  const prefix = `stackingModal.variant.${variant}`;

  const title = i18n.t(`${prefix}.title`);
  const lead = i18n.t(`${prefix}.lead`, { habit: h, habitLower: hLower });
  const chartTitle = i18n.t(`${prefix}.chartTitle`);
  const chartSubtitle = i18n.t(`${prefix}.chartSubtitle`);

  let evolutionIntro: string | null = null;
  let evolutionClosing: string | null = null;
  if (evo && evo.count > 0) {
    evolutionIntro = i18n.t("stackingModal.evolutionIntro", { count: evo.count });
    evolutionClosing =
      variant === "celebrate"
        ? i18n.t("stackingModal.evolutionCelebrate", {
            first: evo.firstSnippet,
            last: evo.lastSnippet,
          })
        : i18n.t("stackingModal.evolutionOther", {
            first: evo.firstSnippet,
            last: evo.lastSnippet,
          });
  } else if (variant === "celebrate") {
    evolutionClosing = i18n.t("stackingModal.evolutionClosingCelebrate");
  }

  return {
    title: title === `${prefix}.title` ? "" : title,
    lead: lead === `${prefix}.lead` ? "" : lead,
    chartTitle: chartTitle === `${prefix}.chartTitle` ? "" : chartTitle,
    chartSubtitle: chartSubtitle === `${prefix}.chartSubtitle` ? "" : chartSubtitle,
    evolutionIntro,
    evolutionClosing,
  };
}
