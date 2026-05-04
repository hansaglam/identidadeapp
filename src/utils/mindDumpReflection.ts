import { parseISO, startOfDay, differenceInCalendarDays } from "date-fns";
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
];

function entryDayNumber(startDate: string, createdAt: string): number {
  const a = startOfDay(parseISO(startDate));
  const b = startOfDay(parseISO(createdAt));
  return Math.max(1, differenceInCalendarDays(b, a) + 1);
}

function looksLikeStruggle(text: string): boolean {
  const low = text.toLocaleLowerCase("tr-TR");
  return STRUGGLE_HINTS.some((w) => low.includes(w));
}

export type MindDumpReflectionState = {
  showBanner: boolean;
  bannerTitle: string;
  bannerBody: string;
  quote: string | null;
};

/**
 * Kayıt sonrası: direnç / yük (recovery) sinyali + geçmişten güçlü alıntı.
 */
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
  const bannerTitle = "Notunu burada okuduk";
  let bannerBody: string;
  if (muscle === "resistance") {
    bannerBody = `Bugün "${kw}" geçiyor; bu, direnç kası antrenmanında olabileceğin anlamına gelebilir.`;
  } else if (muscle === "recovery") {
    bannerBody = `Bugün "${kw}" geçiyor; yükünü fark etmen önemli. Küçük bir adım yine ilerlemedir.`;
  } else {
    bannerBody = `Bugün "${kw}" geçiyor; enerji düşük hissi genelde geçicidir — bugünkü adımı küçük tutmak yeter.`;
  }

  const quote = pickEncouragementQuote(
    entries,
    checkins,
    trimmed,
    startDate,
    habitName.trim() || "Bugünkü adımın"
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
  return `Gün ${dn}'de "${tail}" demiştin; o gün kutuyu kapattın. ${habitLabel} için bugün de en küçük versiyon yeter.`;
}
