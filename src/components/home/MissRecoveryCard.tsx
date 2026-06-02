import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { RotateCcw, Zap } from "lucide-react-native";
import { Colors, Spacing, Radii, FontSizes, Shadows } from "../../constants/theme";
import { getMissedDayMessage } from "../../utils/missProtocol";

interface Props {
  consecutiveMiss: number;
  suggestedActionTitle: string | null;
  onStartSmallestStep: () => void;
  onOpenCheckIn: () => void;
}

export default function MissRecoveryCard({
  consecutiveMiss,
  suggestedActionTitle,
  onStartSmallestStep,
  onOpenCheckIn,
}: Props) {
  const msg = getMissedDayMessage(consecutiveMiss);

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View style={styles.iconWrap}>
          <RotateCcw size={18} color={Colors.coral} strokeWidth={2} />
        </View>
        <View style={styles.headerText}>
          <Text style={styles.kicker}>Kaçırma protokolü</Text>
          <Text style={styles.title}>{msg.title}</Text>
        </View>
      </View>
      <Text style={styles.body}>{msg.body}</Text>

      <TouchableOpacity
        style={styles.primaryBtn}
        onPress={onStartSmallestStep}
        activeOpacity={0.88}
      >
        <Zap size={16} color="#fff" strokeWidth={2.5} />
        <Text style={styles.primaryBtnText}>
          {suggestedActionTitle
            ? `En küçük adım: ${suggestedActionTitle.slice(0, 42)}${suggestedActionTitle.length > 42 ? "…" : ""}`
            : "En küçük adımı başlat"}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.secondaryBtn} onPress={onOpenCheckIn} activeOpacity={0.85}>
        <Text style={styles.secondaryBtnText}>Günü onaylamaya geç</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFBEB",
    borderRadius: Radii.card,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: "rgba(245, 158, 11, 0.25)",
    marginBottom: Spacing.md,
    ...Shadows.soft,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: Radii.button,
    backgroundColor: "#FEF3C7",
    alignItems: "center",
    justifyContent: "center",
  },
  headerText: { flex: 1 },
  kicker: {
    fontSize: FontSizes.xs,
    fontFamily: "Inter_600SemiBold",
    fontWeight: "600",
    color: "#B45309",
    textTransform: "uppercase",
    letterSpacing: 0.6,
    marginBottom: 2,
  },
  title: {
    fontSize: FontSizes.md,
    fontFamily: "Inter_600SemiBold",
    fontWeight: "600",
    color: Colors.textPrimary,
  },
  body: {
    fontSize: FontSizes.sm,
    fontFamily: "Inter_400Regular",
    color: Colors.textSecondary,
    lineHeight: 20,
    marginBottom: Spacing.md,
  },
  primaryBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: Colors.primary,
    borderRadius: Radii.button,
    paddingVertical: 12,
    paddingHorizontal: Spacing.md,
  },
  primaryBtnText: {
    flex: 1,
    fontSize: FontSizes.sm,
    fontFamily: "Inter_600SemiBold",
    fontWeight: "600",
    color: "#fff",
  },
  secondaryBtn: {
    marginTop: Spacing.sm,
    alignItems: "center",
    paddingVertical: 8,
  },
  secondaryBtnText: {
    fontSize: FontSizes.sm,
    fontFamily: "Inter_500Medium",
    color: Colors.primary,
  },
});
