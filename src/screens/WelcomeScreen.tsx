import React, { useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  Easing,
} from "react-native-reanimated";
import { ArrowRight } from "lucide-react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { AuthStackParamList } from "../types";
import {
  Colors, Spacing, Radii, FontSizes,
  Shadows,
} from "../constants/theme";
import {
  APP_PROMISE_WELCOME_HEADLINE,
  APP_PROMISE_WELCOME_SUB,
  APP_PROMISE_TAGS,
} from "../constants/purposeCopy";

type Props = NativeStackScreenProps<AuthStackParamList, "Welcome">;

export default function WelcomeScreen({ navigation }: Props) {
  const titleY = useSharedValue(-24);
  const titleOp = useSharedValue(0);
  const subY = useSharedValue(-16);
  const subOp = useSharedValue(0);
  const tagY = useSharedValue(-12);
  const tagOp = useSharedValue(0);
  const btnOp = useSharedValue(0);

  const easing = Easing.out(Easing.quad);

  useEffect(() => {
    titleOp.value = withTiming(1, { duration: 500, easing });
    titleY.value = withTiming(0, { duration: 500, easing });
    subOp.value = withDelay(200, withTiming(1, { duration: 500, easing }));
    subY.value = withDelay(200, withTiming(0, { duration: 500, easing }));
    tagOp.value = withDelay(400, withTiming(1, { duration: 400, easing }));
    tagY.value = withDelay(400, withTiming(0, { duration: 400, easing }));
    btnOp.value = withDelay(700, withTiming(1, { duration: 400, easing }));
  }, []);

  const titleStyle = useAnimatedStyle(() => ({
    opacity: titleOp.value,
    transform: [{ translateY: titleY.value }],
  }));
  const subStyle = useAnimatedStyle(() => ({
    opacity: subOp.value,
    transform: [{ translateY: subY.value }],
  }));
  const tagStyle = useAnimatedStyle(() => ({
    opacity: tagOp.value,
    transform: [{ translateY: tagY.value }],
  }));
  const btnStyle = useAnimatedStyle(() => ({ opacity: btnOp.value }));

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <View style={styles.content}>
        {/* Brand mark */}
        <Animated.View style={[styles.brandMark, tagStyle]}>
          <Text style={styles.brandText}>discipline</Text>
        </Animated.View>

        {/* Main headline */}
        <Animated.Text style={[styles.headline, titleStyle]}>
          {APP_PROMISE_WELCOME_HEADLINE}
        </Animated.Text>

        {/* Sub-headline */}
        <Animated.Text style={[styles.sub, subStyle]}>
          {APP_PROMISE_WELCOME_SUB.replace(/\n/g, " ")}
        </Animated.Text>

        {/* Vaat uyumlu rozetler */}
        <Animated.View style={[styles.tags, tagStyle]}>
          {[...APP_PROMISE_TAGS].map((t) => (
            <View key={t} style={styles.tag}>
              <Text style={styles.tagText}>{t}</Text>
            </View>
          ))}
        </Animated.View>
      </View>

      {/* CTA */}
      <Animated.View style={[styles.footer, btnStyle]}>
        <TouchableOpacity
          style={styles.cta}
          onPress={() => navigation.navigate("OnboardingStep1")}
          activeOpacity={0.8}
        >
          <Text style={styles.ctaText}>Başla</Text>
          <ArrowRight size={18} color="#fff" strokeWidth={2} />
        </TouchableOpacity>
        <Text style={styles.footerNote}>Kayıt gerekmez. Veriler cihazında.</Text>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  content: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xxl,
    gap: Spacing.lg,
  },
  brandMark: {
    alignSelf: "flex-start",
    backgroundColor: Colors.primaryLight,
    borderRadius: Radii.pill,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    ...Shadows.soft,
  },
  brandText: {
    fontSize: FontSizes.sm,
    fontFamily: "Inter_500Medium",
    color: Colors.primary,
    letterSpacing: 1,
    textTransform: "lowercase",
  },
  headline: {
    fontSize: FontSizes.hero,
    fontFamily: "Inter_500Medium",
    color: Colors.textPrimary,
    lineHeight: 48,
  },
  sub: {
    fontSize: FontSizes.xl,
    fontFamily: "Inter_400Regular",
    color: Colors.textSecondary,
    lineHeight: 30,
  },
  tags: {
    flexDirection: "row",
    gap: Spacing.sm,
    flexWrap: "wrap",
  },
  tag: {
    borderRadius: Radii.pill,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    backgroundColor: Colors.surface,
    ...Shadows.soft,
  },
  tagText: {
    fontSize: FontSizes.xs,
    fontFamily: "Inter_400Regular",
    color: Colors.textTertiary,
    letterSpacing: 0.5,
  },
  footer: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xl,
    gap: Spacing.md,
    alignItems: "center",
  },
  cta: {
    width: "100%",
    backgroundColor: Colors.primary,
    borderRadius: Radii.button,
    paddingVertical: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    ...Shadows.card,
  },
  ctaText: {
    fontSize: FontSizes.lg,
    fontFamily: "Inter_500Medium",
    color: "#fff",
  },
  footerNote: {
    fontSize: FontSizes.sm,
    fontFamily: "Inter_400Regular",
    color: Colors.textTertiary,
    textAlign: "center",
  },
});
