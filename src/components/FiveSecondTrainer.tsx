import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Vibration,
  Platform,
  ScrollView,
} from "react-native";
import * as Haptics from "expo-haptics";
import { useUserStore } from "../store/userStore";
import { Spacing, FontSizes, Radii } from "../constants/theme";

const BG = "#1a1a2e";
const RED = "#e74c3c";
const GREEN = "#27ae60";
const GOLD = "#f1c40f";

export interface FiveSecondScenario {
  id: string;
  type: "classic" | "reverse" | "surprise" | "micro";
  trigger: string;
  countdownDuration: number;
  difficulty: number;
  disciplineMuscle: "karar" | "direnc" | "baglam" | "enerji" | "sosyal";
}

export interface FiveSecondTrainerProps {
  scenario: FiveSecondScenario;
  onComplete: (success: boolean, reactionTimeMs: number) => void;
  onSkip: () => void;
}

const MUSCLE_TITLE: Record<FiveSecondScenario["disciplineMuscle"], string> = {
  karar: "KARAR ANLIK KASI ANTRENMANI",
  direnc: "DİRENÇ KASI ANTRENMANI",
  baglam: "BAĞLAM KASI ANTRENMANI",
  enerji: "ENERJİ KASI ANTRENMANI",
  sosyal: "SOSYAL BASKI KASI ANTRENMANI",
};

const RESULT_TITLES: Record<FiveSecondScenario["disciplineMuscle"], string> = {
  karar: "KARAR ANLIK KASI GÜÇLENDİ",
  direnc: "DİRENÇ KASI GÜÇLENDİ",
  baglam: "BAĞLAM KASI GÜÇLENDİ",
  enerji: "ENERJİ KASI GÜÇLENDİ",
  sosyal: "SOSYAL BASKI KASI GÜÇLENDİ",
};

function shortVibrate(hapticsEnabled: boolean) {
  if (!hapticsEnabled) return;
  if (Platform.OS === "android") {
    Vibration.vibrate(100);
  } else {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  }
}

function renderStars(d: number) {
  const n = Math.min(5, Math.max(0, d));
  return Array.from({ length: 5 }, (_, i) => (i < n ? "★" : "☆")).join("");
}

type Phase = "ready" | "counting" | "action" | "result";

/**
 * 5 Saniye Kuralı — disiplin antrenmanı (koyu tam ekran; üst sarmalayan Modal kullanın).
 */
export default function FiveSecondTrainer({
  scenario,
  onComplete,
  onSkip,
}: FiveSecondTrainerProps) {
  const hapticsEnabled = useUserStore((s) => s.profile?.hapticsEnabled ?? true);

  const [phase, setPhase] = useState<Phase>("ready");
  const [count, setCount] = useState(scenario.countdownDuration);
  const [xpShow, setXpShow] = useState(0);

  const actionStartedAt = useRef<number>(0);
  const yaptimDone = useRef(false);

  const pulse = useRef(new Animated.Value(1)).current;
  const pulseLoopRef = useRef<Animated.CompositeAnimation | null>(null);
  const shakeX = useRef(new Animated.Value(0)).current;

  const stopPulse = useCallback(() => {
    if (pulseLoopRef.current) {
      pulseLoopRef.current.stop();
      pulseLoopRef.current = null;
    }
    pulse.setValue(1);
  }, [pulse]);

  useEffect(() => {
    if (phase !== "counting") {
      stopPulse();
      return;
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1.2,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ])
    );
    pulseLoopRef.current = loop;
    loop.start();
    return () => {
      loop.stop();
      pulseLoopRef.current = null;
      pulse.setValue(1);
    };
  }, [phase, stopPulse, pulse]);

  useEffect(() => {
    if (phase !== "counting") return;

    setCount(scenario.countdownDuration);
    shortVibrate(hapticsEnabled);

    let remaining = scenario.countdownDuration;
    const id = setInterval(() => {
      remaining -= 1;
      if (remaining < 1) {
        clearInterval(id);
        setPhase("action");
        return;
      }
      setCount(remaining);
      shortVibrate(hapticsEnabled);
    }, 1000);

    return () => clearInterval(id);
  }, [phase, scenario.countdownDuration, hapticsEnabled]);

  useEffect(() => {
    if (phase !== "action") return;
    actionStartedAt.current = Date.now();
    yaptimDone.current = false;
    shakeX.setValue(0);
    Animated.sequence([
      Animated.timing(shakeX, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeX, { toValue: -10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeX, { toValue: 0, duration: 50, useNativeDriver: true }),
    ]).start();
  }, [phase, shakeX]);

  const handleYaptim = () => {
    if (phase !== "action" || yaptimDone.current) return;
    yaptimDone.current = true;
    const ms = Date.now() - actionStartedAt.current;
    if (hapticsEnabled) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    const baseXp = Math.max(1, scenario.difficulty) * 10;
    setXpShow(baseXp);
    onComplete(true, ms);
    setPhase("result");
  };

  const handleStart = () => {
    if (hapticsEnabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    }
    setPhase("counting");
  };

  const title = MUSCLE_TITLE[scenario.disciplineMuscle];
  const stars = renderStars(scenario.difficulty);

  return (
    <View style={styles.root} accessibilityLabel="5 saniye disiplin antrenmanı">
      <ScrollView
        contentContainerStyle={styles.scroll}
        bounces={false}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.top}>
          <Text style={styles.kicker}>disiplin koçu</Text>
          <Text style={styles.muscleTitle}>{title}</Text>
          <Text style={styles.stars} accessibilityLabel={`Zorluk ${stars}`}>
            {stars}
          </Text>
        </View>

        {phase === "ready" && (
          <View style={styles.block}>
            <Text style={styles.trigger}>{scenario.trigger}</Text>
            <Text style={styles.hintReady}>
              Hazır olduğunda başla. Geriye sayım başlayacak.
            </Text>
            <TouchableOpacity
              style={styles.btnRed}
              onPress={handleStart}
              activeOpacity={0.85}
            >
              <Text style={styles.btnRedText}>BAŞLA</Text>
            </TouchableOpacity>
          </View>
        )}

        {phase === "counting" && (
          <View style={styles.countBlock}>
            <Animated.Text
              style={[
                styles.hugeCount,
                { transform: [{ scale: pulse }] },
              ]}
            >
              {count}
            </Animated.Text>
          </View>
        )}

        {phase === "action" && (
          <Animated.View style={[styles.block, { transform: [{ translateX: shakeX }] }]}>
            <Text style={styles.simdi}>ŞİMDİ!</Text>
            <Text style={styles.actionHint}>
              Davranışını gerçekleştir, sonra buraya bas
            </Text>
            <TouchableOpacity
              style={styles.btnGreen}
              onPress={handleYaptim}
              activeOpacity={0.9}
            >
              <Text style={styles.btnGreenText}>YAPTIM ✓</Text>
            </TouchableOpacity>
          </Animated.View>
        )}

        {phase === "result" && (
          <View style={styles.block}>
            <Text style={styles.resultTitle}>
              {RESULT_TITLES[scenario.disciplineMuscle]}
            </Text>
            <Text style={styles.xpText}>+{xpShow} XP</Text>
            <Text style={styles.growthText}>
              Başarısız bile olsan +5 XP kazanırsın. Growth mindset.
            </Text>
          </View>
        )}
      </ScrollView>

      <View style={styles.skipWrap}>
        <TouchableOpacity onPress={onSkip} hitSlop={12} accessibilityLabel="Antrenmanı atla">
          <Text style={styles.skipText}>Bugün antrenman istemiyorum</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: BG, paddingTop: Spacing.lg },
  scroll: { flexGrow: 1, paddingHorizontal: Spacing.lg, paddingBottom: 56 },
  top: { alignItems: "center", marginBottom: Spacing.xl },
  kicker: {
    fontSize: FontSizes.xs,
    color: "rgba(255,255,255,0.45)",
    textTransform: "uppercase",
    letterSpacing: 1.2,
  },
  muscleTitle: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
    color: "rgba(255,255,255,0.92)",
    textAlign: "center",
    marginTop: Spacing.sm,
    lineHeight: 20,
  },
  stars: {
    fontSize: 18,
    color: GOLD,
    marginTop: Spacing.md,
  },
  block: { alignItems: "center", paddingVertical: Spacing.lg, gap: Spacing.md },
  trigger: {
    fontSize: FontSizes.xl,
    fontFamily: "Inter_500Medium",
    color: "#fff",
    textAlign: "center",
    lineHeight: 28,
  },
  hintReady: {
    fontSize: FontSizes.md,
    fontFamily: "Inter_400Regular",
    color: "rgba(255,255,255,0.65)",
    textAlign: "center",
    lineHeight: 22,
  },
  btnRed: {
    backgroundColor: RED,
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: Radii.button,
    marginTop: Spacing.lg,
  },
  btnRedText: {
    color: "#fff",
    fontSize: FontSizes.lg,
    fontFamily: "Inter_500Medium",
    letterSpacing: 1,
  },
  countBlock: { alignItems: "center", justifyContent: "center", minHeight: 200 },
  hugeCount: {
    fontSize: 120,
    fontFamily: "Inter_500Medium",
    color: "#fff",
  },
  simdi: {
    fontSize: 48,
    fontFamily: "Inter_500Medium",
    color: GREEN,
  },
  actionHint: {
    fontSize: FontSizes.md,
    color: "rgba(255,255,255,0.7)",
    textAlign: "center",
  },
  btnGreen: {
    backgroundColor: GREEN,
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: Radii.button,
    marginTop: Spacing.lg,
  },
  btnGreenText: { color: "#fff", fontSize: FontSizes.lg, fontFamily: "Inter_500Medium" },
  resultTitle: {
    fontSize: 14,
    color: "rgba(255,255,255,0.85)",
    textAlign: "center",
    fontFamily: "Inter_500Medium",
  },
  xpText: {
    fontSize: 42,
    color: GOLD,
    fontFamily: "Inter_500Medium",
  },
  growthText: {
    fontSize: FontSizes.sm,
    color: "rgba(255,255,255,0.55)",
    textAlign: "center",
    lineHeight: 20,
  },
  skipWrap: { padding: Spacing.lg, paddingBottom: Spacing.xl, alignItems: "center" },
  skipText: { fontSize: FontSizes.xs, color: "rgba(255,255,255,0.4)" },
});
