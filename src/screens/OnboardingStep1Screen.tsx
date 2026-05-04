import React, { useState } from "react";
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { AuthStackParamList } from "../types";
import { Colors, Spacing, Radii, FontSizes } from "../constants/theme";
import {
  IDENTITY_TEMPLATES,
  type IdentityTagId,
} from "../constants/identityTemplates";
import { trackEvent } from "../utils/analytics";
import {
  ONBOARDING_IDENTITY_LEAD,
  ONBOARDING_IDENTITY_PANEL_LINES,
  ONBOARDING_IDENTITY_PANEL_TITLE,
} from "../constants/purposeCopy";

type Props = NativeStackScreenProps<AuthStackParamList, "OnboardingStep1">;

const CUSTOM_ID = "__custom__";

export default function OnboardingStep1Screen({ navigation }: Props) {
  const [selected, setSelected] = useState<string | null>(null);
  const [customText, setCustomText] = useState("");

  const isCustom = selected === CUSTOM_ID;
  const chosenTemplate = IDENTITY_TEMPLATES.find((t) => t.id === selected);

  const habitName = isCustom
    ? customText.trim()
    : chosenTemplate?.title ?? "";
  const identityTagId: IdentityTagId | null =
    (chosenTemplate?.id as IdentityTagId | undefined) ?? null;
  const canContinue = habitName.length >= 2;

  const handleContinue = () => {
    if (!canContinue) return;
    trackEvent("onboarding_template_selected", {
      identityTagId: identityTagId ?? "custom",
    });
    navigation.navigate("OnboardingStep2", {
      habitName,
      identityTagId,
    });
  };

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.stepRow}>
          {[1, 2, 3].map((s) => (
            <View key={s} style={[styles.step, s === 1 && styles.stepActive]} />
          ))}
        </View>

        <Text style={styles.title}>66 gün sonunda kim olmak istiyorsun?</Text>
        <Text style={styles.sub}>{ONBOARDING_IDENTITY_LEAD}</Text>

        <View style={styles.infoPanel}>
          <Text style={styles.infoPanelTitle}>{ONBOARDING_IDENTITY_PANEL_TITLE}</Text>
          {ONBOARDING_IDENTITY_PANEL_LINES.map((line, i) => (
            <Text key={i} style={styles.infoPanelLine}>
              <Text style={styles.bullet}>{"\u2022 "}</Text>
              {line}
            </Text>
          ))}
        </View>

        {/* Identity Tag cards */}
        <View style={styles.list}>
          {IDENTITY_TEMPLATES.map((tpl) => {
            const active = selected === tpl.id;
            return (
              <TouchableOpacity
                key={tpl.id}
                style={[styles.card, active && styles.cardActive]}
                onPress={() => setSelected(tpl.id)}
                activeOpacity={0.85}
              >
                <View style={styles.cardHeader}>
                  <Text style={styles.emoji}>{tpl.emoji}</Text>
                  <View style={styles.cardTextWrap}>
                    <Text
                      style={[styles.cardTitle, active && styles.cardTitleActive]}
                    >
                      {tpl.title}
                    </Text>
                    <Text style={styles.cardBlurb}>{tpl.blurb}</Text>
                  </View>
                  {active && <View style={styles.radioDot} />}
                </View>
                {active && (
                  <View style={styles.previewBox}>
                    <Text style={styles.previewLabel}>Kimlik</Text>
                    <Text style={styles.previewLine}>
                      “{tpl.identityStatement}”
                    </Text>
                    <Text style={styles.previewLabel}>Mikro-aksiyon</Text>
                    <Text style={styles.previewLine}>{tpl.microActionInitial}</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}

          {/* Custom option */}
          <TouchableOpacity
            style={[styles.card, isCustom && styles.cardActive]}
            onPress={() => setSelected(CUSTOM_ID)}
            activeOpacity={0.85}
          >
            <View style={styles.cardHeader}>
              <Text style={styles.emoji}>✏️</Text>
              <View style={styles.cardTextWrap}>
                <Text
                  style={[styles.cardTitle, isCustom && styles.cardTitleActive]}
                >
                  Kendi cümlemi yazacağım
                </Text>
                <Text style={styles.cardBlurb}>
                  Kendi kimlik ifadeni yaz; çapa ve zamanı sıradaki adımda netleştirirsin.
                  Bugün kartı motoru seçilen rota ile uyumlu çalışır.
                </Text>
              </View>
              {isCustom && <View style={styles.radioDot} />}
            </View>
            {isCustom && (
              <View style={styles.customWrap}>
                <TextInput
                  style={styles.customInput}
                  value={customText}
                  onChangeText={setCustomText}
                  placeholder="Örn: Her gün su içen biri..."
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
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.cta, !canContinue && styles.ctaDisabled]}
          onPress={handleContinue}
          disabled={!canContinue}
          activeOpacity={0.8}
        >
          <Text style={styles.ctaText}>Devam Et</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  scroll: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.xl,
    flexGrow: 1,
  },
  stepRow: {
    flexDirection: "row",
    gap: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  step: {
    flex: 1,
    height: 3,
    borderRadius: Radii.full,
    backgroundColor: Colors.border,
  },
  stepActive: { backgroundColor: Colors.primary },
  title: {
    fontSize: FontSizes.xxl,
    fontFamily: "Inter_500Medium",
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  sub: {
    fontSize: FontSizes.md,
    fontFamily: "Inter_400Regular",
    color: Colors.textSecondary,
    lineHeight: 22,
    marginBottom: Spacing.md,
  },
  infoPanel: {
    backgroundColor: Colors.surface,
    borderRadius: Radii.card,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary,
  },
  infoPanelTitle: {
    fontSize: FontSizes.sm,
    fontFamily: "Inter_500Medium",
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  infoPanelLine: {
    fontSize: FontSizes.sm,
    fontFamily: "Inter_400Regular",
    color: Colors.textSecondary,
    lineHeight: 20,
    marginBottom: Spacing.sm,
    paddingRight: Spacing.sm,
  },
  bullet: {
    fontFamily: "Inter_500Medium",
    color: Colors.primaryDark,
  },
  list: { gap: Spacing.sm },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radii.card,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.md,
  },
  cardActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryLight,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  emoji: { fontSize: 26 },
  cardTextWrap: { flex: 1 },
  cardTitle: {
    fontSize: FontSizes.md,
    fontFamily: "Inter_500Medium",
    color: Colors.textPrimary,
  },
  cardTitleActive: { color: Colors.primary },
  cardBlurb: {
    marginTop: 2,
    fontSize: FontSizes.sm,
    fontFamily: "Inter_400Regular",
    color: Colors.textSecondary,
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.primary,
  },
  previewBox: {
    marginTop: Spacing.sm,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: "rgba(29,158,117,0.2)",
    gap: 2,
  },
  previewLabel: {
    fontSize: FontSizes.xs,
    fontFamily: "Inter_500Medium",
    color: Colors.primaryDark,
    letterSpacing: 0.5,
    textTransform: "uppercase",
    marginTop: 6,
  },
  previewLine: {
    fontSize: FontSizes.sm,
    fontFamily: "Inter_400Regular",
    color: Colors.textPrimary,
    lineHeight: 20,
  },
  customWrap: { marginTop: Spacing.sm, gap: Spacing.xs },
  customInput: {
    backgroundColor: Colors.surface,
    borderRadius: Radii.button,
    borderWidth: 1,
    borderColor: Colors.border,
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
  footer: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xl,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  cta: {
    backgroundColor: Colors.primary,
    borderRadius: Radii.button,
    paddingVertical: 15,
    alignItems: "center",
  },
  ctaDisabled: { opacity: 0.45 },
  ctaText: {
    fontSize: FontSizes.md,
    fontFamily: "Inter_500Medium",
    color: "#fff",
  },
});
