import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useTranslation } from "react-i18next";
import { addDays, format } from "date-fns";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  Share,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  TextInput,
  Keyboard,
  useWindowDimensions,
  Animated,
  Easing,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import { useFocusEffect } from "@react-navigation/native";
import {
  Lock,
  TrendingUp,
  Share2,
  ChevronRight,
  CheckCircle2,
  Map,
  PenLine,
  BookOpen,
  X,
  ClipboardList,
  Zap,
  FlaskConical,
} from "lucide-react-native";
import { useTabBarMetrics } from "../utils/tabBarInsets";
import {
  getKeyboardAvoidingBehavior,
  useKeyboardModalScrollPadding,
} from "../utils/keyboardInsets";
import { useUserStore } from "../store/userStore";
import { useHabitStore } from "../store/habitStore";
import { useCheckinsStore } from "../store/checkinsStore";
import { useSDTStore } from "../store/sdtStore";
import { useMindDumpStore } from "../store/mindDumpStore";
import {
  TomorrowTodoInput,
  TomorrowTodoItem,
  useTomorrowPlanStore,
} from "../store/tomorrowPlanStore";
import PremiumGateModal from "../components/PremiumGateModal";
import { DEV_UNLOCK_JOURNEY_PREMIUM } from "../constants/devFlags";
import JourneyPhaseEducationModal from "../components/JourneyPhaseEducationModal";
import JourneyMindSentenceModal from "../components/JourneyMindSentenceModal";
import TomorrowPlanSection from "../components/journey/TomorrowPlanSection";
import TomorrowPlanModal from "../components/journey/TomorrowPlanModal";
import {
  Colors,
  Spacing,
  Radii,
  FontSizes,
  JOURNEY_PHASES,
  Shadows,
  getCoachNote,
} from "../constants/theme";
import { getDailyPrinciple } from "../constants/identity-copy";
import { phaseIdFromDay } from "../constants/journeyPhaseEducation";
import {
  getLocalizedCoachNote,
  getLocalizedDailyPrinciple,
  getLocalizedJourneyEducationCards,
  getLocalizedJourneyMomentLine,
  getLocalizedSdtQuestions,
  localizeJourneyPhaseDays,
  localizeJourneyPhaseLabel,
  localizeJourneyPhaseSubtitle,
} from "../i18n/localizeContent";
import { estimateAutomationFromFirst14Linear, getAverageAutomaticity } from "../utils/profileMetrics";
import type { JourneyEducationPrefsState } from "../utils/journeyEducationPrefs";
import {
  loadJourneyEducationPrefs,
  markPhaseEducationAutoShown,
} from "../utils/journeyEducationPrefs";
import type { MainTabParamList } from "../types";
import { requestNotificationPermissionsFromUser } from "../utils/notifications";
import JourneyIdentityMirrorCard from "../components/journey/JourneyIdentityMirrorCard";
import JourneyMapTeaser from "../components/journey/JourneyMapTeaser";
import JourneyPhaseMiniGrid from "../components/journey/JourneyPhaseMiniGrid";
import JourneyDayDetailSheet from "../components/journey/JourneyDayDetailSheet";
import { buildJourneyDayDetail } from "../utils/journeyDayDetail";
import type { JourneyDayDetail } from "../utils/journeyDayDetail";
import { getPhaseOpenTheme } from "../components/journey/journeyPhaseTheme";
import { buildSdtInsight } from "../utils/sdtInsight";

const JOURNEY_PAGE_BG = "#F8FAFC";

const ACTION_ICON = "#10B981";
const ACTION_ICON_BG = "rgba(16, 185, 129, 0.1)";

const ENTRANCE_COUNT = 6;
const ENTRANCE_STAGGER_MS = 80;
const ENTRANCE_INITIAL_DELAY_MS = 100;
const MAX_TOMORROW_TODOS = 3;

const EMPTY_TODO_DRAFT: TomorrowTodoInput = {
  text: "",
  time: "",
  context: "",
};

function useJourneyEntrance(isPremium: boolean) {
  const opacity = useRef(
    Array.from({ length: ENTRANCE_COUNT }, () => new Animated.Value(0))
  ).current;
  const translateY = useRef(
    Array.from({ length: ENTRANCE_COUNT }, () => new Animated.Value(20))
  ).current;
  const playedRef = useRef(false);

  useFocusEffect(
    useCallback(() => {
      if (!isPremium) return;
      if (playedRef.current) return;
      playedRef.current = true;
      opacity.forEach((o) => o.setValue(0));
      translateY.forEach((y) => y.setValue(20));
      const anims = opacity.flatMap((o, i) => {
        const delay = ENTRANCE_INITIAL_DELAY_MS + i * ENTRANCE_STAGGER_MS;
        return [
          Animated.timing(o, {
            toValue: 1,
            duration: 380,
            delay,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
          Animated.timing(translateY[i]!, {
            toValue: 0,
            duration: 380,
            delay,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
        ];
      });
      Animated.parallel(anims).start();
    }, [isPremium, opacity, translateY])
  );

  return { entranceOpacity: opacity, entranceY: translateY };
}

type Props = BottomTabScreenProps<MainTabParamList, "Journey">;

export default function JourneyScreen({ navigation }: Props) {
  const { t, i18n } = useTranslation();
  const insets = useSafeAreaInsets();
  const { scrollPadding: tabBarScrollPad } = useTabBarMetrics();
  const { paddingBottom: surveyScrollPad } = useKeyboardModalScrollPadding();
  const { height: windowHeight, width: windowWidth } = useWindowDimensions();
  const planScrollRef = useRef<ScrollView>(null);
  const profile = useUserStore((s) => s.profile);
  const dayNumber = useUserStore((s) => s.dayNumber());
  const markPremiumGateShown = useUserStore((s) => s.markPremiumGateShown);
  const updateProfile = useUserStore((s) => s.updateProfile);

  useFocusEffect(
    useCallback(() => {
      const p = useUserStore.getState().profile;
      if (!p || p.hasOpenedJourneyTab === true) return;
      void updateProfile({ hasOpenedJourneyTab: true });
    }, [updateProfile])
  );

  const last66Days = useCheckinsStore((s) => s.last66Days);
  const checkins = useCheckinsStore((s) => s.checkins);
  const completionRate = useCheckinsStore((s) => s.completionRate);
  const scores = useSDTStore((s) => s.scores);
  const loadSDT = useSDTStore((s) => s.load);
  const saveScore = useSDTStore((s) => s.saveScore);
  const needsSurvey = useSDTStore((s) => s.needsSurvey);
  const latestScore = useSDTStore((s) => s.latestScore);
  const createMindEntry = useMindDumpStore((s) => s.createEntry);
  const loadMindDumps = useMindDumpStore((s) => s.load);
  const loadHabitData = useHabitStore((s) => s.load);
  const listsByDate = useTomorrowPlanStore((s) => s.listsByDate);
  const loadTomorrowPlans = useTomorrowPlanStore((s) => s.load);
  const addTomorrowTodo = useTomorrowPlanStore((s) => s.addItem);
  const updateTomorrowTodo = useTomorrowPlanStore((s) => s.updateItem);
  const deleteTomorrowTodo = useTomorrowPlanStore((s) => s.deleteItem);

  const isPremium = (profile?.isPremium ?? false) || DEV_UNLOCK_JOURNEY_PREMIUM;
  const { entranceOpacity, entranceY } = useJourneyEntrance(isPremium);
  const [showGate, setShowGate] = useState(false);
  const [dayDetail, setDayDetail] = useState<JourneyDayDetail | null>(null);
  const [dayDetailPreview, setDayDetailPreview] = useState(false);
  const [showSurvey, setShowSurvey] = useState(false);
  const [showPhaseEdu, setShowPhaseEdu] = useState(false);
  const [showMindSentence, setShowMindSentence] = useState(false);
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [editingTodoId, setEditingTodoId] = useState<string | null>(null);
  const [todoDraft, setTodoDraft] = useState<TomorrowTodoInput>(EMPTY_TODO_DRAFT);
  const [planModalKeyboardHeight, setPlanModalKeyboardHeight] = useState(0);
  const [answers, setAnswers] = useState({ autonomy: 3, competence: 3, relatedness: 3 });

  const linearEstimate = useMemo(() => {
    if (!profile || dayNumber < 14) return null;
    return estimateAutomationFromFirst14Linear(profile.startDate, checkins);
  }, [profile, checkins, dayNumber]);

  const avgAuto = useMemo(() => getAverageAutomaticity(checkins), [checkins]);

  const rate = profile ? completionRate(profile.startDate) : 0;

  const dailyPrinciple = getDailyPrinciple(dayNumber);
  const dailyPrincipleRich = useMemo(
    () => getLocalizedDailyPrinciple(dayNumber) ?? null,
    [dayNumber, i18n.language]
  );
  const coachNote = getLocalizedCoachNote(dayNumber);

  const journeyEduCards = useMemo(
    () => getLocalizedJourneyEducationCards(dayNumber),
    [dayNumber, i18n.language]
  );
  const journeyEduPhaseId = useMemo<1 | 2 | 3>(() => {
    const p = dailyPrinciple?.phaseId;
    if (p === 1 || p === 2 || p === 3) return p;
    return phaseIdFromDay(dayNumber);
  }, [dailyPrinciple?.phaseId, dayNumber]);

  const momentLine = useMemo(
    () => getLocalizedJourneyMomentLine(dayNumber),
    [dayNumber, i18n.language]
  );
  const [eduPrefs, setEduPrefs] = useState<JourneyEducationPrefsState | null>(null);

  const refreshEduPrefs = useCallback(() => {
    void loadJourneyEducationPrefs().then(setEduPrefs);
  }, []);

  const journeyDataLoadedRef = useRef(false);
  useFocusEffect(
    useCallback(() => {
      if (isPremium && !journeyDataLoadedRef.current) {
        journeyDataLoadedRef.current = true;
        refreshEduPrefs();
        void loadMindDumps();
        void loadHabitData();
      }
      if (!profile?.id || profile?.hasOpenedJourneyTab) return;
      void updateProfile({ hasOpenedJourneyTab: true });
    }, [isPremium, refreshEduPrefs, loadMindDumps, loadHabitData, profile?.id, profile?.hasOpenedJourneyTab, updateProfile])
  );

  const eduPhaseCompleted =
    eduPrefs?.phasesCompleted12[String(journeyEduPhaseId) as "1" | "2" | "3"];
  const saveMindSentence = useCallback(
    async (text: string) => createMindEntry(text),
    [createMindEntry]
  );

  useEffect(() => {
    loadSDT();
    loadTomorrowPlans();
  }, [loadTomorrowPlans]);

  useEffect(() => {
    if (!profile || isPremium) return;
    if (dayNumber >= 7 && !profile.premiumGateDay7Shown) {
      markPremiumGateShown("day7");
      setShowGate(true);
    }
  }, [dayNumber, profile, isPremium, markPremiumGateShown]);

  useEffect(() => {
    if (isPremium && needsSurvey() && dayNumber > 7) {
      setShowSurvey(true);
    }
  }, [isPremium, scores.length]);

  const phaseEntryDays = [1, 23, 45] as const;
  useEffect(() => {
    if (!isPremium || !profile || !eduPrefs) return;
    if (!phaseEntryDays.includes(dayNumber as 1 | 23 | 45)) return;
    const pid = phaseIdFromDay(dayNumber);
    const key = String(pid) as "1" | "2" | "3";
    if (eduPrefs.phasesCompleted12[key] || eduPrefs.phasesAutoShown12[key]) return;
    void markPhaseEducationAutoShown(pid).then(() => {
      void loadJourneyEducationPrefs().then(setEduPrefs);
    });
    setShowPhaseEdu(true);
  }, [isPremium, profile, dayNumber, eduPrefs]);

  const grid = useMemo(
    () => (profile ? last66Days(profile.startDate) : []),
    [profile?.startDate, checkins, last66Days]
  );
  const tomorrowDate = useMemo(() => format(addDays(new Date(), 1), "yyyy-MM-dd"), []);
  const tomorrowList = listsByDate[tomorrowDate] ?? null;
  const tomorrowTodos = tomorrowList?.items ?? [];
  const primaryTodo = tomorrowTodos.find((item) => item.isPrimary) ?? tomorrowTodos[0] ?? null;
  const supportTodos = tomorrowTodos.filter((item) => item.id !== primaryTodo?.id);
  const plannedTodoCount = tomorrowTodos.length;
  const isAtTodoLimit = plannedTodoCount >= MAX_TOMORROW_TODOS;
  const latest = latestScore();
  const sdtQuestions = useMemo(() => getLocalizedSdtQuestions(), [i18n.language]);
  const sdtInsight = useMemo(
    () => (latest && profile ? buildSdtInsight(latest, profile.habitName) : null),
    [latest, profile?.habitName, i18n.language]
  );
  const journeyProgress = Math.min(1, Math.max(0, dayNumber / 66));
  const coachNoteText = coachNote;

  const phaseCardWidth = Math.round(windowWidth * 0.8);
  const phaseSnapInterval = phaseCardWidth + 10;

  const openDayDetail = useCallback(
    (journeyDay: number) => {
      if (!profile?.startDate) return;
      const detail = buildJourneyDayDetail(
        profile.startDate,
        journeyDay,
        dayNumber,
        checkins,
        listsByDate
      );
      if (!isPremium) {
        setDayDetail(detail);
        setDayDetailPreview(true);
        return;
      }
      setDayDetailPreview(false);
      setDayDetail(detail);
    },
    [profile?.startDate, dayNumber, checkins, listsByDate, isPremium]
  );

  const scrollPlanFormToEnd = useCallback(() => {
    requestAnimationFrame(() => {
      planScrollRef.current?.scrollToEnd({ animated: true });
    });
  }, []);

  useEffect(() => {
    if (!showPlanModal) {
      setPlanModalKeyboardHeight(0);
      return;
    }
    const showEvent = Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const hideEvent = Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";
    const showSub = Keyboard.addListener(showEvent, (e) => {
      setPlanModalKeyboardHeight(e.endCoordinates.height);
      setTimeout(scrollPlanFormToEnd, 80);
    });
    const hideSub = Keyboard.addListener(hideEvent, () => {
      setPlanModalKeyboardHeight(0);
    });
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, [showPlanModal, scrollPlanFormToEnd]);

  const openTodoEditor = (item?: TomorrowTodoItem) => {
    setEditingTodoId(item?.id ?? null);
    setTodoDraft(
      item
        ? {
            text: item.text,
            time: item.time,
            context: item.context,
          }
        : {
            ...EMPTY_TODO_DRAFT,
            text: tomorrowTodos.length === 0 ? profile?.habitName ?? "" : "",
            context: tomorrowTodos.length === 0 ? profile?.habitAnchor ?? "" : "",
          }
    );
    setShowPlanModal(true);
  };

  const handleSaveTodo = async () => {
    if (!todoDraft.text.trim()) return;
    await requestNotificationPermissionsFromUser();
    if (editingTodoId) {
      await updateTomorrowTodo(tomorrowDate, editingTodoId, todoDraft);
    } else {
      await addTomorrowTodo(tomorrowDate, todoDraft);
    }
    setShowPlanModal(false);
  };

  const handleDeleteTodo = async (id: string) => {
    await deleteTomorrowTodo(tomorrowDate, id);
    setShowPlanModal(false);
  };

  const PlanSectionWrapper = isPremium ? Animated.View : View;
  const planSectionStyle = isPremium
    ? {
        opacity: entranceOpacity[0],
        transform: [{ translateY: entranceY[0] }],
      }
    : undefined;

  const hasTodayContext =
    Boolean(coachNoteText || momentLine || dailyPrincipleRich || dailyPrinciple);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: JOURNEY_PAGE_BG }]} edges={["top"]}>
      <ScrollView
        stickyHeaderIndices={isPremium ? [0] : undefined}
        contentContainerStyle={[
          styles.scroll,
          { backgroundColor: JOURNEY_PAGE_BG, paddingBottom: tabBarScrollPad },
        ]}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
      >
        {isPremium ? (
          <View style={styles.stickyHero} collapsable={false}>
            <View style={styles.hero}>
              <View style={styles.heroTop}>
                <View style={styles.heroTitles}>
                  <Text style={styles.title}>{t("journey.titlePremium")}</Text>
                  <Text style={styles.subtitle}>
                    {t("journey.subtitle", { day: dayNumber })}
                  </Text>
                </View>
                <View style={styles.dayPill}>
                  <View style={styles.dayPillIconWrap}>
                    <Map size={16} color="#059669" strokeWidth={2} />
                  </View>
                  <Text style={styles.dayPillText}>{dayNumber}/66</Text>
                </View>
              </View>
              <View style={styles.progressTrack}>
                <View
                  style={[
                    styles.progressFillClip,
                    { width: `${journeyProgress * 100}%` },
                  ]}
                >
                  <LinearGradient
                    colors={["#34D399", "#059669"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.progressGradient}
                  />
                </View>
              </View>
              <Text style={styles.progressHint}>
                {avgAuto != null
                  ? t("journey.progressWithAuto", { pct: Math.round(rate * 100), auto: avgAuto.toFixed(1) })
                  : t("journey.progress", { pct: Math.round(rate * 100) })}
              </Text>
            </View>
          </View>
        ) : (
          <View style={styles.freeHeader}>
            <View style={styles.heroTop}>
              <View style={styles.heroTitles}>
                <Text style={styles.title}>{t("journey.titleFree")}</Text>
                <Text style={styles.subtitle}>
                  {t("journey.subtitleFree", { day: dayNumber })}
                </Text>
              </View>
              <View style={styles.dayPill}>
                <View style={styles.dayPillIconWrap}>
                  <Map size={16} color="#059669" strokeWidth={2} />
                </View>
                <Text style={styles.dayPillText}>{dayNumber}/66</Text>
              </View>
            </View>
            <View style={styles.progressTrack}>
              <View
                style={[styles.progressFillClip, { width: `${journeyProgress * 100}%` }]}
              >
                <LinearGradient
                  colors={["#34D399", "#059669"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.progressGradient}
                />
              </View>
            </View>
            <Text style={styles.progressHint}>
              {t("journey.progressFree", { pct: Math.round(rate * 100), day: dayNumber })}
            </Text>
          </View>
        )}

        <PlanSectionWrapper style={planSectionStyle}>
          <TomorrowPlanSection
            primaryTodo={primaryTodo}
            supportTodos={supportTodos}
            isAtTodoLimit={isAtTodoLimit}
            onOpenEditor={openTodoEditor}
            onDeletePrimary={(id) => void handleDeleteTodo(id)}
            showJourneyBridge
          />
        </PlanSectionWrapper>

        {!isPremium ? (
          <JourneyMapTeaser
            dayNumber={dayNumber}
            grid={grid}
            cardWidth={phaseCardWidth}
            onUnlock={() => setShowGate(true)}
            onDayPress={openDayDetail}
          />
        ) : null}

        {isPremium && profile ? (
          <Animated.View
            style={{
              opacity: entranceOpacity[1],
              transform: [{ translateY: entranceY[1] }],
            }}
          >
            <JourneyIdentityMirrorCard
              startDate={profile.startDate}
              habitName={profile.habitName}
              onOpenMind={() => navigation.navigate("MindDump")}
            />
          </Animated.View>
        ) : null}

        {!isPremium ? (
          <View style={styles.premiumUpsellCard}>
            {/* Faz eğitimi teaser — ilk kart önizlemesi */}
            {journeyEduCards.length > 0 ? (
              <View style={styles.phaseTeaserWrap}>
                <View style={styles.phaseTeaserHeader}>
                  <BookOpen size={14} color={Colors.primary} strokeWidth={2} />
                  <Text style={styles.phaseTeaserKicker}>{t("journey.phaseTeaser.kicker")}</Text>
                </View>
                <Text style={styles.phaseTeaserTitle}>{journeyEduCards[0].title}</Text>
                <Text style={styles.phaseTeaserBody} numberOfLines={3}>
                  {journeyEduCards[0].body}
                </Text>
                <View style={styles.phaseTeaserLockRow}>
                  <Lock size={13} color={Colors.primary} strokeWidth={2} />
                  <Text style={styles.phaseTeaserLockText}>{t("journey.phaseTeaser.lockMore")}</Text>
                </View>
              </View>
            ) : null}

            <View style={styles.lockIcon}>
              <Lock size={28} color={Colors.primary} strokeWidth={1.5} />
            </View>
            <Text style={styles.lockedTitle}>{t("journey.locked.title")}</Text>
            <Text style={styles.lockedSub}>{t("journey.locked.body")}</Text>
            <TouchableOpacity
              style={styles.unlockBtn}
              onPress={() => setShowGate(true)}
              activeOpacity={0.8}
            >
              <Text style={styles.unlockBtnText}>{t("journey.locked.unlock")}</Text>
              <ChevronRight size={18} color="#fff" strokeWidth={2} />
            </TouchableOpacity>
          </View>
        ) : null}

        {isPremium ? (
        <>
        <Animated.View
          style={{
            opacity: entranceOpacity[2],
            transform: [{ translateY: entranceY[2] }],
          }}
        >
        <View style={styles.sectionLabelRow}>
          <Text style={styles.sectionLabel}>{t("journey.section.todayPack")}</Text>
        </View>
        <View style={styles.packStack}>
          {hasTodayContext ? (
            <>
              {coachNoteText || momentLine ? (
                <View style={styles.todayContextCard}>
                  {coachNoteText ? (
                    <>
                      <Text style={styles.contextKicker}>{t("journey.milestone.label")}</Text>
                      <Text style={styles.contextBody} numberOfLines={3}>
                        {coachNoteText}
                      </Text>
                    </>
                  ) : momentLine ? (
                    <>
                      <Text style={styles.contextKicker}>{t("journey.milestone.context")}</Text>
                      <Text style={styles.contextBody} numberOfLines={3}>
                        {momentLine}
                      </Text>
                    </>
                  ) : null}
                </View>
              ) : null}
              {dailyPrincipleRich ? (
                <View style={styles.principlePackBlock}>
                  <Text style={styles.principleQuoteCompact} numberOfLines={3}>
                    {"\u201C"}
                    {dailyPrincipleRich.principle}
                    {"\u201D"}
                  </Text>
                  <View style={styles.principleScienceRow}>
                    <FlaskConical size={11} color="#94A3B8" strokeWidth={1.8} />
                    <Text style={styles.principleScience} numberOfLines={3}>
                      {dailyPrincipleRich.science}
                    </Text>
                  </View>
                  <View style={styles.principleActionRow}>
                    <Zap size={11} color={ACTION_ICON} strokeWidth={2} />
                    <Text style={styles.principleActionCompact} numberOfLines={2}>
                      {dailyPrincipleRich.action}
                    </Text>
                  </View>
                </View>
              ) : dailyPrinciple ? (
                <View style={styles.principlePackBlock}>
                  <Text style={styles.principleQuoteCompact} numberOfLines={3}>
                    {"\u201C"}
                    {dailyPrinciple.principle}
                    {"\u201D"}
                  </Text>
                </View>
              ) : null}
            </>
          ) : null}

          <View style={styles.coachActionRow}>
            <TouchableOpacity
              style={styles.coachChip}
              onPress={() => setShowPhaseEdu(true)}
              activeOpacity={0.85}
            >
              <View style={[styles.coachChipIcon, { backgroundColor: ACTION_ICON_BG }]}>
                <BookOpen size={16} color={ACTION_ICON} strokeWidth={2} />
              </View>
              <Text style={styles.coachChipTitle} numberOfLines={2}>
                {t("journey.coach.brainShort")}
              </Text>
              <Text style={styles.coachChipSub} numberOfLines={2}>
                {eduPhaseCompleted
                  ? t("journey.coach.brainDone")
                  : t("journey.coach.brainCards")}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.coachChip}
              onPress={() => setShowMindSentence(true)}
              activeOpacity={0.85}
            >
              <View style={[styles.coachChipIcon, { backgroundColor: ACTION_ICON_BG }]}>
                <PenLine size={16} color={ACTION_ICON} strokeWidth={2} />
              </View>
              <Text style={styles.coachChipTitle} numberOfLines={2}>
                {t("journey.coach.sentenceShort")}
              </Text>
              <Text style={styles.coachChipSub} numberOfLines={2}>
                {eduPrefs?.lastMindSentenceSnippet
                  ? t("journey.coach.lastSentence", {
                      snippet: eduPrefs.lastMindSentenceSnippet,
                    })
                  : t("journey.coach.sentenceSub")}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        </Animated.View>

        <Animated.View
          style={{
            opacity: entranceOpacity[3],
            transform: [{ translateY: entranceY[3] }],
          }}
        >
        <View style={styles.sectionLabelRow}>
          <Text style={styles.sectionLabel}>{t("journey.section.phases")}</Text>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          snapToInterval={phaseSnapInterval}
          snapToAlignment="start"
          decelerationRate="fast"
          disableIntervalMomentum
          contentContainerStyle={styles.phaseHScroll}
        >
          {JOURNEY_PHASES.map((phase) => {
            const isActive = dayNumber >= phase.startDay && dayNumber <= phase.endDay;
            const isCompleted = dayNumber > phase.endDay;
            const isLocked = dayNumber < phase.startDay;
            const phaseGrid = grid.slice(phase.startDay - 1, phase.endDay);
            const pid = phase.id as 1 | 2 | 3;
            const theme = getPhaseOpenTheme(pid, isActive, isCompleted);

            if (isLocked) {
              return (
                <View
                  key={phase.id}
                  style={[styles.phaseCardLocked, { width: phaseCardWidth, marginRight: 10 }]}
                >
                  <Text style={styles.phaseCardLockedLabel}>
                    {localizeJourneyPhaseLabel(pid)}
                  </Text>
                  <Lock size={28} color="#CBD5E1" strokeWidth={1.8} />
                  <Text style={styles.phaseCardLockedHint}>
                    {t("journey.phase.lockedHint", { day: phase.startDay })}
                  </Text>
                </View>
              );
            }

            return (
              <View
                key={phase.id}
                style={[
                  styles.phaseCardOpen,
                  isCompleted ? styles.phaseCardOpenDone : styles.phaseCardOpenActive,
                  { width: phaseCardWidth, marginRight: 10 },
                ]}
              >
                {isCompleted ? (
                  <View style={styles.phaseCardBadgeRow}>
                    <CheckCircle2 size={16} color={theme.badgeText} strokeWidth={2} />
                    <Text style={[styles.phaseCardDoneBadgeText, { color: theme.badgeText }]}>
                      {t("journey.phase.completed")}
                    </Text>
                  </View>
                ) : (
                  <View style={styles.phaseActiveBadge}>
                    <Text style={styles.phaseActiveBadgeText}>
                      {t("journey.phase.active", { id: phase.id })}
                    </Text>
                  </View>
                )}
                <Text style={styles.phaseCardTitle}>
                  {localizeJourneyPhaseLabel(pid)}
                </Text>
                <Text style={styles.phaseCardRange}>
                  {localizeJourneyPhaseDays(pid)}
                </Text>
                <Text style={styles.phaseCardSub} numberOfLines={4}>
                  {localizeJourneyPhaseSubtitle(pid)}
                </Text>
                <JourneyPhaseMiniGrid
                  phase={phase}
                  phaseGrid={phaseGrid}
                  dayNumber={dayNumber}
                  doneColor={theme.gridDone}
                  onDayPress={openDayDetail}
                />
              </View>
            );
          })}
        </ScrollView>
        </Animated.View>

        <Animated.View
          style={{
            opacity: entranceOpacity[4],
            transform: [{ translateY: entranceY[4] }],
          }}
        >
        <View style={styles.sectionLabelRow}>
          <Text style={styles.sectionLabel}>{t("journey.section.science")}</Text>
        </View>

        {dayNumber >= 14 && linearEstimate ? (
          <View style={[styles.regressionCard, styles.cardStackGap]}>
            <View style={styles.regressionRow}>
              <TrendingUp size={18} color={Colors.primary} strokeWidth={1.8} />
              <Text style={styles.regressionTitle}>{t("journey.regression.title")}</Text>
            </View>
            <Text style={styles.regressionBody}>
              {t("journey.regression.body", { slope: linearEstimate.slopePerDay.toFixed(1) })}
              {linearEstimate.predictedDayAt7
                ? t("journey.regression.at7", { day: linearEstimate.predictedDayAt7 })
                : ""}
            </Text>
          </View>
        ) : null}

        <View style={styles.sdtCard}>
          <Text style={styles.sdtTitle}>{t("journey.sdt.title")}</Text>
          <Text style={styles.sdtSub}>
            {t("journey.sdt.sub")}
          </Text>

          {latest ? (
            <View style={styles.sdtBars}>
              {sdtQuestions.map((q) => (
                <SDTBar
                  key={q.id}
                  label={q.label}
                  value={latest[q.id as keyof typeof latest] as number}
                  max={5}
                />
              ))}
            </View>
          ) : null}

          {/* Son 4 hafta trend */}
          {scores.length > 1 ? (
            <View style={styles.sdtTrendBlock}>
              <Text style={styles.sdtTrendTitle}>{t("journey.sdt.trend", { count: Math.min(scores.length, 4) })}</Text>
              <View style={styles.sdtTrendRow}>
                {scores.slice(0, 4).reverse().map((s, i) => {
                  const avg = ((s.autonomy + s.competence + s.relatedness) / 3);
                  const heightPct = avg / 5;
                  const isLatest = i === Math.min(scores.length, 4) - 1;
                  return (
                    <View key={s.week} style={styles.sdtTrendCol}>
                      <View style={styles.sdtTrendBarTrack}>
                        <View
                          style={[
                            styles.sdtTrendBarFill,
                            {
                              height: `${Math.round(heightPct * 100)}%`,
                              backgroundColor: isLatest ? "#10B981" : "#CBD5E1",
                            },
                          ]}
                        />
                      </View>
                      <Text style={styles.sdtTrendLabel}>{avg.toFixed(1)}</Text>
                    </View>
                  );
                })}
              </View>
            </View>
          ) : null}

          {latest && sdtInsight ? (
            <View style={styles.sdtInsightBlock}>
              <Text style={styles.sdtInsightSummary}>{sdtInsight.summary}</Text>
              <Text style={styles.sdtInsightTip}>{sdtInsight.tip}</Text>
            </View>
          ) : null}
          {!latest ? (
            <TouchableOpacity style={styles.surveyBtn} onPress={() => setShowSurvey(true)}>
              <Text style={styles.surveyBtnText}>{t("journey.sdt.fillFirst")}</Text>
              <ChevronRight size={18} color={Colors.primary} strokeWidth={2} />
            </TouchableOpacity>
          ) : null}

          {latest && needsSurvey() ? (
            <TouchableOpacity onPress={() => setShowSurvey(true)}>
              <Text style={styles.updateText}>{t("journey.sdt.update")}</Text>
            </TouchableOpacity>
          ) : null}
        </View>
        </Animated.View>

        <Animated.View
          style={{
            opacity: entranceOpacity[5],
            transform: [{ translateY: entranceY[5] }],
          }}
        >
          <View style={styles.shareBlock}>
            <TouchableOpacity
              style={styles.shareRow}
              onPress={async () => {
                const pct = avgAuto != null ? Math.round((avgAuto / 10) * 100) : null;
                const msg = [
                  t("journey.share.dayLine", { day: dayNumber }),
                  pct != null ? t("journey.share.autoLine", { auto: pct }) : null,
                  t("journey.share.completionLine", {
                    completion: Math.round(rate * 100),
                  }),
                  t("journey.share.hashtag"),
                ]
                  .filter(Boolean)
                  .join(" ");
                try {
                  await Share.share({ message: msg });
                } catch {
                  /* kullanıcı iptal */
                }
              }}
              activeOpacity={0.75}
            >
              <View style={styles.shareIconWrap}>
                <Share2 size={18} color="#10B981" strokeWidth={2} />
              </View>
              <Text style={styles.shareText}>{t("journey.share.button")}</Text>
            </TouchableOpacity>
            <View style={styles.shareUnderline} />
          </View>
        </Animated.View>
        </>
        ) : null}

      </ScrollView>

      <TomorrowPlanModal
        visible={showPlanModal}
        onClose={() => setShowPlanModal(false)}
        editingTodoId={editingTodoId}
        todoDraft={todoDraft}
        onChangeDraft={(patch) => setTodoDraft((prev) => ({ ...prev, ...patch }))}
        habitName={profile?.habitName ?? ""}
        habitAnchor={profile?.habitAnchor ?? ""}
        onSave={() => void handleSaveTodo()}
        onDelete={(id) => void handleDeleteTodo(id)}
        windowHeight={windowHeight}
        insets={insets}
        keyboardHeight={planModalKeyboardHeight}
        scrollRef={planScrollRef}
        onFieldFocus={scrollPlanFormToEnd}
      />

      <Modal
        visible={showSurvey}
        transparent
        animationType="slide"
        onRequestClose={() => setShowSurvey(false)}
      >
        <KeyboardAvoidingView
          style={styles.surveyOverlay}
          behavior={getKeyboardAvoidingBehavior()}
        >
          <Pressable
            style={styles.surveyBackdrop}
            onPress={() => setShowSurvey(false)}
            accessibilityRole="button"
            accessibilityLabel={t("journey.share.closeLabel")}
          />
          <View
            style={[
              styles.surveySheet,
              { paddingBottom: Math.max(Spacing.lg, insets.bottom + Spacing.sm) },
            ]}
          >
            <View style={styles.surveyHandle} />
            <View style={styles.surveyHeader}>
              <View style={styles.surveyHeaderLeft}>
                <View style={styles.surveyIconWrap}>
                  <ClipboardList size={20} color={Colors.primary} strokeWidth={1.8} />
                </View>
                <View>
                  <Text style={styles.surveyTitle}>{t("journey.survey.title")}</Text>
                  <Text style={styles.surveyMeta}>{t("journey.survey.meta")}</Text>
                </View>
              </View>
              <TouchableOpacity
                style={styles.surveyClose}
                onPress={() => setShowSurvey(false)}
                hitSlop={12}
                accessibilityLabel={t("journey.share.closeLabel")}
              >
                <X size={22} color={Colors.textTertiary} strokeWidth={2} />
              </TouchableOpacity>
            </View>
            <Text style={styles.surveySub}>
              {t("journey.survey.sub")}
            </Text>

            <ScrollView
              style={[styles.surveyScroll, { maxHeight: Math.min(420, windowHeight * 0.5) }]}
              contentContainerStyle={[
                styles.surveyScrollContent,
                { paddingBottom: surveyScrollPad },
              ]}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              keyboardDismissMode="on-drag"
            >
              {sdtQuestions.map((q, index) => {
                const key = q.id as "autonomy" | "competence" | "relatedness";
                return (
                  <View key={q.id} style={styles.questionCard}>
                    <View style={styles.questionBadge}>
                      <Text style={styles.questionBadgeText}>{t("journey.survey.questionNum", { num: index + 1 })}</Text>
                      <Text style={styles.questionBadgeHint}>{q.label}</Text>
                    </View>
                    <Text style={styles.questionText}>{q.question}</Text>
                    <View style={styles.scale}>
                      {[1, 2, 3, 4, 5].map((v) => {
                        const selected = answers[key] === v;
                        return (
                          <TouchableOpacity
                            key={v}
                            style={[styles.scaleBtn, selected && styles.scaleBtnActive]}
                            onPress={() => setAnswers((prev) => ({ ...prev, [key]: v }))}
                            activeOpacity={0.85}
                            accessibilityRole="button"
                            accessibilityState={{ selected }}
                            accessibilityLabel={t("journey.survey.selectLabel", { v })}
                          >
                            <Text style={[styles.scaleNum, selected && styles.scaleNumActive]}>
                              {v}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                    <View style={styles.scaleHints}>
                      <Text style={[styles.scaleHint, styles.scaleHintLeft]} numberOfLines={2}>
                        1 — {q.low}
                      </Text>
                      <Text style={[styles.scaleHint, styles.scaleHintRight]} numberOfLines={2}>
                        5 — {q.high}
                      </Text>
                    </View>
                  </View>
                );
              })}
            </ScrollView>

            <View style={styles.surveyFooter}>
              <TouchableOpacity
                style={styles.submitBtn}
                onPress={async () => {
                  await saveScore(answers);
                  setShowSurvey(false);
                }}
                activeOpacity={0.9}
              >
                <Text style={styles.submitText}>{t("journey.survey.save")}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setShowSurvey(false)}
                hitSlop={{ top: 8, bottom: 8 }}
              >
                <Text style={styles.cancelText}>{t("journey.survey.cancel")}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      <JourneyPhaseEducationModal
        visible={showPhaseEdu}
        onClose={() => {
          setShowPhaseEdu(false);
          refreshEduPrefs();
        }}
        phaseId={journeyEduPhaseId}
        cards={journeyEduCards}
        hapticsEnabled={profile?.hapticsEnabled !== false}
      />
      <JourneyMindSentenceModal
        visible={showMindSentence}
        onClose={() => setShowMindSentence(false)}
        isPremium={isPremium}
        onHitFreeLimit={() => setShowGate(true)}
        onSave={saveMindSentence}
        onAfterMindSave={refreshEduPrefs}
        onOpenMindDump={() => {
          setShowMindSentence(false);
          navigation.navigate("MindDump");
        }}
      />
      <PremiumGateModal
        visible={showGate}
        onClose={() => setShowGate(false)}
        trigger={
          dayNumber >= 22 ? "day22" : dayNumber >= 7 ? "day7" : "journey"
        }
      />

      <JourneyDayDetailSheet
        visible={dayDetail != null}
        detail={dayDetail}
        isPreview={dayDetailPreview}
        onUnlockPremium={() => setShowGate(true)}
        onClose={() => {
          setDayDetail(null);
          setDayDetailPreview(false);
        }}
      />
    </SafeAreaView>
  );
}

function SDTBar({ label, value, max }: { label: string; value: number; max: number }) {
  const pct = value / max;
  return (
    <View style={sdtS.row}>
      <Text style={sdtS.label}>{label}</Text>
      <View style={sdtS.track}>
        <View style={[sdtS.fill, { width: `${pct * 100}%` }]} />
      </View>
      <Text style={sdtS.val}>
        {value}/{max}
      </Text>
    </View>
  );
}

const sdtS = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: Spacing.sm },
  label: {
    width: 72,
    fontSize: FontSizes.sm,
    fontFamily: "Inter_400Regular",
    color: Colors.textSecondary,
  },
  track: {
    flex: 1,
    height: 6,
    backgroundColor: Colors.border,
    borderRadius: Radii.full,
    overflow: "hidden",
  },
  fill: {
    height: "100%",
    backgroundColor: Colors.primary,
    borderRadius: Radii.full,
  },
  val: {
    width: 36,
    fontSize: FontSizes.xs,
    fontFamily: "Inter_500Medium",
    color: Colors.textTertiary,
    textAlign: "right",
  },
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: JOURNEY_PAGE_BG },
  scroll: {
    paddingHorizontal: Spacing.md,
    flexGrow: 1,
    paddingTop: Spacing.xs,
  },
  freeHeader: {
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.xs,
    marginBottom: 0,
  },
  premiumUpsellCard: {
    alignItems: "center",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    marginTop: Spacing.sm,
    marginBottom: Spacing.sm,
    backgroundColor: Colors.surface,
    borderRadius: Radii.card,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.borderStrong,
    gap: Spacing.md,
    ...Shadows.soft,
  },
  lockIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: Colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },
  lockedTitle: {
    fontSize: FontSizes.lg,
    fontFamily: "Inter_600SemiBold",
    fontWeight: "600",
    color: Colors.textPrimary,
    textAlign: "center",
  },
  lockedSub: {
    fontSize: FontSizes.sm,
    fontFamily: "Inter_400Regular",
    color: Colors.textSecondary,
    textAlign: "center",
    lineHeight: 19,
  },
  unlockBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: Colors.primary,
    borderRadius: Radii.button,
    paddingVertical: 11,
    paddingHorizontal: Spacing.lg,
  },
  unlockBtnText: {
    fontSize: FontSizes.md,
    fontFamily: "Inter_500Medium",
    color: "#fff",
  },
  phaseTeaserWrap: {
    width: "100%",
    backgroundColor: "#F0FDF9",
    borderRadius: Radii.card,
    padding: Spacing.sm,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: "rgba(47, 156, 134, 0.18)",
    gap: 5,
  },
  phaseTeaserHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  phaseTeaserKicker: {
    fontSize: FontSizes.xs,
    fontFamily: "Inter_600SemiBold",
    fontWeight: "600",
    color: Colors.primary,
    letterSpacing: 0.3,
  },
  phaseTeaserTitle: {
    fontSize: FontSizes.sm,
    fontFamily: "Inter_600SemiBold",
    fontWeight: "600",
    color: Colors.textPrimary,
  },
  phaseTeaserBody: {
    fontSize: FontSizes.xs,
    fontFamily: "Inter_400Regular",
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  phaseTeaserLockRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginTop: 2,
  },
  phaseTeaserLockText: {
    fontSize: FontSizes.xs,
    fontFamily: "Inter_500Medium",
    color: Colors.primary,
    fontStyle: "italic",
  },
  hero: {
    paddingTop: Spacing.sm,
    marginBottom: 0,
    paddingBottom: Spacing.xs,
  },
  stickyHero: {
    backgroundColor: JOURNEY_PAGE_BG,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.borderStrong,
    paddingBottom: Spacing.xs,
  },
  heroTitles: {
    flex: 1,
    paddingRight: Spacing.sm,
    minWidth: 0,
  },
  heroTop: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 0,
  },
  title: {
    fontSize: 22,
    fontFamily: "Inter_800ExtraBold",
    fontWeight: "800",
    color: "#0F172A",
  },
  subtitle: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: "#64748B",
    marginTop: 2,
    lineHeight: 17,
  },
  dayPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ECFDF5",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#A7F3D0",
  },
  dayPillIconWrap: {
    marginRight: 4,
  },
  dayPillText: {
    fontSize: 13,
    fontFamily: "Inter_700Bold",
    fontWeight: "700",
    color: "#059669",
  },
  progressTrack: {
    height: 3,
    borderRadius: 2,
    backgroundColor: "#E2E8F0",
    overflow: "hidden",
    marginTop: 8,
  },
  progressFillClip: {
    height: 4,
    borderRadius: 2,
    overflow: "hidden",
  },
  progressGradient: {
    width: "100%",
    height: 4,
  },
  progressHint: {
    fontSize: 10,
    fontFamily: "Inter_400Regular",
    color: Colors.textTertiary,
    marginTop: 4,
  },
  sectionLabelRow: {
    marginTop: 14,
    marginBottom: 8,
  },
  sectionLabel: {
    fontSize: 10,
    fontFamily: "Inter_700Bold",
    fontWeight: "700",
    letterSpacing: 1.2,
    color: "#94A3B8",
    textTransform: "uppercase",
  },
  journeyCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    shadowColor: "#0F172A",
    shadowOpacity: 0.04,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  packStack: {
    gap: 8,
    marginBottom: 6,
  },
  todayContextCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 12,
    gap: 6,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    ...Shadows.soft,
  },
  contextKicker: {
    fontSize: 9,
    fontFamily: "Inter_700Bold",
    fontWeight: "700",
    color: "#10B981",
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
  contextBody: {
    fontSize: FontSizes.sm,
    fontFamily: "Inter_400Regular",
    color: "#334155",
    lineHeight: 18,
  },
  contextDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: "#E2E8F0",
    marginVertical: 2,
  },
  principlePackBlock: {
    gap: 6,
    paddingHorizontal: 2,
  },
  principleScienceRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 5,
  },
  principleQuoteCompact: {
    fontSize: FontSizes.sm,
    fontFamily: "Inter_500Medium",
    fontStyle: "italic",
    color: "#059669",
    lineHeight: 20,
    textAlign: "center",
  },
  principleActionCompact: {
    flex: 1,
    fontSize: FontSizes.xs,
    fontFamily: "Inter_500Medium",
    color: "#059669",
    lineHeight: 16,
  },
  coachActionRow: {
    flexDirection: "row",
    gap: 8,
  },
  coachChip: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 10,
    gap: 4,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    minHeight: 88,
    ...Shadows.soft,
  },
  coachChipIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  coachChipTitle: {
    fontSize: FontSizes.xs,
    fontFamily: "Inter_600SemiBold",
    fontWeight: "600",
    color: Colors.textPrimary,
    lineHeight: 16,
  },
  coachChipSub: {
    fontSize: 10,
    fontFamily: "Inter_400Regular",
    color: Colors.textTertiary,
    lineHeight: 14,
  },
  cardStackGap: {
    marginBottom: 10,
  },
  sectionHint: {
    fontSize: FontSizes.xs,
    fontFamily: "Inter_400Regular",
    color: Colors.textTertiary,
  },
  planStack: {
    gap: 10,
  },
  tomorrowPlanCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(16, 185, 129, 0.14)",
    shadowColor: "#0F172A",
    shadowOpacity: 0.05,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  planCardHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
  },
  planKicker: {
    fontSize: FontSizes.xs,
    fontFamily: "Inter_700Bold",
    fontWeight: "700",
    color: Colors.primary,
    letterSpacing: 0.8,
    textTransform: "uppercase",
    marginBottom: 6,
  },
  planAction: {
    fontSize: FontSizes.xl,
    fontFamily: "Inter_700Bold",
    fontWeight: "700",
    color: Colors.textPrimary,
    lineHeight: 26,
  },
  planStatusPill: {
    backgroundColor: "#ECFDF5",
    borderRadius: Radii.pill,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: "#A7F3D0",
  },
  planStatusText: {
    fontSize: FontSizes.xs,
    fontFamily: "Inter_700Bold",
    fontWeight: "700",
    color: "#059669",
  },
  todoList: {
    marginTop: 14,
    gap: 8,
  },
  primaryTodoRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: "rgba(16, 185, 129, 0.18)",
    gap: 10,
  },
  supportTodoRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    gap: 10,
  },
  todoRowCompleted: {
    opacity: 0.72,
  },
  todoCheck: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
  },
  todoCheckSmall: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: "#CBD5E1",
    backgroundColor: "#FFFFFF",
  },
  todoCheckDone: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  todoCheckPlanned: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: "#A7F3D0",
    backgroundColor: "#FFFFFF",
  },
  todoCheckSmallPlanned: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: "#CBD5E1",
    backgroundColor: "#FFFFFF",
  },
  planScheduleHint: {
    marginTop: 10,
    fontSize: FontSizes.xs,
    fontFamily: "Inter_400Regular",
    color: Colors.textSecondary,
    lineHeight: 17,
  },
  todoTextWrap: {
    flex: 1,
    minWidth: 0,
  },
  primaryTodoText: {
    fontSize: FontSizes.md,
    fontFamily: "Inter_700Bold",
    fontWeight: "700",
    color: Colors.textPrimary,
    lineHeight: 21,
  },
  supportTodoText: {
    fontSize: FontSizes.sm,
    fontFamily: "Inter_500Medium",
    color: Colors.textPrimary,
    lineHeight: 19,
  },
  todoTextCompleted: {
    textDecorationLine: "line-through",
    color: Colors.textTertiary,
  },
  todoMeta: {
    marginTop: 2,
    fontSize: FontSizes.xs,
    fontFamily: "Inter_400Regular",
    color: Colors.textTertiary,
    lineHeight: 17,
  },
  todoEditChip: {
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: Radii.pill,
    backgroundColor: "#F1F5F9",
  },
  todoEditText: {
    fontSize: 11,
    fontFamily: "Inter_700Bold",
    fontWeight: "700",
    color: "#64748B",
  },
  todoFooter: {
    gap: 10,
    marginTop: 14,
  },
  planAddSmallBtn: {
    backgroundColor: Colors.primaryLight,
    borderRadius: Radii.button,
    paddingVertical: 12,
    alignItems: "center",
  },
  planAddSmallText: {
    fontSize: FontSizes.sm,
    fontFamily: "Inter_700Bold",
    fontWeight: "700",
    color: Colors.primaryDark,
  },
  todoLimitText: {
    fontSize: FontSizes.xs,
    fontFamily: "Inter_500Medium",
    color: Colors.textTertiary,
    textAlign: "center",
  },
  planDeleteBtn: {
    paddingHorizontal: 18,
    backgroundColor: "#FEF2F2",
    borderRadius: Radii.button,
    paddingVertical: 12,
    alignItems: "center",
  },
  planDeleteText: {
    fontSize: FontSizes.sm,
    fontFamily: "Inter_700Bold",
    fontWeight: "700",
    color: "#DC2626",
  },
  planEmptyTitle: {
    fontSize: FontSizes.xl,
    fontFamily: "Inter_700Bold",
    fontWeight: "700",
    color: Colors.textPrimary,
  },
  planEmptySub: {
    fontSize: FontSizes.sm,
    fontFamily: "Inter_400Regular",
    color: Colors.textSecondary,
    lineHeight: 20,
    marginTop: 6,
  },
  planAddBtn: {
    marginTop: 14,
    backgroundColor: Colors.primary,
    borderRadius: Radii.button,
    paddingVertical: 13,
    alignItems: "center",
  },
  planAddText: {
    fontSize: FontSizes.md,
    fontFamily: "Inter_700Bold",
    fontWeight: "700",
    color: "#FFFFFF",
  },
  planForm: {
    gap: 12,
  },
  planField: {
    gap: 6,
  },
  planFieldLabel: {
    fontSize: FontSizes.xs,
    fontFamily: "Inter_700Bold",
    fontWeight: "700",
    color: Colors.textSecondary,
  },
  planInput: {
    minHeight: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    backgroundColor: "#F8FAFC",
    paddingHorizontal: 14,
    fontSize: FontSizes.md,
    fontFamily: "Inter_400Regular",
    color: Colors.textPrimary,
  },
  planSaveBtn: {
    marginTop: 4,
    backgroundColor: Colors.primary,
    borderRadius: Radii.button,
    paddingVertical: 14,
    alignItems: "center",
  },
  planSaveBtnDisabled: {
    opacity: 0.45,
  },
  planSaveText: {
    fontSize: FontSizes.md,
    fontFamily: "Inter_700Bold",
    fontWeight: "700",
    color: "#FFFFFF",
  },
  planModalDeleteBtn: {
    alignItems: "center",
    paddingVertical: 10,
  },
  planModalDeleteText: {
    fontSize: FontSizes.sm,
    fontFamily: "Inter_700Bold",
    fontWeight: "700",
    color: "#DC2626",
  },
  milestoneCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    shadowColor: "#0F172A",
    shadowOpacity: 0.04,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  milestoneLabel: {
    fontSize: 10,
    fontFamily: "Inter_700Bold",
    fontWeight: "700",
    color: "#10B981",
    letterSpacing: 1,
    marginBottom: 6,
    textTransform: "uppercase",
  },
  milestoneText: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: "#334155",
    lineHeight: 20,
  },
  odakLine: {
    textAlign: "center",
    lineHeight: 22,
    paddingHorizontal: Spacing.sm,
  },
  odakQuoteMark: {
    fontSize: 15,
    fontFamily: "Inter_700Bold",
    fontWeight: "700",
    color: "#10B981",
  },
  odakBody: {
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    fontStyle: "italic",
    color: "#475569",
    lineHeight: 22,
  },
  principleBlock: {
    gap: 6,
  },
  principleMetaRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 5,
    paddingTop: 6,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#E2E8F0",
  },
  principleScience: {
    flex: 1,
    fontSize: FontSizes.xs,
    fontFamily: "Inter_400Regular",
    color: "#94A3B8",
    lineHeight: 17,
  },
  principleActionRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 5,
  },
  principleAction: {
    flex: 1,
    fontSize: FontSizes.sm,
    fontFamily: "Inter_500Medium",
    color: "#059669",
    lineHeight: 20,
  },
  phaseHScroll: {
    paddingVertical: 4,
    paddingRight: Spacing.md,
    marginBottom: 6,
  },
  phaseCardOpen: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 12,
    gap: 6,
    shadowColor: "#0F172A",
    shadowOpacity: 0.04,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  phaseCardOpenActive: {
    borderWidth: 1.5,
    borderColor: "#10B981",
  },
  phaseCardOpenDone: {
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  phaseCardLocked: {
    backgroundColor: "#F1F5F9",
    borderRadius: 12,
    borderWidth: 0,
    padding: 12,
    minHeight: 200,
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
  },
  phaseCardLockedLabel: {
    fontSize: FontSizes.md,
    fontFamily: "Inter_500Medium",
    color: "#94A3B8",
    marginBottom: Spacing.xs,
  },
  phaseCardLockedHint: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: "#94A3B8",
    textAlign: "center",
  },
  phaseCardBadgeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    alignSelf: "flex-start",
  },
  phaseCardDoneBadgeText: {
    fontSize: FontSizes.xs,
    fontFamily: "Inter_500Medium",
  },
  phaseActiveBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#ECFDF5",
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  phaseActiveBadgeText: {
    fontSize: 10,
    fontFamily: "Inter_700Bold",
    fontWeight: "700",
    color: "#059669",
  },
  phaseCardTitle: {
    fontSize: FontSizes.lg,
    fontFamily: "Inter_600SemiBold",
    fontWeight: "600",
    color: Colors.textPrimary,
  },
  phaseCardRange: {
    fontSize: FontSizes.xs,
    fontFamily: "Inter_400Regular",
    color: Colors.textTertiary,
  },
  phaseCardSub: {
    fontSize: FontSizes.xs,
    fontFamily: "Inter_400Regular",
    color: Colors.textSecondary,
    lineHeight: 17,
  },
  phaseMiniGridWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: Spacing.xs,
  },
  phaseMiniCell: {
    borderRadius: 2,
  },
  coachBanner: {
    backgroundColor: Colors.purpleLight,
    borderRadius: Radii.card,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: "rgba(83,74,183,0.15)",
    gap: 4,
  },
  coachBannerLabel: {
    fontSize: FontSizes.xs,
    fontFamily: "Inter_500Medium",
    color: Colors.purple,
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  coachBannerText: {
    fontSize: FontSizes.sm,
    fontFamily: "Inter_400Regular",
    color: Colors.textPrimary,
    lineHeight: 20,
  },
  momentBanner: {
    backgroundColor: Colors.primaryLight,
    borderRadius: Radii.card,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: "rgba(29,158,117,0.22)",
    gap: 4,
  },
  momentBannerLabel: {
    fontSize: FontSizes.xs,
    fontFamily: "Inter_500Medium",
    color: Colors.primaryDark,
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  momentBannerText: {
    fontSize: FontSizes.sm,
    fontFamily: "Inter_400Regular",
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  packBlock: { gap: Spacing.sm },
  packRow: { flexDirection: "row", alignItems: "center", gap: Spacing.xs },
  packKicker: {
    fontSize: FontSizes.xs,
    fontFamily: "Inter_500Medium",
    color: Colors.textTertiary,
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  packPrinciple: {
    fontSize: FontSizes.md,
    fontFamily: "Inter_500Medium",
    color: Colors.textPrimary,
    lineHeight: 24,
    fontStyle: "italic",
  },
  trainRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  trainIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  trainMid: { flex: 1, gap: 2 },
  trainTitle: {
    fontSize: FontSizes.md,
    fontFamily: "Inter_500Medium",
    color: Colors.textPrimary,
  },
  trainSub: {
    fontSize: FontSizes.xs,
    fontFamily: "Inter_400Regular",
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  mindEcho: {
    marginTop: 4,
    fontSize: FontSizes.xs,
    fontFamily: "Inter_400Regular",
    fontStyle: "italic",
    color: Colors.textTertiary,
    lineHeight: 17,
  },
  phaseStripDone: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    backgroundColor: Colors.primaryLight,
    borderRadius: Radii.card,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: "rgba(29,158,117,0.2)",
  },
  phaseStripDoneText: {
    flex: 1,
    fontSize: FontSizes.sm,
    fontFamily: "Inter_500Medium",
    color: Colors.primaryDark,
  },
  phaseStripLocked: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    backgroundColor: Colors.surface,
    borderRadius: Radii.card,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
    opacity: 0.92,
    ...Shadows.soft,
  },
  phaseStripLockedBody: { flex: 1 },
  phaseStripLockedTitle: {
    fontSize: FontSizes.sm,
    fontFamily: "Inter_500Medium",
    color: Colors.textSecondary,
  },
  phaseStripLockedSub: {
    fontSize: FontSizes.xs,
    fontFamily: "Inter_400Regular",
    color: Colors.textTertiary,
    marginTop: 2,
  },
  phaseCardActive: {
    backgroundColor: Colors.surface,
    borderRadius: Radii.card + 2,
    borderWidth: 2,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    gap: Spacing.sm,
    borderColor: Colors.primary,
    ...Shadows.card,
  },
  phaseActiveHead: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  phaseBadge: { borderRadius: Radii.pill, paddingHorizontal: Spacing.sm, paddingVertical: 4 },
  phaseBadgeText: { fontSize: FontSizes.xs, fontFamily: "Inter_500Medium" },
  phaseActiveRange: {
    fontSize: FontSizes.xs,
    fontFamily: "Inter_400Regular",
    color: Colors.textTertiary,
  },
  phaseName: {
    fontSize: FontSizes.xl,
    fontFamily: "Inter_500Medium",
    color: Colors.textPrimary,
  },
  phaseSub: {
    fontSize: FontSizes.sm,
    fontFamily: "Inter_400Regular",
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  phaseGridWrap: {
    marginTop: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    gap: Spacing.sm,
  },
  gridCaption: {
    fontSize: FontSizes.xs,
    fontFamily: "Inter_500Medium",
    color: Colors.textTertiary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  regressionCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 12,
    gap: Spacing.xs,
    shadowColor: "#0F172A",
    shadowOpacity: 0.04,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  regressionRow: { flexDirection: "row", alignItems: "center", gap: Spacing.sm },
  regressionTitle: {
    fontSize: FontSizes.md,
    fontFamily: "Inter_500Medium",
    color: Colors.primaryDark,
  },
  regressionBody: {
    fontSize: FontSizes.sm,
    fontFamily: "Inter_400Regular",
    color: Colors.textPrimary,
    lineHeight: 20,
  },
  sdtCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 0,
    padding: 12,
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
    shadowColor: "#0F172A",
    shadowOpacity: 0.04,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  sdtTitle: {
    fontSize: FontSizes.md,
    fontFamily: "Inter_500Medium",
    color: Colors.textPrimary,
  },
  sdtSub: {
    fontSize: FontSizes.sm,
    fontFamily: "Inter_400Regular",
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  sdtBars: { gap: Spacing.sm },
  sdtInsightBlock: {
    marginTop: Spacing.sm,
    paddingTop: Spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Colors.border,
    gap: 6,
  },
  sdtInsightSummary: {
    fontSize: FontSizes.sm,
    fontFamily: "Inter_400Regular",
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  sdtInsightTip: {
    fontSize: FontSizes.sm,
    fontFamily: "Inter_500Medium",
    color: Colors.primaryDark,
    lineHeight: 20,
  },
  sdtTrendBlock: {
    marginTop: Spacing.sm,
    paddingTop: Spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Colors.border,
    gap: 6,
  },
  sdtTrendTitle: {
    fontSize: FontSizes.xs,
    fontFamily: "Inter_600SemiBold",
    fontWeight: "600",
    color: Colors.textTertiary,
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  sdtTrendRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 8,
    height: 40,
  },
  sdtTrendCol: {
    flex: 1,
    alignItems: "center",
    gap: 3,
    height: "100%",
    justifyContent: "flex-end",
  },
  sdtTrendBarTrack: {
    width: "100%",
    flex: 1,
    backgroundColor: "#F1F5F9",
    borderRadius: 3,
    overflow: "hidden",
    justifyContent: "flex-end",
  },
  sdtTrendBarFill: {
    width: "100%",
    borderRadius: 3,
  },
  sdtTrendLabel: {
    fontSize: 10,
    fontFamily: "Inter_400Regular",
    color: Colors.textTertiary,
  },
  surveyBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: Colors.primaryLight,
    borderRadius: Radii.button,
    padding: Spacing.md,
  },
  surveyBtnText: {
    fontSize: FontSizes.md,
    fontFamily: "Inter_500Medium",
    color: Colors.primary,
  },
  updateText: {
    fontSize: FontSizes.sm,
    fontFamily: "Inter_400Regular",
    color: Colors.textTertiary,
    textAlign: "center",
  },
  shareBlock: {
    alignItems: "center",
    marginTop: 16,
    marginBottom: Spacing.lg,
  },
  shareRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
  },
  shareIconWrap: {
    marginRight: 6,
  },
  shareText: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
    fontWeight: "600",
    color: "#059669",
  },
  shareUnderline: {
    width: 120,
    height: 1,
    backgroundColor: "#A7F3D0",
    marginTop: 4,
    alignSelf: "center",
  },
  surveyOverlay: { flex: 1 },
  planModalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  planModalSheet: {
    width: "100%",
    flexShrink: 1,
    maxHeight: undefined,
  },
  planModalScroll: {
    flexGrow: 0,
    flexShrink: 1,
  },
  planModalScrollContent: {
    paddingBottom: Spacing.sm,
  },
  planModalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: Colors.overlay,
  },
  surveyBackdrop: {
    flex: 1,
    width: "100%",
    backgroundColor: Colors.overlay,
  },
  surveySheet: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.sm,
    maxHeight: "92%",
    borderTopWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 16,
  },
  surveyHandle: {
    alignSelf: "center",
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.border,
    marginBottom: Spacing.md,
  },
  surveyHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: Spacing.sm,
  },
  surveyHeaderLeft: { flexDirection: "row", alignItems: "center", gap: Spacing.md, flex: 1 },
  surveyIconWrap: {
    width: 44,
    height: 44,
    borderRadius: Radii.button,
    backgroundColor: Colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },
  surveyClose: {
    padding: Spacing.xs,
    borderRadius: Radii.button,
  },
  surveyTitle: {
    fontSize: FontSizes.xl,
    fontFamily: "Inter_500Medium",
    color: Colors.textPrimary,
  },
  surveyMeta: {
    fontSize: FontSizes.xs,
    fontFamily: "Inter_400Regular",
    color: Colors.textTertiary,
    marginTop: 2,
  },
  surveySub: {
    fontSize: FontSizes.sm,
    fontFamily: "Inter_400Regular",
    color: Colors.textSecondary,
    lineHeight: 20,
    marginBottom: Spacing.md,
  },
  surveyScroll: { flexGrow: 0, flexShrink: 1 },
  surveyScrollContent: {
    paddingBottom: Spacing.md,
    gap: Spacing.md,
  },
  questionCard: {
    gap: Spacing.md,
    padding: Spacing.lg,
    borderRadius: Radii.button,
    backgroundColor: Colors.bg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  questionBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    flexWrap: "wrap",
  },
  questionBadgeText: {
    fontSize: FontSizes.xs,
    fontFamily: "Inter_500Medium",
    color: Colors.primary,
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  questionBadgeHint: {
    fontSize: FontSizes.xs,
    fontFamily: "Inter_400Regular",
    color: Colors.textTertiary,
  },
  questionText: {
    fontSize: FontSizes.md,
    fontFamily: "Inter_400Regular",
    color: Colors.textPrimary,
    lineHeight: 22,
  },
  scale: { flexDirection: "row", gap: 6 },
  scaleBtn: {
    flex: 1,
    minHeight: 44,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.surface,
  },
  scaleBtnActive: { borderColor: Colors.primary, backgroundColor: Colors.primaryLight },
  scaleNum: {
    fontSize: FontSizes.md,
    fontFamily: "Inter_400Regular",
    color: Colors.textSecondary,
  },
  scaleNumActive: { color: Colors.primary, fontFamily: "Inter_500Medium" },
  scaleHints: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: Spacing.md,
    marginTop: -4,
  },
  scaleHint: {
    flex: 1,
    fontSize: FontSizes.xs,
    fontFamily: "Inter_400Regular",
    color: Colors.textTertiary,
    lineHeight: 16,
  },
  scaleHintLeft: { textAlign: "left" },
  scaleHintRight: { textAlign: "right" },
  surveyFooter: {
    gap: Spacing.sm,
    paddingTop: Spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Colors.border,
    marginTop: Spacing.sm,
  },
  submitBtn: {
    backgroundColor: Colors.primary,
    borderRadius: Radii.button,
    paddingVertical: 14,
    alignItems: "center",
  },
  submitText: { fontSize: FontSizes.md, fontFamily: "Inter_500Medium", color: "#fff" },
  cancelBtn: {
    paddingVertical: Spacing.sm,
    alignItems: "center",
  },
  cancelText: {
    fontSize: FontSizes.sm,
    fontFamily: "Inter_500Medium",
    color: Colors.textSecondary,
    textAlign: "center",
  },
});
