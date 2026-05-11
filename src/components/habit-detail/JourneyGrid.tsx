import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Animated,
  Easing,
  Platform,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { addDays, format, parseISO } from "date-fns";
import { tr } from "date-fns/locale";
import { Lock } from "lucide-react-native";
import { FontSizes } from "../../constants/theme";

const CELL = 22;
const CELL_MARGIN = 2;
const COLS = 11;

const COLORS = {
  completed: "#059669",
  missed: "#FECACA",
  today: "#10B981",
  future: "#E2E8F0",
  locked: "#D1D5DB",
} as const;

const CARD_SHADOW = {
  shadowColor: "#0F172A",
  shadowOpacity: 0.04,
  shadowRadius: 12,
  shadowOffset: { width: 0, height: 4 },
  elevation: 3 as const,
};

export interface JourneyGridProps {
  startDate: string;
  dayNumber: number;
  completedByDay: boolean[];
  completionPercent: number;
  lockedDays?: boolean[];
  style?: StyleProp<ViewStyle>;
}

type CellVisualState = "completed" | "missed" | "today" | "future" | "locked";

function getCellState(
  day: number,
  dayNumber: number,
  done: boolean,
  locked: boolean
): CellVisualState {
  if (locked) return "locked";
  const isToday = dayNumber <= 66 && day === dayNumber;
  if (isToday) return "today";
  if (done) return "completed";
  const isFuture = dayNumber <= 66 && day > dayNumber;
  if (isFuture) return "future";
  const isMissed =
    (dayNumber <= 66 && day < dayNumber && !done) || (dayNumber > 66 && !done);
  if (isMissed) return "missed";
  return "future";
}

function statusLabel(state: CellVisualState, done: boolean): string {
  switch (state) {
    case "completed":
      return "Tamamlandı";
    case "missed":
      return "Kaçırıldı";
    case "today":
      return done ? "Bugün · tamamlandı" : "Bugün";
    case "future":
      return "Gelecek";
    case "locked":
      return "Kilitli";
    default:
      return "";
  }
}

export default function JourneyGrid({
  startDate,
  dayNumber,
  completedByDay,
  completionPercent,
  lockedDays,
  style,
}: JourneyGridProps) {
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const tooltipOpacity = useRef(new Animated.Value(0)).current;
  const pulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1.1,
          duration: 800,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 1,
          duration: 800,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, [pulse]);

  const formatDay = useCallback(
    (day: number) => {
      const d = addDays(parseISO(startDate), day - 1);
      return format(d, "d MMMM yyyy", { locale: tr });
    },
    [startDate]
  );

  useEffect(() => {
    Animated.timing(tooltipOpacity, {
      toValue: selectedDay != null ? 1 : 0,
      duration: selectedDay != null ? 200 : 180,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }).start();
  }, [selectedDay, tooltipOpacity]);

  const tooltipText = useMemo(() => {
    if (selectedDay == null) return " ";
    const idx = selectedDay - 1;
    const done = completedByDay[idx] ?? false;
    const locked = lockedDays?.[idx] ?? false;
    const state = getCellState(selectedDay, dayNumber, done, locked);
    return `Gün ${selectedDay} · ${formatDay(selectedDay)} · ${statusLabel(state, done)}`;
  }, [selectedDay, completedByDay, dayNumber, lockedDays, formatDay]);

  const pct = Math.min(100, Math.max(0, Math.round(completionPercent)));

  const gridInnerWidth = COLS * (CELL + CELL_MARGIN * 2);

  return (
    <View style={[styles.rootCard, style]}>
      <View style={[styles.header, { width: gridInnerWidth }]}>
        <Text style={styles.headerTitle}>YOLCULUK HARİTAN</Text>
        <Text style={styles.headerPercent}>
          {pct}% tamamlandı
        </Text>
      </View>
      <View style={[styles.grid, { width: gridInnerWidth }]}>
        {Array.from({ length: 66 }, (_, i) => {
          const day = i + 1;
          const done = completedByDay[i] ?? false;
          const locked = lockedDays?.[i] ?? false;
          const state = getCellState(day, dayNumber, done, locked);
          const bg =
            state === "completed"
              ? COLORS.completed
              : state === "missed"
                ? COLORS.missed
                : state === "today"
                  ? COLORS.today
                  : state === "future"
                    ? COLORS.future
                    : COLORS.locked;

          const isTodayCell = state === "today";

          const cellInner = (
            <Pressable
              onPress={() => setSelectedDay((p) => (p === day ? null : day))}
              style={({ pressed }) => [
                styles.cell,
                {
                  backgroundColor: bg,
                  opacity: pressed ? 0.9 : 1,
                  borderWidth: isTodayCell ? 2 : 0,
                  borderColor: isTodayCell ? "#FFFFFF" : "transparent",
                },
              ]}
            >
              {state === "locked" ? (
                <View style={styles.lockWrap} pointerEvents="none">
                  <Lock size={10} color="rgba(71,85,105,0.55)" strokeWidth={2} />
                </View>
              ) : null}
            </Pressable>
          );

          return (
            <View key={day} style={styles.cellOuter}>
              {isTodayCell ? (
                <Animated.View style={[styles.todayPulse, { transform: [{ scale: pulse }] }]}>
                  <View style={styles.todayGlow}>
                    {cellInner}
                  </View>
                </Animated.View>
              ) : (
                cellInner
              )}
            </View>
          );
        })}
      </View>
      <Animated.Text style={[styles.tooltip, { opacity: tooltipOpacity }]} numberOfLines={3}>
        {tooltipText}
      </Animated.Text>
    </View>
  );
}

const styles = StyleSheet.create({
  rootCard: {
    alignSelf: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 12,
    ...CARD_SHADOW,
  },
  header: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "space-between",
    marginBottom: 12,
    alignSelf: "center",
  },
  headerTitle: {
    fontSize: 11,
    fontFamily: "Inter_700Bold",
    fontWeight: "700",
    letterSpacing: 1.5,
    color: "#94A3B8",
    textTransform: "uppercase",
    flex: 1,
  },
  headerPercent: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
    fontWeight: "600",
    color: "#059669",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignSelf: "center",
  },
  cellOuter: {},
  cell: {
    width: CELL,
    height: CELL,
    borderRadius: 5,
    margin: CELL_MARGIN,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  todayPulse: {
    alignSelf: "center",
  },
  todayGlow: {
    borderRadius: 7,
    ...Platform.select({
      ios: {
        shadowColor: "#10B981",
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.4,
        shadowRadius: 4,
      },
      android: {
        elevation: 5,
        borderWidth: 1,
        borderColor: "rgba(16, 185, 129, 0.45)",
      },
      default: {},
    }),
  },
  lockWrap: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
  },
  tooltip: {
    marginTop: 10,
    fontSize: FontSizes.sm,
    fontFamily: "Inter_400Regular",
    color: "#047857",
    textAlign: "center",
    alignSelf: "center",
    maxWidth: COLS * (CELL + CELL_MARGIN * 2) + 24,
    minHeight: 22,
  },
});
