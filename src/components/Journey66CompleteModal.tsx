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
  const h = habitName.trim() || "alışkanlığın";

  const onShare = () => {
    const msg = [
      "66 günlük kimlik yolculuğunu tamamladım.",
      `${h} artık kimliğimin parçası.`,
      `#KimlikApp`,
    ].join(" ");
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
          <Text style={styles.title}>66 gün tamamlandı</Text>
          <Text style={styles.lead}>
            {h} için kurduğun yolculuğu bitirdin. Bu bir rozet değil — davranışın artık sende
            oturmuş olabilir.
          </Text>

          <View style={styles.statsCard}>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Tamamlama (dönem)</Text>
              <Text style={styles.statValue}>%{Math.round(completionPct * 100)}</Text>
            </View>
            {avgAutomaticity != null ? (
              <View style={styles.statRow}>
                <Text style={styles.statLabel}>Ort. otomatiklik</Text>
                <Text style={styles.statValue}>{avgAutomaticity.toFixed(1)}/10</Text>
              </View>
            ) : null}
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Toplam check-in</Text>
              <Text style={styles.statValue}>{totalCheckins}</Text>
            </View>
          </View>

          <Text style={styles.nextHint}>
            İstersen aynı alışkanlıkta devam edebilir veya üzerine yeni bir kimlik katmanı
            ekleyebilirsin.
          </Text>

          <TouchableOpacity style={styles.primaryBtn} onPress={onContinue} activeOpacity={0.88}>
            <Text style={styles.primaryBtnText}>Sonraki adım</Text>
            <ArrowRight size={18} color="#fff" strokeWidth={2} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.shareBtn} onPress={onShare} activeOpacity={0.75}>
            <Share2 size={16} color={Colors.primary} strokeWidth={2} />
            <Text style={styles.shareBtnText}>Paylaş</Text>
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
    padding: Spacing.lg,
    paddingBottom: Spacing.xl,
  },
  iconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    marginBottom: Spacing.md,
  },
  title: {
    fontSize: 26,
    fontFamily: "Inter_700Bold",
    fontWeight: "700",
    color: Colors.textPrimary,
    textAlign: "center",
  },
  lead: {
    marginTop: Spacing.sm,
    fontSize: FontSizes.md,
    fontFamily: "Inter_400Regular",
    color: Colors.textSecondary,
    textAlign: "center",
    lineHeight: 24,
  },
  statsCard: {
    marginTop: Spacing.lg,
    backgroundColor: Colors.surface,
    borderRadius: Radii.card,
    padding: Spacing.md,
    gap: Spacing.sm,
    ...Shadows.soft,
  },
  statRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  statLabel: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
  },
  statValue: {
    fontSize: FontSizes.md,
    fontFamily: "Inter_600SemiBold",
    fontWeight: "600",
    color: Colors.primaryDark,
  },
  nextHint: {
    marginTop: Spacing.lg,
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    textAlign: "center",
    lineHeight: 22,
  },
  primaryBtn: {
    marginTop: Spacing.lg,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: Colors.primary,
    borderRadius: Radii.button,
    paddingVertical: 16,
  },
  primaryBtnText: {
    fontSize: FontSizes.md,
    fontFamily: "Inter_600SemiBold",
    fontWeight: "600",
    color: "#fff",
  },
  shareBtn: {
    marginTop: Spacing.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 12,
  },
  shareBtnText: {
    fontSize: FontSizes.sm,
    fontFamily: "Inter_500Medium",
    color: Colors.primary,
  },
});
