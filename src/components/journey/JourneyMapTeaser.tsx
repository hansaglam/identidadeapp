import React, { useMemo } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useTranslation } from "react-i18next";
import { CheckCircle2, ChevronRight, Lock } from "lucide-react-native";
import { JOURNEY_PHASES } from "../../constants/theme";
import {
  localizeJourneyPhaseLabel,
  localizeJourneyPhaseDays,
  localizeJourneyPhaseSubtitle,
} from "../../i18n/localizeContent";
import { getPhaseOpenTheme } from "./journeyPhaseTheme";
import JourneyPhaseMiniGrid from "./JourneyPhaseMiniGrid";
import { Colors, Spacing, Radii, FontSizes, Shadows } from "../../constants/theme";

interface Props {
  dayNumber: number;
  grid: boolean[];
  cardWidth: number;
  onUnlock: () => void;
  onDayPress?: (journeyDay: number) => void;
}

export default function JourneyMapTeaser({
  dayNumber,
  grid,
  cardWidth,
  onUnlock,
  onDayPress,
}: Props) {
  const { t } = useTranslation();
  const activePhase = useMemo(() => {
    return (
      JOURNEY_PHASES.find(
        (p) => dayNumber >= p.startDay && dayNumber <= p.endDay
      ) ?? JOURNEY_PHASES[0]
    );
  }, [dayNumber]);

  const phaseGrid = grid.slice(activePhase.startDay - 1, activePhase.endDay);
  const pid = activePhase.id as 1 | 2 | 3;
  const theme = getPhaseOpenTheme(pid, true, false);
  const doneInPhase = phaseGrid.filter(Boolean).length;

  return (
    <View style={styles.wrap}>
      <Text style={styles.sectionLabel}>{t("journey.mapTeaser.sectionLabel")}</Text>
      <Text style={styles.hint}>{t("journey.mapTeaser.hint")}</Text>

      <View
        style={[
          styles.phaseCard,
          {
            width: cardWidth,
            borderColor: theme.borderColor,
            shadowColor: theme.shadowColor,
          },
          theme.showGlow && styles.phaseGlow,
        ]}
      >
        <View style={styles.badge}>
          <Text style={[styles.badgeText, { color: theme.badgeText }]}>
            {t("journey.mapTeaser.badgeActive", { id: activePhase.id })}
          </Text>
        </View>
        <Text style={styles.phaseTitle}>
          {localizeJourneyPhaseLabel(pid)}
        </Text>
        <Text style={styles.phaseRange}>{localizeJourneyPhaseDays(pid)}</Text>
        <Text style={styles.phaseSub} numberOfLines={3}>
          {localizeJourneyPhaseSubtitle(pid)}
        </Text>
        <Text style={styles.stats}>
          {t("journey.mapTeaser.stats", { done: doneInPhase, total: phaseGrid.length })}
        </Text>
        <JourneyPhaseMiniGrid
          phase={activePhase}
          phaseGrid={phaseGrid}
          dayNumber={dayNumber}
          doneColor={theme.gridDone}
          onDayPress={onDayPress}
        />
      </View>

      <View style={styles.lockedRow}>
        {JOURNEY_PHASES.filter((p) => p.id !== activePhase.id).map((p) => (
          <View key={p.id} style={styles.lockedChip}>
            <Lock size={12} color={Colors.textTertiary} strokeWidth={2} />
            <Text style={styles.lockedChipText}>
              {localizeJourneyPhaseLabel(p.id as 1 | 2 | 3)}
            </Text>
          </View>
        ))}
      </View>

      <TouchableOpacity style={styles.cta} onPress={onUnlock} activeOpacity={0.85}>
        <CheckCircle2 size={18} color="#fff" strokeWidth={2} />
        <Text style={styles.ctaText}>{t("journey.mapTeaser.unlockCta")}</Text>
        <ChevronRight size={18} color="#fff" strokeWidth={2} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginBottom: Spacing.sm,
  },
  sectionLabel: {
    fontSize: 10,
    fontFamily: "Inter_700Bold",
    fontWeight: "700",
    letterSpacing: 1.2,
    color: Colors.textTertiary,
    marginBottom: 4,
    textTransform: "uppercase",
  },
  hint: {
    fontSize: FontSizes.xs,
    fontFamily: "Inter_400Regular",
    color: Colors.textTertiary,
    lineHeight: 16,
    marginBottom: 8,
  },
  phaseCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radii.card,
    padding: 12,
    borderWidth: 1.5,
    ...Shadows.soft,
  },
  phaseGlow: {
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 4,
  },
  badge: {
    alignSelf: "flex-start",
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: Radii.pill,
    marginBottom: 8,
  },
  badgeText: {
    fontSize: 10,
    fontFamily: "Inter_600SemiBold",
    fontWeight: "600",
  },
  phaseTitle: {
    fontSize: FontSizes.md,
    fontFamily: "Inter_600SemiBold",
    fontWeight: "600",
    color: Colors.textPrimary,
  },
  phaseRange: {
    fontSize: FontSizes.xs,
    color: Colors.textTertiary,
    marginTop: 2,
  },
  phaseSub: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    lineHeight: 20,
    marginTop: 6,
  },
  stats: {
    fontSize: FontSizes.xs,
    fontFamily: "Inter_500Medium",
    color: Colors.primaryDark,
    marginTop: 8,
  },
  lockedRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  lockedChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: Colors.surfaceMuted,
    borderRadius: Radii.pill,
  },
  lockedChipText: {
    fontSize: FontSizes.xs,
    color: Colors.textTertiary,
  },
  cta: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: Colors.primary,
    borderRadius: Radii.button,
    paddingVertical: 10,
    paddingHorizontal: Spacing.md,
  },
  ctaText: {
    fontSize: FontSizes.sm,
    fontFamily: "Inter_600SemiBold",
    fontWeight: "600",
    color: "#fff",
  },
});
