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

/**
 * 9:16 story önizleme + metin paylaşımı (tamamen cihaz içi).
 */
export default function ViralStoryCard({
  visible,
  onClose,
  dayNumber,
  consistencyPercent,
  habitName,
  startDate,
  checkins,
}: ViralStoryCardProps) {
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

  const shareMessage = `Gün ${dayNumber}. %${consistencyPercent} tutarlılık. Henüz başındayım ama sistem kuruldu. #66GunDisiplin`;

  const onShare = useCallback(() => {
    Share.share({
      message: `${shareMessage}${habitName ? `\nHedef: ${habitName}` : ""}`.trim(),
    }).catch(() => {});
  }, [shareMessage, habitName]);

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.centerSheet} onPress={(e) => e.stopPropagation()}>
          <SafeAreaView edges={["top", "bottom"]} style={styles.safe}>
            <View style={styles.headRow}>
              <Text style={styles.sheetTitle}>Paylaşım kartı</Text>
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
                <Text style={styles.watermark}>66 Gün Disiplin</Text>
                <Text style={styles.bigLine}>
                  Gün {dayNumber} · %{consistencyPercent} tutarlılık
                </Text>
                <Text style={styles.tagline}>Motivasyon değil, disiplin.</Text>
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
                  <Text style={styles.miniHint}>Otomatiklik çizgisi için günlük puan ekle</Text>
                )}
              </LinearGradient>
            </View>
            <TouchableOpacity style={styles.shareBtn} onPress={onShare} activeOpacity={0.88}>
              <Text style={styles.shareBtnText}>Story&apos;de paylaş (metin)</Text>
            </TouchableOpacity>
            <Text style={styles.shareNote}>
              Paylaşımda yalnızca seçtiğin metin kullanılır; sunucuya veri gitmez.
            </Text>
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
    borderRadius: Radii.card + 4,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: "hidden",
    maxWidth: 400,
    alignSelf: "center",
    width: "100%",
  },
  safe: { padding: Spacing.md, gap: Spacing.md },
  headRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sheetTitle: {
    fontSize: FontSizes.md,
    fontFamily: "Inter_500Medium",
    color: Colors.textPrimary,
  },
  storyFrame: {
    alignSelf: "center",
    borderRadius: Radii.card,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: Colors.border,
  },
  gradient: {
    flex: 1,
    padding: Spacing.lg,
    justifyContent: "space-between",
  },
  watermark: {
    fontSize: 10,
    fontFamily: "Inter_500Medium",
    color: "rgba(255,255,255,0.5)",
    letterSpacing: 1,
  },
  bigLine: {
    fontSize: FontSizes.xl,
    fontFamily: "Inter_500Medium",
    color: "#fff",
    textAlign: "center",
    marginTop: Spacing.md,
  },
  tagline: {
    fontSize: FontSizes.sm,
    fontFamily: "Inter_400Regular",
    color: "rgba(255,255,255,0.85)",
    textAlign: "center",
    marginTop: Spacing.sm,
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
    paddingVertical: Spacing.md,
    alignItems: "center",
  },
  shareBtnText: {
    fontSize: FontSizes.md,
    fontFamily: "Inter_500Medium",
    color: "#fff",
  },
  shareNote: {
    fontSize: FontSizes.xs,
    fontFamily: "Inter_400Regular",
    color: Colors.textTertiary,
    lineHeight: 17,
    textAlign: "center",
  },
});
