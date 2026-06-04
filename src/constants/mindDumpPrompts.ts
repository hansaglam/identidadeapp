/**
 * Günlük zihin / yansıma soruları — gün numarasına göre döner.
 */

export const MIND_DUMP_DAILY_PROMPTS: readonly string[] = [
  "Bugün kafanı en çok meşgul eden tek şey ne?",
  "Şu an içinden geçen ama sesli söylemediğin ne?",
  "Bugün için minnettar olduğun küçük bir detay?",
  "Yarın için tek bir net niyet cümlesi?",
  "Bugün hangi düşünce seni hareketsiz bıraktı?",
  "Bugün kendine söz verdiğin en küçük adım ne?",
  "Şu an vücudunda ne hissediyorsun — tek kelime?",
  "Bugün ‘erteledim’ dediğin şey neydi, neden?",
  "Kim olduğunu hatırlatan tek cümle bugün ne?",
  "Bugün enerjin 1–10; düşükse ne küçültebilirsin?",
  "Bugün en gurur duyduğun an (küçük bile olsa)?",
  "Şu an bırakmak istediğin tek yük ne?",
  "Bugün çapanı (tetikleyici) ne zaman fark ettin?",
  "Yarın sabah ilk 2 dakikada ne yapacaksın?",
];

export const MIND_MODAL_START_PHRASES: readonly string[] = [
  "Bugün kafamı en çok meşgul eden şey...",
  "Şu an içimden geçen ama sesli söylemediğim...",
  "Minnettar olduğum küçük bir detay...",
  "Yarın için tek bir net niyet...",
  "Bugün ertelediğim şey aslında...",
  "Kendime söz verdiğim en küçük adım...",
];

export function getDailyMindPrompt(dayNumber: number): string {
  const {
    getLocalizedDailyMindPrompt,
  } = require("../i18n/localizeContent") as typeof import("../i18n/localizeContent");
  return getLocalizedDailyMindPrompt(dayNumber);
}

export function getMindModalStartPhrases(dayNumber: number): readonly string[] {
  const {
    getLocalizedMindModalStartPhrases,
  } = require("../i18n/localizeContent") as typeof import("../i18n/localizeContent");
  return getLocalizedMindModalStartPhrases(dayNumber);
}
