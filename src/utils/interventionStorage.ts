import AsyncStorage from "@react-native-async-storage/async-storage";

const KEY = "kimlik:proactive_intervention_dismissed";

export async function getProactiveInterventionDismissedForDay(
  dayKey: string
): Promise<boolean> {
  const v = await AsyncStorage.getItem(KEY);
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
