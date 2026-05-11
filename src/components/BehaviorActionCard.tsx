/**
 * Behavior Action Card.
 *
 * Ana ekrandaki TEK büyük buton — sakin hiyerarşi (Tide-benzeri nefes alan düzen).
 */

import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { ArrowRight } from "lucide-react-native";
import { UserState, MUSCLE_LABELS, STATUS_LABELS, STATUS_EMOJI } from "../engine";
import { Colors, Spacing, Radii, FontSizes, Shadows } from "../constants/theme";

interface Props {
  state: UserState;
  onPress: () => void;
  disabled?: boolean;
  /** Ana ekran: dikey alanı kısalt, metinleri kırp */
  compact?: boolean;
}

const STATUS_TINT: Record<
  UserState["status"],
  { bg: string; border: string; tint: string; cta: string }
> = {
  green: {
    bg: "rgba(47, 156, 134, 0.08)",
    border: "rgba(47, 156, 134, 0.16)",
    tint: Colors.primaryDark,
    cta: Colors.primary,
  },
  yellow: {
    bg: "rgba(184, 137, 46, 0.09)",
    border: "rgba(184, 137, 46, 0.2)",
    tint: "#7A6220",
    cta: "#5C4820",
  },
  red: {
    bg: "rgba(200, 107, 90, 0.09)",
    border: "rgba(200, 107, 90, 0.2)",
    tint: "#A85A4A",
    cta: Colors.coral,
  },
};

export default function BehaviorActionCard({
  state,
  onPress,
  disabled = false,
  compact = false,
}: Props) {
  const tint = STATUS_TINT[state.status];
  const a = state.suggestedAction;
  const metaLine =
    a.type === "recovery"
      ? `${MUSCLE_LABELS[a.type]} · tek hareket`
      : `${MUSCLE_LABELS[a.type]} · ${a.duration} sn`;
  const metaSuffix = state.scaledDown ? " · küçültüldü" : "";

  return (
    <View
      style={[
        styles.card,
        compact && styles.cardCompact,
        { backgroundColor: tint.bg, borderColor: tint.border },
      ]}
    >
      <View style={[styles.headerRow, compact && styles.headerRowCompact]}>
        <View style={[styles.statusPill, compact && styles.statusPillCompact]}>
          <Text style={styles.statusEmoji}>{STATUS_EMOJI[state.status]}</Text>
          <Text style={[styles.statusLabel, compact && styles.statusLabelCompact, { color: tint.tint }]}>
            {STATUS_LABELS[state.status]}
          </Text>
        </View>
        <Text style={[styles.scoreText, compact && styles.scoreTextCompact, { color: tint.tint }]}>
          %{state.automationScore} otomatik
        </Text>
      </View>

      <Text style={[styles.metaCaption, compact && styles.metaCaptionCompact, { color: tint.tint }]}>
        {metaLine}
        {metaSuffix}
      </Text>

      <Text style={[styles.title, compact && styles.titleCompact]} numberOfLines={compact ? 2 : undefined}>
        {a.title}
      </Text>
      <Text
        style={[styles.reason, compact && styles.reasonCompact]}
        numberOfLines={compact ? 2 : undefined}
      >
        {state.reason}
      </Text>

      {!compact && (state.situationCue || state.phaseFocus) ? (
        <View style={styles.hintBlock}>
          {state.situationCue ? (
            <Text style={[styles.hintLine, { color: tint.tint }]}>{state.situationCue}</Text>
          ) : null}
          {state.phaseFocus ? (
            <Text style={styles.phaseMuted}>{state.phaseFocus}</Text>
          ) : null}
        </View>
      ) : null}

      <TouchableOpacity
        style={[
          styles.cta,
          compact && styles.ctaCompact,
          { backgroundColor: tint.cta },
          disabled && styles.ctaDisabled,
        ]}
        onPress={onPress}
        activeOpacity={0.88}
        disabled={disabled}
      >
        <Text style={[styles.ctaText, compact && styles.ctaTextCompact]}>
          {state.recoveryMode ? "Yeniden başla" : "Şimdi yap"}
        </Text>
        <ArrowRight size={compact ? 15 : 16} color="#fff" strokeWidth={2.2} />
      </TouchableOpacity>

      {!compact && state.predictionDays > 0 ? (
        <Text style={styles.prediction}>
          Otomatikleşmeye tahmini ~{state.predictionDays} gün
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: Radii.card,
    borderWidth: 1,
    padding: Spacing.xl,
    marginBottom: Spacing.xl,
    ...Shadows.soft,
  },
  cardCompact: {
    padding: Spacing.md,
    marginBottom: 0,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: Spacing.sm,
  },
  headerRowCompact: {
    marginBottom: Spacing.xs,
  },
  statusPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(255,255,255,0.7)",
    borderRadius: Radii.pill,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  statusPillCompact: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    gap: 4,
  },
  statusEmoji: { fontSize: 12 },
  statusLabel: {
    fontSize: FontSizes.xs,
    fontFamily: "Inter_500Medium",
    letterSpacing: 0.2,
  },
  statusLabelCompact: {
    fontSize: 11,
  },
  scoreText: {
    fontSize: FontSizes.xs,
    fontFamily: "Inter_500Medium",
  },
  scoreTextCompact: {
    fontSize: 11,
  },
  metaCaption: {
    fontSize: FontSizes.xs,
    fontFamily: "Inter_400Regular",
    letterSpacing: 0.4,
    marginBottom: Spacing.md,
    opacity: 0.95,
  },
  metaCaptionCompact: {
    marginBottom: Spacing.sm,
  },
  title: {
    fontSize: FontSizes.xl,
    fontFamily: "Inter_500Medium",
    color: Colors.textPrimary,
    lineHeight: 28,
    marginBottom: Spacing.sm,
    letterSpacing: -0.2,
  },
  titleCompact: {
    fontSize: FontSizes.lg,
    lineHeight: 24,
    marginBottom: 6,
  },
  reason: {
    fontSize: FontSizes.sm,
    fontFamily: "Inter_400Regular",
    color: Colors.textSecondary,
    lineHeight: 22,
    marginBottom: Spacing.md,
  },
  reasonCompact: {
    marginBottom: Spacing.sm,
    lineHeight: 20,
  },
  hintBlock: {
    gap: 6,
    marginBottom: Spacing.lg,
  },
  hintLine: {
    fontSize: FontSizes.xs,
    fontFamily: "Inter_400Regular",
    lineHeight: 18,
    opacity: 0.92,
  },
  phaseMuted: {
    fontSize: FontSizes.xs,
    fontFamily: "Inter_400Regular",
    color: Colors.textTertiary,
    lineHeight: 18,
    letterSpacing: 0.15,
  },
  cta: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderRadius: Radii.button,
    paddingVertical: 15,
  },
  ctaCompact: {
    paddingVertical: 12,
  },
  ctaDisabled: {
    opacity: 0.55,
  },
  ctaText: {
    color: "#fff",
    fontFamily: "Inter_500Medium",
    fontSize: FontSizes.md,
  },
  ctaTextCompact: {
    fontSize: FontSizes.sm,
  },
  prediction: {
    marginTop: Spacing.md,
    fontSize: FontSizes.xs,
    fontFamily: "Inter_400Regular",
    color: Colors.textTertiary,
    textAlign: "center",
    lineHeight: 17,
  },
});
