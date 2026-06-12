import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "../constants/theme";
import {
  getKeyboardAvoidingBehavior,
  useKeyboardScrollPadding,
} from "../utils/keyboardInsets";

type Props = {
  children: React.ReactNode;
  footer: React.ReactNode;
  scrollStyle?: StyleProp<ViewStyle>;
  scrollContentStyle?: StyleProp<ViewStyle>;
  backgroundColor?: string;
};

/**
 * Scroll + sabit footer (onboarding vb.).
 * Klavye açıkken ScrollView alt padding'i dinamik artar.
 */
export default function KeyboardAwareFormShell({
  children,
  footer,
  scrollStyle,
  scrollContentStyle,
  backgroundColor = Colors.bg,
}: Props) {
  const [footerHeight, setFooterHeight] = useState(0);
  const { paddingBottom, bottomInset } = useKeyboardScrollPadding(footerHeight);

  return (
    <SafeAreaView style={[styles.root, { backgroundColor }]} edges={["top"]}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? getKeyboardAvoidingBehavior() : undefined}
      >
        <ScrollView
          style={scrollStyle}
          contentContainerStyle={[
            scrollContentStyle,
            styles.scrollGrow,
            { paddingBottom },
          ]}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          showsVerticalScrollIndicator={false}
        >
          {children}
        </ScrollView>
        <View
          onLayout={(e) => setFooterHeight(e.nativeEvent.layout.height)}
          style={[styles.footerWrap, { paddingBottom: Math.max(bottomInset, 12) }]}
        >
          {footer}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  flex: { flex: 1 },
  scrollGrow: { flexGrow: 1 },
  footerWrap: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Colors.border,
    backgroundColor: Colors.surface,
  },
});
