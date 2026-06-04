import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Animated,
  Pressable,
  Linking,
  Platform,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { X, Sparkles } from "lucide-react-native";
import { useTranslation } from "react-i18next";
import { useUserStore } from "../store/userStore";
import { useIAPStore, IAP_PRODUCTS } from "../store/iapStore";
import {
  Colors,
  Spacing,
  Radii,
  FontSizes,
} from "../constants/theme";
import ConfirmDialog from "./ConfirmDialog";
import { MIND_DUMP_FREE_LIMIT_EXPLAIN } from "../constants/purposeCopy";
import { trackEvent } from "../utils/analytics";
import { PRIVACY_POLICY_URL, TERMS_URL } from "../constants/appLinks";

interface Props {
  visible: boolean;
  onClose: () => void;
  trigger: "journey" | "minddump" | "day7" | "day22" | "profile";
}

export default function PremiumGateModal({ visible, onClose, trigger }: Props) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const profilePremium = useUserStore((s) => s.profile?.isPremium ?? false);
  const hapticsEnabled = useUserStore((s) => s.profile?.hapticsEnabled ?? true);
  const {
    connect,
    loadProducts,
    purchase,
    restorePurchases,
    products,
    isLoading,
  } = useIAPStore();
  const [purchasing, setPurchasing] = useState(false);
  const [purchaseError, setPurchaseError] = useState<string | null>(null);

  const sheetOpacity = useRef(new Animated.Value(0)).current;
  const sheetTranslate = useRef(new Animated.Value(28)).current;
  const overlayOpacity = useRef(new Animated.Value(0)).current;
  const ctaScale = useRef(new Animated.Value(1)).current;

  const purchaseStartedRef = useRef(false);

  useEffect(() => {
    if (visible && profilePremium) {
      if (purchaseStartedRef.current) {
        void trackEvent("purchase_success", { trigger });
        purchaseStartedRef.current = false;
      }
      setPurchasing(false);
      onClose();
    }
  }, [visible, profilePremium, onClose, trigger]);

  useEffect(() => {
    if (!visible) purchaseStartedRef.current = false;
  }, [visible]);

  useEffect(() => {
    if (visible && !profilePremium) {
      void trackEvent("paywall_view", { trigger });
    }
  }, [visible, profilePremium, trigger]);

  useEffect(() => {
    if (visible) {
      sheetOpacity.setValue(0);
      sheetTranslate.setValue(28);
      overlayOpacity.setValue(0);
      Animated.parallel([
        Animated.timing(overlayOpacity, {
          toValue: 1,
          duration: 280,
          useNativeDriver: true,
        }),
        Animated.timing(sheetOpacity, {
          toValue: 1,
          duration: 320,
          useNativeDriver: true,
        }),
        Animated.spring(sheetTranslate, {
          toValue: 0,
          useNativeDriver: true,
          friction: 9,
          tension: 65,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(overlayOpacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(sheetOpacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const handlePurchase = async () => {
    if (hapticsEnabled) {
      try {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      } catch {
        /* no-op */
      }
    }
    setPurchasing(true);
    setPurchaseError(null);
    void trackEvent("purchase_start", { trigger });
    purchaseStartedRef.current = true;
    try {
      await connect();
      await loadProducts();
      await purchase(IAP_PRODUCTS.PRO_MONTHLY);
    } catch {
      void trackEvent("purchase_error", { trigger });
      setPurchaseError(t("premium.purchaseError"));
    } finally {
      setPurchasing(false);
    }
  };

  const handleRestore = async () => {
    if (hapticsEnabled) {
      try {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch {
        /* no-op */
      }
    }
    setPurchasing(true);
    setPurchaseError(null);
    try {
      await connect();
      await restorePurchases();
      void trackEvent("purchase_restore", { trigger });
      if (useUserStore.getState().profile?.isPremium) {
        Alert.alert(t("premium.restoreSuccess"), t("premium.restoreSuccessBody"));
        onClose();
      } else {
        setPurchaseError(t("premium.restoreNotFound"));
      }
    } catch {
      void trackEvent("purchase_error", { trigger, phase: "restore" });
      setPurchaseError(t("premium.restoreError"));
    } finally {
      setPurchasing(false);
    }
  };

  const product = products.find(
    (p: any) => p.id === IAP_PRODUCTS.PRO_MONTHLY
  );
  const priceStr =
    product?.displayPrice ??
    product?.localizedPrice ??
    "—";

  const ctaPressIn = () => {
    Animated.spring(ctaScale, {
      toValue: 0.97,
      useNativeDriver: true,
      friction: 6,
      tension: 120,
    }).start();
  };

  const ctaPressOut = () => {
    Animated.spring(ctaScale, {
      toValue: 1,
      useNativeDriver: true,
      friction: 6,
      tension: 120,
    }).start();
  };

  const sheetPadBottom = Math.max(Spacing.md, insets.bottom + 6);

  return (
    <>
      <Modal
        visible={visible}
        transparent
        animationType="none"
        onRequestClose={onClose}
      >
        <View style={styles.root}>
          <Animated.View style={[styles.overlay, { opacity: overlayOpacity }]}>
            <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
          </Animated.View>

          <Animated.View
            style={[
              styles.sheetWrap,
              {
                opacity: sheetOpacity,
                transform: [{ translateY: sheetTranslate }],
              },
            ]}
          >
            <View style={[styles.sheet, { paddingBottom: sheetPadBottom }]}>
              <TouchableOpacity style={styles.closeBtn} onPress={onClose} hitSlop={8}>
                <X size={18} color={Colors.textTertiary} strokeWidth={1.5} />
              </TouchableOpacity>

              <View style={styles.handle} />

              <View style={styles.iconWrap}>
                <Sparkles size={22} color={Colors.primary} strokeWidth={1.5} />
              </View>

              <Text style={styles.headline}>{t("premium.headline")}</Text>

              <View style={styles.narrative}>
                <Text style={styles.narrativeLine}>{t("premium.narrative1")}</Text>
                <Text style={styles.narrativeEmphasis}>{t("premium.narrativeEmphasis")}</Text>
                <Text style={styles.narrativeLine}>{t("premium.narrative2")}</Text>
              </View>

              <Text style={styles.optOutLine}>{t("premium.optOut")}</Text>

              {trigger === "minddump" ? (
                <Text style={styles.triggerMicro}>{MIND_DUMP_FREE_LIMIT_EXPLAIN}</Text>
              ) : (t(`premium.triggers.${trigger}`) !== `premium.triggers.${trigger}` ? (
                <Text style={styles.triggerMicro}>{t(`premium.triggers.${trigger}`)}</Text>
              ) : null)}

              <View style={styles.panel}>
                <Text style={styles.panelLabel}>{t("premium.panelLabel")}</Text>
                {(t("premium.benefits", { returnObjects: true }) as string[]).map((line: string, i: number) => (
                  <View key={i} style={styles.bulletRow}>
                    <Text style={styles.bulletMark}>·</Text>
                    <Text style={styles.bulletText}>{line}</Text>
                  </View>
                ))}
                <Text style={styles.panelFoot}>{t("premium.commitmentEffect")}</Text>
                <Text style={styles.panelFootMuted}>{t("premium.extensionNote")}</Text>
              </View>

              <View style={styles.ctaSection}>
                <Text style={styles.ctaLabel}>{t("premium.ctaLabel")}</Text>
                <Animated.View
                  style={[
                    styles.ctaScaleWrap,
                    { transform: [{ scale: ctaScale }] },
                  ]}
                >
                  <TouchableOpacity
                    style={styles.ctaBtn}
                    onPress={handlePurchase}
                    onPressIn={ctaPressIn}
                    onPressOut={ctaPressOut}
                    disabled={purchasing || isLoading}
                    activeOpacity={1}
                    accessibilityLabel="Premium'a abone ol"
                    accessibilityRole="button"
                  >
                    <Text style={styles.ctaText}>
                      {purchasing || isLoading
                        ? t("common.loading")
                        : priceStr !== "—"
                          ? t("premium.ctaButtonWithPrice", { price: priceStr })
                          : t("premium.ctaButton")}
                    </Text>
                  </TouchableOpacity>
                </Animated.View>

                <TouchableOpacity style={styles.dismissBtn} onPress={onClose} accessibilityLabel={t("premium.dismiss")}>
                  <Text style={styles.dismissText}>{t("premium.dismiss")}</Text>
                  <Text style={styles.dismissSub}>{t("premium.dismissSub")}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.restoreWrap}
                  onPress={handleRestore}
                  disabled={purchasing || isLoading}
                  accessibilityLabel={t("premium.restore")}
                  accessibilityRole="button"
                >
                  <Text style={styles.restoreText}>{t("premium.restore")}</Text>
                </TouchableOpacity>

                <Text style={styles.disclaimer}>{t("premium.subscriptionNote")}</Text>
                <View style={styles.legalLinks}>
                  <TouchableOpacity onPress={() => void Linking.openURL(PRIVACY_POLICY_URL)}>
                    <Text style={styles.legalLinkText}>Gizlilik</Text>
                  </TouchableOpacity>
                  <Text style={styles.legalDot}>·</Text>
                  <TouchableOpacity onPress={() => void Linking.openURL(TERMS_URL)}>
                    <Text style={styles.legalLinkText}>Koşullar</Text>
                  </TouchableOpacity>
                  {Platform.OS === "android" || Platform.OS === "ios" ? (
                    <>
                      <Text style={styles.legalDot}>·</Text>
                      <TouchableOpacity
                        onPress={() =>
                          void Linking.openURL(
                            Platform.OS === "ios"
                              ? "https://apps.apple.com/account/subscriptions"
                              : "https://play.google.com/store/account/subscriptions"
                          )
                        }
                      >
                        <Text style={styles.legalLinkText}>{t("premium.legalManage")}</Text>
                      </TouchableOpacity>
                    </>
                  ) : null}
                </View>
              </View>
            </View>
          </Animated.View>
        </View>
      </Modal>

      <ConfirmDialog
        visible={purchaseError !== null}
        title={t("common.error")}
        message={purchaseError ?? ""}
        tone="warning"
        onRequestClose={() => setPurchaseError(null)}
        actions={[
          {
            label: t("common.done"),
            variant: "primary",
            onPress: () => setPurchaseError(null),
          },
        ]}
      />
    </>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: "flex-end",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: Colors.overlay,
  },
  sheetWrap: {
    width: "100%",
    maxWidth: 480,
    alignSelf: "center",
  },
  sheet: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.1,
    shadowRadius: 28,
    elevation: 20,
  },
  handle: {
    alignSelf: "center",
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.border,
    marginBottom: Spacing.sm,
  },
  closeBtn: {
    position: "absolute",
    top: Spacing.sm + 4,
    right: Spacing.md,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.bg,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    marginBottom: Spacing.sm,
    marginTop: Spacing.md,
  },
  headline: {
    fontSize: FontSizes.xl + 1,
    fontFamily: "Inter_500Medium",
    color: Colors.textPrimary,
    textAlign: "center",
    letterSpacing: -0.35,
    marginBottom: Spacing.md,
    paddingHorizontal: Spacing.xs,
  },
  narrative: {
    width: "100%",
    gap: 6,
    marginBottom: Spacing.md,
  },
  narrativeLine: {
    fontSize: FontSizes.sm,
    fontFamily: "Inter_400Regular",
    color: Colors.textSecondary,
    textAlign: "center",
    lineHeight: 20,
  },
  narrativeEmphasis: {
    fontSize: FontSizes.md,
    fontFamily: "Inter_500Medium",
    color: Colors.textPrimary,
    textAlign: "center",
    lineHeight: 22,
  },
  optOutLine: {
    fontSize: FontSizes.sm,
    fontFamily: "Inter_400Regular",
    color: Colors.textTertiary,
    textAlign: "center",
    lineHeight: 19,
    marginBottom: Spacing.md,
    paddingHorizontal: Spacing.sm,
  },
  triggerMicro: {
    fontSize: FontSizes.sm,
    fontFamily: "Inter_400Regular",
    color: Colors.textSecondary,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: Spacing.md,
    paddingHorizontal: Spacing.sm,
  },
  panel: {
    width: "100%",
    backgroundColor: Colors.bg,
    borderRadius: Radii.card + 4,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.md,
  },
  panelLabel: {
    fontSize: 10,
    fontFamily: "Inter_500Medium",
    color: Colors.textTertiary,
    marginBottom: Spacing.sm,
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  bulletRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 6,
    marginBottom: 5,
  },
  bulletMark: {
    fontSize: FontSizes.md,
    fontFamily: "Inter_400Regular",
    color: Colors.textTertiary,
    lineHeight: 18,
    marginTop: -1,
    width: 10,
    textAlign: "center",
  },
  bulletText: {
    flex: 1,
    fontSize: FontSizes.xs + 1,
    fontFamily: "Inter_400Regular",
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  panelFoot: {
    fontSize: FontSizes.xs,
    fontFamily: "Inter_400Regular",
    color: Colors.textSecondary,
    lineHeight: 17,
    marginTop: Spacing.sm,
  },
  panelFootMuted: {
    fontSize: FontSizes.xs,
    fontFamily: "Inter_400Regular",
    color: Colors.textTertiary,
    lineHeight: 17,
    marginTop: 6,
  },
  ctaSection: {
    width: "100%",
    alignItems: "center",
    gap: Spacing.sm,
    paddingTop: Spacing.xs,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Colors.border,
  },
  ctaLabel: {
    fontSize: FontSizes.sm,
    fontFamily: "Inter_500Medium",
    color: Colors.textSecondary,
    letterSpacing: 0.15,
    marginTop: Spacing.sm,
  },
  ctaScaleWrap: {
    width: "100%",
  },
  ctaBtn: {
    width: "100%",
    backgroundColor: Colors.primary,
    borderRadius: Radii.button + 4,
    paddingVertical: 15,
    alignItems: "center",
    shadowColor: Colors.primaryDark,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.28,
    shadowRadius: 10,
    elevation: 6,
  },
  ctaText: {
    fontSize: FontSizes.sm + 1,
    fontFamily: "Inter_500Medium",
    color: "#fff",
    letterSpacing: 0.15,
    textAlign: "center",
  },
  dismissBtn: {
    paddingVertical: 4,
    paddingHorizontal: Spacing.lg,
    alignItems: "center",
  },
  dismissText: {
    fontSize: FontSizes.sm,
    fontFamily: "Inter_400Regular",
    color: Colors.textTertiary,
    textAlign: "center",
  },
  dismissSub: {
    fontSize: FontSizes.xs,
    fontFamily: "Inter_400Regular",
    color: Colors.textTertiary,
    textAlign: "center",
    opacity: 0.85,
    marginTop: 4,
    lineHeight: 16,
    paddingHorizontal: Spacing.sm,
  },
  restoreWrap: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
  },
  restoreText: {
    fontSize: FontSizes.sm,
    fontFamily: "Inter_500Medium",
    color: Colors.primary,
    textAlign: "center",
    textDecorationLine: "underline",
  },
  disclaimer: {
    fontSize: 10,
    fontFamily: "Inter_400Regular",
    color: Colors.textTertiary,
    textAlign: "center",
    lineHeight: 15,
    paddingHorizontal: Spacing.xs,
    marginBottom: Spacing.xs,
  },
  legalLinks: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    alignItems: "center",
    gap: 4,
    marginTop: 4,
  },
  legalLinkText: {
    fontSize: 10,
    fontFamily: "Inter_500Medium",
    color: Colors.primary,
  },
  legalDot: {
    fontSize: 10,
    color: Colors.textTertiary,
  },
});
