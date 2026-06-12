import { InteractionManager } from "react-native";
import { createNavigationContainerRef } from "@react-navigation/native";

import type { RootStackParamList } from "../types";
import type { NotificationData } from "../utils/notifications";

export const navigationRef = createNavigationContainerRef<RootStackParamList>();

const RESET_MAX_ATTEMPTS = 40;
const RESET_RETRY_MS = 50;

function performMainReset(): void {
  navigationRef.reset({
    index: 0,
    routes: [{ name: "Main" }],
  });
}

/** Onboarding bittiğinde Auth yığınından Main'e geç — navigationRef hazır olana kadar yeniden dener. */
export function resetToMainAfterOnboarding(): void {
  let attempts = 0;

  const tryReset = () => {
    if (navigationRef.isReady()) {
      performMainReset();
      return;
    }
    attempts += 1;
    if (attempts < RESET_MAX_ATTEMPTS) {
      setTimeout(tryReset, RESET_RETRY_MS);
    }
  };

  InteractionManager.runAfterInteractions(tryReset);
}

/**
 * Auth ekranındayken profil tamamlanmışsa Main'e al (cold start / nav gecikmesi).
 * @returns true → hâlâ Auth'ta veya nav hazır değil (yeniden deneme gerekir)
 */
export function ensureMainRouteIfOnboardingDone(hasCompletedOnboarding: boolean): boolean {
  if (!hasCompletedOnboarding) return false;
  if (!navigationRef.isReady()) return true;
  const root = navigationRef.getRootState();
  const routeName = root?.routes[root.index ?? 0]?.name;
  if (routeName === "Auth") {
    resetToMainAfterOnboarding();
    return true;
  }
  return false;
}

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
