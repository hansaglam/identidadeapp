import React, { useMemo } from "react";
import { View, Text, StyleSheet } from "react-native";
import { CalendarRange, TrendingDown, TrendingUp, Minus } from "lucide-react-native";
import { useTranslation } from "react-i18next";
import type { CheckinRecord, UserProfile } from "../../types";
import type { DisciplineMuscles } from "../../types/discipline";
import { buildWeeklyGrowthReport } from "../../utils/weeklyGrowthReport";
import { Colors, Spacing, Radii, FontSizes, Shadows } from "../../constants/theme";

interface Props {
  profile: UserProfile;
  checkins: Record<string, CheckinRecord>;
}

export default function WeeklyGrowthReportCard({ profile, checkins }: Props) {
  const { t, i18n } = useTranslation();
  const report = useMemo(
    () => buildWeeklyGrowthReport(profile, checkins),
    [profile, checkins, i18n.language]
  );

  const { disciplineDelta, muscleDelta } = report;
  const deltaPositive = disciplineDelta > 0;
  const deltaNegative = disciplineDelta < 0;
  const DeltaIcon = deltaPositive ? TrendingUp : deltaNegative ? TrendingDown : Minus;
  const deltaColor = deltaPositive ? "#10B981" : deltaNegative ? Colors.coral : Colors.textTertiary;

  const muscleLabel = (key: keyof DisciplineMuscles) => t(`growth.muscles.${key}`);

  return (
    <View style={[styles.card, Shadows.soft]}>
      <View style={styles.header}>
        <View style={styles.headerIcon}>
          <CalendarRange size={14} color={Colors.primary} strokeWidth={2} />
        </View>
        <View style={styles.headerText}>
          <Text style={styles.title}>{t("growth.weeklyReport.title")}</Text>
          <Text style={styles.sub}>{report.windowLabel}</Text>
        </View>
      </View>

      <View style={styles.deltaRow}>
        <DeltaIcon size={14} color={deltaColor} strokeWidth={2.5} />
        <Text style={[styles.deltaText, { color: deltaColor }]}>
          {disciplineDelta > 0
            ? t("growth.weeklyReport.disciplineUp", { count: disciplineDelta })
            : disciplineDelta < 0
              ? t("growth.weeklyReport.disciplineDown", { count: Math.abs(disciplineDelta) })
              : t("growth.weeklyReport.disciplineFlat")}
        </Text>
      </View>

      <Text style={styles.metricLine}>
        {t("growth.weeklyReport.consistency", {
          done: report.completedDays,
          total: report.completedDenom,
        })}
      </Text>

      {report.comebacksThisWeek > 0 ? (
        <Text style={styles.metricLine}>
          {t("growth.weeklyReport.comebacks", { count: report.comebacksThisWeek })}
        </Text>
      ) : null}

      {muscleDelta.hasBaseline ? (
        <View style={styles.muscleBlock}>
          {muscleDelta.improved && muscleDelta.improved.delta > 0 ? (
            <>
              <Text style={styles.muscleKicker}>{t("growth.weeklyReport.improvedMuscle")}</Text>
              <Text style={styles.muscleValuePositive}>
                {t("growth.weeklyReport.muscleDeltaPositive", {
                  delta: muscleDelta.improved.delta,
                  muscle: muscleLabel(muscleDelta.improved.muscle),
                })}
              </Text>
            </>
          ) : null}

          {muscleDelta.declined && muscleDelta.declined.delta < 0 ? (
            <>
              <Text style={[styles.muscleKicker, styles.muscleKickerSpaced]}>
                {t("growth.weeklyReport.declinedMuscle")}
              </Text>
              <Text style={styles.muscleValueNegative}>
                {t("growth.weeklyReport.muscleDeltaNegative", {
                  delta: Math.abs(muscleDelta.declined.delta),
                  muscle: muscleLabel(muscleDelta.declined.muscle),
                })}
              </Text>
            </>
          ) : null}

          {!(muscleDelta.improved && muscleDelta.improved.delta > 0) &&
          !(muscleDelta.declined && muscleDelta.declined.delta < 0) ? (
            <Text style={styles.noMuscleChange}>{t("growth.weeklyReport.noMuscleChange")}</Text>
          ) : null}
        </View>
      ) : (
        <Text style={styles.baselineHint}>{t("growth.weeklyReport.noBaseline")}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radii.card,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    gap: 8,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    marginBottom: 4,
  },
  headerIcon: {
    width: 28,
    height: 28,
    borderRadius: Radii.button,
    backgroundColor: "rgba(16, 185, 129, 0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerText: { flex: 1 },
  title: {
    fontSize: FontSizes.sm,
    fontFamily: "Inter_600SemiBold",
    fontWeight: "600",
    color: Colors.textPrimary,
  },
  sub: {
    fontSize: FontSizes.xs,
    fontFamily: "Inter_400Regular",
    color: Colors.textTertiary,
    marginTop: 1,
  },
  deltaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  deltaText: {
    fontSize: FontSizes.md,
    fontFamily: "Inter_600SemiBold",
    fontWeight: "600",
  },
  metricLine: {
    fontSize: FontSizes.sm,
    fontFamily: "Inter_400Regular",
    color: Colors.textSecondary,
  },
  muscleBlock: {
    marginTop: 4,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  muscleKicker: {
    fontSize: FontSizes.xs,
    fontFamily: "Inter_600SemiBold",
    fontWeight: "600",
    color: Colors.textTertiary,
    textTransform: "uppercase",
    letterSpacing: 0.4,
    marginBottom: 2,
  },
  muscleKickerSpaced: { marginTop: Spacing.sm },
  muscleValuePositive: {
    fontSize: FontSizes.md,
    fontFamily: "Inter_600SemiBold",
    fontWeight: "600",
    color: Colors.primary,
  },
  muscleValueNegative: {
    fontSize: FontSizes.md,
    fontFamily: "Inter_500Medium",
    fontWeight: "500",
    color: Colors.textSecondary,
  },
  noMuscleChange: {
    fontSize: FontSizes.sm,
    fontFamily: "Inter_400Regular",
    color: Colors.textTertiary,
    fontStyle: "italic",
  },
  baselineHint: {
    fontSize: FontSizes.sm,
    fontFamily: "Inter_400Regular",
    color: Colors.textTertiary,
    marginTop: 4,
    fontStyle: "italic",
  },
});
