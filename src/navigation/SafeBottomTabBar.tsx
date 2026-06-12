import React from "react";
import { Platform, StyleSheet, View } from "react-native";
import { BottomTabBar, BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors } from "../constants/theme";
import { getTabBarBottomInset } from "../utils/tabBarInsets";

/**
 * Tab bar'ı sistem navigasyonunun üstüne taşır.
 * paddingBottom = safe area (Android 3-button dahil).
 */
export default function SafeBottomTabBar(props: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const bottomPad = getTabBarBottomInset(insets);

  return (
    <View
      style={[
        styles.shell,
        {
          paddingBottom: bottomPad,
          backgroundColor: Colors.surface,
        },
      ]}
    >
      <BottomTabBar {...props} />
    </View>
  );
}

const styles = StyleSheet.create({
  shell: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Colors.border,
    ...Platform.select({
      ios: {
        shadowColor: "#071018",
        shadowOffset: { width: 0, height: -6 },
        shadowOpacity: 0.07,
        shadowRadius: 12,
      },
      default: { elevation: 10 },
    }),
  },
});
