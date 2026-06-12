import React, { useMemo } from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { PlatformPressable } from "@react-navigation/elements";
import { Platform, StyleSheet, View } from "react-native";
import { useTranslation } from "react-i18next";
import {
  CheckSquare, PenLine, Map, User,
} from "lucide-react-native";

import {
  RootStackParamList, AuthStackParamList, MainTabParamList,
} from "../types";
import { FontSizes, Colors, type AppColors } from "../constants/theme";
import DataLoadBanner from "../components/DataLoadBanner";
import SafeBottomTabBar from "./SafeBottomTabBar";
import { TAB_BAR_CONTENT_HEIGHT } from "../utils/tabBarInsets";

// Auth screens
import WelcomeScreen from "../screens/WelcomeScreen";
import OnboardingStep1Screen from "../screens/OnboardingStep1Screen";
import OnboardingStep2Screen from "../screens/OnboardingStep2Screen";
import OnboardingStep3Screen from "../screens/OnboardingStep3Screen";

// Main screens
import HomeScreen from "../screens/HomeScreen";
import MindDumpScreen from "../screens/MindDumpScreen";
import JourneyScreen from "../screens/JourneyScreen";
import ProfileScreen from "../screens/ProfileScreen";

const RootStack = createNativeStackNavigator<RootStackParamList>();
const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

function AuthNavigator() {
  return (
    <AuthStack.Navigator
      screenOptions={{ headerShown: false, animation: "slide_from_right" }}
    >
      <AuthStack.Screen name="Welcome" component={WelcomeScreen} />
      <AuthStack.Screen name="OnboardingStep1" component={OnboardingStep1Screen} />
      <AuthStack.Screen name="OnboardingStep2" component={OnboardingStep2Screen} />
      <AuthStack.Screen name="OnboardingStep3" component={OnboardingStep3Screen} />
    </AuthStack.Navigator>
  );
}

function createMainTabStyles(colors: AppColors) {
  return StyleSheet.create({
    shell: {
      flex: 1,
      backgroundColor: colors.bg,
    },
    tabBar: {
      backgroundColor: Colors.surface,
    },
    tabBarItem: {
      flex: 1,
      justifyContent: "center",
    },
    tabLabel: {
      fontSize: FontSizes.xs,
      fontFamily: "Inter_500Medium",
      marginTop: 2,
    },
  });
}

function MainTabNavigator() {
  const { t } = useTranslation();
  const styles = useMemo(() => createMainTabStyles(Colors), []);

  return (
    <View style={styles.shell}>
      <DataLoadBanner />
      <Tab.Navigator
        detachInactiveScreens
        tabBar={(props) => <SafeBottomTabBar {...props} />}
        safeAreaInsets={{ top: 0, right: 0, bottom: 0, left: 0 }}
        screenOptions={{
          headerShown: false,
          tabBarHideOnKeyboard: Platform.OS === "android",
          tabBarLabelPosition: "below-icon",
          tabBarStyle: [
            styles.tabBar,
            {
              height: TAB_BAR_CONTENT_HEIGHT,
              paddingBottom: 0,
              paddingTop: Platform.OS === "android" ? 6 : 8,
            },
          ],
          tabBarItemStyle: [
            styles.tabBarItem,
            Platform.OS === "android" ? { paddingVertical: 2 } : null,
          ],
          tabBarButton: (props) => (
            <PlatformPressable
              {...props}
              hitSlop={{ top: 12, bottom: 12, left: 6, right: 6 }}
            />
          ),
          tabBarActiveTintColor: Colors.primary,
          tabBarInactiveTintColor: Colors.textTertiary,
          tabBarLabelStyle: styles.tabLabel,
        }}
      >
        <Tab.Screen
          name="Home"
          component={HomeScreen}
          options={{
            title: t("tabs.today"),
            tabBarIcon: ({ color, focused }) => (
              <CheckSquare size={22} color={color} strokeWidth={focused ? 2 : 1.5} />
            ),
          }}
        />
        <Tab.Screen
          name="MindDump"
          component={MindDumpScreen}
          options={{
            title: t("tabs.mind"),
            tabBarIcon: ({ color, focused }) => (
              <PenLine size={22} color={color} strokeWidth={focused ? 2 : 1.5} />
            ),
          }}
        />
        <Tab.Screen
          name="Journey"
          component={JourneyScreen}
          options={{
            title: t("tabs.journey"),
            tabBarIcon: ({ color, focused }) => (
              <Map size={22} color={color} strokeWidth={focused ? 2 : 1.5} />
            ),
          }}
        />
        <Tab.Screen
          name="Profile"
          component={ProfileScreen}
          options={{
            title: t("tabs.profile"),
            tabBarIcon: ({ color, focused }) => (
              <User size={22} color={color} strokeWidth={focused ? 2 : 1.5} />
            ),
          }}
        />
      </Tab.Navigator>
    </View>
  );
}

export default function AppNavigator({
  initialRoute,
}: {
  initialRoute: "Auth" | "Main";
}) {
  return (
    <RootStack.Navigator
      initialRouteName={initialRoute}
      screenOptions={{ headerShown: false }}
    >
      <RootStack.Screen name="Auth" component={AuthNavigator} />
      <RootStack.Screen
        name="Main"
        component={MainTabNavigator}
        options={{ animation: "fade" }}
      />
    </RootStack.Navigator>
  );
}
