/** Yolculuk → Zihin köprüsünde oluşan kayıtların etiketi. */
export const JOURNEY_MIND_DUMP_PREFIX = "[Yolculuk] ";

export function isJourneyMindContent(content: string): boolean {
  return /^\s*\[Yolculuk\]/i.test(content);
}

/** Önizleme / bağlam için etiketi kırpar. */
export function stripJourneyMindPrefix(content: string): string {
  return content.replace(/^\s*\[Yolculuk\]\s*/i, "").trim();
}
