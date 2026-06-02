import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Lightbulb } from "lucide-react-native";
import { Colors, Spacing, Radii, FontSizes, Shadows } from "../../constants/theme";
import { getDailyPrinciple, getCoachNote } from "../../constants/identity-copy";
import { phaseIdFromDay } from "../../constants/journeyPhaseEducation";

const PHASE_LABELS: Record<1 | 2 | 3, string> = {
  1: "Kuruluş",
  2: "Pekiştirme",
  3: "Otomatikleşme",
};

interface Props {
  dayNumber: number;
}

export default function DailyCoachCard({ dayNumber }: Props) {
  const principle = getDailyPrinciple(dayNumber);
  const milestone = getCoachNote(dayNumber);
  const phaseId = (principle?.phaseId ?? phaseIdFromDay(dayNumber)) as 1 | 2 | 3;

  if (!principle && !milestone) return null;

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.iconWrap}>
          <Lightbulb size={16} color={Colors.primary} strokeWidth={2} />
        </View>
        <View style={styles.headerText}>
          <Text style={styles.kicker}>Gün {dayNumber} · {PHASE_LABELS[phaseId]}</Text>
          <Text style={styles.title}>Bugünün ilkesi</Text>
        </View>
      </View>
      {principle ? (
        <Text style={styles.body}>{principle.principle}</Text>
      ) : null}
      {milestone ? (
        <View style={styles.milestoneWrap}>
          <Text style={styles.milestoneLabel}>Kilometre taşı</Text>
          <Text style={styles.milestoneBody}>{milestone}</Text>
        </View>
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
    borderColor: "rgba(47, 156, 134, 0.12)",
    ...Shadows.soft,
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  iconWrap: {
    width: 32,
    height: 32,
    borderRadius: Radii.button,
    backgroundColor: Colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },
  headerText: { flex: 1 },
  kicker: {
    fontSize: FontSizes.xs,
    fontFamily: "Inter_600SemiBold",
    fontWeight: "600",
    color: Colors.primary,
    letterSpacing: 0.4,
    textTransform: "uppercase",
  },
  title: {
    fontSize: FontSizes.md,
    fontFamily: "Inter_600SemiBold",
    fontWeight: "600",
    color: Colors.textPrimary,
    marginTop: 2,
  },
  body: {
    fontSize: FontSizes.sm,
    fontFamily: "Inter_400Regular",
    color: Colors.textSecondary,
    lineHeight: 22,
  },
  milestoneWrap: {
    marginTop: Spacing.sm,
    paddingTop: Spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Colors.border,
  },
  milestoneLabel: {
    fontSize: FontSizes.xs,
    fontFamily: "Inter_600SemiBold",
    fontWeight: "600",
    color: Colors.textTertiary,
    marginBottom: 4,
  },
  milestoneBody: {
    fontSize: FontSizes.sm,
    fontFamily: "Inter_500Medium",
    color: Colors.textPrimary,
    lineHeight: 20,
  },
});
