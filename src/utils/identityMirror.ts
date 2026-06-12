import { differenceInCalendarDays, parseISO } from "date-fns";
import i18n from "../i18n/config";
import { MindDumpEntry } from "../types";
import type { JourneyReflection } from "../store/habitStore";

const TR = "tr-TR";

function tLower(s: string): string {
  return s.toLocaleLowerCase(TR);
}

function matchesContent(content: string, keywords: string[]): string | null {
  const t = tLower(content);
  for (const kw of keywords) {
    if (t.includes(tLower(kw))) return kw;
  }
  return null;
}

// Geniş kelime bankası — TR + yaygın EN ifadeler
const RESIST = [
  "zorlanıyorum", "istemiyorum", "yapmıyorum", "yapamıyorum",
  "zor", "sıkıldım", "bırakmak", "vazgeçmek", "atlıyorum",
  "atladım", "geçiştirdim", "erteledim", "ihmal ettim", "motivasyon yok",
  "canım istemedi", "bugün olmadı", "olmadı", "başaramadım", "beceremiyorum",
  "güçlük", "uğraşıyorum", "mücadele ediyorum", "direniyorum",
  "struggling", "don't want", "can't", "skipped", "procrastinat", "failed", "hard day",
];

const TRANS = [
  "yapıyorum", "alıştım", "kolaylaştı", "alışıyorum",
  "devam", "yapabiliyorum", "alışkanlık oluyor", "oluşuyor",
  "fark ediyorum", "gelişiyorum", "ilerliyorum", "değişiyorum",
  "çabalıyorum", "öğreniyorum", "düzeliyorum", "düzeldi", "iyileşiyor",
  "sürdürüyorum", "tutuyorum", "dengeliyorum", "dengelendi", "ilerliyor",
  "sürekli hale geliyor", "rutin oluyor", "alışkanlık",
  "getting easier", "progress", "learning", "continuing", "routine", "habit forming",
];

const IDENT = [
  "düşünmeden", "kendiliğinden", "benim gibi", "otomatik",
  "farkında bile değilim", "doğal", "artık normal", "oldu zaten",
  "hiç düşünmeden", "refleks gibi", "her zaman yapıyorum",
  "kimliğim", "ben böyleyim", "bu benim", "kendim gibi hissediyorum",
  "ayrılmaz", "içimden geliyor", "içselleştirdim", "artık ben",
  "automatically", "without thinking", "natural", "part of me", "who i am",
];

const POSITIVE = [
  "gururlanıyorum", "mutluyum", "iyi hissediyorum", "keyifli",
  "enerjim var", "harika", "başardım", "güçlüyüm",
  "heyecanlı", "istekli", "motive", "üretken",
  "proud", "happy", "good", "strong", "motivated", "great",
];

const DOUBT = [
  "faydalı mı", "ne işe yarar", "gerçekten değişiyor mu", "etkisi var mı",
  "şüpheliyim", "inanmıyorum", "işe yaramıyor", "sonuç göremiyorum",
  "emin değilim", "hayal kırıklığı",
  "does it work", "not sure", "skeptic", "disappointed", "useless",
];

type Phase = "direnç" | "geçiş" | "kimlik" | "gurur" | "şüphe";

export interface IdentityMirrorMatch {
  journeyDay: number;
  phase: Phase;
  keyword: string;
}

interface MirrorTextItem {
  content: string;
  journeyDay: number;
}

function phaseContext(phase: Phase): string {
  return i18n.t(`journey.identityMirror.report.context.${phase}`);
}

function phaseLabel(phase: Phase): string {
  return i18n.t(`journey.identityMirror.report.phase.${phase}`);
}

function defaultHabitName(): string {
  return i18n.t("journey.identityMirror.report.defaultHabit");
}

function dayForEntry(startDate: string, createdAt: string): number {
  return differenceInCalendarDays(parseISO(createdAt), parseISO(startDate)) + 1;
}

/** Zihin modal notları + günlük yansımalar (Mind ekranı) */
export function collectMirrorTextItems(
  startDate: string,
  mindEntries: MindDumpEntry[],
  reflections: JourneyReflection[]
): MirrorTextItem[] {
  const items: MirrorTextItem[] = [];

  for (const e of mindEntries) {
    const text = e.content?.trim();
    if (!text) continue;
    const d = dayForEntry(startDate, e.createdAt);
    if (d < 1 || d > 66) continue;
    items.push({ content: text, journeyDay: d });
  }

  for (const r of reflections) {
    const text = r.comment?.trim();
    if (!text) continue;
    const d = r.day;
    if (d < 1 || d > 66) continue;
    items.push({ content: text, journeyDay: d });
  }

  return items.sort((a, b) => a.journeyDay - b.journeyDay);
}

export function collectIdentityMirrorMatches(
  startDate: string,
  mindEntries: MindDumpEntry[],
  reflections: JourneyReflection[] = []
): IdentityMirrorMatch[] {
  const out: IdentityMirrorMatch[] = [];

  for (const { content, journeyDay } of collectMirrorTextItems(
    startDate,
    mindEntries,
    reflections
  )) {
    const identKw = matchesContent(content, IDENT);
    if (identKw) {
      out.push({ journeyDay, phase: "kimlik", keyword: identKw });
      continue;
    }

    const transKw = matchesContent(content, TRANS);
    if (transKw) {
      out.push({ journeyDay, phase: "geçiş", keyword: transKw });
      continue;
    }

    const posKw = matchesContent(content, POSITIVE);
    if (posKw) {
      out.push({ journeyDay, phase: "gurur", keyword: posKw });
      continue;
    }

    const doubtKw = matchesContent(content, DOUBT);
    if (doubtKw) {
      out.push({ journeyDay, phase: "şüphe", keyword: doubtKw });
      continue;
    }

    const resistKw = matchesContent(content, RESIST);
    if (resistKw) {
      out.push({ journeyDay, phase: "direnç", keyword: resistKw });
      continue;
    }
  }

  return out.sort((a, b) => a.journeyDay - b.journeyDay);
}

export type IdentityMirrorMode = "matched" | "fallback" | "empty";

export interface IdentityMirrorOutput {
  mode: IdentityMirrorMode;
  report: string | null;
  totalNotes: number;
  signalCount: number;
  latestDay: number | null;
  latestSnippet: string | null;
}

function snippet(text: string, max = 72): string {
  const t = text.replace(/\s+/g, " ").trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max - 1)}…`;
}

function buildMatchedReport(
  matches: IdentityMirrorMatch[],
  habitName: string
): string {
  const h = habitName.trim() || defaultHabitName();
  const first = matches[0]!;
  const last = matches[matches.length - 1]!;

  if (matches.length === 1) {
    return i18n.t("journey.identityMirror.report.single", {
      day: first.journeyDay,
      keyword: first.keyword,
      habit: h,
      context: phaseContext(first.phase),
    });
  }

  if (first.phase === last.phase) {
    return i18n.t("journey.identityMirror.report.samePhase", {
      firstDay: first.journeyDay,
      lastDay: last.journeyDay,
      phase: phaseLabel(first.phase),
      habit: h,
    });
  }

  const pairKey = `${first.phase}-${last.phase}`;
  const pairI18nKey = `journey.identityMirror.report.pair.${pairKey}`;
  if (i18n.exists(pairI18nKey)) {
    return i18n.t(pairI18nKey, {
      habit: h,
      firstDay: first.journeyDay,
      lastDay: last.journeyDay,
    });
  }

  return i18n.t("journey.identityMirror.report.progress", {
    firstDay: first.journeyDay,
    firstKeyword: first.keyword,
    lastDay: last.journeyDay,
    lastKeyword: last.keyword,
    habit: h,
  });
}

export function buildIdentityMirrorOutput(
  startDate: string,
  mindEntries: MindDumpEntry[],
  reflections: JourneyReflection[],
  habitName: string
): IdentityMirrorOutput {
  const items = collectMirrorTextItems(startDate, mindEntries, reflections);
  const matches = collectIdentityMirrorMatches(startDate, mindEntries, reflections);

  if (items.length === 0) {
    return {
      mode: "empty",
      report: null,
      totalNotes: 0,
      signalCount: 0,
      latestDay: null,
      latestSnippet: null,
    };
  }

  const latest = items[items.length - 1]!;

  if (matches.length > 0) {
    return {
      mode: "matched",
      report: buildMatchedReport(matches, habitName),
      totalNotes: items.length,
      signalCount: matches.length,
      latestDay: latest.journeyDay,
      latestSnippet: snippet(latest.content),
    };
  }

  return {
    mode: "fallback",
    report: null,
    totalNotes: items.length,
    signalCount: 0,
    latestDay: latest.journeyDay,
    latestSnippet: snippet(latest.content),
  };
}

/** @deprecated buildIdentityMirrorOutput kullanın */
export function buildIdentityMirrorReport(
  startDate: string,
  entries: MindDumpEntry[],
  habitName: string
): string | null {
  const out = buildIdentityMirrorOutput(startDate, entries, [], habitName);
  return out.report;
}
