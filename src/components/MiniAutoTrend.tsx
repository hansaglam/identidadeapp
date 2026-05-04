import React, { useMemo, useState, useCallback } from "react";
import { View, Text, StyleSheet, ScrollView, type LayoutChangeEvent } from "react-native";
import Svg, { Polyline, Circle, Line } from "react-native-svg";
import { Colors, Spacing, Radii, FontSizes } from "../constants/theme";
import type { AutomaticityChartPoint } from "../utils/automaticityChart";

const CHART_H = 40;
const PAD_X = 4;
const PAD_Y = 4;
const Y_MIN = 1;
const Y_MAX = 10;

function yAt(v: number, innerH: number): number {
  return PAD_Y + (1 - (v - Y_MIN) / (Y_MAX - Y_MIN)) * innerH;
}

function segmentColor(avgV: number): string {
  if (avgV >= 7) return Colors.primary;
  if (avgV >= 4) return "#E67E22";
  return Colors.coral;
}

export interface MiniAutoTrendProps {
  series: AutomaticityChartPoint[];
}

export default function MiniAutoTrend({ series }: MiniAutoTrendProps) {
  const innerH = CHART_H - PAD_Y * 2;
  const pts = useMemo(() => {
    const withIdx: { i: number; v: number }[] = [];
    series.forEach((p, i) => {
      if (p.value != null) withIdx.push({ i, v: p.value });
    });
    return withIdx;
  }, [series]);

  const hasData = pts.length > 0;

  const trendArrow = useMemo(() => {
    if (pts.length < 2) return "→";
    const a = pts[pts.length - 2]!.v;
    const b = pts[pts.length - 1]!.v;
    if (b > a + 0.5) return "↗";
    if (b < a - 0.5) return "↘";
    return "→";
  }, [pts]);

  const [plotW, setPlotW] = useState(140);

  const onLayout = useCallback((e: LayoutChangeEvent) => {
    const w = Math.round(e.nativeEvent.layout.width) - PAD_X * 2;
    if (w > 0) setPlotW(w);
  }, []);

  const n = Math.max(1, series.length - 1);

  const polylines = useMemo(() => {
    if (pts.length < 2) return [] as { points: string; color: string }[];
    const segs: { points: string; color: string }[] = [];
    for (let s = 0; s < pts.length - 1; s += 1) {
      const a = pts[s]!;
      const b = pts[s + 1]!;
      const avgV = (a.v + b.v) / 2;
      const x0 = PAD_X + (a.i / n) * plotW;
      const y0 = yAt(a.v, innerH);
      const x1 = PAD_X + (b.i / n) * plotW;
      const y1 = yAt(b.v, innerH);
      segs.push({
        points: `${x0},${y0} ${x1},${y1}`,
        color: segmentColor(avgV),
      });
    }
    return segs;
  }, [pts, plotW, n, innerH]);

  const vbW = plotW + PAD_X * 2;

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Son 7 gün · otomatiklik</Text>
        {hasData ? <Text style={styles.arrow}>{trendArrow}</Text> : null}
      </View>
      {!hasData ? (
        <Text style={styles.empty}>
          Henüz veri yok. Bugünkü check-in&apos;de değerlendirme yap — 10 saniye yeter.
        </Text>
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scrollInner}
        >
          <View style={{ minWidth: 180 }} onLayout={onLayout}>
            <Svg width={vbW} height={CHART_H} viewBox={`0 0 ${vbW} ${CHART_H}`}>
              {[4, 7].map((gv) => (
                <Line
                  key={gv}
                  x1={PAD_X}
                  y1={yAt(gv, innerH)}
                  x2={plotW + PAD_X}
                  y2={yAt(gv, innerH)}
                  stroke={Colors.border}
                  strokeWidth={1}
                  strokeDasharray="2,4"
                />
              ))}
              {polylines.map((seg, i) => (
                <Polyline
                  key={i}
                  points={seg.points}
                  fill="none"
                  stroke={seg.color}
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              ))}
              {pts.map((p) => (
                <Circle
                  key={`${p.i}-${p.v}`}
                  cx={PAD_X + (p.i / n) * plotW}
                  cy={yAt(p.v, innerH)}
                  r={3}
                  fill={segmentColor(p.v)}
                  stroke="#fff"
                  strokeWidth={1}
                />
              ))}
            </Svg>
          </View>
        </ScrollView>
      )}
      <Text style={styles.legend}>Yeşil: akıcı · Turuncu: orta · Kırmızı: zorlanma</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radii.card,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: Spacing.xs,
  },
  title: {
    fontSize: FontSizes.sm,
    fontFamily: "Inter_500Medium",
    color: Colors.textPrimary,
    flex: 1,
  },
  arrow: {
    fontSize: FontSizes.md,
    color: Colors.textSecondary,
    marginLeft: Spacing.sm,
  },
  empty: {
    fontSize: FontSizes.xs,
    fontFamily: "Inter_400Regular",
    color: Colors.textSecondary,
    lineHeight: 18,
    paddingVertical: Spacing.xs,
  },
  scrollInner: { paddingVertical: 2 },
  legend: {
    fontSize: 10,
    fontFamily: "Inter_400Regular",
    color: Colors.textTertiary,
    marginTop: 4,
  },
});
