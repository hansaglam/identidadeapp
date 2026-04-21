import React, { useState } from "react";
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { AuthStackParamList } from "../types";
import {
  Colors, Spacing, Radii, FontSizes, HABIT_PRESETS,
} from "../constants/theme";

type Props = NativeStackScreenProps<AuthStackParamList, "OnboardingStep1">;

export default function OnboardingStep1Screen({ navigation }: Props) {
  const [selected, setSelected] = useState<string | null>(null);
  const [customText, setCustomText] = useState("");

  const isCustom = selected === "custom";
  const habitName = isCustom ? customText.trim() : selected
    ? HABIT_PRESETS.find((p) => p.id === selected)?.label ?? ""
    : "";
  const canContinue = habitName.length >= 2;

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Step dots */}
        <View style={styles.stepRow}>
          {[1, 2, 3].map((s) => (
            <View key={s} style={[styles.step, s === 1 && styles.stepActive]} />
          ))}
        </View>

        <Text style={styles.title}>66 gün sonunda kim olmak istiyorsun?</Text>
        <Text style={styles.sub}>
          Bir alışkanlık seçme. Bir kimlik seç. Gerçek değişim "yapıyorum"dan "buyum"a geçtiğinde başlar.
        </Text>

        {/* Habit grid */}
        <View style={styles.grid}>
          {HABIT_PRESETS.map((preset) => {
            const active = selected === preset.id;
            return (
              <TouchableOpacity
                key={preset.id}
                style={[styles.card, active && styles.cardActive]}
                onPress={() => setSelected(preset.id)}
                activeOpacity={0.8}
              >
                <Text style={styles.cardEmoji}>{preset.emoji}</Text>
                <Text style={[styles.cardLabel, active && styles.cardLabelActive]}>
                  {preset.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Custom input */}
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
      </ScrollView>

      {/* Footer CTA */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.cta, !canContinue && styles.ctaDisabled]}
          onPress={() => {
            if (!canContinue) return;
            navigation.navigate("OnboardingStep2", { habitName });
          }}
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
  stepActive: {
    backgroundColor: Colors.primary,
  },
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
    marginBottom: Spacing.xl,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
  },
  card: {
    width: "48%",
    backgroundColor: Colors.surface,
    borderRadius: Radii.card,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.md,
    alignItems: "center",
    gap: Spacing.sm,
  },
  cardActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryLight,
  },
  cardEmoji: {
    fontSize: 28,
  },
  cardLabel: {
    fontSize: FontSizes.md,
    fontFamily: "Inter_400Regular",
    color: Colors.textSecondary,
    textAlign: "center",
  },
  cardLabelActive: {
    color: Colors.primary,
    fontFamily: "Inter_500Medium",
  },
  customWrap: {
    marginTop: Spacing.md,
    gap: Spacing.xs,
  },
  customInput: {
    backgroundColor: Colors.surface,
    borderRadius: Radii.button,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.md,
    paddingVertical: 13,
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
