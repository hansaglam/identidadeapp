import React, { RefObject } from "react";
import { useTranslation } from "react-i18next";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from "react-native";
import { EdgeInsets } from "react-native-safe-area-context";
import { ClipboardList, X } from "lucide-react-native";
import type { TomorrowTodoInput } from "../../store/tomorrowPlanStore";
import { Colors, Spacing, Radii, FontSizes } from "../../constants/theme";

export interface TomorrowPlanModalProps {
  visible: boolean;
  onClose: () => void;
  editingTodoId: string | null;
  todoDraft: TomorrowTodoInput;
  onChangeDraft: (patch: Partial<TomorrowTodoInput>) => void;
  habitName: string;
  habitAnchor: string;
  onSave: () => void;
  onDelete: (id: string) => void;
  windowHeight: number;
  insets: EdgeInsets;
  keyboardHeight: number;
  scrollRef: RefObject<ScrollView | null>;
  onFieldFocus: () => void;
}

export default function TomorrowPlanModal({
  visible,
  onClose,
  editingTodoId,
  todoDraft,
  onChangeDraft,
  habitName,
  habitAnchor,
  onSave,
  onDelete,
  windowHeight,
  insets,
  keyboardHeight,
  scrollRef,
  onFieldFocus,
}: TomorrowPlanModalProps) {
  const { t } = useTranslation();
  const canSave = todoDraft.text.trim().length > 0;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <Pressable
          style={styles.backdrop}
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel={t("common.close")}
        />
        <View
          style={[
            styles.sheet,
            {
              marginBottom: keyboardHeight,
              maxHeight: Math.round(windowHeight * 0.78),
              paddingBottom: Math.max(Spacing.lg, insets.bottom + Spacing.sm),
            },
          ]}
        >
          <View style={styles.handle} />
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={styles.iconWrap}>
                <ClipboardList size={20} color={Colors.primary} strokeWidth={1.8} />
              </View>
              <View>
                <Text style={styles.title}>
                  {editingTodoId
                    ? t("journey.tomorrowModal.editTitle")
                    : t("journey.tomorrowModal.addTitle")}
                </Text>
                <Text style={styles.meta}>{t("journey.tomorrowModal.meta")}</Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.closeBtn}
              onPress={onClose}
              hitSlop={12}
              accessibilityLabel={t("common.close")}
            >
              <X size={22} color={Colors.textTertiary} strokeWidth={2} />
            </TouchableOpacity>
          </View>

          <ScrollView
            ref={scrollRef}
            style={styles.scroll}
            contentContainerStyle={[
              styles.scrollContent,
              keyboardHeight > 0 && { paddingBottom: Spacing.md },
            ]}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            bounces={false}
            nestedScrollEnabled
          >
            <View style={styles.form}>
              <View style={styles.field}>
                <Text style={styles.fieldLabel}>{t("journey.tomorrowModal.fieldWhat")}</Text>
                <TextInput
                  style={styles.input}
                  value={todoDraft.text}
                  onChangeText={(text) => onChangeDraft({ text })}
                  onFocus={onFieldFocus}
                  placeholder={habitName || "2 sayfa kitap"}
                  placeholderTextColor="#94A3B8"
                  autoFocus={!editingTodoId}
                />
                <Text style={styles.fieldHint}>{t("journey.tomorrowModal.fieldWhatHint")}</Text>
              </View>
              <View style={styles.field}>
                <Text style={styles.fieldLabel}>{t("journey.tomorrowModal.fieldWhen")}</Text>
                <TextInput
                  style={styles.input}
                  value={todoDraft.time}
                  onChangeText={(time) => onChangeDraft({ time })}
                  onFocus={onFieldFocus}
                  placeholder="Sabah 07:00-08:00"
                  placeholderTextColor="#94A3B8"
                />
              </View>
              <View style={styles.field}>
                <Text style={styles.fieldLabel}>{t("journey.tomorrowModal.fieldContext")}</Text>
                <TextInput
                  style={styles.input}
                  value={todoDraft.context}
                  onChangeText={(context) => onChangeDraft({ context })}
                  onFocus={onFieldFocus}
                  placeholder={habitAnchor || "Kahvemi içtikten sonra"}
                  placeholderTextColor="#94A3B8"
                />
                <Text style={styles.fieldHint}>{t("journey.tomorrowModal.fieldContextHint")}</Text>
              </View>

              <TouchableOpacity
                style={[styles.saveBtn, !canSave && styles.saveBtnDisabled]}
                onPress={onSave}
                disabled={!canSave}
                activeOpacity={0.85}
              >
                <Text style={styles.saveText}>
                  {editingTodoId
                    ? t("common.save")
                    : t("journey.tomorrowModal.addToList")}
                </Text>
              </TouchableOpacity>

              {editingTodoId ? (
                <TouchableOpacity
                  style={styles.deleteBtn}
                  onPress={() => onDelete(editingTodoId)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.deleteText}>{t("journey.tomorrowModal.deleteItem")}</Text>
                </TouchableOpacity>
              ) : null}
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: "flex-end" },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: Colors.overlay,
  },
  sheet: {
    width: "100%",
    flexShrink: 1,
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 16,
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
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: Spacing.sm,
  },
  headerLeft: { flexDirection: "row", alignItems: "center", gap: Spacing.md, flex: 1 },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: Radii.button,
    backgroundColor: Colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },
  closeBtn: { padding: Spacing.xs, borderRadius: Radii.button },
  title: {
    fontSize: FontSizes.xl,
    fontFamily: "Inter_500Medium",
    color: Colors.textPrimary,
  },
  meta: {
    fontSize: FontSizes.xs,
    fontFamily: "Inter_400Regular",
    color: Colors.textTertiary,
  },
  scroll: { flexGrow: 0, flexShrink: 1 },
  scrollContent: { paddingBottom: Spacing.sm },
  form: { gap: 14 },
  field: { gap: 5 },
  fieldLabel: {
    fontSize: FontSizes.xs,
    fontFamily: "Inter_600SemiBold",
    fontWeight: "600",
    color: Colors.textSecondary,
  },
  fieldHint: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    color: Colors.textTertiary,
    lineHeight: 16,
    marginTop: 2,
  },
  input: {
    minHeight: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    backgroundColor: "#F8FAFC",
    paddingHorizontal: 14,
    fontSize: FontSizes.md,
    fontFamily: "Inter_400Regular",
    color: Colors.textPrimary,
  },
  saveBtn: {
    marginTop: 4,
    backgroundColor: Colors.primary,
    borderRadius: Radii.button,
    paddingVertical: 14,
    alignItems: "center",
  },
  saveBtnDisabled: { opacity: 0.45 },
  saveText: {
    fontSize: FontSizes.md,
    fontFamily: "Inter_700Bold",
    fontWeight: "700",
    color: "#FFFFFF",
  },
  deleteBtn: { alignItems: "center", paddingVertical: 10 },
  deleteText: {
    fontSize: FontSizes.sm,
    fontFamily: "Inter_700Bold",
    fontWeight: "700",
    color: "#DC2626",
  },
});
