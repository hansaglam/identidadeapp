import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Colors, Radii, Spacing, FontSizes, JOURNEY_PHASES, Shadows } from "../constants/theme";
import {
  PHASE_ONE_IDEA,
  phaseIdFromDay,
} from "../constants/purposeCopy";

interface Props {
  dayNumber: number;
}

/** Faz başına tek paragraf “bu fazın fikri” — amaç hissiyatı */
export default function PhasePurposeCard({ dayNumber }: Props) {
  const phaseId = phaseIdFromDay(dayNumber);
  const phase = JOURNEY_PHASES.find((p) => p.id === phaseId)!;
  const idea = PHASE_ONE_IDEA[phaseId];

  return (
    <View style={[styles.card, { borderLeftColor: phase.color }]}>
      <Text style={[styles.kicker, { color: phase.color }]}>
        {phase.label} · Bu fazın tek fikri
      </Text>
      <Text style={styles.phaseMeta}>
        Gün {dayNumber}/66 · {phase.days}
      </Text>
      <Text style={styles.body}>{idea}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radii.card,
    borderWidth: 1,
    borderColor: Colors.border,
    borderLeftWidth: 3,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    ...Shadows.soft,
  },
  kicker: {
    fontSize: FontSizes.sm,
    fontFamily: "Inter_500Medium",
    letterSpacing: 0.3,
    marginBottom: 4,
  },
  phaseMeta: {
    fontSize: FontSizes.xs,
    fontFamily: "Inter_400Regular",
    color: Colors.textTertiary,
    marginBottom: Spacing.sm,
  },
  body: {
    fontSize: FontSizes.sm,
    fontFamily: "Inter_400Regular",
    color: Colors.textSecondary,
    lineHeight: 21,
  },
});
