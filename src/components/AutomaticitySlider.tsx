import React, { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  useWindowDimensions,
} from "react-native";
import { Colors, Spacing, Radii, FontSizes } from "../constants/theme";

export interface AutomaticitySliderProps {
  dayNumber: number;
  onSubmit: (automaticity: number, effort: number) => void;
}

const DOTS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] as const;

function DotScale({
  value,
  onChange,
  labelLow,
  labelHigh,
  selectA11y,
}: {
  value: number;
  onChange: (v: number) => void;
  labelLow: string;
  labelHigh: string;
  selectA11y: (n: number) => string;
}) {
  return (
    <View style={styles.scaleBlock}>
      <View style={styles.dotsRow}>
        {DOTS.map((n) => {
          const active = value === n;
          return (
            <TouchableOpacity
              key={n}
              style={styles.dotHit}
              onPress={() => onChange(n)}
              activeOpacity={0.75}
              accessibilityRole="button"
              accessibilityLabel={selectA11y(n)}
              accessibilityState={{ selected: active }}
            >
              <View style={[styles.dot, active && styles.dotActive]} />
            </TouchableOpacity>
          );
        })}
      </View>
      <View style={styles.scaleLabelsRow}>
        <Text style={[styles.scaleEndLabel, { textAlign: "left" }]} numberOfLines={2}>
          {labelLow}
        </Text>
        <Text style={[styles.scaleEndLabel, { textAlign: "right" }]} numberOfLines={2}>
          {labelHigh}
        </Text>
      </View>
    </View>
  );
}

/**
 * Bilimsel otomatiklik + çaba değerlendirmesi (nokta seçici, kaydırıcı değil).
 * Streak yerine tamamlama sonrası kullanım için tasarlandı.
 */
/** Modal başlık + padding için yer bırakır; ScrollView’a net yükseklik verir (flex:1 çöküşünü önler). */
const SHEET_HEADER_RESERVE = 76;

export default function AutomaticitySlider({ dayNumber, onSubmit }: AutomaticitySliderProps) {
  const { t } = useTranslation();
  const { height: winH } = useWindowDimensions();
  const r = (key: string, opts?: Record<string, unknown>) =>
    t(`home.automaticityRating.${key}`, opts);
  const scrollMaxH = Math.max(240, winH * 0.92 - SHEET_HEADER_RESERVE);

  const [automaticity, setAutomaticity] = useState(5);
  const [effort, setEffort] = useState(5);

  const showWarning = useMemo(
    () => automaticity > 7 && effort > 6,
    [automaticity, effort]
  );

  return (
    <ScrollView
      style={[styles.scroll, { maxHeight: scrollMaxH }]}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.card}>
        <Text style={styles.kicker}>{r("kicker", { day: dayNumber })}</Text>
        <Text style={styles.title}>{r("title")}</Text>
        <Text style={styles.subtitle}>{r("subtitle")}</Text>
        <View style={styles.reminderBox}>
          <Text style={styles.reminderText}>{r("reminder")}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.question}>{r("autoQuestion")}</Text>
          <Text style={styles.hint}>{r("autoHint")}</Text>
          <DotScale
            value={automaticity}
            onChange={setAutomaticity}
            labelLow={r("autoLow")}
            labelHigh={r("autoHigh")}
            selectA11y={(n) => r("selectA11y", { n })}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.question}>{r("effortQuestion")}</Text>
          <Text style={styles.hint}>{r("effortHint")}</Text>
          <DotScale
            value={effort}
            onChange={setEffort}
            labelLow={r("effortLow")}
            labelHigh={r("effortHigh")}
            selectA11y={(n) => r("selectA11y", { n })}
          />
        </View>

        {showWarning && (
          <View style={styles.warningBox}>
            <Text style={styles.warningText}>{r("warning")}</Text>
          </View>
        )}

        <TouchableOpacity
          style={styles.submitBtn}
          onPress={() => onSubmit(automaticity, effort)}
          activeOpacity={0.85}
        >
          <Text style={styles.submitBtnText}>{r("submit")}</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {},
  scrollContent: { paddingBottom: Spacing.lg },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radii.card,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  kicker: {
    fontSize: FontSizes.xs,
    fontFamily: "Inter_500Medium",
    color: Colors.textTertiary,
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  title: {
    fontSize: FontSizes.xl,
    fontFamily: "Inter_500Medium",
    color: Colors.textPrimary,
  },
  subtitle: {
    fontSize: FontSizes.sm,
    fontFamily: "Inter_400Regular",
    color: Colors.textSecondary,
    fontStyle: "italic",
    lineHeight: 20,
    marginBottom: Spacing.xs,
  },
  reminderBox: {
    backgroundColor: Colors.primaryLight,
    borderRadius: Radii.button,
    padding: Spacing.sm,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: "rgba(29, 158, 117, 0.2)",
  },
  reminderText: {
    fontSize: FontSizes.xs,
    fontFamily: "Inter_400Regular",
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  section: { gap: Spacing.sm },
  question: {
    fontSize: FontSizes.md,
    fontFamily: "Inter_500Medium",
    color: Colors.textPrimary,
    lineHeight: 22,
  },
  hint: {
    fontSize: FontSizes.sm,
    fontFamily: "Inter_400Regular",
    color: Colors.textTertiary,
    fontStyle: "italic",
    lineHeight: 20,
  },
  scaleBlock: { gap: Spacing.xs, marginTop: Spacing.xs },
  dotsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 2,
  },
  dotHit: {
    flex: 1,
    minWidth: 24,
    alignItems: "center",
    paddingVertical: Spacing.sm,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.borderStrong,
  },
  dotActive: {
    backgroundColor: Colors.primary,
    transform: [{ scale: 1.15 }],
  },
  scaleLabelsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: Spacing.md,
  },
  scaleEndLabel: {
    flex: 1,
    fontSize: FontSizes.xs,
    fontFamily: "Inter_400Regular",
    color: Colors.textTertiary,
    fontStyle: "italic",
  },
  warningBox: {
    backgroundColor: Colors.goldLight,
    borderRadius: Radii.button,
    borderWidth: 1,
    borderColor: "rgba(212, 160, 23, 0.35)",
    padding: Spacing.md,
  },
  warningText: {
    fontSize: FontSizes.sm,
    fontFamily: "Inter_400Regular",
    color: Colors.textPrimary,
    lineHeight: 20,
  },
  submitBtn: {
    backgroundColor: Colors.primary,
    borderRadius: Radii.button,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: Spacing.sm,
  },
  submitBtnText: {
    fontSize: FontSizes.md,
    fontFamily: "Inter_500Medium",
    color: "#fff",
  },
});
