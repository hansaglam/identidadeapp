import React, { useMemo } from "react";
import { View, Text, StyleSheet } from "react-native";
import { CalendarRange } from "lucide-react-native";
import { useTranslation } from "react-i18next";
import { CheckinRecord } from "../types";
import { buildWeeklyDigest } from "../utils/weeklySummary";
import { Spacing, Radii, FontSizes, Colors, Shadows } from "../constants/theme";

interface Props {
  startDate: string;
  checkins: Record<string, CheckinRecord>;
  habitName: string;
}

export default function WeeklySummaryCard({ startDate, checkins }: Props) {
  const { t, i18n } = useTranslation();
  const digest = useMemo(
    () => buildWeeklyDigest(startDate, checkins),
    [startDate, checkins, i18n.language]
  );

  const slipHint = digest.slipProneWeekdayShort
    ? t("profile.weeklySummary.slipHint", { day: digest.slipProneWeekdayShort })
    : t("profile.weeklySummary.consistentHint");

  return (
    <View style={[styles.card, Shadows.soft]}>
      <View style={styles.header}>
        <View style={styles.headerIcon}>
          <CalendarRange size={14} color={Colors.primary} strokeWidth={2} />
        </View>
        <View style={styles.headerText}>
          <Text style={styles.title}>{t("profile.weeklySummary.title")}</Text>
          <Text style={styles.sub}>{digest.windowLabel}</Text>
        </View>
      </View>

      <View style={styles.metricRow}>
        <Text style={styles.metricLabel}>{t("profile.weeklySummary.completedLine")}</Text>
        <View style={styles.metricBadge}>
          <Text style={styles.metricValue}>
            {digest.completedDays}
            <Text style={styles.metricDenom}>/7</Text>
          </Text>
        </View>
      </View>

      {digest.missedDaysInWindow > 0 ? (
        <View style={styles.infoRow}>
          <Text style={styles.infoText}>
            {t("profile.weeklySummary.missedLine", { count: digest.missedDaysInWindow })}
          </Text>
        </View>
      ) : null}

      {digest.completionTimePeak ? (
        <View style={styles.insightBox}>
          <Text style={styles.insightText}>{digest.completionTimePeak}</Text>
        </View>
      ) : null}

      {digest.completionTimeCaveat ? (
        <Text style={styles.caveat}>{digest.completionTimeCaveat}</Text>
      ) : null}

      <Text style={styles.footerHint}>{slipHint}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radii.button,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.sm,
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.sm,
    gap: 6,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 2,
  },
  headerIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },
  headerText: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    fontSize: FontSizes.sm,
    fontFamily: "Inter_600SemiBold",
    color: Colors.textPrimary,
  },
  sub: {
    fontSize: 10,
    fontFamily: "Inter_400Regular",
    color: Colors.textTertiary,
    marginTop: 1,
  },
  metricRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: Colors.surfaceMuted,
    borderRadius: Radii.sm,
    paddingVertical: 6,
    paddingHorizontal: 10,
    gap: 8,
  },
  metricLabel: {
    flex: 1,
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    color: Colors.textSecondary,
    lineHeight: 15,
  },
  metricBadge: {
    backgroundColor: Colors.surface,
    borderRadius: Radii.pill,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: "rgba(47, 156, 134, 0.18)",
  },
  metricValue: {
    fontSize: FontSizes.md,
    fontFamily: "Inter_600SemiBold",
    color: Colors.primaryDark,
  },
  metricDenom: {
    fontSize: 11,
    fontFamily: "Inter_500Medium",
    color: Colors.textTertiary,
  },
  infoRow: {
    paddingHorizontal: 1,
  },
  infoText: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    color: Colors.textSecondary,
    lineHeight: 15,
  },
  insightBox: {
    backgroundColor: Colors.primaryLight,
    borderRadius: Radii.sm,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: "rgba(47, 156, 134, 0.12)",
  },
  insightText: {
    fontSize: 11,
    fontFamily: "Inter_500Medium",
    color: Colors.primaryDark,
    lineHeight: 15,
  },
  caveat: {
    fontSize: 10,
    fontFamily: "Inter_400Regular",
    color: Colors.textTertiary,
    fontStyle: "italic",
    lineHeight: 14,
    paddingHorizontal: 1,
  },
  footerHint: {
    fontSize: 10,
    fontFamily: "Inter_400Regular",
    color: Colors.textTertiary,
    lineHeight: 14,
    paddingTop: 2,
    paddingHorizontal: 1,
  },
});
