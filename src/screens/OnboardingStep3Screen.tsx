import React, { useState } from "react";
import {
  View, Text, StyleSheet, TouchableOpacity,
  TextInput, KeyboardAvoidingView, Platform, ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { AuthStackParamList } from "../types";
import { useUserStore } from "../store/userStore";
import {
  scheduleMorningNotifications,
  schedulePhaseTransitions,
} from "../utils/notifications";
import { Colors, Spacing, Radii, FontSizes } from "../constants/theme";

type Props = NativeStackScreenProps<AuthStackParamList, "OnboardingStep3">;

const MIN_CHARS = 10;

export default function OnboardingStep3Screen({ route, navigation }: Props) {
  const { habitName, anchorBehavior } = route.params;
  const [whyText, setWhyText] = useState("");
  const [saving, setSaving] = useState(false);

  const completeOnboarding = useUserStore((s) => s.completeOnboarding);

  const canStart = whyText.trim().length >= MIN_CHARS;

  const handleStart = async () => {
    if (!canStart || saving) return;
    setSaving(true);
    try {
      await completeOnboarding({
        habitName,
        habitAnchor: anchorBehavior,
        habitWhy: whyText.trim(),
      });

      // Load updated profile for notifications
      const profile = useUserStore.getState().profile;
      if (profile) {
        await scheduleMorningNotifications(profile);
        await schedulePhaseTransitions(profile.startDate);
      }

      // Navigate to main app
      navigation.getParent()?.reset({
        index: 0,
        routes: [{ name: "Main" }],
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Step dots — all filled */}
          <View style={styles.stepRow}>
            {[1, 2, 3].map((s) => (
              <View key={s} style={styles.stepActive} />
            ))}
          </View>

          <Text style={styles.title}>Bu kimliği neden istiyorsun?</Text>
          <Text style={styles.sub}>
            Motivasyon geçici bir duygu. Ama "neden" kalıcı bir pusula.
            Düşüş günlerinde seni ayakta tutacak olan bu.
          </Text>

          <TextInput
            style={styles.whyInput}
            value={whyText}
            onChangeText={setWhyText}
            placeholder="Düşünmeden yaz..."
            placeholderTextColor={Colors.textTertiary}
            multiline
            textAlignVertical="top"
            autoFocus
          />

          <View style={styles.hintRow}>
            {!canStart && whyText.length > 0 && (
              <Text style={styles.hint}>
                En az {MIN_CHARS} karakter ({MIN_CHARS - whyText.trim().length} daha)
              </Text>
            )}
            <Text style={styles.charCount}>{whyText.length}</Text>
          </View>

          <View style={styles.infoBox}>
            <Text style={styles.infoText}>
              Bu neden sadece senin için. Kimse görmeyecek.
            </Text>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backText}>Geri</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.cta, !canStart && styles.ctaDisabled]}
            onPress={handleStart}
            disabled={!canStart || saving}
            activeOpacity={0.8}
          >
            <Text style={styles.ctaText}>
              {saving ? "Başlatılıyor..." : "66 Günüm Başlasın →"}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  flex: { flex: 1 },
  scroll: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.xl,
    flexGrow: 1,
  },
  stepRow: {
    flexDirection: "row",
    gap: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  stepActive: {
    flex: 1, height: 3,
    borderRadius: Radii.full,
    backgroundColor: Colors.primary,
  },
  title: {
    fontSize: FontSizes.xxl,
    fontFamily: "Inter_500Medium",
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  sub: {
    fontSize: FontSizes.md,
    fontFamily: "Inter_400Regular",
    color: Colors.textSecondary,
    lineHeight: 22,
    marginBottom: Spacing.lg,
  },
  whyInput: {
    backgroundColor: Colors.surface,
    borderRadius: Radii.card,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    fontSize: FontSizes.lg,
    fontFamily: "Inter_400Regular",
    color: Colors.textPrimary,
    minHeight: 160,
    lineHeight: 26,
  },
  hintRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: Spacing.xs,
    marginBottom: Spacing.md,
  },
  hint: {
    fontSize: FontSizes.sm,
    fontFamily: "Inter_400Regular",
    color: Colors.coral,
  },
  charCount: {
    fontSize: FontSizes.xs,
    fontFamily: "Inter_400Regular",
    color: Colors.textTertiary,
    marginLeft: "auto",
  },
  infoBox: {
    backgroundColor: Colors.primaryLight,
    borderRadius: Radii.card,
    padding: Spacing.md,
  },
  infoText: {
    fontSize: FontSizes.sm,
    fontFamily: "Inter_400Regular",
    color: Colors.primaryDark,
    fontStyle: "italic",
  },
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
    paddingVertical: 15,
    paddingHorizontal: Spacing.lg,
    borderRadius: Radii.button,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: "center",
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
  },
  ctaDisabled: { opacity: 0.45 },
  ctaText: {
    fontSize: FontSizes.md,
    fontFamily: "Inter_500Medium",
    color: "#fff",
  },
});
