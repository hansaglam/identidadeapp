/**
 * 66. gün sonrası "habit stacking" modalının ne zaman otomatik açılacağı ve hangi metin tonunun kullanılacağı.
 */

export type StackingModalCopyVariant =
  | "celebrate"
  | "resume"
  | "late"
  | "strong_nudge";

const STRONG_NUDGE_DAY = 73;

/** Ana ekrana her dönüşte: teklif bekliyorsa ve koşullar uyuyorsa modal açılır. */
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
  const h = habitName.trim() || "bu alışkanlık";
  const hLower = h.charAt(0).toLowerCase() + h.slice(1);

  const titles: Record<StackingModalCopyVariant, string> = {
    celebrate: "66. gün — Sen bunu inşa ettin",
    resume: "66. günün arkanda — sıradaki katman",
    late: "Bir nefes al — hâlâ tam zamanındasın",
    strong_nudge: "Burada olman iyi bir işaret",
  };

  const leads: Record<StackingModalCopyVariant, string> = {
    celebrate:
      `“${h}” artık sadece yaptığın bir şey değil; zihninin “böyle biriyim” dediği bir katman.\n\n` +
      `66 günde beyin bu yolu tekrar tekrar kullandı — görünmeyen bir inşaat. Bugün o yapı fiilen teslim: bu yol senin için hatırı sayılır ölçüde hazır.`,
    resume:
      `66. gününü tamamladın; bir sonraki 66 günlük tur için seçimini erteleyebilirsin — bu da sürecin parçası.\n\n` +
      `Hazır olduğunda aynı kimlik çizgisinde yeni bir katman seç: küçük olsun, net olsun, “${hLower}” ile uyumlu olsun.`,
    late:
      `Arada zaman geçmiş olabilir; yine de yeni bir tur için geç kalmış sayılmazsın. “${h}” hâlâ kimliğinde duruyor.\n\n` +
      `İstersen şimdi taze bir 66’ya adım at — küçük bir üzerine ekleme bile büyük fark yaratır.`,
    strong_nudge:
      `Bir süredir seçimi ertelemiş olabilirsin; bu, çoğu insanın düştüğü ara değil, bekleme salonu.\n\n` +
      `Henüz bir şey kaybetmedin. “${h}” için kazandığın katman duruyor — bir sonraki adımı küçük seç, yeniden başla.`,
  };

  let evolutionIntro: string | null = null;
  let evolutionClosing: string | null = null;
  if (evo && evo.count > 0) {
    evolutionIntro =
      `Zihin notlarında ${evo.count} iz bıraktın — kelimelerin tonu da yavaş yavaş kaymış olabilir. ` +
      `Bazen fark etmeden “zorlanıyorum” ile “oluyor” arasındaki mesafe kapanır.`;
    evolutionClosing =
      variant === "celebrate"
        ? `İlk satırlarında şunu hissettiren bir şey vardı: “${evo.firstSnippet}” Son notlarında ise daha çok şuna yaklaşıyorsun: “${evo.lastSnippet}” Bu süre sadece kutucuklar değil, iç söylemin de değişti.`
        : `İlk notundan bir kesit: “${evo.firstSnippet}” Son notundan: “${evo.lastSnippet}” Aynı sen; farklı bir iç mesafe.`;
  } else {
    evolutionClosing =
      variant === "celebrate"
        ? `Bir zamanlar "epey bilinçli yapıyorum" dediğin şey, bugün çoğu zaman düşünmeden gelen bir yön olmaya yaklaştı. Bu dönüş, disiplinin en sessiz zaferi.`
        : null;
  }

  const chartTitle =
    variant === "celebrate" ? "66 gün · otomatiklik izi" : "Bu tur · otomatiklik izi";
  const chartSubtitle =
    variant === "celebrate"
      ? "Değerlendirme verdiğin günler — her nokta küçük bir oy"
      : "Değerlendirme yaptığın günler bu eğride";

  return {
    title: titles[variant],
    lead: leads[variant],
    chartTitle,
    chartSubtitle,
    evolutionIntro,
    evolutionClosing,
  };
}