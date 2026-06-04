import React, { useMemo } from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { Check, Clock } from "lucide-react-native";
import { Colors, Spacing, Radii, FontSizes } from "../../constants/theme";
import { useTranslation } from "react-i18next";
import type { TomorrowTodoItem } from "../../store/tomorrowPlanStore";

interface Props {
  items: TomorrowTodoItem[];
  /** Check-in tamamlandı veya check-in animasyonu sürüyor */
  planLocked: boolean;
  todayDone: boolean;
  onToggle: (itemId: string) => void;
}

function sortItems(items: TomorrowTodoItem[]): TomorrowTodoItem[] {
  const primary = items.filter((i) => i.isPrimary);
  const support = items.filter((i) => !i.isPrimary);
  return [...primary, ...support];
}

export default function TodayPlanCard({ items, planLocked, todayDone, onToggle }: Props) {
  const { t } = useTranslation();
  const sorted = useMemo(() => sortItems(items), [items]);
  const total = items.length;
  const doneCount = todayDone
    ? total
    : items.filter((i) => i.completed).length;
  const allPlanDone = total > 0 && (todayDone || doneCount === total);
  const showCompleted = (item: TomorrowTodoItem) => todayDone || item.completed;

  if (!total) return null;

  const badgeLabel = todayDone
    ? t("home.plans.planDoneShort")
    : t("home.plans.planProgress", { done: doneCount, total });

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.label}>{t("home.plans.todayPlan")}</Text>
        <View
          style={[
            styles.badge,
            (todayDone || allPlanDone) && styles.badgeDone,
          ]}
        >
          {todayDone || allPlanDone ? (
            <Check size={10} color={Colors.primaryDark} strokeWidth={3} />
          ) : null}
          <Text
            style={[
              styles.badgeText,
              (todayDone || allPlanDone) && styles.badgeTextDone,
            ]}
          >
            {badgeLabel}
          </Text>
        </View>
      </View>

      <View style={styles.list}>
        {sorted.map((item) => {
          const meta = [item.time, item.context].filter(Boolean).join(" · ");
          const completed = showCompleted(item);
          const rowContent = (
            <>
              <View
                style={[
                  styles.check,
                  item.isPrimary ? styles.checkPrimary : styles.checkSupport,
                  completed && styles.checkDone,
                ]}
              >
                {completed ? (
                  <Check size={item.isPrimary ? 12 : 10} color="#fff" strokeWidth={3} />
                ) : null}
              </View>
              <View style={styles.textCol}>
                <Text
                  style={[
                    item.isPrimary ? styles.primaryText : styles.supportText,
                    completed && styles.textCompleted,
                  ]}
                  numberOfLines={item.isPrimary ? 2 : 1}
                >
                  {item.text}
                </Text>
                {meta ? (
                  <View style={styles.metaRow}>
                    <Clock size={10} color={Colors.textTertiary} strokeWidth={2} />
                    <Text style={styles.meta} numberOfLines={1}>
                      {meta}
                    </Text>
                  </View>
                ) : null}
              </View>
            </>
          );

          if (planLocked) {
            return (
              <View
                key={item.id}
                style={[
                  styles.row,
                  item.isPrimary ? styles.rowPrimary : styles.rowSupport,
                  completed && styles.rowCompleted,
                  styles.rowLocked,
                ]}
                accessibilityRole="text"
                accessibilityLabel={item.text}
              >
                {rowContent}
              </View>
            );
          }

          return (
            <Pressable
              key={item.id}
              style={({ pressed }) => [
                styles.row,
                item.isPrimary ? styles.rowPrimary : styles.rowSupport,
                completed && styles.rowCompleted,
                pressed && styles.rowPressed,
              ]}
              onPress={() => onToggle(item.id)}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: completed }}
              accessibilityLabel={item.text}
            >
              {rowContent}
            </Pressable>
          );
        })}
      </View>

      {!planLocked && !allPlanDone ? (
        <Text style={styles.hint} numberOfLines={1}>
          {t("home.plans.planHintShort")}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.primaryLight,
    borderRadius: Radii.button,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(47, 156, 134, 0.25)",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: Spacing.sm,
    marginBottom: 6,
  },
  label: {
    fontSize: 10,
    fontFamily: "Inter_600SemiBold",
    fontWeight: "600",
    letterSpacing: 0.6,
    color: Colors.textTertiary,
    textTransform: "uppercase",
    flex: 1,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radii.pill,
    backgroundColor: "rgba(255,255,255,0.65)",
  },
  badgeDone: {
    backgroundColor: "rgba(47, 156, 134, 0.15)",
  },
  badgeText: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
    fontWeight: "600",
    color: Colors.textSecondary,
  },
  badgeTextDone: {
    color: Colors.primaryDark,
  },
  list: {
    gap: 4,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderRadius: Radii.button,
    paddingVertical: 6,
    paddingHorizontal: 4,
    marginHorizontal: -4,
  },
  rowPrimary: {
    paddingVertical: 4,
  },
  rowSupport: {
    paddingVertical: 2,
    paddingLeft: 6,
  },
  rowCompleted: {
    opacity: 0.88,
  },
  rowLocked: {
    opacity: 0.95,
  },
  rowPressed: {
    backgroundColor: "rgba(255,255,255,0.45)",
  },
  check: {
    borderWidth: 2,
    borderColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  checkPrimary: {
    width: 20,
    height: 20,
    borderRadius: 10,
  },
  checkSupport: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1.5,
  },
  checkDone: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  textCol: {
    flex: 1,
    minWidth: 0,
  },
  primaryText: {
    fontSize: FontSizes.sm,
    fontFamily: "Inter_600SemiBold",
    fontWeight: "600",
    color: Colors.textPrimary,
    lineHeight: 20,
  },
  supportText: {
    fontSize: FontSizes.xs,
    fontFamily: "Inter_500Medium",
    color: Colors.textSecondary,
    lineHeight: 17,
  },
  textCompleted: {
    color: Colors.textTertiary,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 2,
  },
  meta: {
    flex: 1,
    fontSize: 10,
    fontFamily: "Inter_400Regular",
    color: Colors.textTertiary,
    lineHeight: 14,
  },
  hint: {
    marginTop: 4,
    fontSize: 10,
    fontFamily: "Inter_400Regular",
    color: Colors.primaryDark,
    lineHeight: 14,
  },
});
