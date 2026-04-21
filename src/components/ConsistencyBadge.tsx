import React, { useMemo } from "react";
import { View, Text, StyleSheet } from "react-native";
import { Colors, Spacing, Radii, FontSizes } from "../constants/theme";

const ORANGE = "#f39c12";
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

  return (
    <View
      style={[
        styles.card,
        { borderColor: strong ? Colors.primary : ORANGE, backgroundColor: strong ? Colors.primaryLight : "rgba(243, 156, 18, 0.10)" },
      ]}
    >
      <View style={styles.headerRow}>
        <Text style={[styles.percentBadge, { color: strong ? Colors.primary : ORANGE }]}>
          %{pct}
        </Text>
        <Text style={[styles.badgeLabel, { color: strong ? Colors.primaryDark : ORANGE }]}>
          tutarlılık
        </Text>
      </View>

      <Text style={styles.title}>
        {`Son 14 günden ${doneCount}'inde yaptın`}
      </Text>

      <Text style={styles.hint}>
        Tutarlılık &gt; Mükemmellik. 1 gün kaçırmak süreci durdurmaz.
      </Text>

      <View style={styles.dotsRow}>
        {days.map((d, i) => (
          <View
            key={`${d.dayNumber}-${i}`}
            style={[styles.dot, d.completed ? styles.dotOn : styles.dotOff]}
            accessibilityLabel={d.completed ? "Tamamlandı" : "Yok"}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: Radii.card,
    borderWidth: 1.5,
    padding: Spacing.md,
    gap: Spacing.xs,
  },
  headerRow: { flexDirection: "row", alignItems: "baseline", gap: 6 },
  percentBadge: {
    fontSize: FontSizes.xxl,
    fontFamily: "Inter_500Medium",
  },
  badgeLabel: {
    fontSize: FontSizes.lg,
    fontFamily: "Inter_500Medium",
  },
  title: {
    fontSize: FontSizes.md,
    fontFamily: "Inter_500Medium",
    color: Colors.textPrimary,
    marginTop: Spacing.xs,
  },
  hint: {
    fontSize: FontSizes.xs,
    fontFamily: "Inter_400Regular",
    color: Colors.textTertiary,
    fontStyle: "italic",
    lineHeight: 18,
    marginTop: Spacing.xs,
    marginBottom: Spacing.xs,
  },
  dotsRow: {
    flexDirection: "row",
    flexWrap: "nowrap",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: Spacing.xs,
  },
  dot: { width: 6, height: 6, borderRadius: 3 },
  dotOn: { backgroundColor: Colors.primary },
  dotOff: { backgroundColor: Colors.borderStrong },
});
