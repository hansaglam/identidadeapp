/**
 * GoalProgressCard — 66 günlük yolculuk özeti.
 */

import React, { useMemo } from "react";
import { View, Text, StyleSheet } from "react-native";
import { addDays, format, parseISO } from "date-fns";
import { useTranslation } from "react-i18next";
import { getDateFnsLocale } from "../utils/dateFnsLocale";
import { Colors, FontSizes, Radii, Spacing, Shadows } from "../constants/theme";

interface Props {
  dayNumber: number;
  startDate: string;
}

export default function GoalProgressCard({ dayNumber, startDate }: Props) {
  const { t, i18n } = useTranslation();

  const phases = useMemo(
    () =>
      [
        { label: t("profile.goalProgress.phase1"), start: 1, end: 22, color: Colors.primary },
        { label: t("profile.goalProgress.phase2"), start: 23, end: 44, color: Colors.purple },
        { label: t("profile.goalProgress.phase3"), start: 45, end: 66, color: Colors.coral },
      ] as const,
    [t, i18n.language]
  );

  const phase = phases.find((p) => dayNumber >= p.start && dayNumber <= p.end) ?? phases[2];
  const daysLeft = Math.max(66 - dayNumber, 0);
  const finishDate = addDays(parseISO(startDate), 65);
  const finishStr = format(finishDate, "d MMM yyyy", { locale: getDateFnsLocale() });

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.headerMain}>
          <Text style={styles.label}>{t("profile.goalProgress.title")}</Text>
          <Text style={styles.dayCount}>
            {t("profile.goalProgress.dayCount", { day: dayNumber })}
          </Text>
        </View>
        <View style={[styles.phasePill, { backgroundColor: phase.color + "22" }]}>
          <Text style={[styles.phaseText, { color: phase.color }]}>{phase.label}</Text>
        </View>
      </View>

      <View style={styles.barTrack}>
        {phases.map((p) => {
          const segTotal = p.end - p.start + 1;
          const filled = Math.max(0, Math.min(dayNumber - p.start + 1, segTotal));
          const fillRatio = filled / segTotal;
          return (
            <View key={p.label} style={[styles.barSegment, { flex: segTotal }]}>
              <View
                style={[
                  styles.barFill,
                  {
                    width: `${fillRatio * 100}%`,
                    backgroundColor: dayNumber >= p.start ? p.color : Colors.border,
                  },
                ]}
              />
            </View>
          );
        })}
      </View>

      <View style={styles.phaseLabels}>
        {phases.map((p) => (
          <Text
            key={p.label}
            style={[styles.phaseLabelText, dayNumber >= p.start && { color: p.color }]}
          >
            {t("profile.goalProgress.dayMarker", { day: p.start })}
          </Text>
        ))}
        <Text style={styles.phaseLabelText}>
          {t("profile.goalProgress.dayMarker", { day: 66 })}
        </Text>
      </View>

      <View style={styles.footer}>
        {daysLeft > 0 ? (
          <>
            <Text style={styles.footerLeft} numberOfLines={1}>
              {t("profile.goalProgress.daysLeft", { count: daysLeft })}
            </Text>
            <Text style={styles.footerRight} numberOfLines={1}>
              {t("profile.goalProgress.target", { date: finishStr })}
            </Text>
          </>
        ) : (
          <Text style={[styles.footerLeft, styles.footerComplete]}>
            {t("profile.goalProgress.completed")}
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radii.button,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    gap: 8,
    marginBottom: Spacing.sm,
    ...Shadows.soft,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 8,
  },
  headerMain: {
    flex: 1,
    minWidth: 0,
  },
  label: {
    fontSize: 10,
    fontFamily: "Inter_600SemiBold",
    color: Colors.textTertiary,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 1,
  },
  dayCount: {
    fontSize: FontSizes.md,
    fontFamily: "Inter_600SemiBold",
    color: Colors.textPrimary,
  },
  phasePill: {
    borderRadius: Radii.pill,
    paddingHorizontal: 8,
    paddingVertical: 3,
    flexShrink: 0,
  },
  phaseText: {
    fontSize: 10,
    fontFamily: "Inter_600SemiBold",
  },
  barTrack: {
    height: 4,
    flexDirection: "row",
    gap: 2,
    borderRadius: Radii.full,
    overflow: "hidden",
  },
  barSegment: {
    backgroundColor: Colors.border,
    borderRadius: Radii.full,
    overflow: "hidden",
  },
  barFill: {
    height: "100%",
    borderRadius: Radii.full,
  },
  phaseLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: -2,
  },
  phaseLabelText: {
    fontSize: 9,
    fontFamily: "Inter_500Medium",
    color: Colors.textTertiary,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Colors.border,
    paddingTop: 6,
    marginTop: 0,
  },
  footerLeft: {
    flex: 1,
    fontSize: 10,
    fontFamily: "Inter_400Regular",
    color: Colors.textSecondary,
  },
  footerComplete: {
    flex: 1,
    fontFamily: "Inter_500Medium",
    color: Colors.primary,
  },
  footerRight: {
    flexShrink: 1,
    maxWidth: "52%",
    fontSize: 9,
    fontFamily: "Inter_400Regular",
    color: Colors.textTertiary,
    textAlign: "right",
  },
});
