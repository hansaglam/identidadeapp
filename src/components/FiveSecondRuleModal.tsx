import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  View, Text, StyleSheet, Modal, Animated, TouchableOpacity,
} from "react-native";
import * as Haptics from "expo-haptics";
import { Colors, Spacing, Radii, FontSizes } from "../constants/theme";
import { useUserStore } from "../store/userStore";

interface Props {
  visible: boolean;
  onClose: () => void;
  actionText: string;
}

type Phase = "intro" | "countdown" | "action" | "done";

export default function FiveSecondRuleModal({ visible, onClose, actionText }: Props) {
  const hapticsEnabled = useUserStore((s) => s.profile?.hapticsEnabled ?? true);

  const [phase, setPhase] = useState<Phase>("intro");
  const [count, setCount] = useState(5);
  const scale = useRef(new Animated.Value(1)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const actionOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!visible) {
      setPhase("intro");
      setCount(5);
      scale.setValue(1);
      opacity.setValue(0);
      actionOpacity.setValue(0);
    }
  }, [visible]);

  const pulseNumber = useCallback(() => {
    scale.setValue(1.4);
    opacity.setValue(1);
    Animated.parallel([
      Animated.timing(scale, { toValue: 1, duration: 700, useNativeDriver: true }),
      Animated.sequence([
        Animated.delay(500),
        Animated.timing(opacity, { toValue: 0.3, duration: 200, useNativeDriver: true }),
      ]),
    ]).start();
  }, [scale, opacity]);

  useEffect(() => {
    if (phase !== "countdown") return;

    if (count <= 0) {
      setPhase("action");
      if (hapticsEnabled) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      Animated.timing(actionOpacity, { toValue: 1, duration: 400, useNativeDriver: true }).start();
      return;
    }

    pulseNumber();
    if (hapticsEnabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    const timer = setTimeout(() => setCount((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [phase, count]);

  const startCountdown = () => {
    setPhase("countdown");
    setCount(5);
  };

  const handleDone = () => {
    setPhase("done");
    if (hapticsEnabled) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    setTimeout(onClose, 800);
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.sheet}>

          {phase === "intro" && (
            <View style={styles.introContainer}>
              <Text style={styles.introEmoji}>🧠</Text>
              <Text style={styles.introTitle}>Disiplin Antrenmanı</Text>
              <Text style={styles.introSub}>
                Yapmak istemiyorsun — tamam. Ama beynin karar vermeden önce
                sana 5 saniye veriyor. Bu pencereyi kullan.
              </Text>
              <TouchableOpacity style={styles.startBtn} onPress={startCountdown} activeOpacity={0.8}>
                <Text style={styles.startBtnText}>Hazırım, başlat →</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={onClose}>
                <Text style={styles.skipText}>Şimdi değil</Text>
              </TouchableOpacity>
            </View>
          )}

          {phase === "countdown" && (
            <View style={styles.countdownContainer}>
              <Text style={styles.countdownLabel}>HAREKETE GEÇ</Text>
              <Animated.Text
                style={[
                  styles.countdownNumber,
                  { transform: [{ scale }], opacity },
                ]}
              >
                {count}
              </Animated.Text>
              <Text style={styles.countdownHint}>
                {count > 3
                  ? "Hazırlan..."
                  : count > 1
                    ? "Neredeyse..."
                    : "ŞİMDİ!"}
              </Text>
            </View>
          )}

          {phase === "action" && (
            <Animated.View style={[styles.actionContainer, { opacity: actionOpacity }]}>
              <Text style={styles.actionEmoji}>⚡</Text>
              <Text style={styles.actionText}>{actionText}</Text>
              <Text style={styles.actionSub}>
                Düşünme. Sadece yap. Beynin 5 saniye sonra bahane üretir.
              </Text>
              <TouchableOpacity style={styles.doneBtn} onPress={handleDone} activeOpacity={0.8}>
                <Text style={styles.doneBtnText}>Yaptım!</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={onClose}>
                <Text style={styles.skipText}>Kapat</Text>
              </TouchableOpacity>
            </Animated.View>
          )}

        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1, backgroundColor: "rgba(0,0,0,0.85)",
    justifyContent: "center", alignItems: "center",
  },
  sheet: {
    width: "88%", backgroundColor: Colors.surface,
    borderRadius: 20, overflow: "hidden",
  },
  introContainer: { padding: Spacing.xl, alignItems: "center", gap: Spacing.md },
  introEmoji: { fontSize: 48 },
  introTitle: {
    fontSize: FontSizes.xxl, fontFamily: "Inter_500Medium",
    color: Colors.textPrimary, textAlign: "center",
  },
  introSub: {
    fontSize: FontSizes.md, fontFamily: "Inter_400Regular",
    color: Colors.textSecondary, textAlign: "center", lineHeight: 22,
  },
  startBtn: {
    backgroundColor: Colors.primary, borderRadius: Radii.button,
    paddingVertical: 14, paddingHorizontal: Spacing.xl, width: "100%", alignItems: "center",
    marginTop: Spacing.sm,
  },
  startBtnText: { fontSize: FontSizes.md, fontFamily: "Inter_500Medium", color: "#fff" },
  skipText: {
    fontSize: FontSizes.sm, fontFamily: "Inter_400Regular",
    color: Colors.textTertiary, marginTop: Spacing.sm,
  },

  countdownContainer: { padding: Spacing.xxl, alignItems: "center", gap: Spacing.md },
  countdownLabel: {
    fontSize: FontSizes.sm, fontFamily: "Inter_500Medium",
    color: Colors.coral, letterSpacing: 2, textTransform: "uppercase",
  },
  countdownNumber: {
    fontSize: 96, fontFamily: "Inter_500Medium", color: Colors.textPrimary,
  },
  countdownHint: {
    fontSize: FontSizes.lg, fontFamily: "Inter_400Regular",
    color: Colors.textSecondary,
  },

  actionContainer: { padding: Spacing.xl, alignItems: "center", gap: Spacing.md },
  actionEmoji: { fontSize: 48 },
  actionText: {
    fontSize: FontSizes.xl, fontFamily: "Inter_500Medium",
    color: Colors.textPrimary, textAlign: "center", lineHeight: 28,
  },
  actionSub: {
    fontSize: FontSizes.md, fontFamily: "Inter_400Regular",
    color: Colors.textSecondary, textAlign: "center", lineHeight: 22,
  },
  doneBtn: {
    backgroundColor: Colors.primary, borderRadius: Radii.button,
    paddingVertical: 14, paddingHorizontal: Spacing.xl, width: "100%", alignItems: "center",
    marginTop: Spacing.sm,
  },
  doneBtnText: { fontSize: FontSizes.md, fontFamily: "Inter_500Medium", color: "#fff" },
});
