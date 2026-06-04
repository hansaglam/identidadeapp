/**
 * Runtime localization for catalog content (actions, identity templates, behavior copy).
 * UI strings live in locale JSON; engine catalogs keep Turkish as fallback defaults.
 */
import i18n from "./config";
import type { Action } from "../engine/types";
import type { IdentityTagId, IdentityTemplate } from "../constants/identityTemplates";
import { IDENTITY_TEMPLATES } from "../constants/identityTemplates";
import type { UserProfile } from "../types";

export function localizeActionTitle(id: string, fallback: string): string {
  const key = `actions.${id}.title`;
  const v = i18n.t(key);
  return v === key ? fallback : v;
}

export function localizeAction(action: Action): Action {
  return { ...action, title: localizeActionTitle(action.id, action.title) };
}

export function localizeActionById(id: string): Action | null {
  const { getActionById } = require("../engine/actions") as typeof import("../engine/actions");
  const a = getActionById(id);
  return a ? localizeAction(a) : null;
}

function templateKey(tagId: string, field: string): string {
  return `identityTemplates.${tagId}.${field}`;
}

function tTemplate(tagId: string, field: string, fallback: string): string {
  const key = templateKey(tagId, field);
  const v = i18n.t(key);
  return v === key ? fallback : v;
}

export function getLocalizedTemplate(
  tagId: IdentityTagId | string | null | undefined
): IdentityTemplate | null {
  if (!tagId) return null;
  const base = IDENTITY_TEMPLATES.find((t) => t.id === tagId);
  if (!base) return null;
  const id = base.id;
  return {
    ...base,
    title: tTemplate(id, "title", base.title),
    identityStatement: tTemplate(id, "identityStatement", base.identityStatement),
    blurb: tTemplate(id, "blurb", base.blurb),
    microActionInitial: tTemplate(id, "microActionInitial", base.microActionInitial),
    recoveryAction: tTemplate(id, "recoveryAction", base.recoveryAction),
    phases: {
      phase_1: {
        ...base.phases.phase_1,
        focus: tTemplate(id, "phases.phase_1", base.phases.phase_1.focus),
      },
      phase_2: {
        ...base.phases.phase_2,
        focus: tTemplate(id, "phases.phase_2", base.phases.phase_2.focus),
      },
      phase_3: {
        ...base.phases.phase_3,
        focus: tTemplate(id, "phases.phase_3", base.phases.phase_3.focus),
      },
    },
    mirror: {
      lowEnergy: tTemplate(id, "mirror.lowEnergy", base.mirror.lowEnergy),
      resistance: tTemplate(id, "mirror.resistance", base.mirror.resistance),
      identity: tTemplate(id, "mirror.identity", base.mirror.identity),
    },
  };
}

export function getLocalizedHabitTitle(profile: UserProfile): string {
  const tmpl = getLocalizedTemplate(profile.identityTagId);
  if (tmpl) return tmpl.title;
  return profile.habitName;
}

export function getLocalizedIdentityLine(profile: UserProfile): string {
  const tmpl = getLocalizedTemplate(profile.identityTagId);
  const why = profile.habitWhy?.trim();
  if (tmpl?.identityStatement) return tmpl.identityStatement;
  if (why) return why;
  return i18n.t("home.identityFallback", { habitName: getLocalizedHabitTitle(profile) });
}

export function getLocalizedPhaseFocus(
  tpl: IdentityTemplate,
  dayNumber: number
): string {
  const phase =
    dayNumber <= 22 ? tpl.phases.phase_1 : dayNumber <= 44 ? tpl.phases.phase_2 : tpl.phases.phase_3;
  return phase.focus;
}

export type BehaviorReasonKey =
  | "interrupt"
  | "mindDumpMulti"
  | "mindDumpSingle"
  | "highEffort"
  | "coldStart"
  | "declining"
  | "improving"
  | "momentumDown"
  | "momentumUp"
  | "status";

export function localizeBehaviorReason(
  key: BehaviorReasonKey,
  params: Record<string, string | number>
): string {
  return i18n.t(`behavior.reason.${key}`, params);
}

export function localizeSituationCue(
  preset: "home" | "work" | "travel" | null | undefined
): string | null {
  if (!preset) return null;
  return i18n.t(`behavior.situation.${preset}`);
}

export function localizeJourneyPhaseLabel(phaseId: 1 | 2 | 3): string {
  return i18n.t(`journey.phases.${phaseId}.label`);
}

export function localizeJourneyPhaseDays(phaseId: 1 | 2 | 3): string {
  return i18n.t(`journey.phases.${phaseId}.days`);
}

export function localizeJourneyPhaseSubtitle(phaseId: 1 | 2 | 3): string {
  const key = `journey.phases.${phaseId}.subtitle`;
  const v = i18n.t(key);
  if (v !== key) return v;
  const { IDENTITY_MESSAGES } = require("../constants/identity-copy") as typeof import("../constants/identity-copy");
  const map = {
    1: IDENTITY_MESSAGES.phaseDescriptions.phase1,
    2: IDENTITY_MESSAGES.phaseDescriptions.phase2,
    3: IDENTITY_MESSAGES.phaseDescriptions.phase3,
  };
  return map[phaseId];
}

function currentLng(): string {
  return i18n.resolvedLanguage ?? i18n.language ?? "tr";
}

function tOrFallback(key: string, fallback: string): string {
  const lng = currentLng();
  if (i18n.exists(key, { lng })) {
    return i18n.t(key, { lng });
  }
  // Avoid showing Turkish fallback when user chose en / pt-BR
  if (lng.startsWith("en") && i18n.exists(key, { lng: "en" })) {
    return i18n.t(key, { lng: "en" });
  }
  if (lng.startsWith("pt") && i18n.exists(key, { lng: "pt-BR" })) {
    return i18n.t(key, { lng: "pt-BR" });
  }
  return fallback;
}

function tArrayOrFallback(key: string, fallback: readonly string[]): string[] {
  const lng = currentLng();
  const raw = i18n.t(key, { returnObjects: true, lng });
  if (Array.isArray(raw) && raw.length > 0) {
    return raw as string[];
  }
  if (lng.startsWith("en")) {
    const enRaw = i18n.t(key, { returnObjects: true, lng: "en" });
    if (Array.isArray(enRaw) && enRaw.length > 0) return enRaw as string[];
  }
  if (lng.startsWith("pt")) {
    const ptRaw = i18n.t(key, { returnObjects: true, lng: "pt-BR" });
    if (Array.isArray(ptRaw) && ptRaw.length > 0) return ptRaw as string[];
  }
  return [...fallback];
}

export function getLocalizedDailyPrinciple(day: number) {
  const { getPrincipleByDay } = require("../data/dailyPrinciples") as typeof import("../data/dailyPrinciples");
  const base = getPrincipleByDay(day);
  if (!base) return undefined;
  const prefix = `dailyPrinciples.${day}`;
  return {
    ...base,
    principle: tOrFallback(`${prefix}.principle`, base.principle),
    science: tOrFallback(`${prefix}.science`, base.science),
    action: tOrFallback(`${prefix}.action`, base.action),
  };
}

export function getLocalizedJourneyEducationCards(dayNumber: number) {
  const {
    getJourneyEducationCards,
    phaseIdFromDay,
  } = require("../constants/journeyPhaseEducation") as typeof import("../constants/journeyPhaseEducation");
  const base = getJourneyEducationCards(dayNumber);
  const phaseId = phaseIdFromDay(dayNumber);
  const lng = currentLng();
  let loc = i18n.t(`journeyEducation.${phaseId}`, { returnObjects: true, lng });
  if (!Array.isArray(loc) && lng.startsWith("en")) {
    loc = i18n.t(`journeyEducation.${phaseId}`, { returnObjects: true, lng: "en" });
  }
  if (!Array.isArray(loc) && lng.startsWith("pt")) {
    loc = i18n.t(`journeyEducation.${phaseId}`, { returnObjects: true, lng: "pt-BR" });
  }
  if (!Array.isArray(loc)) return base;
  const localized = loc as { id: string; title: string; body: string }[];
  return base.map((card) => {
    const hit = localized.find((c) => c.id === card.id);
    if (!hit) return card;
    return {
      ...card,
      title: hit.title || card.title,
      body: hit.body || card.body,
    };
  });
}

export function getLocalizedDailyMindPrompt(dayNumber: number): string {
  const {
    MIND_DUMP_DAILY_PROMPTS,
  } = require("../constants/mindDumpPrompts") as typeof import("../constants/mindDumpPrompts");
  const prompts = tArrayOrFallback("mindPrompts.daily", MIND_DUMP_DAILY_PROMPTS);
  const seed = dayNumber + new Date().getDate();
  return prompts[Math.abs(seed) % prompts.length]!;
}

export function getLocalizedMindModalStartPhrases(dayNumber: number): readonly string[] {
  const {
    MIND_MODAL_START_PHRASES,
  } = require("../constants/mindDumpPrompts") as typeof import("../constants/mindDumpPrompts");
  const daily = getLocalizedDailyMindPrompt(dayNumber);
  const base = tArrayOrFallback("mindPrompts.modal", MIND_MODAL_START_PHRASES);
  if (!base.includes(daily)) return [daily, ...base.slice(0, 3)];
  return base;
}

export function getLocalizedCoachNote(dayNumber: number): string | null {
  const { getCoachNote } = require("../constants/identity-copy") as typeof import("../constants/identity-copy");
  const milestones = [7, 14, 22, 30, 44, 66];
  const exactKey = `coachNotes.day${dayNumber}`;
  const exact = i18n.t(exactKey);
  if (exact !== exactKey) return exact;
  const WINDOW = 3;
  for (let i = milestones.length - 1; i >= 0; i--) {
    const m = milestones[i];
    if (dayNumber > m && dayNumber <= m + WINDOW) {
      const k = `coachNotes.day${m}`;
      const v = i18n.t(k);
      if (v !== k) return v;
      return getCoachNote(dayNumber);
    }
  }
  return null;
}
