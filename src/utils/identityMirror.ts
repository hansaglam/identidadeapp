import { differenceInCalendarDays, parseISO } from "date-fns";
import { MindDumpEntry } from "../types";

const TR = "tr-TR";
function tLower(s: string): string {
  return s.toLocaleLowerCase(TR);
}

// Geniş kelime bankası — tüm günlere açık, faz kısıtı yok
const RESIST = [
  "zorlanıyorum", "istemiyorum", "yapmıyorum", "yapamıyorum",
  "zor", "sıkıldım", "bırakmak", "vazgeçmek", "atlıyorum",
  "atladım", "geçiştirdim", "erteledim", "ihmal ettim", "motivasyon yok",
  "canım istemedi", "bugün olmadı", "olmadı", "başaramadım", "beceremiyorum",
  "güçlük", "uğraşıyorum", "mücadele ediyorum", "direniyorum",
];

const TRANS = [
  "yapıyorum", "alıştım", "kolaylaştı", "alışıyorum",
  "devam", "yapabiliyorum", "alışkanlık oluyor", "oluşuyor",
  "fark ediyorum", "gelişiyorum", "ilerliyorum", "değişiyorum",
  "çabalıyorum", "öğreniyorum", "düzeliyorum", "düzeldi", "iyileşiyor",
  "sürdürüyorum", "tutuyorum", "dengeliyorum", "dengelendi", "ilerliyor",
  "sürekli hale geliyor", "rutin oluyor", "alışkanlık",
];

const IDENT = [
  "düşünmeden", "kendiliğinden", "benim gibi", "otomatik",
  "farkında bile değilim", "doğal", "artık normal", "oldu zaten",
  "hiç düşünmeden", "refleks gibi", "her zaman yapıyorum",
  "kimliğim", "ben böyleyim", "bu benim", "kendim gibi hissediyorum",
  "ayrılmaz", "içimden geliyor", "içselleştirdim", "artık ben",
];

const POSITIVE = [
  "gururlanıyorum", "mutluyum", "iyi hissediyorum", "keyifli",
  "enerjim var", "harika", "başardım", "güçlüyüm",
  "heyecanlı", "istekli", "motive", "üretken",
];

const DOUBT = [
  "faydalı mı", "ne işe yarar", "gerçekten değişiyor mu", "etkisi var mı",
  "şüpheliyim", "inanmıyorum", "işe yaramıyor", "sonuç göremiyorum",
  "emin değilim", "hayal kırıklığı",
];

type Phase = "direnç" | "geçiş" | "kimlik" | "gurur" | "şüphe";

function matchAny(
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
  phase: Phase;
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

    // Her keyword grubunu gün kısıtı olmadan tüm yazılara uygula
    // Öncelik: kimlik > geçiş > gurur > şüphe > direnç
    const identKw = matchAny(e.content, IDENT);
    if (identKw) { out.push({ journeyDay: d, phase: "kimlik", keyword: identKw }); continue; }

    const transKw = matchAny(e.content, TRANS);
    if (transKw) { out.push({ journeyDay: d, phase: "geçiş", keyword: transKw }); continue; }

    const posKw = matchAny(e.content, POSITIVE);
    if (posKw) { out.push({ journeyDay: d, phase: "gurur", keyword: posKw }); continue; }

    const doubtKw = matchAny(e.content, DOUBT);
    if (doubtKw) { out.push({ journeyDay: d, phase: "şüphe", keyword: doubtKw }); continue; }

    const resistKw = matchAny(e.content, RESIST);
    if (resistKw) { out.push({ journeyDay: d, phase: "direnç", keyword: resistKw }); continue; }
  }

  return out.sort((a, b) => a.journeyDay - b.journeyDay);
}

const PHASE_CONTEXT: Record<Phase, string> = {
  "direnç": "direnç aşamasındasın — bu tamamen normal, beyin hâlâ yeni yolu inşa ediyor.",
  "geçiş": "geçiş aşamasındasın — alışkanlık yerleşmeye başlıyor, tutarlılık burada her şey.",
  "kimlik": "kimlik aşamasındasın — davranış sana özgü hale gelmiş. Bu değişim kalıcı.",
  "gurur": "olumlu bir an yaşıyorsun. Bu hissi hatırla — zorlandığında geri döneceksin.",
  "şüphe": "şüphe de yolculuğun parçası. 66 gün sonunda sonuçlar konuşacak.",
};

export function buildIdentityMirrorReport(
  startDate: string,
  entries: MindDumpEntry[],
  habitName: string
): string | null {
  const m = collectIdentityMirrorMatches(startDate, entries);
  if (m.length === 0) return null;

  const h = habitName.trim() || "bu davranış";
  const first = m[0]!;
  const last = m[m.length - 1]!;

  if (m.length === 1) {
    return `Gün ${first.journeyDay}'de "${first.keyword}" demiştin. ${h} için ${PHASE_CONTEXT[first.phase]}`;
  }

  // Birden fazla eşleşme varsa yolculuğu anlat
  if (first.phase === last.phase) {
    return `Gün ${first.journeyDay}'den ${last.journeyDay}'e kadar ${first.phase} aşamasında notlar bıraktın. "${h}" için dönüşüm devam ediyor — her gün biraz daha.`;
  }

  // Farklı fazlar — büyüme hikayesi
  const phasePair: Record<string, string> = {
    "direnç-geçiş": `"${h}" için direnç aşamasından geçiş aşamasına geçtin. Gün ${first.journeyDay}'deki o zorluk artık geride.`,
    "direnç-kimlik": `"${h}" bir dönem zor görünüyordu. Şimdi doğal hale geliyor. Bu 66 günlük yolculuğun özü.`,
    "direnç-gurur": `Gün ${first.journeyDay}'deki zorluğun ardından gurur geliyor. Bu geçiş kaçınılmazdı.`,
    "geçiş-kimlik": `"${h}" yerleşiyor. Gün ${first.journeyDay}'de alışma vardı, gün ${last.journeyDay}'de artık içinden geliyor.`,
    "şüphe-geçiş": `Şüphenin ardından devam ettin — ve bu devam etmek tam da fark yaratıyor.`,
    "şüphe-gurur": `Şüpheye rağmen devam ettin ve artık gurur duyuyorsun. Karar doğruydu.`,
  };

  const key = `${first.phase}-${last.phase}`;
  const specific = phasePair[key];
  if (specific) return specific;

  return `Gün ${first.journeyDay}'de "${first.keyword}" demiştin. Gün ${last.journeyDay}'de "${last.keyword}" dedin. "${h}" artık dışarıdan değil, içeriden geliyor.`;
}
