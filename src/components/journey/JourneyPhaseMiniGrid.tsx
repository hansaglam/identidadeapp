import React from "react";
import { View, StyleSheet, Pressable } from "react-native";
import type { JourneyPhaseDef } from "./journeyPhaseTypes";

interface Props {
  phase: JourneyPhaseDef;
  phaseGrid: boolean[];
  dayNumber: number;
  doneColor?: string;
  onDayPress?: (journeyDay: number) => void;
}

export default function JourneyPhaseMiniGrid({
  phase,
  phaseGrid,
  dayNumber,
  doneColor = "#059669",
  onDayPress,
}: Props) {
  const cellSize = 10;
  const gap = 2;
  const restColor = "#E2E8F0";
  const missedColor = "#FECACA";

  return (
    <View style={[styles.wrap, { gap }]}>
      {phaseGrid.map((done, i) => {
        const day = phase.startDay + i;
        const isFuture = dayNumber <= 66 && day > dayNumber;
        const isMissed =
          !done && ((dayNumber <= 66 && day < dayNumber) || dayNumber > 66);
        let backgroundColor = restColor;
        if (done) backgroundColor = doneColor;
        else if (isMissed) backgroundColor = missedColor;

        const journeyDay = phase.startDay + i;
        const cellStyle = [
          styles.cell,
          { width: cellSize, height: cellSize, backgroundColor },
          isFuture && styles.cellFuture,
        ];
        if (onDayPress) {
          return (
            <Pressable
              key={i}
              onPress={() => onDayPress(journeyDay)}
              style={({ pressed }) => [cellStyle, pressed && styles.cellPressed]}
              accessibilityLabel={`Gün ${journeyDay}`}
            />
          );
        }
        return <View key={i} style={cellStyle} />;
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 10,
  },
  cell: {
    borderRadius: 2,
  },
  cellFuture: {
    opacity: 0.55,
  },
  cellPressed: {
    opacity: 0.7,
    transform: [{ scale: 1.15 }],
  },
});
