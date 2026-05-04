import AsyncStorage from "@react-native-async-storage/async-storage";

const KEY_HINT = "journey:eduSwipeHintShown";
const KEY_COMPLETED = "journey:eduPhasesCompleted";
const KEY_LAST_SNIP = "journey:lastMindSentenceSnippet";

export interface JourneyEducationPrefsState {
  swipeHintShown: boolean;
  phasesCompleted12: Record<"1" | "2" | "3", boolean>;
  lastMindSentenceSnippet: string | null;
}

const emptyPhases = (): JourneyEducationPrefsState["phasesCompleted12"] => ({
  "1": false,
  "2": false,
  "3": false,
});

function parsePhases(raw: string | null): JourneyEducationPrefsState["phasesCompleted12"] {
  const base = emptyPhases();
  if (!raw) return base;
  try {
    const arr = JSON.parse(raw) as unknown;
    if (!Array.isArray(arr)) return base;
    for (const n of arr) {
      if (n === 1 || n === 2 || n === 3) base[String(n) as "1" | "2" | "3"] = true;
    }
    return base;
  } catch {
    return base;
  }
}

export async function loadJourneyEducationPrefs(): Promise<JourneyEducationPrefsState> {
  const [hint, phasesRaw, snip] = await Promise.all([
    AsyncStorage.getItem(KEY_HINT),
    AsyncStorage.getItem(KEY_COMPLETED),
    AsyncStorage.getItem(KEY_LAST_SNIP),
  ]);
  const phasesCompleted12 = parsePhases(phasesRaw);
  return {
    swipeHintShown: hint === "1",
    phasesCompleted12,
    lastMindSentenceSnippet: snip?.trim().length ? snip!.trim().slice(0, 220) : null,
  };
}

export async function setSwipeHintShown(): Promise<void> {
  await AsyncStorage.setItem(KEY_HINT, "1");
}

/** Kullanıcı bu faz özeti kartlarının son kartında Tamam’a bastığında çağrılır. */
export async function markPhaseEducationCompleted(phaseId: 1 | 2 | 3): Promise<void> {
  const cur = parsePhases(await AsyncStorage.getItem(KEY_COMPLETED));
  cur[String(phaseId) as "1" | "2" | "3"] = true;
  const arr = ([1, 2, 3] as const).filter((id) => cur[String(id) as "1" | "2" | "3"]);
  await AsyncStorage.setItem(KEY_COMPLETED, JSON.stringify(arr));
}

export async function saveLastMindSentenceSnippet(text: string): Promise<void> {
  const t = text.trim();
  if (!t) await AsyncStorage.removeItem(KEY_LAST_SNIP);
  else await AsyncStorage.setItem(KEY_LAST_SNIP, t.slice(0, 220));
}

export async function clearJourneyEducationPrefs(): Promise<void> {
  await Promise.all([
    AsyncStorage.removeItem(KEY_HINT),
    AsyncStorage.removeItem(KEY_COMPLETED),
    AsyncStorage.removeItem(KEY_LAST_SNIP),
  ]);
}
