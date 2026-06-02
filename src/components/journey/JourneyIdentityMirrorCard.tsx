import React, { useMemo } from "react";
import { View, Text, StyleSheet } from "react-native";
import { Sparkles } from "lucide-react-native";
import { useMindDumpStore } from "../../store/mindDumpStore";
import { buildIdentityMirrorReport } from "../../utils/identityMirror";
import { Colors, Spacing, Radii, FontSizes, Shadows } from "../../constants/theme";

interface Props {
  startDate: string;
  habitName: string;
}

export default function JourneyIdentityMirrorCard({ startDate, habitName }: Props) {
  const entries = useMindDumpStore((s) => s.entries);

  const report = useMemo(
    () => buildIdentityMirrorReport(startDate, entries, habitName),
    [startDate, entries, habitName]
  );

  if (!report) {
    return (
      <View style={styles.card}>
        <View style={styles.header}>
          <Sparkles size={16} color={Colors.primary} strokeWidth={2} />
          <Text style={styles.title}>Kimlik Aynası</Text>
        </View>
        <Text style={styles.empty}>
          Zihin notlarından henüz yeterli sinyal yok. Birkaç satır yazdığında burada
          yolculuğunun dili yansır.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Sparkles size={16} color={Colors.primary} strokeWidth={2} />
        <Text style={styles.title}>Kimlik Aynası</Text>
      </View>
      <Text style={styles.body}>{report}</Text>
      <Text style={styles.foot}>
        Notlarından kural tabanlı özet — kişisel metin sunucuya gitmez.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radii.card,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: "rgba(47, 156, 134, 0.15)",
    ...Shadows.soft,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: Spacing.sm,
  },
  title: {
    fontSize: FontSizes.sm,
    fontFamily: "Inter_600SemiBold",
    fontWeight: "600",
    color: Colors.textPrimary,
  },
  body: {
    fontSize: FontSizes.sm,
    fontFamily: "Inter_400Regular",
    color: Colors.textSecondary,
    lineHeight: 22,
  },
  empty: {
    fontSize: FontSizes.sm,
    fontFamily: "Inter_400Regular",
    color: Colors.textTertiary,
    lineHeight: 20,
  },
  foot: {
    marginTop: Spacing.sm,
    fontSize: FontSizes.xs,
    fontFamily: "Inter_400Regular",
    color: Colors.textTertiary,
    lineHeight: 18,
  },
});
