import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
  TextInput,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { getCheckInConfirmationCopy } from "../constants/checkInConfirmationCopy";

const OTHER_LABEL = "Diğer";

export interface CheckInConfirmationSheetProps {
  visible: boolean;
  onRequestClose: () => void;
  identitySlug: string;
  hapticsEnabled: boolean;
  onSave: (note: string, detail: string | null) => void | Promise<void>;
}

export default function CheckInConfirmationSheet({
  visible,
  onRequestClose,
  identitySlug,
  hapticsEnabled,
  onSave,
}: CheckInConfirmationSheetProps) {
  const { title, options } = useMemo(
    () => getCheckInConfirmationCopy(identitySlug),
    [identitySlug]
  );

  const [selected, setSelected] = useState<string | null>(null);
  const [otherText, setOtherText] = useState("");

  useEffect(() => {
    if (visible) {
      setSelected(null);
      setOtherText("");
    }
  }, [visible]);

  const isOther = selected === OTHER_LABEL;
  const canSave =
    !!selected && (selected !== OTHER_LABEL || otherText.trim().length > 0);

  const fireSelectHaptic = useCallback(() => {
    if (hapticsEnabled) {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  }, [hapticsEnabled]);

  const handleSelect = useCallback(
    (label: string) => {
      fireSelectHaptic();
      setSelected(label);
      if (label !== OTHER_LABEL) {
        setOtherText("");
      }
    },
    [fireSelectHaptic]
  );

  const handleSave = useCallback(async () => {
    if (!canSave || !selected) return;
    if (hapticsEnabled) {
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    const note = selected;
    const detail = selected === OTHER_LABEL ? otherText.trim() : null;
    await onSave(note, detail);
  }, [canSave, selected, otherText, hapticsEnabled, onSave]);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onRequestClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.sheetRoot}
      >
        <Pressable style={styles.backdrop} onPress={onRequestClose} />
        <SafeAreaView edges={["bottom"]} style={styles.sheetSafe}>
          <ScrollView
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.sheetScroll}
          >
            <View style={styles.handle} />

            <Text style={styles.title}>{title}</Text>
            <Text style={styles.subtitle}>Hızlıca kaydet, detayları sonra düşün</Text>

            <View style={styles.grid}>
              {options.map((label) => {
                const isActive = selected === label;
                return (
                  <TouchableOpacity
                    key={label}
                    style={[styles.optionBtn, isActive && styles.optionBtnActive]}
                    onPress={() => handleSelect(label)}
                    activeOpacity={0.85}
                  >
                    <Text style={styles.optionText}>{label}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <TouchableOpacity
              style={[styles.otherRow, selected === OTHER_LABEL && styles.optionBtnActive]}
              onPress={() => handleSelect(OTHER_LABEL)}
              activeOpacity={0.85}
            >
              <Text style={styles.optionText}>{OTHER_LABEL}</Text>
            </TouchableOpacity>

            {isOther ? (
              <TextInput
                style={styles.otherInput}
                value={otherText}
                onChangeText={setOtherText}
                placeholder="Kısaca yaz..."
                placeholderTextColor="#94A3B8"
                multiline
              />
            ) : null}

            <TouchableOpacity
              style={[styles.saveBtn, !canSave && styles.saveBtnDisabled]}
              onPress={() => void handleSave()}
              disabled={!canSave}
              activeOpacity={0.9}
            >
              <Text style={styles.saveBtnText}>Kaydet ve Tamamla</Text>
            </TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  sheetRoot: {
    flex: 1,
    justifyContent: "flex-end",
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(15, 23, 42, 0.45)",
  },
  sheetSafe: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "92%",
  },
  sheetScroll: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 24,
  },
  handle: {
    alignSelf: "center",
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#CBD5E1",
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0F172A",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 13,
    color: "#64748B",
    textAlign: "center",
    marginBottom: 20,
    lineHeight: 18,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  optionBtn: {
    flexGrow: 1,
    flexBasis: "45%",
    minWidth: "45%",
    padding: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
    backgroundColor: "#FFFFFF",
  },
  optionBtnActive: {
    borderColor: "#10B981",
    backgroundColor: "#ECFDF5",
    transform: [{ scale: 0.98 }],
  },
  optionText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#334155",
    textAlign: "center",
  },
  otherRow: {
    marginTop: 10,
    width: "100%",
    padding: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
    backgroundColor: "#FFFFFF",
  },
  otherInput: {
    marginTop: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    padding: 10,
    fontSize: 14,
    color: "#0F172A",
    minHeight: 72,
    textAlignVertical: "top",
  },
  saveBtn: {
    marginTop: 16,
    backgroundColor: "#10B981",
    borderRadius: 12,
    padding: 14,
    alignItems: "center",
  },
  saveBtnDisabled: {
    backgroundColor: "#A7F3D0",
  },
  saveBtnText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 16,
  },
});
