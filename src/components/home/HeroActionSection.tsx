import React, {
  useState,
  useCallback,
  useImperativeHandle,
  forwardRef,
} from "react";
import { View, Text, StyleSheet } from "react-native";
import * as Haptics from "expo-haptics";
import { Zap } from "lucide-react-native";
import { Colors, FontSizes } from "../../constants/theme";
import { useBehaviorStore } from "../../store/useBehaviorStore";
import { trackEvent } from "../../utils/analytics";
import BehaviorActionCard from "../BehaviorActionCard";
import LiveActionModal from "../LiveActionModal";
import InterruptModal from "../InterruptModal";
import type { UserState, Action } from "../../engine";

export interface HeroActionSectionHandle {
  openSuggestedAction: () => void;
}

interface Props {
  userBehaviorState: UserState | null;
  hapticsEnabled: boolean;
  onToast: (msg: string) => void;
  onActionRecorded?: () => void;
}

const HeroActionSection = forwardRef<HeroActionSectionHandle, Props>(
  function HeroActionSection(
    { userBehaviorState, hapticsEnabled, onToast, onActionRecorded },
    ref
  ) {
    const [liveAction, setLiveAction] = useState<Action | null>(null);
    const [showLiveModal, setShowLiveModal] = useState(false);
    const [showInterruptModal, setShowInterruptModal] = useState(false);

    const openSuggestedAction = useCallback(() => {
      if (!userBehaviorState) return;
      if (hapticsEnabled) {
        void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }
      const action = userBehaviorState.suggestedAction;
      setLiveAction(action);
      if (action.isInterrupt) {
        setShowInterruptModal(true);
      } else {
        setShowLiveModal(true);
      }
      void trackEvent("action_started", {
        actionId: action.id,
        source: "hero",
        interrupt: action.isInterrupt === true,
      });
    }, [userBehaviorState, hapticsEnabled]);

    useImperativeHandle(ref, () => ({ openSuggestedAction }), [openSuggestedAction]);

    const handleActionPress = useCallback(() => {
      openSuggestedAction();
    }, [openSuggestedAction]);

    const handleActionComplete = useCallback(async () => {
      if (!userBehaviorState) return;
      if (hapticsEnabled) {
        void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      await useBehaviorStore.getState().recordAction(userBehaviorState.suggestedAction);
      void trackEvent("action_completed", {
        actionId: userBehaviorState.suggestedAction.id,
        source: "hero",
      });
      setShowLiveModal(false);
      setShowInterruptModal(false);
      onActionRecorded?.();
      onToast("Adım kaydedildi. Disiplin kası güçleniyor.");
    }, [userBehaviorState, hapticsEnabled, onToast, onActionRecorded]);

    const handleInterruptDone = useCallback(async () => {
      await handleActionComplete();
    }, [handleActionComplete]);

    const handleActionCancel = useCallback(() => {
      void trackEvent("action_cancelled", {
        actionId: liveAction?.id ?? null,
        source: "hero",
      });
      setShowLiveModal(false);
      setShowInterruptModal(false);
    }, [liveAction?.id]);

    if (!userBehaviorState) return null;

    return (
      <View style={styles.wrap}>
        <View style={styles.labelRow}>
          <Zap size={13} color={Colors.primary} strokeWidth={2.5} />
          <Text style={styles.label}>Bugünün adımı</Text>
        </View>

        <BehaviorActionCard
          state={userBehaviorState}
          onPress={handleActionPress}
          compact
          surface
        />

        <LiveActionModal
          visible={showLiveModal}
          action={liveAction}
          onComplete={handleActionComplete}
          onCancel={handleActionCancel}
        />

        <InterruptModal
          visible={showInterruptModal}
          action={liveAction}
          forced
          onDone={() => void handleInterruptDone()}
          onClose={handleActionCancel}
        />
      </View>
    );
  }
);

export default HeroActionSection;

const styles = StyleSheet.create({
  wrap: {
    gap: 8,
  },
  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginLeft: 2,
  },
  label: {
    fontSize: FontSizes.xs,
    fontFamily: "Inter_600SemiBold",
    fontWeight: "600",
    letterSpacing: 0.6,
    textTransform: "uppercase",
    color: Colors.primary,
  },
});
