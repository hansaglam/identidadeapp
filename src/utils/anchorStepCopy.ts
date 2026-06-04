/**
 * Bugünün adımı + canlı aksiyon modalı için çapa bağlamlı kopya.
 */
import i18n from "../i18n/config";
import {
  inferAnchorActionContext,
  type AnchorActionContext,
} from "./anchorActionContext";

export interface AnchorStepUi {
  hasAnchor: boolean;
  contextLabel: string;
  anchorChip: string | null;
  /** Kompakt kart alt metni */
  cardLine: string;
  modalLead: string;
  modalSteps: [string, string];
  breathHint: string;
}

function contextLabel(ctx: AnchorActionContext): string {
  const key = `home.anchorStep.context.${ctx}`;
  const v = i18n.t(key);
  return v === key ? i18n.t("home.anchorStep.context.default") : v;
}

function guideLead(
  actionId: string,
  ctx: AnchorActionContext,
  hasAnchor: boolean,
  params: Record<string, string | number>
): string {
  if (!hasAnchor) {
    return i18n.t("home.anchorStep.guide._fallback.lead_default", params);
  }
  const specific = `home.anchorStep.guide.${actionId}.lead_${ctx}`;
  const generic = `home.anchorStep.guide.${actionId}.lead`;
  const fbCtx = `home.anchorStep.guide._fallback.lead_${ctx}`;
  const fb = "home.anchorStep.guide._fallback.lead";
  const v1 = i18n.t(specific, params);
  if (v1 !== specific) return v1;
  const v2 = i18n.t(generic, params);
  if (v2 !== generic) return v2;
  const v3 = i18n.t(fbCtx, params);
  if (v3 !== fbCtx) return v3;
  return i18n.t(fb, params);
}

function guideStep(
  actionId: string,
  step: "step1" | "step2",
  params: Record<string, string | number>
): string {
  const key = `home.anchorStep.guide.${actionId}.${step}`;
  const v = i18n.t(key, params);
  if (v !== key) return v;
  return i18n.t(`home.anchorStep.guide._fallback.${step}`, params);
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
  const ctx = inferAnchorActionContext(anchorRaw);
  const ctxLabel = contextLabel(ctx);
  const params = {
    anchor: anchorRaw,
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
    anchorChip: hasAnchor ? anchorRaw : null,
    cardLine,
    modalLead: guideLead(args.actionId, ctx, hasAnchor, params),
    modalSteps: [
      guideStep(args.actionId, "step1", params),
      guideStep(args.actionId, "step2", params),
    ],
    breathHint: breathHint(args.actionId, args.duration),
  };
}
