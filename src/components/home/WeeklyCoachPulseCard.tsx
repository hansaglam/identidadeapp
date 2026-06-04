import React, { useMemo } from "react";
import { View, Text, StyleSheet } from "react-native";
import { Activity } from "lucide-react-native";
import { Colors, Spacing, Radii, FontSizes, Shadows } from "../../constants/theme";
import { useTranslation } from "react-i18next";
import { buildWeeklyCoachPulse } from "../../utils/weeklyCoachPulse";
import type { CheckinRecord } from "../../types";
import type { SDTScore } from "../../types";
import type { RecentAction } from "../../engine";

interface Props {
  startDate: string;
  checkins: Record<string, CheckinRecord>;
  habitName: string;
  dayNumber: number;
  currentStreak: number;
  recentActions: RecentAction[];
  latestSdt: SDTScore | null;
}

export default function WeeklyCoachPulseCard({
  startDate,
  checkins,
  habitName,
  dayNumber,
  currentStreak,
  recentActions,
  latestSdt,
}: Props) {
  const { t } = useTranslation();
  const pulse = useMemo(
    () =>
      buildWeeklyCoachPulse({
        startDate,
        checkins,
        habitName,
        dayNumber,
        currentStreak,
        recentActions,
        latestSdt,
      }),
    [startDate, checkins, habitName, dayNumber, currentStreak, recentActions, latestSdt]
  );

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Activity size={16} color={Colors.primary} strokeWidth={2} />
        <Text style={styles.title}>{t("home.coachPulse.title")}</Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{pulse.headline}</Text>
        </View>
      </View>
      {pulse.lines.map((line) => (
        <Text key={line} style={styles.line}>
          · {line}
        </Text>
      ))}
      <Text style={styles.suggestion}>{pulse.suggestion}</Text>
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
    ...Shadows.soft,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: Spacing.sm,
    flexWrap: "wrap",
  },
  title: {
    fontSize: FontSizes.sm,
    fontFamily: "Inter_600SemiBold",
    fontWeight: "600",
    color: Colors.textPrimary,
    flex: 1,
  },
  badge: {
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radii.pill,
  },
  badgeText: {
    fontSize: 10,
    fontFamily: "Inter_600SemiBold",
    fontWeight: "600",
    color: Colors.primaryDark,
  },
  line: {
    fontSize: FontSizes.sm,
    fontFamily: "Inter_400Regular",
    color: Colors.textSecondary,
    lineHeight: 20,
    marginBottom: 4,
  },
  suggestion: {
    marginTop: Spacing.sm,
    fontSize: FontSizes.sm,
    fontFamily: "Inter_500Medium",
    color: Colors.primaryDark,
    lineHeight: 20,
  },
});
