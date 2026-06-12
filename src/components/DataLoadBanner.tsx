import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useTranslation } from "react-i18next";
import { useCheckinsStore } from "../store/checkinsStore";
import { useMindDumpStore } from "../store/mindDumpStore";
import { Spacing, FontSizes, Colors } from "../constants/theme";

export default function DataLoadBanner() {
  const { t } = useTranslation();
  const checkFail = useCheckinsStore((s) => s.loadFailed);
  const mindFail = useMindDumpStore((s) => s.loadFailed);
  const reloadCheckins = useCheckinsStore((s) => s.load);
  const reloadMind = useMindDumpStore((s) => s.load);

  if (!checkFail && !mindFail) return null;

  const parts = [
    checkFail ? t("dataLoadBanner.checkins") : null,
    mindFail ? t("dataLoadBanner.mind") : null,
  ].filter(Boolean) as string[];

  return (
    <View style={[styles.wrap, { backgroundColor: Colors.coralLight, borderBottomColor: Colors.border }]}>
      <Text style={[styles.text, { color: Colors.textPrimary }]}>
        {t("dataLoadBanner.messageFull", {
          items: parts.join(t("dataLoadBanner.joinAnd")),
        })}
      </Text>
      <TouchableOpacity
        style={[styles.btn, { backgroundColor: Colors.coral }]}
        onPress={() => {
          reloadCheckins();
          reloadMind();
        }}
      >
        <Text style={styles.btnText}>{t("dataLoadBanner.retry")}</Text>
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
