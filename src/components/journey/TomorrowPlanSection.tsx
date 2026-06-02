import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
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
  return (
    <View style={styles.planStack}>
      {showJourneyBridge ? (
        <View style={styles.bridgeCard}>
          <Text style={styles.bridgeTitle}>Yarını bugünden planla</Text>
          <Text style={styles.bridgeBody}>
            Ana ekrandaki check-in ve mikro adımlar bu listeyle uyumlu. Yarın sabah net bir çapa
            bırak.
          </Text>
        </View>
      ) : null}
      <View style={styles.sectionLabelRow}>
        <Text style={styles.sectionLabel}>YARININ KÜÇÜK LİSTESİ</Text>
      </View>
      <View style={styles.tomorrowPlanCard}>
        {primaryTodo ? (
          <>
            <View style={styles.planCardHeader}>
              <View style={styles.planCardHeaderLeft}>
                <View style={styles.planIconWrap}>
                  <ClipboardList size={16} color={Colors.primary} strokeWidth={2} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.planKicker}>Yarın otomatikleşsin diye</Text>
                  <Text style={styles.planAction}>1 ana adımı netleştir</Text>
                </View>
              </View>
              <View style={styles.planStatusPill}>
                <Text style={styles.planStatusText}>Yarın</Text>
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
                  <Text style={styles.primaryTodoText}>{primaryTodo.text}</Text>
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
                        <Text style={styles.todoMetaChipText}>{primaryTodo.context}</Text>
                      </View>
                    ) : null}
                    {!primaryTodo.time && !primaryTodo.context ? (
                      <Text style={styles.todoMeta}>Saat veya tetikleyici ekleyebilirsin</Text>
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
                    <Text style={styles.supportTodoText}>{item.text}</Text>
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
                  <Plus size={14} color={Colors.primaryDark} strokeWidth={2.5} />
                  <Text style={styles.planAddSmallText}>Küçük madde ekle</Text>
                </TouchableOpacity>
              ) : (
                <Text style={styles.todoLimitText}>3 madde yeterli — basit tut.</Text>
              )}
              <TouchableOpacity
                style={styles.planDeleteBtn}
                onPress={() => onDeletePrimary(primaryTodo.id)}
                activeOpacity={0.8}
              >
                <Text style={styles.planDeleteText}>Listeyi sıfırla</Text>
              </TouchableOpacity>
            </View>
          </>
        ) : (
          <View style={styles.emptyWrap}>
            <View style={styles.emptyIconWrap}>
              <ClipboardList size={24} color={Colors.primary} strokeWidth={1.8} />
            </View>
            <Text style={styles.planEmptyTitle}>Yarın için küçük liste kur</Text>
            <Text style={styles.planEmptySub}>
              Tek ana mikro adımı seç. Sabah hatırlatma gelir, check-in Bugün ekranından yapılır.
            </Text>
            <TouchableOpacity style={styles.planAddBtn} onPress={() => onOpenEditor()} activeOpacity={0.85}>
              <Text style={styles.planAddText}>İlk maddeyi ekle</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  planStack: { gap: 12 },
  bridgeCard: {
    backgroundColor: Colors.primaryLight,
    borderRadius: Radii.card,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: "rgba(47, 156, 134, 0.2)",
  },
  bridgeTitle: {
    fontSize: FontSizes.sm,
    fontFamily: "Inter_600SemiBold",
    fontWeight: "600",
    color: Colors.primaryDark,
    marginBottom: 4,
  },
  bridgeBody: {
    fontSize: FontSizes.sm,
    fontFamily: "Inter_400Regular",
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  sectionLabelRow: { marginTop: 24, marginBottom: 10 },
  sectionLabel: {
    fontSize: 11,
    fontFamily: "Inter_700Bold",
    fontWeight: "700",
    letterSpacing: 1.5,
    color: "#94A3B8",
    textTransform: "uppercase",
  },
  tomorrowPlanCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radii.card,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(16, 185, 129, 0.14)",
    ...Shadows.card,
  },
  planCardHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
  },
  planCardHeaderLeft: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    flex: 1,
  },
  planIconWrap: {
    width: 36,
    height: 36,
    borderRadius: Radii.button,
    backgroundColor: Colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
  },
  planKicker: {
    fontSize: FontSizes.xs,
    fontFamily: "Inter_600SemiBold",
    fontWeight: "600",
    color: Colors.primary,
    letterSpacing: 0.6,
    textTransform: "uppercase",
    marginBottom: 4,
  },
  planAction: {
    fontSize: FontSizes.lg,
    fontFamily: "Inter_600SemiBold",
    fontWeight: "700",
    color: Colors.textPrimary,
    lineHeight: 24,
  },
  planStatusPill: {
    backgroundColor: "#ECFDF5",
    borderRadius: Radii.pill,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: "#A7F3D0",
  },
  planStatusText: {
    fontSize: FontSizes.xs,
    fontFamily: "Inter_600SemiBold",
    fontWeight: "600",
    color: "#059669",
  },
  todoList: { marginTop: 14, gap: 8 },
  primaryTodoRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    borderRadius: Radii.button,
    padding: 12,
    borderWidth: 1,
    borderColor: "rgba(16, 185, 129, 0.18)",
    gap: 10,
  },
  supportTodoRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surface,
    borderRadius: Radii.button,
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 10,
  },
  todoCheckPlanned: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 2,
    borderColor: "#A7F3D0",
    backgroundColor: Colors.surface,
  },
  todoCheckSmallPlanned: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: "#CBD5E1",
    backgroundColor: Colors.surface,
  },
  todoTextWrap: { flex: 1, minWidth: 0 },
  primaryTodoText: {
    fontSize: FontSizes.md,
    fontFamily: "Inter_600SemiBold",
    fontWeight: "600",
    color: Colors.textPrimary,
    lineHeight: 21,
  },
  supportTodoText: {
    fontSize: FontSizes.sm,
    fontFamily: "Inter_500Medium",
    color: Colors.textPrimary,
    lineHeight: 19,
  },
  todoMetaRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginTop: 4,
  },
  todoMetaChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    backgroundColor: "#F1F5F9",
    borderRadius: Radii.pill,
    paddingHorizontal: 7,
    paddingVertical: 3,
  },
  todoMetaChipText: {
    fontSize: 10,
    fontFamily: "Inter_500Medium",
    color: Colors.textTertiary,
  },
  todoMeta: {
    marginTop: 2,
    fontSize: FontSizes.xs,
    fontFamily: "Inter_400Regular",
    color: Colors.textTertiary,
    lineHeight: 17,
  },
  todoFooter: { gap: 8, marginTop: 14 },
  planAddSmallBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: Colors.primaryLight,
    borderRadius: Radii.button,
    paddingVertical: 11,
  },
  planAddSmallText: {
    fontSize: FontSizes.sm,
    fontFamily: "Inter_600SemiBold",
    fontWeight: "600",
    color: Colors.primaryDark,
  },
  todoLimitText: {
    fontSize: FontSizes.xs,
    fontFamily: "Inter_500Medium",
    color: Colors.textTertiary,
    textAlign: "center",
    paddingVertical: 4,
  },
  planDeleteBtn: {
    alignItems: "center",
    paddingVertical: 10,
  },
  planDeleteText: {
    fontSize: FontSizes.xs,
    fontFamily: "Inter_500Medium",
    fontWeight: "500",
    color: "#DC2626",
  },
  emptyWrap: {
    alignItems: "center",
    paddingVertical: Spacing.sm,
    gap: Spacing.sm,
  },
  emptyIconWrap: {
    width: 48,
    height: 48,
    borderRadius: Radii.card,
    backgroundColor: Colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },
  planEmptyTitle: {
    fontSize: FontSizes.lg,
    fontFamily: "Inter_600SemiBold",
    fontWeight: "600",
    color: Colors.textPrimary,
    textAlign: "center",
  },
  planEmptySub: {
    fontSize: FontSizes.sm,
    fontFamily: "Inter_400Regular",
    color: Colors.textSecondary,
    lineHeight: 20,
    textAlign: "center",
    paddingHorizontal: Spacing.sm,
  },
  planAddBtn: {
    marginTop: 4,
    backgroundColor: Colors.primary,
    borderRadius: Radii.button,
    paddingVertical: 13,
    alignItems: "center",
    alignSelf: "stretch",
  },
  planAddText: {
    fontSize: FontSizes.md,
    fontFamily: "Inter_600SemiBold",
    fontWeight: "600",
    color: "#FFFFFF",
  },
});
