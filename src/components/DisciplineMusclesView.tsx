import React, { useMemo } from "react";
import { View, Text, StyleSheet } from "react-native";
import { Colors, Spacing, Radii, FontSizes } from "../constants/theme";
import { MUSCLE_NAMES, DisciplineMuscles } from "../types/discipline";

const KEYS: (keyof DisciplineMuscles)[] = [
  "karar", "direnc", "baglam", "energi", "sosyal",
];

export interface DisciplineMusclesViewProps {
  muscles: DisciplineMuscles;
  xp: DisciplineMuscles;
}

export default function DisciplineMusclesView({ muscles, xp }: DisciplineMusclesViewProps) {
  const weakest = useMemo(() => {
    let k: keyof DisciplineMuscles = "karar";
    let min = Infinity;
    KEYS.forEach((key) => {
      if (muscles[key] < min) {
        min = muscles[key];
        k = key;
      }
    });
    return k;
  }, [muscles]);

  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>Disiplin kasları</Text>
      {KEYS.map((key) => {
        const pct = Math.min(1, (xp[key] % 100) / 100);
        return (
          <View key={key} style={styles.row}>
            <View style={styles.rowTop}>
              <Text style={styles.muscleName}>{MUSCLE_NAMES[key]}</Text>
              <Text style={styles.lv}>Lv. {muscles[key]}</Text>
            </View>
            <View style={styles.track}>
              <View style={[styles.fill, { width: `${Math.max(0.04, pct) * 100}%` }]} />
            </View>
          </View>
        );
      })}
      <View style={styles.tipBox}>
        <Text style={styles.tipText}>
          💡 {MUSCLE_NAMES[weakest]} en zayıf kasın. Sonraki antrenmanlar bu yönde
          ağırlık kazanabilir.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: Colors.surface,
    borderRadius: Radii.card,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    gap: Spacing.md,
  },
  title: {
    fontSize: FontSizes.md,
    fontFamily: "Inter_500Medium",
    color: Colors.textPrimary,
  },
  row: { gap: 4 },
  rowTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  muscleName: { fontSize: FontSizes.sm, color: Colors.textPrimary, fontFamily: "Inter_400Regular" },
  lv: { fontSize: FontSizes.xs, color: Colors.textTertiary, fontFamily: "Inter_500Medium" },
  track: {
    height: 5,
    backgroundColor: Colors.border,
    borderRadius: Radii.full,
    overflow: "hidden",
  },
  fill: { height: "100%", backgroundColor: "#3498db", borderRadius: Radii.full, minWidth: 4 },
  tipBox: {
    backgroundColor: Colors.goldLight,
    borderRadius: Radii.button,
    padding: Spacing.md,
  },
  tipText: { fontSize: FontSizes.xs, color: Colors.textPrimary, lineHeight: 18 },
});
