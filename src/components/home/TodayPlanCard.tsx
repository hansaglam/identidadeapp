import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Colors, Spacing, Radii, FontSizes, Shadows } from "../../constants/theme";
import type { TomorrowTodoItem } from "../../store/tomorrowPlanStore";

interface Props {
  items: TomorrowTodoItem[];
  todayDone: boolean;
  onToggle: (itemId: string) => void;
}

export default function TodayPlanCard({ items, todayDone, onToggle }: Props) {
  if (!items.length) return null;

  return (
    <View style={styles.card}>
      <Text style={styles.label}>Bugünün planı</Text>
      {items.map((item) => (
        <TouchableOpacity
          key={item.id}
          style={styles.row}
          activeOpacity={0.85}
          disabled={todayDone}
          onPress={() => onToggle(item.id)}
        >
          <View style={[styles.check, item.completed && styles.checkDone]} />
          <View style={styles.textWrap}>
            <Text
              style={[
                item.isPrimary ? styles.primary : styles.support,
                item.completed && styles.itemDone,
              ]}
              numberOfLines={2}
            >
              {item.text}
            </Text>
            {item.time || item.context ? (
              <Text style={styles.meta} numberOfLines={1}>
                {[item.time, item.context].filter(Boolean).join(" · ")}
              </Text>
            ) : null}
          </View>
        </TouchableOpacity>
      ))}
      <Text style={styles.hint}>
        {todayDone ? "Plan tamamlandı." : "İşaretle veya check-in ile günü onayla."}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.primaryLight,
    borderRadius: Radii.card,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: "rgba(47, 156, 134, 0.2)",
    ...Shadows.card,
  },
  label: {
    fontSize: FontSizes.xs,
    fontFamily: "Inter_600SemiBold",
    fontWeight: "600",
    letterSpacing: 0.8,
    color: Colors.textTertiary,
    textTransform: "uppercase",
    marginBottom: 6,
  },
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    marginTop: 10,
  },
  check: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: Colors.primary,
    marginTop: 2,
  },
  checkDone: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  textWrap: {
    flex: 1,
    minWidth: 0,
  },
  primary: {
    fontSize: FontSizes.md,
    fontFamily: "Inter_600SemiBold",
    fontWeight: "600",
    color: Colors.textPrimary,
    lineHeight: 22,
  },
  support: {
    fontSize: FontSizes.sm,
    fontFamily: "Inter_400Regular",
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  itemDone: {
    textDecorationLine: "line-through",
    color: Colors.textTertiary,
  },
  meta: {
    fontSize: FontSizes.xs,
    fontFamily: "Inter_400Regular",
    color: Colors.textTertiary,
    marginTop: 2,
    lineHeight: 17,
  },
  hint: {
    marginTop: Spacing.sm,
    fontSize: FontSizes.xs,
    fontFamily: "Inter_400Regular",
    color: Colors.primaryDark,
    lineHeight: 17,
  },
});
