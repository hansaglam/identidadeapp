import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  ActivityIndicator,
  AccessibilityInfo,
} from "react-native";
import { X, Clock, ArrowRight } from "lucide-react-native";
import { Colors, Spacing, Radii, FontSizes } from "../constants/theme";
import { JOURNEY_MIND_DUMP_PREFIX, stripJourneyMindPrefix } from "../constants/mindDumpJourney";
import { saveLastMindSentenceSnippet } from "../utils/journeyEducationPrefs";

const SESSION_SECONDS = 72;
const INPUT_MAX = 260;
const MIN_CHARS = 4;

interface Props {
  visible: boolean;
  onClose: () => void;
  isPremium: boolean;
  onHitFreeLimit: () => void;
  /** Tam metin kalıcı; prefix burada eklenir */
  onSave: (text: string) => Promise<{ hitLimit: boolean }>;
  onOpenMindDump: () => void;
  /** Başarılı kayıttan sonra (örn. Yolculuk snippet’ını yeniden okutmak için) */
  onAfterMindSave?: () => void;
}

export default function JourneyMindSentenceModal({
  visible,
  onClose,
  isPremium,
  onHitFreeLimit,
  onSave,
  onOpenMindDump,
  onAfterMindSave,
}: Props) {
  const [line, setLine] = useState("");
  const [seconds, setSeconds] = useState(SESSION_SECONDS);
  const [busy, setBusy] = useState(false);
  const [sessionEnded, setSessionEnded] = useState(false);

  useEffect(() => {
    if (!visible) return;
    setLine("");
    setBusy(false);
    setSeconds(SESSION_SECONDS);
    setSessionEnded(false);
    let sec = SESSION_SECONDS;
    const iv = setInterval(() => {
      sec -= 1;
      if (sec <= 0) {
        setSeconds(0);
        setSessionEnded(true);
        clearInterval(iv);
      } else {
        setSeconds(sec);
      }
    }, 1000);
    return () => clearInterval(iv);
  }, [visible]);

  useEffect(() => {
    if (!visible || !sessionEnded) return;
    AccessibilityInfo.announceForAccessibility(
      "Yazılı sıra süresi doldu. İstersen yazmaya ve kaydetmeye devam edebilirsin."
    );
  }, [visible, sessionEnded]);

  const save = useCallback(async () => {
    const t = line.trim();
    if (t.length < MIN_CHARS) {
      Alert.alert("Zihin", `En az ${MIN_CHARS} karakter; tek düzgün cümle yeter.`);
      return;
    }
    setBusy(true);
    try {
      const body = `${JOURNEY_MIND_DUMP_PREFIX}${t}`;
      const res = await onSave(body);
      if (res.hitLimit && !isPremium) {
        onHitFreeLimit();
        Alert.alert(
          "Zihin kotası",
          "Ücretsiz planda günlük not sınırına takılmamak için kısıtlı yazım var. Çözüm: Premium veya Zihinden eski kayıtları sadeleştir."
        );
        onClose();
        return;
      }
      const snippet = stripJourneyMindPrefix(body);
      await saveLastMindSentenceSnippet(snippet);
      onAfterMindSave?.();
      Alert.alert("Kaydedildi", "Satırın Zihin listesinde. İstersen sekmeden genişleterek devam et.");
      onClose();
    } catch {
      Alert.alert("Zihin", "Kaydedilemedi. Biraz sonra tekrar dene.");
    } finally {
      setBusy(false);
    }
  }, [line, onSave, isPremium, onHitFreeLimit, onClose, onAfterMindSave]);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose} />
        <View style={styles.sheet}>
          <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
            <View style={styles.head}>
              <View>
                <Text style={styles.title}>Yolculuktan bir cümle</Text>
                <Text style={styles.sub}>Zihin’e mikro çıkış; uzun yazı için sekmede kal.</Text>
              </View>
              <TouchableOpacity onPress={onClose} hitSlop={14} style={styles.closeChip}>
                <X size={20} color={Colors.textSecondary} strokeWidth={1.8} />
              </TouchableOpacity>
            </View>

            <View style={styles.timerBar}>
              <Clock size={16} color={sessionEnded ? Colors.coral : Colors.primary} strokeWidth={2} />
              <Text style={[styles.timerText, sessionEnded && { color: Colors.coral }]}>
                {sessionEnded
                  ? "Sıralı zaman doldu — yine de kaydedebilir veya yazmaya devam edebilirsin."
                  : `Yazılı sıra süresi: ${seconds}s`}
              </Text>
            </View>

            <TextInput
              style={styles.input}
              value={line}
              onChangeText={setLine}
              placeholder={
                sessionEnded ? "Şimdi ne istiyorsan…" : "Şu an için tek cümle bırak (korku, yorgunluk, minnet…)…"
              }
              placeholderTextColor={Colors.textTertiary}
              multiline
              maxLength={INPUT_MAX}
              editable={!busy}
              textAlignVertical="top"
            />
            <Text style={styles.countHint}>
              {line.length}/{INPUT_MAX} karakter · en az {MIN_CHARS}
            </Text>

            <TouchableOpacity
              style={[styles.saveBtn, { opacity: busy ? 0.6 : 1 }]}
              onPress={() => void save()}
              disabled={busy}
              activeOpacity={0.85}
            >
              {busy ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.saveBtnText}>Zihine kaydet</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity style={styles.mindTabRow} onPress={onOpenMindDump} activeOpacity={0.85}>
              <Text style={styles.mindTabText}>Zihin sekmesini tam ekranda aç</Text>
              <ArrowRight size={18} color={Colors.purple} strokeWidth={2} />
            </TouchableOpacity>

            <TouchableOpacity onPress={onClose}>
              <Text style={styles.cancelPlain}>Şimdi değil</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: Colors.overlay,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  sheet: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderTopWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.xl + 12,
    maxHeight: "88%",
  },
  head: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: Spacing.md,
    gap: Spacing.md,
  },
  title: {
    fontSize: FontSizes.xl,
    fontFamily: "Inter_500Medium",
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  sub: {
    fontSize: FontSizes.sm,
    fontFamily: "Inter_400Regular",
    color: Colors.textSecondary,
    lineHeight: 20,
    flexShrink: 1,
    maxWidth: 280,
  },
  closeChip: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Colors.bg,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: Colors.border,
  },
  timerBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    backgroundColor: Colors.primaryLight,
    borderRadius: Radii.button,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    marginBottom: Spacing.md,
  },
  timerText: {
    flex: 1,
    fontSize: FontSizes.xs,
    fontFamily: "Inter_400Regular",
    color: Colors.primaryDark,
    lineHeight: 17,
  },
  input: {
    minHeight: 120,
    maxHeight: 200,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radii.card,
    padding: Spacing.md,
    fontSize: FontSizes.md,
    fontFamily: "Inter_400Regular",
    color: Colors.textPrimary,
    backgroundColor: Colors.bg,
    marginBottom: Spacing.sm,
  },
  countHint: {
    fontSize: FontSizes.xs,
    fontFamily: "Inter_400Regular",
    color: Colors.textTertiary,
    marginBottom: Spacing.md,
    textAlign: "right",
  },
  saveBtn: {
    backgroundColor: Colors.primary,
    borderRadius: Radii.button,
    paddingVertical: Spacing.md,
    alignItems: "center",
    marginBottom: Spacing.sm,
  },
  saveBtnText: {
    fontSize: FontSizes.md,
    fontFamily: "Inter_500Medium",
    color: "#fff",
  },
  mindTabRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
    borderRadius: Radii.button,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.sm,
    backgroundColor: Colors.surface,
  },
  mindTabText: {
    fontSize: FontSizes.sm,
    fontFamily: "Inter_500Medium",
    color: Colors.purple,
  },
  cancelPlain: {
    fontSize: FontSizes.sm,
    fontFamily: "Inter_400Regular",
    color: Colors.textTertiary,
    textAlign: "center",
    marginTop: Spacing.xs,
  },
});
