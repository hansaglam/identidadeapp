/**
 * InterruptModal — zorunlu aksiyon akışı.
 *
 * forced=true  → geri tuşu engellenir, Kapat yok, tam karartma
 * forced=false → sağ üst Kapat var
 *
 * Akış:
 *   countdown (3-2-1, nabız + haptic)
 *   → action  (süre geri sayımı)
 *   → done    (flash text, otomatik kapanır)
 */

import React, { useEffect, useRef, useState, useCallback } from "react";
import {
  Animated,
  BackHandler,
  Easing,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  Vibration,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { X, Check, Zap } from "lucide-react-native";
import { Action, MUSCLE_LABELS } from "../engine";
import { Colors, FontSizes, Radii, Spacing } from "../constants/theme";

interface Props {
  visible: boolean;
  action: Action | null;
  /** true → geri tuşu engellenir, Kapat gizlenir */
  forced?: boolean;
  onDone: () => void;
  onClose?: () => void;
}

type Phase = "countdown" | "action" | "done";

const FLASH_MESSAGES = [
  "İyi, devam.",
  "Kas çalıştı.",
  "Bir adım attın.",
];

export default function InterruptModal({
  visible,
  action,
  forced = false,
  onDone,
  onClose,
}: Props) {
  const [phase, setPhase] = useState<Phase>("countdown");
  const [count, setCount] = useState(3);
  const [actionLeft, setActionLeft] = useState(0);
  const [flashMsg] = useState(
    () => FLASH_MESSAGES[Math.floor(Math.random() * FLASH_MESSAGES.length)]!
  );

  // Animations
  const pulseScale = useRef(new Animated.Value(1)).current;
  const countScale = useRef(new Animated.Value(1)).current;
  const flashOpacity = useRef(new Animated.Value(0)).current;
  const flashTranslate = useRef(new Animated.Value(10)).current;

  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const actionRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pulseRef = useRef<Animated.CompositeAnimation | null>(null);

  // ── Pulse (heartbeat) ──────────────────────────────────────────────────────
  const startPulse = useCallback(() => {
    pulseRef.current?.stop();
    pulseRef.current = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseScale, {
          toValue: 1.06,
          duration: 480,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseScale, {
          toValue: 1,
          duration: 520,
          easing: Easing.in(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );
    pulseRef.current.start();
  }, [pulseScale]);

  const stopPulse = useCallback(() => {
    pulseRef.current?.stop();
    pulseScale.setValue(1);
  }, [pulseScale]);

  // ── Countdown number pop ───────────────────────────────────────────────────
  const popCount = useCallback(() => {
    countScale.setValue(1.4);
    Animated.spring(countScale, {
      toValue: 1,
      friction: 5,
      tension: 200,
      useNativeDriver: true,
    }).start();
  }, [countScale]);

  // ── Done flash text ────────────────────────────────────────────────────────
  const playFlash = useCallback(() => {
    flashOpacity.setValue(0);
    flashTranslate.setValue(10);
    Animated.parallel([
      Animated.timing(flashOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(flashTranslate, {
        toValue: 0,
        duration: 300,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
    ]).start();
  }, [flashOpacity, flashTranslate]);

  // ── Android hardware back ──────────────────────────────────────────────────
  useEffect(() => {
    if (!visible || !forced) return;
    const sub = BackHandler.addEventListener("hardwareBackPress", () => true);
    return () => sub.remove();
  }, [visible, forced]);

  // ── Countdown phase ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!visible || !action) return;
    setPhase("countdown");
    setCount(3);
    setActionLeft(action.duration);
    startPulse();
    popCount();

    let i = 3;
    tickRef.current = setInterval(() => {
      // Tick haptic + vibration
      if (Platform.OS !== "web") {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        Vibration.vibrate(30);
      }

      i -= 1;
      setCount(i);
      popCount();

      if (i <= 0) {
        if (tickRef.current) clearInterval(tickRef.current);
        // Launch haptic
        if (Platform.OS !== "web") {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
          Vibration.vibrate(60);
        }
        setPhase("action");
      }
    }, 1000);

    return () => {
      if (tickRef.current) clearInterval(tickRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, action]);

  // ── Action phase ───────────────────────────────────────────────────────────
  useEffect(() => {
    if (phase !== "action" || !action) return;

    actionRef.current = setInterval(() => {
      setActionLeft((s) => {
        if (s <= 1) {
          if (actionRef.current) clearInterval(actionRef.current);
          stopPulse();
          if (Platform.OS !== "web") {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            Vibration.vibrate([0, 50, 80, 50]);
          }
          setPhase("done");
          return 0;
        }
        return s - 1;
      });
    }, 1000);

    return () => {
      if (actionRef.current) clearInterval(actionRef.current);
    };
  }, [phase, action, stopPulse]);

  // ── Done phase: flash + auto-close ────────────────────────────────────────
  useEffect(() => {
    if (phase !== "done") return;
    playFlash();
    const t = setTimeout(() => {
      onDone();
    }, 2000);
    return () => clearTimeout(t);
  }, [phase, onDone, playFlash]);

  // ── Cleanup on hide ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!visible) {
      if (tickRef.current) clearInterval(tickRef.current);
      if (actionRef.current) clearInterval(actionRef.current);
      stopPulse();
    }
  }, [visible, stopPulse]);

  if (!action) return null;

  return (
    <Modal
      visible={visible}
      animationType="fade"
      statusBarTranslucent
      onRequestClose={forced ? undefined : onClose}
    >
      <SafeAreaView style={styles.root} edges={["top", "bottom"]}>
        {/* Kapat — sadece forced=false iken */}
        {!forced && (
          <TouchableOpacity
            style={styles.closeBtn}
            onPress={onClose}
            hitSlop={14}
          >
            <X size={20} color="rgba(255,255,255,0.55)" strokeWidth={2} />
          </TouchableOpacity>
        )}

        {/* Forced badge */}
        {forced && (
          <View style={styles.forcedBadge}>
            <Zap size={12} color={Colors.coral} strokeWidth={2.5} />
            <Text style={styles.forcedText}>Zorunlu adım</Text>
          </View>
        )}

        <View style={styles.center}>
          {/* ── COUNTDOWN ─────────────────────────────────────── */}
          {phase === "countdown" && (
            <Animated.View
              style={[styles.pulseWrap, { transform: [{ scale: pulseScale }] }]}
            >
              <Text style={styles.label}>Hazırlan</Text>
              <Animated.Text
                style={[
                  styles.countdown,
                  { transform: [{ scale: countScale }] },
                ]}
              >
                {count > 0 ? count : ""}
              </Animated.Text>
              <Text style={styles.upNext}>{action.title}</Text>
            </Animated.View>
          )}

          {/* ── ACTION ─────────────────────────────────────────── */}
          {phase === "action" && (
            <Animated.View
              style={[styles.pulseWrap, { transform: [{ scale: pulseScale }] }]}
            >
              <Text style={styles.label}>
                {MUSCLE_LABELS[action.type].toUpperCase()} · ŞİMDİ
              </Text>
              <Text style={styles.actionTitle}>{action.title}</Text>
              <Text style={styles.duration}>{actionLeft} sn</Text>

              {/* Manuel erken tamamlama — forced değilse */}
              {!forced && (
                <Pressable style={styles.earlyDoneBtn} onPress={onDone}>
                  <Text style={styles.earlyDoneText}>Yaptım</Text>
                </Pressable>
              )}
            </Animated.View>
          )}

          {/* ── DONE ───────────────────────────────────────────── */}
          {phase === "done" && (
            <View style={styles.doneWrap}>
              <View style={styles.checkCircle}>
                <Check size={38} color="#fff" strokeWidth={2.5} />
              </View>

              <Animated.Text
                style={[
                  styles.flashText,
                  {
                    opacity: flashOpacity,
                    transform: [{ translateY: flashTranslate }],
                  },
                ]}
              >
                {flashMsg}
              </Animated.Text>

              <Text style={styles.muscleNote}>
                {MUSCLE_LABELS[action.type]} kasın çalıştı.
              </Text>
            </View>
          )}
        </View>
      </SafeAreaView>
    </Modal>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#0B0D10",
  },
  closeBtn: {
    position: "absolute",
    top: 16,
    right: 16,
    padding: 12,
    zIndex: 20,
  },
  forcedBadge: {
    position: "absolute",
    top: 20,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    zIndex: 20,
  },
  forcedText: {
    color: Colors.coral,
    fontSize: FontSizes.xs,
    fontFamily: "Inter_500Medium",
    textTransform: "uppercase",
    letterSpacing: 1.5,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: Spacing.xl,
  },
  pulseWrap: {
    alignItems: "center",
  },
  label: {
    fontSize: FontSizes.sm,
    fontFamily: "Inter_500Medium",
    color: "rgba(255,255,255,0.45)",
    textTransform: "uppercase",
    letterSpacing: 2.5,
    marginBottom: Spacing.lg,
    textAlign: "center",
  },
  countdown: {
    fontSize: 124,
    fontFamily: "Inter_500Medium",
    color: "#FFFFFF",
    lineHeight: 132,
    textAlign: "center",
  },
  upNext: {
    marginTop: Spacing.lg,
    fontSize: FontSizes.md,
    color: "rgba(255,255,255,0.4)",
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    maxWidth: 260,
  },
  actionTitle: {
    fontSize: FontSizes.hero,
    fontFamily: "Inter_500Medium",
    color: "#FFFFFF",
    textAlign: "center",
    lineHeight: 48,
    marginBottom: Spacing.lg,
  },
  duration: {
    fontSize: FontSizes.xxxl,
    color: "rgba(255,255,255,0.55)",
    fontFamily: "Inter_400Regular",
    textAlign: "center",
  },
  earlyDoneBtn: {
    marginTop: Spacing.xl,
    backgroundColor: "rgba(255,255,255,0.10)",
    paddingVertical: 14,
    paddingHorizontal: Spacing.xl,
    borderRadius: Radii.button,
  },
  earlyDoneText: {
    color: "#fff",
    fontSize: FontSizes.md,
    fontFamily: "Inter_500Medium",
  },
  doneWrap: {
    alignItems: "center",
    gap: Spacing.md,
  },
  checkCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.sm,
  },
  flashText: {
    fontSize: FontSizes.xxl,
    fontFamily: "Inter_500Medium",
    color: "#FFFFFF",
    textAlign: "center",
  },
  muscleNote: {
    fontSize: FontSizes.md,
    color: "rgba(255,255,255,0.45)",
    fontFamily: "Inter_400Regular",
    textAlign: "center",
  },
});
