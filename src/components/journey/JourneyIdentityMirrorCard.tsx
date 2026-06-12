import React, { useMemo } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useTranslation } from "react-i18next";
import { Sparkles, ChevronRight } from "lucide-react-native";
import { useMindDumpStore } from "../../store/mindDumpStore";
import { useHabitStore } from "../../store/habitStore";
import { buildIdentityMirrorOutput } from "../../utils/identityMirror";
import { Colors, Spacing, Radii, FontSizes, Shadows } from "../../constants/theme";

interface Props {
  startDate: string;
  habitName: string;
  onOpenMind?: () => void;
}

export default function JourneyIdentityMirrorCard({
  startDate,
  habitName,
  onOpenMind,
}: Props) {
  const { t } = useTranslation();
  const mindEntries = useMindDumpStore((s) => s.entries);
  const reflections = useHabitStore((s) => s.reflections);

  const mirror = useMemo(
    () => buildIdentityMirrorOutput(startDate, mindEntries, reflections, habitName),
    [startDate, mindEntries, reflections, habitName]
  );

  const bodyText =
    mirror.mode === "matched" && mirror.report
      ? mirror.report
      : mirror.mode === "fallback" && mirror.latestSnippet != null && mirror.latestDay != null
        ? mirror.totalNotes === 1
          ? t("journey.identityMirror.fallbackOne", {
              day: mirror.latestDay,
              snippet: mirror.latestSnippet,
            })
          : t("journey.identityMirror.fallbackMany", {
              count: mirror.totalNotes,
              day: mirror.latestDay,
              snippet: mirror.latestSnippet,
            })
        : t("journey.identityMirror.empty");

  const showCta = mirror.mode !== "matched" && onOpenMind != null;

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={showCta ? onOpenMind : undefined}
      activeOpacity={showCta ? 0.88 : 1}
      disabled={!showCta}
    >
      <View style={styles.header}>
        <Sparkles size={14} color={Colors.primary} strokeWidth={2} />
        <Text style={styles.title}>{t("journey.identityMirror.title")}</Text>
        {mirror.mode === "matched" ? (
          <View style={styles.signalPill}>
            <Text style={styles.signalPillText}>
              {t("journey.identityMirror.signals", { count: mirror.signalCount })}
            </Text>
          </View>
        ) : null}
      </View>

      <Text
        style={[
          styles.body,
          mirror.mode === "empty" ? styles.bodyMuted : null,
        ]}
        numberOfLines={mirror.mode === "matched" ? 5 : 4}
      >
        {bodyText}
      </Text>

      {mirror.mode === "fallback" ? (
        <Text style={styles.hint}>{t("journey.identityMirror.fallbackHint")}</Text>
      ) : null}

      {mirror.mode === "matched" ? (
        <Text style={styles.foot}>{t("journey.identityMirror.foot")}</Text>
      ) : null}

      {showCta ? (
        <View style={styles.ctaRow}>
          <Text style={styles.ctaText}>{t("journey.identityMirror.ctaMind")}</Text>
          <ChevronRight size={14} color={Colors.primary} strokeWidth={2} />
        </View>
      ) : null}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radii.card,
    padding: 12,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: "rgba(47, 156, 134, 0.15)",
    ...Shadows.soft,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 6,
  },
  title: {
    flex: 1,
    fontSize: FontSizes.xs,
    fontFamily: "Inter_600SemiBold",
    fontWeight: "600",
    color: Colors.textPrimary,
  },
  signalPill: {
    backgroundColor: Colors.primaryLight,
    borderRadius: Radii.pill,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  signalPillText: {
    fontSize: 9,
    fontFamily: "Inter_600SemiBold",
    fontWeight: "600",
    color: Colors.primaryDark,
  },
  body: {
    fontSize: FontSizes.xs,
    fontFamily: "Inter_400Regular",
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  bodyMuted: {
    color: Colors.textTertiary,
  },
  hint: {
    marginTop: 6,
    fontSize: 10,
    fontFamily: "Inter_400Regular",
    color: Colors.textTertiary,
    lineHeight: 14,
  },
  foot: {
    marginTop: 6,
    fontSize: 10,
    fontFamily: "Inter_400Regular",
    color: Colors.textTertiary,
    lineHeight: 14,
  },
  ctaRow: {
    marginTop: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  ctaText: {
    fontSize: FontSizes.xs,
    fontFamily: "Inter_600SemiBold",
    fontWeight: "600",
    color: Colors.primary,
  },
});
