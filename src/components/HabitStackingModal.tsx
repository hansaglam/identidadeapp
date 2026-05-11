import React, { useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  TouchableOpacity,
  Share,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Sparkles, Share2, Layers } from "lucide-react-native";
import type { CheckinRecord } from "../types";
import type { DisciplineMuscles } from "../types/discipline";
import { Colors, Spacing, Radii, FontSizes, Shadows } from "../constants/theme";
import { buildAutomaticitySeriesLastDays } from "../utils/automaticityChart";
import AutomaticityTrendChart from "./AutomaticityTrendChart";
import { suggestStackedHabits } from "../utils/habitStackingEngine";
import { DISCIPLINE_DEFAULT_LEVELS } from "../utils/disciplineProgress";
import {
  getStackingModalCopyVariant,
  getStackingModalStrings,
  type StackingMindEvolution,
} from "../utils/stackingModalRules";
import { trackEvent } from "../utils/analytics";

export type MindEvolution = StackingMindEvolution;

export interface HabitStackingModalProps {
  visible: boolean;
  dayNumber: number;
  completedHabitName: string;
  journeyStartDate: string;
  checkins: Record<string, CheckinRecord>;
  profileMuscles?: DisciplineMuscles;
  mindEvolution: MindEvolution;
  onLater: () => void;
  onSameHabit: () => void;
  onPickSuggestion: (habitTitle: string, habitAnchor: string, suggestionIndex: number) => void;
}

export default function HabitStackingModal({
  visible,
  dayNumber,
  completedHabitName,
  journeyStartDate,
  checkins,
  profileMuscles,
  mindEvolution,
  onLater,
  onSameHabit,
  onPickSuggestion,
}: HabitStackingModalProps) {
  const { width: winW } = useWindowDimensions();
  const copyVariant = useMemo(() => getStackingModalCopyVariant(dayNumber), [dayNumber]);
  const copy = useMemo(
    () => getStackingModalStrings(completedHabitName, copyVariant, mindEvolution),
    [completedHabitName, copyVariant, mindEvolution]
  );

  const muscles = useMemo(
    () => ({ ...DISCIPLINE_DEFAULT_LEVELS, ...profileMuscles }),
    [profileMuscles]
  );
  const pack = useMemo(
    () => suggestStackedHabits(completedHabitName, muscles),
    [completedHabitName, muscles]
  );
  const series66 = useMemo(
    () => buildAutomaticitySeriesLastDays(journeyStartDate, checkins, 66),
    [journeyStartDate, checkins]
  );

  const onShare = () => {
    void trackEvent("stacking_modal_share", {
      tone: copyVariant,
      dayNumber,
    });
    Share.share({
      message: `66 günlük yolculuğu tamamladım: “${completedHabitName}”. Bu artık kimliğimde bir katman. Şimdi üzerine yenisini ekliyorum. #66GunDisiplin`,
    }).catch(() => {});
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onLater}>
      <SafeAreaView style={styles.root} edges={["top", "bottom"]}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.heroIcon}>
            <Sparkles size={28} color={Colors.primary} strokeWidth={1.8} />
          </View>
          <Text style={styles.title}>{copy.title}</Text>
          <Text style={styles.lead}>{copy.lead}</Text>

          <AutomaticityTrendChart
            series={series66}
            title={copy.chartTitle}
            subtitle={copy.chartSubtitle}
          />

          {copy.evolutionIntro || copy.evolutionClosing ? (
            <View style={styles.evoCard}>
              <Text style={styles.evoTitle}>Bu turda içeriden ne oldu?</Text>
              {copy.evolutionIntro ? (
                <Text style={styles.evoHint}>{copy.evolutionIntro}</Text>
              ) : null}
              {copy.evolutionClosing ? (
                <Text style={styles.evoQuote}>{copy.evolutionClosing}</Text>
              ) : null}
            </View>
          ) : null}

          <View style={styles.stackHeader}>
            <Layers size={20} color={Colors.purple} strokeWidth={1.6} />
            <Text style={styles.stackTitle}>Şimdi? Bu kimliğin üzerine küçük bir katman ekleyelim.</Text>
          </View>
          <Text style={styles.stackSub}>{pack.headlineReason}</Text>

          {pack.suggestions.map((s, idx) => (
            <TouchableOpacity
              key={s.habitTitle + s.habitAnchor.slice(0, 24)}
              style={styles.suggestionCard}
              onPress={() => onPickSuggestion(s.habitTitle, s.habitAnchor, idx)}
              activeOpacity={0.88}
            >
              <Text style={styles.sugTitle}>{s.habitTitle}</Text>
              <Text style={styles.sugAnchor}>{s.habitAnchor}</Text>
              <Text style={styles.sugReason}>{s.reason}</Text>
            </TouchableOpacity>
          ))}

          <TouchableOpacity style={styles.sameBtn} onPress={onSameHabit} activeOpacity={0.88}>
            <Text style={styles.sameBtnText}>Aynı alışkanlık — yeni 66 gün</Text>
            <Text style={styles.sameBtnHint}>
              Aynı kimlik hedefiyle taze tur; günlük işaretler sıfırlanır, kas seviyelerin ve notların korunur.
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.shareRow} onPress={onShare} hitSlop={8}>
            <Share2 size={18} color={Colors.primary} strokeWidth={1.8} />
            <Text style={styles.shareText}>Bu ana özel paylaş</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.laterBtn} onPress={onLater} hitSlop={12}>
            <Text style={styles.laterText}>Daha sonra hatırlat</Text>
          </TouchableOpacity>

          <View style={{ height: Math.max(24, winW * 0.05) }} />
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.bg },
  scroll: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.xl,
  },
  heroIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: Colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    marginBottom: Spacing.md,
  },
  title: {
    fontSize: FontSizes.xxl,
    fontFamily: "Inter_500Medium",
    color: Colors.textPrimary,
    textAlign: "center",
    marginBottom: Spacing.sm,
  },
  lead: {
    fontSize: FontSizes.sm,
    fontFamily: "Inter_400Regular",
    color: Colors.textSecondary,
    lineHeight: 22,
    textAlign: "center",
    marginBottom: Spacing.lg,
  },
  evoCard: {
    backgroundColor: Colors.purpleLight,
    borderRadius: Radii.card,
    borderWidth: 1,
    borderColor: "rgba(83, 74, 183, 0.2)",
    padding: Spacing.md,
    marginBottom: Spacing.lg,
    gap: Spacing.sm,
  },
  evoTitle: {
    fontSize: FontSizes.md,
    fontFamily: "Inter_500Medium",
    color: Colors.purple,
  },
  evoHint: {
    fontSize: FontSizes.xs,
    fontFamily: "Inter_400Regular",
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  evoQuote: {
    fontSize: FontSizes.sm,
    fontFamily: "Inter_400Regular",
    color: Colors.textPrimary,
    fontStyle: "italic",
    lineHeight: 20,
  },
  stackHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  stackTitle: {
    fontSize: FontSizes.md,
    fontFamily: "Inter_500Medium",
    color: Colors.textPrimary,
    flex: 1,
  },
  stackSub: {
    fontSize: FontSizes.sm,
    fontFamily: "Inter_400Regular",
    color: Colors.textSecondary,
    lineHeight: 20,
    marginBottom: Spacing.md,
  },
  suggestionCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radii.card,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    gap: 6,
    ...Shadows.soft,
  },
  sugTitle: {
    fontSize: FontSizes.md,
    fontFamily: "Inter_500Medium",
    color: Colors.textPrimary,
  },
  sugAnchor: {
    fontSize: FontSizes.sm,
    fontFamily: "Inter_400Regular",
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  sugReason: {
    fontSize: FontSizes.xs,
    fontFamily: "Inter_400Regular",
    color: Colors.textTertiary,
    lineHeight: 18,
    marginTop: 4,
  },
  sameBtn: {
    backgroundColor: Colors.primaryLight,
    borderRadius: Radii.card,
    borderWidth: 1,
    borderColor: "rgba(29, 158, 117, 0.3)",
    padding: Spacing.md,
    marginTop: Spacing.sm,
    marginBottom: Spacing.md,
    gap: 6,
    ...Shadows.soft,
  },
  sameBtnText: {
    fontSize: FontSizes.md,
    fontFamily: "Inter_500Medium",
    color: Colors.primaryDark,
    textAlign: "center",
  },
  sameBtnHint: {
    fontSize: FontSizes.xs,
    fontFamily: "Inter_400Regular",
    color: Colors.textSecondary,
    lineHeight: 18,
    textAlign: "center",
  },
  shareRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    paddingVertical: Spacing.sm,
  },
  shareText: {
    fontSize: FontSizes.sm,
    fontFamily: "Inter_500Medium",
    color: Colors.primary,
  },
  laterBtn: { paddingVertical: Spacing.md, alignItems: "center" },
  laterText: {
    fontSize: FontSizes.sm,
    fontFamily: "Inter_400Regular",
    color: Colors.textTertiary,
  },
});
