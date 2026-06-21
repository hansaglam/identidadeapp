import React, { useState, useRef, useEffect, useMemo } from "react";
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
  ScrollView,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import {
  X,
  Sparkles,
  Map,
  ScanFace,
  BarChart3,
  PenLine,
} from "lucide-react-native";
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
import { trackEvent } from "../utils/analytics";
import { PRIVACY_POLICY_URL, TERMS_URL } from "../constants/appLinks";

interface Props {
  visible: boolean;
  onClose: () => void;
  trigger: "journey" | "minddump" | "day7" | "day22" | "profile";
}

const BENEFIT_ICONS = [Map, Sparkles, ScanFace, BarChart3, PenLine] as const;

type BenefitItem = { title: string; desc: string };

export default function PremiumGateModal({ visible, onClose, trigger }: Props) {
  const { t, i18n } = useTranslation();
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

  const benefitItems = useMemo(() => {
    const raw = t("premium.benefitItems", { returnObjects: true });
    if (Array.isArray(raw) && raw.length > 0) {
      return raw as BenefitItem[];
    }
    const lines = t("premium.benefits", { returnObjects: true });
    if (Array.isArray(lines)) {
      return (lines as string[]).map((line) => {
        const [title, ...rest] = line.split(" — ");
        return { title: title ?? line, desc: rest.join(" — ") || "" };
      });
    }
    return [];
  }, [t, i18n.language]);

  const triggerText = useMemo(() => {
    const key = `premium.triggers.${trigger}`;
    const v = t(key);
    return v !== key ? v : null;
  }, [trigger, t, i18n.language]);

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
    if (!visible || profilePremium) return;
    let cancelled = false;
    void (async () => {
      try {
        await connect();
        if (!cancelled) await loadProducts();
      } catch {
        /* fallbacks shown until store responds */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [visible, profilePremium, connect, loadProducts]);

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
    (p: { id?: string }) => p.id === IAP_PRODUCTS.PRO_MONTHLY
  );
  const priceStr =
    (product as { displayPrice?: string; localizedPrice?: string } | undefined)
      ?.displayPrice ??
    (product as { localizedPrice?: string } | undefined)?.localizedPrice ??
    null;
  const subscriptionTitle =
    (product as { title?: string; displayName?: string } | undefined)?.title ??
    (product as { displayName?: string } | undefined)?.displayName ??
    t("premium.subscriptionTitle");
  const subscriptionPriceLine =
    priceStr != null
      ? t("premium.subscriptionPriceLine", { price: priceStr })
      : isLoading
        ? t("premium.subscriptionPriceLoading")
        : t("premium.subscriptionPriceUnavailable");

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

  const sheetPadBottom = Math.max(Spacing.sm, insets.bottom + 4);

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
              <TouchableOpacity
                style={styles.closeBtn}
                onPress={onClose}
                hitSlop={8}
                accessibilityLabel={t("common.close")}
              >
                <X size={18} color={Colors.textTertiary} strokeWidth={1.5} />
              </TouchableOpacity>

              <View style={styles.handle} />

              <ScrollView
                showsVerticalScrollIndicator={false}
                bounces={false}
                contentContainerStyle={styles.scrollContent}
              >
                <View style={styles.headerRow}>
                  <View style={styles.iconWrap}>
                    <Sparkles size={20} color={Colors.primary} strokeWidth={1.8} />
                  </View>
                  <View style={styles.headerText}>
                    <Text style={styles.headline}>{t("premium.headline")}</Text>
                    <Text style={styles.tagline}>{t("premium.tagline")}</Text>
                  </View>
                </View>

                {triggerText ? (
                  <View style={styles.triggerChip}>
                    <Text style={styles.triggerChipText}>{triggerText}</Text>
                  </View>
                ) : null}

                <Text style={styles.panelLabel}>{t("premium.panelLabel")}</Text>
                <View style={styles.benefitsGrid}>
                  {benefitItems.map((item, i) => {
                    const Icon = BENEFIT_ICONS[i] ?? Sparkles;
                    return (
                      <View key={`${item.title}-${i}`} style={styles.benefitCard}>
                        <View style={styles.benefitIconWrap}>
                          <Icon size={14} color={Colors.primary} strokeWidth={2} />
                        </View>
                        <Text style={styles.benefitTitle} numberOfLines={1}>
                          {item.title}
                        </Text>
                        <Text style={styles.benefitDesc} numberOfLines={2}>
                          {item.desc}
                        </Text>
                      </View>
                    );
                  })}
                </View>

                <Text style={styles.commitmentLine}>{t("premium.commitmentEffect")}</Text>

                <View style={styles.footnoteBox}>
                  <Text style={styles.footnoteText}>{t("premium.investmentFootnote")}</Text>
                </View>

                <View
                  style={styles.subscriptionDisclosure}
                  accessibilityRole="summary"
                  accessibilityLabel={`${subscriptionTitle}. ${t("premium.subscriptionLength")}. ${subscriptionPriceLine}`}
                >
                  <Text style={styles.subscriptionDisclosureLabel}>
                    {t("premium.subscriptionDisclosureLabel")}
                  </Text>
                  <Text style={styles.subscriptionTitle}>{subscriptionTitle}</Text>
                  <Text style={styles.subscriptionLength}>{t("premium.subscriptionLength")}</Text>
                  <Text style={styles.subscriptionPrice}>{subscriptionPriceLine}</Text>
                </View>

                <Animated.View
                  style={[styles.ctaScaleWrap, { transform: [{ scale: ctaScale }] }]}
                >
                  <TouchableOpacity
                    style={styles.ctaBtn}
                    onPress={handlePurchase}
                    onPressIn={ctaPressIn}
                    onPressOut={ctaPressOut}
                    disabled={purchasing || isLoading}
                    activeOpacity={1}
                    accessibilityLabel={t("premium.ctaButton")}
                    accessibilityRole="button"
                  >
                    <Text style={styles.ctaText}>
                      {purchasing
                        ? t("common.loading")
                        : priceStr != null
                          ? t("premium.ctaButtonWithPrice", { price: priceStr })
                          : t("premium.ctaButtonSubscribe")}
                    </Text>
                  </TouchableOpacity>
                </Animated.View>

                <TouchableOpacity
                  style={styles.dismissBtn}
                  onPress={onClose}
                  accessibilityLabel={t("premium.dismiss")}
                >
                  <Text style={styles.dismissText}>{t("premium.dismiss")}</Text>
                  <Text style={styles.dismissSub}>{t("premium.dismissSub")}</Text>
                </TouchableOpacity>

                <Text style={styles.freeNote}>{t("premium.freeNote")}</Text>

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
                    <Text style={styles.legalLinkText}>{t("premium.legalPrivacy")}</Text>
                  </TouchableOpacity>
                  <Text style={styles.legalDot}>·</Text>
                  <TouchableOpacity onPress={() => void Linking.openURL(TERMS_URL)}>
                    <Text style={styles.legalLinkText}>{t("premium.legalTerms")}</Text>
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
                <Text style={styles.extensionNote}>{t("premium.extensionNote")}</Text>
              </ScrollView>
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
    maxHeight: "88%",
  },
  sheet: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.xs,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 16,
  },
  scrollContent: {
    paddingBottom: Spacing.xs,
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
    top: Spacing.sm,
    right: Spacing.sm,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.bg,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: Spacing.sm,
    marginTop: Spacing.sm,
    marginBottom: Spacing.sm,
    paddingRight: 36,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
  },
  headerText: {
    flex: 1,
    gap: 4,
  },
  headline: {
    fontSize: FontSizes.lg,
    fontFamily: "Inter_600SemiBold",
    fontWeight: "600",
    color: Colors.textPrimary,
    letterSpacing: -0.3,
    lineHeight: 22,
  },
  tagline: {
    fontSize: FontSizes.sm,
    fontFamily: "Inter_400Regular",
    color: Colors.textSecondary,
    lineHeight: 19,
  },
  triggerChip: {
    alignSelf: "stretch",
    backgroundColor: Colors.primaryLight,
    borderRadius: Radii.button,
    paddingVertical: 8,
    paddingHorizontal: Spacing.sm,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: "rgba(47, 156, 134, 0.15)",
  },
  triggerChipText: {
    fontSize: FontSizes.xs,
    fontFamily: "Inter_400Regular",
    color: Colors.textSecondary,
    lineHeight: 17,
    textAlign: "center",
  },
  panelLabel: {
    fontSize: 10,
    fontFamily: "Inter_600SemiBold",
    fontWeight: "600",
    color: Colors.textTertiary,
    marginBottom: 8,
    letterSpacing: 0.6,
    textTransform: "uppercase",
  },
  benefitsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: Spacing.sm,
  },
  benefitCard: {
    width: "48%",
    flexGrow: 1,
    flexBasis: "46%",
    backgroundColor: Colors.bg,
    borderRadius: Radii.card,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingVertical: 10,
    paddingHorizontal: 10,
    minHeight: 72,
  },
  benefitIconWrap: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: Colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
  },
  benefitTitle: {
    fontSize: FontSizes.xs + 1,
    fontFamily: "Inter_600SemiBold",
    fontWeight: "600",
    color: Colors.textPrimary,
    lineHeight: 16,
    marginBottom: 2,
  },
  benefitDesc: {
    fontSize: 10,
    fontFamily: "Inter_400Regular",
    color: Colors.textTertiary,
    lineHeight: 14,
  },
  commitmentLine: {
    fontSize: 10,
    fontFamily: "Inter_400Regular",
    color: Colors.textTertiary,
    textAlign: "center",
    lineHeight: 14,
    marginBottom: Spacing.xs,
    paddingHorizontal: Spacing.xs,
  },
  footnoteBox: {
    borderLeftWidth: 2,
    borderLeftColor: Colors.primary,
    backgroundColor: Colors.bg,
    borderRadius: Radii.button,
    paddingVertical: 10,
    paddingHorizontal: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  footnoteText: {
    fontSize: FontSizes.xs,
    fontFamily: "Inter_400Regular",
    fontStyle: "italic",
    color: Colors.textSecondary,
    lineHeight: 17,
  },
  subscriptionDisclosure: {
    backgroundColor: Colors.bg,
    borderRadius: Radii.card,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingVertical: 12,
    paddingHorizontal: Spacing.sm,
    marginBottom: Spacing.sm,
    alignItems: "center",
  },
  subscriptionDisclosureLabel: {
    fontSize: 9,
    fontFamily: "Inter_600SemiBold",
    fontWeight: "600",
    color: Colors.textTertiary,
    letterSpacing: 0.5,
    textTransform: "uppercase",
    marginBottom: 6,
  },
  subscriptionTitle: {
    fontSize: FontSizes.md,
    fontFamily: "Inter_600SemiBold",
    fontWeight: "600",
    color: Colors.textPrimary,
    textAlign: "center",
    lineHeight: 22,
  },
  subscriptionLength: {
    fontSize: FontSizes.xs,
    fontFamily: "Inter_400Regular",
    color: Colors.textSecondary,
    textAlign: "center",
    marginTop: 4,
    lineHeight: 16,
  },
  subscriptionPrice: {
    fontSize: FontSizes.lg,
    fontFamily: "Inter_600SemiBold",
    fontWeight: "600",
    color: Colors.primary,
    textAlign: "center",
    marginTop: 6,
    lineHeight: 24,
  },
  ctaScaleWrap: {
    width: "100%",
    marginBottom: 4,
  },
  ctaBtn: {
    width: "100%",
    backgroundColor: Colors.primary,
    borderRadius: Radii.button + 2,
    paddingVertical: 14,
    alignItems: "center",
    shadowColor: Colors.primaryDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.22,
    shadowRadius: 8,
    elevation: 5,
  },
  ctaText: {
    fontSize: FontSizes.sm + 1,
    fontFamily: "Inter_600SemiBold",
    fontWeight: "600",
    color: "#fff",
    letterSpacing: 0.1,
    textAlign: "center",
  },
  dismissBtn: {
    paddingVertical: 6,
    alignItems: "center",
  },
  dismissText: {
    fontSize: FontSizes.sm,
    fontFamily: "Inter_500Medium",
    color: Colors.textTertiary,
    textAlign: "center",
  },
  dismissSub: {
    fontSize: FontSizes.xs,
    fontFamily: "Inter_400Regular",
    color: Colors.textTertiary,
    textAlign: "center",
    marginTop: 2,
  },
  freeNote: {
    fontSize: 10,
    fontFamily: "Inter_400Regular",
    color: Colors.textTertiary,
    textAlign: "center",
    lineHeight: 14,
    marginBottom: 4,
    paddingHorizontal: Spacing.sm,
  },
  restoreWrap: {
    paddingVertical: 6,
    paddingHorizontal: Spacing.md,
    alignSelf: "center",
  },
  restoreText: {
    fontSize: FontSizes.xs,
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
    lineHeight: 14,
    marginTop: 4,
  },
  legalLinks: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    alignItems: "center",
    gap: 4,
    marginTop: 6,
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
  extensionNote: {
    fontSize: 9,
    fontFamily: "Inter_400Regular",
    color: Colors.textTertiary,
    textAlign: "center",
    lineHeight: 13,
    marginTop: 8,
    opacity: 0.85,
    paddingHorizontal: Spacing.xs,
  },
});
