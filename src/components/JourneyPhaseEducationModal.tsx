import React, { useState, useCallback, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  useWindowDimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
  AccessibilityInfo,
} from "react-native";
import { X } from "lucide-react-native";
import * as Haptics from "expo-haptics";
import { Colors, Spacing, Radii, FontSizes, JOURNEY_PHASES } from "../constants/theme";
import type { JourneyPhaseEducationCard } from "../constants/journeyPhaseEducation";
import {
  loadJourneyEducationPrefs,
  setSwipeHintShown,
  markPhaseEducationCompleted,
} from "../utils/journeyEducationPrefs";

interface Props {
  visible: boolean;
  onClose: () => void;
  phaseId: 1 | 2 | 3;
  cards: JourneyPhaseEducationCard[];
  /** Profilde kapalıysa false */
  hapticsEnabled?: boolean;
}

/** Yatay sayfalama: her çocuk genişliği = ScrollView genişliği (pagingEnabled). */
export default function JourneyPhaseEducationModal({
  visible,
  onClose,
  phaseId,
  cards,
  hapticsEnabled = true,
}: Props) {
  const { width: winW } = useWindowDimensions();
  const gutter = Spacing.lg * 2;
  const sheetW = Math.min(winW - gutter, 400);
  const pageW = sheetW;

  const [page, setPage] = useState(0);
  const [showSwipeCue, setShowSwipeCue] = useState(false);

  const phase = JOURNEY_PHASES[phaseId - 1];
  const lastIndex = cards.length - 1;
  const footLabel = page >= lastIndex ? "Tamam, faz özeti tamamlandı" : "Tamam";

  useEffect(() => {
    if (!visible) {
      setPage(0);
      return;
    }
    let cancelled = false;
    (async () => {
      const prefs = await loadJourneyEducationPrefs();
      if (cancelled) return;
      setShowSwipeCue(!prefs.swipeHintShown && cards.length > 1);
    })();
    return () => {
      cancelled = true;
    };
  }, [visible, cards.length]);

  const dismissSwipeCue = useCallback(async () => {
    setShowSwipeCue(false);
    await setSwipeHintShown();
  }, []);

  const onScrollEnd = useCallback(
    async (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const x = e.nativeEvent.contentOffset.x;
      const i = Math.round(x / Math.max(pageW, 1));
      const next = Math.max(0, Math.min(i, cards.length - 1));
      setPage(next);
      if (next >= 1 && showSwipeCue) await dismissSwipeCue();
    },
    [pageW, cards.length, showSwipeCue, dismissSwipeCue]
  );

  const handleFootPress = useCallback(async () => {
    const onLastPage = page >= lastIndex;
    if (!onLastPage) {
      onClose();
      return;
    }
    try {
      await markPhaseEducationCompleted(phaseId);
      if (hapticsEnabled) {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      AccessibilityInfo.announceForAccessibility("Bu faz özeti tamamlandı.");
    } catch {
      /* storage best-effort */
    }
    onClose();
  }, [page, lastIndex, phaseId, hapticsEnabled, onClose]);

  const handleCloseX = useCallback(() => {
    void dismissSwipeCue();
    onClose();
  }, [dismissSwipeCue, onClose]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleCloseX}
      accessibilityViewIsModal
    >
      <View style={styles.overlay} accessibilityLabel="Bu faz için kısa beyin özeti">
        <View style={[styles.sheet, { width: sheetW }]}>
          <View style={styles.headRow}>
            <View style={styles.headTextCol}>
              <Text style={styles.kicker}>Bu fazda beyin</Text>
              <Text style={styles.title} accessibilityRole="header">
                Faz {phaseId} · {phase.label}
              </Text>
            </View>
            <TouchableOpacity onPress={handleCloseX} style={styles.closeBtn} hitSlop={12}>
              <X size={22} color={Colors.textTertiary} strokeWidth={1.8} accessibilityLabel="Kapat" />
            </TouchableOpacity>
          </View>
          <Text style={styles.hint}>Yaklaşık 30 sn · {cards.length} kısa kart</Text>

          {showSwipeCue ? (
            <View style={styles.swipeCueBox}>
              <Text style={styles.swipeCueText}>
                Kartları yana kaydırarak devam et — her sayfa fazın küçük bir parçası.
              </Text>
              <TouchableOpacity onPress={() => void dismissSwipeCue()} hitSlop={8}>
                <Text style={styles.swipeCueDismiss}>Tamam</Text>
              </TouchableOpacity>
            </View>
          ) : null}

          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            style={{ width: pageW }}
            decelerationRate="fast"
            onMomentumScrollEnd={onScrollEnd}
            accessibilityLabel={`Faz ${phaseId} özeti kartları. Yana kaydırarak oku.`}
          >
            {cards.map((c) => (
              <View key={c.id} style={[styles.cardPage, { width: pageW }]}>
                <View style={[styles.card, { borderColor: phase.color }]}>
                  <Text style={[styles.cardTitle, { color: phase.color }]} accessibilityRole="header">
                    {c.title}
                  </Text>
                  <ScrollView
                    nestedScrollEnabled
                    showsVerticalScrollIndicator={false}
                    style={styles.cardBodyScroll}
                  >
                    <Text style={styles.cardBody}>{c.body}</Text>
                  </ScrollView>
                </View>
              </View>
            ))}
          </ScrollView>

          <View style={styles.dots} importantForAccessibility="no-hide-descendants">
            {cards.map((c, i) => (
              <View
                key={c.id}
                style={[
                  styles.dot,
                  { backgroundColor: i === page ? phase.color : Colors.border },
                ]}
              />
            ))}
          </View>

          <TouchableOpacity
            style={[styles.doneFoot, page >= lastIndex && styles.doneFootAccent]}
            onPress={() => void handleFootPress()}
            activeOpacity={0.85}
            accessibilityHint={
              page >= lastIndex ? "Tamamladığında bu faz özeti kaydedilir" : "Modalı kapatır"
            }
          >
            <Text style={styles.doneFootText}>{footLabel}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: Colors.overlay,
    justifyContent: "center",
    alignItems: "center",
    padding: Spacing.lg,
  },
  sheet: {
    maxHeight: "86%",
    backgroundColor: Colors.surface,
    borderRadius: Radii.card + 4,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: "hidden",
    alignSelf: "center",
    paddingBottom: Spacing.md,
  },
  headRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
  },
  headTextCol: { flex: 1, paddingRight: Spacing.sm },
  kicker: {
    fontSize: FontSizes.xs,
    fontFamily: "Inter_500Medium",
    color: Colors.textTertiary,
    letterSpacing: 0.5,
    textTransform: "uppercase",
    marginBottom: 4,
  },
  title: {
    fontSize: FontSizes.lg,
    fontFamily: "Inter_500Medium",
    color: Colors.textPrimary,
  },
  hint: {
    fontSize: FontSizes.xs,
    fontFamily: "Inter_400Regular",
    color: Colors.textSecondary,
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.sm,
  },
  swipeCueBox: {
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radii.card,
    backgroundColor: Colors.goldLight,
    borderWidth: 1,
    borderColor: "rgba(212, 160, 23, 0.35)",
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  swipeCueText: {
    flex: 1,
    fontSize: FontSizes.xs,
    fontFamily: "Inter_400Regular",
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  swipeCueDismiss: {
    fontSize: FontSizes.xs,
    fontFamily: "Inter_500Medium",
    color: Colors.primary,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.bg,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cardPage: {
    marginBottom: Spacing.sm,
  },
  card: {
    marginHorizontal: Spacing.sm,
    borderRadius: Radii.card,
    borderWidth: 2,
    backgroundColor: Colors.bg,
    padding: Spacing.md,
    gap: Spacing.sm,
    minHeight: 200,
    maxHeight: 280,
    overflow: "hidden",
  },
  cardBodyScroll: {
    maxHeight: 200,
    flexGrow: 0,
  },
  cardTitle: {
    fontSize: FontSizes.md,
    fontFamily: "Inter_500Medium",
  },
  cardBody: {
    fontSize: FontSizes.sm,
    fontFamily: "Inter_400Regular",
    color: Colors.textSecondary,
    lineHeight: 21,
  },
  dots: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 6,
    marginTop: Spacing.xs,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  doneFoot: {
    marginTop: Spacing.sm,
    marginHorizontal: Spacing.md,
    backgroundColor: Colors.primary,
    borderRadius: Radii.button,
    paddingVertical: Spacing.sm,
    alignItems: "center",
  },
  doneFootAccent: {
    borderWidth: 1,
    borderColor: Colors.primaryDark,
  },
  doneFootText: {
    fontSize: FontSizes.md,
    fontFamily: "Inter_500Medium",
    color: "#fff",
    textAlign: "center",
  },
});
