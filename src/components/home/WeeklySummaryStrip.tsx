import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Check } from "lucide-react-native";
import { Colors, Spacing, Radii, FontSizes, Shadows } from "../../constants/theme";
import type { CalendarWeekDayCell } from "../../utils/journeyHome";

interface Props {
  weekCells: CalendarWeekDayCell[];
  calendarToday: string;
  weekDoneCount: number;
}

function barColor(cell: CalendarWeekDayCell, todayKey: string): string {
  if (cell.beforeJourney || cell.isFuture) return Colors.border;
  if (cell.completed) return cell.dateKey === todayKey ? Colors.primaryDark : Colors.primary;
  if (cell.dateKey === todayKey) return Colors.primaryDark;
  return Colors.border;
}

export default function WeeklySummaryStrip({ weekCells, calendarToday, weekDoneCount }: Props) {
  const pct = Math.round((weekDoneCount / 7) * 100);
  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>Haftalık özet</Text>
      <View style={styles.card}>
        <View style={styles.barsRow}>
          {weekCells.map((cell) => {
            const color = barColor(cell, calendarToday);
            const done = cell.completed && !cell.beforeJourney;
            return (
              <View key={cell.dateKey} style={styles.barCell}>
                {done ? (
                  <View style={[styles.checkCircle, { backgroundColor: color }]}>
                    <Check size={10} color="#fff" strokeWidth={3} />
                  </View>
                ) : (
                  <View style={[styles.bar, { backgroundColor: color }]} />
                )}
                <Text style={[styles.dayLabel, cell.dateKey === calendarToday && styles.dayLabelToday]}>
                  {cell.shortLabel}
                </Text>
              </View>
            );
          })}
        </View>
        <Text style={styles.metaLine}>Bu hafta {weekDoneCount}/7 tamamlandı</Text>
        <View style={styles.track}>
          <View style={[styles.fill, { width: `${pct}%` }]} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginHorizontal: Spacing.md,
    marginTop: Spacing.md,
    marginBottom: Spacing.lg,
    gap: 8,
  },
  title: {
    fontSize: FontSizes.xs,
    fontFamily: "Inter_600SemiBold",
    fontWeight: "600",
    letterSpacing: 0.6,
    textTransform: "uppercase",
    color: Colors.textTertiary,
    marginLeft: 2,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radii.card,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 4,
    ...Shadows.card,
  },
  barsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginTop: 8,
  },
  barCell: {
    width: 32,
    alignItems: "center",
    gap: 6,
  },
  bar: {
    width: 32,
    height: 8,
    borderRadius: 4,
  },
  checkCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
  },
  dayLabel: {
    fontSize: 10,
    fontFamily: "Inter_500Medium",
    color: Colors.textTertiary,
  },
  dayLabelToday: {
    color: Colors.primaryDark,
    fontFamily: "Inter_600SemiBold",
    fontWeight: "600",
  },
  metaLine: {
    marginTop: 14,
    fontSize: FontSizes.sm,
    fontFamily: "Inter_500Medium",
    color: Colors.textSecondary,
  },
  track: {
    marginTop: 8,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.border,
    overflow: "hidden",
  },
  fill: {
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.primary,
  },
});
