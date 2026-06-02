import { Colors } from "../../constants/theme";

export type PhaseOpenTheme = {
  borderColor: string;
  badgeBg: string;
  badgeText: string;
  gridDone: string;
  shadowColor: string;
  showGlow: boolean;
};

export function getPhaseOpenTheme(
  phaseId: 1 | 2 | 3,
  isActive: boolean,
  isCompleted: boolean
): PhaseOpenTheme {
  const showGlow = isActive && !isCompleted;
  if (phaseId === 1) {
    return {
      borderColor: Colors.primary,
      badgeBg: Colors.primaryLight,
      badgeText: Colors.primaryDark,
      gridDone: Colors.primary,
      shadowColor: Colors.primary,
      showGlow,
    };
  }
  if (phaseId === 2) {
    return {
      borderColor: "#E07A5F",
      badgeBg: "#FDEBE5",
      badgeText: "#C45C42",
      gridDone: "#E07A5F",
      shadowColor: "#E8917A",
      showGlow,
    };
  }
  return {
    borderColor: "#7B5B9E",
    badgeBg: "#F7F0E2",
    badgeText: "#5A4578",
    gridDone: Colors.gold,
    shadowColor: "#8B6BBD",
    showGlow,
  };
}
