import React, { useMemo, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  useWindowDimensions,
  type LayoutChangeEvent,
} from "react-native";
import Svg, {
  Path,
  Defs,
  LinearGradient,
  Stop,
  Line,
  Circle,
} from "react-native-svg";
import { Colors, Spacing, Radii, FontSizes } from "../constants/theme";
import type { AutomaticityChartPoint } from "../utils/automaticityChart";

const CHART_HEIGHT = 160;
const PLOT_TOP = 12;
const PLOT_BOTTOM = 20;
const PLOT_LEFT = 28;
const PLOT_RIGHT = 6;
/** yAxis width + marginRight — SVG must not use full row width */
const Y_AXIS_STRIP_W = 22 + 4;
const Y_MIN = 1;
const Y_MAX = 10;

function parseHex(hex: string): { r: number; g: number; b: number } {
  const h = hex.replace("#", "");
  return {
    r: parseInt(h.slice(0, 2), 16),
    g: parseInt(h.slice(2, 4), 16),
    b: parseInt(h.slice(4, 6), 16),
  };
}

function valueToColor(v: number): string {
  const t = Math.min(1, Math.max(0, (v - Y_MIN) / (Y_MAX - Y_MIN)));
  const a = parseHex(Colors.coral);
  const b = parseHex(Colors.primary);
  const r = Math.round(a.r + (b.r - a.r) * t);
  const g = Math.round(a.g + (b.g - a.g) * t);
  const bl = Math.round(a.b + (b.b - a.b) * t);
  return `rgb(${r},${g},${bl})`;
}

function yPixel(v: number, innerH: number): number {
  return PLOT_TOP + (1 - (v - Y_MIN) / (Y_MAX - Y_MIN)) * innerH;
}

interface Props {
  series: AutomaticityChartPoint[];
  title?: string;
  subtitle?: string;
}

export default function AutomaticityTrendChart({
  series,
  title = "Otomatiklik eğrisi",
  subtitle = "Son 30 gün · değerlendirme günleri",
}: Props) {
  const { width: winW } = useWindowDimensions();
  const cardInnerW = Math.min(winW - Spacing.lg * 2, 400);
  /** Row içi içerik genişliği (kart yatay padding sonrası) */
  const rowContentW = cardInnerW - Spacing.md * 2;
  const fallbackSvgW = Math.max(120, rowContentW - Y_AXIS_STRIP_W);
  const [measuredSvgW, setMeasuredSvgW] = useState(0);
  const chartW = measuredSvgW > 0 ? measuredSvgW : fallbackSvgW;
  const onSvgWrapLayout = useCallback((e: LayoutChangeEvent) => {
    const w = Math.round(e.nativeEvent.layout.width);
    if (w > 0) setMeasuredSvgW((prev) => (prev === w ? prev : w));
  }, []);
  const innerH = CHART_HEIGHT - PLOT_TOP - PLOT_BOTTOM;
  const plotW = Math.max(1, chartW - PLOT_LEFT - PLOT_RIGHT);
  const n = series.length;

  const { linePath, fillPath, dots, xTickIndices } = useMemo(() => {
    if (n < 2) {
      return {
        linePath: "",
        fillPath: "",
        dots: [] as { cx: number; cy: number; fill: string }[],
        xTickIndices: [] as number[],
      };
    }

    const xAt = (i: number) => PLOT_LEFT + (i / (n - 1)) * plotW;

    const segments: { i: number; v: number }[][] = [];
    let cur: { i: number; v: number }[] = [];
    series.forEach((p, i) => {
      if (p.value != null) {
        cur.push({ i, v: p.value });
      } else if (cur.length) {
        segments.push(cur);
        cur = [];
      }
    });
    if (cur.length) segments.push(cur);

    let lineD = "";
    let fillD = "";
    const dotList: { cx: number; cy: number; fill: string }[] = [];
    const baseline = PLOT_TOP + innerH;

    segments.forEach((seg) => {
      seg.forEach((pt, idx) => {
        const x = xAt(pt.i);
        const y = yPixel(pt.v, innerH);
        const col = valueToColor(pt.v);
        dotList.push({ cx: x, cy: y, fill: col });
        if (idx === 0) lineD += `M ${x} ${y} `;
        else lineD += `L ${x} ${y} `;
      });
      if (seg.length === 1) {
        const x = xAt(seg[0].i);
        const y = yPixel(seg[0].v, innerH);
        lineD += `L ${x + 0.5} ${y} `;
      }
      if (seg.length >= 2) {
        const x0 = xAt(seg[0].i);
        const y0 = yPixel(seg[0].v, innerH);
        const x1 = xAt(seg[seg.length - 1].i);
        fillD += `M ${x0} ${baseline} L ${x0} ${y0} `;
        for (let k = 1; k < seg.length; k += 1) {
          fillD += `L ${xAt(seg[k].i)} ${yPixel(seg[k].v, innerH)} `;
        }
        fillD += `L ${x1} ${baseline} Z `;
      }
    });

    const ticks: number[] = [];
    const step = Math.max(1, Math.floor((n - 1) / 4));
    for (let i = 0; i < n; i += step) ticks.push(i);
    if (ticks[ticks.length - 1] !== n - 1) ticks.push(n - 1);

    return {
      linePath: lineD.trim(),
      fillPath: fillD.trim(),
      dots: dotList,
      xTickIndices: ticks,
    };
  }, [series, n, plotW, innerH]);

  const hasData = series.some((p) => p.value != null);
  const yTicks = [10, 7, 4, 1];

  return (
    <View style={[styles.card, { maxWidth: cardInnerW, alignSelf: "center" }]}>
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>
        </View>
      </View>

      {!hasData ? (
        <Text style={styles.empty}>
          Check-in sonrası otomatiklik puanı verdiğinde eğri burada görünür.
        </Text>
      ) : (
        <>
          <View style={styles.chartRow}>
            <View style={[styles.yAxis, { height: CHART_HEIGHT }]}>
              {yTicks.map((yv) => (
                <Text
                  key={yv}
                  style={[
                    styles.yTick,
                    { top: yPixel(yv, innerH) - 6 },
                  ]}
                >
                  {yv}
                </Text>
              ))}
            </View>
            <View style={styles.svgWrap} onLayout={onSvgWrapLayout}>
              <Svg width={chartW} height={CHART_HEIGHT}>
                <Defs>
                  <LinearGradient id="autoFillGrad" x1="0" y1="0" x2="0" y2="1">
                    <Stop offset="0" stopColor={Colors.primary} stopOpacity="0.2" />
                    <Stop offset="1" stopColor={Colors.primary} stopOpacity="0.02" />
                  </LinearGradient>
                </Defs>
                {[4, 7].map((gridV) => (
                  <Line
                    key={gridV}
                    x1={PLOT_LEFT}
                    y1={yPixel(gridV, innerH)}
                    x2={chartW - PLOT_RIGHT}
                    y2={yPixel(gridV, innerH)}
                    stroke={Colors.border}
                    strokeWidth={1}
                    strokeDasharray="3,5"
                  />
                ))}
                {fillPath ? <Path d={fillPath} fill="url(#autoFillGrad)" /> : null}
                {linePath ? (
                  <Path
                    d={linePath}
                    fill="none"
                    stroke={Colors.primaryDark}
                    strokeWidth={2.25}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                ) : null}
                {dots.map((d, i) => (
                  <Circle
                    key={i}
                    cx={d.cx}
                    cy={d.cy}
                    r={4}
                    fill={d.fill}
                    stroke="#fff"
                    strokeWidth={1.5}
                  />
                ))}
              </Svg>
              <View style={[styles.xTickRow, { width: chartW }]}>
                {xTickIndices.map((idx) => (
                  <Text
                    key={idx}
                    style={[
                      styles.xTick,
                      {
                        position: "absolute",
                        left: PLOT_LEFT + (n > 1 ? (idx / (n - 1)) * plotW : plotW / 2) - 10,
                      },
                    ]}
                  >
                    {series[idx]?.calendarDay ?? ""}
                  </Text>
                ))}
              </View>
            </View>
          </View>
          <View style={styles.legendRow}>
            <View style={[styles.legendDot, { backgroundColor: Colors.primary }]} />
            <Text style={styles.legendText}>Akıcı (yüksek)</Text>
            <View style={[styles.legendDot, { backgroundColor: Colors.coral, marginLeft: Spacing.md }]} />
            <Text style={styles.legendText}>Zorluk (düşük)</Text>
          </View>
          <Text style={styles.footerHint}>
            Noktalar o gün verdiğin otomatiklik puanını gösterir. Puan vermediğin günler çizgiyi böler.
          </Text>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: "100%",
    backgroundColor: Colors.surface,
    borderRadius: Radii.card + 4,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  headerRow: {
    marginBottom: Spacing.sm,
  },
  title: {
    fontSize: FontSizes.md,
    fontFamily: "Inter_500Medium",
    color: Colors.textPrimary,
  },
  subtitle: {
    fontSize: FontSizes.xs,
    fontFamily: "Inter_400Regular",
    color: Colors.textTertiary,
    marginTop: 2,
  },
  empty: {
    fontSize: FontSizes.sm,
    fontFamily: "Inter_400Regular",
    color: Colors.textSecondary,
    lineHeight: 20,
    paddingVertical: Spacing.md,
  },
  chartRow: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  yAxis: {
    width: 22,
    position: "relative",
    marginRight: 4,
  },
  yTick: {
    position: "absolute",
    right: 0,
    fontSize: 10,
    fontFamily: "Inter_500Medium",
    color: Colors.textTertiary,
    width: 18,
    textAlign: "right",
  },
  svgWrap: {
    flex: 1,
    position: "relative",
  },
  xTickRow: {
    height: 18,
    position: "relative",
    marginTop: 2,
    width: "100%",
  },
  xTick: {
    fontSize: 10,
    fontFamily: "Inter_400Regular",
    color: Colors.textTertiary,
    width: 20,
    textAlign: "center",
  },
  legendRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: Spacing.sm,
    flexWrap: "wrap",
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  legendText: {
    fontSize: FontSizes.xs,
    fontFamily: "Inter_400Regular",
    color: Colors.textSecondary,
  },
  footerHint: {
    fontSize: FontSizes.xs,
    fontFamily: "Inter_400Regular",
    color: Colors.textTertiary,
    marginTop: Spacing.sm,
    lineHeight: 16,
  },
});
