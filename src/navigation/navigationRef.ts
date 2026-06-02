import { createNavigationContainerRef } from "@react-navigation/native";

import type { RootStackParamList } from "../types";
import type { NotificationData } from "../utils/notifications";

export const navigationRef = createNavigationContainerRef<RootStackParamList>();

/** Bildirime tıklayınca Bugün (Home); onboarding tamamlanmamışsa yok sayılır */
export function navigateToBugunTab(hasCompletedOnboarding: boolean): void {
  if (!hasCompletedOnboarding || !navigationRef.isReady()) return;
  navigationRef.navigate("Main", { screen: "Home" });
}

/** Habit bildirimi → Bugün sekmesi; isteğe bağlı görev detay sheet */
export function navigateFromNotification(
  hasCompletedOnboarding: boolean,
  payload: NotificationData
): void {
  if (!hasCompletedOnboarding || !navigationRef.isReady()) return;

  const screen = payload.screen ?? "Home";
  if (screen === "Journey") {
    navigationRef.navigate("Main", { screen: "Journey" });
    return;
  }
  if (screen === "MindDump") {
    navigationRef.navigate("Main", { screen: "MindDump" });
    return;
  }

  if (payload.type === "habit" || payload.openTaskSheet) {
    navigationRef.navigate("Main", {
      screen: "Home",
      params: {
        openTaskSheet: payload.openTaskSheet ?? payload.type === "habit",
        habitId: payload.habitId,
      },
    });
    return;
  }

  navigationRef.navigate("Main", { screen: "Home" });
}
