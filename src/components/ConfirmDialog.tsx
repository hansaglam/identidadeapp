import React from "react";
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { AlertTriangle, Bell, Info, Trash2 } from "lucide-react-native";
import {
  Colors,
  Spacing,
  Radii,
  FontSizes,
} from "../constants/theme";

export type ConfirmDialogAction = {
  label: string;
  variant?: "primary" | "secondary" | "destructive";
  onPress?: () => void | Promise<void>;
};

export type ConfirmDialogProps = {
  visible: boolean;
  title: string;
  message: string;
  /** Visual accent + icon */
  tone?: "default" | "danger" | "success" | "warning";
  actions: ConfirmDialogAction[];
  onRequestClose?: () => void;
  /** Backdrop tap (default true). Set false e.g. when a single action must run explicitly. */
  closeOnBackdropPress?: boolean;
};

export default function ConfirmDialog({
  visible,
  title,
  message,
  tone = "default",
  actions,
  onRequestClose,
  closeOnBackdropPress = true,
}: ConfirmDialogProps) {
  const [busyIndex, setBusyIndex] = React.useState<number | null>(null);

  React.useEffect(() => {
    if (!visible) setBusyIndex(null);
  }, [visible]);

  const Icon =
    tone === "danger"
      ? Trash2
      : tone === "success"
        ? Bell
        : tone === "warning"
          ? AlertTriangle
          : Info;
  const iconColor =
    tone === "danger" || tone === "warning"
      ? Colors.coral
      : tone === "success"
        ? Colors.primary
        : Colors.primary;
  const iconBg =
    tone === "danger" || tone === "warning"
      ? Colors.coralLight
      : Colors.primaryLight;

  const runAction = async (index: number) => {
    const fn = actions[index]?.onPress;
    if (!fn) return;
    setBusyIndex(index);
    try {
      await fn();
    } finally {
      setBusyIndex(null);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onRequestClose}
    >
      <View style={styles.wrap}>
        <Pressable
          style={styles.backdrop}
          onPress={() => {
            if (closeOnBackdropPress) onRequestClose?.();
          }}
        />
        <Pressable style={styles.cardOuter} onPress={(e) => e.stopPropagation()}>
          <View style={styles.card}>
            <View style={[styles.iconCircle, { backgroundColor: iconBg }]}>
              <Icon size={22} color={iconColor} strokeWidth={1.8} />
            </View>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.message}>{message}</Text>

            <View style={styles.actions}>
              {actions.map((a, i) => {
                const variant = a.variant ?? "secondary";
                const isBusy = busyIndex === i;
                const btnStyle = [
                  styles.btn,
                  variant === "primary" && styles.btnPrimary,
                  variant === "secondary" && styles.btnSecondary,
                  variant === "destructive" && styles.btnDestructive,
                ];
                const textStyle = [
                  styles.btnLabel,
                  variant === "primary" && styles.btnLabelOnPrimary,
                  variant === "secondary" && styles.btnLabelSecondary,
                  variant === "destructive" && styles.btnLabelDestructive,
                ];
                return (
                  <TouchableOpacity
                    key={`${a.label}-${i}`}
                    style={btnStyle}
                    onPress={() => runAction(i)}
                    disabled={busyIndex !== null}
                    activeOpacity={0.88}
                    accessibilityRole="button"
                  >
                    {isBusy ? (
                      <ActivityIndicator
                        color={variant === "primary" ? "#fff" : Colors.primary}
                        size="small"
                      />
                    ) : (
                      <Text style={textStyle}>{a.label}</Text>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </Pressable>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: Spacing.lg,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: Colors.overlay,
  },
  cardOuter: {
    borderRadius: 20,
    maxWidth: 400,
    width: "100%",
    alignSelf: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.18,
    shadowRadius: 24,
    elevation: 12,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.borderStrong,
    padding: Spacing.xl,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.md,
  },
  title: {
    fontSize: FontSizes.xl,
    fontFamily: "Inter_500Medium",
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
    letterSpacing: -0.2,
  },
  message: {
    fontSize: FontSizes.md,
    fontFamily: "Inter_400Regular",
    color: Colors.textSecondary,
    lineHeight: 22,
    marginBottom: Spacing.lg,
  },
  actions: {
    gap: Spacing.sm,
  },
  btn: {
    minHeight: 48,
    borderRadius: Radii.button,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: Spacing.md,
  },
  btnPrimary: {
    backgroundColor: Colors.primary,
  },
  btnSecondary: {
    backgroundColor: Colors.bg,
    borderWidth: 1,
    borderColor: Colors.borderStrong,
  },
  btnDestructive: {
    backgroundColor: Colors.coralLight,
    borderWidth: 1,
    borderColor: "rgba(216,90,48,0.35)",
  },
  btnLabel: {
    fontSize: FontSizes.md,
    fontFamily: "Inter_500Medium",
  },
  btnLabelOnPrimary: {
    color: "#fff",
  },
  btnLabelSecondary: {
    color: Colors.textPrimary,
  },
  btnLabelDestructive: {
    color: Colors.coral,
  },
});
