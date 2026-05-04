import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Pressable,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { X } from "lucide-react-native";
import { Colors, Spacing, Radii, FontSizes } from "../constants/theme";

const MIN_WHY = 10;
const MAX_HABIT = 80;
const MAX_ANCHOR = 140;

interface Props {
  visible: boolean;
  onClose: () => void;
  habitName: string;
  habitAnchor: string;
  habitWhy: string;
  onSave: (p: {
    habitName: string;
    habitAnchor: string;
    habitWhy: string;
  }) => Promise<void>;
}

export default function EditCommitmentModal({
  visible,
  onClose,
  habitName: h0,
  habitAnchor: a0,
  habitWhy: w0,
  onSave,
}: Props) {
  const insets = useSafeAreaInsets();
  const [habitName, setHabitName] = useState(h0);
  const [habitAnchor, setHabitAnchor] = useState(a0);
  const [habitWhy, setHabitWhy] = useState(w0);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (visible) {
      setHabitName(h0);
      setHabitAnchor(a0);
      setHabitWhy(w0);
    }
  }, [visible, h0, a0, w0]);

  const trimmedName = habitName.trim();
  const trimmedAnchor = habitAnchor.trim();
  const trimmedWhy = habitWhy.trim();
  const canSave =
    trimmedName.length >= 2 &&
    trimmedAnchor.length >= 2 &&
    trimmedWhy.length >= MIN_WHY;

  const handleSave = async () => {
    if (!canSave || saving) return;
    setSaving(true);
    try {
      await onSave({
        habitName: trimmedName.slice(0, MAX_HABIT),
        habitAnchor: trimmedAnchor.slice(0, MAX_ANCHOR),
        habitWhy: trimmedWhy,
      });
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.wrap}
      >
        <Pressable style={styles.backdrop} onPress={onClose} />
        <View
          style={[
            styles.sheet,
            { paddingBottom: Math.max(insets.bottom, Spacing.md) },
          ]}
        >
          <View style={styles.header}>
            <Text style={styles.title}>Alışkanlık ve bağ</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn} hitSlop={8}>
              <X size={18} color={Colors.textTertiary} strokeWidth={1.5} />
            </TouchableOpacity>
          </View>
          <ScrollView
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <Text style={styles.label}>Kimlik hedefin (kısa ifade)</Text>
            <TextInput
              style={styles.input}
              value={habitName}
              onChangeText={setHabitName}
              maxLength={MAX_HABIT}
              placeholder="Örn: Her gün hareket eden biriyim"
            />
            <Text style={styles.label}>Çapa (rütin)</Text>
            <TextInput
              style={styles.input}
              value={habitAnchor}
              onChangeText={setHabitAnchor}
              maxLength={MAX_ANCHOR}
              placeholder="Örn: Kahvemi içtikten sonra"
              multiline
            />
            <Text style={styles.label}>Bu yönü neden istiyorsun?</Text>
            <TextInput
              style={[styles.input, styles.inputTall]}
              value={habitWhy}
              onChangeText={setHabitWhy}
              multiline
              textAlignVertical="top"
              placeholder="En az 10 karakter"
            />
            <Text style={styles.hint}>
              Kimlik şablonunu değiştirmek onboarding’den yeniden seçim gerektirir; burada günlük
              ifadeni güncellersin.
            </Text>
          </ScrollView>
          <TouchableOpacity
            style={[styles.saveBtn, (!canSave || saving) && styles.saveBtnDisabled]}
            onPress={handleSave}
            disabled={!canSave || saving}
            activeOpacity={0.85}
          >
            <Text style={styles.saveBtnText}>
              {saving ? "Kaydediliyor..." : "Kaydet"}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, justifyContent: "flex-end" },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: Colors.overlay,
  },
  sheet: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: Radii.card + 6,
    borderTopRightRadius: Radii.card + 6,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    maxHeight: "92%",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: Spacing.md,
  },
  title: {
    flex: 1,
    fontSize: FontSizes.lg,
    fontFamily: "Inter_500Medium",
    color: Colors.textPrimary,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.bg,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    fontSize: FontSizes.sm,
    fontFamily: "Inter_500Medium",
    color: Colors.textTertiary,
    marginBottom: 6,
    marginTop: Spacing.sm,
  },
  input: {
    backgroundColor: Colors.bg,
    borderRadius: Radii.button,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.md,
    paddingVertical: 12,
    fontSize: FontSizes.md,
    fontFamily: "Inter_400Regular",
    color: Colors.textPrimary,
  },
  inputTall: { minHeight: 100 },
  hint: {
    fontSize: FontSizes.xs,
    fontFamily: "Inter_400Regular",
    color: Colors.textTertiary,
    lineHeight: 18,
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
  },
  saveBtn: {
    marginTop: Spacing.md,
    backgroundColor: Colors.primary,
    borderRadius: Radii.button,
    paddingVertical: 14,
    alignItems: "center",
  },
  saveBtnDisabled: { opacity: 0.45 },
  saveBtnText: {
    fontSize: FontSizes.md,
    fontFamily: "Inter_500Medium",
    color: "#fff",
  },
});
