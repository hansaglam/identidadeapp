import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { ClipboardList, ChevronRight, Calendar } from "lucide-react-native";
import type { TomorrowTodoItem } from "../../store/tomorrowPlanStore";
import TodayPlanCard from "./TodayPlanCard";
import { Colors, Spacing, Radii, FontSizes, Shadows } from "../../constants/theme";

interface Props {
  todayItems: TomorrowTodoItem[];
  todayDone: boolean;
  onToggleToday: (id: string) => void;
  tomorrowItems: TomorrowTodoItem[];
  onOpenJourney: () => void;
}

export default function HomeTomorrowPlansSection({
  todayItems,
  todayDone,
  onToggleToday,
  tomorrowItems,
  onOpenJourney,
}: Props) {
  const tomorrowPrimary =
    tomorrowItems.find((i) => i.isPrimary) ?? tomorrowItems[0] ?? null;

  return (
    <View style={styles.wrap}>
      {todayItems.length > 0 ? (
        <TodayPlanCard
          items={todayItems}
          todayDone={todayDone}
          onToggle={onToggleToday}
        />
      ) : (
        <View style={styles.emptyToday}>
          <Text style={styles.emptyTodayTitle}>Bugün için plan yok</Text>
          <Text style={styles.emptyTodayBody}>
            Dün Yolculuk’ta yazdığın liste burada görünür. İlk planı yarın için kurabilirsin.
          </Text>
        </View>
      )}

      <View style={styles.tomorrowCard}>
        <View style={styles.tomorrowHeader}>
          <View style={styles.tomorrowIcon}>
            <Calendar size={16} color={Colors.primary} strokeWidth={2} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.tomorrowKicker}>Yarının küçük listesi</Text>
            <Text style={styles.tomorrowTitle}>
              {tomorrowItems.length > 0
                ? `${tomorrowItems.length} madde hazır`
                : "Henüz plan yok"}
            </Text>
          </View>
        </View>

        {tomorrowPrimary ? (
          <View style={styles.tomorrowPreview}>
            <Text style={styles.tomorrowPrimaryLabel}>Ana adım</Text>
            <Text style={styles.tomorrowPrimaryText} numberOfLines={2}>
              {tomorrowPrimary.text}
            </Text>
            {tomorrowPrimary.time || tomorrowPrimary.context ? (
              <Text style={styles.tomorrowMeta} numberOfLines={1}>
                {[tomorrowPrimary.time, tomorrowPrimary.context].filter(Boolean).join(" · ")}
              </Text>
            ) : null}
          </View>
        ) : (
          <Text style={styles.tomorrowEmpty}>
            Yarın sabah net bir çapa için 1 ana + en fazla 2 destek maddesi ekle.
          </Text>
        )}

        <TouchableOpacity style={styles.tomorrowCta} onPress={onOpenJourney} activeOpacity={0.85}>
          <ClipboardList size={16} color="#fff" strokeWidth={2} />
          <Text style={styles.tomorrowCtaText}>
            {tomorrowItems.length > 0 ? "Yolculuk’ta düzenle" : "Yolculuk’ta planla"}
          </Text>
          <ChevronRight size={16} color="#fff" strokeWidth={2} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: Spacing.sm,
  },
  emptyToday: {
    backgroundColor: Colors.surfaceMuted,
    borderRadius: Radii.card,
    padding: Spacing.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.border,
  },
  emptyTodayTitle: {
    fontSize: FontSizes.sm,
    fontFamily: "Inter_600SemiBold",
    fontWeight: "600",
    color: Colors.textPrimary,
  },
  emptyTodayBody: {
    marginTop: 4,
    fontSize: FontSizes.sm,
    fontFamily: "Inter_400Regular",
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  tomorrowCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radii.card,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.soft,
  },
  tomorrowHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  tomorrowIcon: {
    width: 36,
    height: 36,
    borderRadius: Radii.button,
    backgroundColor: Colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },
  tomorrowKicker: {
    fontSize: FontSizes.xs,
    fontFamily: "Inter_600SemiBold",
    fontWeight: "600",
    color: Colors.primary,
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  tomorrowTitle: {
    fontSize: FontSizes.md,
    fontFamily: "Inter_600SemiBold",
    fontWeight: "600",
    color: Colors.textPrimary,
    marginTop: 2,
  },
  tomorrowPreview: {
    backgroundColor: Colors.surfaceMuted,
    borderRadius: Radii.button,
    padding: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  tomorrowPrimaryLabel: {
    fontSize: 10,
    fontFamily: "Inter_600SemiBold",
    fontWeight: "600",
    color: Colors.textTertiary,
    textTransform: "uppercase",
  },
  tomorrowPrimaryText: {
    fontSize: FontSizes.sm,
    fontFamily: "Inter_500Medium",
    color: Colors.textPrimary,
    marginTop: 4,
    lineHeight: 20,
  },
  tomorrowMeta: {
    fontSize: FontSizes.xs,
    color: Colors.textTertiary,
    marginTop: 4,
  },
  tomorrowEmpty: {
    fontSize: FontSizes.sm,
    fontFamily: "Inter_400Regular",
    color: Colors.textSecondary,
    lineHeight: 20,
    marginBottom: Spacing.sm,
  },
  tomorrowCta: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: Colors.primary,
    borderRadius: Radii.button,
    paddingVertical: 12,
  },
  tomorrowCtaText: {
    fontSize: FontSizes.sm,
    fontFamily: "Inter_600SemiBold",
    fontWeight: "600",
    color: "#fff",
  },
});
