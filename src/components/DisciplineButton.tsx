import React, { useRef, useCallback } from "react";
import {
  Text, StyleSheet, TouchableOpacity, Animated,
} from "react-native";
import { Spacing, Radii, FontSizes, Colors, Shadows } from "../constants/theme";

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
      Animated.timing(scale, { toValue: 0.97, duration: 90, useNativeDriver: true }),
      Animated.timing(scale, { toValue: 1.02, duration: 120, useNativeDriver: true }),
      Animated.timing(scale, { toValue: 1, duration: 100, useNativeDriver: true }),
    ]).start();
  }, [scale]);

  const onPendingPress = useCallback(() => {
    runPressInAnimation();
    onPress();
  }, [runPressInAnimation, onPress]);

  if (isCompleted) {
    return (
      <TouchableOpacity
        style={[styles.base, styles.doneBtn, Shadows.soft]}
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
        style={[styles.base, styles.comebackCard, Shadows.soft]}
        onPress={onPress}
        activeOpacity={0.9}
        accessibilityRole="button"
        accessibilityLabel="Geri dönüş günü, devam et"
      >
        <Text style={styles.comebackTitle}>Geri dönüş günü</Text>
        <Text style={styles.comebackBody}>
          1 gün kaçırmak, 66 günlük yolculuğun sadece %1.5&apos;u. Beynin hâlâ bu yolu biliyor.
        </Text>
        <Text style={styles.comebackAction}>Devam et →</Text>
      </TouchableOpacity>
    );
  }

  return (
    <Animated.View style={[styles.animatedWrap, { transform: [{ scale }] }]}>
      <TouchableOpacity
        style={[styles.base, styles.pendingBtn, Shadows.soft]}
        onPress={onPendingPress}
        activeOpacity={1}
        accessibilityRole="button"
        accessibilityLabel="Disiplini uygula"
      >
        <Text style={styles.pendingTitle}>Disiplini uygula</Text>
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
    gap: 8,
  },
  pendingBtn: {
    backgroundColor: Colors.ink,
  },
  pendingTitle: {
    fontSize: FontSizes.lg,
    fontFamily: "Inter_500Medium",
    color: "#fff",
  },
  pendingSub: {
    fontSize: FontSizes.sm,
    fontFamily: "Inter_400Regular",
    color: "rgba(255,255,255,0.88)",
    textAlign: "center",
    lineHeight: 20,
  },
  doneBtn: { backgroundColor: Colors.primary },
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
    backgroundColor: Colors.surfaceMuted,
    borderWidth: 1,
    borderColor: "rgba(184, 137, 46, 0.28)",
  },
  comebackTitle: {
    fontSize: FontSizes.md,
    fontFamily: "Inter_500Medium",
    color: Colors.textPrimary,
  },
  comebackBody: {
    fontSize: FontSizes.sm,
    fontFamily: "Inter_400Regular",
    color: Colors.textSecondary,
    textAlign: "center",
    lineHeight: 21,
  },
  comebackAction: {
    marginTop: Spacing.xs,
    fontSize: FontSizes.sm,
    fontFamily: "Inter_500Medium",
    color: Colors.gold,
  },
});
