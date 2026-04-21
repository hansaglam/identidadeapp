import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Colors, Spacing, Radii, FontSizes, JOURNEY_PHASES } from "../constants/theme";
import { getPrincipleByDay } from "../data/dailyPrinciples";

export interface DailyPrincipleCardProps {
  day: number;
}

const PHASE_LINE: Record<1 | 2 | 3, string> = {
  1: "Faz 1 — Kuruluş",
  2: "Faz 2 — Pekiştirme",
  3: "Faz 3 — Otomatikleşme",
};

/**
 * Home bugün: bilimsel prensip, kaynak, aksiyon (dailyPrinciples).
 */
export default function DailyPrincipleCard({ day }: DailyPrincipleCardProps) {
  const d = Math.min(66, Math.max(1, day));
  const p = getPrincipleByDay(d);
  if (!p) return null;
  const phase = JOURNEY_PHASES[p.phase - 1];
  return (
    <View style={[styles.card, { borderLeftColor: phase.color, backgroundColor: "#FAFAF0" }]}>
      <Text style={styles.kicker}>
        Gün {d} · {PHASE_LINE[p.phase]}
      </Text>
      <Text style={styles.principle}>{p.principle}</Text>
      <Text style={styles.science}>{p.science}</Text>
      <View style={styles.actionRow}>
        <Text style={styles.actionLabel}>Bugün</Text>
        <Text style={styles.action}>{p.action}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: Radii.card,
    borderWidth: 1,
    borderColor: Colors.border,
    borderLeftWidth: 3,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    gap: Spacing.xs,
  },
  kicker: {
    fontSize: FontSizes.xs,
    fontFamily: "Inter_500Medium",
    color: Colors.textTertiary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  principle: {
    fontSize: FontSizes.lg,
    fontFamily: "Inter_500Medium",
    color: Colors.textPrimary,
    lineHeight: 24,
  },
  science: {
    fontSize: FontSizes.sm,
    fontFamily: "Inter_400Regular",
    color: Colors.textTertiary,
    fontStyle: "italic",
    lineHeight: 20,
  },
  actionRow: { marginTop: Spacing.xs, gap: 2 },
  actionLabel: {
    fontSize: FontSizes.xs,
    fontFamily: "Inter_500Medium",
    color: Colors.textSecondary,
  },
  action: {
    fontSize: FontSizes.md,
    fontFamily: "Inter_500Medium",
    color: Colors.primaryDark,
  },
});
