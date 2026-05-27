import React, { useEffect, useMemo, useRef, memo, useCallback } from "react";
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
import Svg, { Circle, G, Path } from "react-native-svg";
import { Share2 } from "lucide-react-native";

import { Spacing } from "../../constants/theme";

/** 66 günlük spiral; veri kaynağı checkinsStore ile JourneyScreen eşlemesi */
export type LightAccumulationProps = {
  checkIns: boolean[];
  checkInNotes: (string | null | undefined)[];
  dayNumber: number;
  currentStreak: number;
};

const CONTAINER_H = 280;
const VB = 300;
const CENTER = VB / 2;

const DOT_R = 2.5;
const GLOW_R = 5;
const GLOW_OPACITY = 0.25;

const COLOR_DEFAULT = "#10B981";
const COLOR_HARD = "#F97316";
const COLOR_GREAT = "#FBBF24";
const COLOR_EASY = "#60A5FA";

function lightColorFromNote(note: string | null | undefined): string {
  if (!note) return COLOR_DEFAULT;
  const n = note.toLowerCase();
  if (n.includes("zor")) return COLOR_HARD;
  if (n.includes("harika")) return COLOR_GREAT;
  if (n.includes("kolay")) return COLOR_EASY;
  return COLOR_DEFAULT;
}

function spiralXY(day: number): { x: number; y: number } {
  const angle = (day / 66) * Math.PI * 4;
  const radius = 20 + day * 1.5;
  return {
    x: CENTER + Math.cos(angle) * radius,
    y: CENTER + Math.sin(angle) * radius,
  };
}

function bezierPathD(x1: number, y1: number, x2: number, y2: number): string {
  const mx = (x1 + x2) / 2;
  const my = (y1 + y2) / 2 - 8;
  return `M ${x1},${y1} Q ${mx},${my} ${x2},${y2}`;
}

function lastCompletedDay(checkIns: boolean[]): number {
  let last = 0;
  for (let d = 1; d <= 66; d += 1) {
    if (checkIns[d - 1]) last = d;
  }
  return last;
}

function sameBoolGrid(a: boolean[], b: boolean[]): boolean {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i += 1) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}

const AnimatedG = Animated.createAnimatedComponent(G);

function LightAccumulationInner(props: LightAccumulationProps) {
  const { checkIns, checkInNotes, currentStreak } = props;
  const { width: winW } = useWindowDimensions();
  const contentW = winW - Spacing.lg * 2;

  const grid66 = useMemo(() => {
    const g = [...checkIns];
    while (g.length < 66) g.push(false);
    return g.slice(0, 66);
  }, [checkIns]);

  const notes66 = useMemo(() => {
    const n = [...checkInNotes];
    while (n.length < 66) n.push(null);
    return n.slice(0, 66);
  }, [checkInNotes]);

  const completedCount = useMemo(() => grid66.filter(Boolean).length, [grid66]);

  const segments = useMemo(() => {
    const out: { x1: number; y1: number; x2: number; y2: number }[] = [];
    for (let d = 1; d <= 65; d += 1) {
      if (grid66[d - 1] && grid66[d]) {
        const a = spiralXY(d);
        const b = spiralXY(d + 1);
        out.push({ x1: a.x, y1: a.y, x2: b.x, y2: b.y });
      }
    }
    return out;
  }, [grid66]);

  const pulseRef = useRef(new Animated.Value(1)).current;
  const lastLit = useMemo(() => lastCompletedDay(grid66), [grid66]);
  const pulseDay = currentStreak > 0 ? lastLit : 0;

  const opMap = useRef<Map<number, Animated.Value>>(new Map());
  const getOp = useCallback((day: number) => {
    let v = opMap.current.get(day);
    if (!v) {
      v = new Animated.Value(0);
      opMap.current.set(day, v);
    }
    return v;
  }, []);

  const prevGridRef = useRef<boolean[] | null>(null);
  const checkKey = grid66.map((x) => (x ? "1" : "0")).join("");

  useEffect(() => {
    const prev = prevGridRef.current;
    prevGridRef.current = [...grid66];

    if (prev === null) {
      const doneDays: number[] = [];
      for (let d = 1; d <= 66; d += 1) {
        if (grid66[d - 1]) doneDays.push(d);
      }
      doneDays.forEach((d, idx) => {
        const op = getOp(d);
        op.setValue(0);
        Animated.timing(op, {
          toValue: 1,
          delay: idx * 30,
          duration: 450,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: false,
        }).start();
      });
      return;
    }

    for (let i = 0; i < 66; i += 1) {
      const d = i + 1;
      if (grid66[i] && !prev[i]) {
        const op = getOp(d);
        op.setValue(0);
        Animated.timing(op, {
          toValue: 1,
          duration: 500,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: false,
        }).start();
      } else if (!grid66[i] && prev[i]) {
        getOp(d).setValue(0);
      }
    }
  }, [checkKey, grid66, getOp]);

  useEffect(() => {
    if (currentStreak <= 0 || pulseDay <= 0) {
      pulseRef.setValue(1);
      return;
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseRef, {
          toValue: 0.5,
          duration: 500,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: false,
        }),
        Animated.timing(pulseRef, {
          toValue: 1,
          duration: 500,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: false,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [currentStreak, pulseDay, pulseRef]);

  const onShare = () => {
    void Share.share({
      message: `${completedCount} ışık birikti · identidade`,
    });
  };

  const renderDot = (d: number) => {
    const { x, y } = spiralXY(d);
    const color = lightColorFromNote(notes66[d - 1]);
    const op = getOp(d);
    const isPulse = pulseDay > 0 && d === pulseDay && currentStreak > 0;
    const opacityAnim = isPulse ? Animated.multiply(op, pulseRef) : op;

    return (
      <AnimatedG key={`lit-${d}`} transform={`translate(${x},${y})`} opacity={opacityAnim}>
        <Circle cx={0} cy={0} r={GLOW_R} fill={color} opacity={GLOW_OPACITY} />
        <Circle cx={0} cy={0} r={DOT_R} fill={color} opacity={1} />
      </AnimatedG>
    );
  };

  return (
    <View style={styles.wrap}>
      <View style={[styles.card, { width: contentW }]}>
        <TouchableOpacity
          style={styles.shareBtn}
          onPress={onShare}
          hitSlop={14}
          accessibilityRole="button"
          accessibilityLabel="Işık birikimini paylaş"
        >
          <Share2 size={18} color="#94A3B8" strokeWidth={2} />
        </TouchableOpacity>

        <Svg
          width={contentW}
          height={CONTAINER_H}
          viewBox={`0 0 ${VB} ${VB}`}
          style={styles.svg}
        >
          <G>
            {segments.map((seg, idx) => (
              <Path
                key={`seg-${idx}`}
                d={bezierPathD(seg.x1, seg.y1, seg.x2, seg.y2)}
                stroke="#FFFFFF"
                strokeWidth={0.3}
                opacity={0.15}
                fill="none"
              />
            ))}
          </G>
          <G>
            {Array.from({ length: 66 }, (_, i) => i + 1)
              .filter((d) => grid66[d - 1])
              .map((d) => renderDot(d))}
          </G>
        </Svg>
      </View>

      <Text style={styles.caption}>{completedCount} ışık birikti</Text>
      <Text style={styles.subcaption}>66 günde kimlik sembolün ortaya çıkacak</Text>
    </View>
  );
}

function propsEqual(a: LightAccumulationProps, b: LightAccumulationProps): boolean {
  return (
    a.dayNumber === b.dayNumber &&
    a.currentStreak === b.currentStreak &&
    sameBoolGrid(a.checkIns, b.checkIns) &&
    a.checkInNotes.length === b.checkInNotes.length &&
    a.checkInNotes.every((n, i) => n === b.checkInNotes[i])
  );
}

const LightAccumulation = memo(LightAccumulationInner, propsEqual);
export default LightAccumulation;

const styles = StyleSheet.create({
  wrap: {
    alignSelf: "center",
    alignItems: "center",
  },
  card: {
    height: CONTAINER_H,
    borderRadius: 24,
    overflow: "hidden",
    backgroundColor: "#0B0F19",
  },
  svg: {
    backgroundColor: "transparent",
  },
  shareBtn: {
    position: "absolute",
    top: 12,
    right: 12,
    zIndex: 2,
    padding: 6,
  },
  caption: {
    marginTop: 12,
    fontSize: 13,
    color: "#64748B",
    textAlign: "center",
  },
  subcaption: {
    marginTop: 4,
    fontSize: 13,
    color: "#64748B",
    textAlign: "center",
  },
});
