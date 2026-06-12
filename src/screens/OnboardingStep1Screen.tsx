import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
} from "react-native";
import KeyboardAwareFormShell from "../components/KeyboardAwareFormShell";
import { Check } from "lucide-react-native";
import * as Haptics from "expo-haptics";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { AuthStackParamList } from "../types";
import { Colors, Spacing, Radii, FontSizes, Shadows } from "../constants/theme";
import { IDENTITY_TEMPLATES, type IdentityTagId } from "../constants/identityTemplates";
import { useTranslation } from "react-i18next";
import { getLocalizedTemplate } from "../i18n/localizeContent";
import { trackEvent } from "../utils/analytics";

type Props = NativeStackScreenProps<AuthStackParamList, "OnboardingStep1">;

const CUSTOM_ID = "__custom__";

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
              <View style={[styles.stepCircle, done && styles.stepCircleDone, active && styles.stepCircleActive]}>
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

export default function OnboardingStep1Screen({ navigation }: Props) {
  const { t } = useTranslation();
  const [selected, setSelected] = useState<string | null>(null);
  const [customText, setCustomText] = useState("");

  const isCustom = selected === CUSTOM_ID;
  const chosenTemplate = IDENTITY_TEMPLATES.find((t) => t.id === selected);

  const habitName = isCustom
    ? customText.trim()
    : (getLocalizedTemplate(chosenTemplate?.id)?.title ?? chosenTemplate?.title ?? "");
  const identityTagId: IdentityTagId | null =
    (chosenTemplate?.id as IdentityTagId | undefined) ?? null;
  const canContinue = habitName.length >= 2;

  const handleSelect = (id: string) => {
    void Haptics.selectionAsync();
    setSelected(id);
  };

  const handleContinue = () => {
    if (!canContinue) return;
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    trackEvent("onboarding_template_selected", {
      identityTagId: identityTagId ?? "custom",
    });
    navigation.navigate("OnboardingStep2", { habitName, identityTagId });
  };

  return (
    <KeyboardAwareFormShell
      scrollContentStyle={styles.scroll}
      footer={
        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.cta, !canContinue && styles.ctaDisabled]}
            onPress={handleContinue}
            disabled={!canContinue}
            activeOpacity={0.85}
          >
            <Text style={styles.ctaText}>{t("common.continue")}</Text>
          </TouchableOpacity>
          {!canContinue && (
            <Text style={styles.footerHint}>{t("onboarding.step1.footerHint")}</Text>
          )}
        </View>
      }
    >
        <StepBar current={1} />

        <Text style={styles.title}>{t("onboarding.step1.title")}</Text>
        <Text style={styles.sub}>{t("onboarding.step1.sub")}</Text>

        {/* Info panel */}
        <View style={styles.infoPanel}>
          <Text style={styles.infoPanelTitle}>{t("onboarding.step1.infoTitle")}</Text>
          <Text style={styles.infoPanelBody}>{t("onboarding.step1.infoBody")}</Text>
        </View>

        {/* Identity cards */}
        <View style={styles.list}>
          {IDENTITY_TEMPLATES.map((tpl) => {
            const active = selected === tpl.id;
            const loc = getLocalizedTemplate(tpl.id) ?? tpl;
            return (
              <TouchableOpacity
                key={tpl.id}
                style={[styles.card, active && styles.cardActive]}
                onPress={() => handleSelect(tpl.id)}
                activeOpacity={0.85}
              >
                <View style={styles.cardHeader}>
                  <View style={[styles.emojiWrap, active && styles.emojiWrapActive]}>
                    <Text style={styles.emoji}>{tpl.emoji}</Text>
                  </View>
                  <View style={styles.cardTextWrap}>
                    <Text style={[styles.cardTitle, active && styles.cardTitleActive]}>
                      {loc.title}
                    </Text>
                    <Text style={styles.cardBlurb} numberOfLines={2}>{loc.blurb}</Text>
                  </View>
                  <View style={[styles.radioOuter, active && styles.radioOuterActive]}>
                    {active && <View style={styles.radioDot} />}
                  </View>
                </View>

                {active && (
                  <View style={styles.previewBox}>
                    <View style={styles.previewRow}>
                      <Text style={styles.previewLabel}>{t("onboarding.step1.previewIdentity")}</Text>
                      <Text style={styles.previewLine}>"{loc.identityStatement}"</Text>
                    </View>
                    <View style={[styles.previewRow, styles.previewRowBorder]}>
                      <Text style={styles.previewLabel}>{t("onboarding.step1.previewMicro")}</Text>
                      <Text style={styles.previewLine}>{loc.microActionInitial}</Text>
                    </View>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}

          {/* Custom option */}
          <TouchableOpacity
            style={[styles.card, isCustom && styles.cardActive]}
            onPress={() => handleSelect(CUSTOM_ID)}
            activeOpacity={0.85}
          >
            <View style={styles.cardHeader}>
              <View style={[styles.emojiWrap, isCustom && styles.emojiWrapActive]}>
                <Text style={styles.emoji}>✏️</Text>
              </View>
              <View style={styles.cardTextWrap}>
                <Text style={[styles.cardTitle, isCustom && styles.cardTitleActive]}>
                  {t("onboarding.step1.customLabel")}
                </Text>
                <Text style={styles.cardBlurb}>{t("onboarding.step1.customBlurb")}</Text>
              </View>
              <View style={[styles.radioOuter, isCustom && styles.radioOuterActive]}>
                {isCustom && <View style={styles.radioDot} />}
              </View>
            </View>

            {isCustom && (
              <View style={styles.customWrap}>
                <TextInput
                  style={styles.customInput}
                  value={customText}
                  onChangeText={setCustomText}
                  placeholder={t("onboarding.step1.customPlaceholder")}
                  placeholderTextColor={Colors.textTertiary}
                  autoFocus
                  maxLength={60}
                  returnKeyType="done"
                />
                <Text style={styles.charCount}>{customText.length}/60</Text>
              </View>
            )}
          </TouchableOpacity>
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
  stepItem: {
    alignItems: "center",
    gap: 4,
  },
  stepConnector: {
    flex: 1,
    height: 2,
    backgroundColor: Colors.border,
    marginBottom: 14,
  },
  stepConnectorActive: {
    backgroundColor: Colors.primary,
  },
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
    marginBottom: Spacing.md,
  },

  /* Info panel */
  infoPanel: {
    backgroundColor: Colors.primaryLight,
    borderRadius: Radii.card,
    borderLeftWidth: 3,
    borderLeftColor: Colors.primary,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
  },
  infoPanelTitle: {
    fontSize: FontSizes.sm,
    fontFamily: "Inter_500Medium",
    color: Colors.primaryDark,
    marginBottom: 4,
  },
  infoPanelBody: {
    fontSize: FontSizes.sm,
    fontFamily: "Inter_400Regular",
    color: Colors.textSecondary,
    lineHeight: 19,
  },

  /* Cards */
  list: { gap: Spacing.sm },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radii.card,
    borderWidth: 1.5,
    borderColor: Colors.border,
    padding: Spacing.md,
    ...Shadows.soft,
  },
  cardActive: {
    borderColor: Colors.primary,
    backgroundColor: "#F6FDFB",
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  emojiWrap: {
    width: 42,
    height: 42,
    borderRadius: Radii.sm,
    backgroundColor: Colors.bg,
    alignItems: "center",
    justifyContent: "center",
  },
  emojiWrapActive: {
    backgroundColor: Colors.primaryLight,
  },
  emoji: { fontSize: 22 },
  cardTextWrap: { flex: 1 },
  cardTitle: {
    fontSize: FontSizes.md,
    fontFamily: "Inter_500Medium",
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  cardTitleActive: { color: Colors.primaryDark },
  cardBlurb: {
    fontSize: FontSizes.sm,
    fontFamily: "Inter_400Regular",
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: Colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  radioOuterActive: { borderColor: Colors.primary },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.primary,
  },

  /* Preview box */
  previewBox: {
    marginTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: "rgba(47, 156, 134, 0.15)",
    paddingTop: Spacing.md,
    gap: Spacing.sm,
  },
  previewRow: { gap: 3 },
  previewRowBorder: {
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: "rgba(47, 156, 134, 0.10)",
  },
  previewLabel: {
    fontSize: FontSizes.xs,
    fontFamily: "Inter_500Medium",
    color: Colors.primaryDark,
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  previewLine: {
    fontSize: FontSizes.sm,
    fontFamily: "Inter_400Regular",
    color: Colors.textPrimary,
    lineHeight: 19,
  },

  /* Custom input */
  customWrap: {
    marginTop: Spacing.md,
    gap: Spacing.xs,
  },
  customInput: {
    backgroundColor: Colors.surface,
    borderRadius: Radii.button,
    borderWidth: 1.5,
    borderColor: Colors.primary,
    paddingHorizontal: Spacing.md,
    paddingVertical: 12,
    fontSize: FontSizes.md,
    fontFamily: "Inter_400Regular",
    color: Colors.textPrimary,
  },
  charCount: {
    fontSize: FontSizes.xs,
    fontFamily: "Inter_400Regular",
    color: Colors.textTertiary,
    alignSelf: "flex-end",
  },

  /* Footer */
  footer: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    gap: Spacing.sm,
    alignItems: "center",
  },
  cta: {
    width: "100%",
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
  footerHint: {
    fontSize: FontSizes.xs,
    fontFamily: "Inter_400Regular",
    color: Colors.textTertiary,
  },
});
