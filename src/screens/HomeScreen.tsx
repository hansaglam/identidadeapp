import React, { useState, useCallback, useRef, useEffect, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  ScrollView,
  Modal,
  Platform,
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
import { format, parseISO, startOfDay } from "date-fns";
import { tr } from "date-fns/locale";
import { useFocusEffect } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";

import { useUserStore } from "../store/userStore";
import { useCheckinsStore } from "../store/checkinsStore";
import { useMindDumpStore } from "../store/mindDumpStore";
import { useHabitStore } from "../store/habitStore";
import FiveSecondTrainer, { FiveSecondScenario } from "../components/FiveSecondTrainer";
import {
  cancelEveningReminderToday,
  setupNotifications,
} from "../utils/notifications";
import { Colors, Spacing, Radii, FontSizes, Shadows } from "../constants/theme";
import { IDENTITY_MESSAGES, pickMessage } from "../constants/identity-copy";
import { IDENTITY_TEMPLATES, getIdentitySlugForTag } from "../constants/identityTemplates";
import { RootStackParamList, MainTabParamList, UserProfile } from "../types";
import { buildCalendarWeekAroundToday, countConsecutiveMissesFromYesterday, type CalendarWeekDayCell } from "../utils/journeyHome";
import { getMissedDayMessage } from "../utils/missProtocol";
import { trackEvent } from "../utils/analytics";
import { shouldTriggerProactiveIntervention } from "../utils/interventionEngine";
import ProactiveInterventionModal from "../components/ProactiveInterventionModal";
import CheckInConfirmationSheet from "../components/CheckInConfirmationSheet";
import HabitStackingModal from "../components/HabitStackingModal";
import { getAverageAutomaticity } from "../utils/profileMetrics";
import {
  shouldOpenStackingModalOnFocus,
  getStackingModalCopyVariant,
} from "../utils/stackingModalRules";
import { useBehaviorStore } from "../store/useBehaviorStore";
import { getUserState } from "../engine/behaviorEngine";
import { getActionById } from "../engine/actions";
import { buildUserBehaviorData } from "../utils/buildUserBehaviorData";
import BehaviorActionCard from "../components/BehaviorActionCard";
import FirstWeekGuideCard from "../components/FirstWeekGuideCard";

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

const CONFETTI_PALETTE = ["#10B981", "#34D399", "#FBBF24", "#F59E0B", "#60A5FA"] as const;
const CONFETTI_COUNT = 11;

function getTimeGreeting(hour: number): string {
  if (hour >= 5 && hour < 12) return "Günaydın ☀️";
  if (hour >= 12 && hour < 17) return "İyi günler";
  if (hour >= 17 && hour < 21) return "İyi akşamlar 🌙";
  return "İyi geceler 🌙";
}

function DoneSparkles() {
  const rotations = useRef([0, 1, 2, 3].map(() => new Animated.Value(0))).current;

  useEffect(() => {
    const loops = rotations.map((r, i) =>
      Animated.loop(
        Animated.timing(r, {
          toValue: 1,
          duration: 3200 + i * 400,
          useNativeDriver: true,
        })
      )
    );
    loops.forEach((l) => l.start());
    return () => {
      loops.forEach((l) => l.stop());
    };
  }, [rotations]);

  const spots = [
    { top: -8, left: 18 },
    { top: 12, right: -4 },
    { bottom: 14, left: -2 },
    { bottom: -6, right: 14 },
  ] as const;

  return (
    <View style={styles.sparkleHost} pointerEvents="none">
      {spots.map((pos, i) => (
        <Animated.View
          key={i}
          style={[
            styles.sparkleOrb,
            pos,
            {
              transform: [
                {
                  rotate: rotations[i]!.interpolate({
                    inputRange: [0, 1],
                    outputRange: ["0deg", "360deg"],
                  }),
                },
              ],
            },
          ]}
        >
          <Ionicons name="star" size={13} color="#FFFBEB" />
        </Animated.View>
      ))}
    </View>
  );
}

function CheckinConfettiBurst() {
  const particles = useRef(
    Array.from({ length: CONFETTI_COUNT }, () => ({
      tx: new Animated.Value(0),
      ty: new Animated.Value(0),
      op: new Animated.Value(1),
    }))
  ).current;

  useEffect(() => {
    const particleRuns = particles.map((p) => {
      const txTo = Math.random() * 100 - 50;
      const tyTo = -100 - Math.random() * 55;
      return Animated.parallel([
        Animated.timing(p.tx, { toValue: txTo, duration: 800, useNativeDriver: true }),
        Animated.timing(p.ty, { toValue: tyTo, duration: 800, useNativeDriver: true }),
        Animated.timing(p.op, { toValue: 0, duration: 800, useNativeDriver: true }),
      ]);
    });
    Animated.parallel([Animated.stagger(45, particleRuns)]).start();
  }, [particles]);

  return (
    <View style={styles.burstHost} pointerEvents="none">
      {particles.map((p, idx) => {
        const size = 6 + ((idx * 5 + 3) % 5);
        const br = Math.round(size / 2);
        return (
          <Animated.View
            key={idx}
            style={[
              styles.confettiDot,
              {
                width: size,
                height: size,
                borderRadius: br,
                marginLeft: -size / 2,
                marginTop: -size / 2,
                backgroundColor: CONFETTI_PALETTE[idx % CONFETTI_PALETTE.length],
                opacity: p.op,
                transform: [{ translateX: p.tx }, { translateY: p.ty }],
              },
            ]}
          />
        );
      })}
    </View>
  );
}

const DAILY_TIP_POOL: string[] = [
  ...Object.values(IDENTITY_MESSAGES.coachNotes),
  ...Object.values(IDENTITY_MESSAGES.phaseDescriptions),
  "İstikrar, ilhamdan uzun yaşar.",
  "Küçük tekrar, görünmez inşaat.",
  "Bugünkü adım yarının devamını kolaylaştırır.",
];

const RESTART_CARD_BODY = getMissedDayMessage(3).body;

function getIdentityLine(profile: UserProfile): string {
  const tmpl = profile.identityTagId
    ? IDENTITY_TEMPLATES.find((t) => t.id === profile.identityTagId)
    : null;
  const fromTemplate = tmpl?.identityStatement?.trim();
  const why = profile.habitWhy?.trim();
  if (fromTemplate) return fromTemplate;
  if (why) return why;
  return `${profile.habitName} yolunda ilerliyorsun.`;
}

function weekBarColor(cell: CalendarWeekDayCell, todayKey: string): string {
  const isToday = cell.dateKey === todayKey;
  if (cell.beforeJourney || cell.isFuture) {
    return "#E2E8F0";
  }
  if (cell.completed) {
    return isToday ? "#059669" : "#10B981";
  }
  if (isToday) {
    return "#059669";
  }
  return "#E2E8F0";
}

export default function HomeScreen({ navigation }: Props) {
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

  const behaviorMuscles = useBehaviorStore((s) => s.muscles);
  const behaviorRecent = useBehaviorStore((s) => s.recentActions);
  const behaviorLastAt = useBehaviorStore((s) => s.lastActionAt);
  const behaviorTotalActions = useBehaviorStore((s) => s.totalActions);

  const [showFiveSecond, setShowFiveSecond] = useState(false);
  const [showProactiveModal, setShowProactiveModal] = useState(false);
  const [showStackingModal, setShowStackingModal] = useState(false);

  const [checkInAnimating, setCheckInAnimating] = useState(false);
  const [burstKey, setBurstKey] = useState(0);
  const [streakRoll, setStreakRoll] = useState<{ from: number; to: number } | null>(null);
  const [calendarToday, setCalendarToday] = useState(() =>
    format(new Date(), "yyyy-MM-dd")
  );
  const habit = useHabitStore((s) => s.habit);
  const [showTaskSheet, setShowTaskSheet] = useState(false);
  const [showCheckInSheet, setShowCheckInSheet] = useState(false);
  const [clockHour, setClockHour] = useState(() => new Date().getHours());

  const confirmationSlug = useMemo(
    () =>
      habit?.identitySlug ??
      (profile ? getIdentitySlugForTag(profile.identityTagId) : "custom"),
    [habit?.identitySlug, profile, profile?.identityTagId]
  );

  const toastOpacity = useRef(new Animated.Value(0)).current;
  const toastY = useRef(new Animated.Value(20)).current;
  const [toastMsg, setToastMsg] = useState("");
  const tickScale = useRef(new Animated.Value(1)).current;
  const ctaPressScale = useRef(new Animated.Value(1)).current;
  const streakSlide = useRef(new Animated.Value(0)).current;
  const iconDonePulse = useRef(new Animated.Value(1)).current;
  const entranceHeader = useRef(new Animated.Value(0)).current;
  const entranceButton = useRef(new Animated.Value(0)).current;
  const entranceCards = useRef(
    [0, 1, 2].map(() => new Animated.Value(0))
  ).current;

  const checkingRef = useRef(false);
  const scrollRef = useRef<ScrollView>(null);

  const todayCheckin = getTodayCheckin();
  const todayDone = todayCheckin?.completed ?? false;
  const streakState = getStreakState();

  const proactiveHandledRef = useRef<string | null>(null);

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
      .sort(
        (a, b) => parseISO(a.createdAt).getTime() - parseISO(b.createdAt).getTime()
      );
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

  const weekCells = useMemo(
    () =>
      profile ? buildCalendarWeekAroundToday(profile.startDate, checkins) : [],
    [profile, checkins]
  );

  const weekDoneCount = useMemo(
    () =>
      weekCells.filter((c) => !c.beforeJourney && !c.isFuture && c.completed).length,
    [weekCells]
  );

  const consecutiveMiss = useMemo(() => {
    if (!profile?.startDate) return 0;
    return countConsecutiveMissesFromYesterday(profile.startDate, checkins);
  }, [profile?.startDate, checkins]);

  const showRestartCard = consecutiveMiss >= 3 && !todayDone;

  const dateTitle = format(new Date(), "EEEE, d MMMM", { locale: tr });

  const displayFirstName = useMemo(() => {
    const n = profile?.name?.trim();
    if (!n) return "dostum";
    return n.split(/\s+/)[0] ?? n;
  }, [profile?.name]);

  const dailyTip = useMemo(() => {
    const seed = dayNumber + new Date().getDate();
    return pickMessage(DAILY_TIP_POOL, seed);
  }, [dayNumber]);

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
  }, [
    profile,
    dayNumber,
    checkins,
    mindDumpEntries,
    todayDone,
    behaviorMuscles,
    behaviorRecent,
    behaviorLastAt,
  ]);

  const userBehaviorState = useMemo(() => {
    if (!behaviorData) return null;
    return getUserState(behaviorData);
  }, [behaviorData]);

  useEffect(() => {
    const id = setInterval(() => setClockHour(new Date().getHours()), 60_000);
    return () => clearInterval(id);
  }, []);

  const timeGreeting = useMemo(() => getTimeGreeting(clockHour), [clockHour]);

  useFocusEffect(
    useCallback(() => {
      if (!profile) return;
      entranceHeader.setValue(0);
      entranceButton.setValue(0);
      entranceCards.forEach((c) => c.setValue(0));
      Animated.parallel([
        Animated.timing(entranceHeader, {
          toValue: 1,
          duration: 400,
          delay: 0,
          useNativeDriver: true,
        }),
        Animated.timing(entranceButton, {
          toValue: 1,
          duration: 500,
          delay: 100,
          useNativeDriver: true,
        }),
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
    if (!todayDone) {
      iconDonePulse.setValue(1);
      return;
    }
    iconDonePulse.setValue(0.82);
    Animated.spring(iconDonePulse, {
      toValue: 1,
      friction: 5,
      tension: 200,
      useNativeDriver: true,
    }).start();
  }, [todayDone, iconDonePulse]);

  useEffect(() => {
    if (!profile || profile.isPremium) return;
    if (dayNumber >= 22 && !profile.premiumGateDay22Shown) {
      markPremiumGateShown("day22");
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

  const showDoneShell = todayDone && !checkInAnimating;

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
        setShowStackingModal(true);
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
      if (fresh) await setupNotifications(fresh, false);
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

  const handleBehaviorActionComplete = useCallback(async () => {
    if (!userBehaviorState || !profile) return;
    if (profile.hapticsEnabled !== false) {
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    await useBehaviorStore.getState().recordAction(userBehaviorState.suggestedAction);
    showToast("Küçük adım kaydedildi.");
  }, [userBehaviorState, profile, showToast]);

  const handleMainCtaPress = useCallback(async () => {
    if (!profile || todayDone || checkingRef.current) return;
    checkingRef.current = true;

    const prevStreak = getStreakState().currentStreak;
    const automaticity = 7;
    const effort = 5;

    try {
      setCheckInAnimating(true);
      tickScale.setValue(0);
      setBurstKey((k) => k + 1);

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

      Animated.spring(tickScale, {
        toValue: 1,
        friction: 5,
        tension: 160,
        useNativeDriver: true,
      }).start(({ finished }) => {
        if (finished) {
          setTimeout(() => setCheckInAnimating(false), 40);
        }
      });

      setStreakRoll({ from: prevStreak, to: nextStreak });
      streakSlide.setValue(0);
      Animated.timing(streakSlide, {
        toValue: 1,
        duration: 450,
        useNativeDriver: true,
      }).start(({ finished }) => {
        if (finished) setStreakRoll(null);
      });

      void afterCheckInFollowUp(automaticity, effort);
    } finally {
      checkingRef.current = false;
    }
  }, [
    profile,
    todayDone,
    completeTodayWithRatings,
    dayNumber,
    tickScale,
    streakSlide,
    getStreakState,
    afterCheckInFollowUp,
  ]);

  const handleConfirmationSave = useCallback(
    async (note: string, detail: string | null) => {
      const dayKey = format(new Date(), "yyyy-MM-dd");
      await useHabitStore.getState().saveTodayCheckInConfirmation({
        date: dayKey,
        note,
        detail,
      });
      setShowCheckInSheet(false);
      void handleMainCtaPress();
    },
    [handleMainCtaPress]
  );

  const onCheckInPress = useCallback(() => {
    if (!profile || todayDone || checkingRef.current) return;
    const dayKey = format(new Date(), "yyyy-MM-dd");
    const pending = useHabitStore.getState().todayCheckIn;
    if (pending?.date === dayKey) {
      if (profile.hapticsEnabled !== false) {
        void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }
      Animated.sequence([
        Animated.spring(ctaPressScale, {
          toValue: 0.92,
          friction: 5,
          tension: 400,
          useNativeDriver: true,
        }),
        Animated.spring(ctaPressScale, {
          toValue: 1,
          friction: 6,
          tension: 220,
          useNativeDriver: true,
        }),
      ]).start();
      void handleMainCtaPress();
      return;
    }
    if (profile.hapticsEnabled !== false) {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    Animated.sequence([
      Animated.spring(ctaPressScale, {
        toValue: 0.92,
        friction: 5,
        tension: 400,
        useNativeDriver: true,
      }),
      Animated.spring(ctaPressScale, {
        toValue: 1,
        friction: 6,
        tension: 220,
        useNativeDriver: true,
      }),
    ]).start();
    setShowCheckInSheet(true);
  }, [profile, todayDone, ctaPressScale, handleMainCtaPress]);

  useFocusEffect(
    useCallback(() => {
      if (!profile || todayDone) return;
      const key = format(new Date(), "yyyy-MM-dd");
      if (proactiveHandledRef.current === key) return;
      if (
        shouldTriggerProactiveIntervention(
          profile.startDate,
          checkins,
          dayNumber,
          todayDone
        )
      ) {
        setShowProactiveModal(true);
      }
    }, [profile, checkins, dayNumber, todayDone])
  );

  useFocusEffect(
    useCallback(() => {
      if (!profile) return;
      if (
        shouldOpenStackingModalOnFocus(
          dayNumber,
          todayDone,
          profile.stackingOfferPending === true
        )
      ) {
        setShowStackingModal(true);
      }
    }, [profile, dayNumber, todayDone])
  );

  useEffect(() => {
    if (todayDone) setShowProactiveModal(false);
  }, [todayDone]);

  if (!profile) {
    if (profileLoadFailed) {
      return (
        <SafeAreaView style={[styles.safeLoad, { backgroundColor: "#F8FAFC" }]} edges={["top"]}>
          <View style={styles.profileErrorWrap}>
            <Text style={styles.profileErrorTitle}>Profil dosyası açılamadı</Text>
            <Text style={styles.profileErrorBody}>
              Depolama geçici veya eksik izin yüzünden okunamadı olabilir. Tekrar deneyebilirsin.
            </Text>
            <TouchableOpacity
              style={styles.profileErrorBtn}
              onPress={() => loadProfileAgain()}
              activeOpacity={0.85}
            >
              <Text style={styles.profileErrorBtnText}>Tekrar dene</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      );
    }
    return (
      <SafeAreaView style={[styles.safeLoad, { backgroundColor: "#F8FAFC" }]} edges={["top"]}>
        <View style={styles.center}>
          <Text style={styles.emptyText}>Yükleniyor...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const streakDisplay = streakState.currentStreak;

  const streakSlideY = streakSlide.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -26],
  });

  const weekProgressPct = Math.round((weekDoneCount / 7) * 100);

  const headerEnterStyle = {
    opacity: entranceHeader,
    transform: [
      {
        translateY: entranceHeader.interpolate({
          inputRange: [0, 1],
          outputRange: [25, 0],
        }),
      },
    ],
  };

  const buttonEnterStyle = {
    opacity: entranceButton,
    transform: [
      {
        translateY: entranceButton.interpolate({
          inputRange: [0, 1],
          outputRange: [25, 0],
        }),
      },
      {
        scale: entranceButton.interpolate({
          inputRange: [0, 1],
          outputRange: [0.8, 1],
        }),
      },
    ],
  };

  const cardEnterStyle = (cardIdx: number) => ({
    opacity: entranceCards[cardIdx]!,
    transform: [
      {
        translateY: entranceCards[cardIdx]!.interpolate({
          inputRange: [0, 1],
          outputRange: [25, 0],
        }),
      },
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
        <Animated.View style={[styles.header, headerEnterStyle]}>
          <View style={styles.headerRow}>
            <View style={styles.greetingCol}>
              <Text style={styles.greetingLead}>
                {timeGreeting}
                <Text style={styles.greetingNamePart}>, {displayFirstName}</Text>
              </Text>
            </View>
            <View style={styles.streakBadge}>
              {streakRoll ? (
                <View style={styles.streakRollClip}>
                  <Animated.View style={{ transform: [{ translateY: streakSlideY }] }}>
                    <Text style={styles.streakBadgeText}>🔥 {streakRoll.from}</Text>
                    <Text style={styles.streakBadgeText}>🔥 {streakRoll.to}</Text>
                  </Animated.View>
                </View>
              ) : (
                <Text style={styles.streakBadgeText}>🔥 {streakDisplay}</Text>
              )}
            </View>
          </View>
          <Text style={styles.dateLine}>{dateTitle}</Text>
        </Animated.View>

        <View style={styles.actionBlock}>
          <Animated.View style={buttonEnterStyle}>
            <Animated.View style={{ transform: [{ scale: ctaPressScale }] }}>
              <View
                style={[
                  styles.ctaGlowShell,
                  showDoneShell ? styles.ctaGlowDone : styles.ctaGlowActive,
                ]}
              >
                <View style={styles.ctaWrap}>
                  {burstKey > 0 ? (
                    <View style={styles.burstLayer} key={burstKey}>
                      <CheckinConfettiBurst />
                    </View>
                  ) : null}

                  {showDoneShell ? (
                    <View style={styles.ctaDoneDecor}>
                      <LinearGradient
                        colors={["#FCD34D", "#F59E0B"]}
                        start={{ x: 0.5, y: 0 }}
                        end={{ x: 0.5, y: 1 }}
                        style={[
                          styles.ctaCircle,
                          StyleSheet.absoluteFillObject,
                          { alignItems: "center", justifyContent: "center" },
                        ]}
                      >
                        <Animated.View style={{ transform: [{ scale: iconDonePulse }] }}>
                          <Ionicons name="checkmark-circle" size={56} color="#FFFFFF" />
                        </Animated.View>
                      </LinearGradient>
                      <DoneSparkles />
                    </View>
                  ) : checkInAnimating ? (
                    <TouchableOpacity activeOpacity={1} disabled style={styles.ctaTouchable}>
                      <LinearGradient
                        colors={["#34D399", "#059669"]}
                        start={{ x: 0.5, y: 0 }}
                        end={{ x: 0.5, y: 1 }}
                        style={styles.ctaCircle}
                      >
                        <Animated.View style={{ transform: [{ scale: tickScale }] }}>
                          <Ionicons name="checkmark" size={56} color="#FFFFFF" />
                        </Animated.View>
                      </LinearGradient>
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity
                      activeOpacity={0.92}
                      onPress={onCheckInPress}
                      style={styles.ctaTouchable}
                    >
                      <LinearGradient
                        colors={["#34D399", "#059669"]}
                        start={{ x: 0.5, y: 0 }}
                        end={{ x: 0.5, y: 1 }}
                        style={styles.ctaCircle}
                      >
                        <Ionicons name="checkmark" size={56} color="#FFFFFF" />
                      </LinearGradient>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            </Animated.View>
          </Animated.View>

          <Animated.View
            style={[
              styles.captionEnter,
              {
                opacity: entranceButton,
                transform: [
                  {
                    translateY: entranceButton.interpolate({
                      inputRange: [0, 1],
                      outputRange: [25, 0],
                    }),
                  },
                ],
              },
            ]}
          >
            {showDoneShell ? (
              <Text style={styles.ctaDoneCaption}>Bugün tamamlandı 🎉</Text>
            ) : streakRoll ? (
              <View style={styles.streakCaptionClip}>
                <Animated.View style={{ transform: [{ translateY: streakSlideY }] }}>
                  <Text style={styles.streakCaptionStrong}>
                    🔥 {streakRoll.from} gün üst üste
                  </Text>
                  <Text style={styles.streakCaptionStrong}>
                    🔥 {streakRoll.to} gün üst üste
                  </Text>
                </Animated.View>
              </View>
            ) : streakDisplay > 0 ? (
              <Text style={styles.streakCaptionStrong}>🔥 {streakDisplay} gün üst üste</Text>
            ) : (
              <Text style={styles.streakCaptionZero}>Başlamak için dokun</Text>
            )}
          </Animated.View>
        </View>

        <Animated.View style={cardEnterStyle(0)}>
          <TouchableOpacity
            style={styles.taskCard}
            activeOpacity={0.9}
            onPress={() => setShowTaskSheet(true)}
          >
            <Text style={styles.cardLabel}>BUGÜNÜN GÖREVİ</Text>
            <Text style={styles.habitTitle}>{profile.habitName}</Text>
            <Text style={styles.identityLine}>{getIdentityLine(profile)}</Text>
            <Text style={styles.taskCardHint}>Detaylar için dokun →</Text>
          </TouchableOpacity>
        </Animated.View>

        {dayNumber <= 7 && profile.firstWeekGuideDismissed !== true ? (
          <View style={styles.firstWeekWrap}>
            <FirstWeekGuideCard
              dayNumber={dayNumber}
              dismissed={false}
              onDismiss={() => void updateProfile({ firstWeekGuideDismissed: true })}
              todayDone={todayDone}
              recentActionsCount={behaviorTotalActions}
              mindDumpCount={mindDumpEntries.length}
              journeyOpened={profile.hasOpenedJourneyTab === true}
            />
          </View>
        ) : null}

        {!todayDone && userBehaviorState ? (
          <View style={styles.behaviorCardWrap}>
            <BehaviorActionCard
              state={userBehaviorState}
              onPress={() => void handleBehaviorActionComplete()}
              compact
            />
          </View>
        ) : null}

        {showRestartCard ? (
          <Animated.View style={[styles.tipSection, cardEnterStyle(1)]}>
            <Text style={styles.cardLabel}>YENİDEN BAŞLA</Text>
            <View style={styles.restartCard}>
              <Text style={styles.restartBody}>{RESTART_CARD_BODY}</Text>
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
                <Text style={styles.restartBtnText}>Devam Et</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        ) : (
          <Animated.View style={[styles.tipSection, cardEnterStyle(1)]}>
            <Text style={styles.cardLabel}>GÜNLÜK İPUCU</Text>
            <View style={styles.tipCard}>
              <Ionicons name="bulb" style={styles.tipBulb} size={16} color="#F59E0B" />
              <Text style={styles.tipBody}>{dailyTip}</Text>
            </View>
          </Animated.View>
        )}

        <Animated.View style={[styles.weekSection, cardEnterStyle(2)]}>
          <Text style={styles.cardLabel}>HAFTALIK ÖZET</Text>
          <View style={styles.weekBarsRow}>
            {weekCells.map((cell) => {
              const barColor = weekBarColor(cell, calendarToday);
              return (
                <View key={cell.dateKey} style={styles.weekBarCell}>
                  <View style={[styles.weekBar, { backgroundColor: barColor }]} />
                  <Text style={styles.weekDayLabelUnder}>{cell.shortLabel}</Text>
                </View>
              );
            })}
          </View>
          <Text style={styles.weekMetaLine}>Bu hafta {weekDoneCount}/7</Text>
          <View style={styles.weekProgressTrack}>
            <View style={[styles.weekProgressFill, { width: `${weekProgressPct}%` }]} />
          </View>
        </Animated.View>
      </ScrollView>

      <CheckInConfirmationSheet
        visible={showCheckInSheet}
        onRequestClose={() => setShowCheckInSheet(false)}
        identitySlug={confirmationSlug}
        hapticsEnabled={profile.hapticsEnabled !== false}
        onSave={handleConfirmationSave}
      />

      <Modal
        visible={showTaskSheet}
        transparent
        animationType="slide"
        onRequestClose={() => setShowTaskSheet(false)}
      >
        <View style={styles.taskSheetRoot}>
          <Pressable style={styles.taskSheetBackdrop} onPress={() => setShowTaskSheet(false)} />
          <SafeAreaView edges={["bottom"]} style={styles.taskSheetSafe}>
            <View style={styles.taskSheetPanel}>
              <View style={styles.taskSheetHandle} />
              <Text style={styles.taskSheetTitle}>{profile.habitName}</Text>
              <Text style={styles.taskSheetLabel}>Kimlik cümlen</Text>
              <Text style={styles.taskSheetBody}>{getIdentityLine(profile)}</Text>
              <Text style={styles.taskSheetLabel}>Bugünün durumu</Text>
              <Text style={styles.taskSheetBody}>
                {todayDone
                  ? "Bugün tamamlandı."
                  : "Henüz tamamlanmadı — hazır olduğunda check-in ile işaretle."}
              </Text>
              <TouchableOpacity
                style={styles.taskSheetCta}
                activeOpacity={0.9}
                onPress={() => {
                  setShowTaskSheet(false);
                  navigation.navigate("Journey");
                }}
              >
                <Text style={styles.taskSheetCtaText}>Yolculuğa Git</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.taskSheetClose}
                activeOpacity={0.85}
                onPress={() => setShowTaskSheet(false)}
              >
                <Text style={styles.taskSheetCloseText}>Kapat</Text>
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        </View>
      </Modal>

      <ProactiveInterventionModal
        visible={showProactiveModal}
        onDismiss={markProactiveHandled}
        onStartFiveSecond={() => {
          markProactiveHandled();
          setShowFiveSecond(true);
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
          void trackEvent("stacking_modal_dismissed", {
            tone: getStackingModalCopyVariant(dayNumber),
            dayNumber,
          });
          setShowStackingModal(false);
        }}
        onSameHabit={() => {
          void trackEvent("stacking_same_habit_selected", {
            tone: getStackingModalCopyVariant(dayNumber),
            dayNumber,
          });
          void finalizeStackingJourney(profile.habitName, profile.habitAnchor);
        }}
        onPickSuggestion={(title, anchor, suggestionIndex) => {
          void trackEvent("stacking_new_habit_selected", {
            tone: getStackingModalCopyVariant(dayNumber),
            dayNumber,
            suggestionIndex,
          });
          void finalizeStackingJourney(title, anchor);
        }}
      />

      <Modal visible={showFiveSecond} animationType="fade" onRequestClose={() => setShowFiveSecond(false)}>
        <SafeAreaView style={styles.trainerRoot} edges={["top", "bottom"]}>
          <FiveSecondTrainer
            scenario={FIVE_DEFAULT}
            onComplete={async (_success, _ms, reward) => {
              showToast("Antrenman kaydedildi. Disiplin kası güçleniyor.");
              const micro = getActionById("deep-breath");
              if (micro) {
                await useBehaviorStore.getState().recordAction(micro);
              }
              if (reward) {
                await addDisciplineMuscleXp(reward.disciplineMuscle, reward.xp);
              }
            }}
            onSkip={() => setShowFiveSecond(false)}
          />
        </SafeAreaView>
      </Modal>

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
  safe: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  safeLoad: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    marginHorizontal: 16,
    marginTop: 12,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  greetingCol: {
    flex: 1,
    paddingRight: 12,
  },
  greetingLead: {
    fontSize: 20,
    fontWeight: "800",
    color: "#0F172A",
    lineHeight: 26,
  },
  greetingNamePart: {
    fontSize: 18,
    fontWeight: "600",
    color: "#64748B",
  },
  streakBadge: {
    backgroundColor: "#FFEDD5",
    borderRadius: 16,
    paddingVertical: 6,
    paddingHorizontal: 12,
    minWidth: 56,
    alignItems: "center",
    justifyContent: "center",
  },
  streakRollClip: {
    height: 24,
    overflow: "hidden",
    justifyContent: "center",
  },
  streakBadgeText: {
    color: "#EA580C",
    fontWeight: "700",
    fontSize: 14,
    height: 24,
    lineHeight: 24,
  },
  dateLine: {
    marginTop: 8,
    fontSize: 22,
    fontWeight: "800",
    color: "#0F172A",
  },
  actionBlock: {
    alignItems: "center",
    marginVertical: 32,
  },
  ctaGlowShell: {
    borderRadius: 80,
    alignItems: "center",
    justifyContent: "center",
  },
  ctaGlowActive: {
    ...Platform.select({
      ios: {
        shadowColor: "#10B981",
        shadowOpacity: 0.3,
        shadowRadius: 30,
        shadowOffset: { width: 0, height: 10 },
      },
      android: {
        elevation: 18,
        shadowColor: "#10B981",
      },
    }),
  },
  ctaGlowDone: {
    ...Platform.select({
      ios: {
        shadowColor: "#FBBF24",
        shadowOpacity: 0.35,
        shadowRadius: 28,
        shadowOffset: { width: 0, height: 10 },
      },
      android: {
        elevation: 18,
        shadowColor: "#FBBF24",
      },
    }),
  },
  ctaDoneDecor: {
    width: 160,
    height: 160,
    alignItems: "center",
    justifyContent: "center",
  },
  sparkleHost: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 3,
    pointerEvents: "none",
  },
  sparkleOrb: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
  },
  ctaWrap: {
    position: "relative",
    width: 160,
    height: 160,
    alignItems: "center",
    justifyContent: "center",
  },
  burstLayer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 4,
    alignItems: "center",
    justifyContent: "center",
  },
  burstHost: {
    width: 160,
    height: 160,
    alignItems: "center",
    justifyContent: "center",
  },
  confettiDot: {
    position: "absolute",
    left: "50%",
    top: "50%",
  },
  ctaTouchable: {
    borderRadius: 80,
    overflow: "hidden",
  },
  ctaCircle: {
    width: 160,
    height: 160,
    borderRadius: 80,
    alignItems: "center",
    justifyContent: "center",
  },
  captionEnter: {
    marginTop: 16,
    alignItems: "center",
    minHeight: 24,
  },
  streakCaptionStrong: {
    fontSize: 15,
    fontWeight: "700",
    color: "#EA580C",
    lineHeight: 22,
  },
  streakCaptionZero: {
    fontSize: 15,
    fontWeight: "500",
    color: "#64748B",
    lineHeight: 22,
  },
  streakCaptionClip: {
    marginTop: 4,
    height: 22,
    overflow: "hidden",
    alignItems: "center",
  },
  ctaDoneCaption: {
    marginTop: 4,
    fontSize: 15,
    fontWeight: "600",
    color: "#059669",
    lineHeight: 22,
  },
  taskCard: {
    marginHorizontal: 16,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: "#10B981",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.04,
        shadowRadius: 12,
      },
      android: { elevation: 2 },
    }),
  },
  firstWeekWrap: {
    marginHorizontal: 16,
    marginTop: 12,
  },
  behaviorCardWrap: {
    marginHorizontal: 16,
    marginTop: 12,
  },
  cardLabel: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.5,
    color: "#94A3B8",
    textTransform: "uppercase",
    marginBottom: 8,
  },
  habitTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0F172A",
  },
  identityLine: {
    fontSize: 14,
    fontStyle: "italic",
    color: "#475569",
    marginTop: 4,
    lineHeight: 20,
  },
  taskCardHint: {
    marginTop: 12,
    fontSize: 13,
    fontWeight: "600",
    color: "#10B981",
    alignSelf: "flex-end",
  },
  tipSection: {
    marginHorizontal: 16,
    marginTop: 16,
  },
  tipCard: {
    position: "relative",
    backgroundColor: "#ECFDF5",
    borderRadius: 16,
    padding: 16,
    paddingLeft: 38,
    borderLeftWidth: 3,
    borderLeftColor: "#10B981",
  },
  tipBulb: {
    position: "absolute",
    top: 16,
    left: 14,
  },
  tipBody: {
    fontSize: 14,
    color: "#065F46",
    lineHeight: 20,
  },
  taskSheetRoot: {
    flex: 1,
    justifyContent: "flex-end",
  },
  taskSheetBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(15, 23, 42, 0.45)",
  },
  taskSheetSafe: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    width: "100%",
  },
  taskSheetPanel: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 12,
  },
  taskSheetHandle: {
    alignSelf: "center",
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#E2E8F0",
    marginBottom: 16,
  },
  taskSheetTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 16,
  },
  taskSheetLabel: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.2,
    color: "#94A3B8",
    textTransform: "uppercase",
    marginTop: 12,
    marginBottom: 6,
  },
  taskSheetBody: {
    fontSize: 15,
    color: "#334155",
    lineHeight: 22,
  },
  taskSheetCta: {
    marginTop: 24,
    backgroundColor: "#059669",
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
  },
  taskSheetCtaText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
  taskSheetClose: {
    marginTop: 12,
    paddingVertical: 12,
    alignItems: "center",
  },
  taskSheetCloseText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#64748B",
  },
  restartCard: {
    backgroundColor: "#FEF2F2",
    borderRadius: 16,
    padding: 16,
    borderLeftWidth: 3,
    borderLeftColor: "#EF4444",
  },
  restartBody: {
    fontSize: 14,
    color: "#991B1B",
    lineHeight: 20,
  },
  restartBtn: {
    marginTop: 16,
    alignSelf: "stretch",
    backgroundColor: "#EF4444",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  restartBtnText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "600",
  },
  weekSection: {
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 24,
  },
  weekBarsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginTop: 8,
  },
  weekBarCell: {
    width: 32,
    alignItems: "center",
    gap: 6,
  },
  weekBar: {
    width: 32,
    height: 8,
    borderRadius: 4,
  },
  weekDayLabelUnder: {
    fontSize: 10,
    fontWeight: "600",
    color: "#94A3B8",
  },
  weekMetaLine: {
    marginTop: 14,
    fontSize: 13,
    fontWeight: "600",
    color: "#64748B",
  },
  weekProgressTrack: {
    marginTop: 8,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#E2E8F0",
    overflow: "hidden",
  },
  weekProgressFill: {
    height: 4,
    borderRadius: 2,
    backgroundColor: "#10B981",
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
