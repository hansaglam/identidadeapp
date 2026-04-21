/**
 * Behavior Action Card.
 *
 * Ana ekrandaki TEK büyük buton.
 *  - Tek aksiyon
 *  - Tek tap
 *  - Hiç düşünme yok
 *
 * Sistem hangi aksiyonu sunacağına kendi karar verir.
 */

import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { ArrowRight } from "lucide-react-native";
import { UserState, MUSCLE_LABELS, STATUS_LABELS, STATUS_EMOJI } from "../engine";
import { Colors, Spacing, Radii, FontSizes } from "../constants/theme";

interface Props {
  state: UserState;
  onPress: () => void;
}

const STATUS_TINT: Record<
  UserState["status"],
  { bg: string; border: string; tint: string }
> = {
  green: {
    bg: Colors.primaryLight,
    border: "rgba(29,158,117,0.25)",
    tint: Colors.primary,
  },
  yellow: {
    bg: "rgba(212,160,23,0.10)",
    border: "rgba(212,160,23,0.28)",
    tint: Colors.gold,
  },
  red: {
    bg: Colors.coralLight,
    border: "rgba(216,90,48,0.25)",
    tint: Colors.coral,
  },
};

export default function BehaviorActionCard({ state, onPress }: Props) {
  const tint = STATUS_TINT[state.status];
  const a = state.suggestedAction;

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: tint.bg, borderColor: tint.border },
      ]}
    >
      <View style={styles.headerRow}>
        <View style={styles.statusPill}>
          <Text style={styles.statusEmoji}>{STATUS_EMOJI[state.status]}</Text>
          <Text style={[styles.statusLabel, { color: tint.tint }]}>
            {STATUS_LABELS[state.status]}
          </Text>
        </View>
        <Text style={[styles.scoreText, { color: tint.tint }]}>
          %{state.automationScore} otomatik
        </Text>
      </View>

      <Text style={[styles.muscleTag, { color: tint.tint }]}>
        {MUSCLE_LABELS[a.type].toUpperCase()} · {a.duration} SN
      </Text>

      <Text style={styles.title}>{a.title}</Text>
      <Text style={styles.reason}>{state.reason}</Text>

      <TouchableOpacity
        style={[styles.cta, { backgroundColor: tint.tint }]}
        onPress={onPress}
        activeOpacity={0.85}
      >
        <Text style={styles.ctaText}>
          {state.recoveryMode ? "Yeniden başla" : "Şimdi yap"}
        </Text>
        <ArrowRight size={16} color="#fff" strokeWidth={2.2} />
      </TouchableOpacity>

      {state.predictionDays > 0 && (
        <Text style={styles.prediction}>
          Otomatikleşmeye tahmini ~{state.predictionDays} gün
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: Radii.card,
    borderWidth: 1,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: Spacing.md,
  },
  statusPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(255,255,255,0.6)",
    borderRadius: Radii.pill,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  statusEmoji: { fontSize: 12 },
  statusLabel: {
    fontSize: FontSizes.xs,
    fontFamily: "Inter_500Medium",
    letterSpacing: 0.4,
  },
  scoreText: {
    fontSize: FontSizes.sm,
    fontFamily: "Inter_500Medium",
  },
  muscleTag: {
    fontSize: FontSizes.xs,
    fontFamily: "Inter_500Medium",
    letterSpacing: 0.8,
    marginBottom: Spacing.xs,
  },
  title: {
    fontSize: FontSizes.xxl,
    fontFamily: "Inter_500Medium",
    color: Colors.textPrimary,
    lineHeight: 30,
    marginBottom: Spacing.xs,
  },
  reason: {
    fontSize: FontSizes.sm,
    fontFamily: "Inter_400Regular",
    color: Colors.textSecondary,
    lineHeight: 20,
    marginBottom: Spacing.md,
  },
  cta: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    borderRadius: Radii.button,
    paddingVertical: 14,
  },
  ctaText: {
    color: "#fff",
    fontFamily: "Inter_500Medium",
    fontSize: FontSizes.md,
  },
  prediction: {
    marginTop: Spacing.sm,
    fontSize: FontSizes.xs,
    fontFamily: "Inter_400Regular",
    color: Colors.textTertiary,
    textAlign: "center",
  },
});
