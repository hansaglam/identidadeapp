import React, { useState } from "react";
import {
  View, Text, StyleSheet, Modal, TouchableOpacity, Alert,
} from "react-native";
import { X, Sparkles, Shield, TrendingUp, AlertTriangle, Eye } from "lucide-react-native";
import { useUserStore } from "../store/userStore";
import { useIAPStore, IAP_PRODUCTS } from "../store/iapStore";
import {
  Colors, Spacing, Radii, FontSizes,
} from "../constants/theme";

interface Props {
  visible: boolean;
  onClose: () => void;
  trigger: "journey" | "minddump" | "day22";
}

const BENEFITS = [
  {
    icon: TrendingUp,
    text: "Kişisel otomatikleşme tahmini — Gün 14'ten itibaren bilimsel regresyon",
  },
  {
    icon: AlertTriangle,
    text: "Düşüş öncesi müdahale sistemi — riskli günlerde proaktif 5 sn antrenman",
  },
  {
    icon: Eye,
    text: "Kimlik Aynası — notlarındaki kelimelerden dönüşüm raporu",
  },
  {
    icon: Shield,
    text: "66 gün sonuç garantisi — otomatikleşmezsen para iade veya 3 ay uzatma",
  },
];

export default function PremiumGateModal({ visible, onClose, trigger }: Props) {
  const { setPremium } = useUserStore();
  const { connect, loadProducts, purchase, products, isPro: isPremium, isLoading } = useIAPStore();
  const [purchasing, setPurchasing] = useState(false);

  const handlePurchase = async () => {
    setPurchasing(true);
    try {
      await connect();
      await loadProducts();
      await purchase(IAP_PRODUCTS.PRO_LIFETIME);
      if (isPremium) {
        await setPremium(true);
        onClose();
      }
    } catch {
      Alert.alert("Hata", "Satın alma işlemi tamamlanamadı. Tekrar dene.");
    } finally {
      setPurchasing(false);
    }
  };

  const product = products.find(
    (p: any) => p.productId === IAP_PRODUCTS.PRO_LIFETIME
  );
  const priceStr = product?.localizedPrice ?? "₺199";

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <X size={18} color={Colors.textTertiary} strokeWidth={1.5} />
          </TouchableOpacity>

          <View style={styles.iconWrap}>
            <Sparkles size={28} color={Colors.primary} strokeWidth={1.5} />
          </View>

          <Text style={styles.headline}>Kişisel Disiplin Programı</Text>
          <Text style={styles.sub}>
            Motivasyon değil, ölçülebilir otomatikleşme.{"\n"}
            Düşmeden önce müdahale. Bilim destekli, sonuç garantili.
          </Text>

          <View style={styles.benefits}>
            {BENEFITS.map((b, i) => {
              const Icon = b.icon;
              return (
                <View key={i} style={styles.benefit}>
                  <View style={styles.benefitIcon}>
                    <Icon size={16} color={Colors.primary} strokeWidth={1.5} />
                  </View>
                  <Text style={styles.benefitText}>{b.text}</Text>
                </View>
              );
            })}
          </View>

          <View style={styles.guaranteeBox}>
            <Shield size={16} color={Colors.gold} strokeWidth={1.5} />
            <Text style={styles.guaranteeText}>
              66 gün tamamla, otomatiklik puanın 7'nin altındaysa para iade veya 3 ay ücretsiz uzatma.
            </Text>
          </View>

          <TouchableOpacity
            style={styles.ctaBtn}
            onPress={handlePurchase}
            disabled={purchasing || isLoading}
            activeOpacity={0.8}
          >
            <Text style={styles.ctaText}>
              {purchasing || isLoading
                ? "İşleniyor..."
                : `Disiplin Programını Başlat — ${priceStr}`}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.dismissBtn} onPress={onClose}>
            <Text style={styles.dismissText}>Şimdi değil</Text>
          </TouchableOpacity>

          <Text style={styles.disclaimer}>
            Tek seferlik ödeme. Abonelik yok. Sonuç garantisi koşulları geçerlidir.
          </Text>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: Colors.overlay,
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: Spacing.xl,
    gap: Spacing.md,
    alignItems: "center",
  },
  closeBtn: {
    position: "absolute",
    top: Spacing.md,
    right: Spacing.md,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.bg,
    alignItems: "center",
    justifyContent: "center",
  },
  iconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
    marginTop: Spacing.sm,
  },
  headline: {
    fontSize: FontSizes.xxl,
    fontFamily: "Inter_500Medium",
    color: Colors.textPrimary,
    textAlign: "center",
  },
  sub: {
    fontSize: FontSizes.md,
    fontFamily: "Inter_400Regular",
    color: Colors.textSecondary,
    textAlign: "center",
    lineHeight: 22,
  },
  benefits: {
    width: "100%",
    gap: Spacing.sm,
    backgroundColor: Colors.bg,
    borderRadius: Radii.card,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.md,
  },
  benefit: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: Spacing.sm,
  },
  benefitIcon: {
    width: 28,
    height: 28,
    borderRadius: Radii.button,
    backgroundColor: Colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  benefitText: {
    flex: 1,
    fontSize: FontSizes.sm,
    fontFamily: "Inter_400Regular",
    color: Colors.textSecondary,
    lineHeight: 20,
    paddingTop: 4,
  },
  guaranteeBox: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    backgroundColor: Colors.goldLight,
    borderRadius: Radii.card,
    borderWidth: 1,
    borderColor: "rgba(212,160,23,0.2)",
    padding: Spacing.md,
  },
  guaranteeText: {
    flex: 1,
    fontSize: FontSizes.sm,
    fontFamily: "Inter_400Regular",
    color: Colors.textPrimary,
    lineHeight: 20,
  },
  ctaBtn: {
    width: "100%",
    backgroundColor: Colors.primary,
    borderRadius: Radii.button,
    paddingVertical: 16,
    alignItems: "center",
  },
  ctaText: {
    fontSize: FontSizes.md,
    fontFamily: "Inter_500Medium",
    color: "#fff",
  },
  dismissBtn: {
    paddingVertical: Spacing.sm,
  },
  dismissText: {
    fontSize: FontSizes.sm,
    fontFamily: "Inter_400Regular",
    color: Colors.textTertiary,
  },
  disclaimer: {
    fontSize: FontSizes.xs,
    fontFamily: "Inter_400Regular",
    color: Colors.textTertiary,
    textAlign: "center",
  },
});
