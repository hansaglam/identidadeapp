import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  TouchableOpacity,
  Share,
} from "react-native";
import { useTranslation } from "react-i18next";
import { SafeAreaView } from "react-native-safe-area-context";
import { Sparkles, Share2, ArrowRight } from "lucide-react-native";
import { Colors, Spacing, Radii, FontSizes, Shadows } from "../constants/theme";

interface Props {
  visible: boolean;
  habitName: string;
  completionPct: number;
  avgAutomaticity: number | null;
  totalCheckins: number;
  onContinue: () => void;
}

export default function Journey66CompleteModal({
  visible,
  habitName,
  completionPct,
  avgAutomaticity,
  totalCheckins,
  onContinue,
}: Props) {
  const { t } = useTranslation();
  const h = habitName.trim() || t("journey.complete66.defaultHabit");

  const onShare = () => {
    const msg = t("journey.complete66.shareMessage", { habit: h });
    void Share.share({ message: msg });
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onContinue}>
      <SafeAreaView style={styles.root} edges={["top", "bottom"]}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.iconWrap}>
            <Sparkles size={32} color={Colors.primary} strokeWidth={1.8} />
          </View>
          <Text style={styles.title}>{t("journey.complete66.title")}</Text>
          <Text style={styles.lead}>{t("journey.complete66.lead", { habit: h })}</Text>

          <View style={styles.statsCard}>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>{t("journey.complete66.completion")}</Text>
              <Text style={styles.statValue}>%{Math.round(completionPct * 100)}</Text>
            </View>
            {avgAutomaticity != null ? (
              <View style={styles.statRow}>
                <Text style={styles.statLabel}>{t("journey.complete66.automaticity")}</Text>
                <Text style={styles.statValue}>{avgAutomaticity.toFixed(1)}/10</Text>
              </View>
            ) : null}
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>{t("journey.complete66.checkins")}</Text>
              <Text style={styles.statValue}>{totalCheckins}</Text>
            </View>
          </View>

          <Text style={styles.nextHint}>{t("journey.complete66.nextHint")}</Text>

          <TouchableOpacity style={styles.primaryBtn} onPress={onContinue} activeOpacity={0.88}>
            <Text style={styles.primaryBtnText}>{t("journey.complete66.continue")}</Text>
            <ArrowRight size={18} color="#fff" strokeWidth={2} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.shareBtn} onPress={onShare} activeOpacity={0.75}>
            <Share2 size={16} color={Colors.primary} strokeWidth={2} />
            <Text style={styles.shareBtnText}>{t("journey.complete66.share")}</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  scroll: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.xl + 24,
    alignItems: "center",
  },
  iconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.lg,
  },
  title: {
    fontSize: FontSizes.xxl,
    fontFamily: "Inter_500Medium",
    color: Colors.textPrimary,
    textAlign: "center",
    marginBottom: Spacing.sm,
  },
  lead: {
    fontSize: FontSizes.md,
    fontFamily: "Inter_400Regular",
    color: Colors.textSecondary,
    textAlign: "center",
    lineHeight: 24,
    marginBottom: Spacing.lg,
    maxWidth: 340,
  },
  statsCard: {
    width: "100%",
    backgroundColor: Colors.surface,
    borderRadius: Radii.card,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
    ...Shadows.card,
  },
  statRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  statLabel: {
    fontSize: FontSizes.sm,
    fontFamily: "Inter_400Regular",
    color: Colors.textSecondary,
  },
  statValue: {
    fontSize: FontSizes.md,
    fontFamily: "Inter_500Medium",
    color: Colors.textPrimary,
  },
  nextHint: {
    fontSize: FontSizes.sm,
    fontFamily: "Inter_400Regular",
    color: Colors.textTertiary,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: Spacing.lg,
    maxWidth: 320,
  },
  primaryBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    backgroundColor: Colors.primary,
    borderRadius: Radii.button,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    width: "100%",
    marginBottom: Spacing.md,
  },
  primaryBtnText: {
    fontSize: FontSizes.md,
    fontFamily: "Inter_500Medium",
    color: "#fff",
  },
  shareBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
  },
  shareBtnText: {
    fontSize: FontSizes.sm,
    fontFamily: "Inter_500Medium",
    color: Colors.primary,
  },
});
