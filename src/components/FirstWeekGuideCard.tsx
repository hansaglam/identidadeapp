import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Check } from "lucide-react-native";
import { Spacing, Radii, FontSizes, Colors, Shadows } from "../constants/theme";

interface Props {
  dayNumber: number;
  dismissed: boolean;
  onDismiss: () => void;
  todayDone: boolean;
  recentActionsCount: number;
  mindDumpCount: number;
  journeyOpened: boolean;
}

export default function FirstWeekGuideCard({
  dayNumber,
  dismissed,
  onDismiss,
  todayDone,
  recentActionsCount,
  mindDumpCount,
  journeyOpened,
}: Props) {
  if (dayNumber > 7 || dismissed) return null;

  const steps: { ok: boolean; label: string }[] = [
    { ok: todayDone, label: "Bugün kutusundan check-in veya aksiyon" },
    { ok: recentActionsCount > 0, label: "En az bir canlı aksiyon (karttan)" },
    { ok: mindDumpCount >= 1, label: 'Zihin sekmesinde bir satır bile yaz' },
    { ok: journeyOpened, label: "Yolculuk sekmesini bir kez aç" },
  ];

  return (
    <View style={[styles.card, { borderColor: Colors.border, backgroundColor: Colors.surface }, Shadows.card]}>
      <Text style={[styles.head, { color: Colors.textPrimary }]}>İlk hafta — küçük harita</Text>
      <Text style={[styles.body, { color: Colors.textSecondary }]}>
        Uygulama yoğun; bu dört küçük adım ilk hissi oturtur.
      </Text>
      <View style={styles.rows}>
        {steps.map((s) => (
          <View style={styles.row} key={s.label}>
            <Check
              size={16}
              color={s.ok ? Colors.primary : Colors.textTertiary}
              strokeWidth={2}
              opacity={s.ok ? 1 : 0.35}
            />
            <Text
              style={[styles.rowText, { color: s.ok ? Colors.textSecondary : Colors.textTertiary }]}
            >
              {s.label}
            </Text>
          </View>
        ))}
      </View>
      <TouchableOpacity onPress={onDismiss} hitSlop={12}>
        <Text style={[styles.dismiss, { color: Colors.textTertiary }]}>Anladım, gizle</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: Radii.card,
    borderWidth: 1,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    gap: Spacing.sm,
  },
  head: {
    fontSize: FontSizes.md,
    fontFamily: "Inter_500Medium",
  },
  body: {
    fontSize: FontSizes.sm,
    fontFamily: "Inter_400Regular",
    lineHeight: 20,
  },
  rows: { gap: Spacing.sm },
  row: { flexDirection: "row", alignItems: "center", gap: Spacing.sm },
  rowText: { flex: 1, fontSize: FontSizes.sm, fontFamily: "Inter_400Regular" },
  dismiss: {
    fontSize: FontSizes.sm,
    fontFamily: "Inter_500Medium",
    marginTop: Spacing.xs,
    textAlign: "right",
  },
});
