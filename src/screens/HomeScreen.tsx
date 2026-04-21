import React, { useState, useCallback, useRef, useEffect, useMemo } from "react";
import {
  View, Text, StyleSheet, TouchableOpacity,
  Animated, ScrollView, Modal, Pressable,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import { CompositeScreenProps } from "@react-navigation/native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import * as Haptics from "expo-haptics";
import { PenLine, X, AlertTriangle, Zap, ArrowRight } from "lucide-react-native";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { useUserStore } from "../store/userStore";
import { useCheckinsStore } from "../store/checkinsStore";
import { useMindDumpStore } from "../store/mindDumpStore";
import ConfettiAnimation from "../components/ConfettiAnimation";
import DisciplineButton from "../components/DisciplineButton";
import ConsistencyBadge from "../components/ConsistencyBadge";
import AutomaticitySlider from "../components/AutomaticitySlider";
import DailyPrincipleCard from "../components/DailyPrincipleCard";
import FiveSecondTrainer, { FiveSecondScenario } from "../components/FiveSecondTrainer";
import {
  cancelEveningReminderToday,
  scheduleEveningReminderToday,
} from "../utils/notifications";
import { Colors, Spacing, Radii, FontSizes } from "../constants/theme";
import { IDENTITY_MESSAGES, pickMessage } from "../constants/identity-copy";
import { RootStackParamList, MainTabParamList } from "../types";
import {
  buildLast14Days,
  isMissedYesterday,
  countConsecutiveMissesFromYesterday,
} from "../utils/journeyHome";
import { getMissedDayMessage } from "../utils/missProtocol";
import {
  evaluateBehavior,
  buildNudge,
  getSurfaceStatus,
  SURFACE_EMOJI,
  SURFACE_LABEL,
  type UserBehaviorState,
  type BehaviorNudge,
} from "../utils/behaviorEngine";
import { getUserState, type UserState, type Action } from "../engine";
import { useBehaviorStore } from "../store/useBehaviorStore";
import BehaviorActionCard from "../components/BehaviorActionCard";
import LiveActionModal from "../components/LiveActionModal";

type Props = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, "Home">,
  NativeStackScreenProps<RootStackParamList>
>;

const FIVE_DEFAULT: FiveSecondScenario = {
  id: "home-train",
  type: "classic",
  trigger: "Şimdi derin nefes al, omuzlarını bırak — ardından alışkanlık için tek net hareketi yap.",
  countdownDuration: 5,
  difficulty: 3,
  disciplineMuscle: "karar",
};

const FIVE_INTERVENTION: FiveSecondScenario = {
  id: "home-intervention",
  type: "micro",
  trigger: "Düşüş yakalandı. Şimdi en küçük adımı at — düşünme, sadece başla.",
  countdownDuration: 5,
  difficulty: 2,
  disciplineMuscle: "direnc",
};

export default function HomeScreen({ navigation }: Props) {
  const profile = useUserStore((s) => s.profile);
  const dayNumber = useUserStore((s) => s.dayNumber());
  const markPremiumGateShown = useUserStore((s) => s.markPremiumGateShown);

  const checkins = useCheckinsStore((s) => s.checkins);
  const { completeTodayWithRatings, getTodayCheckin, toggleToday, getStreakState, isStreakReset, completionRate } =
    useCheckinsStore();
  const mindDumpEntries = useMindDumpStore((s) => s.entries);

  const [showAutoInput, setShowAutoInput] = useState(false);
  const [showFiveSecond, setShowFiveSecond] = useState(false);
  const [interventionDismissed, setInterventionDismissed] = useState(false);
  const [confetti, setConfetti] = useState(false);
  const [liveAction, setLiveAction] = useState<Action | null>(null);

  // ── Behavior Operating System (engine/) ─────────────────────────────────
  const muscles = useBehaviorStore((s) => s.muscles);
  const recentActions = useBehaviorStore((s) => s.recentActions);
  const lastActionAt = useBehaviorStore((s) => s.lastActionAt);
  const recordAction = useBehaviorStore((s) => s.recordAction);
  const toastOpacity = useRef(new Animated.Value(0)).current;
  const toastY = useRef(new Animated.Value(20)).current;
  const [toastMsg, setToastMsg] = useState("");

  const todayCheckin = getTodayCheckin();
  const todayDone = todayCheckin?.completed ?? false;
  const streakState = getStreakState();
  const { totalDays66, rescueDaysUsedThisWeek } = streakState;
  const progress66 = Math.min(totalDays66 / 66, 1);
  const streakWasReset = isStreakReset();

  // ── Behavior Engine ─────────────────────────────────────────────────────
  const behaviorState: UserBehaviorState | null = useMemo(() => {
    if (!profile) return null;
    return evaluateBehavior(
      dayNumber,
      profile.startDate,
      checkins,
      mindDumpEntries,
      todayDone,
      totalDays66,
      completionRate(profile.startDate),
      streakState.currentStreak
    );
  }, [profile, dayNumber, checkins, mindDumpEntries, todayDone, totalDays66, streakState.currentStreak]);

  const currentNudge: BehaviorNudge | null = useMemo(() => {
    if (!behaviorState || !profile) return null;
    return buildNudge(behaviorState, profile.habitName);
  }, [behaviorState, profile]);

  const surfaceStatus = behaviorState ? getSurfaceStatus(behaviorState.riskLevel) : "on_track";

  // Behavior OS: kullanıcının ANKİ durumu + ne yapacağı
  const userState: UserState | null = useMemo(() => {
    if (!profile) return null;
    return getUserState({
      startDate: profile.startDate,
      habitName: profile.habitName,
      dayNumber,
      checkins,
      mindDumps: mindDumpEntries,
      todayDone,
      muscles,
      recentActions,
      lastActionAt,
    });
  }, [
    profile,
    dayNumber,
    checkins,
    mindDumpEntries,
    todayDone,
    muscles,
    recentActions,
    lastActionAt,
  ]);

  const handleLiveAction = useCallback(() => {
    if (!userState) return;
    if (profile?.hapticsEnabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    setLiveAction(userState.suggestedAction);
  }, [userState, profile?.hapticsEnabled]);

  const handleLiveActionComplete = useCallback(async () => {
    if (!liveAction) return;
    await recordAction(liveAction);
    setLiveAction(null);
    if (profile?.hapticsEnabled) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    showToast("Aksiyon kaydedildi. Kas çalıştı.");
  }, [liveAction, recordAction, profile?.hapticsEnabled]);

  const last14Days = useMemo(
    () => (profile ? buildLast14Days(profile.startDate, checkins) : []),
    [profile, checkins]
  );
  const missedYesterday = useMemo(
    () => (profile ? isMissedYesterday(profile.startDate, checkins) : false),
    [profile, checkins]
  );
  const consecutiveMiss = useMemo(
    () => (profile ? countConsecutiveMissesFromYesterday(profile.startDate, checkins) : 0),
    [profile, checkins]
  );
  const missInfo = !todayDone && consecutiveMiss > 0
    ? getMissedDayMessage(consecutiveMiss)
    : null;

  const dateStr = format(new Date(), "d MMMM, EEEE", { locale: tr });
  const seed = new Date().getDate() + dayNumber;
  const identityMsg = pickMessage(IDENTITY_MESSAGES.morningGreeting(dayNumber), seed);

  useEffect(() => {
    if (!profile || profile.isPremium) return;
    if (dayNumber >= 22 && !profile.premiumGateDay22Shown) {
      markPremiumGateShown("day22");
    }
  }, [dayNumber]);

  const showToast = useCallback(
    (msg: string) => {
      setToastMsg(msg);
      toastOpacity.setValue(0);
      toastY.setValue(20);
      Animated.parallel([
        Animated.timing(toastOpacity, { toValue: 1, duration: 300, useNativeDriver: true }),
        Animated.timing(toastY, { toValue: 0, duration: 300, useNativeDriver: true }),
      ]).start(() => {
        setTimeout(() => {
          Animated.parallel([
            Animated.timing(toastOpacity, { toValue: 0, duration: 400, useNativeDriver: true }),
            Animated.timing(toastY, { toValue: 20, duration: 400, useNativeDriver: true }),
          ]).start();
        }, 2600);
      });
    },
    [toastOpacity, toastY]
  );

  const runCompleteFlow = useCallback(
    async (automaticity: number, effort: number) => {
      if (!profile) return;
      if (profile.hapticsEnabled) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      await completeTodayWithRatings(dayNumber, automaticity, effort);
      await cancelEveningReminderToday();
      setConfetti(true);
      setTimeout(() => setConfetti(false), 1200);
      if (automaticity < 5 || effort > 7) {
        setShowFiveSecond(true);
      } else {
        const messages = IDENTITY_MESSAGES.checkInComplete(profile.habitName, dayNumber);
        const msg = streakWasReset
          ? IDENTITY_MESSAGES.streakReset
          : pickMessage(messages, dayNumber);
        showToast(msg);
      }
    },
    [profile, dayNumber, completeTodayWithRatings, showToast, streakWasReset]
  );

  const handleAutoSubmit = useCallback(
    async (automaticity: number, effort: number) => {
      setShowAutoInput(false);
      await runCompleteFlow(automaticity, effort);
    },
    [runCompleteFlow]
  );

  const handleDisciplinePress = useCallback(async () => {
    if (!profile) return;
    if (todayDone) {
      await toggleToday(dayNumber);
      await scheduleEveningReminderToday(profile.habitName);
      return;
    }
    setShowAutoInput(true);
  }, [profile, todayDone, toggleToday, dayNumber]);

  const handleNudgeAction = useCallback(() => {
    if (!currentNudge?.action) return;
    switch (currentNudge.action.type) {
      case "five_second":
        setShowFiveSecond(true);
        break;
      case "checkin":
        setShowAutoInput(true);
        break;
      case "minddump":
        navigation.navigate("MindDump" as any);
        break;
      case "dismiss":
        setInterventionDismissed(true);
        break;
    }
  }, [currentNudge, navigation]);

  if (!profile) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <View style={styles.center}>
          <Text style={styles.emptyText}>Yükleniyor...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const showInterventionCard =
    currentNudge &&
    !todayDone &&
    !interventionDismissed &&
    (currentNudge.type === "proactive_intervention" ||
     currentNudge.type === "comeback" ||
     currentNudge.type === "micro_commitment");

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.dayLabel}>Gün {dayNumber}</Text>
            <Text style={styles.date}>{dateStr}</Text>
          </View>
          <View style={styles.headerRight}>
            <View style={[
              styles.statusPill,
              surfaceStatus === "at_risk" && styles.statusPillYellow,
              surfaceStatus === "needs_intervention" && styles.statusPillRed,
            ]}>
              <Text style={styles.statusEmoji}>{SURFACE_EMOJI[surfaceStatus]}</Text>
              <Text style={[
                styles.statusText,
                surfaceStatus === "at_risk" && styles.statusTextYellow,
                surfaceStatus === "needs_intervention" && styles.statusTextRed,
              ]}>{SURFACE_LABEL[surfaceStatus]}</Text>
            </View>
          </View>
        </View>

        {/* Behavior Operating System — TEK aksiyon, BÜYÜK buton */}
        {userState && (
          <BehaviorActionCard state={userState} onPress={handleLiveAction} />
        )}

        <DailyPrincipleCard day={dayNumber} />

        <Text style={styles.motivationLine}>{identityMsg}</Text>

        {/* Proactive Intervention Card (legacy) — yalnız Behavior OS yokken */}
        {!userState && showInterventionCard && currentNudge && (
          <View style={[
            styles.nudgeCard,
            currentNudge.tone === "urgent" && styles.nudgeCardUrgent,
            currentNudge.tone === "warm" && styles.nudgeCardWarm,
          ]}>
            <View style={styles.nudgeHeader}>
              {currentNudge.tone === "urgent" ? (
                <AlertTriangle size={18} color={Colors.coral} strokeWidth={1.5} />
              ) : (
                <Zap size={18} color={Colors.primary} strokeWidth={1.5} />
              )}
              <Text style={[
                styles.nudgeHeadline,
                currentNudge.tone === "urgent" && { color: Colors.coral },
              ]}>{currentNudge.headline}</Text>
            </View>
            <Text style={styles.nudgeBody}>{currentNudge.body}</Text>
            <View style={styles.nudgeActions}>
              {currentNudge.action && (
                <TouchableOpacity
                  style={[
                    styles.nudgeCta,
                    currentNudge.tone === "urgent" && styles.nudgeCtaUrgent,
                  ]}
                  onPress={handleNudgeAction}
                  activeOpacity={0.8}
                >
                  <Text style={styles.nudgeCtaText}>{currentNudge.action.label}</Text>
                  <ArrowRight size={14} color="#fff" strokeWidth={2} />
                </TouchableOpacity>
              )}
              <TouchableOpacity
                onPress={() => setInterventionDismissed(true)}
                style={styles.nudgeDismiss}
              >
                <Text style={styles.nudgeDismissText}>Şimdi değil</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Habit Card */}
        <View style={styles.habitCard}>
          <Text style={styles.habitName}>{profile.habitName}</Text>
          {profile.habitAnchor ? (
            <Text style={styles.anchorLine}>📌 {profile.habitAnchor}</Text>
          ) : null}

          {missInfo && (
            <View
              style={[
                styles.missBanner,
                missInfo.type === "warning" && styles.missBannerWarn,
                missInfo.type === "reframe" && styles.missBannerRef,
              ]}
            >
              <Text style={styles.missTitle}>{missInfo.title}</Text>
              <Text style={styles.missBody}>{missInfo.body}</Text>
            </View>
          )}

          <DisciplineButton
            onPress={handleDisciplinePress}
            isCompleted={todayDone}
            isMissedYesterday={!todayDone && missedYesterday}
            todayAutoRating={todayCheckin?.automaticityRating}
          />

          <View style={styles.miniBarWrap}>
            <View style={styles.miniBarTrack}>
              <View style={[styles.miniBarFill, { width: `${progress66 * 100}%` }]} />
            </View>
            <View style={styles.progressLabels}>
              <Text style={styles.progressLabel}>{totalDays66}/66 gün</Text>
              {rescueDaysUsedThisWeek > 0 && !streakWasReset && todayDone && (
                <Text style={styles.rescueBadge}>🛡️ Kurtarma kullanıldı</Text>
              )}
            </View>
          </View>
        </View>

        {/* Post-completion nudge (celebration / identity) */}
        {todayDone && currentNudge && currentNudge.tone === "celebratory" && (
          <View style={styles.celebrationCard}>
            <Text style={styles.celebrationHeadline}>{currentNudge.headline}</Text>
            <Text style={styles.celebrationBody}>{currentNudge.body}</Text>
          </View>
        )}

        <ConsistencyBadge last14Days={last14Days} />

        {/* Mind Dump CTA */}
        <TouchableOpacity
          style={styles.mindDumpCard}
          onPress={() => navigation.navigate("MindDump" as any)}
          activeOpacity={0.8}
        >
          <PenLine size={18} color={Colors.textSecondary} strokeWidth={1.5} />
          <Text style={styles.mindDumpText}>
            Kafanda ne var? Bırak gitsin →
          </Text>
        </TouchableOpacity>

        <View style={{ height: 100 }} />
      </ScrollView>

      {confetti && (
        <View style={StyleSheet.absoluteFill} pointerEvents="none">
          <ConfettiAnimation trigger={confetti} />
        </View>
      )}

      {/* Automaticity Modal */}
      <Modal visible={showAutoInput} animationType="slide" transparent onRequestClose={() => setShowAutoInput(false)}>
        <Pressable style={styles.autoOverlay} onPress={() => setShowAutoInput(false)}>
          <Pressable style={styles.autoSheet} onPress={(e) => e.stopPropagation()}>
            <View style={styles.autoHeader}>
              <Text style={styles.autoTitle}>Değerlendirme</Text>
              <TouchableOpacity onPress={() => setShowAutoInput(false)} hitSlop={12}>
                <X size={22} color={Colors.textTertiary} />
              </TouchableOpacity>
            </View>
            <AutomaticitySlider dayNumber={dayNumber} onSubmit={handleAutoSubmit} />
          </Pressable>
        </Pressable>
      </Modal>

      {/* Live Action — Behavior OS countdown akışı */}
      <LiveActionModal
        visible={liveAction != null}
        action={liveAction}
        onComplete={handleLiveActionComplete}
        onCancel={() => setLiveAction(null)}
      />

      {/* Five Second Trainer Modal */}
      <Modal visible={showFiveSecond} animationType="fade" onRequestClose={() => setShowFiveSecond(false)}>
        <SafeAreaView style={styles.trainerRoot} edges={["top", "bottom"]}>
          <FiveSecondTrainer
            scenario={
              currentNudge?.type === "proactive_intervention"
                ? FIVE_INTERVENTION
                : FIVE_DEFAULT
            }
            onComplete={() => {
              showToast("Antrenman kaydedildi. Disiplin kası güçleniyor.");
            }}
            onSkip={() => setShowFiveSecond(false)}
          />
        </SafeAreaView>
      </Modal>

      {/* Toast */}
      <Animated.View
        style={[
          styles.toast,
          { opacity: toastOpacity, transform: [{ translateY: toastY }] },
        ]}
        pointerEvents="none"
      >
        <Text style={styles.toastText}>{toastMsg}</Text>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  scroll: { paddingHorizontal: Spacing.lg, flexGrow: 1 },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  emptyText: {
    fontSize: FontSizes.md,
    fontFamily: "Inter_400Regular",
    color: Colors.textSecondary,
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    paddingTop: Spacing.md,
    marginBottom: Spacing.md,
  },
  headerRight: { alignItems: "flex-end", gap: Spacing.xs },
  dayLabel: {
    fontSize: FontSizes.xxl,
    fontFamily: "Inter_500Medium",
    color: Colors.textPrimary,
  },
  date: {
    fontSize: FontSizes.sm,
    fontFamily: "Inter_400Regular",
    color: Colors.textTertiary,
    marginTop: 2,
    textTransform: "capitalize",
  },
  statusPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: Colors.primaryLight,
    borderRadius: Radii.pill,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    marginTop: 4,
  },
  statusPillYellow: { backgroundColor: "rgba(243, 156, 18, 0.12)" },
  statusPillRed: { backgroundColor: Colors.coralLight },
  statusEmoji: { fontSize: 10 },
  statusText: {
    fontSize: FontSizes.xs,
    fontFamily: "Inter_500Medium",
    color: Colors.primary,
  },
  statusTextYellow: { color: "#D4A017" },
  statusTextRed: { color: Colors.coral },
  motivationLine: {
    fontSize: FontSizes.md,
    fontFamily: "Inter_400Regular",
    color: Colors.textSecondary,
    marginBottom: Spacing.lg,
    fontStyle: "italic",
  },
  // ── Nudge Card ────────────────────────────────────────────────────────
  nudgeCard: {
    backgroundColor: Colors.primaryLight,
    borderRadius: Radii.card,
    borderWidth: 1,
    borderColor: "rgba(29, 158, 117, 0.2)",
    padding: Spacing.md,
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  nudgeCardUrgent: {
    backgroundColor: Colors.coralLight,
    borderColor: "rgba(216, 90, 48, 0.25)",
  },
  nudgeCardWarm: {
    backgroundColor: "rgba(243, 156, 18, 0.08)",
    borderColor: "rgba(243, 156, 18, 0.2)",
  },
  nudgeHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  nudgeHeadline: {
    fontSize: FontSizes.md,
    fontFamily: "Inter_500Medium",
    color: Colors.primary,
    flex: 1,
  },
  nudgeBody: {
    fontSize: FontSizes.sm,
    fontFamily: "Inter_400Regular",
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  nudgeActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    marginTop: Spacing.xs,
  },
  nudgeCta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: Colors.primary,
    borderRadius: Radii.button,
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
  },
  nudgeCtaUrgent: { backgroundColor: Colors.coral },
  nudgeCtaText: {
    fontSize: FontSizes.sm,
    fontFamily: "Inter_500Medium",
    color: "#fff",
  },
  nudgeDismiss: { paddingHorizontal: Spacing.sm, paddingVertical: 10 },
  nudgeDismissText: {
    fontSize: FontSizes.sm,
    fontFamily: "Inter_400Regular",
    color: Colors.textTertiary,
  },
  // ── Habit Card ────────────────────────────────────────────────────────
  habitCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radii.card,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.lg,
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  missBanner: {
    backgroundColor: Colors.primaryLight,
    borderRadius: Radii.button,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: "rgba(29, 158, 117, 0.25)",
  },
  missBannerWarn: { backgroundColor: "rgba(243, 156, 18, 0.12)" },
  missBannerRef: { backgroundColor: Colors.purpleLight, borderColor: "rgba(83, 74, 183, 0.2)" },
  missTitle: { fontSize: FontSizes.md, fontFamily: "Inter_500Medium", color: Colors.textPrimary },
  missBody: { fontSize: FontSizes.sm, color: Colors.textSecondary, lineHeight: 20, marginTop: 4 },
  habitName: {
    fontSize: FontSizes.xl,
    fontFamily: "Inter_500Medium",
    color: Colors.textPrimary,
  },
  anchorLine: {
    fontSize: FontSizes.sm,
    fontFamily: "Inter_400Regular",
    color: Colors.textSecondary,
  },
  miniBarWrap: { gap: Spacing.xs, marginTop: Spacing.xs },
  miniBarTrack: {
    height: 3,
    backgroundColor: Colors.border,
    borderRadius: 9999,
    overflow: "hidden",
  },
  miniBarFill: {
    height: "100%",
    backgroundColor: Colors.primary,
    borderRadius: 9999,
  },
  progressLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  progressLabel: { fontSize: FontSizes.xs, color: Colors.textTertiary },
  rescueBadge: { fontSize: FontSizes.xs, color: Colors.textTertiary },
  // ── Celebration ───────────────────────────────────────────────────────
  celebrationCard: {
    backgroundColor: Colors.primaryLight,
    borderRadius: Radii.card,
    padding: Spacing.md,
    gap: Spacing.xs,
    marginBottom: Spacing.md,
    alignItems: "center",
  },
  celebrationHeadline: {
    fontSize: FontSizes.md,
    fontFamily: "Inter_500Medium",
    color: Colors.primary,
    textAlign: "center",
  },
  celebrationBody: {
    fontSize: FontSizes.sm,
    fontFamily: "Inter_400Regular",
    color: Colors.textSecondary,
    textAlign: "center",
    lineHeight: 20,
  },
  // ── Other ─────────────────────────────────────────────────────────────
  mindDumpCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    backgroundColor: Colors.surface,
    borderRadius: Radii.card,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.md,
  },
  mindDumpText: {
    fontSize: FontSizes.md,
    fontFamily: "Inter_400Regular",
    color: Colors.textSecondary,
    flex: 1,
  },
  toast: {
    position: "absolute",
    bottom: 96,
    left: Spacing.lg,
    right: Spacing.lg,
    backgroundColor: Colors.textPrimary,
    borderRadius: Radii.card,
    padding: Spacing.md,
    zIndex: 200,
  },
  toastText: {
    fontSize: FontSizes.sm,
    fontFamily: "Inter_400Regular",
    color: "#fff",
    lineHeight: 20,
    textAlign: "center",
  },
  autoOverlay: { flex: 1, backgroundColor: Colors.overlay, justifyContent: "flex-end" },
  autoSheet: {
    backgroundColor: Colors.bg,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "92%",
    paddingBottom: Spacing.lg,
  },
  autoHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.xs,
  },
  autoTitle: { fontSize: FontSizes.lg, fontFamily: "Inter_500Medium", color: Colors.textPrimary },
  trainerRoot: { flex: 1, backgroundColor: "#1a1a2e" },
});
