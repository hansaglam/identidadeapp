import React, { useMemo, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Pressable,
  Share,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { LinearGradient } from "expo-linear-gradient";
import Svg, { Polyline } from "react-native-svg";
import { X } from "lucide-react-native";
import { Colors, Spacing, Radii, FontSizes } from "../constants/theme";
import { buildAutomaticitySeriesLastDays } from "../utils/automaticityChart";
import type { CheckinRecord } from "../types";

const ASPECT = 9 / 16;

export interface ViralStoryCardProps {
  visible: boolean;
  onClose: () => void;
  dayNumber: number;
  consistencyPercent: number;
  habitName: string;
  startDate: string;
  checkins: Record<string, CheckinRecord>;
}

export default function ViralStoryCard({
  visible,
  onClose,
  dayNumber,
  consistencyPercent,
  habitName,
  startDate,
  checkins,
}: ViralStoryCardProps) {
  const { t } = useTranslation();
  const { width: winW } = useWindowDimensions();
  const cardW = Math.min(winW - Spacing.lg * 2, 320);
  const cardH = cardW / ASPECT;

  const series = useMemo(
    () => buildAutomaticitySeriesLastDays(startDate, checkins, 14),
    [startDate, checkins]
  );

  const miniPath = useMemo(() => {
    const pts: { i: number; v: number }[] = [];
    series.forEach((p, i) => {
      if (p.value != null) pts.push({ i, v: p.value });
    });
    if (pts.length < 2) return "";
    const n = Math.max(1, series.length - 1);
    const plotW = cardW - 48;
    const plotH = 28;
    const pad = 8;
    return pts
      .map((p) => {
        const x = pad + (p.i / n) * plotW;
        const y = pad + (1 - (p.v - 1) / 9) * plotH;
        return `${x},${y}`;
      })
      .join(" ");
  }, [series, cardW]);

  const shareMessage = t("profile.story.shareMessage", {
    day: dayNumber,
    pct: consistencyPercent,
  });

  const onShare = useCallback(() => {
    Share.share({
      message: `${shareMessage}${habitName ? `\n${t("profile.story.shareGoal", { habit: habitName })}` : ""}`.trim(),
    }).catch(() => {});
  }, [shareMessage, habitName, t]);

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.centerSheet} onPress={(e) => e.stopPropagation()}>
          <SafeAreaView edges={["top", "bottom"]} style={styles.safe}>
            <View style={styles.headRow}>
              <Text style={styles.sheetTitle}>{t("profile.story.sheetTitle")}</Text>
              <TouchableOpacity onPress={onClose} hitSlop={12}>
                <X size={22} color={Colors.textTertiary} />
              </TouchableOpacity>
            </View>
            <View style={[styles.storyFrame, { width: cardW, height: cardH }]}>
              <LinearGradient
                colors={["#1a1a2e", "#16213e", "#0f3460"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.gradient}
              >
                <Text style={styles.watermark}>{t("profile.story.watermark")}</Text>
                <Text style={styles.bigLine}>
                  {t("profile.story.bigLine", { day: dayNumber, pct: consistencyPercent })}
                </Text>
                <Text style={styles.tagline}>{t("profile.story.tagline")}</Text>
                {miniPath ? (
                  <Svg width={cardW - 32} height={44} style={styles.miniChart}>
                    <Polyline
                      points={miniPath}
                      fill="none"
                      stroke={Colors.primary}
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </Svg>
                ) : (
                  <Text style={styles.miniHint}>{t("profile.story.miniHint")}</Text>
                )}
              </LinearGradient>
            </View>
            <TouchableOpacity style={styles.shareBtn} onPress={onShare} activeOpacity={0.88}>
              <Text style={styles.shareBtnText}>{t("profile.story.shareBtn")}</Text>
            </TouchableOpacity>
            <Text style={styles.shareNote}>{t("profile.story.shareNote")}</Text>
          </SafeAreaView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: Colors.overlay,
    justifyContent: "center",
    padding: Spacing.lg,
  },
  centerSheet: {
    backgroundColor: Colors.bg,
    borderRadius: Radii.card,
    overflow: "hidden",
    alignSelf: "center",
    maxWidth: 400,
    width: "100%",
  },
  safe: { padding: Spacing.md },
  headRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: Spacing.sm,
  },
  sheetTitle: {
    fontSize: FontSizes.lg,
    fontFamily: "Inter_500Medium",
    color: Colors.textPrimary,
  },
  storyFrame: {
    alignSelf: "center",
    borderRadius: Radii.card,
    overflow: "hidden",
    marginBottom: Spacing.md,
  },
  gradient: {
    flex: 1,
    padding: Spacing.lg,
    justifyContent: "space-between",
  },
  watermark: {
    fontSize: FontSizes.xs,
    fontFamily: "Inter_500Medium",
    color: "rgba(255,255,255,0.5)",
    textAlign: "center",
  },
  bigLine: {
    fontSize: FontSizes.lg,
    fontFamily: "Inter_500Medium",
    color: "#fff",
    textAlign: "center",
    marginVertical: Spacing.sm,
  },
  tagline: {
    fontSize: FontSizes.sm,
    fontFamily: "Inter_400Regular",
    color: "rgba(255,255,255,0.85)",
    textAlign: "center",
  },
  miniChart: { alignSelf: "center", marginTop: Spacing.md },
  miniHint: {
    fontSize: FontSizes.xs,
    color: "rgba(255,255,255,0.65)",
    textAlign: "center",
    marginTop: Spacing.md,
  },
  shareBtn: {
    backgroundColor: Colors.primary,
    borderRadius: Radii.button,
    paddingVertical: 12,
    alignItems: "center",
    marginBottom: Spacing.sm,
  },
  shareBtnText: {
    color: "#fff",
    fontFamily: "Inter_500Medium",
    fontSize: FontSizes.md,
  },
  shareNote: {
    fontSize: FontSizes.xs,
    fontFamily: "Inter_400Regular",
    color: Colors.textTertiary,
    textAlign: "center",
  },
});
