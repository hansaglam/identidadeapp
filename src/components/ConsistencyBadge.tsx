import React, { useMemo } from "react";
import { View, Text, StyleSheet } from "react-native";
import { Colors, Spacing, Radii, FontSizes, Shadows } from "../constants/theme";

const WINDOW = 14;

export interface ConsistencyBadgeProps {
  last14Days: { completed: boolean; dayNumber: number }[];
}

function normalize14(
  items: { completed: boolean; dayNumber: number }[]
): { completed: boolean; dayNumber: number }[] {
  if (items.length >= WINDOW) {
    return items.slice(-WINDOW);
  }
  const pad: { completed: boolean; dayNumber: number }[] = [];
  for (let i = 0; i < WINDOW - items.length; i += 1) {
    pad.push({ completed: false, dayNumber: 0 });
  }
  return [...pad, ...items];
}

/**
 * Streak yerine: son 14 gün tutarlılık yüzdesi + 14 nokta görseli.
 */
export default function ConsistencyBadge({ last14Days }: ConsistencyBadgeProps) {
  const days = useMemo(() => normalize14(last14Days), [last14Days]);
  const doneCount = useMemo(
    () => days.filter((d) => d.completed).length,
    [days]
  );
  const pct = useMemo(
    () => (WINDOW > 0 ? Math.round((doneCount / WINDOW) * 100) : 0),
    [doneCount]
  );
  const strong = pct >= 70;
  const accent = strong ? Colors.primary : Colors.gold;

  return (
    <View
      style={[
        styles.card,
        { borderLeftColor: accent },
        Shadows.card,
      ]}
    >
      <View style={styles.headerRow}>
        <Text style={[styles.percentBadge, { color: accent }]}>%{pct}</Text>
        <Text style={[styles.badgeLabel, { color: Colors.textSecondary }]}>
          tutarlılık
        </Text>
      </View>

      <Text style={styles.title}>
        {`Son 14 günden ${doneCount}'inde yaptın`}
      </Text>

      <Text style={styles.hint}>
        Tutarlılık &gt; mükemmellik. 1 gün kaçırmak süreci durdurmaz.
      </Text>

      <View style={styles.dotsRow}>
        {days.map((d, i) => (
          <View
            key={`${d.dayNumber}-${i}`}
            style={[
              styles.dot,
              d.completed ? [styles.dotOn, { backgroundColor: accent }] : styles.dotOff,
            ]}
            accessibilityLabel={d.completed ? "Tamamlandı" : "Yok"}
          />
        ))}
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
    borderLeftWidth: 4,
    padding: Spacing.lg,
    gap: Spacing.xs,
    marginBottom: Spacing.lg,
  },
  headerRow: { flexDirection: "row", alignItems: "baseline", gap: 8 },
  percentBadge: {
    fontSize: FontSizes.xl,
    fontFamily: "Inter_500Medium",
    letterSpacing: -0.5,
  },
  badgeLabel: {
    fontSize: FontSizes.sm,
    fontFamily: "Inter_400Regular",
  },
  title: {
    fontSize: FontSizes.sm,
    fontFamily: "Inter_500Medium",
    color: Colors.textPrimary,
    marginTop: Spacing.sm,
    lineHeight: 20,
  },
  hint: {
    fontSize: FontSizes.xs,
    fontFamily: "Inter_400Regular",
    color: Colors.textTertiary,
    lineHeight: 18,
    marginTop: 4,
    marginBottom: Spacing.sm,
  },
  dotsRow: {
    flexDirection: "row",
    flexWrap: "nowrap",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: Spacing.xs,
  },
  dot: { width: 6, height: 6, borderRadius: 3 },
  dotOn: {},
  dotOff: { backgroundColor: "rgba(20, 32, 48, 0.12)" },
});
