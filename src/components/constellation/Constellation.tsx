import React, { useEffect, useMemo, useRef, memo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Share,
  useWindowDimensions,
  Easing,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Svg, { Circle, G, Path } from "react-native-svg";
import { Ionicons } from "@expo/vector-icons";

import { Spacing } from "../../constants/theme";
import { getConstellationPatternForLetter } from "../../constants/constellationPatterns";

const SKY_HEIGHT = 340;
const VB = 100;
const PAD = 5;

/** 5 köşeli yıldız — merkez ~(0,0) */
export const STAR_PATH =
  "M 0,-3 L 0.8,-0.8 L 3,-0.8 L 1.2,0.6 L 1.8,3 L 0,1.5 L -1.8,3 L -1.2,0.6 L -3,-0.8 L -0.8,-0.8 Z";

const STAR_BASE = 0.22;
/** Ana takımyıldızı — tüm normal günler */
const SCALE_MAIN = 0.6;
/** Uzak yıldızlar: G içinde ek scale */
const SCALE_DISTANT = 0.3;
const R_DISTANT = 1;
/** Ön plan vurgu */
const SCALE_ACCENT = 1;
const SCALE_ENDER = 1.3;
const SCALE_STREAK_L5 = 1.25;
const SCALE_GOLDEN = 1.9;

const GLOW_R_OUT = 6;
const GLOW_R_IN = 3;
const GLOW_OP_OUT = 0.15;
const GLOW_OP_IN = 0.3;

const COLOR_WARM = "#FEF3C7";
const COLOR_ENDER = "#F472B6";
const COLOR_STREAK = "#FCD34D";
const COLOR_GOLDEN = "#FBBF24";

/** Standart 2 katman glow (yumuşak hale) */
function SoftGlowRings({ fill }: { fill: string }) {
  return (
    <>
      <Circle cx={0} cy={0} r={GLOW_R_OUT} fill={fill} opacity={GLOW_OP_OUT} />
      <Circle cx={0} cy={0} r={GLOW_R_IN} fill={fill} opacity={GLOW_OP_IN} />
    </>
  );
}

const SNOWFLAKE_D = (() => {
  const r = 2.8;
  let d = "";
  for (let i = 0; i < 6; i += 1) {
    const ang = (i * Math.PI) / 3;
    d += `M 0,0 L ${(Math.cos(ang) * r).toFixed(2)},${(Math.sin(ang) * r).toFixed(2)} `;
  }
  return d.trim();
})();

const CROSS_D = "M -3,0 L 3,0 M 0,-3 L 0,3";

type StarType = "future" | "missed" | "golden" | "rare" | "streak" | "normal";

function getStarType(starDay: number, day: number, checkIns: boolean[]): StarType {
  if (starDay > day) return "future";
  if (!checkIns[starDay - 1]) return "missed";
  if (starDay === 66) return "golden";
  if (starDay % 11 === 0) return "rare";
  if (starDay % 7 === 0) return "streak";
  return "normal";
}

function isLayerFiveType(t: StarType): t is "golden" | "rare" | "streak" {
  return t === "golden" || t === "rare" || t === "streak";
}

type NextSpecial = { type: "streak" | "rare"; day: number; daysLeft: number };

function getNextSpecialDay(day: number): NextSpecial {
  const nextStreak = Math.ceil(day / 7) * 7;
  const nextRare = Math.ceil(day / 11) * 11;
  if (nextStreak <= nextRare) {
    return { type: "streak", day: nextStreak, daysLeft: nextStreak - day };
  }
  return { type: "rare", day: nextRare, daysLeft: nextRare - day };
}

type MilestoneBanner = {
  title: string;
  subtitle: string;
  allComplete: boolean;
  titleAccent: "streak" | "rare" | "gold";
};

function getMilestoneBanner(day: number): MilestoneBanner {
  if (day >= 66) {
    return {
      title: "Son Ender Yıldızını yakmışsın! 🎉",
      subtitle: "Özel bir gün, kutla!",
      allComplete: true,
      titleAccent: "gold",
    };
  }

  const special = getNextSpecialDay(day);
  const label = special.type === "streak" ? "Streak" : "Ender";

  if (special.daysLeft === 0) {
    return {
      title: `✦ Bugün ${label} Yıldız!`,
      subtitle: "Özel bir gün, kutla!",
      allComplete: false,
      titleAccent: special.type === "streak" ? "streak" : "rare",
    };
  }

  return {
    title: `✦ ${special.daysLeft} gün sonra ${label} Yıldız`,
    subtitle: `Gün ${special.day}'yi bekle`,
    allComplete: false,
    titleAccent: special.type === "streak" ? "streak" : "rare",
  };
}

function hashString(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i += 1) {
    h = (h * 31 + s.charCodeAt(i)) | 0;
  }
  return Math.abs(h) || 1;
}

function createRng(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 0xffffffff;
  };
}

function mapPoint(p: { x: number; y: number }) {
  return {
    cx: PAD + p.x * (VB - 2 * PAD),
    cy: PAD + p.y * (VB - 2 * PAD),
  };
}

type Pt = { cx: number; cy: number };

type ShapeKind = "a" | "b" | "c";

function shapeKindForDay(dayIndex: number, rng: () => number): ShapeKind {
  const roll = (dayIndex * 17 + Math.floor(rng() * 1000)) % 100;
  if (roll < 70) return "a";
  if (roll < 90) return "b";
  return "c";
}

/** Bezier segment path (viewBox coords) */
function bezierPathD(x1: number, y1: number, x2: number, y2: number): string {
  const mx = (x1 + x2) / 2;
  const my = (y1 + y2) / 2 - 10;
  return `M ${x1},${y1} Q ${mx},${my} ${x2},${y2}`;
}

type StarDrawProps = {
  kind: ShapeKind;
  fill: string;
  opacity: number;
  strokeDim: number;
};

function StarDraw({ kind, fill, opacity, strokeDim }: StarDrawProps) {
  if (kind === "a") {
    return <Path d={STAR_PATH} fill={fill} opacity={opacity} />;
  }
  if (kind === "b") {
    return (
      <Path
        d={CROSS_D}
        stroke={fill}
        strokeWidth={strokeDim}
        strokeLinecap="round"
        opacity={opacity}
        fill="none"
      />
    );
  }
  return (
    <Path
      d={SNOWFLAKE_D}
      stroke={fill}
      strokeWidth={strokeDim * 0.9}
      strokeLinecap="round"
      opacity={opacity}
      fill="none"
    />
  );
}

const AnimatedG = Animated.createAnimatedComponent(G);

const TwinkleWrap = memo(function TwinkleWrap({
  durationMs,
  baseOpacity,
  children,
}: {
  durationMs: number;
  baseOpacity: number;
  children: React.ReactNode;
}) {
  const v = useRef(new Animated.Value(baseOpacity)).current;
  useEffect(() => {
    const amp = 0.22;
    const hi = Math.min(1, baseOpacity + amp);
    const lo = Math.max(0.45, baseOpacity - amp);
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(v, {
          toValue: hi,
          duration: durationMs / 2,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: false,
        }),
        Animated.timing(v, {
          toValue: lo,
          duration: durationMs / 2,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: false,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [durationMs, baseOpacity, v]);
  return <AnimatedG opacity={v}>{children}</AnimatedG>;
});

export type ConstellationProps = {
  dayNumber: number;
  grid: boolean[];
  identitySentence: string;
};

function zStar(day: number, dayNumber: number, grid66: boolean[]): number {
  if (day === dayNumber) return 60;
  if (day === 66 || day % 11 === 0 || day % 7 === 0) return 50;
  if (day > dayNumber) return 10;
  if (grid66[day - 1]) return 30;
  return 20;
}

function ConstellationInner({
  dayNumber,
  grid,
  identitySentence,
}: ConstellationProps) {
  const { width: winW } = useWindowDimensions();
  const contentW = winW - Spacing.lg * 2;

  const pattern = useMemo(
    () => getConstellationPatternForLetter(identitySentence),
    [identitySentence]
  );

  const grid66 = useMemo(() => {
    const g = [...grid];
    while (g.length < 66) g.push(false);
    return g.slice(0, 66);
  }, [grid]);

  const seed = useMemo(() => hashString(identitySentence), [identitySentence]);

  const skyBase = useMemo(() => {
    const rng = createRng(seed);
    const positionsInner: Pt[] = pattern.map((p) => mapPoint(p));

    const nebulaBlobs = [
      { cx: 10, cy: 12, r: 60, fill: "#312E81" },
      { cx: 90, cy: 14, r: 60, fill: "#4C1D95" },
      { cx: 12, cy: 90, r: 60, fill: "#312E81" },
    ];

    const distantStars: { cx: number; cy: number; opacity: number; fill: string }[] = [];
    for (let i = 0; i < 84; i += 1) {
      distantStars.push({
        cx: 2 + rng() * (VB - 4),
        cy: 2 + rng() * (VB - 4),
        opacity: 0.22 + rng() * 0.28,
        fill: rng() > 0.52 ? "#CBD5E1" : "#FFFFFF",
      });
    }

    const shapes: ShapeKind[] = [];
    const rngShapes = createRng(seed + 90210);
    for (let d = 1; d <= 66; d += 1) {
      shapes.push(shapeKindForDay(d, rngShapes));
    }

    const acc: { cx: number; cy: number }[] = [];
    const nAccent = 9;
    for (let i = 0; i < nAccent; i += 1) {
      acc.push({
        cx: 8 + rng() * (VB - 16),
        cy: 8 + rng() * (VB - 16),
      });
    }

    return {
      nebula: nebulaBlobs,
      distant: distantStars,
      positions: positionsInner,
      shapeKinds: shapes,
      accentStars: acc,
    };
  }, [pattern, seed]);

  const positions = skyBase.positions;
  const nebula = skyBase.nebula;
  const distant = skyBase.distant;
  const shapeKinds = skyBase.shapeKinds;
  const accentStars = skyBase.accentStars;

  const bezierPaths = useMemo(() => {
    const paths: string[] = [];
    for (let i = 0; i < 65; i += 1) {
      if (grid66[i] === true && grid66[i + 1] === true) {
        const a = positions[i]!;
        const b = positions[i + 1]!;
        paths.push(bezierPathD(a.cx, a.cy, b.cx, b.cy));
      }
    }
    return paths;
  }, [positions, grid66]);

  const twinkleSpec = useMemo(() => {
    const rngTw = createRng(seed + 777);
    const pool: number[] = [];
    for (let d = 1; d <= 66; d += 1) {
      const t = getStarType(d, dayNumber, grid66);
      if (isLayerFiveType(t) && grid66[d - 1]) continue;
      pool.push(d);
    }
    const twCount = 12;
    for (let i = pool.length - 1; i > 0; i -= 1) {
      const j = Math.floor(rngTw() * (i + 1));
      [pool[i], pool[j]] = [pool[j]!, pool[i]!];
    }
    const chosen = pool.slice(0, Math.min(twCount, pool.length));
    return chosen.map((day) => ({
      day,
      durationMs: 2000 + Math.floor(rngTw() * 3000),
      baseOpacity: 0.5 + rngTw() * 0.5,
    }));
  }, [dayNumber, grid66, seed]);

  const twinkleDaySet = useMemo(
    () => new Set(twinkleSpec.map((t) => t.day)),
    [twinkleSpec]
  );
  const twinkleByDay = useMemo(() => {
    const m = new Map<number, { durationMs: number; baseOpacity: number }>();
    for (const t of twinkleSpec) {
      m.set(t.day, { durationMs: t.durationMs, baseOpacity: t.baseOpacity });
    }
    return m;
  }, [twinkleSpec]);

  const layer5Pulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(layer5Pulse, {
          toValue: 1,
          duration: 1500,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: false,
        }),
        Animated.timing(layer5Pulse, {
          toValue: 0,
          duration: 1500,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: false,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [layer5Pulse]);

  const l5Opacity = layer5Pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [0.7, 1],
  });

  const pulseScaleByKind = useMemo(
    () => ({
      rare: layer5Pulse.interpolate({
        inputRange: [0, 1],
        outputRange: [STAR_BASE * SCALE_ENDER, STAR_BASE * SCALE_ENDER * 1.1],
      }),
      streak: layer5Pulse.interpolate({
        inputRange: [0, 1],
        outputRange: [STAR_BASE * SCALE_STREAK_L5, STAR_BASE * SCALE_STREAK_L5 * 1.1],
      }),
      golden: layer5Pulse.interpolate({
        inputRange: [0, 1],
        outputRange: [STAR_BASE * SCALE_GOLDEN, STAR_BASE * SCALE_GOLDEN * 1.1],
      }),
    }),
    [layer5Pulse]
  );

  const orbitSpin = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (dayNumber !== 66) return;
    const loop = Animated.loop(
      Animated.timing(orbitSpin, {
        toValue: 1,
        duration: 10000,
        easing: Easing.linear,
        useNativeDriver: false,
      })
    );
    loop.start();
    return () => loop.stop();
  }, [orbitSpin, dayNumber]);

  const orbitRotate = orbitSpin.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  const sortedDays = useMemo(() => {
    return Array.from({ length: 66 }, (_, i) => i + 1).sort(
      (a, b) => zStar(a, dayNumber, grid66) - zStar(b, dayNumber, grid66)
    );
  }, [dayNumber, grid66]);

  const mainSorted = useMemo(
    () =>
      sortedDays.filter((d) => !isLayerFiveType(getStarType(d, dayNumber, grid66))),
    [sortedDays, dayNumber, grid66]
  );

  const l5Sorted = useMemo(
    () =>
      sortedDays.filter((d) => isLayerFiveType(getStarType(d, dayNumber, grid66))),
    [sortedDays, dayNumber, grid66]
  );

  const banner = useMemo(() => getMilestoneBanner(dayNumber), [dayNumber]);

  const onShare = () => {
    void Share.share({
      message: `${identitySentence}\n\n66 gün · identidade`,
    });
  };

  const renderDayStar = (
    d: number,
    pulseScaleFinal: ReturnType<typeof layer5Pulse.interpolate> | null
  ) => {
    const { cx, cy } = positions[d - 1]!;
    const t = getStarType(d, dayNumber, grid66);
    const kind = shapeKinds[d - 1] ?? "a";

    const twinkleOn = twinkleDaySet.has(d);
    const tw = twinkleByDay.get(d);

    const applyTwinkle = (node: React.ReactElement) => {
      if (!twinkleOn || !tw) return node;
      return (
        <TwinkleWrap durationMs={tw.durationMs} baseOpacity={tw.baseOpacity}>
          {node}
        </TwinkleWrap>
      );
    };

    const baseStroke = kind === "a" ? 0.35 : 0.5;

    if (t === "future") {
      return applyTwinkle(
        <G transform={`translate(${cx},${cy}) scale(${STAR_BASE * SCALE_MAIN})`}>
          <StarDraw kind={kind} fill="#FFFFFF" opacity={0.42} strokeDim={baseStroke} />
        </G>
      );
    }

    if (t === "missed") {
      return applyTwinkle(
        <G transform={`translate(${cx},${cy}) scale(${STAR_BASE * SCALE_MAIN})`}>
          <StarDraw kind={kind} fill="#FCA5A5" opacity={0.5} strokeDim={baseStroke} />
        </G>
      );
    }

    const l5Active = isLayerFiveType(t);

    if (l5Active && pulseScaleFinal) {
      const fillC = t === "golden" ? COLOR_GOLDEN : t === "rare" ? COLOR_ENDER : COLOR_STREAK;

      const goldenOrbit =
        t === "golden" && dayNumber === 66 ? (
          <AnimatedG transform={[{ rotate: orbitRotate }]}>
            {Array.from({ length: 6 }, (_, i) => {
              const ang = (i * Math.PI) / 3;
              const ox = Math.cos(ang) * 12;
              const oy = Math.sin(ang) * 12;
              return (
                <G key={`sat-${i}`} transform={`translate(${ox},${oy}) scale(${STAR_BASE * 0.35})`}>
                  <Path d={STAR_PATH} fill={COLOR_GOLDEN} opacity={0.95} />
                </G>
              );
            })}
          </AnimatedG>
        ) : null;

      return (
        <AnimatedG
          transform={[{ translateX: cx }, { translateY: cy }, { scale: pulseScaleFinal }]}
          opacity={l5Opacity}
        >
          {goldenOrbit}
          <G>
            <SoftGlowRings fill={fillC} />
            <StarDraw kind={kind} fill={fillC} opacity={1} strokeDim={baseStroke} />
          </G>
        </AnimatedG>
      );
    }

    const doneFill = grid66[d - 1] ? COLOR_WARM : "#FFFFFF";
    const op = grid66[d - 1] ? 1 : 0.92;

    return applyTwinkle(
      <G transform={`translate(${cx},${cy}) scale(${STAR_BASE * SCALE_MAIN})`}>
        <StarDraw kind={kind} fill={doneFill} opacity={op} strokeDim={baseStroke} />
      </G>
    );
  };

  function layer5PulseScale(t: "golden" | "rare" | "streak") {
    if (t === "golden") return pulseScaleByKind.golden;
    if (t === "rare") return pulseScaleByKind.rare;
    return pulseScaleByKind.streak;
  }

  const accGlow = STAR_BASE * SCALE_ACCENT;

  return (
    <View style={[styles.block, { width: contentW }]}>
      <LinearGradient
        colors={["#000000", "#0B0F19", "#1E1B4B"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.sky}
      >
        <Svg
          width={contentW}
          height={SKY_HEIGHT}
          viewBox={`0 0 ${VB} ${VB}`}
          style={styles.svg}
        >
          <G style={{ zIndex: 1 }}>
            {nebula.map((b, i) => (
              <Circle key={`neb-${i}`} cx={b.cx} cy={b.cy} r={b.r} fill={b.fill} opacity={0.06} />
            ))}
          </G>

          <G style={{ zIndex: 2 }}>
            {distant.map((s, i) => (
              <G key={`dst-${i}`} transform={`translate(${s.cx},${s.cy}) scale(${SCALE_DISTANT})`}>
                <Circle cx={0} cy={0} r={R_DISTANT} fill={s.fill} opacity={s.opacity} />
              </G>
            ))}
          </G>

          <G style={{ zIndex: 3 }}>
            {bezierPaths.map((d, i) => (
              <Path
                key={`bez-${i}`}
                d={d}
                stroke="#FFFFFF"
                strokeWidth={0.4}
                opacity={0.3}
                fill="none"
              />
            ))}
          </G>

          <G style={{ zIndex: 4 }}>
            {mainSorted.map((d) => (
              <React.Fragment key={d}>{renderDayStar(d, null)}</React.Fragment>
            ))}
          </G>

          <G style={{ zIndex: 5 }}>
            {accentStars.map((a, i) => (
              <G key={`acc-${i}`} transform={`translate(${a.cx},${a.cy})`}>
                <SoftGlowRings fill="#FFFFFF" />
                <G transform={`scale(${accGlow})`}>
                  <Path d={STAR_PATH} fill="#FFFFFF" opacity={1} />
                </G>
              </G>
            ))}
            {l5Sorted.map((d) => {
              const t = getStarType(d, dayNumber, grid66);
              if (!isLayerFiveType(t)) return null;
              return (
                <React.Fragment key={d}>{renderDayStar(d, layer5PulseScale(t))}</React.Fragment>
              );
            })}
          </G>
        </Svg>
      </LinearGradient>

      <View style={styles.enderCard}>
        <View style={styles.enderTextCol}>
          <Text
            style={[
              styles.enderTitle,
              banner.titleAccent === "streak" ? styles.enderTitleStreak : null,
              banner.titleAccent === "rare" ? styles.enderTitleRare : null,
              banner.titleAccent === "gold" ? styles.enderTitleGold : null,
            ]}
          >
            {banner.title}
          </Text>
          <Text
            style={
              banner.subtitle.startsWith("Gün")
                ? styles.enderSubWait
                : styles.enderSub
            }
          >
            {banner.subtitle}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.shareBtn}
          onPress={onShare}
          hitSlop={12}
          accessibilityRole="button"
          accessibilityLabel="Takımyıldızını paylaş"
        >
          <Ionicons name="share-outline" size={20} color="#F472B6" />
          <Text style={styles.shareLabel}>Paylaş</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function sameGrid(a: boolean[], b: boolean[]): boolean {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i += 1) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}

function propsEqual(a: ConstellationProps, b: ConstellationProps): boolean {
  return (
    a.dayNumber === b.dayNumber &&
    a.identitySentence === b.identitySentence &&
    sameGrid(a.grid, b.grid)
  );
}

const Constellation = memo(ConstellationInner, propsEqual);
export default Constellation;

const styles = StyleSheet.create({
  block: {
    alignSelf: "center",
  },
  sky: {
    height: SKY_HEIGHT,
    borderRadius: 24,
    overflow: "hidden",
  },
  svg: {
    backgroundColor: "transparent",
  },
  enderCard: {
    marginTop: 12,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  enderTextCol: { flex: 1, paddingRight: 8 },
  enderTitle: {
    fontSize: 13,
    color: "#64748B",
    fontWeight: "600",
  },
  enderTitleStreak: {
    color: "#FCD34D",
  },
  enderTitleRare: {
    color: "#F472B6",
  },
  enderTitleGold: {
    color: "#B45309",
  },
  enderSub: {
    fontSize: 11,
    color: "#94A3B8",
    marginTop: 4,
  },
  enderSubWait: {
    fontSize: 9,
    color: "#CBD5E1",
    marginTop: 4,
  },
  shareBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#FDF2F8",
    borderWidth: 1,
    borderColor: "#F472B6",
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  shareLabel: {
    fontSize: 13,
    color: "#F472B6",
    fontWeight: "600",
  },
});
