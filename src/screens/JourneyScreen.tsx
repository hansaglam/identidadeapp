import React, { useState, useEffect, useMemo } from "react";
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, Share, Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import { Lock, Flame, Target, TrendingUp, ExternalLink } from "lucide-react-native";
import { useUserStore } from "../store/userStore";
import { useCheckinsStore, StreakState } from "../store/checkinsStore";
import { useSDTStore } from "../store/sdtStore";
import DayGrid from "../components/DayGrid";
import PremiumGateModal from "../components/PremiumGateModal";
import FiveSecondRuleModal from "../components/FiveSecondRuleModal";
import {
  Colors, Spacing, Radii, FontSizes,
  JOURNEY_PHASES, SDT_QUESTIONS, getCoachNote,
} from "../constants/theme";
import { getDailyPrinciple, getFiveSecondAction } from "../constants/identity-copy";
import { estimateAutomationFromFirst14Linear, getAverageAutomaticity } from "../utils/profileMetrics";
import { MainTabParamList } from "../types";

type Props = BottomTabScreenProps<MainTabParamList, "Journey">;

export default function JourneyScreen(_: Props) {
  const profile = useUserStore((s) => s.profile);
  const dayNumber = useUserStore((s) => s.dayNumber());
  const markPremiumGateShown = useUserStore((s) => s.markPremiumGateShown);

  const { last66Days } = useCheckinsStore();
  const { scores, load: loadSDT, saveScore, needsSurvey, latestScore } = useSDTStore();

  const checkins = useCheckinsStore((s) => s.checkins);
  const { completionRate } = useCheckinsStore();

  const isPremium = profile?.isPremium ?? false;
  const [showGate, setShowGate] = useState(false);
  const [showSurvey, setShowSurvey] = useState(false);
  const [showFiveSecond, setShowFiveSecond] = useState(false);
  const [answers, setAnswers] = useState({ autonomy: 3, competence: 3, relatedness: 3 });

  const linearEstimate = useMemo(() => {
    if (!profile || dayNumber < 14) return null;
    return estimateAutomationFromFirst14Linear(profile.startDate, checkins);
  }, [profile, checkins, dayNumber]);

  const avgAuto = useMemo(() => getAverageAutomaticity(checkins), [checkins]);
  const rate = profile ? completionRate(profile.startDate) : 0;

  const dailyPrinciple = getDailyPrinciple(dayNumber);
  const fiveSecondAction = getFiveSecondAction(dayNumber);

  useEffect(() => { loadSDT(); }, []);

  // Premium gate on first Journey visit after day 7
  useEffect(() => {
    if (!profile || isPremium) return;
    if (dayNumber >= 7 && !profile.premiumGateDay7Shown) {
      markPremiumGateShown("day7");
      setShowGate(true);
    }
  }, [dayNumber]);

  // SDT survey prompt
  useEffect(() => {
    if (isPremium && needsSurvey() && dayNumber > 7) {
      setShowSurvey(true);
    }
  }, [isPremium, scores.length]);

  const grid = profile ? last66Days(profile.startDate) : [];
  const latest = latestScore();

  if (!isPremium) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <View style={styles.lockedContainer}>
          <View style={styles.lockIcon}>
            <Lock size={32} color={Colors.primary} strokeWidth={1.5} />
          </View>
          <Text style={styles.lockedTitle}>66 Gün Haritası</Text>
          <Text style={styles.lockedSub}>
            Yolculuğunu izlemek, fazları görmek ve SDT motivasyon skorunu
            takip etmek için premium paket gerekiyor.
          </Text>
          <TouchableOpacity
            style={styles.unlockBtn}
            onPress={() => setShowGate(true)}
            activeOpacity={0.8}
          >
            <Text style={styles.unlockBtnText}>Kilidi Aç →</Text>
          </TouchableOpacity>
        </View>
        <PremiumGateModal visible={showGate} onClose={() => setShowGate(false)} trigger="journey" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Yolculuğun</Text>
          <Text style={styles.subtitle}>Gün {dayNumber}</Text>
        </View>

        {/* Coach note (milestone days) */}
        {getCoachNote(dayNumber) && (
          <View style={styles.coachCard}>
            <Text style={styles.coachLabel}>Bugünkü not</Text>
            <Text style={styles.coachNote}>{getCoachNote(dayNumber)}</Text>
          </View>
        )}

        {/* Daily discipline principle */}
        {dailyPrinciple && (
          <View style={[
            styles.principleCard,
            { borderLeftColor: JOURNEY_PHASES[dailyPrinciple.phaseId - 1].color },
          ]}>
            <View style={styles.principleHeader}>
              <Target size={16} color={JOURNEY_PHASES[dailyPrinciple.phaseId - 1].color} strokeWidth={1.5} />
              <Text style={styles.principleLabel}>Bugünün odak cümlesi</Text>
            </View>
            <Text style={styles.principleText}>{dailyPrinciple.principle}</Text>
          </View>
        )}

        {/* 5 Second Rule trigger */}
        <TouchableOpacity
          style={styles.fiveSecondCard}
          onPress={() => setShowFiveSecond(true)}
          activeOpacity={0.8}
        >
          <View style={styles.fiveSecondLeft}>
            <View style={styles.fiveSecondIcon}>
              <Flame size={18} color={Colors.coral} strokeWidth={1.5} />
            </View>
            <View style={styles.fiveSecondContent}>
              <Text style={styles.fiveSecondTitle}>Bugün yapmak istemiyorum</Text>
              <Text style={styles.fiveSecondSub}>5 Saniye Kuralı ile disiplin antrenmanı</Text>
            </View>
          </View>
          <Text style={styles.fiveSecondArrow}>→</Text>
        </TouchableOpacity>

        {/* 3 phases */}
        {JOURNEY_PHASES.map((phase) => {
          const isActive = dayNumber >= phase.startDay && dayNumber <= phase.endDay;
          const isCompleted = dayNumber > phase.endDay;
          const isLocked = dayNumber < phase.startDay;
          const phaseGrid = grid.slice(phase.startDay - 1, phase.endDay);

          return (
            <View
              key={phase.id}
              style={[
                styles.phaseCard,
                isActive && { borderColor: phase.color },
                isCompleted && styles.phaseCompleted,
              ]}
            >
              <View style={styles.phaseHeader}>
                <View style={[styles.phaseBadge, { backgroundColor: phase.colorLight }]}>
                  <Text style={[styles.phaseBadgeText, { color: phase.color }]}>
                    Faz {phase.id}
                  </Text>
                </View>
                {isCompleted && (
                  <View style={styles.completedBadge}>
                    <Text style={styles.completedText}>✓ Tamamlandı</Text>
                  </View>
                )}
                {isActive && (
                  <View style={[styles.activeBadge, { backgroundColor: phase.colorLight }]}>
                    <Text style={[styles.activeText, { color: phase.color }]}>Aktif</Text>
                  </View>
                )}
                {isLocked && (
                  <Lock size={14} color={Colors.textTertiary} strokeWidth={1.5} />
                )}
              </View>

              <Text style={styles.phaseName}>{phase.label}</Text>
              <Text style={styles.phaseDays}>{phase.days}</Text>
              <Text style={styles.phaseSub}>{phase.subtitle}</Text>

              {isLocked && (
                <Text style={styles.phaseLockedNote}>
                  Faz {phase.id - 1}'i tamamla
                </Text>
              )}

              {!isLocked && phaseGrid.length > 0 && (
                <View style={styles.phaseGrid}>
                  <DayGrid days={phaseGrid} color={phase.color} />
                </View>
              )}
            </View>
          );
        })}

        {/* Regression estimate */}
        {dayNumber >= 14 && linearEstimate && (
          <View style={styles.regressionCard}>
            <View style={styles.regressionRow}>
              <TrendingUp size={18} color={Colors.primary} strokeWidth={1.5} />
              <Text style={styles.regressionTitle}>Otomatikleşme Tahmini</Text>
            </View>
            <Text style={styles.regressionBody}>
              Eğim: +{linearEstimate.slopePerDay.toFixed(1)}/gün
              {linearEstimate.predictedDayAt7
                ? ` · Tahmini: Gün ${linearEstimate.predictedDayAt7}`
                : " · Yeterli eğim yok"}
            </Text>
          </View>
        )}

        {/* Share card */}
        <TouchableOpacity
          style={styles.shareCard}
          onPress={async () => {
            const pct = avgAuto != null ? Math.round((avgAuto / 10) * 100) : null;
            const msg = [
              `Gün ${dayNumber}'deyim.`,
              pct != null ? `Otomatiklik: %${pct}.` : null,
              `Tamamlama: %${Math.round(rate * 100)}.`,
              "Motivasyon değil, disiplin.",
              "#KimlikApp",
            ].filter(Boolean).join(" ");
            try {
              await Share.share({ message: msg });
            } catch {}
          }}
          activeOpacity={0.8}
        >
          <ExternalLink size={16} color={Colors.primary} strokeWidth={1.5} />
          <Text style={styles.shareText}>Disiplin raporunu paylaş</Text>
        </TouchableOpacity>

        {/* SDT card */}
        <View style={styles.sdtCard}>
          <View style={styles.sdtHeader}>
            <Text style={styles.sdtTitle}>SDT Motivasyon Skoru</Text>
          </View>

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
            <TouchableOpacity
              style={styles.surveyBtn}
              onPress={() => setShowSurvey(true)}
            >
              <Text style={styles.surveyBtnText}>Bu haftanın anketini doldur →</Text>
            </TouchableOpacity>
          )}

          {latest && needsSurvey() && (
            <TouchableOpacity onPress={() => setShowSurvey(true)}>
              <Text style={styles.updateText}>Bu haftayı güncelle</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* SDT Survey modal */}
      <Modal visible={showSurvey} transparent animationType="slide">
        <View style={styles.surveyOverlay}>
          <View style={styles.surveySheet}>
            <Text style={styles.surveyTitle}>Haftalık Anket</Text>
            <Text style={styles.surveySub}>
              Her soruyu 1 (hiç) – 5 (çok) arasında değerlendir.
            </Text>

            {SDT_QUESTIONS.map((q) => {
              const key = q.id as "autonomy" | "competence" | "relatedness";
              return (
                <View key={q.id} style={styles.question}>
                  <Text style={styles.questionText}>{q.question}</Text>
                  <View style={styles.scale}>
                    {[1, 2, 3, 4, 5].map((v) => {
                      const selected = answers[key] === v;
                      return (
                        <TouchableOpacity
                          key={v}
                          style={[styles.scaleBtn, selected && styles.scaleBtnActive]}
                          onPress={() => setAnswers((prev) => ({ ...prev, [key]: v }))}
                        >
                          <Text style={[styles.scaleNum, selected && styles.scaleNumActive]}>
                            {v}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                  <View style={styles.scaleHints}>
                    <Text style={styles.scaleHint}>{q.low}</Text>
                    <Text style={styles.scaleHint}>{q.high}</Text>
                  </View>
                </View>
              );
            })}

            <TouchableOpacity
              style={styles.submitBtn}
              onPress={async () => {
                await saveScore(answers);
                setShowSurvey(false);
              }}
            >
              <Text style={styles.submitText}>Kaydet</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setShowSurvey(false)}>
              <Text style={styles.cancelText}>Şimdi değil</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <FiveSecondRuleModal
        visible={showFiveSecond}
        onClose={() => setShowFiveSecond(false)}
        actionText={fiveSecondAction}
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
      <Text style={sdtS.val}>{value}/{max}</Text>
    </View>
  );
}

const sdtS = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: Spacing.sm },
  label: {
    width: 70,
    fontSize: FontSizes.sm,
    fontFamily: "Inter_400Regular",
    color: Colors.textSecondary,
  },
  track: {
    flex: 1, height: 6,
    backgroundColor: Colors.border,
    borderRadius: Radii.full,
    overflow: "hidden",
  },
  fill: {
    height: "100%", backgroundColor: Colors.primary, borderRadius: Radii.full,
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
  scroll: { paddingHorizontal: Spacing.lg, flexGrow: 1 },
  lockedContainer: {
    flex: 1, alignItems: "center", justifyContent: "center",
    paddingHorizontal: Spacing.xl, gap: Spacing.lg,
  },
  lockIcon: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: Colors.primaryLight,
    alignItems: "center", justifyContent: "center",
  },
  lockedTitle: {
    fontSize: FontSizes.xxl, fontFamily: "Inter_500Medium",
    color: Colors.textPrimary, textAlign: "center",
  },
  lockedSub: {
    fontSize: FontSizes.md, fontFamily: "Inter_400Regular",
    color: Colors.textSecondary, textAlign: "center", lineHeight: 22,
  },
  unlockBtn: {
    backgroundColor: Colors.primary, borderRadius: Radii.button,
    paddingVertical: 14, paddingHorizontal: Spacing.xl,
  },
  unlockBtnText: {
    fontSize: FontSizes.md, fontFamily: "Inter_500Medium", color: "#fff",
  },
  header: { paddingTop: Spacing.md, marginBottom: Spacing.lg },
  title: {
    fontSize: FontSizes.xxl, fontFamily: "Inter_500Medium", color: Colors.textPrimary,
  },
  subtitle: {
    fontSize: FontSizes.sm, fontFamily: "Inter_400Regular",
    color: Colors.textSecondary, marginTop: 4,
  },
  coachCard: {
    backgroundColor: Colors.surface, borderRadius: Radii.card,
    borderWidth: 1, borderColor: Colors.border,
    borderLeftWidth: 3, borderLeftColor: Colors.primary,
    padding: Spacing.md, gap: Spacing.xs, marginBottom: Spacing.md,
  },
  coachLabel: {
    fontSize: FontSizes.xs, fontFamily: "Inter_500Medium",
    color: Colors.textTertiary, textTransform: "uppercase", letterSpacing: 0.7,
  },
  coachNote: {
    fontSize: FontSizes.md, fontFamily: "Inter_400Regular",
    color: Colors.textPrimary, lineHeight: 22,
  },
  principleCard: {
    backgroundColor: Colors.surface, borderRadius: Radii.card,
    borderWidth: 1, borderColor: Colors.border,
    borderLeftWidth: 3,
    padding: Spacing.md, gap: Spacing.sm, marginBottom: Spacing.md,
  },
  principleHeader: { flexDirection: "row", alignItems: "center", gap: Spacing.xs },
  principleLabel: {
    fontSize: FontSizes.xs, fontFamily: "Inter_500Medium",
    color: Colors.textTertiary, textTransform: "uppercase", letterSpacing: 0.7,
  },
  principleText: {
    fontSize: FontSizes.lg, fontFamily: "Inter_400Regular",
    color: Colors.textPrimary, lineHeight: 24, fontStyle: "italic",
  },
  fiveSecondCard: {
    backgroundColor: Colors.surface, borderRadius: Radii.card,
    borderWidth: 1, borderColor: Colors.border,
    padding: Spacing.md, marginBottom: Spacing.lg,
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
  },
  fiveSecondLeft: { flexDirection: "row", alignItems: "center", gap: Spacing.sm, flex: 1 },
  fiveSecondIcon: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: Colors.coralLight, alignItems: "center", justifyContent: "center",
  },
  fiveSecondContent: { flex: 1, gap: 2 },
  fiveSecondTitle: {
    fontSize: FontSizes.md, fontFamily: "Inter_500Medium", color: Colors.textPrimary,
  },
  fiveSecondSub: {
    fontSize: FontSizes.xs, fontFamily: "Inter_400Regular", color: Colors.textTertiary,
  },
  fiveSecondArrow: {
    fontSize: FontSizes.lg, color: Colors.coral, fontFamily: "Inter_500Medium",
  },
  phaseCard: {
    backgroundColor: Colors.surface, borderRadius: Radii.card,
    borderWidth: 1, borderColor: Colors.border,
    padding: Spacing.md, marginBottom: Spacing.md, gap: Spacing.sm,
  },
  phaseCompleted: { backgroundColor: Colors.bg },
  phaseHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  phaseBadge: { borderRadius: Radii.pill, paddingHorizontal: Spacing.sm, paddingVertical: 3 },
  phaseBadgeText: { fontSize: FontSizes.xs, fontFamily: "Inter_500Medium" },
  completedBadge: {
    backgroundColor: Colors.primaryLight, borderRadius: Radii.pill,
    paddingHorizontal: Spacing.sm, paddingVertical: 3,
  },
  completedText: { fontSize: FontSizes.xs, fontFamily: "Inter_500Medium", color: Colors.primary },
  activeBadge: { borderRadius: Radii.pill, paddingHorizontal: Spacing.sm, paddingVertical: 3 },
  activeText: { fontSize: FontSizes.xs, fontFamily: "Inter_500Medium" },
  phaseName: { fontSize: FontSizes.xl, fontFamily: "Inter_500Medium", color: Colors.textPrimary },
  phaseDays: { fontSize: FontSizes.sm, fontFamily: "Inter_400Regular", color: Colors.textTertiary },
  phaseSub: {
    fontSize: FontSizes.md, fontFamily: "Inter_400Regular",
    color: Colors.textSecondary, lineHeight: 20,
  },
  phaseLockedNote: {
    fontSize: FontSizes.sm, fontFamily: "Inter_400Regular",
    color: Colors.textTertiary, fontStyle: "italic",
  },
  phaseGrid: { marginTop: Spacing.xs },
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
    fontSize: FontSizes.md, fontFamily: "Inter_500Medium", color: Colors.primary,
  },
  regressionBody: {
    fontSize: FontSizes.sm, fontFamily: "Inter_400Regular",
    color: Colors.textPrimary, lineHeight: 20,
  },
  shareCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    backgroundColor: Colors.surface,
    borderRadius: Radii.card,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  shareText: {
    fontSize: FontSizes.md, fontFamily: "Inter_400Regular", color: Colors.primary,
  },
  sdtCard: {
    backgroundColor: Colors.surface, borderRadius: Radii.card,
    borderWidth: 1, borderColor: Colors.border,
    padding: Spacing.md, gap: Spacing.md,
  },
  sdtHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  sdtTitle: { fontSize: FontSizes.md, fontFamily: "Inter_500Medium", color: Colors.textPrimary },
  sdtBars: { gap: Spacing.sm },
  surveyBtn: {
    backgroundColor: Colors.primaryLight, borderRadius: Radii.button,
    padding: Spacing.md, alignItems: "center",
  },
  surveyBtnText: { fontSize: FontSizes.md, fontFamily: "Inter_500Medium", color: Colors.primary },
  updateText: {
    fontSize: FontSizes.sm, fontFamily: "Inter_400Regular",
    color: Colors.textTertiary, textAlign: "center",
  },
  // Survey modal
  surveyOverlay: { flex: 1, backgroundColor: Colors.overlay, justifyContent: "flex-end" },
  surveySheet: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: Spacing.xl, gap: Spacing.lg,
  },
  surveyTitle: { fontSize: FontSizes.xl, fontFamily: "Inter_500Medium", color: Colors.textPrimary },
  surveySub: {
    fontSize: FontSizes.sm, fontFamily: "Inter_400Regular", color: Colors.textSecondary,
  },
  question: { gap: Spacing.sm },
  questionText: {
    fontSize: FontSizes.md, fontFamily: "Inter_400Regular",
    color: Colors.textPrimary, lineHeight: 22,
  },
  scale: { flexDirection: "row", gap: Spacing.sm },
  scaleBtn: {
    flex: 1, paddingVertical: 10, borderRadius: Radii.button,
    borderWidth: 1, borderColor: Colors.border,
    alignItems: "center", backgroundColor: Colors.bg,
  },
  scaleBtnActive: { borderColor: Colors.primary, backgroundColor: Colors.primaryLight },
  scaleNum: { fontSize: FontSizes.md, fontFamily: "Inter_400Regular", color: Colors.textSecondary },
  scaleNumActive: { color: Colors.primary, fontFamily: "Inter_500Medium" },
  scaleHints: { flexDirection: "row", justifyContent: "space-between" },
  scaleHint: {
    fontSize: FontSizes.xs, fontFamily: "Inter_400Regular", color: Colors.textTertiary,
  },
  submitBtn: {
    backgroundColor: Colors.primary, borderRadius: Radii.button,
    paddingVertical: 14, alignItems: "center",
  },
  submitText: { fontSize: FontSizes.md, fontFamily: "Inter_500Medium", color: "#fff" },
  cancelText: {
    fontSize: FontSizes.sm, fontFamily: "Inter_400Regular",
    color: Colors.textTertiary, textAlign: "center",
  },
});
