/**
 * Live Action — hazırlık → aksiyon → tamamlandı.
 * Recovery: geri sayım yok; kullanıcı "Bunu yaptım" ile onaylar.
 * Diğer kas tipleri: kısa 3-2-1 + süre çubuğu.
 */

import React, { useEffect, useRef, useState, useCallback, useMemo } from "react";
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
import { Check, X, Sparkles, Timer, Anchor } from "lucide-react-native";
import * as Haptics from "expo-haptics";
import { useTranslation } from "react-i18next";
import { Action, MUSCLE_LABELS, MuscleType } from "../engine";
import { Colors, FontSizes, Radii, Spacing } from "../constants/theme";
import { buildAnchorStepUi } from "../utils/anchorStepCopy";

interface Props {
  visible: boolean;
  action: Action | null;
  habitAnchor?: string;
  habitName?: string;
  onComplete: () => void;
  onCancel: () => void;
}

type Phase = "countdown" | "action" | "done";

function isRecoveryAction(action: Action): boolean {
  return action.type === "recovery";
}

export default function LiveActionModal({
  visible,
  action,
  habitAnchor,
  habitName = "",
  onComplete,
  onCancel,
}: Props) {
  const { t, i18n } = useTranslation();
  const [phase, setPhase] = useState<Phase>("countdown");
  const [count, setCount] = useState(3);
  const [actionLeft, setActionLeft] = useState(0);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const actionRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const anchorUi = useMemo(() => {
    if (!action) return null;
    return buildAnchorStepUi({
      habitAnchor,
      habitName,
      actionId: action.id,
      actionTitle: action.title,
      duration: action.duration,
    });
  }, [action, habitAnchor, habitName, i18n.language]);

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
    if (!visible || actionId == null || actionType == null) {
      if (!visible) {
        clearTimers();
        setPhase("countdown");
        setCount(3);
        setActionLeft(0);
      }
      return;
    }

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

  if (!action || !anchorUi) return null;

  const recovery = isRecoveryAction(action);
  const headline = t(`home.anchorStep.muscleHeadline.${action.type as MuscleType}`);
  const doneSub = t(`home.anchorStep.doneSubline.${action.type as MuscleType}`);
  const timedProgress =
    !recovery && action.duration > 0 ? actionLeft / action.duration : 0;

  const renderAnchorChip = () =>
    anchorUi.anchorChip ? (
      <View style={styles.anchorChip}>
        <Anchor size={11} color={Colors.primary} strokeWidth={2.2} />
        <Text style={styles.anchorChipText} numberOfLines={1}>
          {anchorUi.anchorChip}
        </Text>
      </View>
    ) : null;

  const renderSteps = () => (
    <View style={styles.steps}>
      {anchorUi.modalSteps.map((line, i) => (
        <View key={i} style={styles.stepRow}>
          <Text style={styles.stepNum}>{i + 1}</Text>
          <Text style={styles.stepText}>{line}</Text>
        </View>
      ))}
    </View>
  );

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
            accessibilityLabel={t("home.anchorStep.modal.close")}
          >
            <X size={18} color="rgba(255,255,255,0.75)" strokeWidth={2} />
          </TouchableOpacity>

          <View style={styles.center}>
            <View style={styles.card}>
              {phase === "countdown" && !recovery && (
                <>
                  <View style={styles.iconCircle}>
                    <Sparkles size={22} color={Colors.primary} strokeWidth={1.8} />
                  </View>
                  <Text style={styles.cardKicker}>{t("home.anchorStep.modal.prepare")}</Text>
                  <Text style={styles.countdown}>{count}</Text>
                  <Text style={styles.countHint}>{t("home.anchorStep.modal.afterMove")}</Text>
                  {renderAnchorChip()}
                  <Text style={styles.lead} numberOfLines={4}>
                    {anchorUi.modalLead}
                  </Text>
                  <Text style={styles.previewTitle} numberOfLines={2}>
                    {action.title}
                  </Text>
                  {anchorUi.modalTip ? (
                    <Text style={styles.tipText} numberOfLines={3}>
                      {anchorUi.modalTip}
                    </Text>
                  ) : null}
                  {renderSteps()}
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
                      <Sparkles size={22} color={Colors.gold} strokeWidth={1.8} />
                    ) : (
                      <Timer size={22} color={Colors.primary} strokeWidth={1.8} />
                    )}
                  </View>
                  <View style={styles.kickerRow}>
                    <Text style={styles.cardKicker}>{headline}</Text>
                    {!recovery ? (
                      <Text style={styles.microPill}>
                        {MUSCLE_LABELS[action.type]} · {anchorUi.contextLabel}
                      </Text>
                    ) : null}
                  </View>
                  {renderAnchorChip()}
                  <Text style={styles.actionTitle} numberOfLines={2}>
                    {action.title}
                  </Text>
                  <Text style={styles.lead} numberOfLines={4}>
                    {anchorUi.modalLead}
                  </Text>
                  {anchorUi.modalTip ? (
                    <Text style={styles.tipText} numberOfLines={2}>
                      {anchorUi.modalTip}
                    </Text>
                  ) : null}
                  {!recovery ? renderSteps() : null}
                  {recovery ? (
                    <>
                      <Text style={styles.recoveryHint}>
                        {t("home.anchorStep.modal.recoveryHint")}
                      </Text>
                      <TouchableOpacity
                        style={styles.primaryBtn}
                        onPress={handleRecoveryDone}
                        activeOpacity={0.9}
                      >
                        <Text style={styles.primaryBtnText}>
                          {t("home.anchorStep.modal.recoveryDone")}
                        </Text>
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
                      <Text style={styles.durationLabel}>{anchorUi.breathHint}</Text>
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
                    <Check size={28} color="#fff" strokeWidth={2.5} />
                  </LinearGradient>
                  <Text style={styles.doneText}>{t("home.anchorStep.modal.done")}</Text>
                  <Text style={styles.doneSub}>{doneSub}</Text>
                  <TouchableOpacity
                    style={styles.secondaryBtn}
                    onPress={onComplete}
                    activeOpacity={0.88}
                  >
                    <Text style={styles.secondaryBtnText}>
                      {t("home.anchorStep.modal.continue")}
                    </Text>
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
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.08)",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.lg,
  },
  card: {
    width: "100%",
    maxWidth: 380,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderRadius: Radii.card,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    alignItems: "center",
    gap: 8,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(29,158,117,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  iconCircleWarm: {
    backgroundColor: "rgba(212,160,23,0.18)",
  },
  kickerRow: {
    alignItems: "center",
    gap: 4,
  },
  cardKicker: {
    fontSize: 10,
    fontFamily: "Inter_600SemiBold",
    fontWeight: "600",
    color: "rgba(255,255,255,0.55)",
    textTransform: "uppercase",
    letterSpacing: 1,
    textAlign: "center",
  },
  microPill: {
    fontSize: 10,
    fontFamily: "Inter_400Regular",
    color: "rgba(255,255,255,0.4)",
    textAlign: "center",
  },
  anchorChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    maxWidth: "100%",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: Radii.pill,
    backgroundColor: "rgba(29,158,117,0.15)",
    borderWidth: 1,
    borderColor: "rgba(29,158,117,0.25)",
  },
  anchorChipText: {
    flex: 1,
    fontSize: 11,
    fontFamily: "Inter_500Medium",
    color: "rgba(255,255,255,0.85)",
  },
  countdown: {
    fontSize: 64,
    fontFamily: "Inter_500Medium",
    color: "#fff",
    lineHeight: 72,
  },
  countHint: {
    fontSize: FontSizes.xs,
    fontFamily: "Inter_400Regular",
    color: "rgba(255,255,255,0.45)",
    textAlign: "center",
  },
  lead: {
    fontSize: FontSizes.sm,
    fontFamily: "Inter_400Regular",
    color: "rgba(255,255,255,0.7)",
    textAlign: "center",
    lineHeight: 20,
    paddingHorizontal: 4,
  },
  previewTitle: {
    fontSize: FontSizes.md,
    fontFamily: "Inter_600SemiBold",
    fontWeight: "600",
    color: "rgba(255,255,255,0.9)",
    textAlign: "center",
    lineHeight: 22,
  },
  tipText: {
    fontSize: FontSizes.xs,
    fontFamily: "Inter_400Regular",
    color: "rgba(255,255,255,0.5)",
    textAlign: "center",
    lineHeight: 17,
    paddingHorizontal: 6,
    fontStyle: "italic",
  },
  actionTitle: {
    fontSize: FontSizes.lg,
    fontFamily: "Inter_600SemiBold",
    fontWeight: "600",
    color: "#fff",
    textAlign: "center",
    lineHeight: 24,
  },
  steps: {
    width: "100%",
    gap: 6,
    marginTop: 2,
  },
  stepRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    paddingHorizontal: 4,
  },
  stepNum: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "rgba(29,158,117,0.35)",
    color: "#fff",
    fontSize: 10,
    fontFamily: "Inter_600SemiBold",
    fontWeight: "600",
    textAlign: "center",
    lineHeight: 18,
    overflow: "hidden",
  },
  stepText: {
    flex: 1,
    fontSize: FontSizes.xs,
    fontFamily: "Inter_400Regular",
    color: "rgba(255,255,255,0.75)",
    lineHeight: 17,
  },
  recoveryHint: {
    fontSize: FontSizes.xs,
    fontFamily: "Inter_400Regular",
    color: "rgba(255,255,255,0.55)",
    textAlign: "center",
    lineHeight: 18,
    paddingHorizontal: Spacing.xs,
  },
  barTrack: {
    width: "100%",
    height: 5,
    backgroundColor: "rgba(255,255,255,0.12)",
    borderRadius: Radii.full,
    overflow: "hidden",
    marginTop: 4,
  },
  barFill: {
    height: "100%",
    backgroundColor: Colors.primary,
    borderRadius: Radii.full,
  },
  durationLabel: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    color: "rgba(255,255,255,0.5)",
    textAlign: "center",
  },
  primaryBtn: {
    marginTop: Spacing.sm,
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    paddingHorizontal: Spacing.lg,
    borderRadius: Radii.button,
    width: "100%",
    alignItems: "center",
  },
  primaryBtnText: {
    color: "#fff",
    fontFamily: "Inter_600SemiBold",
    fontWeight: "600",
    fontSize: FontSizes.sm,
  },
  checkCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  doneText: {
    fontSize: FontSizes.xl,
    fontFamily: "Inter_600SemiBold",
    fontWeight: "600",
    color: "#fff",
    textAlign: "center",
  },
  doneSub: {
    fontSize: FontSizes.xs,
    fontFamily: "Inter_400Regular",
    color: "rgba(255,255,255,0.55)",
    textAlign: "center",
    lineHeight: 18,
    paddingHorizontal: Spacing.sm,
  },
  secondaryBtn: {
    marginTop: Spacing.md,
    backgroundColor: "rgba(255,255,255,0.14)",
    borderRadius: Radii.button,
    paddingVertical: 13,
    paddingHorizontal: Spacing.xl,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
  },
  secondaryBtnText: {
    color: "#fff",
    fontFamily: "Inter_600SemiBold",
    fontWeight: "600",
    fontSize: FontSizes.sm,
  },
});
