/**
 * Behavior Operating System — orkestratör (v2: scoring-based decision engine).
 *
 *   getUserState(data) → UserState
 *
 * Akış:
 *  1. Status'ü hesaplar  (yeşil / sarı / kırmızı)
 *  2. Otomatikleşme skorunu çıkarır
 *  3. Tahmini günü hesaplar
 *  4. Context oluşturur (saat, momentum, effort)
 *  5. Aday aksiyon havuzu kurar (template → fallback → zayıf kas)
 *  6. Mind dump + recovery aday havuzuna eklenerek scoring'e girer
 *  7. Scoring ile en iyi aksiyon seçilir
 *  8. Kişisel reason üretilir
 *  9. Interruption modu: kırmızı + düşen momentum → forcedAction
 * 10. İçgörü üretir, faz odağı ekler
 */

import { format, parseISO, subDays, startOfDay } from "date-fns";
import {
  UserBehaviorData,
  UserState,
  Action,
  MuscleInsight,
  MuscleType,
  DecisionMeta,
  ActionIntensity,
  UiMode,
  Status,
  RecentAction,
} from "./types";
import { calculateStatus } from "./status";
import { calculateAutomationScore } from "./automationScore";
import { calculatePredictionDays } from "./prediction";
import { isRecoveryMode, getRecoveryMessage } from "./recovery";
import { findWeakestMuscle, getInsights } from "./muscles";
import { ACTIONS, getActionById, ACTIONS_BY_TYPE } from "./actions";
import { analyzeRecentMindDumps } from "./mindDumpAnalyzer";
import {
  getIdentityTemplate,
  getTemplatePhaseFocus,
  type IdentityTemplate,
} from "../constants/identityTemplates";
import { CheckinRecord } from "../types";
import {
  inferAnchorActionContext,
  type AnchorActionContext,
} from "../utils/anchorActionContext";
import { computeJourneyTrend, type JourneyTrend } from "./signalTrends";

// ─── Internal types ──────────────────────────────────────────────────────────

type Momentum = "up" | "down";

const COLD_START_MAX_DAY = 7;

/** Son iki kayıtlı aksiyon birbirine yakınsa ivme yukarı; aksi halde düşüş eğilimi. */
function getMomentumFromRecentActions(
  recent: UserBehaviorData["recentActions"]
): Momentum {
  if (recent.length < 2) return "down";
  const t0 = parseISO(recent[0].at).getTime();
  const t1 = parseISO(recent[1].at).getTime();
  const gapMs = t0 - t1;
  if (gapMs >= 0 && gapMs <= 72 * 60 * 60 * 1000) return "up";
  return "down";
}

interface DecisionContext {
  weakMuscle: MuscleType;
  recoveryMode: boolean;
  yEffort: number | null;
  timeOfDay: number;
  momentum: Momentum;
  anchorContext: AnchorActionContext;
  /** Skorda tekrar cezası — en yeni önce */
  recentActionsPreview: RecentAction[];
  journeyTrend: JourneyTrend;
  coldStart: boolean;
  /** Son canlı aksiyonun kası — ardışık aynı kası azalt */
  lastLiveMuscle: MuscleType | null;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Dünün efor puanı (1-10). Kullanılabilir değilse null.
 */
function getYesterdayEffort(
  startDate: string,
  checkins: Record<string, CheckinRecord>
): number | null {
  const start = startOfDay(parseISO(startDate));
  const y = startOfDay(subDays(new Date(), 1));
  if (y < start) return null;
  const key = format(y, "yyyy-MM-dd");
  const c = checkins[key];
  if (!c?.completed || c.effortRating == null) return null;
  return c.effortRating;
}

// ─── Scoring engine ──────────────────────────────────────────────────────────

/** Son tamamlanan canlı aksiyonlarda aynı id tekrarını düşürür (çeşitlilik). */
function recencyPenalty(action: Action, recent: RecentAction[]): number {
  const idx = recent.findIndex((r) => r.id === action.id);
  if (idx < 0) return 0;
  if (idx === 0) return -16;
  if (idx === 1) return -11;
  if (idx === 2) return -7;
  if (idx <= 5) return -5;
  if (idx <= 9) return -3;
  return -1;
}

/**
 * Bir aksiyona bağlam bazlı puan verir.
 * Yüksek puan → o aksiyon bu an için daha uygun.
 *
 * Temel ağırlık: action.priority (katalogda tanımlı, 1–5).
 * Bağlamsal bonuslar katmanın üstüne eklenir.
 */
function anchorActionScore(action: Action, anchor: AnchorActionContext): number {
  let s = 0;
  switch (anchor) {
    case "sleep_winddown": {
      const discouraged = new Set([
        "stand-up",
        "walk-5",
        "interrupt-stand",
        "tpl-move-bounce-30",
        "tpl-move-pushup-1",
        "open-window",
        "tpl-move-shoes",
        "drink-water",
        "soft-restart",
      ]);
      const encouraged = new Set([
        "phone-down",
        "deep-breath",
        "close-eyes",
        "screen-blank",
        "tpl-sleep-phone",
        "tpl-sleep-screen",
        "tpl-sleep-breath",
        "count-three",
        "no-explain",
        "one-thing",
        "smile",
        "comeback",
      ]);
      if (discouraged.has(action.id)) s -= 14;
      if (encouraged.has(action.id)) s += 6;
      if (action.type === "activation" && action.intensity !== "low") s -= 5;
      if (
        (action.type === "focus" || action.type === "resistance") &&
        action.intensity === "low"
      )
        s += 2;
      break;
    }
    case "morning_routine": {
      const encouraged = new Set([
        "stand-up",
        "walk-5",
        "drink-water",
        "shake-shoulders",
        "say-identity",
        "anchor-touch",
        "open-window",
        "count-three",
      ]);
      const sleepOnly = new Set([
        "tpl-sleep-phone",
        "tpl-sleep-screen",
        "tpl-sleep-breath",
      ]);
      if (encouraged.has(action.id)) s += 5;
      if (sleepOnly.has(action.id)) s -= 12;
      if (action.type === "activation") s += 2;
      break;
    }
    case "midday": {
      if (action.type === "consistency" || action.type === "focus") s += 2;
      break;
    }
    case "phone_away": {
      const encouraged = new Set([
        "phone-down",
        "screen-blank",
        "tpl-sleep-phone",
        "tpl-focus-timer",
        "deep-breath",
        "one-thing",
        "close-eyes",
        "tpl-focus-tab",
      ]);
      if (encouraged.has(action.id)) s += 6;
      if (action.id === "walk-5" || action.id === "stand-up") s -= 6;
      break;
    }
    default:
      break;
  }
  return s;
}

function actionsFromIds(ids: string[]): Action[] {
  return ids.map((id) => getActionById(id)).filter((a): a is Action => a != null);
}

function anchorPreferenceBoostPool(anchor: AnchorActionContext): Action[] {
  switch (anchor) {
    case "sleep_winddown":
      return actionsFromIds([
        "tpl-sleep-phone",
        "tpl-sleep-screen",
        "tpl-sleep-breath",
        "phone-down",
        "deep-breath",
        "screen-blank",
        "close-eyes",
      ]);
    case "phone_away":
      return actionsFromIds([
        "phone-down",
        "screen-blank",
        "tpl-sleep-phone",
        "tpl-focus-timer",
        "tpl-focus-tab",
      ]);
    case "morning_routine":
      return actionsFromIds([
        "stand-up",
        "shake-shoulders",
        "drink-water",
        "walk-5",
        "anchor-touch",
      ]);
    case "midday":
      return actionsFromIds([
        "anchor-touch",
        "tpl-learn-name",
        "drink-water",
        "deep-breath",
      ]);
    default:
      return [];
  }
}

function scoreAction(action: Action, ctx: DecisionContext): number {
  let score = 0;

  // Katalog önceliği — en dominant sinyal
  score += action.priority * 2;

  // Zayıf kas eşleşmesi
  if (action.type === ctx.weakMuscle) score += 3;

  // Recovery önceliği
  if (ctx.recoveryMode && action.type === "recovery") score += 5;

  // Yüksek efor → kısa + hafif aksiyon
  if (ctx.yEffort != null && ctx.yEffort >= 7 && action.duration <= 5)
    score += 3;

  // Sabah → aktivasyon ideal (uyku çapası seçiliyse scoreAction içinde bastırılır)
  if (
    ctx.timeOfDay < 10 &&
    action.type === "activation" &&
    ctx.anchorContext !== "sleep_winddown"
  )
    score += 2;

  // Gece → düşük yoğunluk daha uygun
  if (ctx.timeOfDay > 22 && action.intensity === "low") score += 2;

  // Düşen momentum → kısa aksiyon sürtünmeyi kırar
  if (ctx.momentum === "down" && action.duration <= 5) score += 3;

  // Yükselen momentum → yüksek yoğunluklu aksiyon fırsatı
  if (ctx.momentum === "up" && action.intensity === "high") score += 1;

  // Interrupt aksiyonu yalnızca düşen momentumda devreye girer
  if (action.isInterrupt && ctx.momentum === "down") score += 6;

  score += anchorActionScore(action, ctx.anchorContext);
  score += recencyPenalty(action, ctx.recentActionsPreview);

  if (ctx.journeyTrend === "declining") {
    if (action.duration <= 5) score += 2;
    if (action.type === "recovery" && action.intensity === "low") score += 2;
    if (action.type === "activation" && action.intensity === "high") score -= 3;
  }
  if (ctx.journeyTrend === "improving") {
    if (action.intensity === "high") score += 1;
  }
  if (ctx.coldStart) {
    if (action.duration <= 5 && action.intensity === "low") score += 4;
    if (action.duration >= 10) score -= 5;
    if (action.intensity === "high") score -= 4;
  }
  if (ctx.lastLiveMuscle && action.type === ctx.lastLiveMuscle) {
    score -= 4;
  }

  return score;
}

/** FNV-1a tarzı — aynı girdi her zaman aynı indeks (re-render titreşimi yok). */
function stablePickIndex(seed: string, modulo: number): number {
  if (modulo <= 1) return 0;
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h) % modulo;
}

/**
 * En iyi skor bandındaki aksiyonlardan birini seçer (çeşitlilik + tekrar cezası skorda).
 */
function pickScoredAction(
  actions: Action[],
  ctx: DecisionContext,
  varietySeed: string
): Action {
  if (actions.length === 0) return ACTIONS[0]!;
  const scored = actions.map((a) => ({ action: a, score: scoreAction(a, ctx) }));
  scored.sort((a, b) => b.score - a.score);
  const top = scored[0]!.score;
  const margin = 5;
  const tier = scored.filter((x) => x.score >= top - margin);
  const cap = Math.min(Math.max(tier.length, 1), 12);
  const choices = tier.slice(0, cap);
  const idx = stablePickIndex(varietySeed, choices.length);
  return choices[idx]!.action;
}

// ─── Reason builder ──────────────────────────────────────────────────────────

function buildReason(
  ctx: DecisionContext,
  suggestedAction: Action,
  automationScore: number,
  tpl: IdentityTemplate | null | undefined,
  statusReason: string,
  mdKeyword: string | null,
  mdAggregated: string[] | undefined,
  isInterruption: boolean
): string {
  const title = suggestedAction.title;

  // Kesinti modu — en sert mesaj
  if (isInterruption) {
    return `Düşüş yakalandı. Tek hareket yeter: ${title}`;
  }

  // Mind dump sinyali (birleştirilmiş tekrar eden kelimeler)
  if (mdKeyword) {
    if (mdAggregated && mdAggregated.length > 1) {
      const hint = mdAggregated.slice(0, 3).join(" · ");
      return `Son notlarında "${hint}" yankılanıyor — şimdi: ${title}.`;
    }
    return `"${mdKeyword}" yansıdı — şimdi: ${title}.`;
  }

  // Yüksek efor (soğuk başlangıçtan önce)
  if (ctx.yEffort != null && ctx.yEffort >= 7) {
    return `Dün ${ctx.yEffort}/10 zorlandın. Bugün küçültüyoruz: ${title}`;
  }

  // Soğuk başlangıç
  if (ctx.coldStart) {
    return `İlk günler: küçük ve net bir adım. ${title}`;
  }

  // Yolculuk eğilimi + momentum
  if (ctx.journeyTrend === "declining" && ctx.momentum === "down") {
    return `Son günlerde yol zorlandı. Yumuşak bir sıçrama: ${title}`;
  }
  if (ctx.journeyTrend === "improving" && ctx.momentum === "up") {
    return `Son günler iyi gidiyor. Bu ritmi koru: ${title}`;
  }

  // Düşen momentum
  if (ctx.momentum === "down") {
    return `Son 2 gündür düştün. Şimdi tekrar başlıyoruz: ${title}`;
  }

  // Yükselen momentum
  if (ctx.momentum === "up") {
    if (automationScore >= 70 && tpl) return tpl.mirror.identity;
    return `İyi gidiyorsun. Devam et: ${title}`;
  }

  if (tpl) {
    return automationScore >= 70 ? tpl.mirror.identity : tpl.identityStatement;
  }

  return statusReason;
}

// ─── UI / explainability (post-decision, scoring’e dokunmaz) ─────────────────

function buildDecisionMeta(
  recovery: boolean,
  hasMindDump: boolean,
  effortScaled: boolean,
  journeyTrend: JourneyTrend,
  coldStart: boolean
): DecisionMeta {
  if (recovery) return { trigger: "recovery", confidence: 0.9 };
  if (hasMindDump) return { trigger: "mind_dump", confidence: 0.84 };
  if (coldStart) return { trigger: "cold_start", confidence: 0.74 };
  if (journeyTrend === "declining")
    return { trigger: "trend", confidence: 0.72 };
  if (journeyTrend === "improving")
    return { trigger: "trend", confidence: 0.66 };
  if (effortScaled) return { trigger: "effort", confidence: 0.71 };
  return { trigger: "normal", confidence: 0.62 };
}

function buildActionIntensity(
  recovery: boolean,
  forced: boolean
): ActionIntensity {
  if (recovery) return "low";
  if (forced) return "high";
  return "medium";
}

function buildUiMode(statusName: Status, forced: boolean): UiMode {
  if (forced) return "interrupt";
  if (statusName === "yellow") return "focus";
  return "normal";
}

// ─── Main export ─────────────────────────────────────────────────────────────

export function getUserState(data: UserBehaviorData): UserState {
  const status = calculateStatus(data);
  const automationScore = calculateAutomationScore(data);
  const predictionDays = calculatePredictionDays(data);
  const recovery = isRecoveryMode(status.consecutiveMisses);
  const weakMuscle = findWeakestMuscle(data.muscles);
  const tpl = getIdentityTemplate(data.identityTagId);
  const yEffort = getYesterdayEffort(data.startDate, data.checkins);
  const scaleThreshold = tpl?.scaleDownThreshold ?? 7;
  const recentPreview = data.recentActions.slice(0, 12);
  const excludeRecentIds = [...new Set(recentPreview.map((r) => r.id))].slice(
    0,
    10
  );
  const anchorContext = inferAnchorActionContext(data.habitAnchor ?? "");
  const journeyTrend = computeJourneyTrend(data.startDate, data.checkins, 14);
  const coldStart = data.dayNumber <= COLD_START_MAX_DAY;
  const lastLiveMuscle = data.recentActions[0]?.type ?? null;

  // ── 1. Build context ───────────────────────────────────────────────────────
  const now = new Date();
  const hour = now.getHours();
  const momentum: Momentum = getMomentumFromRecentActions(data.recentActions);

  const ctx: DecisionContext = {
    weakMuscle,
    recoveryMode: recovery,
    yEffort,
    timeOfDay: hour,
    momentum,
    anchorContext,
    recentActionsPreview: data.recentActions.slice(0, 15),
    journeyTrend,
    coldStart,
    lastLiveMuscle,
  };

  // ── 2. Build candidate pool ────────────────────────────────────────────────
  //   Tier 1: template preferred IDs
  //   Tier 2: all actions of weak muscle
  //   Tier 3: entire catalogue (always non-empty)
  //   Each tier excludes son tamamlanan id'ler mümkünse (excludeRecentIds).
  let candidateActions: Action[] = [];

  if (tpl) {
    const preferred = tpl.preferredActionIds
      .map((id) => getActionById(id))
      .filter((a): a is Action => a !== null);
    const filtered = preferred.filter(
      (a) => !excludeRecentIds.includes(a.id)
    );
    candidateActions = filtered.length > 0 ? filtered : preferred;
  }

  if (candidateActions.length === 0) {
    const weakPool = ACTIONS_BY_TYPE[weakMuscle].filter(
      (a) => !excludeRecentIds.includes(a.id)
    );
    candidateActions = weakPool.length > 0 ? weakPool : ACTIONS_BY_TYPE[weakMuscle];
  }

  // Always merge the full weak-muscle set so scoring has maximum coverage
  mergeInto(candidateActions, ACTIONS_BY_TYPE[weakMuscle]);

  // Çapa bağlamına uygun aksiyonları havuza ekle (skorlama seçer)
  mergeInto(candidateActions, anchorPreferenceBoostPool(anchorContext));

  // ── 3. Enrich pool so scoring has relevant candidates ─────────────────────

  // Mind dump: add muscle-matched actions so scoring can pick the best
  const md = analyzeRecentMindDumps(data.mindDumps.slice(0, 5));
  let mdKeyword: string | null = null;

  if (md?.matchedKeyword) {
    mdKeyword = md.matchedKeyword;
    const mdMuscle = md.detectedMuscle as MuscleType;
    const mdPool = ACTIONS_BY_TYPE[mdMuscle] ?? [];
    const mdFiltered = mdPool.filter(
      (a) => !excludeRecentIds.includes(a.id)
    );
    mergeInto(candidateActions, mdFiltered.length > 0 ? mdFiltered : mdPool);
  }

  // Recovery: ensure recovery actions are always scorable
  if (recovery) {
    const recPool = ACTIONS_BY_TYPE.recovery.filter(
      (a) => !excludeRecentIds.includes(a.id)
    );
    mergeInto(
      candidateActions,
      recPool.length > 0 ? recPool : ACTIONS_BY_TYPE.recovery
    );
  }

  // Effort scaling: ensure at least one short option exists for scoring
  if (yEffort != null && yEffort >= scaleThreshold) {
    const hasShort = candidateActions.some((a) => a.duration <= 5);
    if (!hasShort) {
      const softOpts = ACTIONS_BY_TYPE.recovery.filter(
        (a) => a.duration <= 5 && !excludeRecentIds.includes(a.id)
      );
      mergeInto(candidateActions, softOpts);
    }
  }

  // Tüm kataloğu aday yap (kesinti aksiyonu hariç); skor + tekrar cezası sıralar.
  mergeInto(
    candidateActions,
    ACTIONS.filter((a) => !a.isInterrupt)
  );

  // ── 4. Score & pick ────────────────────────────────────────────────────────
  const varietySeed = `${excludeRecentIds.join(",")}|d${data.dayNumber}|h${hour}|${weakMuscle}|${anchorContext}|t${journeyTrend}|c${coldStart ? 1 : 0}`;
  let suggestedAction = pickScoredAction(candidateActions, ctx, varietySeed);
  const scaledDown =
    recovery || (yEffort != null && yEffort >= scaleThreshold);

  // ── 6. Interruption mode ───────────────────────────────────────────────────
  //   red status + falling momentum → force the dedicated interrupt action
  const isInterruption = status.status === "red" && momentum === "down";
  const forcedAction = isInterruption ? true : undefined;

  if (isInterruption) {
    const interruptAction = ACTIONS.find((a) => a.isInterrupt);
    if (interruptAction) suggestedAction = interruptAction;
  }

  // ── 5. Reason ──────────────────────────────────────────────────────────────
  let reason = buildReason(
    ctx,
    suggestedAction,
    automationScore,
    tpl,
    status.reason,
    mdKeyword,
    md?.aggregatedKeywords,
    isInterruption
  );

  // Recovery overrides reason with dedicated message
  if (recovery && !isInterruption) {
    reason = getRecoveryMessage(status.consecutiveMisses, data.habitName);
  }

  // Mind dump + template: apply identity mirror tone
  if (md?.matchedKeyword && tpl && !recovery && !isInterruption) {
    if (md.detectedMuscle === "recovery") {
      reason = tpl.mirror.lowEnergy;
    } else if (md.detectedMuscle === "resistance") {
      reason = tpl.mirror.resistance;
    }
  }

  const effortSignal =
    yEffort != null && yEffort >= scaleThreshold;
  const decisionMeta = buildDecisionMeta(
    recovery,
    Boolean(md?.matchedKeyword),
    !recovery && effortSignal,
    journeyTrend,
    coldStart
  );
  const actionIntensity = buildActionIntensity(recovery, Boolean(forcedAction));
  const uiMode = buildUiMode(status.status, Boolean(forcedAction));

  // ── 7. Assemble ────────────────────────────────────────────────────────────
  const insights: MuscleInsight[] = getInsights(data.muscles, null);
  const phaseFocus = tpl ? getTemplatePhaseFocus(tpl, data.dayNumber) : null;
  const situationCue = situationCueFromPreset(data.contextPreset);

  return {
    status: status.status,
    automationScore,
    predictionDays,
    weakMuscle,
    suggestedAction,
    insights,
    recoveryMode: recovery,
    scaledDown,
    identityTagId: data.identityTagId,
    phaseFocus,
    reason,
    forcedAction,
    decisionMeta,
    actionIntensity,
    uiMode,
    situationCue,
  };
}

function situationCueFromPreset(
  preset: UserBehaviorData["contextPreset"] | undefined
): string | null {
  if (!preset) return null;
  const m: Record<"home" | "work" | "travel", string> = {
    home: "Bağlam · ev: en küçük sürüm bile yeter.",
    work: "Bağlam · iş arası: 1–2 dk net hareket.",
    travel: "Bağlam · seyahat: ortama uyan tek mikro-adım.",
  };
  return m[preset] ?? null;
}

// ─── Utility ─────────────────────────────────────────────────────────────────

/** Merges `source` into `target` without introducing duplicate IDs. */
function mergeInto(target: Action[], source: Action[]): void {
  const existing = new Set(target.map((a) => a.id));
  for (const a of source) {
    if (!existing.has(a.id)) {
      target.push(a);
      existing.add(a.id);
    }
  }
}
