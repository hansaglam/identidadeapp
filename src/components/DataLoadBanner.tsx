import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useCheckinsStore } from "../store/checkinsStore";
import { useMindDumpStore } from "../store/mindDumpStore";
import { Spacing, FontSizes, Colors } from "../constants/theme";

export default function DataLoadBanner() {
  const checkFail = useCheckinsStore((s) => s.loadFailed);
  const mindFail = useMindDumpStore((s) => s.loadFailed);
  const reloadCheckins = useCheckinsStore((s) => s.load);
  const reloadMind = useMindDumpStore((s) => s.load);

  if (!checkFail && !mindFail) return null;

  const parts = [
    checkFail ? "Bugün kayıtları" : null,
    mindFail ? "Zihin notları" : null,
  ].filter(Boolean);

  return (
    <View style={[styles.wrap, { backgroundColor: Colors.coralLight, borderBottomColor: Colors.border }]}>
      <Text style={[styles.text, { color: Colors.textPrimary }]}>
        {parts.join(" ve ")} bu cihazdan yüklenemedi. Yerel özete güvenemediğinden yenilemek iyi olur.
      </Text>
      <TouchableOpacity
        style={[styles.btn, { backgroundColor: Colors.coral }]}
        onPress={() => {
          reloadCheckins();
          reloadMind();
        }}
      >
        <Text style={styles.btnText}>Yeniden yükle</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    gap: Spacing.sm,
  },
  text: {
    fontSize: FontSizes.sm,
    fontFamily: "Inter_400Regular",
    lineHeight: 19,
  },
  btn: {
    alignSelf: "flex-start",
    borderRadius: 8,
    paddingHorizontal: Spacing.md,
    paddingVertical: 7,
  },
  btnText: {
    fontSize: FontSizes.sm,
    fontFamily: "Inter_500Medium",
    color: "#fff",
  },
});
