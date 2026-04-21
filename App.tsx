import React, { useEffect, useState } from "react";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import {
  useFonts,
  Inter_400Regular,
  Inter_500Medium,
} from "@expo-google-fonts/inter";
import * as SplashScreen from "expo-splash-screen";

import { useUserStore } from "./src/store/userStore";
import { useCheckinsStore } from "./src/store/checkinsStore";
import { useMindDumpStore } from "./src/store/mindDumpStore";
import { useSDTStore } from "./src/store/sdtStore";
import AppNavigator from "./src/navigation/AppNavigator";
import { setupNotifications } from "./src/utils/notifications";
import { Colors } from "./src/constants/theme";

SplashScreen.preventAutoHideAsync();

export default function App() {
  const [dataReady, setDataReady] = useState(false);

  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
  });

  const loadProfile = useUserStore((s) => s.loadProfile);
  const profile = useUserStore((s) => s.profile);
  const isUserLoading = useUserStore((s) => s.isLoading);
  const loadCheckins = useCheckinsStore((s) => s.load);
  const getTodayCheckin = useCheckinsStore((s) => s.getTodayCheckin);
  const loadMindDump = useMindDumpStore((s) => s.load);
  const loadSDT = useSDTStore((s) => s.load);

  // Load all data from AsyncStorage
  useEffect(() => {
    async function boot() {
      await loadProfile();
      await Promise.all([loadCheckins(), loadMindDump(), loadSDT()]);
      setDataReady(true);
    }
    boot();
  }, []);

  // Set up notifications once profile is available
  useEffect(() => {
    if (!profile) return;
    const todayDone = getTodayCheckin()?.completed ?? false;
    setupNotifications(profile, todayDone).catch(console.warn);
  }, [profile?.id]); // run once when profile first loads

  // Hide splash when ready
  useEffect(() => {
    if ((fontsLoaded || fontError) && dataReady && !isUserLoading) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError, dataReady, isUserLoading]);

  if ((!fontsLoaded && !fontError) || !dataReady || isUserLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={Colors.primary} size="large" />
      </View>
    );
  }

  const onboardingDone = profile?.startDate != null;

  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <NavigationContainer>
          <AppNavigator initialRoute={onboardingDone ? "Main" : "Auth"} />
        </NavigationContainer>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  loading: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.bg,
  },
});
