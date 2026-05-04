import { createNavigationContainerRef } from "@react-navigation/native";

import type { RootStackParamList } from "../types";

export const navigationRef = createNavigationContainerRef<RootStackParamList>();

/** Bildirime tıklayınca Bugün (Home); onboarding tamamlanmamışsa yok sayılır */
export function navigateToBugunTab(hasCompletedOnboarding: boolean): void {
  if (!hasCompletedOnboarding || !navigationRef.isReady()) return;
  navigationRef.navigate("Main", { screen: "Home" });
}
