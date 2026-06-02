import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
  TouchableOpacity,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { X } from "lucide-react-native";
import type { JourneyDayDetail } from "../../utils/journeyDayDetail";
import { Colors, Spacing, Radii, FontSizes } from "../../constants/theme";

const STATUS_LABEL: Record<JourneyDayDetail["status"], string> = {
  done: "Tamamlandı",
  missed: "Kaçırıldı",
  future: "Gelecek",
  today: "Bugün",
  before_start: "—",
};

interface Props {
  visible: boolean;
  detail: JourneyDayDetail | null;
  onClose: () => void;
}

export default function JourneyDayDetailSheet({ visible, detail, onClose }: Props) {
  const insets = useSafeAreaInsets();
  if (!detail) return null;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable
          style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, Spacing.md) }]}
          onPress={(e) => e.stopPropagation()}
        >
          <View style={styles.handle} />
          <View style={styles.header}>
            <View style={{ flex: 1 }}>
              <Text style={styles.title}>Gün {detail.day}</Text>
              <Text style={styles.date}>{detail.dateLabel}</Text>
            </View>
            <TouchableOpacity onPress={onClose} hitSlop={12}>
              <X size={20} color={Colors.textTertiary} strokeWidth={2} />
            </TouchableOpacity>
          </View>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{STATUS_LABEL[detail.status]}</Text>
          </View>
          {detail.lines.map((line, i) => (
            <Text key={`${i}-${line}`} style={styles.line}>
              {line}
            </Text>
          ))}
          <TouchableOpacity style={styles.btn} onPress={onClose} activeOpacity={0.85}>
            <Text style={styles.btnText}>Kapat</Text>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: Colors.overlay,
  },
  sheet: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: Radii.card + 8,
    borderTopRightRadius: Radii.card + 8,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.sm,
  },
  handle: {
    alignSelf: "center",
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.border,
    marginBottom: Spacing.md,
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: Spacing.sm,
  },
  title: {
    fontSize: FontSizes.lg,
    fontFamily: "Inter_600SemiBold",
    fontWeight: "600",
    color: Colors.textPrimary,
  },
  date: {
    fontSize: FontSizes.sm,
    fontFamily: "Inter_400Regular",
    color: Colors.textSecondary,
    marginTop: 4,
  },
  badge: {
    alignSelf: "flex-start",
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radii.pill,
    marginBottom: Spacing.md,
  },
  badgeText: {
    fontSize: FontSizes.xs,
    fontFamily: "Inter_600SemiBold",
    fontWeight: "600",
    color: Colors.primaryDark,
  },
  line: {
    fontSize: FontSizes.sm,
    fontFamily: "Inter_400Regular",
    color: Colors.textSecondary,
    lineHeight: 22,
    marginBottom: 6,
  },
  btn: {
    marginTop: Spacing.md,
    backgroundColor: Colors.primary,
    borderRadius: Radii.button,
    paddingVertical: 14,
    alignItems: "center",
  },
  btnText: {
    fontSize: FontSizes.md,
    fontFamily: "Inter_600SemiBold",
    fontWeight: "600",
    color: "#fff",
  },
});
