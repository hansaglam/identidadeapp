import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Colors, Spacing, Radii, FontSizes } from "../constants/theme";

export interface ProfileStatsProps {
  /** Son 14 gün % */
  consistency14: number;
  /** 1-10, null = veri yok */
  averageAutomaticity: number | null;
  /** Son 14 günde 7+ kayıt oranı; null = değerlendirme yok */
  autoTrend14: number | null;
}

export default function ProfileStats({
  consistency14,
  averageAutomaticity,
  autoTrend14,
}: ProfileStatsProps) {
  return (
    <View style={styles.grid}>
      <View style={styles.card}>
        <Text style={styles.value}>{consistency14}%</Text>
        <Text style={styles.label}>Tutarlılık oranı</Text>
        <Text style={styles.hint}>(son 14 gün)</Text>
      </View>
      <View style={styles.card}>
        <Text style={styles.value}>
          {averageAutomaticity != null ? averageAutomaticity.toFixed(1) : "—"}
        </Text>
        <Text style={styles.label}>Ortalama otomatiklik</Text>
        <Text style={styles.hint}>(tüm değerlendirmeler)</Text>
      </View>
      <View style={styles.card}>
        <Text style={styles.value}>
          {autoTrend14 != null ? `${autoTrend14}%` : "—"}
        </Text>
        <Text style={styles.label}>Otomatiklik trendi</Text>
        <Text style={styles.hint}>(7+ puan, son 14 gün)</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: "row", gap: Spacing.sm, marginBottom: Spacing.md, flexWrap: "wrap" },
  card: {
    flex: 1,
    minWidth: 100,
    backgroundColor: Colors.surface,
    borderRadius: Radii.card,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.md,
    alignItems: "center",
  },
  value: { fontSize: FontSizes.xl, fontFamily: "Inter_500Medium", color: Colors.textPrimary },
  label: {
    fontSize: FontSizes.xs,
    fontFamily: "Inter_500Medium",
    color: Colors.textSecondary,
    textAlign: "center",
    marginTop: 4,
  },
  hint: { fontSize: 10, fontFamily: "Inter_400Regular", color: Colors.textTertiary, marginTop: 2, textAlign: "center" },
});
