/**
 * Live Action — hazırlık → aksiyon → tamamlandı.
 * Recovery: geri sayım yok; kullanıcı "Bunu yaptım" ile onaylar.
 * Diğer kas tipleri: kısa 3-2-1 + süre çubuğu.
 */

import React, { useEffect, useRef, useState, useCallback } from "react";
import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Vibration,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Check, X, Sparkles, Timer } from "lucide-react-native";
import * as Haptics from "expo-haptics";
import { Action, MUSCLE_LABELS, MuscleType } from "../engine";
import { Colors, FontSizes, Radii, Spacing } from "../constants/theme";

interface Props {
  visible: boolean;
  action: Action | null;
  onComplete: () => void;
  onCancel: () => void;
}

type Phase = "countdown" | "action" | "done";

const MUSCLE_HEADLINE: Record<MuscleType, string> = {
  activation: "Harekete geç",
  consistency: "Küçük tekrar",
  resistance: "Direnci yumuşat",
  focus: "Odağı topla",
  recovery: "Toparlanma",
};

const DONE_SUBLINE: Record<MuscleType, string> = {
  activation: "Başlatma refleksin bir tur daha güçlendi.",
  consistency: "Tutarlılık kasın kayda geçti.",
  resistance: "Direnç anında ilerledin.",
  focus: "Dikkatini tek noktaya topladın.",
  recovery: "Küçük adım bile yolu yeniden açar. İyi hisset.",
};

function isRecoveryAction(action: Action): boolean {
  return action.type === "recovery";
}

export default function LiveActionModal({
  visible,
  action,
  onComplete,
  onCancel,
}: Props) {
  const [phase, setPhase] = useState<Phase>("countdown");
  const [count, setCount] = useState(3);
  const [actionLeft, setActionLeft] = useState(0);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const actionRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearTimers = useCallback(() => {
    if (tickRef.current) {
      clearInterval(tickRef.current);
      tickRef.current = null;
    }
    if (actionRef.current) {
      clearInterval(actionRef.current);
      actionRef.current = null;
    }
  }, []);

  const actionId = action?.id;
  const actionDuration = action?.duration ?? 0;
  const actionType = action?.type;

  useEffect(() => {
    if (!visible || actionId == null || actionType == null) return;

    clearTimers();

    if (actionType === "recovery") {
      setPhase("action");
      setActionLeft(0);
      return clearTimers;
    }

    setPhase("countdown");
    setCount(3);
    setActionLeft(actionDuration);

    tickRef.current = setInterval(() => {
      setCount((c) => {
        if (c <= 1) {
          if (tickRef.current) {
            clearInterval(tickRef.current);
            tickRef.current = null;
          }
          if (Platform.OS !== "web") Vibration.vibrate(40);
          setPhase("action");
          return 0;
        }
        return c - 1;
      });
    }, 1000);

    return clearTimers;
  }, [visible, actionId, actionType, actionDuration, clearTimers]);

  useEffect(() => {
    if (phase !== "action" || actionId == null || actionType === "recovery") return;

    if (actionRef.current) clearInterval(actionRef.current);
    setActionLeft(actionDuration);

    actionRef.current = setInterval(() => {
      setActionLeft((s) => {
        if (s <= 1) {
          if (actionRef.current) {
            clearInterval(actionRef.current);
            actionRef.current = null;
          }
          if (Platform.OS !== "web") Vibration.vibrate([0, 60, 80, 60]);
          setPhase("done");
          return 0;
        }
        return s - 1;
      });
    }, 1000);

    return () => {
      if (actionRef.current) {
        clearInterval(actionRef.current);
        actionRef.current = null;
      }
    };
  }, [phase, actionId, actionType, actionDuration]);

  const handleRecoveryDone = () => {
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {
      /* ignore */
    }
    setPhase("done");
  };

  if (!action) return null;

  const recovery = isRecoveryAction(action);
  const headline = MUSCLE_HEADLINE[action.type];
  const timedProgress =
    !recovery && action.duration > 0 ? actionLeft / action.duration : 0;

  return (
    <Modal visible={visible} animationType="fade" onRequestClose={onCancel}>
      <View style={styles.wrap}>
        <LinearGradient
          colors={["#0e1614", "#141c1a", "#1a2220"]}
          start={{ x: 0.2, y: 0 }}
          end={{ x: 0.8, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        <LinearGradient
          colors={["rgba(29,158,117,0.12)", "transparent", "rgba(83,74,183,0.06)"]}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={StyleSheet.absoluteFill}
          pointerEvents="none"
        />

        <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
          <TouchableOpacity
            style={styles.closeBtn}
            onPress={onCancel}
            hitSlop={16}
            accessibilityLabel="Kapat"
          >
            <X size={20} color="rgba(255,255,255,0.75)" strokeWidth={2} />
          </TouchableOpacity>

          <View style={styles.center}>
            <View style={styles.card}>
              {phase === "countdown" && !recovery && (
                <>
                  <View style={styles.iconCircle}>
                    <Sparkles size={26} color={Colors.primary} strokeWidth={1.8} />
                  </View>
                  <Text style={styles.cardKicker}>Hazırlan</Text>
                  <Text style={styles.countdown}>{count}</Text>
                  <Text style={styles.countHint}>Ardından tek net hareket</Text>
                  <Text style={styles.previewTitle} numberOfLines={3}>
                    {action.title}
                  </Text>
                </>
              )}

              {phase === "action" && (
                <>
                  <View
                    style={[
                      styles.iconCircle,
                      recovery && styles.iconCircleWarm,
                    ]}
                  >
                    {recovery ? (
                      <Sparkles size={26} color={Colors.gold} strokeWidth={1.8} />
                    ) : (
                      <Timer size={26} color={Colors.primary} strokeWidth={1.8} />
                    )}
                  </View>
                  <Text style={styles.cardKicker}>{headline}</Text>
                  {!recovery && (
                    <Text style={styles.microLabel}>
                      {MUSCLE_LABELS[action.type]} · şimdi
                    </Text>
                  )}
                  <Text style={styles.actionTitle}>{action.title}</Text>
                  {recovery ? (
                    <>
                      <Text style={styles.recoveryHint}>
                        Kendi ritminde yap. Zorlamıyoruz — sadece tek küçük hareket.
                      </Text>
                      <TouchableOpacity
                        style={styles.primaryBtn}
                        onPress={handleRecoveryDone}
                        activeOpacity={0.9}
                      >
                        <Text style={styles.primaryBtnText}>Bunu yaptım</Text>
                      </TouchableOpacity>
                    </>
                  ) : (
                    <>
                      <View style={styles.barTrack}>
                        <View
                          style={[
                            styles.barFill,
                            { width: `${Math.max(0, timedProgress) * 100}%` },
                          ]}
                        />
                      </View>
                      <Text style={styles.durationLabel}>
                        {actionLeft} sn · nefesini koru
                      </Text>
                    </>
                  )}
                </>
              )}

              {phase === "done" && (
                <>
                  <LinearGradient
                    colors={[Colors.primary, Colors.primaryDark]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.checkCircle}
                  >
                    <Check size={34} color="#fff" strokeWidth={2.5} />
                  </LinearGradient>
                  <Text style={styles.doneText}>Tamam</Text>
                  <Text style={styles.doneSub}>{DONE_SUBLINE[action.type]}</Text>
                  <TouchableOpacity
                    style={styles.secondaryBtn}
                    onPress={onComplete}
                    activeOpacity={0.88}
                  >
                    <Text style={styles.secondaryBtnText}>Devam et</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1 },
  safe: { flex: 1 },
  closeBtn: {
    alignSelf: "flex-end",
    marginRight: Spacing.md,
    marginTop: Spacing.sm,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.08)",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xl,
  },
  card: {
    width: "100%",
    maxWidth: 400,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderRadius: Radii.card + 8,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    paddingVertical: Spacing.xl,
    paddingHorizontal: Spacing.lg,
    alignItems: "center",
    gap: Spacing.md,
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "rgba(29,158,117,0.2)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.xs,
  },
  iconCircleWarm: {
    backgroundColor: "rgba(212,160,23,0.18)",
  },
  cardKicker: {
    fontSize: FontSizes.xs,
    fontFamily: "Inter_500Medium",
    color: "rgba(255,255,255,0.5)",
    textTransform: "uppercase",
    letterSpacing: 1.2,
    textAlign: "center",
  },
  microLabel: {
    fontSize: FontSizes.xs,
    fontFamily: "Inter_400Regular",
    color: "rgba(255,255,255,0.45)",
    textAlign: "center",
    marginTop: -Spacing.xs,
  },
  countdown: {
    fontSize: 88,
    fontFamily: "Inter_500Medium",
    color: "#fff",
    lineHeight: 96,
  },
  countHint: {
    fontSize: FontSizes.sm,
    fontFamily: "Inter_400Regular",
    color: "rgba(255,255,255,0.45)",
    textAlign: "center",
  },
  previewTitle: {
    fontSize: FontSizes.md,
    fontFamily: "Inter_400Regular",
    color: "rgba(255,255,255,0.65)",
    textAlign: "center",
    lineHeight: 22,
    paddingHorizontal: Spacing.sm,
  },
  actionTitle: {
    fontSize: FontSizes.xxl,
    fontFamily: "Inter_500Medium",
    color: "#fff",
    textAlign: "center",
    lineHeight: 30,
    paddingHorizontal: Spacing.xs,
  },
  recoveryHint: {
    fontSize: FontSizes.sm,
    fontFamily: "Inter_400Regular",
    color: "rgba(255,255,255,0.55)",
    textAlign: "center",
    lineHeight: 21,
    paddingHorizontal: Spacing.sm,
  },
  barTrack: {
    width: "100%",
    height: 6,
    backgroundColor: "rgba(255,255,255,0.12)",
    borderRadius: Radii.full,
    overflow: "hidden",
    marginTop: Spacing.sm,
  },
  barFill: {
    height: "100%",
    backgroundColor: Colors.primary,
    borderRadius: Radii.full,
  },
  durationLabel: {
    fontSize: FontSizes.sm,
    fontFamily: "Inter_400Regular",
    color: "rgba(255,255,255,0.5)",
    textAlign: "center",
  },
  primaryBtn: {
    marginTop: Spacing.md,
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    paddingHorizontal: Spacing.xl,
    borderRadius: Radii.button + 2,
    width: "100%",
    alignItems: "center",
    shadowColor: Colors.primary,
    shadowOpacity: 0.35,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
  },
  primaryBtnText: {
    color: "#fff",
    fontFamily: "Inter_500Medium",
    fontSize: FontSizes.md,
  },
  checkCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.sm,
  },
  doneText: {
    fontSize: FontSizes.xxl,
    fontFamily: "Inter_500Medium",
    color: "#fff",
    textAlign: "center",
  },
  doneSub: {
    fontSize: FontSizes.sm,
    fontFamily: "Inter_400Regular",
    color: "rgba(255,255,255,0.55)",
    textAlign: "center",
    lineHeight: 21,
    paddingHorizontal: Spacing.sm,
  },
  secondaryBtn: {
    marginTop: Spacing.lg,
    backgroundColor: "rgba(255,255,255,0.14)",
    borderRadius: Radii.button + 2,
    paddingVertical: 15,
    paddingHorizontal: Spacing.xxl,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
  },
  secondaryBtnText: {
    color: "#fff",
    fontFamily: "Inter_500Medium",
    fontSize: FontSizes.md,
  },
});
