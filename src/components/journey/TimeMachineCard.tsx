import React, { useMemo, useState, useCallback } from "react";
import { View, Text, TouchableOpacity, TextInput, StyleSheet } from "react-native";
import { Clock } from "lucide-react-native";
import { useHabitStore } from "../../store/habitStore";
import type { CheckinRecord } from "../../types";

type Props = {
  dayNumber: number;
  checkins: Record<string, CheckinRecord>;
  completedCount: number;
};

/**
 * Yolculuk sekmesi: geçmiş bir günün teyit notunu gösterir; kullanıcı yorum kaydedebilir.
 */
export default function TimeMachineCard({
  dayNumber,
  checkins,
  completedCount,
}: Props) {
  const addJourneyReflection = useHabitStore((s) => s.addJourneyReflection);

  const checkinDigest = useMemo(() => {
    return Object.values(checkins)
      .filter((r) => r.completed && r.day >= 1 && r.day <= Math.max(0, dayNumber - 2))
      .map((r) => `${r.day}:${r.checkInNote ?? ""}:${r.checkInDetail ?? ""}`)
      .sort()
      .join("|");
  }, [checkins, dayNumber]);

  const pick = useMemo(() => {
    if (completedCount < 3 || dayNumber <= 3) return null;
    const d = Math.floor(Math.random() * (dayNumber - 2)) + 1;
    const record = Object.values(checkins).find((r) => r.completed && r.day === d);
    if (!record) return null;
    const note =
      record.checkInNote?.trim() ||
      record.checkInDetail?.trim() ||
      "";
    const daysAgo = dayNumber - d;
    return { d, note, daysAgo };
  }, [dayNumber, completedCount, checkinDigest]);

  const [showInput, setShowInput] = useState(false);
  const [commentDraft, setCommentDraft] = useState("");

  const saveComment = useCallback(async () => {
    const text = commentDraft.trim();
    if (!text || !pick) return;
    await addJourneyReflection({
      day: pick.d,
      comment: text,
      date: new Date().toISOString(),
    });
    setCommentDraft("");
    setShowInput(false);
  }, [addJourneyReflection, commentDraft, pick]);

  if (!pick) return null;

  const { daysAgo, note } = pick;

  return (
    <View style={styles.card}>
      <View style={styles.labelRow}>
        <Clock size={16} color="#D97706" strokeWidth={2} />
        <Text style={styles.label}>⏳ ZAMAN MAKİNESİ</Text>
      </View>
      <Text style={styles.quote}>
        {daysAgo} gün önce bugün: &apos;{note}&apos;
      </Text>
      <Text style={styles.prompt}>Şimdi bakınca ne hissediyorsun?</Text>
      <TouchableOpacity
        style={styles.commentBtn}
        onPress={() => setShowInput((v) => !v)}
        activeOpacity={0.8}
      >
        <Text style={styles.commentBtnText}>📝 Yorum ekle</Text>
      </TouchableOpacity>
      {showInput ? (
        <TextInput
          style={styles.input}
          value={commentDraft}
          onChangeText={setCommentDraft}
          placeholder="Yorumun..."
          placeholderTextColor="#A78B5C"
          multiline
          onSubmitEditing={() => void saveComment()}
          blurOnSubmit
        />
      ) : null}
      {showInput && commentDraft.trim().length > 0 ? (
        <TouchableOpacity style={styles.saveHint} onPress={() => void saveComment()} activeOpacity={0.8}>
          <Text style={styles.saveHintText}>Kaydet</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FEF3C7",
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginTop: 16,
    borderLeftWidth: 3,
    borderLeftColor: "#F59E0B",
  },
  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 10,
  },
  label: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.5,
    color: "#D97706",
  },
  quote: {
    fontSize: 14,
    fontStyle: "italic",
    color: "#92400E",
    lineHeight: 20,
    marginBottom: 10,
  },
  prompt: {
    fontSize: 13,
    color: "#78350F",
    marginBottom: 12,
  },
  commentBtn: {
    borderWidth: 1,
    borderColor: "#FCD34D",
    borderRadius: 8,
    padding: 8,
    alignSelf: "flex-start",
  },
  commentBtnText: {
    fontSize: 14,
    color: "#78350F",
  },
  input: {
    marginTop: 12,
    minHeight: 72,
    borderWidth: 1,
    borderColor: "#FCD34D",
    borderRadius: 8,
    padding: 10,
    fontSize: 14,
    color: "#78350F",
    backgroundColor: "#FFFBEB",
    textAlignVertical: "top",
  },
  saveHint: {
    marginTop: 8,
    alignSelf: "flex-end",
  },
  saveHintText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#D97706",
  },
});
