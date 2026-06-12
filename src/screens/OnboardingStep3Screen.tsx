import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  Keyboard,
} from "react-native";
import KeyboardAwareFormShell from "../components/KeyboardAwareFormShell";
import { Check, ChevronLeft, Lock, Zap, BarChart2, Shield } from "lucide-react-native";
import * as Haptics from "expo-haptics";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { AuthStackParamList } from "../types";
import { useUserStore } from "../store/userStore";
import { useHabitStore } from "../store/habitStore";
import { Colors, Spacing, Radii, FontSizes, Shadows, TIME_RANGES } from "../constants/theme";
import { useTranslation } from "react-i18next";
import { ANCHOR_EMOJI_BY_ID, resolveAnchorId } from "../constants/anchors";
import { getIdentitySlugForTag, getIdentityTemplate } from "../constants/identityTemplates";
import { localizeTimeRangeShort, localizeWhyPlaceholder } from "../i18n/localizeContent";
import { resetToMainAfterOnboarding } from "../navigation/navigationRef";
import { trackEvent } from "../utils/analytics";

type Props = NativeStackScreenProps<AuthStackParamList, "OnboardingStep3">;

const MIN_CHARS = 10;

const SYSTEM_PROMISE_ICONS = [
  { Icon: Zap, color: Colors.gold },
  { Icon: BarChart2, color: Colors.purple },
  { Icon: Shield, color: Colors.primary },
] as const;

const TIME_EMOJIS: Record<string, string> = {
  sabah: "🌅",
  ogle: "☀️",
  "ogleden-sonra": "🌤️",
  aksam: "🌇",
  gece: "🌙",
};

function StepBar({ current }: { current: number }) {
  const { t } = useTranslation();
  const stepLabels = [
    t("onboarding.steps.identity"),
    t("onboarding.steps.anchor"),
    t("onboarding.steps.why"),
  ];
  return (
    <View style={styles.stepWrap}>
      {stepLabels.map((label, i) => {
        const done = i < current - 1;
        const active = i === current - 1;
        return (
          <React.Fragment key={label}>
            {i > 0 && (
              <View
                style={[styles.stepConnector, (done || active) && styles.stepConnectorActive]}
              />
            )}
            <View style={styles.stepItem}>
              <View
                style={[
                  styles.stepCircle,
                  done && styles.stepCircleDone,
                  active && styles.stepCircleActive,
                ]}
              >
                {done ? (
                  <Check size={10} color="#fff" strokeWidth={3} />
                ) : (
                  <Text style={[styles.stepNum, active && styles.stepNumActive]}>{i + 1}</Text>
                )}
              </View>
              <Text style={[styles.stepLabel, active && styles.stepLabelActive]}>{label}</Text>
            </View>
          </React.Fragment>
        );
      })}
    </View>
  );
}

export default function OnboardingStep3Screen({ route, navigation }: Props) {
  const { t } = useTranslation();
  const { habitName, anchorBehavior, anchorTime, identityTagId } = route.params;
  const template = getIdentityTemplate(identityTagId);
  const timeMeta = TIME_RANGES.find((r) => r.id === anchorTime);
  const timeSlotLabel = timeMeta?.label ?? anchorTime;
  const timeSlotShort = timeMeta
    ? localizeTimeRangeShort(anchorTime, timeMeta.label.split("(")[0].trim())
    : anchorTime;
  const anchorEmoji =
    (resolveAnchorId(anchorBehavior) &&
      ANCHOR_EMOJI_BY_ID[resolveAnchorId(anchorBehavior)!]) ||
    "🔗";
  const whyPlaceholder = template
    ? localizeWhyPlaceholder(template.id, template.whyPlaceholder)
    : t("onboarding.step3.placeholder");

  const [whyText, setWhyText] = useState("");
  const [saving, setSaving] = useState(false);

  const completeOnboarding = useUserStore((s) => s.completeOnboarding);

  const wordCount = whyText.trim().split(/\s+/).filter(Boolean).length;
  const canStart = whyText.trim().length >= MIN_CHARS;
  const remaining = Math.max(0, MIN_CHARS - whyText.trim().length);

  const handleStart = async () => {
    if (!canStart || saving) return;
    Keyboard.dismiss();
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setSaving(true);
    const savingGuard = setTimeout(() => setSaving(false), 20_000);
    try {
      await completeOnboarding({
        habitName,
        habitAnchor: anchorBehavior,
        habitWhy: whyText.trim(),
        identityTagId,
      });

      // Profil bellekte — hemen ana ekrana geç; alışkanlık kaydı arka planda.
      resetToMainAfterOnboarding();

      void useHabitStore.getState().saveHabitFromOnboarding({
        identity: template?.title ?? habitName,
        identityIcon: template?.emoji ?? "✏️",
        identitySlug: getIdentitySlugForTag(identityTagId),
        cue: anchorBehavior,
        timeSlot: timeSlotLabel,
        why: whyText.trim(),
      });

      void trackEvent("onboarding_completed", {
        identityTagId: identityTagId ?? "custom",
      });
    } catch {
      Alert.alert(
        t("onboarding.step3.saveErrorTitle"),
        t("onboarding.step3.saveErrorBody")
      );
    } finally {
      clearTimeout(savingGuard);
      setSaving(false);
    }
  };

  return (
    <KeyboardAwareFormShell
      scrollContentStyle={styles.scroll}
      footer={
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => {
              void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              navigation.goBack();
            }}
            activeOpacity={0.75}
          >
            <ChevronLeft size={18} color={Colors.textSecondary} strokeWidth={2} />
            <Text style={styles.backText}>{t("common.back")}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.cta, !canStart && styles.ctaDisabled]}
            onPress={handleStart}
            disabled={!canStart || saving}
            activeOpacity={0.85}
          >
            <Text style={styles.ctaText}>
              {saving ? t("common.loading") : t("onboarding.step3.startCta")}
            </Text>
          </TouchableOpacity>
        </View>
      }
    >
          <StepBar current={3} />

          <Text style={styles.title}>{t("onboarding.step3.title")}</Text>
          <Text style={styles.sub}>{t("onboarding.step3.sub")}</Text>

          {/* Choices summary */}
          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>{t("onboarding.step3.summaryLabel")}</Text>
            <View style={styles.summaryChips}>
              <View style={styles.chip}>
                <Text style={styles.chipEmoji}>{template?.emoji ?? "✏️"}</Text>
                <Text style={styles.chipText}>{habitName}</Text>
              </View>
              <View style={styles.chip}>
                <Text style={styles.chipEmoji}>{anchorEmoji}</Text>
                <Text style={styles.chipText} numberOfLines={1}>{anchorBehavior}</Text>
              </View>
              <View style={styles.chip}>
                <Text style={styles.chipEmoji}>{TIME_EMOJIS[anchorTime] ?? "⏰"}</Text>
                <Text style={styles.chipText}>{timeSlotShort}</Text>
              </View>
            </View>
          </View>

          {/* Why textarea */}
          <View style={styles.textareaWrap}>
            <TextInput
              style={styles.whyInput}
              value={whyText}
              onChangeText={setWhyText}
              placeholder={whyPlaceholder}
              placeholderTextColor={Colors.textTertiary}
              multiline
              textAlignVertical="top"
            />
            <View style={styles.textareaFooter}>
              {!canStart && whyText.length > 0 ? (
                <Text style={styles.hintText}>
                  {t("onboarding.step3.charsMore", { count: remaining })}
                </Text>
              ) : canStart ? (
                <View style={styles.readyBadge}>
                  <Check size={10} color={Colors.primary} strokeWidth={3} />
                  <Text style={styles.readyText}>{t("onboarding.step3.readyHint")}</Text>
                </View>
              ) : (
                <Text style={styles.hintEmpty}>{t("onboarding.step3.writeFree")}</Text>
              )}
              <Text style={styles.wordCount}>
                {t("onboarding.step3.wordCount", { count: wordCount })}
              </Text>
            </View>
          </View>

          {/* Privacy note */}
          <View style={styles.privacyNote}>
            <Lock size={12} color={Colors.primaryDark} strokeWidth={2} />
            <Text style={styles.privacyText}>{t("onboarding.step3.privacyNote")}</Text>
          </View>

          <View style={styles.tabsCard}>
            <Text style={styles.tabsTitle}>{t("onboarding.step3.tabsTitle")}</Text>
            <Text style={styles.tabsBody}>{t("onboarding.step3.tabsBody")}</Text>
          </View>

          {/* System promises */}
          <View style={styles.systemCard}>
            <Text style={styles.systemTitle}>{t("onboarding.step3.systemTitle")}</Text>
            {SYSTEM_PROMISE_ICONS.map(({ Icon, color }, i) => (
              <View key={i} style={styles.systemRow}>
                <View style={[styles.systemIconWrap, { backgroundColor: `${color}18` }]}>
                  <Icon size={15} color={color} strokeWidth={2} />
                </View>
                <Text style={styles.systemRowText}>{t(`onboarding.step3.promises.${i}`)}</Text>
              </View>
            ))}
          </View>
    </KeyboardAwareFormShell>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
  },

  /* Step bar */
  stepWrap: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.xl,
  },
  stepItem: { alignItems: "center", gap: 4 },
  stepConnector: {
    flex: 1,
    height: 2,
    backgroundColor: Colors.border,
    marginBottom: 14,
  },
  stepConnectorActive: { backgroundColor: Colors.primary },
  stepCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.surface,
    borderWidth: 2,
    borderColor: Colors.border,
  },
  stepCircleActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryLight,
  },
  stepCircleDone: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary,
  },
  stepNum: {
    fontSize: 11,
    fontFamily: "Inter_500Medium",
    color: Colors.textTertiary,
  },
  stepNumActive: { color: Colors.primary },
  stepLabel: {
    fontSize: 10,
    fontFamily: "Inter_400Regular",
    color: Colors.textTertiary,
    letterSpacing: 0.3,
  },
  stepLabelActive: {
    color: Colors.primary,
    fontFamily: "Inter_500Medium",
  },

  /* Header */
  title: {
    fontSize: FontSizes.xxl,
    fontFamily: "Inter_500Medium",
    color: Colors.textPrimary,
    lineHeight: 34,
    letterSpacing: -0.3,
    marginBottom: Spacing.sm,
  },
  sub: {
    fontSize: FontSizes.md,
    fontFamily: "Inter_400Regular",
    color: Colors.textSecondary,
    lineHeight: 22,
    marginBottom: Spacing.lg,
  },

  /* Summary card */
  summaryCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radii.card,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
    gap: Spacing.sm,
    ...Shadows.soft,
  },
  summaryTitle: {
    fontSize: FontSizes.xs,
    fontFamily: "Inter_500Medium",
    color: Colors.textTertiary,
    textTransform: "uppercase",
    letterSpacing: 0.7,
  },
  summaryChips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.xs,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: Colors.primaryLight,
    borderRadius: Radii.pill,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 5,
    maxWidth: "100%",
  },
  chipEmoji: { fontSize: 13 },
  chipText: {
    fontSize: FontSizes.sm,
    fontFamily: "Inter_400Regular",
    color: Colors.primaryDark,
    flexShrink: 1,
  },

  /* Textarea */
  textareaWrap: {
    backgroundColor: Colors.surface,
    borderRadius: Radii.card,
    borderWidth: 1.5,
    borderColor: Colors.border,
    marginBottom: Spacing.sm,
    overflow: "hidden",
    ...Shadows.soft,
  },
  whyInput: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
    fontSize: FontSizes.lg,
    fontFamily: "Inter_400Regular",
    color: Colors.textPrimary,
    minHeight: 140,
    lineHeight: 26,
  },
  textareaFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.surfaceMuted,
  },
  hintText: {
    fontSize: FontSizes.xs,
    fontFamily: "Inter_400Regular",
    color: Colors.coral,
  },
  hintEmpty: {
    fontSize: FontSizes.xs,
    fontFamily: "Inter_400Regular",
    color: Colors.textTertiary,
    fontStyle: "italic",
  },
  readyBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  readyText: {
    fontSize: FontSizes.xs,
    fontFamily: "Inter_500Medium",
    color: Colors.primary,
  },
  wordCount: {
    fontSize: FontSizes.xs,
    fontFamily: "Inter_400Regular",
    color: Colors.textTertiary,
  },

  /* Privacy note */
  privacyNote: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: Colors.primaryLight,
    borderRadius: Radii.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  privacyText: {
    fontSize: FontSizes.sm,
    fontFamily: "Inter_400Regular",
    color: Colors.primaryDark,
    fontStyle: "italic",
    flex: 1,
  },

  /* System promises */
  tabsCard: {
    backgroundColor: Colors.surfaceMuted,
    borderRadius: Radii.card,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.border,
  },
  tabsTitle: {
    fontSize: FontSizes.sm,
    fontFamily: "Inter_600SemiBold",
    fontWeight: "600",
    color: Colors.textPrimary,
    marginBottom: 6,
  },
  tabsBody: {
    fontSize: FontSizes.sm,
    fontFamily: "Inter_400Regular",
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  systemCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radii.card,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.lg,
    gap: Spacing.md,
    ...Shadows.soft,
  },
  systemTitle: {
    fontSize: FontSizes.md,
    fontFamily: "Inter_500Medium",
    color: Colors.textPrimary,
  },
  systemRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: Spacing.sm,
  },
  systemIconWrap: {
    width: 30,
    height: 30,
    borderRadius: Radii.sm,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  systemRowText: {
    flex: 1,
    fontSize: FontSizes.sm,
    fontFamily: "Inter_400Regular",
    color: Colors.textSecondary,
    lineHeight: 20,
    paddingTop: 5,
  },

  /* Footer */
  footer: {
    flexDirection: "row",
    gap: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
  },
  backBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    paddingHorizontal: Spacing.md,
    borderRadius: Radii.button,
    borderWidth: 1.5,
    borderColor: Colors.border,
    gap: 2,
  },
  backText: {
    fontSize: FontSizes.md,
    fontFamily: "Inter_400Regular",
    color: Colors.textSecondary,
  },
  cta: {
    flex: 1,
    backgroundColor: Colors.primary,
    borderRadius: Radii.button,
    paddingVertical: 15,
    alignItems: "center",
    ...Shadows.card,
  },
  ctaDisabled: { opacity: 0.42 },
  ctaText: {
    fontSize: FontSizes.md,
    fontFamily: "Inter_500Medium",
    color: "#fff",
  },
});
