/**
 * Shared primitive UI components — flat, no shadow, 1px border only.
 * Spec: Inter Regular/Medium, teal primary, minimal.
 */
import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from "react-native";
import { Colors, Spacing, Radii, FontSizes, FontWeights } from "../constants/theme";

// ─── Button ───────────────────────────────────────────────────────────────

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "ghost" | "danger";
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  style?: ViewStyle;
}

export function Button({
  label,
  onPress,
  variant = "primary",
  disabled,
  loading,
  fullWidth,
  style,
}: ButtonProps) {
  const variantStyles = {
    primary: {
      bg: Colors.primary,
      border: Colors.primary,
      text: "#fff",
    },
    secondary: {
      bg: Colors.primaryLight,
      border: Colors.primaryLight,
      text: Colors.primary,
    },
    ghost: {
      bg: "transparent",
      border: Colors.border,
      text: Colors.textSecondary,
    },
    danger: {
      bg: Colors.coralLight,
      border: Colors.coralLight,
      text: Colors.coral,
    },
  }[variant];

  return (
    <TouchableOpacity
      style={[
        btnStyles.base,
        {
          backgroundColor: variantStyles.bg,
          borderColor: variantStyles.border,
          opacity: disabled || loading ? 0.5 : 1,
        },
        fullWidth && btnStyles.fullWidth,
        style,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.75}
    >
      {loading ? (
        <ActivityIndicator size="small" color={variantStyles.text} />
      ) : (
        <Text style={[btnStyles.label, { color: variantStyles.text }]}>
          {label}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const btnStyles = StyleSheet.create({
  base: {
    borderRadius: Radii.button,
    paddingVertical: 13,
    paddingHorizontal: Spacing.lg,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
  },
  fullWidth: {
    width: "100%",
  },
  label: {
    fontSize: FontSizes.md,
    fontFamily: "Inter_500Medium",
  },
});

// ─── Pill button ──────────────────────────────────────────────────────────

interface PillProps {
  label: string;
  onPress: () => void;
  active?: boolean;
  activeColor?: string;
  activeBg?: string;
  style?: ViewStyle;
}

export function Pill({
  label,
  onPress,
  active,
  activeColor = Colors.primary,
  activeBg = Colors.primaryLight,
  style,
}: PillProps) {
  return (
    <TouchableOpacity
      style={[
        pillStyles.pill,
        active && { backgroundColor: activeBg, borderColor: activeColor },
        style,
      ]}
      onPress={onPress}
      activeOpacity={0.75}
    >
      <Text style={[pillStyles.label, active && { color: activeColor }]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const pillStyles = StyleSheet.create({
  pill: {
    borderRadius: Radii.pill,
    paddingVertical: 7,
    paddingHorizontal: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  label: {
    fontSize: FontSizes.sm,
    fontFamily: "Inter_400Regular",
    color: Colors.textSecondary,
  },
});

// ─── Card ─────────────────────────────────────────────────────────────────

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  onPress?: () => void;
}

export function Card({ children, style, onPress }: CardProps) {
  if (onPress) {
    return (
      <TouchableOpacity
        style={[cardStyles.card, style]}
        onPress={onPress}
        activeOpacity={0.8}
      >
        {children}
      </TouchableOpacity>
    );
  }
  return <View style={[cardStyles.card, style]}>{children}</View>;
}

const cardStyles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radii.card,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.md,
  },
});

// ─── Divider ──────────────────────────────────────────────────────────────

export function Divider({ style }: { style?: ViewStyle }) {
  return <View style={[dividerStyles.line, style]} />;
}

const dividerStyles = StyleSheet.create({
  line: {
    height: 1,
    backgroundColor: Colors.border,
  },
});

// ─── Label ────────────────────────────────────────────────────────────────

export function SectionLabel({
  children,
  style,
}: {
  children: string;
  style?: TextStyle;
}) {
  return (
    <Text style={[sectionLabelStyles.label, style]}>{children}</Text>
  );
}

const sectionLabelStyles = StyleSheet.create({
  label: {
    fontSize: FontSizes.xs,
    fontFamily: "Inter_500Medium",
    color: Colors.textTertiary,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
});

// ─── Input ────────────────────────────────────────────────────────────────

interface InputProps {
  value: string;
  onChangeText: (v: string) => void;
  placeholder?: string;
  multiline?: boolean;
  autoFocus?: boolean;
  returnKeyType?: "done" | "next" | "go";
  onSubmitEditing?: () => void;
  style?: ViewStyle;
}

export function Input({
  value,
  onChangeText,
  placeholder,
  multiline,
  autoFocus,
  returnKeyType,
  onSubmitEditing,
  style,
}: InputProps) {
  const { TextInput } = require("react-native");
  return (
    <TextInput
      style={[inputStyles.input, multiline && inputStyles.multiline, style]}
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor={Colors.textTertiary}
      multiline={multiline}
      autoFocus={autoFocus}
      returnKeyType={returnKeyType}
      onSubmitEditing={onSubmitEditing}
      fontFamily="Inter_400Regular"
    />
  );
}

const inputStyles = StyleSheet.create({
  input: {
    backgroundColor: Colors.bg,
    borderRadius: Radii.button,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.md,
    paddingVertical: 12,
    fontSize: FontSizes.md,
    fontFamily: "Inter_400Regular",
    color: Colors.textPrimary,
  },
  multiline: {
    minHeight: 80,
    textAlignVertical: "top",
    paddingTop: 12,
  },
});

// ─── Empty State ──────────────────────────────────────────────────────────

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  action?: React.ReactNode;
}

export function EmptyState({ icon, title, subtitle, action }: EmptyStateProps) {
  return (
    <View style={emptyStyles.container}>
      <View style={emptyStyles.iconWrap}>{icon}</View>
      <Text style={emptyStyles.title}>{title}</Text>
      <Text style={emptyStyles.subtitle}>{subtitle}</Text>
      {action && <View style={emptyStyles.action}>{action}</View>}
    </View>
  );
}

const emptyStyles = StyleSheet.create({
  container: {
    alignItems: "center",
    paddingVertical: Spacing.xxl,
    paddingHorizontal: Spacing.xl,
  },
  iconWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.lg,
  },
  title: {
    fontSize: FontSizes.xl,
    fontFamily: "Inter_500Medium",
    color: Colors.textPrimary,
    textAlign: "center",
    marginBottom: Spacing.sm,
  },
  subtitle: {
    fontSize: FontSizes.md,
    fontFamily: "Inter_400Regular",
    color: Colors.textSecondary,
    textAlign: "center",
    lineHeight: 22,
  },
  action: {
    marginTop: Spacing.lg,
  },
});
