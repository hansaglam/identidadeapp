import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  View,
  ActivityIndicator,
  StyleSheet,
  AppState,
  Text,
  TouchableOpacity,
} from "react-native";
import {
  NavigationContainer,
  Theme as NavigationTheme,
  DefaultTheme as NavDefaultTheme,
} from "@react-navigation/native";
import * as Notifications from "expo-notifications";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import {
  useFonts,
  Inter_400Regular,
  Inter_500Medium,
} from "@expo-google-fonts/inter";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import * as QuickActions from "expo-quick-actions";
import { useQuickActionCallback } from "expo-quick-actions/hooks";

import { useUserStore } from "./src/store/userStore";
import { useCheckinsStore } from "./src/store/checkinsStore";
import { useMindDumpStore } from "./src/store/mindDumpStore";
import { useSDTStore } from "./src/store/sdtStore";
import { useBehaviorStore } from "./src/store/useBehaviorStore";
import AppNavigator from "./src/navigation/AppNavigator";
import AppErrorBoundary from "./src/components/AppErrorBoundary";
import { navigateToBugunTab, navigationRef } from "./src/navigation/navigationRef";
import { setupNotifications } from "./src/utils/notifications";
import { Colors, FontSizes, Radii } from "./src/constants/theme";
import type { AppColors } from "./src/constants/theme";

SplashScreen.preventAutoHideAsync();

export default function App() {
  return <AppBootstrap />;
}

function AppBootstrap() {
  const [dataReady, setDataReady] = useState(false);

  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
  });

  const loadProfile = useUserStore((s) => s.loadProfile);
  const loadedProfile = useUserStore((s) => s.profile);
  const profileLoadFailed = useUserStore((s) => s.profileLoadFailed);
  const isUserLoading = useUserStore((s) => s.isLoading);
  const loadCheckins = useCheckinsStore((s) => s.load);
  const loadMindDump = useMindDumpStore((s) => s.load);
  const loadSDT = useSDTStore((s) => s.load);
  const loadBehavior = useBehaviorStore((s) => s.load);

  const onboardingDone = loadedProfile?.startDate != null;

  useQuickActionCallback(
    useCallback((action) => {
      if (action?.id !== "today") return;
      const p = useUserStore.getState().profile;
      navigateToBugunTab(p?.startDate != null);
    }, [])
  );

  useEffect(() => {
    let cancelled = false;
    async function syncShortcuts() {
      try {
        if (!(await QuickActions.isSupported())) return;
        if (cancelled) return;
        if (!loadedProfile?.startDate) {
          await QuickActions.setItems([]);
          return;
        }
        await QuickActions.setItems([
          {
            id: "today",
            title: "Bugün",
            subtitle: "Bugün kutusuna git",
            icon: "compose",
          },
        ]);
      } catch {
        /* kısayol kurulamazsa sorun değil */
      }
    }
    void syncShortcuts();
    return () => {
      cancelled = true;
    };
  }, [loadedProfile?.startDate]);

  useEffect(() => {
    let cancelled = false;
    async function boot() {
      await loadProfile();
      const results = await Promise.allSettled([
        loadCheckins(),
        loadMindDump(),
        loadSDT(),
        loadBehavior(),
      ]);
      const rejected = results.filter((r) => r.status === "rejected");
      if (rejected.length > 0 && __DEV__) {
        console.warn("[App] boot: bazı store yüklemeleri başarısız", rejected);
      }
      if (!cancelled) setDataReady(true);
    }
    boot();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!loadedProfile) return;

    const sync = () => {
      const todayDone = useCheckinsStore.getState().getTodayCheckin()?.completed ?? false;
      setupNotifications(loadedProfile, todayDone).catch(console.warn);
    };

    sync();
    const sub = AppState.addEventListener("change", (next) => {
      if (next === "active") sync();
    });
    return () => sub.remove();
  }, [loadedProfile]);

  useEffect(() => {
    const sub = Notifications.addNotificationResponseReceivedListener(() => {
      const p = useUserStore.getState().profile;
      navigateToBugunTab(p?.startDate != null);
    });
    return () => sub.remove();
  }, []);

  useEffect(() => {
    if ((fontsLoaded || fontError) && dataReady && !isUserLoading) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError, dataReady, isUserLoading]);

  const navTheme = useMemo((): NavigationTheme => {
    return {
      ...NavDefaultTheme,
      colors: {
        ...NavDefaultTheme.colors,
        primary: Colors.primary,
        background: Colors.bg,
        card: Colors.surface,
        text: Colors.textPrimary,
        border: Colors.borderStrong,
        notification: Colors.primary,
      },
    };
  }, []);

  const loadingStyles = useMemo(
    () =>
      StyleSheet.create({
        loading: {
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: Colors.bg,
          paddingHorizontal: 28,
        },
      }),
    []
  );

  if ((!fontsLoaded && !fontError) || !dataReady || isUserLoading) {
    return (
      <>
        <StatusBar style="dark" />
        <View style={loadingStyles.loading}>
          <ActivityIndicator color={Colors.primary} size="large" />
        </View>
      </>
    );
  }

  if (profileLoadFailed && !loadedProfile) {
    return (
      <>
        <StatusBar style="dark" />
        <ProfileRetryScreen />
      </>
    );
  }

  return (
    <>
      <StatusBar style="dark" />
      <AppErrorBoundary>
        <GestureHandlerRootView style={{ flex: 1, backgroundColor: Colors.bg }}>
          <SafeAreaProvider>
            <NavigationContainer
              theme={navTheme}
              ref={navigationRef}
              onReady={() => {
                Notifications.getLastNotificationResponseAsync().then((r) => {
                  if (!r?.notification) return;
                  const p = useUserStore.getState().profile;
                  navigateToBugunTab(p?.startDate != null);
                });
              }}
            >
              <AppNavigator initialRoute={onboardingDone ? "Main" : "Auth"} />
            </NavigationContainer>
          </SafeAreaProvider>
        </GestureHandlerRootView>
      </AppErrorBoundary>
    </>
  );
}

function ProfileRetryScreen() {
  const loadProfile = useUserStore((s) => s.loadProfile);
  const r = retryStyles(Colors);
  return (
    <View style={r.wrap}>
      <Text style={r.retryTitle}>Profil bu cihazdan okunamadı</Text>
      <Text style={r.retryBody}>
        Depolama veya izin geçici bir sorun çıkarmış olabilir. Veriler kaybolmuş sayılmaz; tekrar deneyebilirsin.
      </Text>
      <TouchableOpacity style={r.retryBtn} onPress={() => loadProfile()} activeOpacity={0.85}>
        <Text style={r.retryBtnText}>Tekrar dene</Text>
      </TouchableOpacity>
    </View>
  );
}

function retryStyles(colors: AppColors) {
  return StyleSheet.create({
    wrap: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: 28,
      backgroundColor: colors.bg,
    },
    retryTitle: {
      fontSize: FontSizes.lg,
      fontFamily: "Inter_500Medium",
      color: colors.textPrimary,
      textAlign: "center",
      marginBottom: 12,
    },
    retryBody: {
      fontSize: FontSizes.sm,
      fontFamily: "Inter_400Regular",
      color: colors.textSecondary,
      textAlign: "center",
      lineHeight: 21,
      marginBottom: 20,
      maxWidth: 320,
    },
    retryBtn: {
      backgroundColor: colors.primary,
      borderRadius: Radii.card,
      paddingHorizontal: 24,
      paddingVertical: 12,
    },
    retryBtnText: {
      fontSize: FontSizes.md,
      fontFamily: "Inter_500Medium",
      color: "#fff",
    },
  });
}
