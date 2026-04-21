import React from "react";
import { View, StyleSheet } from "react-native";
import { Colors } from "../constants/theme";

interface DayGridProps {
  days: boolean[]; // length 66, index 0 = oldest
  color: string;
}

export default function DayGrid({ days, color }: DayGridProps) {
  return (
    <View style={styles.grid}>
      {days.map((done, i) => (
        <View
          key={i}
          style={[
            styles.cell,
            {
              backgroundColor: done ? color : Colors.border,
              opacity: done ? 1 : 0.6,
            },
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 3,
  },
  cell: {
    width: 11,
    height: 11,
    borderRadius: 2,
  },
});
