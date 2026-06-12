/**
 * Bugünün adımı + canlı aksiyon modalı için çapa bağlamlı kopya.
 */
import i18n from "../i18n/config";
import { resolveAnchorId, type AnchorId } from "../constants/anchors";
import { localizeAnchorLabel } from "../i18n/localizeContent";
import {
  inferAnchorActionContext,
  type AnchorActionContext,
} from "./anchorActionContext";

const ANCHOR_LEAD_SUFFIXES = [
  "after_wake",
  "after_brush",
  "after_morning_drink",
  "after_lunch",
  "after_phone_down",
  "before_bed",
  "after_start_work",
  "after_arrive_home",
] as const;

export interface AnchorStepUi {
  hasAnchor: boolean;
  contextLabel: string;
  anchorChip: string | null;
  /** Kompakt kart alt metni */
  cardLine: string;
  modalLead: string;
  modalSteps: [string, string];
  modalTip: string | null;
  breathHint: string;
}

function contextLabel(ctx: AnchorActionContext): string {
  const key = `home.anchorStep.context.${ctx}`;
  const v = i18n.t(key);
  return v === key ? i18n.t("home.anchorStep.context.default") : v;
}

function tFirstMatch(
  keys: string[],
  params: Record<string, string | number>
): string | null {
  for (const key of keys) {
    const v = i18n.t(key, params);
    if (v !== key) return v;
  }
  return null;
}

function guideLead(
  actionId: string,
  ctx: AnchorActionContext,
  anchorId: AnchorId | null,
  hasAnchor: boolean,
  params: Record<string, string | number>
): string {
  if (!hasAnchor) {
    return i18n.t("home.anchorStep.guide._fallback.lead_default", params);
  }

  const keys: string[] = [];
  if (anchorId) {
    keys.push(`home.anchorStep.guide.${actionId}.lead_${anchorId}`);
  }
  keys.push(`home.anchorStep.guide.${actionId}.lead_${ctx}`);
  keys.push(`home.anchorStep.guide.${actionId}.lead`);
  if (anchorId) {
    keys.push(`home.anchorStep.anchorGuides.${anchorId}.lead`);
    keys.push(`home.anchorStep.guide._fallback.lead_${anchorId}`);
  }
  keys.push(`home.anchorStep.guide._fallback.lead_${ctx}`);
  keys.push(`home.anchorStep.guide._fallback.lead`);

  return (
    tFirstMatch(keys, params) ??
    i18n.t("home.anchorStep.guide._fallback.lead", params)
  );
}

function guideStep(
  actionId: string,
  step: "step1" | "step2",
  anchorId: AnchorId | null,
  params: Record<string, string | number>
): string {
  const keys: string[] = [];
  if (anchorId) {
    keys.push(`home.anchorStep.guide.${actionId}.${step}_${anchorId}`);
    keys.push(`home.anchorStep.anchorGuides.${anchorId}.${step}`);
    keys.push(`home.anchorStep.guide._fallback.${step}_${anchorId}`);
  }
  keys.push(`home.anchorStep.guide.${actionId}.${step}`);
  keys.push(`home.anchorStep.guide._fallback.${step}`);

  return (
    tFirstMatch(keys, params) ??
    i18n.t(`home.anchorStep.guide._fallback.${step}`, params)
  );
}

function guideTip(
  actionId: string,
  anchorId: AnchorId | null,
  params: Record<string, string | number>
): string | null {
  const keys: string[] = [];
  if (anchorId) {
    keys.push(`home.anchorStep.guide.${actionId}.tip_${anchorId}`);
    keys.push(`home.anchorStep.anchorGuides.${anchorId}.tip`);
  }
  keys.push(`home.anchorStep.guide.${actionId}.tip`);
  keys.push(`home.anchorStep.guide._fallback.tip`);
  return tFirstMatch(keys, params);
}

function breathHint(actionId: string, seconds: number): string {
  const visualIds = new Set([
    "anchor-visualize",
    "close-eyes",
    "box-breath-4",
    "deep-breath",
  ]);
  const key = visualIds.has(actionId)
    ? "home.anchorStep.modal.breathVisualize"
    : "home.anchorStep.modal.breath";
  return i18n.t(key, { seconds });
}

export function buildAnchorStepUi(args: {
  habitAnchor?: string;
  habitName: string;
  actionId: string;
  actionTitle: string;
  duration: number;
}): AnchorStepUi {
  const anchorRaw = args.habitAnchor?.trim() ?? "";
  const hasAnchor = anchorRaw.length > 0;
  const anchorId = hasAnchor ? resolveAnchorId(anchorRaw) : null;
  const anchorLabel =
    hasAnchor && anchorId
      ? localizeAnchorLabel(anchorId, anchorRaw)
      : anchorRaw;
  const ctx = inferAnchorActionContext(anchorRaw);
  const ctxLabel = contextLabel(ctx);
  const params = {
    anchor: anchorLabel,
    habit: args.habitName,
    title: args.actionTitle,
    contextLabel: ctxLabel,
    seconds: args.duration,
  };

  const cardLine = hasAnchor
    ? i18n.t("home.anchorStep.card.withAnchor", params)
    : i18n.t("home.anchorStep.card.noAnchor", params);

  return {
    hasAnchor,
    contextLabel: ctxLabel,
    anchorChip: hasAnchor ? anchorLabel : null,
    cardLine,
    modalLead: guideLead(args.actionId, ctx, anchorId, hasAnchor, params),
    modalSteps: [
      guideStep(args.actionId, "step1", anchorId, params),
      guideStep(args.actionId, "step2", anchorId, params),
    ],
    modalTip: hasAnchor ? guideTip(args.actionId, anchorId, params) : null,
    breathHint: breathHint(args.actionId, args.duration),
  };
}

/** Anchor ID list for locale authoring / tests */
export const ANCHOR_GUIDE_IDS = ANCHOR_LEAD_SUFFIXES;
