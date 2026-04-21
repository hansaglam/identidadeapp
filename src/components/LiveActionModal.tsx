/**
 * Live Action — countdown → aksiyon → tamamlandı.
 *
 * Kullanıcı butona basar:
 *  3 ─ 2 ─ 1 ─ ŞİMDİ → aksiyon süresince ekran kilitli kalır → ✓ tamam.
 *
 * Hiçbir kararın olmadığı, sıfır düşünme akışı.
 */

import React, { useEffect, useRef, useState } from "react";
import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Vibration,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Check, X } from "lucide-react-native";
import { Action, MUSCLE_LABELS } from "../engine";
import { Colors, FontSizes, Radii, Spacing } from "../constants/theme";

interface Props {
  visible: boolean;
  action: Action | null;
  onComplete: () => void;
  onCancel: () => void;
}

type Phase = "countdown" | "action" | "done";

export default function LiveActionModal({
  visible,
  action,
  onComplete,
  onCancel,
}: Props) {
  const [phase, setPhase] = useState<Phase>("countdown");
  const [count, setCount] = useState(3);
  const [actionLeft, setActionLeft] = useState(0);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const actionRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!visible || !action) return;
    setPhase("countdown");
    setCount(3);
    setActionLeft(action.duration);

    if (tickRef.current) clearInterval(tickRef.current);
    tickRef.current = setInterval(() => {
      setCount((c) => {
        if (c <= 1) {
          if (tickRef.current) clearInterval(tickRef.current);
          if (Platform.OS !== "web") Vibration.vibrate(40);
          setPhase("action");
          return 0;
        }
        return c - 1;
      });
    }, 1000);

    return () => {
      if (tickRef.current) clearInterval(tickRef.current);
      if (actionRef.current) clearInterval(actionRef.current);
    };
  }, [visible, action]);

  useEffect(() => {
    if (phase !== "action" || !action) return;
    if (actionRef.current) clearInterval(actionRef.current);
    actionRef.current = setInterval(() => {
      setActionLeft((s) => {
        if (s <= 1) {
          if (actionRef.current) clearInterval(actionRef.current);
          if (Platform.OS !== "web") Vibration.vibrate([0, 60, 80, 60]);
          setPhase("done");
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => {
      if (actionRef.current) clearInterval(actionRef.current);
    };
  }, [phase, action]);

  if (!action) return null;

  return (
    <Modal visible={visible} animationType="fade" onRequestClose={onCancel}>
      <SafeAreaView style={styles.root} edges={["top", "bottom"]}>
        <TouchableOpacity
          style={styles.closeBtn}
          onPress={onCancel}
          hitSlop={12}
        >
          <X size={20} color="rgba(255,255,255,0.6)" />
        </TouchableOpacity>

        <View style={styles.center}>
          {phase === "countdown" && (
            <>
              <Text style={styles.label}>Hazırlan</Text>
              <Text style={styles.countdown}>{count}</Text>
              <Text style={styles.upNext}>{action.title}</Text>
            </>
          )}

          {phase === "action" && (
            <>
              <Text style={styles.label}>
                {MUSCLE_LABELS[action.type].toUpperCase()} · ŞİMDİ
              </Text>
              <Text style={styles.actionTitle}>{action.title}</Text>
              <Text style={styles.duration}>{actionLeft} sn</Text>
            </>
          )}

          {phase === "done" && (
            <>
              <View style={styles.checkCircle}>
                <Check size={36} color="#fff" strokeWidth={2.5} />
              </View>
              <Text style={styles.doneText}>Tamamlandı.</Text>
              <Text style={styles.muscleNote}>
                {MUSCLE_LABELS[action.type]} kasın çalıştı.
              </Text>
              <TouchableOpacity style={styles.doneBtn} onPress={onComplete}>
                <Text style={styles.doneBtnText}>Devam</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#0F1115" },
  closeBtn: {
    position: "absolute",
    top: 16,
    right: 16,
    padding: 12,
    zIndex: 10,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: Spacing.xl,
  },
  label: {
    fontSize: FontSizes.sm,
    fontFamily: "Inter_500Medium",
    color: "rgba(255,255,255,0.5)",
    textTransform: "uppercase",
    letterSpacing: 2,
    marginBottom: Spacing.lg,
    textAlign: "center",
  },
  countdown: {
    fontSize: 120,
    fontFamily: "Inter_500Medium",
    color: "#fff",
    lineHeight: 130,
  },
  upNext: {
    marginTop: Spacing.lg,
    fontSize: FontSizes.md,
    color: "rgba(255,255,255,0.45)",
    fontFamily: "Inter_400Regular",
    textAlign: "center",
  },
  actionTitle: {
    fontSize: FontSizes.hero,
    fontFamily: "Inter_500Medium",
    color: "#fff",
    textAlign: "center",
    lineHeight: 46,
  },
  duration: {
    marginTop: Spacing.xl,
    fontSize: FontSizes.xxxl,
    color: "rgba(255,255,255,0.6)",
    fontFamily: "Inter_400Regular",
  },
  checkCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.lg,
  },
  doneText: {
    fontSize: FontSizes.xxl,
    fontFamily: "Inter_500Medium",
    color: "#fff",
  },
  muscleNote: {
    marginTop: Spacing.xs,
    fontSize: FontSizes.md,
    color: "rgba(255,255,255,0.55)",
    fontFamily: "Inter_400Regular",
  },
  doneBtn: {
    marginTop: Spacing.xl,
    backgroundColor: "rgba(255,255,255,0.12)",
    borderRadius: Radii.button,
    paddingHorizontal: Spacing.xl,
    paddingVertical: 14,
  },
  doneBtnText: {
    color: "#fff",
    fontFamily: "Inter_500Medium",
    fontSize: FontSizes.md,
  },
});
