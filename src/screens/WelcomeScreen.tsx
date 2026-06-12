import React, { useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSpring,
  Easing,
} from "react-native-reanimated";
import { ArrowRight, ShieldCheck } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useTranslation } from "react-i18next";
import { AuthStackParamList } from "../types";
import { Colors, Spacing, Radii, FontSizes, Shadows } from "../constants/theme";

type Props = NativeStackScreenProps<AuthStackParamList, "Welcome">;

const FEATURE_ICONS = ["⚡", "🎯", "🛡️"] as const;

export default function WelcomeScreen({ navigation }: Props) {
  const { t } = useTranslation();

  const features = ([0, 1, 2] as const).map((i) => ({
    icon: FEATURE_ICONS[i],
    title: t(`welcome.features.${i}.title`),
    sub: t(`welcome.features.${i}.sub`),
  }));

  const trustStats = [
    { value: "66", label: t("common.days") },
    { value: t("welcome.stats.noRegValue"), label: t("welcome.stats.noReg") },
    { value: t("welcome.stats.local"), label: t("welcome.stats.localLabel") },
  ];

  const logoOp = useSharedValue(0);
  const logoScale = useSharedValue(0.85);
  const titleOp = useSharedValue(0);
  const titleY = useSharedValue(18);
  const featuresOp = useSharedValue(0);
  const statsOp = useSharedValue(0);
  const btnOp = useSharedValue(0);
  const btnScale = useSharedValue(0.94);

  const ease = Easing.out(Easing.cubic);

  useEffect(() => {
    logoOp.value = withTiming(1, { duration: 600, easing: ease });
    logoScale.value = withSpring(1, { damping: 13, stiffness: 90 });

    titleOp.value = withDelay(180, withTiming(1, { duration: 500, easing: ease }));
    titleY.value = withDelay(180, withTiming(0, { duration: 500, easing: ease }));

    featuresOp.value = withDelay(400, withTiming(1, { duration: 500, easing: ease }));
    statsOp.value = withDelay(620, withTiming(1, { duration: 460, easing: ease }));

    btnOp.value = withDelay(880, withTiming(1, { duration: 380, easing: ease }));
    btnScale.value = withDelay(880, withSpring(1, { damping: 12, stiffness: 100 }));
  }, []);

  const logoStyle = useAnimatedStyle(() => ({
    opacity: logoOp.value,
    transform: [{ scale: logoScale.value }],
  }));
  const titleStyle = useAnimatedStyle(() => ({
    opacity: titleOp.value,
    transform: [{ translateY: titleY.value }],
  }));
  const featuresStyle = useAnimatedStyle(() => ({ opacity: featuresOp.value }));
  const statsStyle = useAnimatedStyle(() => ({ opacity: statsOp.value }));
  const btnStyle = useAnimatedStyle(() => ({
    opacity: btnOp.value,
    transform: [{ scale: btnScale.value }],
  }));

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <View style={styles.content}>

        {/* Brand mark */}
        <Animated.View style={[styles.logoWrap, logoStyle]}>
          <View style={styles.logoImageWrap}>
            <Image source={require("../../assets/icon.png")} style={styles.logoImage} />
          </View>
          <View style={styles.brandCol}>
            <Text style={styles.brandStoreName}>{t("brand.storeName")}</Text>
            <Text style={styles.brandTagline}>{t("brand.tagline")}</Text>
          </View>
        </Animated.View>

        {/* Headline */}
        <Animated.View style={titleStyle}>
          <Text style={styles.headline}>{t("welcome.headline")}</Text>
          <Text style={styles.headlineSub}>{t("welcome.headlineSub")}</Text>
        </Animated.View>

        {/* Features */}
        <Animated.View style={[styles.featureList, featuresStyle]}>
          {features.map((f, i) => (
            <View key={i} style={styles.featureRow}>
              <View style={styles.featureIconWrap}>
                <Text style={styles.featureIcon}>{f.icon}</Text>
              </View>
              <View style={styles.featureTextWrap}>
                <Text style={styles.featureTitle}>{f.title}</Text>
                <Text style={styles.featureSub}>{f.sub}</Text>
              </View>
            </View>
          ))}
        </Animated.View>

        {/* Trust stats */}
        <Animated.View style={[styles.statsRow, statsStyle]}>
          {trustStats.map((s, i) => (
            <View
              key={i}
              style={[styles.statItem, i < trustStats.length - 1 && styles.statDivider]}
            >
              <Text style={styles.statValue}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </Animated.View>
      </View>

      {/* Footer CTA */}
      <Animated.View style={[styles.footer, btnStyle]}>
        <TouchableOpacity
          activeOpacity={0.88}
          onPress={() => {
            void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            navigation.navigate("OnboardingStep1");
          }}
        >
          <LinearGradient
            colors={[Colors.primary, Colors.primaryDark]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.cta}
          >
            <Text style={styles.ctaText}>{t("welcome.cta")}</Text>
            <ArrowRight size={20} color="#fff" strokeWidth={2.5} />
          </LinearGradient>
        </TouchableOpacity>

        <View style={styles.privacyNote}>
          <ShieldCheck size={13} color={Colors.textTertiary} strokeWidth={2} />
          <Text style={styles.privacyText}>{t("common.noRegistration")}</Text>
        </View>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },

  content: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xl,
    gap: Spacing.lg,
    justifyContent: "center",
  },

  /* Logo */
  logoWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  logoImageWrap: {
    width: 56,
    height: 56,
    borderRadius: Radii.button,
    ...Shadows.card,
  },
  logoImage: {
    width: 56,
    height: 56,
    borderRadius: Radii.button,
  },
  brandCol: {
    flex: 1,
    gap: 2,
  },
  brandStoreName: {
    fontSize: FontSizes.md,
    fontFamily: "Inter_500Medium",
    color: Colors.textPrimary,
    lineHeight: 22,
  },
  brandTagline: {
    fontSize: FontSizes.sm,
    fontFamily: "Inter_400Regular",
    color: Colors.textSecondary,
    lineHeight: 18,
  },

  /* Headline */
  headline: {
    fontSize: FontSizes.xxxl,
    fontFamily: "Inter_500Medium",
    color: Colors.textPrimary,
    lineHeight: 40,
    letterSpacing: -0.5,
    marginBottom: Spacing.sm,
  },
  headlineSub: {
    fontSize: FontSizes.lg,
    fontFamily: "Inter_400Regular",
    color: Colors.textSecondary,
    lineHeight: 26,
  },

  /* Features */
  featureList: {
    gap: Spacing.md,
  },
  featureRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: Spacing.md,
  },
  featureIconWrap: {
    width: 38,
    height: 38,
    borderRadius: Radii.sm,
    backgroundColor: Colors.surface,
    alignItems: "center",
    justifyContent: "center",
    ...Shadows.soft,
  },
  featureIcon: { fontSize: 18 },
  featureTextWrap: { flex: 1, paddingTop: 2 },
  featureTitle: {
    fontSize: FontSizes.md,
    fontFamily: "Inter_500Medium",
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  featureSub: {
    fontSize: FontSizes.sm,
    fontFamily: "Inter_400Regular",
    color: Colors.textSecondary,
    lineHeight: 18,
  },

  /* Stats */
  statsRow: {
    flexDirection: "row",
    backgroundColor: Colors.surface,
    borderRadius: Radii.card,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingVertical: Spacing.md,
    ...Shadows.soft,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
    gap: 2,
  },
  statDivider: {
    borderRightWidth: 1,
    borderRightColor: Colors.border,
  },
  statValue: {
    fontSize: FontSizes.lg,
    fontFamily: "Inter_500Medium",
    color: Colors.primary,
  },
  statLabel: {
    fontSize: FontSizes.xs,
    fontFamily: "Inter_400Regular",
    color: Colors.textTertiary,
  },

  /* Footer */
  footer: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xl,
    paddingTop: Spacing.md,
    gap: Spacing.md,
    alignItems: "center",
  },
  cta: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    borderRadius: Radii.button,
    paddingVertical: 17,
    paddingHorizontal: 48,
    ...Shadows.card,
  },
  ctaText: {
    fontSize: FontSizes.lg,
    fontFamily: "Inter_500Medium",
    color: "#fff",
    letterSpacing: 0.2,
  },
  privacyNote: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  privacyText: {
    fontSize: FontSizes.xs,
    fontFamily: "Inter_400Regular",
    color: Colors.textTertiary,
  },
});
