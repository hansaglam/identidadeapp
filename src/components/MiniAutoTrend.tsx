import React, { useMemo } from "react";
import { View, Text, StyleSheet } from "react-native";
import { format, parseISO, isToday } from "date-fns";
import { TrendingDown, TrendingUp, Minus } from "lucide-react-native";
import { Colors, Spacing, Radii, FontSizes } from "../constants/theme";
import { useTranslation } from "react-i18next";
import { getDateFnsLocale } from "../utils/dateFnsLocale";
import type { AutomaticityChartPoint } from "../utils/automaticityChart";

const BAR_MAX = 32;
const BAR_MIN = 4;

function valueColor(v: number): string {
  if (v >= 7) return Colors.primary;
  if (v >= 4) return "#E67E22";
  return Colors.coral;
}

function valueBand(v: number): "fluent" | "medium" | "hard" {
  if (v >= 7) return "fluent";
  if (v >= 4) return "medium";
  return "hard";
}

type Trend = "up" | "down" | "flat";

function computeTrend(pts: { v: number }[]): Trend {
  if (pts.length < 2) return "flat";
  const a = pts[pts.length - 2]!.v;
  const b = pts[pts.length - 1]!.v;
  if (b > a + 0.4) return "up";
  if (b < a - 0.4) return "down";
  return "flat";
}

export interface MiniAutoTrendProps {
  series: AutomaticityChartPoint[];
}

export default function MiniAutoTrend({ series }: MiniAutoTrendProps) {
  const { t } = useTranslation();
  const locale = getDateFnsLocale();

  const rated = useMemo(
    () => series.filter((p) => p.value != null) as (AutomaticityChartPoint & { value: number })[],
    [series]
  );

  const avg = useMemo(() => {
    if (!rated.length) return null;
    const sum = rated.reduce((s, p) => s + p.value, 0);
    return Math.round((sum / rated.length) * 10) / 10;
  }, [rated]);

  const trend = useMemo(() => computeTrend(rated.map((p) => ({ v: p.value }))), [rated]);
  const lastScore = rated.length ? rated[rated.length - 1]!.value : null;
  const dominantBand = useMemo(() => {
    if (!lastScore) return null;
    return valueBand(lastScore);
  }, [lastScore]);

  const hasData = rated.length > 0;

  if (!hasData) {
    return (
      <View style={styles.card}>
        <Text style={styles.title}>{t("home.autoTrend.title")}</Text>
        <Text style={styles.empty}>{t("home.autoTrend.empty")}</Text>
      </View>
    );
  }

  const TrendIcon =
    trend === "up" ? TrendingUp : trend === "down" ? TrendingDown : Minus;

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View style={styles.headerLeft}>
          <Text style={styles.title}>{t("home.autoTrend.title")}</Text>
          <Text style={styles.sub}>
            {t("home.autoTrend.daysRecorded", { count: rated.length, total: series.length })}
          </Text>
        </View>
        <View style={styles.scoreBadge}>
          <Text style={styles.scoreValue}>
            {t("home.autoTrend.avgScore", { value: avg?.toFixed(1) ?? "—" })}
          </Text>
          <View style={[styles.trendPill, trend === "up" && styles.trendUp, trend === "down" && styles.trendDown]}>
            <TrendIcon
              size={11}
              color={trend === "up" ? Colors.primaryDark : trend === "down" ? Colors.coral : Colors.textTertiary}
              strokeWidth={2.5}
            />
            <Text
              style={[
                styles.trendText,
                trend === "up" && styles.trendTextUp,
                trend === "down" && styles.trendTextDown,
              ]}
            >
              {t(`home.autoTrend.trend.${trend}`)}
            </Text>
          </View>
        </View>
      </View>

      {dominantBand && lastScore != null ? (
        <Text style={styles.insight}>
          {t(`home.autoTrend.insight.${dominantBand}`, { score: lastScore })}
        </Text>
      ) : null}

      <View style={styles.barsRow}>
        {series.map((p) => {
          const hasVal = p.value != null;
          const h = hasVal
            ? Math.max(BAR_MIN, (p.value! / 10) * BAR_MAX)
            : BAR_MIN;
          const today = isToday(parseISO(p.dateKey));
          const dayLabel = format(parseISO(p.dateKey), "EEEEE", { locale });
          return (
            <View key={p.dateKey} style={styles.barCell}>
              <View style={styles.barTrack}>
                <View
                  style={[
                    styles.barFill,
                    {
                      height: h,
                      backgroundColor: hasVal ? valueColor(p.value!) : Colors.border,
                      opacity: hasVal ? 1 : 0.35,
                    },
                    today && styles.barToday,
                  ]}
                />
              </View>
              <Text style={[styles.dayLabel, today && styles.dayLabelToday]}>{dayLabel}</Text>
            </View>
          );
        })}
      </View>

      <View style={styles.legendRow}>
        {(["fluent", "medium", "hard"] as const).map((band) => (
          <View key={band} style={styles.legendItem}>
            <View
              style={[
                styles.legendDot,
                {
                  backgroundColor:
                    band === "fluent" ? Colors.primary : band === "medium" ? "#E67E22" : Colors.coral,
                },
              ]}
            />
            <Text style={styles.legendText}>{t(`home.autoTrend.legend.${band}`)}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radii.button,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.border,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.sm,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: Spacing.sm,
    marginBottom: 6,
  },
  headerLeft: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    fontSize: FontSizes.xs,
    fontFamily: "Inter_600SemiBold",
    fontWeight: "600",
    color: Colors.textPrimary,
    letterSpacing: 0.2,
  },
  sub: {
    marginTop: 2,
    fontSize: 10,
    fontFamily: "Inter_400Regular",
    color: Colors.textTertiary,
  },
  scoreBadge: {
    alignItems: "flex-end",
    gap: 4,
  },
  scoreValue: {
    fontSize: FontSizes.md,
    fontFamily: "Inter_600SemiBold",
    fontWeight: "600",
    color: Colors.primaryDark,
  },
  trendPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: Radii.pill,
    backgroundColor: Colors.surfaceMuted,
  },
  trendUp: {
    backgroundColor: Colors.primaryLight,
  },
  trendDown: {
    backgroundColor: Colors.coralLight,
  },
  trendText: {
    fontSize: 10,
    fontFamily: "Inter_500Medium",
    color: Colors.textTertiary,
  },
  trendTextUp: {
    color: Colors.primaryDark,
  },
  trendTextDown: {
    color: Colors.coral,
  },
  insight: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    color: Colors.textSecondary,
    lineHeight: 16,
    marginBottom: 8,
  },
  empty: {
    marginTop: 6,
    fontSize: FontSizes.xs,
    fontFamily: "Inter_400Regular",
    color: Colors.textSecondary,
    lineHeight: 17,
  },
  barsRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 4,
    height: BAR_MAX + 18,
  },
  barCell: {
    flex: 1,
    alignItems: "center",
    minWidth: 0,
  },
  barTrack: {
    width: "100%",
    maxWidth: 28,
    height: BAR_MAX,
    justifyContent: "flex-end",
    alignItems: "center",
  },
  barFill: {
    width: "72%",
    minWidth: 6,
    borderRadius: 4,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },
  barToday: {
    borderWidth: 1,
    borderColor: Colors.primaryDark,
  },
  dayLabel: {
    marginTop: 4,
    fontSize: 9,
    fontFamily: "Inter_500Medium",
    color: Colors.textTertiary,
    textTransform: "uppercase",
  },
  dayLabelToday: {
    color: Colors.primaryDark,
    fontFamily: "Inter_600SemiBold",
    fontWeight: "600",
  },
  legendRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 8,
    paddingTop: 6,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Colors.border,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  legendDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  legendText: {
    fontSize: 10,
    fontFamily: "Inter_400Regular",
    color: Colors.textTertiary,
  },
});
