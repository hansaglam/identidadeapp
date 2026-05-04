/**
 * GoalProgressCard — 66 günlük yolculuk özeti.
 *
 * - Tahmini bitiş tarihi
 * - Faz göstergesi (Kuruluş / Pekiştirme / Otomatikleşme)
 * - Görsel ilerleme barı (faz renkli segmentler)
 */

import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { addDays, format, parseISO } from "date-fns";
import { tr } from "date-fns/locale";
import { Colors, FontSizes, Radii, Spacing } from "../constants/theme";

interface Props {
  dayNumber: number;
  startDate: string;
}

const PHASES = [
  { label: "Kuruluş", start: 1, end: 22, color: Colors.primary },
  { label: "Pekiştirme", start: 23, end: 44, color: Colors.purple },
  { label: "Otomatikleşme", start: 45, end: 66, color: Colors.coral },
] as const;

function currentPhase(day: number) {
  return PHASES.find((p) => day >= p.start && day <= p.end) ?? PHASES[2];
}

export default function GoalProgressCard({ dayNumber, startDate }: Props) {
  const progress = Math.min(dayNumber / 66, 1);
  const phase = currentPhase(dayNumber);
  const daysLeft = Math.max(66 - dayNumber, 0);
  const finishDate = addDays(parseISO(startDate), 65);
  const finishStr = format(finishDate, "d MMMM yyyy", { locale: tr });

  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.label}>66 Günlük Yolculuk</Text>
          <Text style={styles.dayCount}>
            {dayNumber} / 66 gün
          </Text>
        </View>
        <View style={[styles.phasePill, { backgroundColor: phase.color + "22" }]}>
          <Text style={[styles.phaseText, { color: phase.color }]}>
            {phase.label}
          </Text>
        </View>
      </View>

      {/* Segmented progress bar */}
      <View style={styles.barTrack}>
        {PHASES.map((p) => {
          const segTotal = p.end - p.start + 1;
          const filled = Math.max(0, Math.min(dayNumber - p.start + 1, segTotal));
          const fillRatio = filled / segTotal;
          const segWidth = segTotal / 66;
          return (
            <View
              key={p.label}
              style={[styles.barSegment, { flex: segTotal }]}
            >
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

      {/* Phase labels */}
      <View style={styles.phaseLabels}>
        {PHASES.map((p) => (
          <Text
            key={p.label}
            style={[
              styles.phaseLabelText,
              dayNumber >= p.start && { color: p.color },
            ]}
          >
            G{p.start}
          </Text>
        ))}
        <Text style={styles.phaseLabelText}>G66</Text>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        {daysLeft > 0 ? (
          <>
            <Text style={styles.footerLeft}>
              <Text style={styles.footerEmphasis}>{daysLeft} gün</Text> kaldı
            </Text>
            <Text style={styles.footerRight}>Hedef: {finishStr}</Text>
          </>
        ) : (
          <Text style={[styles.footerLeft, { color: Colors.primary }]}>
            🎯 66 gün tamamlandı. Bu artık kim olduğunun bir parçası.
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radii.card,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.lg,
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  label: {
    fontSize: FontSizes.xs,
    fontFamily: "Inter_500Medium",
    color: Colors.textTertiary,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 2,
  },
  dayCount: {
    fontSize: FontSizes.xl,
    fontFamily: "Inter_500Medium",
    color: Colors.textPrimary,
  },
  phasePill: {
    borderRadius: Radii.pill,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  phaseText: {
    fontSize: FontSizes.xs,
    fontFamily: "Inter_500Medium",
  },
  barTrack: {
    height: 6,
    flexDirection: "row",
    gap: 3,
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
    marginTop: -Spacing.xs,
  },
  phaseLabelText: {
    fontSize: FontSizes.xs,
    fontFamily: "Inter_400Regular",
    color: Colors.textTertiary,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: Spacing.sm,
    marginTop: -Spacing.xs,
  },
  footerLeft: {
    fontSize: FontSizes.sm,
    fontFamily: "Inter_400Regular",
    color: Colors.textSecondary,
  },
  footerEmphasis: {
    fontFamily: "Inter_500Medium",
    color: Colors.textPrimary,
  },
  footerRight: {
    fontSize: FontSizes.xs,
    fontFamily: "Inter_400Regular",
    color: Colors.textTertiary,
  },
});
