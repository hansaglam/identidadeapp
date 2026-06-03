import React, { useState, useCallback } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Modal, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ChevronRight, MapPin, Clock, Zap } from "lucide-react-native";
import { Colors, Spacing, Radii, FontSizes, Shadows } from "../../constants/theme";
import LiveActionModal from "../LiveActionModal";
import InterruptModal from "../InterruptModal";
import { useBehaviorStore } from "../../store/useBehaviorStore";
import { trackEvent } from "../../utils/analytics";
import type { UserState, Action } from "../../engine";

interface Props {
  visible: boolean;
  onClose: () => void;
  habitName: string;
  identityLine: string;
  anchorBehavior: string;
  dayNumber: number;
  todayDone: boolean;
  userBehaviorState: UserState | null;
  hapticsEnabled: boolean;
  onNavigateJourney: () => void;
  onToast: (msg: string) => void;
}

export default function TaskDetailSheet({
  visible,
  onClose,
  habitName,
  identityLine,
  anchorBehavior,
  dayNumber,
  todayDone,
  userBehaviorState,
  hapticsEnabled,
  onNavigateJourney,
  onToast,
}: Props) {
  const [liveAction, setLiveAction] = useState<Action | null>(null);
  const [showLive, setShowLive] = useState(false);
  const [showInterrupt, setShowInterrupt] = useState(false);

  const handleStartAction = useCallback(() => {
    if (!userBehaviorState) return;
    const action = userBehaviorState.suggestedAction;
    setLiveAction(action);
    if (action.isInterrupt) {
      setShowInterrupt(true);
    } else {
      setShowLive(true);
    }
    void trackEvent("action_started", {
      actionId: action.id,
      source: "task_sheet",
      interrupt: action.isInterrupt === true,
    });
  }, [userBehaviorState]);

  const handleLiveComplete = useCallback(async () => {
    if (!userBehaviorState) return;
    await useBehaviorStore.getState().recordAction(userBehaviorState.suggestedAction);
    void trackEvent("action_completed", {
      actionId: userBehaviorState.suggestedAction.id,
      source: "task_sheet",
    });
    setShowLive(false);
    setShowInterrupt(false);
    onToast("Adım kaydedildi.");
  }, [userBehaviorState, onToast]);

  const suggested = userBehaviorState?.suggestedAction;

  return (
    <>
      <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
        <View style={styles.root}>
          <Pressable style={styles.backdrop} onPress={onClose} />
          <SafeAreaView edges={["bottom"]} style={styles.safe}>
            <View style={styles.panel}>
              <View style={styles.handle} />

              <Text style={styles.title}>{habitName}</Text>
              <Text style={styles.dayBadge}>Gün {dayNumber}</Text>

              <View style={styles.section}>
                <Text style={styles.sectionLabel}>Kimlik cümlen</Text>
                <Text style={styles.sectionBody}>{identityLine}</Text>
              </View>

              <View style={styles.section}>
                <View style={styles.infoRow}>
                  <MapPin size={13} color={Colors.textTertiary} strokeWidth={2} />
                  <Text style={styles.infoText}>Çapa: {anchorBehavior}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Clock size={13} color={Colors.textTertiary} strokeWidth={2} />
                  <Text style={styles.infoText}>
                    {todayDone ? "Bugün tamamlandı" : "Henüz tamamlanmadı"}
                  </Text>
                </View>
              </View>

              {!todayDone && suggested && (
                <TouchableOpacity
                  style={styles.actionCard}
                  activeOpacity={0.88}
                  onPress={handleStartAction}
                >
                  <View style={styles.actionIconWrap}>
                    <Zap size={16} color={Colors.primary} strokeWidth={2.5} />
                  </View>
                  <View style={styles.actionTextWrap}>
                    <Text style={styles.actionTitle}>{suggested.title}</Text>
                    <Text style={styles.actionSub}>
                      {suggested.duration} sn · Şimdi başla
                    </Text>
                  </View>
                  <ChevronRight size={16} color={Colors.textTertiary} strokeWidth={2} />
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={styles.journeyCta}
                activeOpacity={0.88}
                onPress={() => {
                  onClose();
                  onNavigateJourney();
                }}
              >
                <Text style={styles.journeyCtaText}>Yolculuk’a git</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.closeBtn} activeOpacity={0.85} onPress={onClose}>
                <Text style={styles.closeBtnText}>Kapat</Text>
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        </View>
      </Modal>

      <LiveActionModal
        visible={showLive}
        action={liveAction}
        onComplete={handleLiveComplete}
        onCancel={() => setShowLive(false)}
      />
      <InterruptModal
        visible={showInterrupt}
        action={liveAction}
        forced
        onDone={() => void handleLiveComplete()}
        onClose={() => setShowInterrupt(false)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, justifyContent: "flex-end" },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: Colors.overlay,
  },
  safe: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  panel: {
    paddingHorizontal: Spacing.lg,
    paddingTop: 8,
    paddingBottom: Spacing.md,
  },
  handle: {
    alignSelf: "center",
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.border,
    marginBottom: Spacing.md,
  },
  title: {
    fontSize: FontSizes.xl,
    fontFamily: "Inter_500Medium",
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  dayBadge: {
    fontSize: FontSizes.xs,
    fontFamily: "Inter_500Medium",
    color: Colors.primary,
    marginBottom: Spacing.md,
  },
  section: {
    marginBottom: Spacing.md,
    gap: 6,
  },
  sectionLabel: {
    fontSize: FontSizes.xs,
    fontFamily: "Inter_500Medium",
    letterSpacing: 0.8,
    color: Colors.textTertiary,
    textTransform: "uppercase",
  },
  sectionBody: {
    fontSize: FontSizes.md,
    fontFamily: "Inter_400Regular",
    color: Colors.textSecondary,
    lineHeight: 22,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  infoText: {
    fontSize: FontSizes.sm,
    fontFamily: "Inter_400Regular",
    color: Colors.textSecondary,
  },
  actionCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    backgroundColor: Colors.primaryLight,
    borderRadius: Radii.card,
    borderWidth: 1,
    borderColor: "rgba(47,156,134,0.2)",
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  actionIconWrap: {
    width: 36,
    height: 36,
    borderRadius: Radii.sm,
    backgroundColor: "rgba(47,156,134,0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  actionTextWrap: { flex: 1 },
  actionTitle: {
    fontSize: FontSizes.md,
    fontFamily: "Inter_500Medium",
    color: Colors.primaryDark,
  },
  actionSub: {
    fontSize: FontSizes.xs,
    fontFamily: "Inter_400Regular",
    color: Colors.textTertiary,
  },
  journeyCta: {
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    borderRadius: Radii.button,
    alignItems: "center",
    ...Shadows.card,
  },
  journeyCtaText: {
    color: "#fff",
    fontSize: FontSizes.md,
    fontFamily: "Inter_500Medium",
  },
  closeBtn: {
    marginTop: Spacing.sm,
    paddingVertical: 12,
    alignItems: "center",
  },
  closeBtnText: {
    fontSize: FontSizes.md,
    fontFamily: "Inter_500Medium",
    color: Colors.textTertiary,
  },
});
