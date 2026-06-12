import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { TrendingUp, TrendingDown, Minus } from "lucide-react-native";
import { useTranslation } from "react-i18next";
import { Colors, Spacing, Radii, FontSizes, Shadows } from "../../constants/theme";
import type { DisciplineScoreResult } from "../../utils/disciplineScore";

export interface DisciplineScoreCardProps {
  result: DisciplineScoreResult;
  compact?: boolean;
}

export default function DisciplineScoreCard({ result, compact = false }: DisciplineScoreCardProps) {
  const { t } = useTranslation();
  const { score, weeklyDelta, nextMilestone, remainingToMilestone, atMax } = result;

  const deltaPositive = weeklyDelta > 0;
  const deltaNegative = weeklyDelta < 0;
  const DeltaIcon = deltaPositive ? TrendingUp : deltaNegative ? TrendingDown : Minus;
  const deltaColor = deltaPositive ? "#10B981" : deltaNegative ? Colors.coral : Colors.textTertiary;

  return (
    <View style={[styles.card, compact && styles.cardCompact]}>
      <Text style={[styles.label, compact && styles.labelCompact]}>
        {t("growth.discipline.title")}
      </Text>

      <Text style={[styles.score, compact && styles.scoreCompact]}>{score}</Text>

      <View style={styles.deltaRow}>
        <DeltaIcon size={14} color={deltaColor} strokeWidth={2.5} />
        <Text style={[styles.deltaText, { color: deltaColor }]}>
          {weeklyDelta > 0
            ? t("growth.discipline.deltaUp", { count: weeklyDelta })
            : weeklyDelta < 0
              ? t("growth.discipline.deltaDown", { count: Math.abs(weeklyDelta) })
              : t("growth.discipline.deltaFlat")}
        </Text>
      </View>

      {atMax ? (
        <Text style={styles.milestone}>{t("growth.discipline.atMax")}</Text>
      ) : nextMilestone != null ? (
        <Text style={styles.milestone}>
          {t("growth.discipline.milestoneRemaining", {
            milestone: nextMilestone,
            remaining: remainingToMilestone,
          })}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radii.card,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.md,
    ...Shadows.soft,
  },
  cardCompact: {
    marginBottom: Spacing.sm,
    padding: Spacing.sm + 4,
  },
  label: {
    fontSize: FontSizes.sm,
    fontFamily: "Inter_600SemiBold",
    fontWeight: "600",
    color: Colors.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  labelCompact: {
    fontSize: FontSizes.xs,
    marginBottom: 2,
  },
  score: {
    fontSize: 44,
    fontFamily: "Inter_700Bold",
    fontWeight: "700",
    color: Colors.textPrimary,
    letterSpacing: -1,
    lineHeight: 48,
  },
  scoreCompact: {
    fontSize: 36,
    lineHeight: 40,
  },
  deltaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 4,
    marginBottom: 8,
  },
  deltaText: {
    fontSize: FontSizes.sm,
    fontFamily: "Inter_500Medium",
    fontWeight: "500",
  },
  milestone: {
    fontSize: FontSizes.sm,
    fontFamily: "Inter_400Regular",
    color: Colors.textSecondary,
  },
});
