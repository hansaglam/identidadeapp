import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Shield } from "lucide-react-native";
import { useTranslation } from "react-i18next";
import { Colors, Spacing, Radii, FontSizes, Shadows } from "../../constants/theme";
import type { ResilienceStats } from "../../utils/resilienceStats";

export interface ResilienceCardProps {
  stats: ResilienceStats;
  compact?: boolean;
}

export default function ResilienceCard({ stats, compact = false }: ResilienceCardProps) {
  const { t } = useTranslation();

  if (stats.status === "untested") {
    return (
      <View style={[styles.card, compact && styles.cardCompact]}>
        <View style={styles.headerRow}>
          <View style={styles.iconWrap}>
            <Shield size={compact ? 16 : 18} color={Colors.primary} strokeWidth={2} />
          </View>
          <Text style={[styles.title, compact && styles.titleCompact]}>
            {t("growth.resilience.title")}
          </Text>
        </View>
        <Text style={[styles.rateUntested, compact && styles.rateUntestedCompact]}>
          {t("growth.resilience.untestedHeadline")}
        </Text>
        <Text style={styles.subSuccess}>{t("growth.resilience.untestedSub")}</Text>
      </View>
    );
  }

  return (
    <View style={[styles.card, compact && styles.cardCompact]}>
      <View style={styles.headerRow}>
        <View style={styles.iconWrap}>
          <Shield size={compact ? 16 : 18} color={Colors.primary} strokeWidth={2} />
        </View>
        <Text style={[styles.title, compact && styles.titleCompact]}>
          {t("growth.resilience.title")}
        </Text>
      </View>

      <Text style={[styles.rateBig, compact && styles.rateBigCompact]}>
        {t("growth.resilience.rateValue", { pct: stats.comebackRate ?? 0 })}
      </Text>

      <Text style={styles.subSuccess}>
        {t("growth.resilience.comebacks", { count: stats.comebacks })}
      </Text>

      <Text style={styles.fallsCaption}>
        {t("growth.resilience.fallsCaption", { count: stats.falls })}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radii.card,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.md,
    ...Shadows.soft,
  },
  cardCompact: {
    marginBottom: Spacing.sm,
    padding: Spacing.sm + 4,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  iconWrap: {
    width: 32,
    height: 32,
    borderRadius: Radii.button,
    backgroundColor: "rgba(16, 185, 129, 0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: FontSizes.sm,
    fontFamily: "Inter_600SemiBold",
    fontWeight: "600",
    color: Colors.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  titleCompact: {
    fontSize: FontSizes.xs,
  },
  rateUntested: {
    fontSize: FontSizes.lg,
    fontFamily: "Inter_600SemiBold",
    fontWeight: "600",
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  rateUntestedCompact: {
    fontSize: FontSizes.md,
  },
  rateBig: {
    fontSize: 36,
    fontFamily: "Inter_700Bold",
    fontWeight: "700",
    color: Colors.primary,
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  rateBigCompact: {
    fontSize: 28,
  },
  subSuccess: {
    fontSize: FontSizes.md,
    fontFamily: "Inter_500Medium",
    fontWeight: "500",
    color: Colors.textPrimary,
    marginBottom: 6,
  },
  fallsCaption: {
    fontSize: FontSizes.xs,
    fontFamily: "Inter_400Regular",
    color: Colors.textTertiary,
  },
});
