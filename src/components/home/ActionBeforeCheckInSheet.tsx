import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Zap, ArrowRight } from "lucide-react-native";
import { Colors, Spacing, Radii, FontSizes, Shadows } from "../../constants/theme";
import { useTranslation } from "react-i18next";
import type { Action } from "../../engine";

interface Props {
  visible: boolean;
  strict: boolean;
  suggestedAction: Action | null;
  onStartAction: () => void;
  onContinueCheckIn: () => void;
  onClose: () => void;
}

export default function ActionBeforeCheckInSheet({
  visible,
  strict,
  suggestedAction,
  onStartAction,
  onContinueCheckIn,
  onClose,
}: Props) {
  const { t } = useTranslation();
  const title = suggestedAction?.title ?? t("home.actionGate.defaultTitle");

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.root}>
        <Pressable style={styles.backdrop} onPress={strict ? undefined : onClose} />
        <SafeAreaView edges={["bottom"]} style={styles.safe}>
          <View style={styles.panel}>
            <View style={styles.handle} />
            <View style={styles.iconWrap}>
              <Zap size={22} color={Colors.primary} strokeWidth={2.2} />
            </View>
            <Text style={styles.title}>
              {strict ? t("home.actionGate.strictTitle") : t("home.actionGate.softTitle")}
            </Text>
            <Text style={styles.body}>
              {strict ? t("home.actionGate.strictBody") : t("home.actionGate.softBody")}
            </Text>
            {suggestedAction ? (
              <View style={styles.actionPreview}>
                <Text style={styles.actionPreviewTitle} numberOfLines={2}>
                  {title}
                </Text>
                <Text style={styles.actionPreviewMeta}>
                  {suggestedAction.duration > 0
                    ? t("home.actionGate.seconds", { count: suggestedAction.duration })
                    : t("home.actionGate.singleAction")}
                </Text>
              </View>
            ) : null}

            <TouchableOpacity
              style={styles.primaryBtn}
              onPress={onStartAction}
              activeOpacity={0.88}
            >
              <Text style={styles.primaryBtnText}>{t("home.actionGate.startAction")}</Text>
              <ArrowRight size={16} color="#fff" strokeWidth={2.5} />
            </TouchableOpacity>

            {!strict ? (
              <TouchableOpacity
                style={styles.secondaryBtn}
                onPress={onContinueCheckIn}
                activeOpacity={0.85}
              >
                <Text style={styles.secondaryBtnText}>{t("home.actionGate.skipToCheckIn")}</Text>
              </TouchableOpacity>
            ) : (
              <Text style={styles.strictHint}>{t("home.actionGate.strictHint")}</Text>
            )}
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, justifyContent: "flex-end" },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: Colors.overlay,
  },
  safe: { width: "100%" },
  panel: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xl,
    paddingTop: Spacing.sm,
    ...Shadows.card,
  },
  handle: {
    alignSelf: "center",
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.border,
    marginBottom: Spacing.md,
  },
  iconWrap: {
    alignSelf: "center",
    width: 48,
    height: 48,
    borderRadius: Radii.card,
    backgroundColor: Colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.sm,
  },
  title: {
    fontSize: FontSizes.lg,
    fontFamily: "Inter_600SemiBold",
    fontWeight: "600",
    color: Colors.textPrimary,
    textAlign: "center",
    marginBottom: Spacing.sm,
  },
  body: {
    fontSize: FontSizes.sm,
    fontFamily: "Inter_400Regular",
    color: Colors.textSecondary,
    lineHeight: 22,
    textAlign: "center",
    marginBottom: Spacing.md,
  },
  actionPreview: {
    backgroundColor: Colors.surfaceMuted,
    borderRadius: Radii.button,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  actionPreviewTitle: {
    fontSize: FontSizes.md,
    fontFamily: "Inter_500Medium",
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  actionPreviewMeta: {
    fontSize: FontSizes.xs,
    fontFamily: "Inter_400Regular",
    color: Colors.textTertiary,
  },
  primaryBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: Colors.primary,
    borderRadius: Radii.button,
    paddingVertical: 14,
  },
  primaryBtnText: {
    fontSize: FontSizes.md,
    fontFamily: "Inter_600SemiBold",
    fontWeight: "600",
    color: "#fff",
  },
  secondaryBtn: {
    marginTop: Spacing.sm,
    paddingVertical: 12,
    alignItems: "center",
  },
  secondaryBtnText: {
    fontSize: FontSizes.sm,
    fontFamily: "Inter_500Medium",
    color: Colors.textTertiary,
  },
  strictHint: {
    marginTop: Spacing.sm,
    fontSize: FontSizes.xs,
    fontFamily: "Inter_400Regular",
    color: Colors.textTertiary,
    textAlign: "center",
    lineHeight: 18,
  },
});
