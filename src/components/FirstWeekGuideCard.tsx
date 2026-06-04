import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Check } from "lucide-react-native";
import { useTranslation } from "react-i18next";
import { Spacing, Radii, FontSizes, Colors, Shadows } from "../constants/theme";

interface Props {
  dayNumber: number;
  dismissed: boolean;
  onDismiss: () => void;
  todayDone: boolean;
  recentActionsCount: number;
  mindDumpCount: number;
  journeyOpened: boolean;
  hasTomorrowPlan: boolean;
}

export default function FirstWeekGuideCard({
  dayNumber,
  dismissed,
  onDismiss,
  todayDone,
  recentActionsCount,
  mindDumpCount,
  journeyOpened,
  hasTomorrowPlan,
}: Props) {
  const { t } = useTranslation();
  if (dayNumber > 7 || dismissed) return null;

  const steps: { ok: boolean; label: string }[] = [
    { ok: todayDone, label: t("home.firstWeek.stepCheckIn") },
    { ok: recentActionsCount > 0, label: t("home.firstWeek.stepAction") },
    { ok: mindDumpCount >= 1, label: t("home.firstWeek.stepMind") },
    { ok: journeyOpened, label: t("home.firstWeek.stepJourney") },
    { ok: hasTomorrowPlan, label: t("home.firstWeek.stepTomorrow") },
  ];

  return (
    <View style={[styles.card, { borderColor: Colors.border, backgroundColor: Colors.surface }, Shadows.card]}>
      <Text style={[styles.head, { color: Colors.textPrimary }]}>{t("home.firstWeek.title")}</Text>
      <Text style={[styles.body, { color: Colors.textSecondary }]}>{t("home.firstWeek.body")}</Text>
      <View style={styles.rows}>
        {steps.map((s) => (
          <View style={styles.row} key={s.label}>
            <Check
              size={16}
              color={s.ok ? Colors.primary : Colors.textTertiary}
              strokeWidth={2}
              opacity={s.ok ? 1 : 0.35}
            />
            <Text
              style={[styles.rowText, { color: s.ok ? Colors.textSecondary : Colors.textTertiary }]}
            >
              {s.label}
            </Text>
          </View>
        ))}
      </View>
      <TouchableOpacity onPress={onDismiss} hitSlop={12}>
        <Text style={[styles.dismiss, { color: Colors.textTertiary }]}>{t("home.firstWeek.dismiss")}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: Radii.card,
    borderWidth: 1,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    gap: Spacing.sm,
  },
  head: {
    fontSize: FontSizes.md,
    fontFamily: "Inter_500Medium",
  },
  body: {
    fontSize: FontSizes.sm,
    fontFamily: "Inter_400Regular",
    lineHeight: 20,
  },
  rows: { gap: Spacing.sm },
  row: { flexDirection: "row", alignItems: "center", gap: Spacing.sm },
  rowText: { flex: 1, fontSize: FontSizes.sm, fontFamily: "Inter_400Regular" },
  dismiss: {
    fontSize: FontSizes.sm,
    fontFamily: "Inter_500Medium",
    marginTop: Spacing.xs,
    textAlign: "right",
  },
});
