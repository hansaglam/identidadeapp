import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
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
} from "lucide-react-native";
import { useUserStore } from "../store/userStore";
import { useCheckinsStore } from "../store/checkinsStore";
import { useSDTStore } from "../store/sdtStore";
import { useMindDumpStore } from "../store/mindDumpStore";
import PremiumGateModal from "../components/PremiumGateModal";
import SVGTree from "../components/tree/SVGTree";
import TimeMachineCard from "../components/journey/TimeMachineCard";
import JourneyGrid from "../components/habit-detail/JourneyGrid";
import JourneyPhaseEducationModal from "../components/JourneyPhaseEducationModal";
import JourneyMindSentenceModal from "../components/JourneyMindSentenceModal";
import {
  Colors,
  Spacing,
  Radii,
  FontSizes,
  JOURNEY_PHASES,
  SDT_QUESTIONS,
  Shadows,
  getCoachNote,
} from "../constants/theme";
import { getDailyPrinciple } from "../constants/identity-copy";
import { getJourneyEducationCards, phaseIdFromDay } from "../constants/journeyPhaseEducation";
import { getJourneyMomentLine } from "../constants/journeyMoments";
import { estimateAutomationFromFirst14Linear, getAverageAutomaticity } from "../utils/profileMetrics";
import type { JourneyEducationPrefsState } from "../utils/journeyEducationPrefs";
import { loadJourneyEducationPrefs } from "../utils/journeyEducationPrefs";
import { MainTabParamList } from "../types";

const JOURNEY_PAGE_BG = "#F8FAFC";

const ACTION_ICON = "#10B981";
const ACTION_ICON_BG = "rgba(16, 185, 129, 0.1)";

const ENTRANCE_COUNT = 7;
const ENTRANCE_STAGGER_MS = 80;
const ENTRANCE_INITIAL_DELAY_MS = 100;

function useJourneyEntrance(isPremium: boolean) {
  const opacity = useRef(
    Array.from({ length: ENTRANCE_COUNT }, () => new Animated.Value(0))
  ).current;
  const translateY = useRef(
    Array.from({ length: ENTRANCE_COUNT }, () => new Animated.Value(20))
  ).current;

  useFocusEffect(
    useCallback(() => {
      if (!isPremium) return;
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

type PhaseOpenTheme = {
  borderColor: string;
  badgeBg: string;
  badgeText: string;
  gridDone: string;
  shadowColor: string;
  showGlow: boolean;
};

function getPhaseOpenTheme(
  phaseId: 1 | 2 | 3,
  isActive: boolean,
  isCompleted: boolean
): PhaseOpenTheme {
  const showGlow = isActive && !isCompleted;
  if (phaseId === 1) {
    return {
      borderColor: Colors.primary,
      badgeBg: Colors.primaryLight,
      badgeText: Colors.primaryDark,
      gridDone: Colors.primary,
      shadowColor: Colors.primary,
      showGlow,
    };
  }
  if (phaseId === 2) {
    return {
      borderColor: "#E07A5F",
      badgeBg: "#FDEBE5",
      badgeText: "#C45C42",
      gridDone: "#E07A5F",
      shadowColor: "#E8917A",
      showGlow,
    };
  }
  return {
    borderColor: "#7B5B9E",
    badgeBg: "#F7F0E2",
    badgeText: "#5A4578",
    gridDone: Colors.gold,
    shadowColor: "#8B6BBD",
    showGlow,
  };
}

function PhaseMiniGrid({
  phaseGrid,
  dayNumber,
  phase,
}: {
  phase: (typeof JOURNEY_PHASES)[number];
  phaseGrid: boolean[];
  dayNumber: number;
}) {
  const cellSize = 10;
  const gap = 2;
  const doneColor = "#059669";
  const restColor = "#E2E8F0";
  const missedColor = "#FECACA";

  return (
    <View style={[styles.phaseMiniGridWrap, { gap }]}>
      {phaseGrid.map((done, i) => {
        const day = phase.startDay + i;
        const isFuture = dayNumber <= 66 && day > dayNumber;
        const isMissed =
          !done && ((dayNumber <= 66 && day < dayNumber) || dayNumber > 66);
        let backgroundColor = restColor;
        if (done) backgroundColor = doneColor;
        else if (isMissed) backgroundColor = missedColor;
        else if (isFuture) backgroundColor = restColor;

        return (
          <View
            key={i}
            style={[
              styles.phaseMiniCell,
              { width: cellSize, height: cellSize, backgroundColor },
            ]}
          />
        );
      })}
    </View>
  );
}

export default function JourneyScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { height: windowHeight, width: windowWidth } = useWindowDimensions();
  const journeyScrollY = useRef(new Animated.Value(0)).current;
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

  const { last66Days } = useCheckinsStore();
  const { scores, load: loadSDT, saveScore, needsSurvey, latestScore } = useSDTStore();

  const checkins = useCheckinsStore((s) => s.checkins);
  const completedCheckinCount = useMemo(
    () => Object.values(checkins).filter((r) => r.completed).length,
    [checkins]
  );
  const { completionRate } = useCheckinsStore();
  const createMindEntry = useMindDumpStore((s) => s.createEntry);

  const isPremium = profile?.isPremium ?? false;
  const { entranceOpacity, entranceY } = useJourneyEntrance(isPremium);
  const [showGate, setShowGate] = useState(false);
  const [showSurvey, setShowSurvey] = useState(false);
  const [showPhaseEdu, setShowPhaseEdu] = useState(false);
  const [showMindSentence, setShowMindSentence] = useState(false);
  const [answers, setAnswers] = useState({ autonomy: 3, competence: 3, relatedness: 3 });

  const linearEstimate = useMemo(() => {
    if (!profile || dayNumber < 14) return null;
    return estimateAutomationFromFirst14Linear(profile.startDate, checkins);
  }, [profile, checkins, dayNumber]);

  const avgAuto = useMemo(() => getAverageAutomaticity(checkins), [checkins]);
  const rate = profile ? completionRate(profile.startDate) : 0;

  const dailyPrinciple = getDailyPrinciple(dayNumber);
  const coachNote = getCoachNote(dayNumber);

  const journeyEduCards = useMemo(() => getJourneyEducationCards(dayNumber), [dayNumber]);
  const journeyEduPhaseId = useMemo<1 | 2 | 3>(() => {
    const p = dailyPrinciple?.phaseId;
    if (p === 1 || p === 2 || p === 3) return p;
    return phaseIdFromDay(dayNumber);
  }, [dailyPrinciple?.phaseId, dayNumber]);

  const momentLine = useMemo(() => getJourneyMomentLine(dayNumber), [dayNumber]);
  const [eduPrefs, setEduPrefs] = useState<JourneyEducationPrefsState | null>(null);

  const refreshEduPrefs = useCallback(() => {
    void loadJourneyEducationPrefs().then(setEduPrefs);
  }, []);

  useFocusEffect(
    useCallback(() => {
      if (isPremium) refreshEduPrefs();
      if (!profile?.id || profile?.hasOpenedJourneyTab) return;
      void updateProfile({ hasOpenedJourneyTab: true });
    }, [isPremium, refreshEduPrefs, profile?.id, profile?.hasOpenedJourneyTab, updateProfile])
  );

  const eduPhaseCompleted =
    eduPrefs?.phasesCompleted12[String(journeyEduPhaseId) as "1" | "2" | "3"];
  const saveMindSentence = useCallback(
    async (text: string) => createMindEntry(text),
    [createMindEntry]
  );

  useEffect(() => {
    loadSDT();
  }, []);

  useEffect(() => {
    if (!profile || isPremium) return;
    if (dayNumber >= 7 && !profile.premiumGateDay7Shown) {
      markPremiumGateShown("day7");
      setShowGate(true);
    }
  }, [dayNumber]);

  useEffect(() => {
    if (isPremium && needsSurvey() && dayNumber > 7) {
      setShowSurvey(true);
    }
  }, [isPremium, scores.length]);

  const grid = profile ? last66Days(profile.startDate) : [];
  const gridCompletionPct = useMemo(
    () => Math.min(100, Math.round((grid.filter(Boolean).length / 66) * 100)),
    [grid]
  );
  const latest = latestScore();
  const journeyProgress = Math.min(1, Math.max(0, dayNumber / 66));
  const coachNoteText = coachNote;

  const phaseCardWidth = Math.round(windowWidth * 0.8);
  const phaseSnapInterval = phaseCardWidth + 10;

  if (!isPremium) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: JOURNEY_PAGE_BG }]} edges={["top"]}>
        <View style={styles.lockedContainer}>
          <View style={styles.lockIcon}>
            <Lock size={32} color={Colors.primary} strokeWidth={1.5} />
          </View>
          <Text style={styles.lockedTitle}>66 Gün Haritası</Text>
          <Text style={styles.lockedSub}>
            Bugün ekranında tek net hareket + check-in akışın çalışır; fazın “tek fikri” özeti de
            orada. 66 günlük harita ve buradaki detaylı yol özeti premium ile açılır.
          </Text>
          <TouchableOpacity
            style={styles.unlockBtn}
            onPress={() => setShowGate(true)}
            activeOpacity={0.8}
          >
            <Text style={styles.unlockBtnText}>Kilidi aç</Text>
            <ChevronRight size={18} color="#fff" strokeWidth={2} />
          </TouchableOpacity>
        </View>
        <PremiumGateModal visible={showGate} onClose={() => setShowGate(false)} trigger="journey" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: JOURNEY_PAGE_BG }]} edges={["top"]}>
      <ScrollView
        stickyHeaderIndices={[0]}
        contentContainerStyle={[styles.scroll, { backgroundColor: JOURNEY_PAGE_BG }]}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: journeyScrollY } } }], {
          useNativeDriver: false,
        })}
      >
        <View style={styles.stickyHero} collapsable={false}>
          <View style={styles.hero}>
            <View style={styles.heroTop}>
              <View style={styles.heroTitles}>
                <Text style={styles.title}>Yolculuğun</Text>
                <Text style={styles.subtitle}>
                  66 günlük kimlik inşası · Gün {dayNumber}
                </Text>
              </View>
              <View style={styles.dayPill}>
                <View style={styles.dayPillIconWrap}>
                  <Map size={16} color="#059669" strokeWidth={2} />
                </View>
                <Text style={styles.dayPillText}>
                  {dayNumber}/66
                </Text>
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
              Tamamlama bu dönemde %{Math.round(rate * 100)}
              {avgAuto != null ? ` · Ort. otomatiklik ${avgAuto.toFixed(1)}/10` : ""}
            </Text>
          </View>
        </View>

        <Animated.View
          style={{
            opacity: entranceOpacity[0],
            transform: [{ translateY: entranceY[0] }],
          }}
        >
          <View style={styles.treeAreaWrap}>
            <SVGTree day={dayNumber} />
          </View>
        </Animated.View>

        <Animated.View
          style={{
            opacity: entranceOpacity[1],
            transform: [{ translateY: entranceY[1] }],
          }}
        >
          <TimeMachineCard
            dayNumber={dayNumber}
            checkins={checkins}
            completedCount={completedCheckinCount}
          />
        </Animated.View>

        <Animated.View
          style={{
            opacity: entranceOpacity[2],
            transform: [{ translateY: entranceY[2] }],
          }}
        >
        <View style={styles.sectionLabelRow}>
          <Text style={styles.sectionLabel}>BUGÜNÜN PAKETİ</Text>
        </View>
        <View style={styles.packStack}>
          {coachNoteText ? (
            <View style={styles.milestoneCard}>
              <Text style={styles.milestoneLabel}>KİLOMETRE TAŞI</Text>
              <Text style={styles.milestoneText}>{coachNoteText}</Text>
            </View>
          ) : momentLine ? (
            <View style={styles.milestoneCard}>
              <Text style={styles.milestoneLabel}>BUGÜNÜN BAĞLAMI</Text>
              <Text style={styles.milestoneText}>{momentLine}</Text>
            </View>
          ) : null}

          {dailyPrinciple ? (
            <Text style={styles.odakLine}>
              <Text style={styles.odakQuoteMark}>{"\u201C"}</Text>
              <Text style={styles.odakBody}>{dailyPrinciple.principle}</Text>
              <Text style={styles.odakQuoteMark}>{"\u201D"}</Text>
            </Text>
          ) : null}

          <TouchableOpacity
            style={[styles.journeyCard, styles.trainRow]}
            onPress={() => setShowPhaseEdu(true)}
            activeOpacity={0.85}
          >
            <View style={[styles.trainIcon, { backgroundColor: ACTION_ICON_BG }]}>
              <BookOpen size={20} color={ACTION_ICON} strokeWidth={2} />
            </View>
            <View style={styles.trainMid}>
              <Text style={styles.trainTitle}>Bu fazda beyin nasıl çalışıyor?</Text>
              <Text style={styles.trainSub}>
                {eduPhaseCompleted
                  ? "Bu faz özetini daha önce tamamladın — yenilemek istersen aç."
                  : "4 kısa kart · ~30 sn · bulunduğun faza göre"}
              </Text>
            </View>
            <ChevronRight size={20} color="#CBD5E1" strokeWidth={2} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.journeyCard, styles.trainRow]}
            onPress={() => setShowMindSentence(true)}
            activeOpacity={0.85}
          >
            <View style={[styles.trainIcon, { backgroundColor: ACTION_ICON_BG }]}>
              <PenLine size={20} color={ACTION_ICON} strokeWidth={2} />
            </View>
            <View style={styles.trainMid}>
              <Text style={styles.trainTitle}>Yolculuktan bir cümle</Text>
              <Text style={styles.trainSub}>Zihin’e yazılı sırayla tek satır · iste tam Zihine geç</Text>
              {eduPrefs?.lastMindSentenceSnippet ? (
                <Text style={styles.mindEcho} numberOfLines={2}>
                  Son satırın: “{eduPrefs.lastMindSentenceSnippet}”
                </Text>
              ) : null}
            </View>
            <ChevronRight size={20} color="#CBD5E1" strokeWidth={2} />
          </TouchableOpacity>
        </View>
        </Animated.View>

        <Animated.View
          style={{
            opacity: entranceOpacity[3],
            transform: [{ translateY: entranceY[3] }],
          }}
        >
        <View style={styles.sectionLabelRow}>
          <Text style={styles.sectionLabel}>66 GÜN · 3 FAZ</Text>
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
                  <Text style={styles.phaseCardLockedLabel}>{phase.label}</Text>
                  <Lock size={28} color="#CBD5E1" strokeWidth={1.8} />
                  <Text style={styles.phaseCardLockedHint}>
                    Gün {phase.startDay}&apos;te açılır
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
                      Tamamlandı
                    </Text>
                  </View>
                ) : (
                  <View style={styles.phaseActiveBadge}>
                    <Text style={styles.phaseActiveBadgeText}>
                      Şu an · Faz {phase.id}
                    </Text>
                  </View>
                )}
                <Text style={styles.phaseCardTitle}>{phase.label}</Text>
                <Text style={styles.phaseCardRange}>{phase.days}</Text>
                <Text style={styles.phaseCardSub} numberOfLines={4}>
                  {phase.subtitle}
                </Text>
                <PhaseMiniGrid phase={phase} phaseGrid={phaseGrid} dayNumber={dayNumber} />
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
        {profile ? (
          <JourneyGrid
            startDate={profile.startDate}
            dayNumber={dayNumber}
            completedByDay={grid}
            completionPercent={gridCompletionPct}
            style={[styles.cardStackGap, styles.journeyMapBlock]}
          />
        ) : null}
        </Animated.View>

        <Animated.View
          style={{
            opacity: entranceOpacity[5],
            transform: [{ translateY: entranceY[5] }],
          }}
        >
        <View style={styles.sectionLabelRow}>
          <Text style={styles.sectionLabel}>BİLİM & ÖLÇÜM</Text>
        </View>

        {dayNumber >= 14 && linearEstimate ? (
          <View style={[styles.regressionCard, styles.cardStackGap]}>
            <View style={styles.regressionRow}>
              <TrendingUp size={18} color={Colors.primary} strokeWidth={1.8} />
              <Text style={styles.regressionTitle}>Otomatikleşme eğrisi</Text>
            </View>
            <Text style={styles.regressionBody}>
              İlk 14 güne göre tahmini eğim: +{linearEstimate.slopePerDay.toFixed(1)} / gün
              {linearEstimate.predictedDayAt7
                ? ` · ~Gün ${linearEstimate.predictedDayAt7}’te 7/10 bandı`
                : ""}
            </Text>
          </View>
        ) : null}

        <View style={styles.sdtCard}>
          <Text style={styles.sdtTitle}>Motivasyon nabzı (SDT)</Text>
          <Text style={styles.sdtSub}>
            Özerklik, yetkinlik, bağlanma — haftalık mini ölçüm
          </Text>

          {latest ? (
            <View style={styles.sdtBars}>
              {SDT_QUESTIONS.map((q) => (
                <SDTBar
                  key={q.id}
                  label={q.label}
                  value={latest[q.id as keyof typeof latest] as number}
                  max={5}
                />
              ))}
            </View>
          ) : (
            <TouchableOpacity style={styles.surveyBtn} onPress={() => setShowSurvey(true)}>
              <Text style={styles.surveyBtnText}>İlk anketi doldur</Text>
              <ChevronRight size={18} color={Colors.primary} strokeWidth={2} />
            </TouchableOpacity>
          )}

          {latest && needsSurvey() ? (
            <TouchableOpacity onPress={() => setShowSurvey(true)}>
              <Text style={styles.updateText}>Bu haftayı güncelle</Text>
            </TouchableOpacity>
          ) : null}
        </View>
        </Animated.View>

        <Animated.View
          style={{
            opacity: entranceOpacity[6],
            transform: [{ translateY: entranceY[6] }],
          }}
        >
          <View style={styles.shareBlock}>
            <TouchableOpacity
              style={styles.shareRow}
              onPress={async () => {
                const pct = avgAuto != null ? Math.round((avgAuto / 10) * 100) : null;
                const msg = [
                  `Gün ${dayNumber}/66.`,
                  pct != null ? `Otomatiklik ~%${pct}.` : null,
                  `Tamamlama %${Math.round(rate * 100)}.`,
                  "#KimlikApp",
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
              <Text style={styles.shareText}>İlerlemeyi paylaş</Text>
            </TouchableOpacity>
            <View style={styles.shareUnderline} />
          </View>
        </Animated.View>

        <View style={{ height: 100 }} />
      </ScrollView>

      <Modal
        visible={showSurvey}
        transparent
        animationType="slide"
        onRequestClose={() => setShowSurvey(false)}
      >
        <KeyboardAvoidingView
          style={styles.surveyOverlay}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <Pressable
            style={styles.surveyBackdrop}
            onPress={() => setShowSurvey(false)}
            accessibilityRole="button"
            accessibilityLabel="Kapat"
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
                  <Text style={styles.surveyTitle}>Haftalık anket</Text>
                  <Text style={styles.surveyMeta}>3 soru · yaklaşık 1 dk</Text>
                </View>
              </View>
              <TouchableOpacity
                style={styles.surveyClose}
                onPress={() => setShowSurvey(false)}
                hitSlop={12}
                accessibilityLabel="Kapat"
              >
                <X size={22} color={Colors.textTertiary} strokeWidth={2} />
              </TouchableOpacity>
            </View>
            <Text style={styles.surveySub}>
              Bu haftaki hislerine göre 1 (hiç) ile 5 (çok) arasında bir değer seç.
            </Text>

            <ScrollView
              style={[styles.surveyScroll, { maxHeight: Math.min(420, windowHeight * 0.5) }]}
              contentContainerStyle={styles.surveyScrollContent}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              {SDT_QUESTIONS.map((q, index) => {
                const key = q.id as "autonomy" | "competence" | "relatedness";
                return (
                  <View key={q.id} style={styles.questionCard}>
                    <View style={styles.questionBadge}>
                      <Text style={styles.questionBadgeText}>Soru {index + 1}</Text>
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
                            accessibilityLabel={`${v} seç`}
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
                <Text style={styles.submitText}>Kaydet ve kapat</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setShowSurvey(false)}
                hitSlop={{ top: 8, bottom: 8 }}
              >
                <Text style={styles.cancelText}>Şimdi değil</Text>
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
      <PremiumGateModal visible={showGate} onClose={() => setShowGate(false)} trigger="journey" />
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
  scroll: { paddingHorizontal: Spacing.lg, flexGrow: 1, paddingBottom: Spacing.md, paddingTop: Spacing.sm },
  lockedContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: Spacing.xl,
    gap: Spacing.lg,
  },
  lockIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },
  lockedTitle: {
    fontSize: FontSizes.xxl,
    fontFamily: "Inter_500Medium",
    color: Colors.textPrimary,
    textAlign: "center",
  },
  lockedSub: {
    fontSize: FontSizes.md,
    fontFamily: "Inter_400Regular",
    color: Colors.textSecondary,
    textAlign: "center",
    lineHeight: 22,
  },
  unlockBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: Colors.primary,
    borderRadius: Radii.button,
    paddingVertical: 14,
    paddingHorizontal: Spacing.xl,
  },
  unlockBtnText: {
    fontSize: FontSizes.md,
    fontFamily: "Inter_500Medium",
    color: "#fff",
  },
  hero: {
    paddingTop: Spacing.md,
    marginBottom: 0,
    paddingBottom: Spacing.xs,
  },
  stickyHero: {
    backgroundColor: JOURNEY_PAGE_BG,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.borderStrong,
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
    fontSize: 26,
    fontFamily: "Inter_800ExtraBold",
    fontWeight: "800",
    color: "#0F172A",
  },
  subtitle: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: "#64748B",
    marginTop: 2,
    maxWidth: 240,
    lineHeight: 20,
  },
  dayPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ECFDF5",
    paddingHorizontal: 12,
    paddingVertical: 6,
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
    height: 4,
    borderRadius: 2,
    backgroundColor: "#E2E8F0",
    overflow: "hidden",
    marginTop: 12,
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
    fontSize: FontSizes.xs,
    fontFamily: "Inter_400Regular",
    color: Colors.textTertiary,
    marginTop: Spacing.sm,
  },
  sectionLabelRow: {
    marginTop: 24,
    marginBottom: 12,
  },
  sectionLabel: {
    fontSize: 11,
    fontFamily: "Inter_700Bold",
    fontWeight: "700",
    letterSpacing: 1.5,
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
    gap: 10,
    marginBottom: 10,
  },
  cardStackGap: {
    marginBottom: 10,
  },
  journeyMapBlock: {
    marginTop: 24,
  },
  sectionHint: {
    fontSize: FontSizes.xs,
    fontFamily: "Inter_400Regular",
    color: Colors.textTertiary,
  },
  treeAreaWrap: {
    marginBottom: 16,
    alignItems: "stretch",
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
  phaseHScroll: {
    paddingVertical: 8,
    paddingRight: Spacing.lg,
    marginBottom: 10,
  },
  phaseCardOpen: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    gap: Spacing.sm,
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
    borderRadius: 16,
    borderWidth: 0,
    padding: 16,
    minHeight: 260,
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
    fontSize: FontSizes.xl,
    fontFamily: "Inter_500Medium",
    color: Colors.textPrimary,
  },
  phaseCardRange: {
    fontSize: FontSizes.xs,
    fontFamily: "Inter_400Regular",
    color: Colors.textTertiary,
  },
  phaseCardSub: {
    fontSize: FontSizes.sm,
    fontFamily: "Inter_400Regular",
    color: Colors.textSecondary,
    lineHeight: 20,
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
    borderRadius: 16,
    padding: 16,
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
    borderRadius: 16,
    borderWidth: 0,
    padding: 16,
    gap: Spacing.md,
    marginBottom: Spacing.md,
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
