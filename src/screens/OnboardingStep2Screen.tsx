import React, { useState } from "react";
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { AuthStackParamList } from "../types";
import {
  Colors, Spacing, Radii, FontSizes,
  ANCHOR_PRESETS, TIME_RANGES,
} from "../constants/theme";

type Props = NativeStackScreenProps<AuthStackParamList, "OnboardingStep2">;

export default function OnboardingStep2Screen({ route, navigation }: Props) {
  const { habitName } = route.params;
  const [selectedAnchor, setSelectedAnchor] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  const canContinue = !!selectedAnchor && !!selectedTime;

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Step dots */}
        <View style={styles.stepRow}>
          {[1, 2, 3].map((s) => (
            <View
              key={s}
              style={[styles.step, s <= 2 && styles.stepActive]}
            />
          ))}
        </View>

        <Text style={styles.title}>Bu kimliği nereye bağlayacaksın?</Text>
        <Text style={styles.sub}>
          Disiplin boşlukta oluşmaz. Var olan bir rutine çapa at — beyin otomatikleştirmeye oradan başlar.
        </Text>

        {/* Preview sentence */}
        <View style={styles.previewBox}>
          <Text style={styles.previewText}>
            <Text style={styles.previewMuted}>
              {selectedAnchor ?? "[ bir şey seç ]"}
            </Text>
            {", "}
            <Text style={styles.previewHabit}>{habitName}</Text>
            {" yapacağım."}
          </Text>
        </View>

        {/* Anchor options */}
        <Text style={styles.sectionLabel}>Önce ne yapıyorsun?</Text>
        <View style={styles.optionsList}>
          {ANCHOR_PRESETS.map((anchor) => {
            const active = selectedAnchor === anchor;
            return (
              <TouchableOpacity
                key={anchor}
                style={[styles.option, active && styles.optionActive]}
                onPress={() => setSelectedAnchor(anchor)}
                activeOpacity={0.8}
              >
                <Text style={[styles.optionText, active && styles.optionTextActive]}>
                  {anchor}
                </Text>
                {active && <View style={styles.optionDot} />}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Time range */}
        <Text style={styles.sectionLabel}>Hangi saat aralığında?</Text>
        <View style={styles.optionsList}>
          {TIME_RANGES.map((t) => {
            const active = selectedTime === t.id;
            return (
              <TouchableOpacity
                key={t.id}
                style={[styles.option, active && styles.optionActive]}
                onPress={() => setSelectedTime(t.id)}
                activeOpacity={0.8}
              >
                <Text style={[styles.optionText, active && styles.optionTextActive]}>
                  {t.label}
                </Text>
                {active && <View style={styles.optionDot} />}
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
          activeOpacity={0.75}
        >
          <Text style={styles.backText}>Geri</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.cta, !canContinue && styles.ctaDisabled]}
          onPress={() => {
            if (!canContinue) return;
            navigation.navigate("OnboardingStep3", {
              habitName,
              anchorBehavior: selectedAnchor!,
              anchorTime: selectedTime!,
            });
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
    flex: 1, height: 3,
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
    marginBottom: Spacing.lg,
  },
  previewBox: {
    backgroundColor: Colors.primaryLight,
    borderRadius: Radii.card,
    padding: Spacing.md,
    marginBottom: Spacing.xl,
    borderLeftWidth: 3,
    borderLeftColor: Colors.primary,
  },
  previewText: {
    fontSize: FontSizes.md,
    fontFamily: "Inter_400Regular",
    color: Colors.textPrimary,
    lineHeight: 22,
  },
  previewMuted: {
    color: Colors.textSecondary,
    fontStyle: "italic",
  },
  previewHabit: {
    color: Colors.primary,
    fontFamily: "Inter_500Medium",
  },
  sectionLabel: {
    fontSize: FontSizes.sm,
    fontFamily: "Inter_500Medium",
    color: Colors.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 0.7,
    marginBottom: Spacing.sm,
    marginTop: Spacing.md,
  },
  optionsList: {
    gap: Spacing.xs,
    marginBottom: Spacing.sm,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: Colors.surface,
    borderRadius: Radii.button,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.md,
    paddingVertical: 13,
  },
  optionActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryLight,
  },
  optionText: {
    fontSize: FontSizes.md,
    fontFamily: "Inter_400Regular",
    color: Colors.textSecondary,
  },
  optionTextActive: {
    color: Colors.primary,
    fontFamily: "Inter_500Medium",
  },
  optionDot: {
    width: 8, height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary,
  },
  footer: {
    flexDirection: "row",
    gap: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xl,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  backBtn: {
    paddingVertical: 15,
    paddingHorizontal: Spacing.lg,
    borderRadius: Radii.button,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: "center",
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
  },
  ctaDisabled: { opacity: 0.45 },
  ctaText: {
    fontSize: FontSizes.md,
    fontFamily: "Inter_500Medium",
    color: "#fff",
  },
});
