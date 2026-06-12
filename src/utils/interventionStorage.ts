import AsyncStorage from "@react-native-async-storage/async-storage";

const KEY = "rito:proactive_intervention_dismissed";
const LEGACY_KEY = "kimlik:proactive_intervention_dismissed";

export async function getProactiveInterventionDismissedForDay(
  dayKey: string
): Promise<boolean> {
  let v = await AsyncStorage.getItem(KEY);
  if (v == null) {
    v = await AsyncStorage.getItem(LEGACY_KEY);
    if (v != null) {
      await AsyncStorage.setItem(KEY, v);
      await AsyncStorage.removeItem(LEGACY_KEY);
    }
  }
  return v === dayKey;
}

export async function setProactiveInterventionDismissedForDay(
  dayKey: string
): Promise<void> {
  await AsyncStorage.setItem(KEY, dayKey);
}

export async function clearProactiveInterventionStorage(): Promise<void> {
  await AsyncStorage.removeItem(KEY);
}
