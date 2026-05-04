import React from "react";
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Pressable,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AlertTriangle } from "lucide-react-native";
import { Colors, Spacing, Radii, FontSizes } from "../constants/theme";

export interface ProactiveInterventionModalProps {
  visible: boolean;
  onStartFiveSecond: () => void;
  onDismiss: () => void;
}

/**
 * Açılış / odak: düşüş sinyali; kullanıcı otonomisini korur (atlayabilir).
 */
export default function ProactiveInterventionModal({
  visible,
  onStartFiveSecond,
  onDismiss,
}: ProactiveInterventionModalProps) {
  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onDismiss}>
      <Pressable style={styles.backdrop} onPress={onDismiss}>
        <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
          <SafeAreaView edges={["bottom"]} style={styles.safe}>
            <View style={styles.iconWrap}>
              <AlertTriangle size={28} color={Colors.coral} strokeWidth={1.8} />
            </View>
            <Text style={styles.title}>Bugün riskli bir gün görünüyor</Text>
            <Text style={styles.body}>
              Son günlerde otomatiklik düşmüş veya tutarlılıkta küçük bir kesinti olmuş olabilir.
              Bu, 66 günlük yolun normal bir parçası; Lally çizgisine göre çoğu insan bu aşamada
              dalgalanır. Küçük bir müdahale işe yarayabilir.
            </Text>
            <TouchableOpacity
              style={styles.primaryBtn}
              onPress={onStartFiveSecond}
              activeOpacity={0.88}
            >
              <Text style={styles.primaryBtnText}>5 saniye antrenmanını başlat</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.secondaryBtn} onPress={onDismiss} hitSlop={12}>
              <Text style={styles.secondaryBtnText}>Kendi başıma hallederim</Text>
            </TouchableOpacity>
          </SafeAreaView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: Colors.overlay,
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: Colors.bg,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  safe: { padding: Spacing.lg, paddingBottom: Spacing.xl, gap: Spacing.md },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.coralLight,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
  },
  title: {
    fontSize: FontSizes.lg,
    fontFamily: "Inter_500Medium",
    color: Colors.textPrimary,
    textAlign: "center",
  },
  body: {
    fontSize: FontSizes.sm,
    fontFamily: "Inter_400Regular",
    color: Colors.textSecondary,
    lineHeight: 22,
    textAlign: "center",
  },
  primaryBtn: {
    backgroundColor: Colors.primary,
    borderRadius: Radii.button,
    paddingVertical: Spacing.md,
    alignItems: "center",
    marginTop: Spacing.xs,
  },
  primaryBtnText: {
    fontSize: FontSizes.md,
    fontFamily: "Inter_500Medium",
    color: "#fff",
  },
  secondaryBtn: { paddingVertical: Spacing.sm, alignItems: "center" },
  secondaryBtnText: {
    fontSize: FontSizes.sm,
    fontFamily: "Inter_400Regular",
    color: Colors.textTertiary,
  },
});
