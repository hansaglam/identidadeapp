import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import { Colors, Spacing, Radii, FontSizes, Shadows } from "../constants/theme";
import { computeEngagementSummary, type EngagementSummary } from "../utils/engagementMetrics";

export default function CoachEngagementCard() {
  const [summary, setSummary] = useState<EngagementSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    void computeEngagementSummary().then((s) => {
      if (!cancelled) {
        setSummary(s);
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <View style={styles.card}>
        <ActivityIndicator color={Colors.primary} />
      </View>
    );
  }

  if (!summary) return null;

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Bu cihazdaki özet</Text>
      <Text style={styles.hint}>
        Gizlilik: yalnızca bu telefonda tutulur; kişisel metin içermez.
      </Text>
      <View style={styles.grid}>
        <Stat label="Check-in" value={String(summary.checkinCompleted)} />
        <Stat label="Adım tamam" value={String(summary.actionCompleted)} />
        <Stat label="Kapı: önce adım" value={String(summary.gateActionFirst)} />
        <Stat label="Kapı: atlandı" value={String(summary.gateSkipped)} />
      </View>
      {summary.actionBeforeCheckinRate != null ? (
        <Text style={styles.rateLine}>
          Check-in öncesi adım oranı (yaklaşık): %{summary.actionBeforeCheckinRate}
        </Text>
      ) : (
        <Text style={styles.rateLine}>Henüz yeterli check-in verisi yok.</Text>
      )}
      <Text style={styles.meta}>
        Oturum: {summary.dailySessions} · Bildirim tıklama: {summary.notificationTaps}
      </Text>
    </View>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginTop: 8,
    backgroundColor: Colors.surface,
    borderRadius: Radii.card,
    padding: Spacing.md,
    ...Shadows.soft,
  },
  title: {
    fontSize: FontSizes.sm,
    fontFamily: "Inter_600SemiBold",
    fontWeight: "600",
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  hint: {
    fontSize: FontSizes.xs,
    fontFamily: "Inter_400Regular",
    color: Colors.textTertiary,
    lineHeight: 17,
    marginBottom: Spacing.sm,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  stat: {
    width: "47%",
    backgroundColor: Colors.surfaceMuted,
    borderRadius: Radii.button,
    padding: 10,
    alignItems: "center",
  },
  statValue: {
    fontSize: FontSizes.lg,
    fontFamily: "Inter_700Bold",
    fontWeight: "700",
    color: Colors.primary,
  },
  statLabel: {
    fontSize: 10,
    fontFamily: "Inter_500Medium",
    color: Colors.textTertiary,
    marginTop: 2,
    textAlign: "center",
  },
  rateLine: {
    marginTop: Spacing.sm,
    fontSize: FontSizes.xs,
    fontFamily: "Inter_500Medium",
    color: Colors.textSecondary,
  },
  meta: {
    marginTop: 6,
    fontSize: 10,
    fontFamily: "Inter_400Regular",
    color: Colors.textTertiary,
  },
});
