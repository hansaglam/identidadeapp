import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { PlatformPressable } from "@react-navigation/elements";
import { StyleSheet, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  CheckSquare, PenLine, Map, User,
} from "lucide-react-native";

import {
  RootStackParamList, AuthStackParamList, MainTabParamList,
} from "../types";
import { Colors, FontSizes } from "../constants/theme";

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

function MainTabNavigator() {
  const insets = useSafeAreaInsets();
  // Edge-to-edge Android: system gesture bar overlaps tab bar if we don't pad bottom
  const bottomInset = Math.max(insets.bottom, Platform.OS === "android" ? 12 : 8);

  return (
    <Tab.Navigator
      detachInactiveScreens={false}
      screenOptions={{
        headerShown: false,
        tabBarStyle: [
          styles.tabBar,
          {
            paddingBottom: bottomInset,
            paddingTop: 10,
            minHeight: 52 + bottomInset,
            // Keep tab bar above screen content for hit testing (Android)
            ...(Platform.OS === "android" ? { elevation: 12 } : {}),
          },
        ],
        tabBarItemStyle: styles.tabBarItem,
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
          title: "Bugün",
          tabBarIcon: ({ color, focused }) => (
            <CheckSquare size={22} color={color} strokeWidth={focused ? 2 : 1.5} />
          ),
        }}
      />
      <Tab.Screen
        name="MindDump"
        component={MindDumpScreen}
        options={{
          title: "Zihin",
          tabBarIcon: ({ color, focused }) => (
            <PenLine size={22} color={color} strokeWidth={focused ? 2 : 1.5} />
          ),
        }}
      />
      <Tab.Screen
        name="Journey"
        component={JourneyScreen}
        options={{
          title: "Yolculuk",
          tabBarIcon: ({ color, focused }) => (
            <Map size={22} color={color} strokeWidth={focused ? 2 : 1.5} />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          title: "Profil",
          tabBarIcon: ({ color, focused }) => (
            <User size={22} color={color} strokeWidth={focused ? 2 : 1.5} />
          ),
        }}
      />
    </Tab.Navigator>
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

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    shadowOpacity: 0,
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
