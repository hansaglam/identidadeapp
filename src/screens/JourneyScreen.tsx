import React, { useState, useEffect, useMemo, useCallback } from "react";
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
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import { useFocusEffect } from "@react-navigation/native";
import {
  Lock,
  Target,
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
import DayGrid from "../components/DayGrid";
import PremiumGateModal from "../components/PremiumGateModal";
import JourneyPhaseEducationModal from "../components/JourneyPhaseEducationModal";
import JourneyMindSentenceModal from "../components/JourneyMindSentenceModal";
import {
  Colors,
  Spacing,
  Radii,
  FontSizes,
  JOURNEY_PHASES,
  SDT_QUESTIONS,
  getCoachNote,
} from "../constants/theme";
import { getDailyPrinciple } from "../constants/identity-copy";
import { getJourneyEducationCards, phaseIdFromDay } from "../constants/journeyPhaseEducation";
import { getJourneyMomentLine } from "../constants/journeyMoments";
import { estimateAutomationFromFirst14Linear, getAverageAutomaticity } from "../utils/profileMetrics";
import type { JourneyEducationPrefsState } from "../utils/journeyEducationPrefs";
import { loadJourneyEducationPrefs } from "../utils/journeyEducationPrefs";
import { MainTabParamList } from "../types";



type Props = BottomTabScreenProps<MainTabParamList, "Journey">;

export default function JourneyScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { height: windowHeight } = useWindowDimensions();
  const profile = useUserStore((s) => s.profile);
  const dayNumber = useUserStore((s) => s.dayNumber());
  const markPremiumGateShown = useUserStore((s) => s.markPremiumGateShown);
  const updateProfile = useUserStore((s) => s.updateProfile);

  const { last66Days } = useCheckinsStore();
  const { scores, load: loadSDT, saveScore, needsSurvey, latestScore } = useSDTStore();

  const checkins = useCheckinsStore((s) => s.checkins);
  const { completionRate } = useCheckinsStore();
  const createMindEntry = useMindDumpStore((s) => s.createEntry);

  const isPremium = profile?.isPremium ?? false;
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

  useFocusEffect(
    useCallback(() => {
      if (!profile?.id || profile.hasOpenedJourneyTab) return;
      void updateProfile({ hasOpenedJourneyTab: true });
    }, [profile?.id, profile?.hasOpenedJourneyTab, updateProfile])
  );

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
  const latest = latestScore();
  const journeyProgress = Math.min(1, Math.max(0, dayNumber / 66));
  const coachNoteText = coachNote;

  if (!isPremium) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: Colors.bg }]} edges={["top"]}>
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
    <SafeAreaView style={[styles.container, { backgroundColor: Colors.bg }]} edges={["top"]}>
      <ScrollView
        contentContainerStyle={[styles.scroll, { backgroundColor: Colors.bg }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Üst: başlık + genel ilerleme */}
        <View style={styles.hero}>
          <View style={styles.heroTop}>
            <View>
              <Text style={styles.title}>Yolculuğun</Text>
              <Text style={styles.subtitle}>
                66 günlük kimlik inşası · Gün {dayNumber}
              </Text>
            </View>
            <View style={styles.dayPill}>
              <Map size={16} color={Colors.primaryDark} strokeWidth={2} />
              <Text style={styles.dayPillText}>{dayNumber}/66</Text>
            </View>
          </View>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${journeyProgress * 100}%` }]} />
          </View>
          <Text style={styles.progressHint}>
            Tamamlama bu dönemde %{Math.round(rate * 100)}
            {avgAuto != null ? ` · Ort. otomatiklik ${avgAuto.toFixed(1)}/10` : ""}
          </Text>
        </View>

        {/* Bugünün paketi — tek kart */}
        <View style={styles.sectionLabelRow}>
          <Text style={styles.sectionLabel}>Bugünün paketi</Text>
        </View>
        <View style={styles.todayPack}>
          {coachNoteText ? (
            <View style={styles.coachBanner}>
              <Text style={styles.coachBannerLabel}>Kilometre taşı</Text>
              <Text style={styles.coachBannerText}>{coachNoteText}</Text>
            </View>
          ) : momentLine ? (
            <View style={styles.momentBanner}>
              <Text style={styles.momentBannerLabel}>Bugünün bağlamı</Text>
              <Text style={styles.momentBannerText}>{momentLine}</Text>
            </View>
          ) : null}

          {dailyPrinciple ? (
            <View style={styles.packBlock}>
              <View style={styles.packRow}>
                <Target
                  size={18}
                  color={JOURNEY_PHASES[dailyPrinciple.phaseId - 1].color}
                  strokeWidth={1.8}
                />
                <Text style={styles.packKicker}>Odak cümlesi</Text>
              </View>
              <Text style={styles.packPrinciple}>{dailyPrinciple.principle}</Text>
            </View>
          ) : null}

          <TouchableOpacity
            style={styles.trainRow}
            onPress={() => setShowPhaseEdu(true)}
            activeOpacity={0.85}
          >
            <View style={[styles.trainIcon, { backgroundColor: Colors.purpleLight }]}>
              <BookOpen size={20} color={Colors.purple} strokeWidth={2} />
            </View>
            <View style={styles.trainMid}>
              <Text style={styles.trainTitle}>Bu fazda beyin nasıl çalışıyor?</Text>
              <Text style={styles.trainSub}>
                {eduPhaseCompleted
                  ? "Bu faz özetini daha önce tamamladın — yenilemek istersen aç."
                  : "4 kısa kart · ~30 sn · bulunduğun faza göre"}
              </Text>
            </View>
            <ChevronRight size={20} color={Colors.textTertiary} strokeWidth={2} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.trainRow}
            onPress={() => setShowMindSentence(true)}
            activeOpacity={0.85}
          >
            <View style={[styles.trainIcon, { backgroundColor: Colors.primaryLight }]}>
              <PenLine size={20} color={Colors.primaryDark} strokeWidth={2} />
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
            <ChevronRight size={20} color={Colors.textTertiary} strokeWidth={2} />
          </TouchableOpacity>
        </View>

        {/* Fazlar: sadece aktif faz geniş */}
        <View style={styles.sectionLabelRow}>
          <Text style={styles.sectionLabel}>66 gün · 3 faz</Text>
          <Text style={styles.sectionHint}>Aktif faz aşağıda detaylı</Text>
        </View>

        {JOURNEY_PHASES.map((phase) => {
          const isActive = dayNumber >= phase.startDay && dayNumber <= phase.endDay;
          const isCompleted = dayNumber > phase.endDay;
          const isLocked = dayNumber < phase.startDay;
          const phaseGrid = grid.slice(phase.startDay - 1, phase.endDay);

          if (isCompleted) {
            return (
              <View key={phase.id} style={styles.phaseStripDone}>
                <CheckCircle2 size={20} color={Colors.primary} strokeWidth={2} />
                <Text style={styles.phaseStripDoneText}>
                  Faz {phase.id} · {phase.label} tamamlandı
                </Text>
              </View>
            );
          }

          if (isLocked) {
            return (
              <View key={phase.id} style={styles.phaseStripLocked}>
                <Lock size={18} color={Colors.textTertiary} strokeWidth={1.8} />
                <View style={styles.phaseStripLockedBody}>
                  <Text style={styles.phaseStripLockedTitle}>
                    Faz {phase.id} · {phase.label}
                  </Text>
                  <Text style={styles.phaseStripLockedSub}>
                    Gün {phase.startDay}’te açılır
                  </Text>
                </View>
              </View>
            );
          }

          return (
            <View
              key={phase.id}
              style={[styles.phaseCardActive, { borderColor: phase.color }]}
            >
              <View style={styles.phaseActiveHead}>
                <View style={[styles.phaseBadge, { backgroundColor: phase.colorLight }]}>
                  <Text style={[styles.phaseBadgeText, { color: phase.color }]}>
                    Şu an · Faz {phase.id}
                  </Text>
                </View>
                <Text style={styles.phaseActiveRange}>{phase.days}</Text>
              </View>
              <Text style={styles.phaseName}>{phase.label}</Text>
              <Text style={styles.phaseSub}>{phase.subtitle}</Text>
              {phaseGrid.length > 0 ? (
                <View style={styles.phaseGridWrap}>
                  <Text style={styles.gridCaption}>Bu fazdaki günler</Text>
                  <DayGrid days={phaseGrid} color={phase.color} />
                </View>
              ) : null}
            </View>
          );
        })}

        {/* Bilim & ölçüm */}
        <View style={styles.sectionLabelRow}>
          <Text style={styles.sectionLabel}>Bilim & ölçüm</Text>
        </View>

        {dayNumber >= 14 && linearEstimate ? (
          <View style={styles.regressionCard}>
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
          <Share2 size={18} color={Colors.primary} strokeWidth={1.8} />
          <Text style={styles.shareText}>İlerlemeyi paylaş</Text>
        </TouchableOpacity>

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
  container: { flex: 1, backgroundColor: Colors.bg },
  scroll: { paddingHorizontal: Spacing.lg, flexGrow: 1, paddingBottom: Spacing.md },
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
    marginBottom: Spacing.lg,
  },
  heroTop: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: Spacing.md,
  },
  title: {
    fontSize: FontSizes.xxl,
    fontFamily: "Inter_500Medium",
    color: Colors.textPrimary,
  },
  subtitle: {
    fontSize: FontSizes.sm,
    fontFamily: "Inter_400Regular",
    color: Colors.textSecondary,
    marginTop: 4,
    maxWidth: 240,
    lineHeight: 20,
  },
  dayPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: Spacing.md,
    paddingVertical: 8,
    borderRadius: Radii.pill,
    borderWidth: 1,
    borderColor: "rgba(29,158,117,0.25)",
  },
  dayPillText: {
    fontSize: FontSizes.sm,
    fontFamily: "Inter_500Medium",
    color: Colors.primaryDark,
  },
  progressTrack: {
    height: 6,
    backgroundColor: Colors.border,
    borderRadius: Radii.full,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: Colors.primary,
    borderRadius: Radii.full,
  },
  progressHint: {
    fontSize: FontSizes.xs,
    fontFamily: "Inter_400Regular",
    color: Colors.textTertiary,
    marginTop: Spacing.sm,
  },
  sectionLabelRow: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "space-between",
    marginBottom: Spacing.sm,
    marginTop: Spacing.xs,
  },
  sectionLabel: {
    fontSize: FontSizes.xs,
    fontFamily: "Inter_500Medium",
    color: Colors.textTertiary,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  sectionHint: {
    fontSize: FontSizes.xs,
    fontFamily: "Inter_400Regular",
    color: Colors.textTertiary,
  },
  todayPack: {
    backgroundColor: Colors.surface,
    borderRadius: Radii.card + 2,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.md,
    marginBottom: Spacing.xl,
    gap: Spacing.md,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
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
    gap: Spacing.md,
    backgroundColor: Colors.bg,
    borderRadius: Radii.card,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  trainIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.coralLight,
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
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
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
    backgroundColor: Colors.primaryLight,
    borderRadius: Radii.card,
    borderWidth: 1,
    borderColor: "rgba(29, 158, 117, 0.2)",
    padding: Spacing.md,
    gap: Spacing.xs,
    marginBottom: Spacing.md,
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
    backgroundColor: Colors.surface,
    borderRadius: Radii.card,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.lg,
    gap: Spacing.md,
    marginBottom: Spacing.md,
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
  shareRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
    marginBottom: Spacing.lg,
  },
  shareText: {
    fontSize: FontSizes.sm,
    fontFamily: "Inter_500Medium",
    color: Colors.primary,
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
