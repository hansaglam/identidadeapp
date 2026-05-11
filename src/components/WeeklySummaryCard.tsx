import React, { useMemo } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Share } from "react-native";
import { Share2 } from "lucide-react-native";
import { CheckinRecord } from "../types";
import { buildWeeklyDigest, type WeeklyDigest } from "../utils/weeklySummary";
import { Spacing, Radii, FontSizes, Colors, Shadows } from "../constants/theme";

function formatDigestShare(digest: WeeklyDigest, habitName: string): string {
  const h = habitName.trim() || "alışkanlık";
  let t = `Haftalık özet (${digest.windowLabel}) — ${h}\n`;
  t += `Tamamlanan günler: ${digest.completedDays}/7\n`;
  if (digest.missedDaysInWindow > 0) {
    t += `Kaçırılan günler (pencere): ${digest.missedDaysInWindow}\n`;
  }
  if (digest.slipProneWeekdayShort) {
    t += `Dikkat: son günlerde aksamalar genelde ${digest.slipProneWeekdayShort} çevresinde.\n`;
  }
  if (digest.completionTimePeak) {
    t += `${digest.completionTimePeak}\n`;
  }
  if (digest.completionTimeCaveat) {
    t += `${digest.completionTimeCaveat}\n`;
  }
  t += "\n— Kimlik (yerel veri)";
  return t;
}

interface Props {
  startDate: string;
  checkins: Record<string, CheckinRecord>;
  habitName: string;
}

export default function WeeklySummaryCard({ startDate, checkins, habitName }: Props) {
  const digest = useMemo(
    () => buildWeeklyDigest(startDate, checkins),
    [startDate, checkins]
  );

  const onShare = () => {
    Share.share({
      message: formatDigestShare(digest, habitName),
      title: "Haftalık özet",
    }).catch(() => {});
  };

  return (
    <View style={[styles.card, { backgroundColor: Colors.surface, borderColor: Colors.border }, Shadows.card]}>
      <Text style={[styles.title, { color: Colors.textPrimary }]}>Haftalık özet</Text>
      <Text style={[styles.sub, { color: Colors.textTertiary }]}>{digest.windowLabel}</Text>
      <Text style={[styles.line, { color: Colors.textSecondary }]}>
        Tamamlanan günler:{" "}
        <Text style={{ fontFamily: "Inter_500Medium", color: Colors.primary }}>
          {digest.completedDays}/7
        </Text>
      </Text>
      {digest.missedDaysInWindow > 0 ? (
        <Text style={[styles.line, { color: Colors.textSecondary }]}>
          Bu pencerede kaçırılan: {digest.missedDaysInWindow}
        </Text>
      ) : null}
      {digest.completionTimePeak ? (
        <Text style={[styles.hint, { color: Colors.textSecondary }]}>{digest.completionTimePeak}</Text>
      ) : null}
      {digest.completionTimeCaveat ? (
        <Text style={[styles.caveat, { color: Colors.textTertiary }]}>{digest.completionTimeCaveat}</Text>
      ) : null}
      {digest.slipProneWeekdayShort ? (
        <Text style={[styles.hint, { color: Colors.textTertiary }]}>
          Son günlerde aksamalar çoğunlukla{" "}
          <Text style={{ color: Colors.gold, fontFamily: "Inter_500Medium" }}>
            {digest.slipProneWeekdayShort}
          </Text>{" "}
          günlerine yakın görünüyor (basit yerel sayım; sunucu yok).
        </Text>
      ) : (
        <Text style={[styles.hint, { color: Colors.textTertiary }]}>
          Bu hafta tutarlı görünüyorsun — tek net hareket akışına devam.
        </Text>
      )}
      <TouchableOpacity
        style={[styles.shareRow, { borderTopColor: Colors.border }]}
        onPress={onShare}
        activeOpacity={0.85}
      >
        <Share2 size={16} color={Colors.primary} strokeWidth={1.8} />
        <Text style={[styles.shareText, { color: Colors.primary }]}>Metni paylaş</Text>
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
    gap: 4,
  },
  title: {
    fontSize: FontSizes.md,
    fontFamily: "Inter_500Medium",
  },
  sub: {
    fontSize: FontSizes.xs,
    fontFamily: "Inter_400Regular",
    marginBottom: Spacing.xs,
  },
  line: {
    fontSize: FontSizes.sm,
    fontFamily: "Inter_400Regular",
    lineHeight: 20,
  },
  caveat: {
    fontSize: FontSizes.xs,
    fontFamily: "Inter_400Regular",
    fontStyle: "italic",
    lineHeight: 17,
    marginTop: Spacing.xs,
  },
  hint: {
    fontSize: FontSizes.xs,
    fontFamily: "Inter_400Regular",
    lineHeight: 18,
    marginTop: Spacing.xs,
  },
  shareRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    marginTop: Spacing.sm,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
  },
  shareText: {
    fontSize: FontSizes.sm,
    fontFamily: "Inter_500Medium",
  },
});
