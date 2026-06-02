import React, { useEffect, useState } from "react";
import { Modal, View, Text, StyleSheet, TouchableOpacity, Platform } from "react-native";
import {
  hideExactAlarmPermissionModal,
  openExactAlarmSettings,
  setExactAlarmModalDismissed,
  subscribeExactAlarmModal,
} from "../utils/exactAlarmPermission";
import { Colors, FontSizes, Radii, Spacing } from "../constants/theme";

export default function ExactAlarmPermissionModal() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    return subscribeExactAlarmModal(setVisible);
  }, []);

  if (Platform.OS !== "android") return null;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={() => hideExactAlarmPermissionModal()}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Text style={styles.title}>Tam saatte hatırlatma</Text>
          <Text style={styles.body}>
            Android 12 ve üzeri cihazlarda sabah/akşam bildirimlerinin doğru saatte gelmesi için
            &quot;Alarmlar ve hatırlatıcılar&quot; iznine ihtiyaç var. İzin vermezsen yaklaşık
            hatırlatma kullanılır (uygulama açıkken daha güvenilir).
          </Text>
          <TouchableOpacity
            style={styles.primaryBtn}
            activeOpacity={0.88}
            onPress={() => {
              void openExactAlarmSettings();
            }}
          >
            <Text style={styles.primaryText}>Ayarlara git</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.secondaryBtn}
            activeOpacity={0.85}
            onPress={async () => {
              await setExactAlarmModalDismissed(true);
              hideExactAlarmPermissionModal();
            }}
          >
            <Text style={styles.secondaryText}>Şimdilik atla</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: Colors.overlay,
    justifyContent: "center",
    padding: Spacing.lg,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radii.card,
    padding: Spacing.lg,
    gap: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  title: {
    fontSize: FontSizes.lg,
    fontFamily: "Inter_600SemiBold",
    color: Colors.textPrimary,
  },
  body: {
    fontSize: FontSizes.sm,
    fontFamily: "Inter_400Regular",
    color: Colors.textSecondary,
    lineHeight: 21,
  },
  primaryBtn: {
    backgroundColor: Colors.primary,
    borderRadius: Radii.button,
    paddingVertical: 14,
    alignItems: "center",
  },
  primaryText: {
    color: "#fff",
    fontSize: FontSizes.md,
    fontFamily: "Inter_600SemiBold",
  },
  secondaryBtn: {
    paddingVertical: 10,
    alignItems: "center",
  },
  secondaryText: {
    fontSize: FontSizes.sm,
    fontFamily: "Inter_500Medium",
    color: Colors.textTertiary,
  },
});
