import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  Easing,
  LayoutChangeEvent,
  StyleSheet,
  Text,
  View,
  type DimensionValue,
  ViewStyle,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import Svg, { Circle, Defs, Ellipse, G, LinearGradient as SvgLinearGradient, Path, Polygon, Stop } from "react-native-svg";
import {
  coerceJourneyTreeType,
  journeyTreeCaptionLine,
  phaseIndexFromJourneyDay,
  type JourneyTreeType,
} from "../../utils/journeyTree";

const SKY_TOP = "#E0F2FE";
const SKY_BOTTOM = "#DCFCE7";
const TRUNK = "#92400E";
const TRUNK_DEEP = "#78350F";
const SOIL_TOP = "#92400E";
const SOIL_BOTTOM = "#78350F";

/** Kart gövdesi: sabit yükseklik; dış sarmalayıcı başlık için alan bırakır */
const CARD_HEIGHT = 340;

export interface JourneyTreeProps {
  day: number;
  treeType: string;
  triggerGrowth?: boolean;
  onGrowthAnimationEnd?: () => void;
  hapticsEnabled?: boolean;
  /** Ana dikey ScrollView `contentOffset.y` — hafif paralaks */
  scrollY?: Animated.Value;
  style?: ViewStyle;
}

interface LeafGradIds {
  leaf: string;
  leafHi: string;
}

function fruitColor(kind: JourneyTreeType): string {
  switch (kind) {
    case "cherry":
      return "#EC4899";
    case "olive":
      return "#9CA3AF";
    case "bamboo":
      return "#FBBF24";
    case "acacia":
      return "#FACC15";
    default:
      return "#EF4444";
  }
}

function leafStops(kind: JourneyTreeType): { lo: string; hi: string } {
  switch (kind) {
    case "cherry":
      return { hi: "#86EFAC", lo: "#15803D" };
    case "olive":
      return { hi: "#D9E0C4", lo: "#3F4F2F" };
    case "bamboo":
      return { hi: "#4ADE80", lo: "#14532D" };
    case "acacia":
      return { hi: "#BBF7D0", lo: "#166534" };
    default:
      return { hi: "#4ADE80", lo: "#14532D" };
  }
}

function TreeDefs({ ids, kind }: { ids: LeafGradIds; kind: JourneyTreeType }) {
  const { hi, lo } = leafStops(kind);
  return (
    <Defs>
      <SvgLinearGradient id={ids.leaf} x1="0" y1="0" x2="1" y2="1">
        <Stop offset="0" stopColor={hi} stopOpacity={1} />
        <Stop offset="1" stopColor={lo} stopOpacity={1} />
      </SvgLinearGradient>
      <SvgLinearGradient id={ids.leafHi} x1="0" y1="0" x2="0" y2="1">
        <Stop offset="0" stopColor="#F0FDF4" stopOpacity={0.5} />
        <Stop offset="0.45" stopColor={hi} stopOpacity={1} />
        <Stop offset="1" stopColor={lo} stopOpacity={1} />
      </SvgLinearGradient>
    </Defs>
  );
}

function SideShadows() {
  return (
    <G opacity={0.1}>
      <Ellipse cx={54} cy={92} rx={22} ry={56} fill="#000000" />
      <Ellipse cx={146} cy={92} rx={22} ry={56} fill="#000000" />
    </G>
  );
}

function Phase1({ ids, kind }: { ids: LeafGradIds; kind: JourneyTreeType }) {
  const t = kind === "bamboo" ? 2.5 : 3.5;
  return (
    <G>
      <SideShadows />
      <Path d="M100 178 L100 162" stroke={TRUNK_DEEP} strokeWidth={t + 0.5} strokeLinecap="round" />
      <Path d="M100 178 L100 162" stroke={TRUNK} strokeWidth={t - 1} strokeLinecap="round" opacity={0.85} />
      <Path
        d="M100 162 C 94 154 88 148 84 146 C 90 150 96 156 100 162"
        fill={`url(#${ids.leaf})`}
        opacity={0.95}
      />
      <Path
        d="M100 162 C 106 154 112 148 116 146 C 110 150 104 156 100 162"
        fill={`url(#${ids.leafHi})`}
        opacity={0.92}
      />
    </G>
  );
}

function Phase2({ ids, kind }: { ids: LeafGradIds; kind: JourneyTreeType }) {
  const tw = kind === "bamboo" ? 4 : 6;
  return (
    <G>
      <SideShadows />
      <Path d="M100 182 L100 138" stroke={TRUNK_DEEP} strokeWidth={tw + 2} strokeLinecap="round" />
      <Path d="M100 182 L100 138" stroke={TRUNK} strokeWidth={tw} strokeLinecap="round" />
      <Path
        d="M100 155 Q 82 148 74 132 Q 88 138 98 148"
        fill={`url(#${ids.leaf})`}
        opacity={0.92}
      />
      <Path
        d="M100 148 Q 118 138 128 124 Q 114 132 104 142"
        fill={`url(#${ids.leafHi})`}
        opacity={0.9}
      />
      <Ellipse cx={78} cy={128} rx={11} ry={8} fill={`url(#${ids.leaf})`} opacity={0.88} transform="rotate(-22 78 128)" />
      <Ellipse cx={124} cy={122} rx={12} ry={9} fill={`url(#${ids.leafHi})`} opacity={0.9} transform="rotate(18 124 122)" />
    </G>
  );
}

function Phase3({ ids, kind }: { ids: LeafGradIds; kind: JourneyTreeType }) {
  const tw = kind === "bamboo" ? 5 : 10;
  return (
    <G>
      <SideShadows />
      <Path d="M100 184 L100 118" stroke={TRUNK_DEEP} strokeWidth={tw + 2.5} strokeLinecap="round" />
      <Path d="M100 184 L100 118" stroke={TRUNK} strokeWidth={tw} strokeLinecap="round" />
      <Path d="M100 168 L 78 150 M100 158 L 126 134 M100 138 L 86 116" stroke={TRUNK_DEEP} strokeWidth={3.5} strokeLinecap="round" opacity={0.7} />
      <Ellipse cx={72} cy={138} rx={18} ry={12} fill={`url(#${ids.leaf})`} opacity={0.92} transform="rotate(-26 72 138)" />
      <Ellipse cx={130} cy={124} rx={20} ry={13} fill={`url(#${ids.leafHi})`} opacity={0.92} transform="rotate(28 130 124)" />
      <Ellipse cx={88} cy={108} rx={15} ry={11} fill={`url(#${ids.leaf})`} opacity={0.86} transform="rotate(-8 88 108)" />
    </G>
  );
}

function Phase4({ ids, kind }: { ids: LeafGradIds; kind: JourneyTreeType }) {
  const tw = kind === "bamboo" ? 6 : 14;
  const fruit = fruitColor(kind);
  return (
    <G>
      <SideShadows />
      <Path d="M100 186 L 100 102" stroke={TRUNK_DEEP} strokeWidth={tw + 3} strokeLinecap="round" />
      <Path d="M100 186 L 100 102" stroke={TRUNK} strokeWidth={tw} strokeLinecap="round" />
      <Path d="M100 168 L 66 132 M100 148 L 138 118 M96 124 L 58 94 M104 110 L 146 94" stroke={TRUNK_DEEP} strokeWidth={4} strokeLinecap="round" opacity={0.65} />
      <Ellipse cx={62} cy={128} rx={26} ry={18} fill={`url(#${ids.leaf})`} opacity={0.9} transform="rotate(-20 62 128)" />
      <Ellipse cx={138} cy={110} rx={28} ry={19} fill={`url(#${ids.leafHi})`} opacity={0.9} transform="rotate(24 138 110)" />
      <Ellipse cx={96} cy={92} rx={22} ry={15} fill={`url(#${ids.leaf})`} opacity={0.86} />
      <Circle cx={118} cy={100} r={4.2} fill={fruit} opacity={0.95} />
    </G>
  );
}

function Phase5({ ids, kind }: { ids: LeafGradIds; kind: JourneyTreeType }) {
  const tw = kind === "bamboo" ? 7 : 17;
  const fruit = fruitColor(kind);
  return (
    <G>
      <SideShadows />
      <Path d="M100 188 L 100 86" stroke={TRUNK_DEEP} strokeWidth={tw + 3} strokeLinecap="round" />
      <Path d="M100 188 L 100 86" stroke={TRUNK} strokeWidth={tw} strokeLinecap="round" />
      <Path d="M100 162 L 60 120 M100 138 L 148 106 M94 108 L 48 78 M106 92 L 158 72" stroke={TRUNK_DEEP} strokeWidth={4.5} strokeLinecap="round" opacity={0.6} />
      <Ellipse cx={50} cy={112} rx={36} ry={24} fill={`url(#${ids.leaf})`} opacity={0.92} transform="rotate(-16 50 112)" />
      <Ellipse cx={150} cy={96} rx={38} ry={26} fill={`url(#${ids.leafHi})`} opacity={0.92} transform="rotate(20 150 96)" />
      <Ellipse cx={100} cy={74} rx={32} ry={22} fill={`url(#${ids.leaf})`} opacity={0.88} />
      <Ellipse cx={72} cy={82} rx={22} ry={16} fill={`url(#${ids.leafHi})`} opacity={0.78} transform="rotate(-12 72 82)" />
      <Circle cx={126} cy={82} r={5} fill={fruit} />
      <Circle cx={86} cy={70} r={4} fill={fruit} opacity={0.9} />
    </G>
  );
}

function Phase6({ ids, kind }: { ids: LeafGradIds; kind: JourneyTreeType }) {
  const tw = kind === "bamboo" ? 8 : 20;
  const fruit = fruitColor(kind);
  const fruitAlt = kind === "oak" ? "#F59E0B" : fruit;
  return (
    <G>
      <SideShadows />
      <Path d="M100 190 L 100 72" stroke={TRUNK_DEEP} strokeWidth={tw + 3} strokeLinecap="round" />
      <Path d="M100 190 L 100 72" stroke={TRUNK} strokeWidth={tw} strokeLinecap="round" />
      <Path d="M100 158 L 56 108 M100 132 L 154 92 M92 100 L 40 66 M108 84 L 164 62" stroke={TRUNK_DEEP} strokeWidth={5} strokeLinecap="round" opacity={0.55} />
      <Ellipse cx={44} cy={102} rx={42} ry={30} fill={`url(#${ids.leaf})`} opacity={0.93} transform="rotate(-14 44 102)" />
      <Ellipse cx={158} cy={86} rx={42} ry={31} fill={`url(#${ids.leafHi})`} opacity={0.93} transform="rotate(18 158 86)" />
      <Ellipse cx={100} cy={58} rx={36} ry={26} fill={`url(#${ids.leaf})`} opacity={0.9} />
      <Ellipse cx={68} cy={68} rx={26} ry={19} fill={`url(#${ids.leafHi})`} opacity={0.82} transform="rotate(-14 68 68)" />
      <Circle cx={124} cy={90} r={6} fill="#EF4444" opacity={0.95} />
      <Circle cx={76} cy={96} r={5.5} fill="#DC2626" opacity={0.92} />
      <Circle cx={100} cy={52} r={5.5} fill={fruitAlt} />
      <Circle cx={52} cy={88} r={5} fill={fruit} opacity={0.9} />
      <Circle cx={144} cy={74} r={5} fill="#EF4444" opacity={0.88} />
      {kind === "cherry" ? (
        <>
          <Circle cx={92} cy={56} r={4.5} fill="#F472B6" />
          <Circle cx={116} cy={62} r={4} fill={fruit} />
        </>
      ) : null}
    </G>
  );
}

const VB_W = 200;
const VB_H = 200;
const PIVOT_Y_FR = 0.82;

function treeTransformStyle(scale: Animated.Value) {
  const cx = VB_W / 2;
  const cy = VB_H * PIVOT_Y_FR;
  return {
    transform: [
      { translateX: cx },
      { translateY: cy },
      { scale },
      { translateX: -cx },
      { translateY: -cy },
    ],
  };
}

function makeParticleSpecs(): { dx: number; dy: number; delay: number }[] {
  const n = 3 + Math.floor(Math.random() * 2);
  return Array.from({ length: n }, (_, id) => {
    const spread = (Math.random() - 0.5) * 1.2;
    const angle = -Math.PI / 2 + spread;
    const dist = 48 + Math.random() * 55;
    return {
      dx: Math.cos(angle) * dist,
      dy: Math.sin(angle) * dist,
      delay: id * 48,
    };
  });
}

function LeafParticle({
  dx,
  dy,
  delay,
  color,
}: {
  dx: number;
  dy: number;
  delay: number;
  color: string;
}) {
  const tx = useRef(new Animated.Value(0)).current;
  const ty = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    tx.setValue(0);
    ty.setValue(0);
    opacity.setValue(1);
    Animated.parallel([
      Animated.timing(tx, {
        toValue: dx,
        duration: 880,
        delay,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(ty, {
        toValue: dy,
        duration: 880,
        delay,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 720,
        delay: delay + 140,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, [dx, dy, delay, tx, ty, opacity]);

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.leafParticle,
        { backgroundColor: color, transform: [{ translateX: tx }, { translateY: ty }], opacity },
      ]}
    />
  );
}

function JourneyGround() {
  return (
    <View style={styles.groundWrap} pointerEvents="none">
      <Svg width="100%" height="100%" viewBox="0 0 400 96" preserveAspectRatio="xMidYMax meet">
        <Defs>
          <SvgLinearGradient id="soilGrad" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={SOIL_TOP} />
            <Stop offset="1" stopColor={SOIL_BOTTOM} />
          </SvgLinearGradient>
        </Defs>
        <Ellipse cx={200} cy={88} rx={138} ry={16} fill="#000000" opacity={0.1} />
        <Path
          d="M0,96 L0,58 C32,52 72,56 112,48 C152,42 188,50 228,44 C268,38 312,48 352,54 C376,58 400,56 400,60 L400,96 Z"
          fill="url(#soilGrad)"
        />
        <Polygon points="118,48 112,38 124,38" fill="#4ADE80" opacity={0.85} />
        <Polygon points="178,46 170,36 186,36" fill="#22C55E" opacity={0.9} />
        <Polygon points="248,44 242,34 254,35" fill="#4ADE80" opacity={0.82} />
        <Polygon points="298,50 292,40 304,40" fill="#16A34A" opacity={0.75} />
        <Path d="M142 52 L140 44 M198 48 L196 41 M268 46 L266 39" stroke="#15803D" strokeWidth={2} strokeLinecap="round" opacity={0.55} />
      </Svg>
    </View>
  );
}

function DriftingCloud({
  top,
  left,
  width,
  height,
  duration,
  range,
}: {
  top: number;
  left: DimensionValue;
  width: number;
  height: number;
  duration: number;
  range: number;
}) {
  const x = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(x, {
          toValue: range,
          duration,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(x, {
          toValue: 0,
          duration,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, [duration, range, x]);
  return (
    <Animated.View
      style={[
        styles.cloud,
        {
          top,
          left,
          width,
          height,
          transform: [{ translateX: x }],
        },
      ]}
    />
  );
}

export default function JourneyTree({
  day,
  treeType,
  style,
  triggerGrowth = false,
  onGrowthAnimationEnd,
  hapticsEnabled = true,
  scrollY,
}: JourneyTreeProps) {
  const kind = coerceJourneyTreeType(treeType);
  const phase = phaseIndexFromJourneyDay(day);
  const captionLine = useMemo(() => journeyTreeCaptionLine(day), [day]);
  const leafHue = leafStops(kind).hi;

  const scrollFallback = useRef(new Animated.Value(0)).current;
  const yScroll = scrollY ?? scrollFallback;
  const parallaxY = yScroll.interpolate({
    inputRange: [0, 480],
    outputRange: [0, -26],
    extrapolate: "clamp",
  });

  const opacities = useRef(
    Array.from({ length: 6 }, (_, i) => new Animated.Value(i === phase ? 1 : 0))
  ).current;
  const scales = useRef(
    Array.from({ length: 6 }, (_, i) => new Animated.Value(i === phase ? 1 : 0.9))
  ).current;
  const prevPhase = useRef(phase);

  const shakeRotate = useRef(new Animated.Value(0)).current;
  const growthEdge = useRef(true);
  const onEndRef = useRef(onGrowthAnimationEnd);
  onEndRef.current = onGrowthAnimationEnd;
  const [pivot, setPivot] = useState({ x: 160, y: 260 });
  const [particleSpecs, setParticleSpecs] = useState<{ dx: number; dy: number; delay: number }[]>([]);
  const [particleBurstKey, setParticleBurstKey] = useState(0);

  const onShakeLayout = useCallback((e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    if (width <= 0 || height <= 0) return;
    setPivot({ x: width / 2, y: height * 0.72 });
  }, []);

  useEffect(() => {
    if (prevPhase.current === phase) return;
    prevPhase.current = phase;
    Animated.parallel(
      [0, 1, 2, 3, 4, 5].map((i) =>
        Animated.parallel([
          Animated.timing(opacities[i], {
            toValue: i === phase ? 1 : 0,
            duration: 420,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
          Animated.timing(scales[i], {
            toValue: i === phase ? 1 : 0.88,
            duration: 420,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
        ])
      )
    ).start();
  }, [phase, opacities, scales]);

  useEffect(() => {
    if (!triggerGrowth) {
      growthEdge.current = true;
      return;
    }
    if (!growthEdge.current) return;
    growthEdge.current = false;

    if (hapticsEnabled) {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    setParticleSpecs(makeParticleSpecs());
    setParticleBurstKey((k) => k + 1);

    shakeRotate.setValue(0);
    Animated.sequence([
      Animated.spring(shakeRotate, {
        toValue: -5,
        friction: 5,
        tension: 240,
        useNativeDriver: true,
      }),
      Animated.spring(shakeRotate, {
        toValue: 5,
        friction: 5,
        tension: 240,
        useNativeDriver: true,
      }),
      Animated.spring(shakeRotate, {
        toValue: 0,
        friction: 7,
        tension: 200,
        useNativeDriver: true,
      }),
    ]).start();

    const doneTimer = setTimeout(() => {
      setParticleSpecs([]);
      growthEdge.current = true;
      onEndRef.current?.();
    }, 1120);

    return () => {
      clearTimeout(doneTimer);
    };
  }, [triggerGrowth, hapticsEnabled, shakeRotate]);

  const phaseRenderers = useMemo(
    () => [Phase1, Phase2, Phase3, Phase4, Phase5, Phase6] as const,
    []
  );

  return (
    <View style={[styles.root, style]}>
      <Animated.View style={{ transform: [{ translateY: parallaxY }] }}>
        <View style={styles.card}>
          <LinearGradient
            colors={[SKY_TOP, SKY_BOTTOM]}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
          <DriftingCloud top={28} left="8%" width={72} height={36} duration={6500} range={14} />
          <DriftingCloud top={52} left="42%" width={96} height={44} duration={8200} range={18} />
          <DriftingCloud top={18} left="72%" width={64} height={32} duration={7200} range={12} />

          <View style={styles.scene}>
            <Animated.View
              style={[
                styles.treeLayer,
                {
                  transform: [
                    { translateX: pivot.x },
                    { translateY: pivot.y },
                    {
                      rotate: shakeRotate.interpolate({
                        inputRange: [-12, 12],
                        outputRange: ["-12deg", "12deg"],
                      }),
                    },
                    { translateX: -pivot.x },
                    { translateY: -pivot.y },
                  ],
                },
              ]}
              onLayout={onShakeLayout}
            >
              {phaseRenderers.map((Ph, i) => {
                const ids: LeafGradIds = { leaf: `lf${i}`, leafHi: `lfh${i}` };
                return (
                  <Animated.View
                    key={i}
                    pointerEvents="none"
                    style={[
                      styles.phaseLayer,
                      { opacity: opacities[i] },
                      treeTransformStyle(scales[i]),
                    ]}
                  >
                    <Svg width="100%" height="100%" viewBox={`0 0 ${VB_W} ${VB_H}`} preserveAspectRatio="xMidYMax meet">
                      <TreeDefs ids={ids} kind={kind} />
                      <Ph ids={ids} kind={kind} />
                    </Svg>
                  </Animated.View>
                );
              })}
            </Animated.View>

            <View style={styles.particleLayer} pointerEvents="none">
              {particleSpecs.map((spec, i) => (
                <LeafParticle
                  key={`${particleBurstKey}-${i}`}
                  dx={spec.dx}
                  dy={spec.dy}
                  delay={spec.delay}
                  color={leafHue}
                />
              ))}
            </View>

            <JourneyGround />
          </View>
        </View>
      </Animated.View>

      <View style={styles.captionBlock}>
        <Text style={styles.captionDay}>Gün {day}</Text>
        <Text style={styles.captionSub}>{captionLine}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    width: "100%",
  },
  card: {
    height: CARD_HEIGHT,
    marginHorizontal: 16,
    borderRadius: 24,
    overflow: "hidden",
  },
  cloud: {
    position: "absolute",
    backgroundColor: "#FFFFFF",
    opacity: 0.4,
    borderRadius: 999,
  },
  scene: {
    flex: 1,
    position: "relative",
  },
  treeLayer: {
    ...StyleSheet.absoluteFillObject,
    bottom: 88,
  },
  phaseLayer: {
    ...StyleSheet.absoluteFillObject,
  },
  groundWrap: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: 96,
  },
  particleLayer: {
    ...StyleSheet.absoluteFillObject,
    bottom: 88,
    zIndex: 6,
  },
  leafParticle: {
    position: "absolute",
    width: 9,
    height: 9,
    borderRadius: 5,
    left: "50%",
    marginLeft: -4,
    bottom: "38%",
  },
  captionBlock: {
    marginTop: 16,
    paddingHorizontal: 16,
    alignItems: "center",
  },
  captionDay: {
    fontSize: 28,
    fontFamily: "Inter_800ExtraBold",
    color: "#0F172A",
  },
  captionSub: {
    marginTop: 4,
    fontSize: 13,
    color: "#64748B",
    letterSpacing: 0.5,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
  },
});