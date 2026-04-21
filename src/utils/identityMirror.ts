import { differenceInCalendarDays, parseISO } from "date-fns";
import { MindDumpEntry } from "../types";

const TR = "tr-TR";
function tLower(s: string): string {
  return s.toLocaleLowerCase(TR);
}

const RESIST = [
  "zorlanıyorum", "istemiyorum", "yapmıyorum", "yapamıyorum",
  "zor", "sıkıldım", "bırakmak",
];
const TRANS = [
  "yapıyorum", "alıştım", "kolaylaştı", "alışıyorum",
  "devam", "yapabiliyorum",
];
const IDENT = [
  "düşünmeden", "kendiliğinden", "benim gibi", "otomatik",
  "farkında bile değilim", "doğal",
];

function matchPhase(
  content: string,
  keywords: string[]
): string | null {
  const t = tLower(content);
  for (const kw of keywords) {
    if (t.includes(tLower(kw))) return kw;
  }
  return null;
}

export interface IdentityMirrorMatch {
  journeyDay: number;
  phase: "direnç" | "geçiş" | "kimlik";
  keyword: string;
}

function dayForEntry(startDate: string, createdAt: string): number {
  return differenceInCalendarDays(parseISO(createdAt), parseISO(startDate)) + 1;
}

export function collectIdentityMirrorMatches(
  startDate: string,
  entries: MindDumpEntry[]
): IdentityMirrorMatch[] {
  const out: IdentityMirrorMatch[] = [];
  for (const e of entries) {
    const d = dayForEntry(startDate, e.createdAt);
    if (d < 1 || d > 66) continue;
    if (d <= 15) {
      const kw = matchPhase(e.content, RESIST);
      if (kw) out.push({ journeyDay: d, phase: "direnç", keyword: kw });
    } else if (d >= 16 && d <= 35) {
      const kw = matchPhase(e.content, TRANS);
      if (kw) out.push({ journeyDay: d, phase: "geçiş", keyword: kw });
    } else if (d >= 36) {
      const kw = matchPhase(e.content, IDENT);
      if (kw) out.push({ journeyDay: d, phase: "kimlik", keyword: kw });
    }
  }
  return out.sort((a, b) => a.journeyDay - b.journeyDay);
}

export function buildIdentityMirrorReport(
  startDate: string,
  entries: MindDumpEntry[],
  habitName: string
): string | null {
  const m = collectIdentityMirrorMatches(startDate, entries);
  if (m.length === 0) return null;

  const first = m[0]!;
  const h = habitName.trim() || "bu davranış";

  if (m.length === 1) {
    return `Gün ${first.journeyDay}'de "${first.keyword}" demiştin. ${first.phase} aşamasındasın — ${h} yolculuğunun doğal parçası.`;
  }

  const last = m[m.length - 1]!;
  if (first.phase === last.phase) {
    return `Gün ${first.journeyDay}'den ${last.journeyDay}'e kadar ${first.phase} aşamasında notlar bıraktın. Dönüşüm devam ediyor.`;
  }

  return `Gün ${first.journeyDay}'de "${first.keyword}" demiştin. Gün ${last.journeyDay}'de "${last.keyword}" dedin. "${h}" artık dışarıdan değil, içeriden geliyor.`;
}
