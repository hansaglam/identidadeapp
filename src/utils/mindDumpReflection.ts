import { parseISO, startOfDay, differenceInCalendarDays } from "date-fns";
import i18n from "../i18n/config";
import { analyzeMindDump } from "../engine/mindDumpAnalyzer";
import type { MindDumpEntry } from "../types";
import type { CheckinRecord } from "../types";

const STRUGGLE_HINTS = [
  "istemiyorum",
  "yorgun",
  "zor",
  "bırak",
  "vazgeç",
  "tüken",
  "bitkin",
  "çaresiz",
  "don't want",
  "tired",
  "hard",
  "give up",
  "exhausted",
  "cansado",
  "desistir",
];

function entryDayNumber(startDate: string, createdAt: string): number {
  const a = startOfDay(parseISO(startDate));
  const b = startOfDay(parseISO(createdAt));
  return Math.max(1, differenceInCalendarDays(b, a) + 1);
}

function looksLikeStruggle(text: string): boolean {
  const low = text.toLocaleLowerCase();
  return STRUGGLE_HINTS.some((w) => low.includes(w));
}

export type MindDumpReflectionState = {
  showBanner: boolean;
  bannerTitle: string;
  bannerBody: string;
  quote: string | null;
};

export function buildMindDumpReflection(
  savedText: string,
  entries: MindDumpEntry[],
  checkins: Record<string, CheckinRecord>,
  habitName: string,
  startDate: string
): MindDumpReflectionState {
  const trimmed = savedText.trim();
  if (!trimmed) {
    return {
      showBanner: false,
      bannerTitle: "",
      bannerBody: "",
      quote: null,
    };
  }

  const analysis = analyzeMindDump(trimmed);
  const muscle = analysis.detectedMuscle;

  if (!analysis.matchedKeyword) {
    return {
      showBanner: false,
      bannerTitle: "",
      bannerBody: "",
      quote: null,
    };
  }

  const showBanner =
    muscle === "resistance" ||
    muscle === "recovery" ||
    muscle === "activation";

  if (!showBanner) {
    return {
      showBanner: false,
      bannerTitle: "",
      bannerBody: "",
      quote: null,
    };
  }

  const kw = analysis.matchedKeyword;
  const bannerTitle = i18n.t("mindDumpReflection.bannerTitle");
  let bannerBody: string;
  if (muscle === "resistance") {
    bannerBody = i18n.t("mindDumpReflection.bannerBodyKeyword", { keyword: kw });
  } else if (muscle === "recovery") {
    bannerBody = i18n.t("mindDumpReflection.bannerBodyRecovery", { keyword: kw });
  } else {
    bannerBody = i18n.t("mindDumpReflection.bannerBodyActivation", { keyword: kw });
  }

  const quote = pickEncouragementQuote(
    entries,
    checkins,
    trimmed,
    startDate,
    habitName.trim() || i18n.t("mindDumpReflection.defaultHabit")
  );

  return { showBanner: true, bannerTitle, bannerBody, quote };
}

function pickEncouragementQuote(
  entries: MindDumpEntry[],
  checkins: Record<string, CheckinRecord>,
  excludeText: string,
  startDate: string,
  habitLabel: string
): string | null {
  const ex = excludeText.trim();
  const pool = entries.filter((e) => {
    if (e.content.trim() === ex) return false;
    const day = e.createdAt.slice(0, 10);
    const c = checkins[day];
    if (!c?.completed) return false;
    return looksLikeStruggle(e.content);
  });
  if (pool.length === 0) return null;
  const pick = pool[Math.floor(Math.random() * pool.length)]!;
  const dn = entryDayNumber(startDate, pick.createdAt);
  const words = pick.content.trim().split(/\s+/).slice(0, 8).join(" ");
  const tail = words.length > 50 ? `${words.slice(0, 47)}…` : words;
  return i18n.t("mindDumpReflection.quote", {
    day: dn,
    snippet: tail,
    habit: habitLabel,
  });
}
