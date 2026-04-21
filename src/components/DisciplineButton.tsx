import React, { useRef, useCallback } from "react";
import {
  Text, StyleSheet, TouchableOpacity, Animated,
} from "react-native";
import { Spacing, Radii, FontSizes } from "../constants/theme";

const BG_PENDING = "#2c3e50";
const BG_DONE = "#27ae60";
const BORDER_ORANGE = "#f39c12";

export interface DisciplineButtonProps {
  onPress: () => void;
  isCompleted: boolean;
  isMissedYesterday: boolean;
  todayAutoRating?: number;
}

/**
 * Streaksız ana CTA: normal tamamlama, tamamlandı + otomatiklik, veya dün kaçırıldı (geri dönüş).
 */
export default function DisciplineButton({
  onPress,
  isCompleted,
  isMissedYesterday,
  todayAutoRating,
}: DisciplineButtonProps) {
  const scale = useRef(new Animated.Value(1)).current;

  const runPressInAnimation = useCallback(() => {
    scale.setValue(1);
    Animated.sequence([
      Animated.timing(scale, { toValue: 0.95, duration: 90, useNativeDriver: true }),
      Animated.timing(scale, { toValue: 1.05, duration: 120, useNativeDriver: true }),
      Animated.timing(scale, { toValue: 1, duration: 100, useNativeDriver: true }),
    ]).start(() => onPress());
  }, [scale, onPress]);

  if (isCompleted) {
    return (
      <TouchableOpacity
        style={[styles.base, styles.doneBtn]}
        onPress={onPress}
        activeOpacity={0.88}
        accessibilityRole="button"
        accessibilityLabel="Tamamlandı, geri almak veya detay için dokun"
      >
        <Text style={styles.doneTitle}>✓ Tamamlandı</Text>
        <Text style={styles.doneSub}>
          {todayAutoRating != null
            ? `Otomatiklik: ${todayAutoRating}/10`
            : "Otomatiklik kaydı yok"}
        </Text>
      </TouchableOpacity>
    );
  }

  if (isMissedYesterday) {
    return (
      <TouchableOpacity
        style={[styles.base, styles.comebackCard]}
        onPress={onPress}
        activeOpacity={0.9}
        accessibilityRole="button"
        accessibilityLabel="Geri dönüş günü, devam et"
      >
        <Text style={styles.comebackTitle}>Geri Dönüş Günü</Text>
        <Text style={styles.comebackBody}>
          1 gün kaçırmak, 66 günlük yolculuğun sadece %1.5&apos;u. Beynin hâlâ bu yolu biliyor.
        </Text>
        <Text style={styles.comebackAction}>Devam Et →</Text>
      </TouchableOpacity>
    );
  }

  return (
    <Animated.View style={[styles.animatedWrap, { transform: [{ scale }] }]}>
      <TouchableOpacity
        style={[styles.base, styles.pendingBtn]}
        onPress={runPressInAnimation}
        activeOpacity={1}
        accessibilityRole="button"
        accessibilityLabel="Disiplini uygula"
      >
        <Text style={styles.pendingTitle}>Disiplini Uygula</Text>
        <Text style={styles.pendingSub}>Motivasyona ihtiyaç yok. Sadece başla.</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  animatedWrap: { alignSelf: "stretch" },
  base: {
    borderRadius: Radii.button,
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.lg,
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  pendingBtn: {
    backgroundColor: BG_PENDING,
  },
  pendingTitle: {
    fontSize: FontSizes.lg,
    fontFamily: "Inter_500Medium",
    color: "#fff",
  },
  pendingSub: {
    fontSize: FontSizes.sm,
    fontFamily: "Inter_400Regular",
    color: "rgba(255,255,255,0.82)",
    textAlign: "center",
  },
  doneBtn: { backgroundColor: BG_DONE },
  doneTitle: {
    fontSize: FontSizes.lg,
    fontFamily: "Inter_500Medium",
    color: "#fff",
  },
  doneSub: {
    fontSize: FontSizes.xs,
    fontFamily: "Inter_400Regular",
    color: "rgba(255,255,255,0.9)",
  },
  comebackCard: {
    backgroundColor: "#fff",
    borderWidth: 2,
    borderColor: BORDER_ORANGE,
    borderStyle: "dashed",
  },
  comebackTitle: {
    fontSize: FontSizes.lg,
    fontFamily: "Inter_500Medium",
    color: "#1A1A18",
  },
  comebackBody: {
    fontSize: FontSizes.sm,
    fontFamily: "Inter_400Regular",
    color: "#6B6B67",
    textAlign: "center",
    lineHeight: 20,
  },
  comebackAction: {
    marginTop: Spacing.xs,
    fontSize: FontSizes.md,
    fontFamily: "Inter_500Medium",
    color: BORDER_ORANGE,
  },
});
