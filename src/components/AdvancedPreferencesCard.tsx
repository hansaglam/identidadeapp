import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  ActivityIndicator,
  Alert,
  Modal,
  TextInput,
  Platform,
  KeyboardAvoidingView,
} from "react-native";
import {
  Moon,
  MapPin,
  Bell,
  Sunrise,
  Sunset,
  Calendar,
  Archive,
  X,
  Share2,
  Upload,
  ClipboardPaste,
} from "lucide-react-native";

import type { UserProfile } from "../types";
import { FontSizes, Spacing, Radii, Colors, type AppColors } from "../constants/theme";
import { format, addDays } from "date-fns";
import { shareAppDataBackup } from "../utils/exportBackup";
import { useCheckinsStore } from "../store/checkinsStore";
import { useMindDumpStore } from "../store/mindDumpStore";
import { useUserStore } from "../store/userStore";
import { useSDTStore } from "../store/sdtStore";
import { useHabitStore } from "../store/habitStore";
import { useTomorrowPlanStore } from "../store/tomorrowPlanStore";
import { useBehaviorStore } from "../store/useBehaviorStore";
import {
  parseExportPayloadFromUnknown,
  applyExportPayload,
  readJsonUri,
  reloadAllStoresAfterRestore,
} from "../utils/restoreBackup";

function isNativeModuleMissing(err: unknown): boolean {
  const msg = err instanceof Error ? err.message : String(err);
  return /cannot find native module|expoDocumentPicker|expo.?document.?picker/i.test(msg);
}

/** Üst düzey import yerine yükleki — Expo Go’da modül yoksa uygulama açılışında patlamasın. */
async function pickBackupJson(): Promise<
  { ok: true; raw: unknown } | { ok: false; cancel: true } | { ok: false; nativeMissing: true } | { ok: false; error: true }
> {
  try {
    const { getDocumentAsync } = await import("expo-document-picker");
    const pick = await getDocumentAsync({
      copyToCacheDirectory: true,
      type: ["application/json", "*/*"],
    });
    if (pick.canceled || !pick.assets?.[0]?.uri) {
      return { ok: false, cancel: true };
    }
    const raw = await readJsonUri(pick.assets[0].uri);
    return { ok: true, raw };
  } catch (e) {
    if (isNativeModuleMissing(e)) {
      return { ok: false, nativeMissing: true };
    }
    return { ok: false, error: true };
  }
}

export type AdvancedPreferenceSection = "context" | "rest" | "notifications" | "backup";

interface Props {
  profile: UserProfile;
  onPatch: (patch: Partial<UserProfile>) => Promise<void>;
  /** Boş bırakılırsa tüm bölümler gösterilir. */
  visibleSections?: AdvancedPreferenceSection[];
}

export default function AdvancedPreferencesCard({
  profile,
  onPatch,
  visibleSections,
}: Props) {
  const { t } = useTranslation();
  const all: AdvancedPreferenceSection[] = ["context", "rest", "notifications", "backup"];
  const sections = visibleSections ?? all;
  const show = (k: AdvancedPreferenceSection) => sections.includes(k);
  const [busy, setBusy] = useState(false);
  const [pasteOpen, setPasteOpen] = useState(false);
  const [pasteText, setPasteText] = useState("");

  const wrap = async (fn: () => Promise<void>) => {
    setBusy(true);
    try {
      await fn();
    } finally {
      setBusy(false);
    }
  };

  const applyParsedUnknown = async (raw: unknown) => {
    const parsed = parseExportPayloadFromUnknown(raw);
    if ("error" in parsed) {
      Alert.alert(t("profile.advanced.alertBackup"), parsed.error);
      return;
    }
    await applyExportPayload(parsed);
    await reloadAllStoresAfterRestore();
    Alert.alert(t("profile.advanced.alertOk"), t("profile.advanced.restoreSuccess"));
    setPasteOpen(false);
    setPasteText("");
  };

  const setContext = async (contextPreset: UserProfile["contextPreset"]) =>
    onPatch({ contextPreset });

  const setRest = async (until: string | null) => onPatch({ restModeUntilISO: until });

  const restQuick = async (addInclusiveEnd: number) => {
    const end = format(addDays(new Date(), addInclusiveEnd), "yyyy-MM-dd");
    await setRest(end);
  };

  const exportTap = async () => {
    setBusy(true);
    try {
      const p = useUserStore.getState().profile;
      if (!p) return;
      const checkins = Object.values(useCheckinsStore.getState().checkins);
      const mindDumps = useMindDumpStore.getState().entries;
      const habitState = useHabitStore.getState();
      const behaviorState = useBehaviorStore.getState();
      await shareAppDataBackup({
        exportedAt: new Date().toISOString(),
        schemaVersion: 2,
        profile: p,
        checkins,
        mindDumps,
        tomorrowPlans: useTomorrowPlanStore.getState().listsByDate,
        habitDaily: {
          todayCheckedIn: habitState.todayCheckedIn,
          lastCheckInDate: habitState.lastCheckInDate,
          todayCheckIn: habitState.todayCheckIn,
        },
        habitDefinition: habitState.habit,
        habitReflections: habitState.reflections,
        sdtScores: useSDTStore.getState().scores,
        behaviorState: {
          muscles: behaviorState.muscles,
          recentActions: behaviorState.recentActions,
          lastActionAt: behaviorState.lastActionAt,
          totalActions: behaviorState.totalActions,
        },
      });
    } catch {
      Alert.alert(t("profile.advanced.alertBackup"), t("profile.advanced.exportFail"));
    } finally {
      setBusy(false);
    }
  };

  const runFileImport = async () => {
    const result = await pickBackupJson();
    if (result.ok) {
      await applyParsedUnknown(result.raw);
      return;
    }
    if ("cancel" in result && result.cancel) return;
    if ("nativeMissing" in result && result.nativeMissing) {
      Alert.alert(
        t("profile.advanced.pickerUnavailableTitle"),
        t("profile.advanced.pickerUnavailableMsg"),
        [
          { text: t("profile.advanced.alertOk"), style: "cancel" },
          {
            text: t("profile.advanced.pasteContinue"),
            onPress: () => setPasteOpen(true),
          },
        ]
      );
      return;
    }
    Alert.alert(t("profile.advanced.alertBackup"), t("profile.advanced.importFail"));
  };

  const importTap = () => {
    Alert.alert(
      t("profile.advanced.importConfirmTitle"),
      t("profile.advanced.importConfirmMsg"),
      [
        { text: t("profile.advanced.cancel"), style: "cancel" },
        {
          text: t("profile.advanced.importConfirmBtn"),
          style: "destructive",
          onPress: () => void wrap(runFileImport),
        },
      ]
    );
  };

  const openPasteRestore = () => {
    Alert.alert(
      t("profile.advanced.pasteConfirmTitle"),
      t("profile.advanced.pasteConfirmMsg"),
      [
        { text: t("profile.advanced.cancel"), style: "cancel" },
        { text: t("profile.advanced.continue"), style: "destructive", onPress: () => setPasteOpen(true) },
      ]
    );
  };

  const applyPaste = () =>
    wrap(async () => {
      const rawText = pasteText.trim();
      if (!rawText) {
        Alert.alert(t("profile.advanced.alertBackup"), t("profile.advanced.pasteEmpty"));
        return;
      }
      try {
        const raw = JSON.parse(rawText) as unknown;
        await applyParsedUnknown(raw);
      } catch {
        Alert.alert(t("profile.advanced.alertBackup"), t("profile.advanced.pasteInvalid"));
      }
    });

  const ctxOpts: { id: NonNullable<UserProfile["contextPreset"]>; label: string }[] = [
    { id: "home", label: t("profile.advanced.contextHome") },
    { id: "work", label: t("profile.advanced.contextWork") },
    { id: "travel", label: t("profile.advanced.contextTravel") },
  ];

  const restLabel = profile.restModeUntilISO
    ? t("profile.advanced.restUntil", { date: profile.restModeUntilISO.slice(0, 10) })
    : t("profile.advanced.restNone");

  return (
    <>
      <View style={[styles.card, { backgroundColor: Colors.surface, borderColor: Colors.border }]}>
        {show("context") ? (
          <>
            <Text style={[styles.section, { color: Colors.textTertiary }]}>
              {t("profile.advanced.sectionContext")}
            </Text>

            <View style={styles.rowHead}>
              <MapPin size={16} color={Colors.purple} strokeWidth={1.6} />
              <Text style={[styles.head, { color: Colors.textPrimary }]}>
                {t("profile.advanced.contextTitle")}
              </Text>
            </View>
            <Text style={[styles.micro, { color: Colors.textTertiary }]}>
              {t("profile.advanced.contextHint")}
            </Text>
            <View style={styles.chipRow}>
              <TouchableOpacity
                style={[
                  styles.chip,
                  {
                    borderWidth: 1,
                    borderColor: profile.contextPreset == null ? Colors.purple : Colors.border,
                    backgroundColor:
                      profile.contextPreset == null ? Colors.purpleLight : Colors.bg,
                  },
                ]}
                onPress={() => void setContext(null)}
              >
                <Text style={[styles.chipText, { color: Colors.textSecondary }]}>
                  {t("profile.advanced.contextDefault")}
                </Text>
              </TouchableOpacity>
              {ctxOpts.map((c) => {
                const sel = profile.contextPreset === c.id;
                return (
                  <TouchableOpacity
                    key={c.id}
                    style={[
                      styles.chip,
                      {
                        borderWidth: 1,
                        borderColor: sel ? Colors.purple : Colors.border,
                        backgroundColor: sel ? Colors.purpleLight : Colors.bg,
                      },
                    ]}
                    onPress={() => void setContext(c.id)}
                  >
                    <Text style={[styles.chipText, { color: Colors.textSecondary }]}>
                      {c.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <View style={[styles.hr, { backgroundColor: Colors.border }]} />
          </>
        ) : null}

        {show("rest") ? (
          <>
            <View style={styles.rowHead}>
              <Moon size={16} color={Colors.gold} strokeWidth={1.6} />
              <Text style={[styles.head, { color: Colors.textPrimary }]}>{restLabel}</Text>
            </View>
            <Text style={[styles.micro, { color: Colors.textTertiary }]}>
              {t("profile.advanced.restHint")}
            </Text>
            <View style={styles.chipRow}>
              <TouchableOpacity
                style={[styles.chip, { borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.bg }]}
                onPress={() => void restQuick(2)}
              >
                <Text style={[styles.chipText, { color: Colors.textSecondary }]}>
                  {t("profile.advanced.rest3")}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.chip, { borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.bg }]}
                onPress={() => void restQuick(6)}
              >
                <Text style={[styles.chipText, { color: Colors.textSecondary }]}>
                  {t("profile.advanced.rest7")}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.chip, { borderWidth: 1, borderColor: Colors.coral }]} onPress={() => void setRest(null)}>
                <X size={14} color={Colors.coral} />
                <Text style={[styles.chipText, { color: Colors.coral, marginLeft: 6 }]}>
                  {t("profile.advanced.restClear")}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={[styles.hr, { backgroundColor: Colors.border }]} />
          </>
        ) : null}

        {show("notifications") ? (
          <>
            <View style={styles.rowHead}>
              <Bell size={16} color={Colors.primary} strokeWidth={1.6} />
              <Text style={[styles.head, { color: Colors.textPrimary }]}>
                {t("profile.advanced.notifFineTune")}
              </Text>
            </View>

            <ToggleLine
              icon={<Sunrise size={14} color={Colors.textSecondary} />}
              title={t("profile.advanced.notifyMorning")}
              value={profile.notifyMorningEnabled !== false}
              palette={Colors}
              onChange={(v) => void onPatch({ notifyMorningEnabled: v })}
            />
            <ToggleLine
              icon={<Sunset size={14} color={Colors.textSecondary} />}
              title={t("profile.advanced.notifyEvening")}
              value={profile.notifyEveningEnabled !== false}
              palette={Colors}
              onChange={(v) => void onPatch({ notifyEveningEnabled: v })}
            />
            <ToggleLine
              icon={<Calendar size={14} color={Colors.textSecondary} />}
              title={t("profile.advanced.notifyWeekend")}
              value={profile.notifyWeekendEnabled !== false}
              palette={Colors}
              onChange={(v) => void onPatch({ notifyWeekendEnabled: v })}
            />
            <ToggleLine
              icon={<Bell size={14} color={Colors.textSecondary} />}
              title={t("profile.advanced.notifyPhaseMilestones")}
              value={profile.notifyPhaseMilestones !== false}
              palette={Colors}
              onChange={(v) => void onPatch({ notifyPhaseMilestones: v })}
            />

            <View style={[styles.hr, { backgroundColor: Colors.border }]} />
          </>
        ) : null}

        {show("backup") ? (
          <>
            <View style={styles.rowHead}>
              <Archive size={16} color={Colors.textSecondary} strokeWidth={1.6} />
              <Text style={[styles.head, { color: Colors.textPrimary }]}>
                {t("profile.advanced.backupTitle")}
              </Text>
            </View>
            <Text style={[styles.micro, { color: Colors.textTertiary }]}>
              {t("profile.advanced.backupHint")}
            </Text>
            <TouchableOpacity
              style={[styles.exportBtn, { backgroundColor: Colors.primary }]}
              onPress={() => void exportTap()}
              disabled={busy}
            >
              {busy ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Share2 size={16} color="#fff" strokeWidth={2} />
                  <Text style={styles.exportTxt}>{t("profile.advanced.exportBtn")}</Text>
                </>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.importBtn, { borderColor: Colors.primary }]}
              onPress={() => importTap()}
              disabled={busy}
            >
              <Upload size={16} color={Colors.primary} strokeWidth={1.8} />
              <Text style={[styles.importTxt, { color: Colors.primary }]}>
                {t("profile.advanced.importBtn")}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.pasteBtn, { borderColor: Colors.borderStrong }]}
              onPress={openPasteRestore}
              disabled={busy}
            >
              <ClipboardPaste size={16} color={Colors.textSecondary} strokeWidth={1.8} />
              <Text style={[styles.pasteTxt, { color: Colors.textSecondary }]}>
                {t("profile.advanced.pasteBtn")}
              </Text>
            </TouchableOpacity>
          </>
        ) : null}
      </View>

      <Modal visible={pasteOpen} animationType="slide" transparent onRequestClose={() => setPasteOpen(false)}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={styles.modalOverlay}
        >
          <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={() => setPasteOpen(false)} />
          <View style={[styles.modalSheet, { backgroundColor: Colors.surface, borderColor: Colors.border }]}>
            <Text style={[styles.modalTitle, { color: Colors.textPrimary }]}>
              {t("profile.advanced.pasteModalTitle")}
            </Text>
            <Text style={[styles.modalHint, { color: Colors.textTertiary }]}>
              {t("profile.advanced.pasteModalHint")}
            </Text>
            <TextInput
              style={[
                styles.pasteInput,
                {
                  color: Colors.textPrimary,
                  borderColor: Colors.border,
                  backgroundColor: Colors.bg,
                },
              ]}
              value={pasteText}
              onChangeText={setPasteText}
              multiline
              textAlignVertical="top"
              placeholder={t("profile.advanced.pastePlaceholder")}
              placeholderTextColor={Colors.textTertiary}
              editable={!busy}
            />
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.modalCancel} onPress={() => setPasteOpen(false)} disabled={busy}>
                <Text style={[styles.modalCancelTxt, { color: Colors.textSecondary }]}>
                  {t("profile.advanced.cancel")}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalApply, { backgroundColor: Colors.primary }]}
                onPress={() => applyPaste()}
                disabled={busy}
              >
                {busy ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.modalApplyTxt}>{t("profile.advanced.apply")}</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </>
  );
}

function ToggleLine({
  title,
  value,
  palette,
  onChange,
  icon,
}: {
  title: string;
  value: boolean;
  palette: AppColors;
  onChange: (v: boolean) => void;
  icon: React.ReactNode;
}) {
  return (
    <View style={styles.toggleRow}>
      <View style={styles.toggleLeft}>
        {icon}
        <Text style={[styles.toggleTitle, { color: palette.textPrimary }]}>{title}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{ true: palette.primary, false: palette.border }}
        thumbColor={palette.surface}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: Radii.card,
    borderWidth: 1,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    gap: Spacing.xs,
  },
  section: {
    fontSize: FontSizes.xs,
    fontFamily: "Inter_500Medium",
    letterSpacing: 0.7,
    marginBottom: Spacing.sm,
  },
  rowHead: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    marginTop: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  head: { fontSize: FontSizes.md, fontFamily: "Inter_500Medium" },
  micro: {
    fontSize: FontSizes.xs,
    fontFamily: "Inter_400Regular",
    lineHeight: 17,
    marginBottom: Spacing.sm,
  },
  hr: { height: StyleSheet.hairlineWidth, marginVertical: Spacing.sm },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
    marginBottom: Spacing.xs,
    alignItems: "center",
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: Radii.button,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  chipText: {
    fontSize: FontSizes.sm,
    fontFamily: "Inter_500Medium",
  },
  toggleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: Spacing.xs,
  },
  toggleLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    flexShrink: 1,
  },
  toggleTitle: {
    fontSize: FontSizes.sm,
    fontFamily: "Inter_400Regular",
    flexShrink: 1,
  },
  exportBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    borderRadius: Radii.card,
    paddingVertical: Spacing.md,
    minHeight: 48,
    marginTop: Spacing.sm,
  },
  exportTxt: {
    color: "#fff",
    fontSize: FontSizes.md,
    fontFamily: "Inter_500Medium",
  },
  importBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    borderRadius: Radii.card,
    borderWidth: 1,
    paddingVertical: Spacing.md,
    minHeight: 48,
    marginTop: Spacing.sm,
    backgroundColor: Colors.bg,
  },
  pasteBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    borderRadius: Radii.card,
    borderWidth: 1,
    paddingVertical: Spacing.md,
    minHeight: 48,
    marginTop: Spacing.sm,
    backgroundColor: Colors.bg,
  },
  importTxt: {
    fontSize: FontSizes.sm,
    fontFamily: "Inter_500Medium",
  },
  pasteTxt: {
    fontSize: FontSizes.sm,
    fontFamily: "Inter_500Medium",
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.45)",
  },
  modalSheet: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    borderWidth: 1,
    padding: Spacing.lg,
    paddingBottom: Spacing.xl + 8,
    maxHeight: "88%",
    gap: Spacing.sm,
  },
  modalTitle: {
    fontSize: FontSizes.lg,
    fontFamily: "Inter_500Medium",
  },
  modalHint: {
    fontSize: FontSizes.sm,
    fontFamily: "Inter_400Regular",
    lineHeight: 20,
  },
  pasteInput: {
    minHeight: 180,
    maxHeight: 320,
    borderWidth: 1,
    borderRadius: Radii.button,
    padding: Spacing.md,
    fontSize: FontSizes.xs,
    fontFamily: "Inter_400Regular",
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    gap: Spacing.md,
    marginTop: Spacing.sm,
  },
  modalCancel: { paddingVertical: Spacing.sm, paddingHorizontal: Spacing.md },
  modalCancelTxt: { fontSize: FontSizes.md, fontFamily: "Inter_500Medium" },
  modalApply: {
    borderRadius: Radii.button,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    minWidth: 100,
    alignItems: "center",
  },
  modalApplyTxt: { color: "#fff", fontSize: FontSizes.md, fontFamily: "Inter_500Medium" },
});
