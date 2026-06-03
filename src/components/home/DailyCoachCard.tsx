import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Lightbulb, FlaskConical, Zap, Sparkles } from "lucide-react-native";
import { Colors, Spacing, Radii, FontSizes, Shadows } from "../../constants/theme";
import { getCoachNote } from "../../constants/identity-copy";
import { phaseIdFromDay } from "../../constants/journeyPhaseEducation";
import { DAILY_PRINCIPLES } from "../../data/dailyPrinciples";

const PHASE_LABELS: Record<1 | 2 | 3, string> = {
  1: "Kuruluş",
  2: "Pekiştirme",
  3: "Otomatikleşme",
};

interface Props {
  dayNumber: number;
  isPremium?: boolean;
}

export default function DailyCoachCard({ dayNumber, isPremium = false }: Props) {
  const dailyEntry = DAILY_PRINCIPLES.find((p) => p.day === dayNumber) ?? null;
  const milestone = getCoachNote(dayNumber);
  const phaseId = (dailyEntry?.phase ?? phaseIdFromDay(dayNumber)) as 1 | 2 | 3;

  if (!dailyEntry && !milestone) return null;

  return (
    <View style={[styles.card, isPremium && styles.cardPremium]}>
      <View style={styles.header}>
        <View style={[styles.iconWrap, isPremium && styles.iconWrapPremium]}>
          {isPremium ? (
            <Sparkles size={16} color={Colors.primary} strokeWidth={2} />
          ) : (
            <Lightbulb size={16} color={Colors.primary} strokeWidth={2} />
          )}
        </View>
        <View style={styles.headerText}>
          <Text style={styles.kicker}>
            {isPremium ? "✦ " : ""}Gün {dayNumber} · {PHASE_LABELS[phaseId]}
          </Text>
          <Text style={styles.title}>
            {isPremium ? "Koç paketi — bugünün ilkesi" : "Bugünün ilkesi"}
          </Text>
        </View>
      </View>

      {dailyEntry ? (
        <>
          <Text style={[styles.body, isPremium && styles.bodyPremium]}>
            {dailyEntry.principle}
          </Text>

          <View style={styles.metaRow}>
            <FlaskConical size={12} color={Colors.textTertiary} strokeWidth={1.8} />
            <Text style={styles.scienceText}>{dailyEntry.science}</Text>
          </View>

          <View style={styles.actionRow}>
            <Zap size={12} color={Colors.primary} strokeWidth={2} />
            <Text style={styles.actionText}>{dailyEntry.action}</Text>
          </View>
        </>
      ) : null}

      {milestone ? (
        <View style={styles.milestoneWrap}>
          <Text style={styles.milestoneLabel}>Kilometre taşı</Text>
          <Text style={styles.milestoneBody}>{milestone}</Text>
        </View>
      ) : null}

      {isPremium && (
        <Text style={styles.premiumNote}>
          Yolculuk sekmesinde harita, Kimlik Aynası ve SDT nabzın seni bekliyor.
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radii.card,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: "rgba(47, 156, 134, 0.12)",
    ...Shadows.soft,
  },
  cardPremium: {
    borderColor: "rgba(47, 156, 134, 0.28)",
    backgroundColor: "#F0FDF9",
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  iconWrap: {
    width: 32,
    height: 32,
    borderRadius: Radii.button,
    backgroundColor: Colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },
  iconWrapPremium: {
    backgroundColor: "rgba(47, 156, 134, 0.18)",
  },
  headerText: { flex: 1 },
  kicker: {
    fontSize: FontSizes.xs,
    fontFamily: "Inter_600SemiBold",
    fontWeight: "600",
    color: Colors.primary,
    letterSpacing: 0.4,
    textTransform: "uppercase",
  },
  title: {
    fontSize: FontSizes.md,
    fontFamily: "Inter_600SemiBold",
    fontWeight: "600",
    color: Colors.textPrimary,
    marginTop: 2,
  },
  body: {
    fontSize: FontSizes.sm,
    fontFamily: "Inter_400Regular",
    color: Colors.textSecondary,
    lineHeight: 22,
  },
  bodyPremium: {
    fontSize: FontSizes.md,
    fontFamily: "Inter_500Medium",
    color: Colors.textPrimary,
    lineHeight: 24,
  },
  milestoneWrap: {
    marginTop: Spacing.sm,
    paddingTop: Spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Colors.border,
  },
  milestoneLabel: {
    fontSize: FontSizes.xs,
    fontFamily: "Inter_600SemiBold",
    fontWeight: "600",
    color: Colors.textTertiary,
    marginBottom: 4,
  },
  milestoneBody: {
    fontSize: FontSizes.sm,
    fontFamily: "Inter_500Medium",
    color: Colors.textPrimary,
    lineHeight: 20,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 5,
    marginTop: Spacing.sm,
    paddingTop: Spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Colors.border,
  },
  scienceText: {
    flex: 1,
    fontSize: FontSizes.xs,
    fontFamily: "Inter_400Regular",
    color: Colors.textTertiary,
    lineHeight: 18,
  },
  actionRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 5,
    marginTop: 6,
  },
  actionText: {
    flex: 1,
    fontSize: FontSizes.sm,
    fontFamily: "Inter_500Medium",
    color: Colors.primaryDark,
    lineHeight: 20,
  },
  premiumNote: {
    marginTop: Spacing.sm,
    paddingTop: Spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "rgba(47, 156, 134, 0.2)",
    fontSize: FontSizes.xs,
    fontFamily: "Inter_400Regular",
    color: Colors.primary,
    lineHeight: 17,
    fontStyle: "italic",
  },
});
