/**
 * Flat SVG ring — no gradients, single color stroke.
 * Spec: no shadow, no gradient, 1px border only on cards.
 */
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Svg, { Circle } from "react-native-svg";
import { Colors, FontSizes, FontWeights } from "../constants/theme";

interface ProgressRingProps {
  progress: number; // 0–1
  size: number;
  strokeWidth: number;
  color: string;
  trackColor?: string;
  label?: string;
  sublabel?: string;
  showPercentage?: boolean;
}

export default function ProgressRing({
  progress,
  size,
  strokeWidth,
  color,
  trackColor = Colors.border,
  label,
  sublabel,
  showPercentage = false,
}: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.min(Math.max(progress, 0), 1);
  const offset = circumference * (1 - clamped);
  const center = size / 2;

  return (
    <View style={{ width: size, height: size, alignItems: "center", justifyContent: "center" }}>
      <Svg
        width={size}
        height={size}
        style={StyleSheet.absoluteFill}
      >
        {/* Track */}
        <Circle
          cx={center}
          cy={center}
          r={radius}
          stroke={trackColor}
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Fill */}
        <Circle
          cx={center}
          cy={center}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={offset}
          strokeLinecap="round"
          rotation="-90"
          origin={`${center}, ${center}`}
        />
      </Svg>
      <View style={styles.inner}>
        {showPercentage && (
          <Text style={[styles.pct, { color }]}>
            {Math.round(clamped * 100)}%
          </Text>
        )}
        {label && <Text style={styles.label}>{label}</Text>}
        {sublabel && <Text style={styles.sublabel}>{sublabel}</Text>}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  inner: {
    alignItems: "center",
  },
  pct: {
    fontSize: FontSizes.md,
    fontFamily: "Inter_500Medium",
  },
  label: {
    fontSize: FontSizes.sm,
    fontFamily: "Inter_500Medium",
    color: Colors.textPrimary,
    textAlign: "center",
  },
  sublabel: {
    fontSize: FontSizes.xs,
    fontFamily: "Inter_400Regular",
    color: Colors.textSecondary,
    textAlign: "center",
  },
});
