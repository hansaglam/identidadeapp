import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Pressable,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { X } from "lucide-react-native";
import { Colors, Spacing, Radii, FontSizes } from "../constants/theme";

interface Props {
  visible: boolean;
  onClose: () => void;
}

const BULLETS = [
  "Tüm kişisel veriler (profil, check-in geçmişi, Zihin notların) bu cihazda saklanır; sunucuya gönderilmez.",
  "Hesap e-postası yok — uygulama cihaza bağlıdır. Telefonu kaybetmek veya uygulamayı silmek verilerini kalıcı silebilir; mağaza yedeği oluşturmaz.",
  "\"Verileri Sil\" seçeneği her şeyi bu cihazdan kaldırır; geri alınamaz.",
  "Şimdi yap önerileri: metinleri okuyan yapay zekâ yoktur; seçili kelime kalıplarına göre kural tabanlı sinyal kullanılır.",
] as const;

export default function PrivacyDataModal({ visible, onClose }: Props) {
  const insets = useSafeAreaInsets();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.backdrop} onPress={onClose}>
        <View style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, Spacing.md) }]}>
          <Pressable onPress={(e) => e.stopPropagation()}>
            <View style={styles.header}>
              <Text style={styles.title}>Verilerin ve gizlilik</Text>
              <TouchableOpacity onPress={onClose} style={styles.closeBtn} hitSlop={8}>
                <X size={18} color={Colors.textTertiary} strokeWidth={1.5} />
              </TouchableOpacity>
            </View>
            <ScrollView
              style={styles.scroll}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              {BULLETS.map((line, i) => (
                <Text key={i} style={styles.bullet}>
                  <Text style={styles.bulletMark}>{"\u2022 "}</Text>
                  {line}
                </Text>
              ))}
              <Text style={styles.foot}>
                Premium satın alma mağazan (Apple/Google) üzerinden faturalandırılır;
                ödeme ayrıntıları kimlik-app tarafından tutulmaz.
              </Text>
            </ScrollView>
            <TouchableOpacity style={styles.primaryBtn} onPress={onClose} activeOpacity={0.85}>
              <Text style={styles.primaryBtnText}>Tamam</Text>
            </TouchableOpacity>
          </Pressable>
        </View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: Colors.overlay,
  },
  sheet: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: Radii.card + 6,
    borderTopRightRadius: Radii.card + 6,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    maxHeight: "88%",
  },
  scroll: { maxHeight: 420 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: Spacing.md,
  },
  title: {
    flex: 1,
    fontSize: FontSizes.lg,
    fontFamily: "Inter_500Medium",
    color: Colors.textPrimary,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.bg,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  bullet: {
    fontSize: FontSizes.sm,
    fontFamily: "Inter_400Regular",
    color: Colors.textSecondary,
    lineHeight: 21,
    marginBottom: Spacing.sm,
  },
  bulletMark: {
    color: Colors.primaryDark,
    fontFamily: "Inter_500Medium",
  },
  foot: {
    fontSize: FontSizes.xs,
    fontFamily: "Inter_400Regular",
    color: Colors.textTertiary,
    lineHeight: 18,
    marginTop: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  primaryBtn: {
    marginTop: Spacing.sm,
    backgroundColor: Colors.primary,
    borderRadius: Radii.button,
    paddingVertical: 14,
    alignItems: "center",
  },
  primaryBtnText: {
    fontSize: FontSizes.md,
    fontFamily: "Inter_500Medium",
    color: "#fff",
  },
});
