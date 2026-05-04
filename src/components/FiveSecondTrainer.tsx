import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
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
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import {
  Sparkles,
  Timer,
  Zap,
  CheckCircle2,
  Wind,
  Brain,
  Trophy,
  Star,
  Gamepad2,
} from "lucide-react-native";
import { useUserStore } from "../store/userStore";
import { Colors, Spacing, FontSizes, Radii } from "../constants/theme";

export interface FiveSecondScenario {
  id: string;
  type: "classic" | "reverse" | "surprise" | "micro";
  trigger: string;
  countdownDuration: number;
  difficulty: number;
  disciplineMuscle: "karar" | "direnc" | "baglam" | "energi" | "sosyal";
}

export interface FiveSecondTrainerReward {
  xp: number;
  disciplineMuscle: FiveSecondScenario["disciplineMuscle"];
}

export interface FiveSecondTrainerProps {
  scenario: FiveSecondScenario;
  onComplete: (
    success: boolean,
    reactionTimeMs: number,
    reward?: FiveSecondTrainerReward
  ) => void;
  onSkip: () => void;
}

const MUSCLE_LABEL: Record<FiveSecondScenario["disciplineMuscle"], string> = {
  karar: "Karar anlığı",
  direnc: "Direnç",
  baglam: "Bağlam",
  energi: "Enerji",
  sosyal: "Sosyal baskı",
};

const MUSCLE_FLAVOR: Record<FiveSecondScenario["disciplineMuscle"], string> = {
  karar: "Tek bir net hareket — düşünme süresini kısalt.",
  direnc: "Ertelemeyi değil, başlatmayı oyna.",
  baglam: "Ortam değişse de tetik aynı kalabilir.",
  energi: "Enerji düşükken minimum doz bile sayılır.",
  sosyal: "Dış onay beklemeden kendi başlat düğmene bas.",
};

/** Kısa, abartısız davranış bilimi çerçevesi (başlatma / tetik / tekrar). */
const SCIENCE_KICKER =
  "Net tetik + kısa süre, hedefi fiile taşımayı kolaylaştırır — her tur sinir yolunu bir kez daha işler.";

type Phase = "ready" | "counting" | "action" | "result";

const PHASE_ORDER: Phase[] = ["ready", "counting", "action", "result"];

type SpeedTier = 0 | 1 | 2;

const TIER_LABEL: Record<SpeedTier, string> = {
  0: "Çılgın refleks",
  1: "Hızlı tepki",
  2: "Tamamlandı",
};

function shortVibrate(hapticsEnabled: boolean) {
  if (!hapticsEnabled) return;
  if (Platform.OS === "android") {
    Vibration.vibrate(100);
  } else {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  }
}

function tierFromMs(ms: number): SpeedTier {
  if (ms < 1200) return 0;
  if (ms < 3200) return 1;
  return 2;
}

function tierBonus(base: number, tier: SpeedTier): number {
  if (tier === 0) return Math.round(base * 0.28);
  if (tier === 1) return Math.round(base * 0.12);
  return 0;
}

function DifficultyDots({ level }: { level: number }) {
  const n = Math.min(5, Math.max(1, Math.round(level)));
  return (
    <View style={styles.diffRow} accessibilityLabel={`Zorluk ${n} üzerinden 5`}>
      {Array.from({ length: 5 }, (_, i) => (
        <View key={i} style={[styles.diffDot, i < n && styles.diffDotOn]} />
      ))}
      <Text style={styles.diffCaption}>{n} / 5</Text>
    </View>
  );
}

function PhaseStepper({ phase }: { phase: Phase }) {
  const idx = PHASE_ORDER.indexOf(phase);
  const labels = ["Hazır", "Sayım", "GO!", "Sonuç"] as const;
  return (
    <View style={styles.stepper}>
      {labels.map((label, i) => {
        const done = i < idx;
        const active = i === idx;
        return (
          <View key={label} style={styles.stepItem}>
            <View
              style={[
                styles.stepDot,
                done && styles.stepDotDone,
                active && !done && styles.stepDotActive,
              ]}
            />
            <Text
              style={[
                styles.stepLabel,
                active && styles.stepLabelActive,
                done && styles.stepLabelDone,
              ]}
              numberOfLines={1}
            >
              {label}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

function CountdownSegments({ total, remaining }: { total: number; remaining: number }) {
  return (
    <View style={styles.segRow}>
      {Array.from({ length: total }, (_, i) => (
        <View key={i} style={[styles.seg, i < remaining && styles.segOn]} />
      ))}
    </View>
  );
}

function ResultStars({ tier }: { tier: SpeedTier }) {
  const filled = 3 - tier;
  return (
    <View style={styles.starRow}>
      {[0, 1, 2].map((i) => (
        <Star
          key={i}
          size={28}
          color={i < filled ? Colors.gold : "rgba(255,255,255,0.2)"}
          fill={i < filled ? Colors.gold : "transparent"}
          strokeWidth={1.8}
        />
      ))}
    </View>
  );
}

/**
 * 5 saniye kuralı — oyun hissi (tur, yıldız, XP bonusu) + kısa bilimsel çerçeve.
 */
export default function FiveSecondTrainer({
  scenario,
  onComplete,
  onSkip,
}: FiveSecondTrainerProps) {
  const hapticsEnabled = useUserStore((s) => s.profile?.hapticsEnabled ?? true);

  const [phase, setPhase] = useState<Phase>("ready");
  const [count, setCount] = useState(scenario.countdownDuration);
  const [xpTotal, setXpTotal] = useState(0);
  const [resultDetail, setResultDetail] = useState<{
    base: number;
    bonus: number;
    tier: SpeedTier;
    ms: number;
  } | null>(null);

  const actionStartedAt = useRef<number>(0);
  const yaptimDone = useRef(false);

  const pulse = useRef(new Animated.Value(1)).current;
  const pulseLoopRef = useRef<Animated.CompositeAnimation | null>(null);
  const shakeX = useRef(new Animated.Value(0)).current;
  const resultPop = useRef(new Animated.Value(0)).current;

  const sessionTag = useMemo(
    () => `#${scenario.id.slice(-4).toUpperCase() || "0000"}`,
    [scenario.id]
  );

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
          toValue: 1.07,
          duration: 450,
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 1,
          duration: 450,
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
      Animated.timing(shakeX, { toValue: 8, duration: 45, useNativeDriver: true }),
      Animated.timing(shakeX, { toValue: -8, duration: 45, useNativeDriver: true }),
      Animated.timing(shakeX, { toValue: 0, duration: 45, useNativeDriver: true }),
    ]).start();
  }, [phase, shakeX]);

  useEffect(() => {
    if (phase !== "result") {
      resultPop.setValue(0);
      return;
    }
    Animated.spring(resultPop, {
      toValue: 1,
      friction: 6,
      tension: 80,
      useNativeDriver: true,
    }).start();
  }, [phase, resultPop]);

  const handleYaptim = () => {
    if (phase !== "action" || yaptimDone.current) return;
    yaptimDone.current = true;
    const ms = Date.now() - actionStartedAt.current;
    if (hapticsEnabled) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    const base = Math.max(1, scenario.difficulty) * 10;
    const tier = tierFromMs(ms);
    const bonus = tierBonus(base, tier);
    const total = base + bonus;
    setResultDetail({ base, bonus, tier, ms });
    setXpTotal(total);
    onComplete(true, ms, {
      xp: total,
      disciplineMuscle: scenario.disciplineMuscle,
    });
    setPhase("result");
  };

  const handleStart = () => {
    if (hapticsEnabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    }
    setPhase("counting");
  };

  const handleDone = () => onSkip();

  const muscle = MUSCLE_LABEL[scenario.disciplineMuscle];
  const flavor = MUSCLE_FLAVOR[scenario.disciplineMuscle];

  const resultScale = resultPop.interpolate({
    inputRange: [0, 1],
    outputRange: [0.92, 1],
  });

  return (
    <View style={styles.root} accessibilityLabel="5 saniye mini görev">
      <LinearGradient
        colors={["#0a1c18", "#122620", "#181816"]}
        locations={[0, 0.5, 1]}
        start={{ x: 0.15, y: 0 }}
        end={{ x: 0.85, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <LinearGradient
        colors={["rgba(29,158,117,0.22)", "transparent", "rgba(83,74,183,0.08)"]}
        start={{ x: 0.3, y: 0 }}
        end={{ x: 0.7, y: 1 }}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />

      <ScrollView
        contentContainerStyle={styles.scroll}
        bounces={false}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={styles.hudRow}>
            <View style={styles.badge}>
              <Gamepad2 size={15} color={Colors.primary} strokeWidth={2.2} />
              <Text style={styles.badgeText}>Mini görev</Text>
              <Text style={styles.sessionTag}>{sessionTag}</Text>
            </View>
            <View style={styles.roundPill}>
              <Text style={styles.roundPillText}>
                {scenario.countdownDuration} sn
              </Text>
            </View>
          </View>

          <View style={styles.scienceStrip}>
            <Brain size={16} color="rgba(255,255,255,0.55)" strokeWidth={1.8} />
            <Text style={styles.scienceText}>{SCIENCE_KICKER}</Text>
          </View>

          <Text style={styles.headline}>{muscle}</Text>
          <Text style={styles.flavor}>{flavor}</Text>
          <DifficultyDots level={scenario.difficulty} />
          <PhaseStepper phase={phase} />
        </View>

        {phase === "ready" && (
          <View style={styles.card}>
            <View style={styles.cardIconRow}>
              <Wind size={22} color={Colors.primary} strokeWidth={1.8} />
              <Text style={styles.cardKicker}>Görev metni</Text>
            </View>
            <Text style={styles.trigger}>{scenario.trigger}</Text>

            <View style={styles.rulesBox}>
              <Text style={styles.rulesTitle}>Nasıl oynanır</Text>
              <View style={styles.ruleLine}>
                <Text style={styles.ruleNum}>1</Text>
                <Text style={styles.ruleTxt}>Başla → geri sayım bitene kadar hazır ol</Text>
              </View>
              <View style={styles.ruleLine}>
                <Text style={styles.ruleNum}>2</Text>
                <Text style={styles.ruleTxt}>GO! çıkınca alışkanlığı gerçekten yap</Text>
              </View>
              <View style={styles.ruleLine}>
                <Text style={styles.ruleNum}>3</Text>
                <Text style={styles.ruleTxt}>Bitince “Yaptım”a bas — hızın bonus XP kazandırır</Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.btnPrimary}
              onPress={handleStart}
              activeOpacity={0.88}
            >
              <Zap size={21} color="#fff" fill="#fff" strokeWidth={2} />
              <Text style={styles.btnPrimaryText}>Oyuna başla</Text>
            </TouchableOpacity>
          </View>
        )}

        {phase === "counting" && (
          <View style={styles.cardCenter}>
            <View style={styles.countIconWrap}>
              <Timer size={30} color={Colors.primary} strokeWidth={1.8} />
            </View>
            <Text style={styles.countLabel}>Geri sayım</Text>
            <CountdownSegments
              total={scenario.countdownDuration}
              remaining={count}
            />
            <Animated.Text
              style={[
                styles.hugeCount,
                { transform: [{ scale: pulse }] },
              ]}
              accessibilityLiveRegion="polite"
            >
              {count}
            </Animated.Text>
            <Text style={styles.countSub}>saniye</Text>
          </View>
        )}

        {phase === "action" && (
          <Animated.View style={[styles.card, styles.cardGo, { transform: [{ translateX: shakeX }] }]}>
            <View style={styles.goBurst}>
              <Sparkles size={22} color={Colors.gold} strokeWidth={2} />
              <Text style={styles.goTitle}>GO!</Text>
              <Sparkles size={22} color={Colors.gold} strokeWidth={2} />
            </View>
            <Text style={styles.actionHint}>
              Şimdi tek net hareketi yap. Bitince aşağıya dokun — ne kadar çabuk, o kadar çok yıldız.
            </Text>
            <TouchableOpacity
              style={styles.btnSuccess}
              onPress={handleYaptim}
              activeOpacity={0.9}
            >
              <CheckCircle2 size={24} color="#fff" strokeWidth={2} />
              <Text style={styles.btnSuccessText}>Yaptım</Text>
            </TouchableOpacity>
          </Animated.View>
        )}

        {phase === "result" && resultDetail && (
          <Animated.View
            style={[
              styles.card,
              styles.resultCard,
              { transform: [{ scale: resultScale }] },
            ]}
          >
            <View style={styles.trophyCircle}>
              <Trophy size={36} color={Colors.gold} strokeWidth={1.8} />
            </View>
            <Text style={styles.resultKicker}>Tur tamam</Text>
            <Text style={styles.resultTitle}>{TIER_LABEL[resultDetail.tier]}</Text>
            <ResultStars tier={resultDetail.tier} />
            <Text style={styles.reactionMeta}>
              Tepki süresi: {(resultDetail.ms / 1000).toFixed(1)} sn
            </Text>

            <View style={styles.xpBreak}>
              <View style={styles.xpLine}>
                <Text style={styles.xpLineLbl}>Temel XP</Text>
                <Text style={styles.xpLineVal}>+{resultDetail.base}</Text>
              </View>
              {resultDetail.bonus > 0 && (
                <View style={styles.xpLine}>
                  <Text style={styles.xpLineLbl}>Hız bonusu</Text>
                  <Text style={[styles.xpLineVal, styles.xpBonus]}>+{resultDetail.bonus}</Text>
                </View>
              )}
              <View style={[styles.xpLine, styles.xpTotalRow]}>
                <Text style={styles.xpTotalLbl}>Toplam</Text>
                <Text style={styles.xpTotalVal}>+{xpTotal} XP</Text>
              </View>
            </View>

            <Text style={styles.growthText}>
              Tekrarlar bağlantıyı güçlendirir — oyun gibi düşün: her tur bir antrenman seti.
            </Text>

            <TouchableOpacity
              style={styles.btnPrimary}
              onPress={handleDone}
              activeOpacity={0.88}
            >
              <Text style={styles.btnPrimaryText}>Devam</Text>
            </TouchableOpacity>
          </Animated.View>
        )}
      </ScrollView>

      {phase !== "result" && (
        <View style={styles.skipWrap}>
          <TouchableOpacity onPress={onSkip} hitSlop={16} accessibilityLabel="Mini görevi atla">
            <Text style={styles.skipText}>Şimdi oynamak istemiyorum</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.xl,
  },
  header: { marginBottom: Spacing.lg },
  hudRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: Spacing.sm,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(29,158,117,0.18)",
    paddingHorizontal: Spacing.md,
    paddingVertical: 7,
    borderRadius: Radii.pill,
    borderWidth: 1,
    borderColor: "rgba(29,158,117,0.35)",
    flexShrink: 1,
  },
  badgeText: {
    fontSize: FontSizes.xs,
    fontFamily: "Inter_500Medium",
    color: "rgba(255,255,255,0.92)",
  },
  sessionTag: {
    fontSize: 10,
    fontFamily: "Inter_500Medium",
    color: "rgba(255,255,255,0.45)",
  },
  roundPill: {
    backgroundColor: "rgba(255,255,255,0.08)",
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: Radii.pill,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
  },
  roundPillText: {
    fontSize: FontSizes.xs,
    fontFamily: "Inter_500Medium",
    color: "rgba(255,255,255,0.75)",
  },
  scienceStrip: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: Spacing.sm,
    backgroundColor: "rgba(83,74,183,0.12)",
    padding: Spacing.md,
    borderRadius: Radii.card,
    borderWidth: 1,
    borderColor: "rgba(83,74,183,0.22)",
    marginBottom: Spacing.md,
  },
  scienceText: {
    flex: 1,
    fontSize: FontSizes.xs,
    fontFamily: "Inter_400Regular",
    color: "rgba(255,255,255,0.62)",
    lineHeight: 17,
  },
  headline: {
    fontSize: FontSizes.xxl,
    fontFamily: "Inter_500Medium",
    color: "#fff",
    textAlign: "center",
  },
  flavor: {
    fontSize: FontSizes.sm,
    fontFamily: "Inter_400Regular",
    color: "rgba(255,255,255,0.52)",
    textAlign: "center",
    marginTop: Spacing.xs,
    lineHeight: 20,
    marginBottom: Spacing.sm,
  },
  diffRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    marginTop: Spacing.xs,
  },
  diffDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(255,255,255,0.18)",
  },
  diffDotOn: {
    backgroundColor: Colors.gold,
    shadowColor: Colors.gold,
    shadowOpacity: 0.45,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 0 },
  },
  diffCaption: {
    marginLeft: Spacing.sm,
    fontSize: FontSizes.xs,
    fontFamily: "Inter_500Medium",
    color: "rgba(255,255,255,0.45)",
  },
  stepper: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: Spacing.lg,
    paddingHorizontal: 2,
  },
  stepItem: { alignItems: "center", flex: 1, maxWidth: "25%" },
  stepDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(255,255,255,0.2)",
    marginBottom: 6,
  },
  stepDotDone: { backgroundColor: Colors.primary },
  stepDotActive: {
    backgroundColor: Colors.gold,
    width: 10,
    height: 10,
    borderRadius: 5,
    marginBottom: 5,
  },
  stepLabel: {
    fontSize: 9,
    fontFamily: "Inter_400Regular",
    color: "rgba(255,255,255,0.35)",
  },
  stepLabelActive: {
    color: "rgba(255,255,255,0.95)",
    fontFamily: "Inter_500Medium",
  },
  stepLabelDone: { color: "rgba(29,158,117,0.85)" },
  card: {
    backgroundColor: "rgba(255,255,255,0.07)",
    borderRadius: Radii.card + 4,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  cardGo: {
    borderColor: "rgba(212,160,23,0.35)",
    backgroundColor: "rgba(212,160,23,0.06)",
  },
  cardCenter: {
    backgroundColor: "rgba(255,255,255,0.07)",
    borderRadius: Radii.card + 4,
    borderWidth: 1,
    borderColor: "rgba(29,158,117,0.28)",
    paddingVertical: Spacing.xl,
    paddingHorizontal: Spacing.lg,
    alignItems: "center",
    minHeight: 240,
    justifyContent: "center",
  },
  cardIconRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  cardKicker: {
    fontSize: FontSizes.xs,
    fontFamily: "Inter_500Medium",
    color: "rgba(255,255,255,0.48)",
    textTransform: "uppercase",
    letterSpacing: 0.7,
  },
  trigger: {
    fontSize: FontSizes.lg,
    fontFamily: "Inter_500Medium",
    color: "#fff",
    lineHeight: 26,
  },
  rulesBox: {
    backgroundColor: "rgba(0,0,0,0.2)",
    borderRadius: Radii.card,
    padding: Spacing.md,
    gap: Spacing.sm,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
  },
  rulesTitle: {
    fontSize: FontSizes.xs,
    fontFamily: "Inter_500Medium",
    color: Colors.primary,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 2,
  },
  ruleLine: { flexDirection: "row", alignItems: "flex-start", gap: Spacing.sm },
  ruleNum: {
    width: 22,
    height: 22,
    borderRadius: 11,
    overflow: "hidden",
    backgroundColor: "rgba(29,158,117,0.35)",
    textAlign: "center",
    fontSize: FontSizes.xs,
    fontFamily: "Inter_500Medium",
    color: "#fff",
    lineHeight: 22,
    textAlignVertical: "center",
  },
  ruleTxt: {
    flex: 1,
    fontSize: FontSizes.sm,
    fontFamily: "Inter_400Regular",
    color: "rgba(255,255,255,0.78)",
    lineHeight: 20,
    paddingTop: 1,
  },
  btnPrimary: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: Radii.button + 2,
    marginTop: Spacing.xs,
    shadowColor: Colors.primary,
    shadowOpacity: 0.35,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
  },
  btnPrimaryText: {
    color: "#fff",
    fontSize: FontSizes.lg,
    fontFamily: "Inter_500Medium",
  },
  countIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "rgba(29,158,117,0.2)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.md,
  },
  countLabel: {
    fontSize: FontSizes.sm,
    fontFamily: "Inter_500Medium",
    color: "rgba(255,255,255,0.55)",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: Spacing.sm,
  },
  segRow: {
    flexDirection: "row",
    gap: 6,
    marginBottom: Spacing.md,
  },
  seg: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    backgroundColor: "rgba(255,255,255,0.12)",
    maxWidth: 48,
  },
  segOn: {
    backgroundColor: Colors.primary,
    shadowColor: Colors.primary,
    shadowOpacity: 0.4,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 0 },
  },
  hugeCount: {
    fontSize: 96,
    fontFamily: "Inter_500Medium",
    color: "#fff",
    lineHeight: 102,
  },
  countSub: {
    fontSize: FontSizes.md,
    fontFamily: "Inter_400Regular",
    color: "rgba(255,255,255,0.45)",
    marginTop: Spacing.xs,
  },
  goBurst: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.md,
  },
  goTitle: {
    fontSize: 44,
    fontFamily: "Inter_500Medium",
    color: Colors.gold,
    letterSpacing: 2,
  },
  actionHint: {
    fontSize: FontSizes.md,
    fontFamily: "Inter_400Regular",
    color: "rgba(255,255,255,0.72)",
    textAlign: "center",
    lineHeight: 22,
  },
  btnSuccess: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    backgroundColor: Colors.primaryDark,
    paddingVertical: 17,
    borderRadius: Radii.button + 2,
    marginTop: Spacing.sm,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.14)",
  },
  btnSuccessText: { color: "#fff", fontSize: FontSizes.lg, fontFamily: "Inter_500Medium" },
  resultCard: { alignItems: "center" },
  trophyCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: "rgba(212,160,23,0.18)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(212,160,23,0.35)",
  },
  resultKicker: {
    fontSize: FontSizes.xs,
    fontFamily: "Inter_500Medium",
    color: "rgba(255,255,255,0.45)",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginTop: Spacing.md,
  },
  resultTitle: {
    fontSize: FontSizes.xl,
    fontFamily: "Inter_500Medium",
    color: "#fff",
    textAlign: "center",
  },
  starRow: {
    flexDirection: "row",
    gap: Spacing.sm,
    marginTop: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  reactionMeta: {
    fontSize: FontSizes.sm,
    fontFamily: "Inter_400Regular",
    color: "rgba(255,255,255,0.5)",
  },
  xpBreak: {
    width: "100%",
    backgroundColor: "rgba(0,0,0,0.22)",
    borderRadius: Radii.card,
    padding: Spacing.md,
    gap: Spacing.sm,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
    marginTop: Spacing.sm,
  },
  xpLine: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  xpLineLbl: {
    fontSize: FontSizes.sm,
    fontFamily: "Inter_400Regular",
    color: "rgba(255,255,255,0.55)",
  },
  xpLineVal: {
    fontSize: FontSizes.sm,
    fontFamily: "Inter_500Medium",
    color: "rgba(255,255,255,0.85)",
  },
  xpBonus: { color: Colors.goldLight },
  xpTotalRow: {
    marginTop: Spacing.xs,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.1)",
  },
  xpTotalLbl: {
    fontSize: FontSizes.md,
    fontFamily: "Inter_500Medium",
    color: "#fff",
  },
  xpTotalVal: {
    fontSize: FontSizes.xl,
    fontFamily: "Inter_500Medium",
    color: Colors.goldLight,
  },
  growthText: {
    fontSize: FontSizes.sm,
    fontFamily: "Inter_400Regular",
    color: "rgba(255,255,255,0.48)",
    textAlign: "center",
    lineHeight: 20,
  },
  skipWrap: { paddingVertical: Spacing.md, alignItems: "center" },
  skipText: {
    fontSize: FontSizes.xs,
    fontFamily: "Inter_400Regular",
    color: "rgba(255,255,255,0.42)",
    textDecorationLine: "underline",
  },
});
