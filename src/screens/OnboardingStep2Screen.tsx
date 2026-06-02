import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Check, ChevronLeft, Info } from "lucide-react-native";
import * as Haptics from "expo-haptics";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { AuthStackParamList } from "../types";
import { Colors, Spacing, Radii, FontSizes, Shadows, ANCHOR_PRESETS, TIME_RANGES } from "../constants/theme";
import { getIdentityTemplate, previewHabitPhraseForAnchor } from "../constants/identityTemplates";

type Props = NativeStackScreenProps<AuthStackParamList, "OnboardingStep2">;

const STEP_LABELS = ["Kimliğin", "Çapan", "Neden"] as const;

const ANCHOR_EMOJIS: Record<string, string> = {
  "Kahvemi içtikten sonra": "☕",
  "Dişlerimi fırçaladıktan sonra": "🪥",
  "Telefonu elimden bıraktıktan sonra": "📵",
  "Yatağa girmeden önce": "🛏️",
  "Öğle yemeğinden sonra": "🍽️",
  "Uyandıktan hemen sonra": "⏰",
};

const TIME_EMOJIS: Record<string, string> = {
  sabah: "🌅",
  ogle: "☀️",
  "ogleden-sonra": "🌤️",
  aksam: "🌇",
  gece: "🌙",
};

function StepBar({ current }: { current: number }) {
  return (
    <View style={styles.stepWrap}>
      {STEP_LABELS.map((label, i) => {
        const done = i < current - 1;
        const active = i === current - 1;
        return (
          <React.Fragment key={label}>
            {i > 0 && (
              <View
                style={[styles.stepConnector, (done || active) && styles.stepConnectorActive]}
              />
            )}
            <View style={styles.stepItem}>
              <View
                style={[
                  styles.stepCircle,
                  done && styles.stepCircleDone,
                  active && styles.stepCircleActive,
                ]}
              >
                {done ? (
                  <Check size={10} color="#fff" strokeWidth={3} />
                ) : (
                  <Text style={[styles.stepNum, active && styles.stepNumActive]}>{i + 1}</Text>
                )}
              </View>
              <Text style={[styles.stepLabel, active && styles.stepLabelActive]}>{label}</Text>
            </View>
          </React.Fragment>
        );
      })}
    </View>
  );
}

export default function OnboardingStep2Screen({ route, navigation }: Props) {
  const { habitName, identityTagId } = route.params;
  const template = getIdentityTemplate(identityTagId);

  const anchorOptions = React.useMemo<readonly string[]>(() => {
    if (!template) return ANCHOR_PRESETS;
    if ((ANCHOR_PRESETS as readonly string[]).includes(template.defaultAnchor)) return ANCHOR_PRESETS;
    return [template.defaultAnchor, ...ANCHOR_PRESETS];
  }, [template]);

  const [selectedAnchor, setSelectedAnchor] = useState<string | null>(
    template?.defaultAnchor ?? null
  );
  const [selectedTime, setSelectedTime] = useState<string | null>(
    template?.defaultTimeId ?? null
  );

  const canContinue = !!selectedAnchor && !!selectedTime;

  const commitmentBody =
    selectedAnchor && template
      ? previewHabitPhraseForAnchor(template, selectedAnchor, habitName)
      : selectedAnchor && !template
        ? `${habitName} için küçük adımı atacağım`
        : "";

  const selectedTimeLabel = TIME_RANGES.find((t) => t.id === selectedTime)?.label ?? "";

  const handleSelectAnchor = (anchor: string) => {
    void Haptics.selectionAsync();
    setSelectedAnchor(anchor);
  };

  const handleSelectTime = (id: string) => {
    void Haptics.selectionAsync();
    setSelectedTime(id);
  };

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <StepBar current={2} />

        <Text style={styles.title}>Bu kimliği nereye{"\n"}bağlayacaksın?</Text>
        <Text style={styles.sub}>
          Çapa, günlük önerilerini gerçek hayatına kilitleyen noktadır. Zaten yaptığın bir rutine ekle.
        </Text>

        {/* Commitment preview */}
        <View style={styles.previewCard}>
          <Text style={styles.previewKicker}>TAAHHÜDÜN</Text>
          {!selectedAnchor ? (
            <Text style={styles.previewPlaceholder}>
              Bir çapa seçtiğinde taahhüt cümlen burada oluşacak…
            </Text>
          ) : (
            <Text style={styles.previewStatement}>
              <Text style={styles.previewAnchor}>{selectedAnchor}</Text>
              <Text style={styles.previewBody}> {commitmentBody}.</Text>
            </Text>
          )}
          {selectedTime && (
            <View style={styles.previewTimePill}>
              <Text style={styles.previewTimeEmoji}>{TIME_EMOJIS[selectedTime] ?? "⏰"}</Text>
              <Text style={styles.previewTimeText}>{selectedTimeLabel}</Text>
            </View>
          )}
          {template && (
            <Text style={styles.previewHint}>
              {template.emoji} {template.title} — çapa ön seçili, istersen değiştir.
            </Text>
          )}
        </View>

        {/* Info note */}
        <View style={styles.infoRow}>
          <Info size={13} color={Colors.textTertiary} strokeWidth={2} />
          <Text style={styles.infoText}>
            Şablon yalnızca ilk öneriyi verir; çapayı ve saati istediğin zaman değiştirebilirsin.
          </Text>
        </View>

        {/* Anchor options */}
        <Text style={styles.sectionLabel}>Önce ne yapıyorsun?</Text>
        <View style={styles.anchorList}>
          {anchorOptions.map((anchor) => {
            const active = selectedAnchor === anchor;
            const emoji = ANCHOR_EMOJIS[anchor] ?? "🔗";
            return (
              <TouchableOpacity
                key={anchor}
                style={[styles.anchorOption, active && styles.anchorOptionActive]}
                onPress={() => handleSelectAnchor(anchor)}
                activeOpacity={0.8}
              >
                <Text style={styles.anchorEmoji}>{emoji}</Text>
                <Text style={[styles.anchorText, active && styles.anchorTextActive]}>
                  {anchor}
                </Text>
                {active && (
                  <View style={styles.checkWrap}>
                    <Check size={12} color={Colors.primary} strokeWidth={3} />
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Time range */}
        <Text style={styles.sectionLabel}>Hangi saat aralığında?</Text>
        <View style={styles.timeGrid}>
          {TIME_RANGES.map((t) => {
            const active = selectedTime === t.id;
            const emoji = TIME_EMOJIS[t.id] ?? "⏰";
            return (
              <TouchableOpacity
                key={t.id}
                style={[styles.timeCard, active && styles.timeCardActive]}
                onPress={() => handleSelectTime(t.id)}
                activeOpacity={0.8}
              >
                <Text style={styles.timeEmoji}>{emoji}</Text>
                <Text style={[styles.timeText, active && styles.timeTextActive]}>
                  {t.label.split("(")[0].trim()}
                </Text>
                <Text style={[styles.timeSub, active && styles.timeSubActive]}>
                  {(t.label.match(/\(([^)]+)\)/)?.[1]) ?? ""}
                </Text>
                {active && <View style={styles.timeActiveDot} />}
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => {
            void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            navigation.goBack();
          }}
          activeOpacity={0.75}
        >
          <ChevronLeft size={18} color={Colors.textSecondary} strokeWidth={2} />
          <Text style={styles.backText}>Geri</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.cta, !canContinue && styles.ctaDisabled]}
          onPress={() => {
            if (!canContinue) return;
            void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            navigation.navigate("OnboardingStep3", {
              habitName,
              anchorBehavior: selectedAnchor!,
              anchorTime: selectedTime!,
              identityTagId,
            });
          }}
          disabled={!canContinue}
          activeOpacity={0.85}
        >
          <Text style={styles.ctaText}>Devam Et</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  scroll: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.xl,
    flexGrow: 1,
  },

  /* Step bar */
  stepWrap: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.xl,
  },
  stepItem: { alignItems: "center", gap: 4 },
  stepConnector: {
    flex: 1,
    height: 2,
    backgroundColor: Colors.border,
    marginBottom: 14,
  },
  stepConnectorActive: { backgroundColor: Colors.primary },
  stepCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.surface,
    borderWidth: 2,
    borderColor: Colors.border,
  },
  stepCircleActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryLight,
  },
  stepCircleDone: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary,
  },
  stepNum: {
    fontSize: 11,
    fontFamily: "Inter_500Medium",
    color: Colors.textTertiary,
  },
  stepNumActive: { color: Colors.primary },
  stepLabel: {
    fontSize: 10,
    fontFamily: "Inter_400Regular",
    color: Colors.textTertiary,
    letterSpacing: 0.3,
  },
  stepLabelActive: {
    color: Colors.primary,
    fontFamily: "Inter_500Medium",
  },

  /* Header */
  title: {
    fontSize: FontSizes.xxl,
    fontFamily: "Inter_500Medium",
    color: Colors.textPrimary,
    lineHeight: 34,
    letterSpacing: -0.3,
    marginBottom: Spacing.sm,
  },
  sub: {
    fontSize: FontSizes.md,
    fontFamily: "Inter_400Regular",
    color: Colors.textSecondary,
    lineHeight: 22,
    marginBottom: Spacing.lg,
  },

  /* Commitment preview */
  previewCard: {
    backgroundColor: Colors.primaryLight,
    borderRadius: Radii.card,
    borderLeftWidth: 3,
    borderLeftColor: Colors.primary,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    gap: Spacing.sm,
    ...Shadows.soft,
  },
  previewKicker: {
    fontSize: FontSizes.xs,
    fontFamily: "Inter_500Medium",
    color: Colors.primaryDark,
    letterSpacing: 0.8,
  },
  previewPlaceholder: {
    fontSize: FontSizes.md,
    fontFamily: "Inter_400Regular",
    color: Colors.textTertiary,
    fontStyle: "italic",
    lineHeight: 22,
  },
  previewStatement: {
    fontSize: FontSizes.lg,
    lineHeight: 26,
  },
  previewAnchor: {
    fontFamily: "Inter_500Medium",
    color: Colors.primaryDark,
  },
  previewBody: {
    fontFamily: "Inter_400Regular",
    color: Colors.textPrimary,
  },
  previewTimePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    alignSelf: "flex-start",
    backgroundColor: "rgba(47,156,134,0.15)",
    borderRadius: Radii.pill,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
  },
  previewTimeEmoji: { fontSize: 12 },
  previewTimeText: {
    fontSize: FontSizes.xs,
    fontFamily: "Inter_500Medium",
    color: Colors.primaryDark,
  },
  previewHint: {
    fontSize: FontSizes.xs,
    fontFamily: "Inter_400Regular",
    color: Colors.primaryDark,
    fontStyle: "italic",
  },

  /* Info note */
  infoRow: {
    flexDirection: "row",
    gap: 6,
    alignItems: "flex-start",
    marginBottom: Spacing.lg,
  },
  infoText: {
    flex: 1,
    fontSize: FontSizes.xs,
    fontFamily: "Inter_400Regular",
    color: Colors.textTertiary,
    lineHeight: 17,
  },

  /* Sections */
  sectionLabel: {
    fontSize: FontSizes.sm,
    fontFamily: "Inter_500Medium",
    color: Colors.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 0.7,
    marginBottom: Spacing.sm,
  },

  /* Anchor list */
  anchorList: {
    gap: Spacing.xs,
    marginBottom: Spacing.lg,
  },
  anchorOption: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    backgroundColor: Colors.surface,
    borderRadius: Radii.button,
    borderWidth: 1.5,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.md,
    paddingVertical: 13,
    ...Shadows.soft,
  },
  anchorOptionActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryLight,
  },
  anchorEmoji: { fontSize: 18, width: 24, textAlign: "center" },
  anchorText: {
    flex: 1,
    fontSize: FontSizes.md,
    fontFamily: "Inter_400Regular",
    color: Colors.textSecondary,
  },
  anchorTextActive: {
    color: Colors.primaryDark,
    fontFamily: "Inter_500Medium",
  },
  checkWrap: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },

  /* Time grid */
  timeGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  timeCard: {
    width: "47%",
    backgroundColor: Colors.surface,
    borderRadius: Radii.card,
    borderWidth: 1.5,
    borderColor: Colors.border,
    padding: Spacing.md,
    alignItems: "center",
    gap: 4,
    ...Shadows.soft,
    position: "relative",
  },
  timeCardActive: {
    borderColor: Colors.primary,
    backgroundColor: "#F6FDFB",
  },
  timeEmoji: { fontSize: 22 },
  timeText: {
    fontSize: FontSizes.sm,
    fontFamily: "Inter_500Medium",
    color: Colors.textPrimary,
    textAlign: "center",
  },
  timeTextActive: { color: Colors.primaryDark },
  timeSub: {
    fontSize: FontSizes.xs,
    fontFamily: "Inter_400Regular",
    color: Colors.textTertiary,
    textAlign: "center",
  },
  timeSubActive: { color: Colors.primary },
  timeActiveDot: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary,
  },

  /* Footer */
  footer: {
    flexDirection: "row",
    gap: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xl,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  backBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    paddingHorizontal: Spacing.md,
    borderRadius: Radii.button,
    borderWidth: 1.5,
    borderColor: Colors.border,
    gap: 2,
  },
  backText: {
    fontSize: FontSizes.md,
    fontFamily: "Inter_400Regular",
    color: Colors.textSecondary,
  },
  cta: {
    flex: 1,
    backgroundColor: Colors.primary,
    borderRadius: Radii.button,
    paddingVertical: 15,
    alignItems: "center",
    ...Shadows.card,
  },
  ctaDisabled: { opacity: 0.42 },
  ctaText: {
    fontSize: FontSizes.md,
    fontFamily: "Inter_500Medium",
    color: "#fff",
  },
});
