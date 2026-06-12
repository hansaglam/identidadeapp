import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { RotateCcw } from "lucide-react-native";
import { Colors, Spacing, Radii, FontSizes } from "../../constants/theme";

interface Props {
  visible: boolean;
  onContinue: () => void;
}

export default function FirstComebackModal({ visible, onContinue }: Props) {
  const { t } = useTranslation();

  return (
    <Modal visible={visible} animationType="fade" onRequestClose={onContinue}>
      <SafeAreaView style={styles.root} edges={["top", "bottom"]}>
        <View style={styles.content}>
          <View style={styles.iconWrap}>
            <RotateCcw size={40} color={Colors.primary} strokeWidth={1.8} />
          </View>

          <Text style={styles.title}>{t("growth.firstComeback.title")}</Text>

          <Text style={styles.body}>{t("growth.firstComeback.body")}</Text>

          <Text style={styles.restart}>{t("growth.firstComeback.restart")}</Text>

          <TouchableOpacity
            style={styles.cta}
            onPress={onContinue}
            activeOpacity={0.88}
          >
            <Text style={styles.ctaText}>{t("growth.firstComeback.continue")}</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.bg,
    justifyContent: "center",
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
    justifyContent: "center",
    alignItems: "center",
  },
  iconWrap: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: "rgba(16, 185, 129, 0.12)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.xl,
  },
  title: {
    fontSize: 28,
    fontFamily: "Inter_700Bold",
    fontWeight: "700",
    color: Colors.textPrimary,
    textAlign: "center",
    marginBottom: Spacing.lg,
    letterSpacing: -0.3,
  },
  body: {
    fontSize: FontSizes.lg,
    fontFamily: "Inter_400Regular",
    color: Colors.textSecondary,
    textAlign: "center",
    lineHeight: 28,
    marginBottom: Spacing.md,
    paddingHorizontal: Spacing.sm,
  },
  restart: {
    fontSize: FontSizes.md,
    fontFamily: "Inter_500Medium",
    fontWeight: "500",
    color: Colors.primary,
    textAlign: "center",
    marginBottom: Spacing.xl + 8,
  },
  cta: {
    width: "100%",
    backgroundColor: Colors.primary,
    borderRadius: Radii.button,
    paddingVertical: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  ctaText: {
    fontSize: FontSizes.lg,
    fontFamily: "Inter_600SemiBold",
    fontWeight: "600",
    color: "#fff",
  },
});
