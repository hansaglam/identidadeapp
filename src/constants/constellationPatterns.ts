/**
 * Kimlik Takımyıldızı — gün 1–66 için normalize (0–1) düzlem koordinatları.
 * Basit zigzag desen (tüm harfler için aynı hat).
 */

export type ConstellationPoint = { x: number; y: number };

const N = 66;

/** 0–1 aralığına sıkıştır */
function clamp01(v: number): number {
  return Math.min(1, Math.max(0, v));
}

/** Dalga / zigzag — tek desen */
export function buildPatternZigzag(): ConstellationPoint[] {
  const out: ConstellationPoint[] = [];
  const pad = 0.08;
  for (let i = 0; i < N; i += 1) {
    const t = i / (N - 1);
    const x = pad + t * (1 - 2 * pad);
    const wave = Math.sin(t * Math.PI * 5) * 0.22 + Math.sin(t * Math.PI * 11) * 0.06;
    const y = 0.5 + wave;
    out.push({ x: clamp01(x), y: clamp01(y) });
  }
  return out;
}

/**
 * Harf parametresi geriye dönük uyumluluk; desen her zaman zigzag.
 */
export function getConstellationPatternForLetter(_raw: string): ConstellationPoint[] {
  return buildPatternZigzag();
}

/** Ender Yıldız günleri: 7, 14, …, 63 */
export const ENDER_DAYS = [7, 14, 21, 28, 35, 42, 49, 56, 63] as const;

export type EnderDay = (typeof ENDER_DAYS)[number];

export function getEnderCardCopy(dayNumber: number): {
  title: string;
  subtitle: string | null;
  allComplete: boolean;
} {
  if (dayNumber >= 66) {
    return {
      title: "Son Ender Yıldızını yakmışsın! 🎉",
      subtitle: null,
      allComplete: true,
    };
  }

  const nextBlock = Math.ceil(dayNumber / 7) * 7;
  const isMilestoneToday = dayNumber % 7 === 0;

  if (isMilestoneToday) {
    return {
      title: "✦ Bugün Ender Yıldız günü!",
      subtitle: null,
      allComplete: false,
    };
  }

  let nextMilestone = nextBlock;
  if (nextMilestone <= dayNumber) {
    nextMilestone += 7;
  }
  nextMilestone = Math.min(nextMilestone, 63);
  if (nextMilestone <= dayNumber) {
    return {
      title: "✦ Son Ender kilometre taşlarını tamamladın.",
      subtitle: null,
      allComplete: false,
    };
  }

  return {
    title: `✦ Bir sonraki: Gün ${nextMilestone}`,
    subtitle: null,
    allComplete: false,
  };
}

export function isEnderDay(day: number): boolean {
  return (ENDER_DAYS as readonly number[]).includes(day);
}
