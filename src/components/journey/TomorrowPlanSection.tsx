import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useTranslation } from "react-i18next";
import { ClipboardList, Clock, MapPin, Plus } from "lucide-react-native";
import type { TomorrowTodoItem } from "../../store/tomorrowPlanStore";
import { Colors, FontSizes, Radii, Spacing, Shadows } from "../../constants/theme";

export interface TomorrowPlanSectionProps {
  primaryTodo: TomorrowTodoItem | null;
  supportTodos: TomorrowTodoItem[];
  isAtTodoLimit: boolean;
  onOpenEditor: (item?: TomorrowTodoItem) => void;
  onDeletePrimary: (id: string) => void;
  /** Yolculuk sekmesinde üst bağlam satırı */
  showJourneyBridge?: boolean;
}

export default function TomorrowPlanSection({
  primaryTodo,
  supportTodos,
  isAtTodoLimit,
  onOpenEditor,
  onDeletePrimary,
  showJourneyBridge = false,
}: TomorrowPlanSectionProps) {
  const { t } = useTranslation();
  return (
    <View style={styles.planStack}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionLabel}>{t("journey.tomorrowPlan.sectionLabel")}</Text>
        {showJourneyBridge ? (
          <Text style={styles.sectionHint} numberOfLines={2}>
            {t("journey.tomorrowPlan.bridgeTitle")} — {t("journey.tomorrowPlan.bridgeBody")}
          </Text>
        ) : null}
      </View>
      <View style={styles.tomorrowPlanCard}>
        {primaryTodo ? (
          <>
            <View style={styles.planCardHeader}>
              <View style={styles.planCardHeaderLeft}>
                <View style={styles.planIconWrap}>
                  <ClipboardList size={14} color={Colors.primary} strokeWidth={2} />
                </View>
                <View style={styles.planHeaderText}>
                  <Text style={styles.planKicker}>{t("journey.tomorrowPlan.kicker")}</Text>
                  <Text style={styles.planAction} numberOfLines={1}>
                    {t("journey.tomorrowPlan.action")}
                  </Text>
                </View>
              </View>
              <View style={styles.planStatusPill}>
                <Text style={styles.planStatusText}>{t("journey.tomorrowPlan.statusTomorrow")}</Text>
              </View>
            </View>

            <View style={styles.todoList}>
              <TouchableOpacity
                style={styles.primaryTodoRow}
                onPress={() => onOpenEditor(primaryTodo)}
                activeOpacity={0.88}
              >
                <View style={styles.todoCheckPlanned} />
                <View style={styles.todoTextWrap}>
                  <Text style={styles.primaryTodoText} numberOfLines={2}>
                    {primaryTodo.text}
                  </Text>
                  <View style={styles.todoMetaRow}>
                    {primaryTodo.time ? (
                      <View style={styles.todoMetaChip}>
                        <Clock size={10} color={Colors.textTertiary} strokeWidth={2} />
                        <Text style={styles.todoMetaChipText}>{primaryTodo.time}</Text>
                      </View>
                    ) : null}
                    {primaryTodo.context ? (
                      <View style={styles.todoMetaChip}>
                        <MapPin size={10} color={Colors.textTertiary} strokeWidth={2} />
                        <Text style={styles.todoMetaChipText} numberOfLines={1}>
                          {primaryTodo.context}
                        </Text>
                      </View>
                    ) : null}
                    {!primaryTodo.time && !primaryTodo.context ? (
                      <Text style={styles.todoMeta}>{t("journey.tomorrowPlan.addMeta")}</Text>
                    ) : null}
                  </View>
                </View>
              </TouchableOpacity>

              {supportTodos.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={styles.supportTodoRow}
                  onPress={() => onOpenEditor(item)}
                  activeOpacity={0.88}
                >
                  <View style={styles.todoCheckSmallPlanned} />
                  <View style={styles.todoTextWrap}>
                    <Text style={styles.supportTodoText} numberOfLines={2}>
                      {item.text}
                    </Text>
                    {item.time || item.context ? (
                      <Text style={styles.todoMeta} numberOfLines={1}>
                        {[item.time, item.context].filter(Boolean).join(" · ")}
                      </Text>
                    ) : null}
                  </View>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.todoFooter}>
              {!isAtTodoLimit ? (
                <TouchableOpacity
                  style={styles.planAddSmallBtn}
                  onPress={() => onOpenEditor()}
                  activeOpacity={0.85}
                >
                  <Plus size={13} color={Colors.primaryDark} strokeWidth={2.5} />
                  <Text style={styles.planAddSmallText}>{t("journey.tomorrowPlan.addSupport")}</Text>
                </TouchableOpacity>
              ) : (
                <Text style={styles.todoLimitText}>{t("journey.tomorrowPlan.limitHint")}</Text>
              )}
              <TouchableOpacity
                style={styles.planDeleteBtn}
                onPress={() => onDeletePrimary(primaryTodo.id)}
                activeOpacity={0.8}
              >
                <Text style={styles.planDeleteText}>{t("journey.tomorrowPlan.resetList")}</Text>
              </TouchableOpacity>
            </View>
          </>
        ) : (
          <View style={styles.emptyWrap}>
            <View style={styles.emptyIconWrap}>
              <ClipboardList size={20} color={Colors.primary} strokeWidth={1.8} />
            </View>
            <Text style={styles.planEmptyTitle}>{t("journey.tomorrowPlan.emptyTitle")}</Text>
            <Text style={styles.planEmptySub} numberOfLines={3}>
              {t("journey.tomorrowPlan.emptySub")}
            </Text>
            <TouchableOpacity style={styles.planAddBtn} onPress={() => onOpenEditor()} activeOpacity={0.85}>
              <Text style={styles.planAddText}>{t("journey.tomorrowPlan.addFirst")}</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  planStack: { gap: 8 },
  sectionHeader: { gap: 3, marginBottom: 2 },
  sectionLabel: {
    fontSize: 10,
    fontFamily: "Inter_700Bold",
    fontWeight: "700",
    letterSpacing: 1.2,
    color: "#94A3B8",
    textTransform: "uppercase",
  },
  sectionHint: {
    fontSize: FontSizes.xs,
    fontFamily: "Inter_400Regular",
    color: Colors.textTertiary,
    lineHeight: 16,
  },
  tomorrowPlanCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radii.card,
    padding: 12,
    borderWidth: 1,
    borderColor: "rgba(16, 185, 129, 0.14)",
    ...Shadows.soft,
  },
  planCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  planCardHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flex: 1,
    minWidth: 0,
  },
  planHeaderText: { flex: 1, minWidth: 0 },
  planIconWrap: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: Colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },
  planKicker: {
    fontSize: 9,
    fontFamily: "Inter_600SemiBold",
    fontWeight: "600",
    color: Colors.primary,
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  planAction: {
    fontSize: FontSizes.sm,
    fontFamily: "Inter_600SemiBold",
    fontWeight: "600",
    color: Colors.textPrimary,
    lineHeight: 18,
  },
  planStatusPill: {
    backgroundColor: "#ECFDF5",
    borderRadius: Radii.pill,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: "#A7F3D0",
  },
  planStatusText: {
    fontSize: 9,
    fontFamily: "Inter_600SemiBold",
    fontWeight: "600",
    color: "#059669",
  },
  todoList: { marginTop: 10, gap: 6 },
  primaryTodoRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: "rgba(16, 185, 129, 0.18)",
    gap: 8,
  },
  supportTodoRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surface,
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 8,
  },
  todoCheckPlanned: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: "#A7F3D0",
    backgroundColor: Colors.surface,
  },
  todoCheckSmallPlanned: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "#CBD5E1",
    backgroundColor: Colors.surface,
  },
  todoTextWrap: { flex: 1, minWidth: 0 },
  primaryTodoText: {
    fontSize: FontSizes.sm,
    fontFamily: "Inter_600SemiBold",
    fontWeight: "600",
    color: Colors.textPrimary,
    lineHeight: 19,
  },
  supportTodoText: {
    fontSize: FontSizes.xs,
    fontFamily: "Inter_500Medium",
    color: Colors.textPrimary,
    lineHeight: 17,
  },
  todoMetaRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 4,
    marginTop: 3,
  },
  todoMetaChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    backgroundColor: "#F1F5F9",
    borderRadius: Radii.pill,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  todoMetaChipText: {
    fontSize: 9,
    fontFamily: "Inter_500Medium",
    color: Colors.textTertiary,
  },
  todoMeta: {
    marginTop: 2,
    fontSize: 10,
    fontFamily: "Inter_400Regular",
    color: Colors.textTertiary,
    lineHeight: 14,
  },
  todoFooter: { gap: 6, marginTop: 10 },
  planAddSmallBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    backgroundColor: Colors.primaryLight,
    borderRadius: 10,
    paddingVertical: 9,
  },
  planAddSmallText: {
    fontSize: FontSizes.xs,
    fontFamily: "Inter_600SemiBold",
    fontWeight: "600",
    color: Colors.primaryDark,
  },
  todoLimitText: {
    fontSize: FontSizes.xs,
    fontFamily: "Inter_500Medium",
    color: Colors.textTertiary,
    textAlign: "center",
    paddingVertical: 2,
  },
  planDeleteBtn: {
    alignItems: "center",
    paddingVertical: 6,
  },
  planDeleteText: {
    fontSize: 10,
    fontFamily: "Inter_500Medium",
    fontWeight: "500",
    color: "#DC2626",
  },
  emptyWrap: {
    alignItems: "center",
    paddingVertical: 4,
    gap: 6,
  },
  emptyIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: Colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },
  planEmptyTitle: {
    fontSize: FontSizes.md,
    fontFamily: "Inter_600SemiBold",
    fontWeight: "600",
    color: Colors.textPrimary,
    textAlign: "center",
  },
  planEmptySub: {
    fontSize: FontSizes.xs,
    fontFamily: "Inter_400Regular",
    color: Colors.textSecondary,
    lineHeight: 17,
    textAlign: "center",
    paddingHorizontal: Spacing.xs,
  },
  planAddBtn: {
    marginTop: 2,
    backgroundColor: Colors.primary,
    borderRadius: 10,
    paddingVertical: 11,
    alignItems: "center",
    alignSelf: "stretch",
  },
  planAddText: {
    fontSize: FontSizes.sm,
    fontFamily: "Inter_600SemiBold",
    fontWeight: "600",
    color: "#FFFFFF",
  },
});
