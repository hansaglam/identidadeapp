import React, { useState, useCallback, useRef, useEffect, useMemo } from "react";
import type { HeroActionSectionHandle } from "../components/home";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Easing,
  InteractionManager,
  ScrollView,
  Modal,
  Pressable,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  BottomTabScreenProps,
  useBottomTabBarHeight,
} from "@react-navigation/bottom-tabs";
import { CompositeScreenProps } from "@react-navigation/native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import * as Haptics from "expo-haptics";
import { Ionicons } from "@expo/vector-icons";
import { ChevronRight } from "lucide-react-native";
import { format, parseISO, startOfDay, addDays } from "date-fns";
import { useTranslation } from "react-i18next";
import { useFocusEffect, useRoute, RouteProp } from "@react-navigation/native";
import { getDateFnsLocale } from "../utils/dateFnsLocale";

import { useUserStore } from "../store/userStore";
import { useCheckinsStore } from "../store/checkinsStore";
import { useMindDumpStore } from "../store/mindDumpStore";
import { useHabitStore } from "../store/habitStore";
import { useTomorrowPlanStore } from "../store/tomorrowPlanStore";
import FiveSecondTrainer, { FiveSecondScenario } from "../components/FiveSecondTrainer";
import {
  cancelEveningReminderToday,
  setupNotifications,
} from "../utils/notifications";
import { Colors, Spacing, Radii, FontSizes, Shadows } from "../constants/theme";
import { IDENTITY_MESSAGES, pickMessage } from "../constants/identity-copy";
import { IDENTITY_TEMPLATES, getIdentitySlugForTag } from "../constants/identityTemplates";
import { RootStackParamList, MainTabParamList, UserProfile } from "../types";
import { buildCalendarWeekAroundToday, countConsecutiveMissesFromYesterday } from "../utils/journeyHome";
import { trackEvent } from "../utils/analytics";
import { shouldTriggerProactiveIntervention } from "../utils/interventionEngine";
import ProactiveInterventionModal from "../components/ProactiveInterventionModal";
import CheckInConfirmationSheet from "../components/CheckInConfirmationSheet";
import AutomaticitySlider from "../components/AutomaticitySlider";
import HabitStackingModal from "../components/HabitStackingModal";
import Journey66CompleteModal from "../components/Journey66CompleteModal";
import PremiumGateModal from "../components/PremiumGateModal";
import { getAverageAutomaticity } from "../utils/profileMetrics";
import {
  shouldOpenStackingModalOnFocus,
  getStackingModalCopyVariant,
} from "../utils/stackingModalRules";
import { useBehaviorStore } from "../store/useBehaviorStore";
import { useSDTStore } from "../store/sdtStore";
import { getUserState } from "../engine/behaviorEngine";
import { getActionById } from "../engine/actions";
import { buildUserBehaviorData } from "../utils/buildUserBehaviorData";
import FirstWeekGuideCard from "../components/FirstWeekGuideCard";
import MiniAutoTrend from "../components/MiniAutoTrend";
import { buildAutomaticitySeriesLastDays } from "../utils/automaticityChart";

import {
  HeroActionSection,
  ActionBeforeCheckInSheet,
  MissRecoveryCard,
  CheckInSection,
  HomeTomorrowPlansSection,
  WeeklySummaryStrip,
  DailyCoachCard,
  WeeklyCoachPulseCard,
  TaskDetailSheet,
} from "../components/home";
import { hasCompletedActionToday } from "../utils/behaviorToday";
import {
  getLocalizedIdentityLine,
  getLocalizedHabitTitle,
} from "../i18n/localizeContent";

type Props = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, "Home">,
  NativeStackScreenProps<RootStackParamList>
>;

function getTimeGreetingKey(hour: number): "morning" | "afternoon" | "evening" | "night" {
  if (hour >= 5 && hour < 12) return "morning";
  if (hour >= 12 && hour < 17) return "afternoon";
  if (hour >= 17 && hour < 21) return "evening";
  return "night";
}

function getIdentityLine(profile: UserProfile): string {
  return getLocalizedIdentityLine(profile);
}

export default function HomeScreen({ navigation }: Props) {
  const { t, i18n: i18nInstance } = useTranslation();
  const route = useRoute<RouteProp<MainTabParamList, "Home">>();
  const tabBarHeight = useBottomTabBarHeight();
  const profile = useUserStore((s) => s.profile);
  const profileLoadFailed = useUserStore((s) => s.profileLoadFailed);
  const loadProfileAgain = useUserStore((s) => s.loadProfile);
  const dayNumber = useUserStore((s) => s.dayNumber());
  const markPremiumGateShown = useUserStore((s) => s.markPremiumGateShown);
  const addDisciplineMuscleXp = useUserStore((s) => s.addDisciplineMuscleXp);
  const updateProfile = useUserStore((s) => s.updateProfile);

  const checkins = useCheckinsStore((s) => s.checkins);
  const { completeTodayWithRatings, getTodayCheckin, getStreakState } = useCheckinsStore();
  const mindDumpEntries = useMindDumpStore((s) => s.entries);
  const listsByDate = useTomorrowPlanStore((s) => s.listsByDate);
  const loadTomorrowPlans = useTomorrowPlanStore((s) => s.load);
  const markTodayPlanCompleted = useTomorrowPlanStore((s) => s.markDayCompleted);
  const togglePlanItem = useTomorrowPlanStore((s) => s.toggleItem);

  const behaviorMuscles = useBehaviorStore((s) => s.muscles);
  const behaviorRecent = useBehaviorStore((s) => s.recentActions);
  const behaviorLastAt = useBehaviorStore((s) => s.lastActionAt);
  const behaviorTotalActions = useBehaviorStore((s) => s.totalActions);
  const latestSdt = useSDTStore((s) => s.latestScore());

  const [showFiveSecond, setShowFiveSecond] = useState(false);
  const [showProactiveModal, setShowProactiveModal] = useState(false);
  const [showStackingModal, setShowStackingModal] = useState(false);
  const [show66CompleteModal, setShow66CompleteModal] = useState(false);
  const [showPremiumGate, setShowPremiumGate] = useState(false);
  const isPremium = profile?.isPremium ?? false;
  const [checkInAnimating, setCheckInAnimating] = useState(false);
  const [streakRoll, setStreakRoll] = useState<{ from: number; to: number } | null>(null);
  const [calendarToday, setCalendarToday] = useState(() => format(new Date(), "yyyy-MM-dd"));
  const habit = useHabitStore((s) => s.habit);
  const [showTaskSheet, setShowTaskSheet] = useState(false);
  const [showCheckInSheet, setShowCheckInSheet] = useState(false);
  const [showAutomaticitySheet, setShowAutomaticitySheet] = useState(false);
  const [showActionGate, setShowActionGate] = useState(false);
  const [pendingCheckInAfterAction, setPendingCheckInAfterAction] = useState(false);
  const [clockHour, setClockHour] = useState(() => new Date().getHours());
  const heroActionRef = useRef<HeroActionSectionHandle>(null);

  const confirmationSlug = useMemo(
    () =>
      habit?.identitySlug ??
      (profile ? getIdentitySlugForTag(profile.identityTagId) : "custom"),
    [habit?.identitySlug, profile]
  );

  const toastOpacity = useRef(new Animated.Value(0)).current;
  const toastY = useRef(new Animated.Value(20)).current;
  const [toastMsg, setToastMsg] = useState("");
  const tickScale = useRef(new Animated.Value(1)).current;
  const ctaPressScale = useRef(new Animated.Value(1)).current;
  const streakSlide = useRef(new Animated.Value(0)).current;
  const entranceHeader = useRef(new Animated.Value(0)).current;
  const entranceButton = useRef(new Animated.Value(0)).current;
  const entranceCards = useRef([0, 1, 2].map(() => new Animated.Value(0))).current;

  const checkingRef = useRef(false);
  const scrollRef = useRef<ScrollView>(null);
  const proactiveHandledRef = useRef<string | null>(null);

  // --- Derived data ---

  useFocusEffect(
    useCallback(() => {
      void loadTomorrowPlans();
    }, [loadTomorrowPlans])
  );

  useFocusEffect(
    useCallback(() => {
      if (route.params?.openTaskSheet) {
        setShowTaskSheet(true);
        navigation.setParams({ openTaskSheet: undefined, habitId: undefined });
      }
    }, [route.params?.openTaskSheet, navigation])
  );

  const todayCheckin = getTodayCheckin();
  const todayDone = todayCheckin?.completed ?? false;
  const streakState = getStreakState();
  const todayPlanDate = calendarToday;
  const tomorrowPlanDate = useMemo(
    () => format(addDays(new Date(), 1), "yyyy-MM-dd"),
    [calendarToday]
  );
  const todayPlanList = listsByDate[todayPlanDate] ?? null;
  const todayPlanTodos = todayPlanList?.items ?? [];
  const tomorrowPlanTodos = listsByDate[tomorrowPlanDate]?.items ?? [];
  const todayPrimaryTodo = todayPlanTodos.find((item) => item.isPrimary) ?? todayPlanTodos[0] ?? null;

  const journey66Stats = useMemo(() => {
    const total = streakState.totalDays66;
    return {
      completionPct: Math.min(1, total / 66),
      avgAutomaticity: getAverageAutomaticity(checkins),
      totalCheckins: total,
    };
  }, [streakState.totalDays66, checkins]);

  const weekCells = useMemo(
    () => (profile ? buildCalendarWeekAroundToday(profile.startDate, checkins) : []),
    [profile, checkins, i18nInstance.language]
  );
  const weekDoneCount = useMemo(
    () => weekCells.filter((c) => !c.beforeJourney && !c.isFuture && c.completed).length,
    [weekCells]
  );

  const consecutiveMiss = useMemo(() => {
    if (!profile?.startDate) return 0;
    return countConsecutiveMissesFromYesterday(profile.startDate, checkins);
  }, [profile?.startDate, checkins]);

  const showRestartCard = consecutiveMiss >= 3 && !todayDone;
  const showMissRecovery = consecutiveMiss >= 1 && !todayDone && !showRestartCard;

  const checkInActionGate = profile?.checkInActionGate ?? "soft";
  const dateTitle = useMemo(
    () => format(new Date(), "EEEE, d MMMM", { locale: getDateFnsLocale() }),
    [i18nInstance.language]
  );

  const displayFirstName = useMemo(() => {
    const n = profile?.name?.trim();
    if (!n) return t("home.defaultName");
    return n.split(/\s+/)[0] ?? n;
  }, [profile?.name, t]);

  const behaviorData = useMemo(() => {
    if (!profile) return null;
    return buildUserBehaviorData({
      profile,
      habitName: profile.habitName,
      habitAnchor: profile.habitAnchor,
      dayNumber,
      checkins,
      mindDumps: mindDumpEntries,
      todayDone,
      muscles: behaviorMuscles,
      recentActions: behaviorRecent,
      lastActionAt: behaviorLastAt,
    });
  }, [profile, dayNumber, checkins, mindDumpEntries, todayDone, behaviorMuscles, behaviorRecent, behaviorLastAt]);

  const userBehaviorState = useMemo(() => {
    if (!behaviorData) return null;
    return getUserState(behaviorData);
  }, [behaviorData]);

  const hasActionToday = useMemo(
    () =>
      hasCompletedActionToday(
        behaviorRecent,
        userBehaviorState?.suggestedAction.id
      ),
    [behaviorRecent, userBehaviorState?.suggestedAction.id]
  );

  const autoSeries = useMemo(() => {
    if (!profile?.startDate) return [];
    return buildAutomaticitySeriesLastDays(profile.startDate, checkins, 7);
  }, [profile?.startDate, checkins]);

  const stackingMindEvolution = useMemo(() => {
    if (!profile?.startDate) return null;
    const start = startOfDay(parseISO(profile.startDate));
    const inJourney = mindDumpEntries
      .filter((e) => {
        try {
          const t = parseISO(e.createdAt);
          return !Number.isNaN(t.getTime()) && startOfDay(t) >= start;
        } catch {
          return false;
        }
      })
      .sort((a, b) => parseISO(a.createdAt).getTime() - parseISO(b.createdAt).getTime());
    if (inJourney.length === 0) return null;
    const snippet = (text: string) => {
      const line = (text.trim().split(/\n/)[0] ?? "").trim();
      return line.length > 120 ? `${line.slice(0, 117)}…` : line;
    };
    return {
      firstSnippet: snippet(inJourney[0].content),
      lastSnippet: snippet(inJourney[inJourney.length - 1].content),
      count: inJourney.length,
    };
  }, [profile?.startDate, mindDumpEntries]);

  useEffect(() => {
    const id = setInterval(() => setClockHour(new Date().getHours()), 60_000);
    return () => clearInterval(id);
  }, []);

  const timeGreeting = useMemo(
    () => t(`home.greeting.${getTimeGreetingKey(clockHour)}`),
    [clockHour, t, i18nInstance.language]
  );

  const displayHabitName = useMemo(
    () => (profile ? getLocalizedHabitTitle(profile) : ""),
    [profile, i18nInstance.language]
  );

  const fiveDefaultScenario = useMemo<FiveSecondScenario>(
    () => ({
      id: "home-train",
      type: "classic",
      trigger: t("home.fiveDefaultTrigger"),
      countdownDuration: 5,
      difficulty: 3,
      disciplineMuscle: "karar",
    }),
    [t, i18nInstance.language]
  );

  // --- Animations ---

  useFocusEffect(
    useCallback(() => {
      if (!profile) return;
      entranceHeader.setValue(0);
      entranceButton.setValue(0);
      entranceCards.forEach((c) => c.setValue(0));
      Animated.parallel([
        Animated.timing(entranceHeader, { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.timing(entranceButton, { toValue: 1, duration: 500, delay: 100, useNativeDriver: true }),
        Animated.sequence([
          Animated.delay(200),
          Animated.stagger(
            100,
            entranceCards.map((v) =>
              Animated.timing(v, { toValue: 1, duration: 400, useNativeDriver: true })
            )
          ),
        ]),
      ]).start();
    }, [profile, entranceHeader, entranceButton, entranceCards])
  );

  useEffect(() => {
    if (!profile || profile.isPremium) return;
    if (dayNumber >= 22 && !profile.premiumGateDay22Shown) {
      markPremiumGateShown("day22");
      setShowPremiumGate(true);
    }
  }, [dayNumber, profile, markPremiumGateShown]);

  useFocusEffect(
    useCallback(() => {
      const t = format(new Date(), "yyyy-MM-dd");
      setCalendarToday(t);
      void useHabitStore.getState().rollDayIfNeeded();
      void useHabitStore.getState().reconcileFromCheckin(
        useCheckinsStore.getState().getTodayCheckin()?.completed ?? false
      );
    }, [])
  );

  useEffect(() => {
    const id = setInterval(() => {
      const n = format(new Date(), "yyyy-MM-dd");
      setCalendarToday((prev) => {
        if (prev !== n) {
          void useHabitStore.getState().rollDayIfNeeded();
          return n;
        }
        return prev;
      });
    }, 60_000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    void useHabitStore.getState().reconcileFromCheckin(todayDone);
  }, [todayDone, checkins]);

  // --- Callbacks ---

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

  const afterCheckInFollowUp = useCallback(
    async (automaticity: number, effort: number) => {
      if (!profile) return;
      if (dayNumber === 66) {
        await updateProfile({ stackingOfferPending: true });
        setShow66CompleteModal(true);
        trackEvent("journey_66_complete", {});
        return;
      }
      const streakJustReset = useCheckinsStore.getState().isStreakReset();
      if (automaticity < 5 || effort > 7) {
        setShowFiveSecond(true);
      } else {
        const messages = IDENTITY_MESSAGES.checkInComplete(profile.habitName, dayNumber);
        const msg = streakJustReset
          ? IDENTITY_MESSAGES.streakReset
          : pickMessage(messages, dayNumber);
        showToast(msg);
      }
    },
    [profile, dayNumber, showToast, updateProfile]
  );

  const finalizeStackingJourney = useCallback(
    async (nextHabitName: string, nextHabitAnchor: string) => {
      const preStackDay = useUserStore.getState().dayNumber();
      const snapAvg = getAverageAutomaticity(useCheckinsStore.getState().checkins);
      const snapDays = useCheckinsStore.getState().getStreakState().totalDays66;
      await useCheckinsStore.getState().clearAllCheckins();
      await useHabitStore.getState().resetWithJourney();
      await useUserStore.getState().stackNewJourney({
        snapshotAvgAuto: snapAvg,
        snapshotCompletedDays: snapDays,
        nextHabitName,
        nextHabitAnchor,
      });
      await useBehaviorStore.getState().reset();
      const fresh = useUserStore.getState().profile;
      if (fresh) {
        await setupNotifications(
          fresh,
          false,
          useTomorrowPlanStore.getState().listsByDate,
          useCheckinsStore.getState().checkins
        );
      }
      setShowStackingModal(false);
      void trackEvent("journey_stacked", {
        tone: getStackingModalCopyVariant(preStackDay),
        dayNumber: preStackDay,
      });
    },
    []
  );

  const markProactiveHandled = useCallback(() => {
    proactiveHandledRef.current = format(new Date(), "yyyy-MM-dd");
    setShowProactiveModal(false);
  }, []);

  const finalizeCheckIn = useCallback(
    async (automaticity: number | null, effort: number | null) => {
      if (!profile || todayDone || checkingRef.current) return;
      checkingRef.current = true;
      const prevStreak = getStreakState().currentStreak;
      const followUpAuto = automaticity ?? 5;
      const followUpEffort = effort ?? 5;
      setCheckInAnimating(true);
      if (todayPlanList?.items.length) {
        void markTodayPlanCompleted(todayPlanDate);
      }
      tickScale.setValue(0.55);
      Animated.timing(tickScale, {
        toValue: 1,
        duration: 280,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start(({ finished }) => {
        if (!finished) return;
        InteractionManager.runAfterInteractions(() => {
          setCheckInAnimating(false);
        });
      });

      void (async () => {
        try {
          const conf = useHabitStore.getState().todayCheckIn;
          const todayKey = format(new Date(), "yyyy-MM-dd");
          if (conf?.date === todayKey) {
            await completeTodayWithRatings(
              dayNumber,
              automaticity,
              effort,
              conf.note,
              conf.detail
            );
          } else {
            await completeTodayWithRatings(dayNumber, automaticity, effort);
          }
          await cancelEveningReminderToday();
          await useHabitStore.getState().markCheckedInToday();

          const nextStreak = useCheckinsStore.getState().getStreakState().currentStreak;
          if (prevStreak !== nextStreak) {
            setTimeout(() => {
              setStreakRoll({ from: prevStreak, to: nextStreak });
              streakSlide.setValue(0);
              Animated.timing(streakSlide, {
                toValue: 1,
                duration: 280,
                easing: Easing.out(Easing.cubic),
                useNativeDriver: true,
              }).start(({ finished }) => {
                if (finished) setStreakRoll(null);
              });
            }, 220);
          }

          const hadAction = hasCompletedActionToday(
            useBehaviorStore.getState().recentActions,
            userBehaviorState?.suggestedAction.id
          );
          void trackEvent("checkin_completed", {
            dayNumber,
            hadActionToday: hadAction,
            gateMode: checkInActionGate,
          });

          if (automaticity != null && effort != null) {
            void afterCheckInFollowUp(automaticity, effort);
          } else {
            showToast(t("home.toast.dayComplete"));
          }
        } finally {
          checkingRef.current = false;
        }
      })();
    },
    [
      profile,
      todayDone,
      completeTodayWithRatings,
      dayNumber,
      tickScale,
      streakSlide,
      getStreakState,
      afterCheckInFollowUp,
      todayPlanList,
      todayPlanDate,
      markTodayPlanCompleted,
      showToast,
      checkInActionGate,
      userBehaviorState?.suggestedAction.id,
    ]
  );

  const handleAutomaticitySubmit = useCallback(
    (automaticity: number, effort: number) => {
      setShowAutomaticitySheet(false);
      void finalizeCheckIn(automaticity, effort);
    },
    [finalizeCheckIn]
  );

  const handleAutomaticitySkip = useCallback(() => {
    setShowAutomaticitySheet(false);
    void finalizeCheckIn(null, null);
  }, [finalizeCheckIn]);

  const handleConfirmationSave = useCallback(
    async (note: string, detail: string | null) => {
      const dayKey = format(new Date(), "yyyy-MM-dd");
      await useHabitStore.getState().saveTodayCheckInConfirmation({ date: dayKey, note, detail });
      setShowCheckInSheet(false);
      setShowAutomaticitySheet(true);
    },
    []
  );

  const proceedToCheckInFlow = useCallback(() => {
    if (!profile || todayDone) return;
    setShowActionGate(false);
    const dayKey = format(new Date(), "yyyy-MM-dd");
    const pending = useHabitStore.getState().todayCheckIn;
    if (pending?.date === dayKey) {
      setShowAutomaticitySheet(true);
      return;
    }
    setShowCheckInSheet(true);
  }, [profile, todayDone]);

  const onCheckInPress = useCallback(() => {
    if (!profile || todayDone || checkingRef.current) return;
    if (profile.hapticsEnabled !== false) {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    Animated.sequence([
      Animated.timing(ctaPressScale, {
        toValue: 0.94,
        duration: 70,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(ctaPressScale, {
        toValue: 1,
        duration: 160,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();

    const gateOff = checkInActionGate === "off";
    const needsGate =
      !gateOff &&
      !hasActionToday &&
      userBehaviorState != null;

    if (needsGate) {
      void trackEvent("checkin_gate_shown", {
        mode: checkInActionGate,
        consecutiveMiss,
      });
      setShowActionGate(true);
      return;
    }
    proceedToCheckInFlow();
  }, [
    profile,
    todayDone,
    ctaPressScale,
    checkInActionGate,
    hasActionToday,
    userBehaviorState,
    consecutiveMiss,
    proceedToCheckInFlow,
  ]);

  const handleGateStartAction = useCallback(() => {
    void trackEvent("checkin_gate_action_first", { mode: checkInActionGate });
    setPendingCheckInAfterAction(true);
    setShowActionGate(false);
    heroActionRef.current?.openSuggestedAction();
  }, [checkInActionGate]);

  const handleGateSkipToCheckIn = useCallback(() => {
    void trackEvent("checkin_gate_skipped", { mode: checkInActionGate });
    proceedToCheckInFlow();
  }, [checkInActionGate, proceedToCheckInFlow]);

  const handleActionRecorded = useCallback(() => {
    if (pendingCheckInAfterAction) {
      setPendingCheckInAfterAction(false);
      void trackEvent("miss_recovered", { source: "action_then_checkin" });
      proceedToCheckInFlow();
    }
  }, [pendingCheckInAfterAction, proceedToCheckInFlow]);

  const handleMissStartStep = useCallback(() => {
    void trackEvent("miss_recovered", { source: "miss_card", consecutiveMiss });
    setPendingCheckInAfterAction(true);
    heroActionRef.current?.openSuggestedAction();
  }, [consecutiveMiss]);

  const handleMissOpenCheckIn = useCallback(() => {
    if (!profile || todayDone) return;
    const gateOff = checkInActionGate === "off";
    const needsGate = !gateOff && !hasActionToday && userBehaviorState != null;
    if (needsGate) {
      void trackEvent("checkin_gate_shown", {
        mode: checkInActionGate,
        source: "miss_card",
      });
      setShowActionGate(true);
      return;
    }
    proceedToCheckInFlow();
  }, [
    profile,
    todayDone,
    checkInActionGate,
    hasActionToday,
    userBehaviorState,
    proceedToCheckInFlow,
  ]);

  // --- Proactive / Stacking focus checks ---

  useFocusEffect(
    useCallback(() => {
      if (!profile || todayDone) return;
      const key = format(new Date(), "yyyy-MM-dd");
      if (proactiveHandledRef.current === key) return;
      if (shouldTriggerProactiveIntervention(profile.startDate, checkins, dayNumber, todayDone)) {
        setShowProactiveModal(true);
      }
    }, [profile, checkins, dayNumber, todayDone])
  );

  useFocusEffect(
    useCallback(() => {
      if (!profile) return;
      if (
        shouldOpenStackingModalOnFocus(dayNumber, todayDone, profile.stackingOfferPending === true) &&
        !show66CompleteModal
      ) {
        setShowStackingModal(true);
      }
    }, [profile, dayNumber, todayDone, show66CompleteModal])
  );

  useEffect(() => {
    if (todayDone) setShowProactiveModal(false);
  }, [todayDone]);

  // --- Render early-returns ---

  if (!profile) {
    if (profileLoadFailed) {
      return (
        <SafeAreaView style={styles.safe} edges={["top"]}>
          <View style={styles.profileErrorWrap}>
            <Text style={styles.profileErrorTitle}>{t("home.profileErrorTitle")}</Text>
            <Text style={styles.profileErrorBody}>{t("home.profileErrorBody")}</Text>
            <TouchableOpacity style={styles.profileErrorBtn} onPress={() => loadProfileAgain()} activeOpacity={0.85}>
              <Text style={styles.profileErrorBtnText}>{t("common.retry")}</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      );
    }
    return (
      <SafeAreaView style={styles.safe} edges={["top"]}>
        <View style={styles.center}>
          <Text style={styles.emptyText}>{t("home.loading")}</Text>
        </View>
      </SafeAreaView>
    );
  }

  // --- Streak animation prep ---

  const streakDisplay = streakState.currentStreak;
  const streakSlideY = streakSlide.interpolate({ inputRange: [0, 1], outputRange: [0, -26] });

  const headerEnterStyle = {
    opacity: entranceHeader,
    transform: [
      { translateY: entranceHeader.interpolate({ inputRange: [0, 1], outputRange: [25, 0] }) },
    ],
  };
  const cardEnterStyle = (idx: number) => ({
    opacity: entranceCards[idx]!,
    transform: [
      { translateY: entranceCards[idx]!.interpolate({ inputRange: [0, 1], outputRange: [25, 0] }) },
    ],
  });

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScrollView
        ref={scrollRef}
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: tabBarHeight + 24 }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* --- Header --- */}
        <Animated.View style={[styles.header, headerEnterStyle]}>
          <Text style={styles.dateLine}>{dateTitle}</Text>
          <View style={styles.headerMetaRow}>
            <Text style={styles.greetingSub}>{timeGreeting}, {displayFirstName}</Text>
            {streakDisplay > 0 && (
              <View style={styles.streakBadge}>
                {streakRoll ? (
                  <View style={styles.streakRollClip}>
                    <Animated.View style={{ transform: [{ translateY: streakSlideY }] }}>
                      <Text style={styles.streakBadgeText}>{t("home.streakDays", { count: streakRoll.from })}</Text>
                      <Text style={styles.streakBadgeText}>{t("home.streakDays", { count: streakRoll.to })}</Text>
                    </Animated.View>
                  </View>
                ) : (
                  <Text style={styles.streakBadgeText}>🔥 {streakDisplay}</Text>
                )}
              </View>
            )}
          </View>
        </Animated.View>

        {/* --- Miss recovery (1–2 gün kaçırma) --- */}
        {showMissRecovery ? (
          <Animated.View style={cardEnterStyle(0)}>
            <MissRecoveryCard
              consecutiveMiss={consecutiveMiss}
              suggestedActionTitle={userBehaviorState?.suggestedAction.title ?? null}
              onStartSmallestStep={handleMissStartStep}
              onOpenCheckIn={handleMissOpenCheckIn}
            />
          </Animated.View>
        ) : null}

        {/* --- Hero Action (Behavior Engine) --- */}
        {!todayDone && (
          userBehaviorState ? (
            <Animated.View style={[styles.heroWrap, cardEnterStyle(0)]}>
              <HeroActionSection
                ref={heroActionRef}
                userBehaviorState={userBehaviorState}
                habitAnchor={profile.habitAnchor}
                habitName={displayHabitName}
                hapticsEnabled={profile.hapticsEnabled !== false}
                onToast={showToast}
                onActionRecorded={handleActionRecorded}
              />
            </Animated.View>
          ) : (
            <View style={styles.heroWrap}>
              <View style={styles.heroPulse} />
            </View>
          )
        )}

        {/* --- Check-in CTA --- */}
        <CheckInSection
          todayDone={todayDone}
          checkInAnimating={checkInAnimating}
          onCheckInPress={onCheckInPress}
          streakDisplay={streakDisplay}
          streakRoll={streakRoll}
          streakSlide={streakSlide}
          tickScale={tickScale}
          ctaPressScale={ctaPressScale}
          todayPrimaryText={todayPrimaryTodo?.text ?? null}
          entranceButton={entranceButton}
        />

        {/* --- Content cards --- */}
        <Animated.View style={[styles.contentStack, cardEnterStyle(1)]}>
          <HomeTomorrowPlansSection
            todayItems={todayPlanTodos}
            todayDone={todayDone}
            planLocked={todayDone || checkInAnimating}
            onToggleToday={(id) => {
              if (todayDone || checkInAnimating) return;
              void togglePlanItem(todayPlanDate, id);
            }}
            tomorrowItems={tomorrowPlanTodos}
            onOpenJourney={() => navigation.navigate("Journey")}
          />

          {/* Identity card */}
          <TouchableOpacity
            style={styles.surfaceCard}
            activeOpacity={0.92}
            onPress={() => setShowTaskSheet(true)}
          >
            <View style={styles.cardHeaderRow}>
              <Text style={styles.cardLabel}>{t("home.identityCard", { day: dayNumber })}</Text>
              <ChevronRight size={18} color={Colors.textTertiary} strokeWidth={2} />
            </View>
            <Text style={styles.habitTitle}>{displayHabitName}</Text>
            <Text style={styles.identityLine} numberOfLines={3}>
              {getIdentityLine(profile)}
            </Text>
          </TouchableOpacity>

          <MiniAutoTrend series={autoSeries} />
        </Animated.View>

        {/* First week guide */}
        {dayNumber <= 7 && profile.firstWeekGuideDismissed !== true && (
          <View style={styles.firstWeekWrap}>
            <FirstWeekGuideCard
              dayNumber={dayNumber}
              dismissed={false}
              onDismiss={() => void updateProfile({ firstWeekGuideDismissed: true })}
              todayDone={todayDone}
              recentActionsCount={behaviorTotalActions}
              mindDumpCount={mindDumpEntries.length}
              journeyOpened={profile.hasOpenedJourneyTab === true}
              hasTomorrowPlan={tomorrowPlanTodos.length > 0}
            />
          </View>
        )}

        {/* Restart or daily tip */}
        {showRestartCard ? (
          <Animated.View style={[styles.tipSection, cardEnterStyle(2)]}>
            <Text style={styles.sectionTitle}>{t("home.restartTitle")}</Text>
            <View style={[styles.surfaceCard, styles.restartCard]}>
              <Text style={styles.restartBody}>{t("home.miss.day3.body")}</Text>
              <TouchableOpacity
                style={styles.restartBtn}
                activeOpacity={0.9}
                onPress={() => {
                  if (profile.hapticsEnabled !== false) {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }
                  scrollRef.current?.scrollTo({ y: 0, animated: true });
                }}
              >
                <Text style={styles.restartBtnText}>{t("common.continue")}</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        ) : (
          <Animated.View style={[styles.tipSection, cardEnterStyle(2)]}>
            <DailyCoachCard dayNumber={dayNumber} isPremium={isPremium} />
          </Animated.View>
        )}

        {/* Weekly summary */}
        <WeeklySummaryStrip
          weekCells={weekCells}
          calendarToday={calendarToday}
          weekDoneCount={weekDoneCount}
        />

        {dayNumber >= 7 ? (
          <Animated.View style={[styles.tipSection, cardEnterStyle(2)]}>
            <WeeklyCoachPulseCard
              startDate={profile.startDate}
              checkins={checkins}
              habitName={displayHabitName}
              dayNumber={dayNumber}
              currentStreak={streakDisplay}
              recentActions={behaviorRecent}
              latestSdt={latestSdt}
            />
          </Animated.View>
        ) : null}
      </ScrollView>

      {/* --- Modals --- */}

      <ActionBeforeCheckInSheet
        visible={showActionGate}
        strict={checkInActionGate === "strict"}
        suggestedAction={userBehaviorState?.suggestedAction ?? null}
        onStartAction={handleGateStartAction}
        onContinueCheckIn={handleGateSkipToCheckIn}
        onClose={() => setShowActionGate(false)}
      />

      <CheckInConfirmationSheet
        visible={showCheckInSheet}
        onRequestClose={() => setShowCheckInSheet(false)}
        identitySlug={confirmationSlug}
        hapticsEnabled={profile.hapticsEnabled !== false}
        onSave={handleConfirmationSave}
      />

      <Modal
        visible={showAutomaticitySheet}
        transparent
        animationType="slide"
        onRequestClose={() => setShowAutomaticitySheet(false)}
      >
        <View style={styles.autoSheetRoot}>
          <Pressable style={styles.backdrop} onPress={() => setShowAutomaticitySheet(false)} />
          <SafeAreaView edges={["bottom"]} style={styles.autoSheetSafe}>
            <View style={styles.autoSheetPanel}>
              <AutomaticitySlider dayNumber={dayNumber} onSubmit={handleAutomaticitySubmit} />
              <TouchableOpacity style={styles.autoSkipBtn} onPress={handleAutomaticitySkip} activeOpacity={0.85}>
                <Text style={styles.autoSkipText}>{t("home.autoTrend.skip")}</Text>
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        </View>
      </Modal>

      <TaskDetailSheet
        visible={showTaskSheet}
        onClose={() => setShowTaskSheet(false)}
        habitName={displayHabitName}
        identityLine={getIdentityLine(profile)}
        anchorBehavior={profile.habitAnchor}
        dayNumber={dayNumber}
        todayDone={todayDone}
        userBehaviorState={userBehaviorState}
        hapticsEnabled={profile.hapticsEnabled !== false}
        onNavigateJourney={() => navigation.navigate("Journey")}
        onToast={showToast}
      />

      <ProactiveInterventionModal
        visible={showProactiveModal}
        onDismiss={markProactiveHandled}
        onStartFiveSecond={() => {
          markProactiveHandled();
          setShowFiveSecond(true);
        }}
      />

      <PremiumGateModal
        visible={showPremiumGate}
        onClose={() => setShowPremiumGate(false)}
        trigger="day22"
      />

      <Journey66CompleteModal
        visible={show66CompleteModal}
        habitName={displayHabitName}
        completionPct={journey66Stats.completionPct}
        avgAutomaticity={journey66Stats.avgAutomaticity}
        totalCheckins={journey66Stats.totalCheckins}
        onContinue={() => {
          setShow66CompleteModal(false);
          setShowStackingModal(true);
        }}
      />

      <HabitStackingModal
        visible={showStackingModal}
        dayNumber={dayNumber}
        completedHabitName={profile.habitName}
        journeyStartDate={profile.startDate}
        checkins={checkins}
        profileMuscles={profile.disciplineMuscles}
        mindEvolution={stackingMindEvolution}
        onLater={() => {
          void trackEvent("stacking_modal_dismissed", { tone: getStackingModalCopyVariant(dayNumber), dayNumber });
          setShowStackingModal(false);
        }}
        onSameHabit={() => {
          void trackEvent("stacking_same_habit_selected", { tone: getStackingModalCopyVariant(dayNumber), dayNumber });
          void finalizeStackingJourney(profile.habitName, profile.habitAnchor);
        }}
        onPickSuggestion={(title, anchor, suggestionIndex) => {
          void trackEvent("stacking_new_habit_selected", { tone: getStackingModalCopyVariant(dayNumber), dayNumber, suggestionIndex });
          void finalizeStackingJourney(title, anchor);
        }}
      />

      <Modal visible={showFiveSecond} animationType="fade" onRequestClose={() => setShowFiveSecond(false)}>
        <SafeAreaView style={styles.trainerRoot} edges={["top", "bottom"]}>
          <FiveSecondTrainer
            scenario={fiveDefaultScenario}
            onComplete={async (_success, _ms, reward) => {
              showToast(t("home.toast.trainingRecorded"));
              const micro = getActionById("deep-breath");
              if (micro) await useBehaviorStore.getState().recordAction(micro);
              if (reward) await addDisciplineMuscleXp(reward.disciplineMuscle, reward.xp);
            }}
            onSkip={() => setShowFiveSecond(false)}
          />
        </SafeAreaView>
      </Modal>

      {/* Toast */}
      <Animated.View
        style={[
          styles.toast,
          { opacity: toastOpacity, transform: [{ translateY: toastY }], bottom: tabBarHeight + 16 },
        ]}
        pointerEvents="none"
      >
        <Text style={styles.toastText}>{toastMsg}</Text>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  scroll: { flex: 1 },
  scrollContent: { flexGrow: 1 },
  header: {
    marginHorizontal: Spacing.md,
    marginTop: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  dateLine: {
    fontSize: FontSizes.xxl,
    fontFamily: "Inter_700Bold",
    fontWeight: "700",
    color: Colors.textPrimary,
    letterSpacing: -0.3,
  },
  headerMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 6,
    gap: Spacing.sm,
  },
  greetingSub: {
    flex: 1,
    fontSize: FontSizes.sm,
    fontFamily: "Inter_400Regular",
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  streakBadge: {
    backgroundColor: Colors.goldLight,
    borderRadius: Radii.pill,
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: "rgba(184, 137, 46, 0.15)",
  },
  streakRollClip: {
    height: 20,
    overflow: "hidden",
    justifyContent: "center",
  },
  streakBadgeText: {
    color: Colors.gold,
    fontFamily: "Inter_600SemiBold",
    fontWeight: "600",
    fontSize: FontSizes.xs,
    height: 20,
    lineHeight: 20,
  },
  heroWrap: {
    marginHorizontal: Spacing.md,
    marginTop: Spacing.sm,
  },
  heroPulse: {
    height: 88,
    borderRadius: Radii.card,
    backgroundColor: Colors.border,
    opacity: 0.5,
  },
  contentStack: {
    marginHorizontal: Spacing.md,
    gap: 12,
  },
  surfaceCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radii.card,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.card,
  },
  cardHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  cardLabel: {
    fontSize: FontSizes.xs,
    fontFamily: "Inter_600SemiBold",
    fontWeight: "600",
    letterSpacing: 0.8,
    color: Colors.textTertiary,
    textTransform: "uppercase",
    marginBottom: 6,
  },
  habitTitle: {
    fontSize: FontSizes.lg,
    fontFamily: "Inter_600SemiBold",
    fontWeight: "600",
    color: Colors.textPrimary,
    lineHeight: 24,
  },
  identityLine: {
    fontSize: FontSizes.sm,
    fontFamily: "Inter_400Regular",
    color: Colors.textSecondary,
    marginTop: 6,
    lineHeight: 21,
  },
  sectionTitle: {
    fontSize: FontSizes.xs,
    fontFamily: "Inter_600SemiBold",
    fontWeight: "600",
    letterSpacing: 0.6,
    textTransform: "uppercase",
    color: Colors.textTertiary,
    marginLeft: 2,
  },
  firstWeekWrap: {
    marginHorizontal: Spacing.md,
    marginTop: 12,
  },
  tipSection: {
    marginHorizontal: Spacing.md,
    marginTop: Spacing.md,
    gap: 8,
  },
  tipCard: {
    position: "relative",
    backgroundColor: Colors.surface,
    borderRadius: Radii.card,
    padding: Spacing.md,
    paddingLeft: 38,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.soft,
  },
  tipBulb: { position: "absolute", top: 16, left: 14 },
  tipBody: {
    fontSize: FontSizes.sm,
    fontFamily: "Inter_400Regular",
    color: Colors.textSecondary,
    lineHeight: 21,
  },
  restartCard: {
    backgroundColor: Colors.coralLight,
    borderColor: "rgba(200, 107, 90, 0.25)",
  },
  restartBody: { fontSize: 14, color: "#991B1B", lineHeight: 20 },
  restartBtn: {
    marginTop: 16,
    alignSelf: "stretch",
    backgroundColor: "#EF4444",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  restartBtnText: { color: "#FFFFFF", fontSize: 15, fontWeight: "600" },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: Colors.overlay,
  },
  autoSheetRoot: { flex: 1, justifyContent: "flex-end" },
  autoSheetSafe: {
    backgroundColor: Colors.bg,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "92%",
  },
  autoSheetPanel: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.lg,
  },
  autoSkipBtn: {
    marginTop: Spacing.sm,
    paddingVertical: 12,
    alignItems: "center",
  },
  autoSkipText: {
    fontSize: FontSizes.sm,
    fontFamily: "Inter_500Medium",
    color: Colors.textTertiary,
  },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  emptyText: { fontSize: 16, color: "#64748B" },
  profileErrorWrap: { padding: Spacing.xl, gap: 12 },
  profileErrorTitle: {
    fontSize: FontSizes.lg,
    fontFamily: "Inter_600SemiBold",
    color: Colors.textPrimary,
  },
  profileErrorBody: {
    fontSize: FontSizes.sm,
    fontFamily: "Inter_400Regular",
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  profileErrorBtn: {
    alignSelf: "flex-start",
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.lg,
    paddingVertical: 12,
    borderRadius: Radii.button,
  },
  profileErrorBtnText: {
    color: "#fff",
    fontFamily: "Inter_600SemiBold",
    fontSize: FontSizes.sm,
  },
  toast: {
    position: "absolute",
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
  trainerRoot: { flex: 1, backgroundColor: "#141C26" },
});
