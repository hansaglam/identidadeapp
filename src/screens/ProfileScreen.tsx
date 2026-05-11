import React, { useState, useMemo, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Switch,
  Linking,
  Modal,
  Alert,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { format, parseISO, subDays, isBefore, startOfDay } from "date-fns";
import { useUserStore } from "../store/userStore";
import { useCheckinsStore } from "../store/checkinsStore";
import { useHabitStore } from "../store/habitStore";
import {
  cancelAllMorningNotifications,
  scheduleMorningNotifications,
  requestNotificationPermissions,
  setupNotifications,
} from "../utils/notifications";
import { getAverageAutomaticity } from "../utils/profileMetrics";
import PremiumGateModal from "../components/PremiumGateModal";
import ConfirmDialog from "../components/ConfirmDialog";
import PrivacyDataModal from "../components/PrivacyDataModal";
import EditCommitmentModal from "../components/EditCommitmentModal";
import AdvancedPreferencesCard from "../components/AdvancedPreferencesCard";
import type { UserProfile } from "../types";
import { Spacing } from "../constants/theme";

const PAGE_BG = "#F8FAFC";
const APP_VERSION = "1.0.0";

type ProfileDialog = null | "notif_success" | "notif_settings" | "delete_all";

const cardShadow = {
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.04,
  shadowRadius: 12,
  elevation: 3,
} as const;

function isRestModeActive(restUntil: string | null | undefined): boolean {
  if (!restUntil || typeof restUntil !== "string") return false;
  const day = restUntil.slice(0, 10);
  const today = format(new Date(), "yyyy-MM-dd");
  return day >= today;
}

function useLast14Bars(startDateIso: string, checkins: Record<string, { completed?: boolean }>) {
  return useMemo(() => {
    if (!startDateIso) {
      return {
        bars: [] as { beforeStart: boolean; completed: boolean }[],
        completedInWindow: 0,
        pct: 0,
      };
    }
    const start = startOfDay(parseISO(startDateIso));
    const bars: { beforeStart: boolean; completed: boolean }[] = [];
    let completedInWindow = 0;
    for (let i = 13; i >= 0; i--) {
      const d = subDays(startOfDay(new Date()), i);
      const key = format(d, "yyyy-MM-dd");
      const beforeStart = isBefore(d, start);
      if (beforeStart) {
        bars.push({ beforeStart: true, completed: false });
        continue;
      }
      const completed = checkins[key]?.completed === true;
      if (completed) completedInWindow++;
      bars.push({ beforeStart: false, completed });
    }
    const pct = Math.round((completedInWindow / 14) * 100);
    return { bars, completedInWindow, pct };
  }, [startDateIso, checkins]);
}

export default function ProfileScreen() {
  const {
    profile,
    setName,
    setHapticsEnabled,
    clearData,
    updateProfile,
  } = useUserStore();
  const loadProfileAgain = useUserStore((s) => s.loadProfile);
  const profileLoadFailed = useUserStore((s) => s.profileLoadFailed);
  const dayNumber = useUserStore((s) => s.dayNumber());
  const checkins = useCheckinsStore((s) => s.checkins);
  const { getStreakState, completionRate, getTodayCheckin } = useCheckinsStore();
  const streakState = getStreakState();

  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(profile?.name ?? "");
  const [showGate, setShowGate] = useState(false);
  const [profileDialog, setProfileDialog] = useState<ProfileDialog>(null);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showCommitmentEdit, setShowCommitmentEdit] = useState(false);
  const [notifSheetOpen, setNotifSheetOpen] = useState(false);
  const [backupSheetOpen, setBackupSheetOpen] = useState(false);
  const [achievementsModalOpen, setAchievementsModalOpen] = useState(false);

  const isPremium = profile?.isPremium ?? false;
  const hapticsEnabled = profile?.hapticsEnabled ?? true;
  const notifHour = profile?.notificationHour ?? 9;
  const notifMin = profile?.notificationMinute ?? 0;
  const restActive = profile ? isRestModeActive(profile.restModeUntilISO) : false;

  const rate = profile ? completionRate(profile.startDate) : 0;
  const avgAuto = useMemo(() => getAverageAutomaticity(checkins), [checkins]);
  const autoPct = avgAuto != null ? Math.round((avgAuto / 10) * 100) : 0;

  const achievements = useMemo(() => {
    if (!profile) return [];
    const cur = streakState.currentStreak;
    const list: { emoji: string; title: string; desc: string; unlocked: boolean }[] = [
      { emoji: "🌱", title: "İlk filiz", desc: "Yolculuk başladı", unlocked: dayNumber >= 1 },
      { emoji: "🔥", title: "7 gün üst üste", desc: "Streak gücü", unlocked: cur >= 7 },
      { emoji: "🎯", title: "30 gün", desc: "Üçte bir", unlocked: dayNumber >= 30 },
      { emoji: "🌳", title: "İlk ağaç", desc: "66 tamamlandı", unlocked: (profile.completedHabits?.length ?? 0) > 0 },
      { emoji: "⭐", title: "Premium", desc: "Tam deneyim", unlocked: isPremium },
    ];
    return list;
  }, [profile, dayNumber, streakState.currentStreak, isPremium]);

  const last14 = useLast14Bars(profile?.startDate ?? "", checkins);

  const applyProfilePatch = useCallback(
    async (patch: Partial<UserProfile>) => {
      await updateProfile(patch);
      const next = useUserStore.getState().profile;
      const todayDone = getTodayCheckin()?.completed ?? false;
      if (next) await setupNotifications(next, todayDone).catch(console.warn);
    },
    [updateProfile, getTodayCheckin]
  );

  const handleSaveName = async () => {
    if (!nameInput.trim()) return;
    await setName(nameInput.trim());
    setEditingName(false);
  };

  const handleNotifSetup = async () => {
    const granted = await requestNotificationPermissions();
    if (granted) {
      setProfileDialog("notif_success");
    } else {
      setProfileDialog("notif_settings");
    }
  };

  const notifTimeLabel = `Sabah ${String(notifHour).padStart(2, "0")}:${String(notifMin).padStart(2, "0")}`;

  if (!profile) {
    if (profileLoadFailed) {
      return (
        <SafeAreaView style={[styles.safe, { backgroundColor: PAGE_BG }]} edges={["top"]}>
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>Profil okunamadı</Text>
            <Text style={styles.retryBody}>
              Depolama veya izin kaynaklı geçici bir sorun olabilir. Tekrar deneyerek profili yeniden yükleyebilirsin.
            </Text>
            <TouchableOpacity style={styles.retryPill} onPress={() => loadProfileAgain()} activeOpacity={0.85}>
              <Text style={styles.retryPillText}>Tekrar dene</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      );
    }
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: PAGE_BG }]} edges={["top"]}>
        <View style={styles.empty}>
          <Text style={styles.emptyMuted}>Yükleniyor...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: PAGE_BG }]} edges={["top"]}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.headerRow}>
          <Text style={styles.headerTitle}>Profil</Text>
          <View style={[styles.statusBadge, restActive ? styles.statusBadgeRest : styles.statusBadgeOk]}>
            <Text style={[styles.statusBadgeText, restActive && styles.statusBadgeTextRest]}>
              {restActive ? "🔴 Mola" : "🟢 Aktif"}
            </Text>
          </View>
        </View>

        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarLetter}>
              {(profile.name || profile.habitName || "K").slice(0, 1).toUpperCase()}
            </Text>
          </View>
          <View style={styles.profileMain}>
            {editingName ? (
              <TextInput
                style={styles.nameInput}
                value={nameInput}
                onChangeText={setNameInput}
                autoFocus
                returnKeyType="done"
                onSubmitEditing={() => void handleSaveName()}
              />
            ) : (
              <Text style={styles.displayName}>{profile.name || "Kahraman"}</Text>
            )}
            {isPremium ? (
              <View style={styles.premiumBadge}>
                <Text style={styles.premiumBadgeText}>⭐ Premium</Text>
              </View>
            ) : null}
            <Text style={styles.journeyMeta}>
              Gün {dayNumber} · 66 günlük yolculuk
            </Text>
          </View>
          <TouchableOpacity
            style={styles.editIconBtn}
            onPress={() => {
              if (editingName) void handleSaveName();
              else {
                setEditingName(true);
                setNameInput(profile.name ?? "");
              }
            }}
            hitSlop={8}
          >
            {editingName ? (
              <Ionicons name="checkmark" size={20} color="#94A3B8" />
            ) : (
              <Ionicons name="pencil" size={18} color="#94A3B8" />
            )}
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionLabel}>İSTATİSTİKLER</Text>
        <View style={styles.statRow}>
          <View style={styles.statCard}>
            <Text style={styles.statBig}>{dayNumber}</Text>
            <Text style={styles.statSmall}>gün</Text>
          </View>
          <View style={[styles.statCard, { marginLeft: 10 }]}>
            <Text style={styles.statBig}>%{autoPct}</Text>
            <Text style={styles.statSmall}>otomatiklik</Text>
          </View>
          <View style={[styles.statCard, { marginLeft: 10 }]}>
            <Text style={styles.statBig}>%{Math.round(rate * 100)}</Text>
            <Text style={styles.statSmall}>tamamlama</Text>
          </View>
        </View>

        <Text style={styles.sectionLabel}>SON 14 GÜN</Text>
        <View style={styles.chartCard}>
          <View style={styles.barsRow}>
            {last14.bars.map((b, i) => (
              <View
                key={i}
                style={[
                  styles.bar,
                  {
                    height: b.beforeStart ? 20 : b.completed ? 40 : 20,
                    backgroundColor: b.beforeStart ? "#E2E8F0" : b.completed ? "#10B981" : "#E2E8F0",
                  },
                ]}
              />
            ))}
          </View>
          <Text style={styles.chartCaption}>
            {last14.completedInWindow}/14 gün tamamlandı · %{last14.pct}
          </Text>
        </View>

        <View style={styles.achHeadRow}>
          <Text style={[styles.sectionLabel, styles.achSectionPad]}>BAŞARIMLAR</Text>
          <TouchableOpacity activeOpacity={0.7} onPress={() => setAchievementsModalOpen(true)}>
            <Text style={styles.tumu}>Tümü →</Text>
          </TouchableOpacity>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.achScroll}
        >
          {achievements.map((a) => (
            <View key={a.title} style={[styles.achCard, !a.unlocked && styles.achCardLocked]}>
              <Text style={styles.achEmoji}>{a.emoji}</Text>
              <Text style={styles.achTitle}>{a.title}</Text>
              <Text style={styles.achDesc}>{a.desc}</Text>
            </View>
          ))}
        </ScrollView>

        <Text style={styles.sectionLabel}>AYARLAR</Text>
        <View style={styles.settingsList}>
          <SettingsRow
            emoji="🔔"
            title="Bildirimler"
            subtitle={notifTimeLabel}
            danger={false}
            onPress={() => {
              setNotifSheetOpen(true);
            }}
          />
          <SettingsRow
            emoji="🎨"
            title="Tema"
            subtitle="Açık"
            danger={false}
            onPress={() =>
              Alert.alert("Tema", "Şu an yalnızca açık tema destekleniyor.")
            }
          />
          <SettingsRow
            emoji="🛡️"
            title="Veri ve gizlilik"
            subtitle="Bu cihazda ne tutuluyor"
            danger={false}
            onPress={() => setShowPrivacy(true)}
          />
          <SettingsRow
            emoji="💾"
            title="Verileri yedekle"
            subtitle="JSON olarak dışa aktar"
            danger={false}
            onPress={() => setBackupSheetOpen(true)}
          />
          {!isPremium ? (
            <SettingsRow
              emoji="✨"
              title="Premium"
              subtitle="Yolculuk ve tam özellikler"
              danger={false}
              onPress={() => setShowGate(true)}
            />
          ) : null}
          <SettingsRow
            emoji="✏️"
            title="Taahhüdünü düzenle"
            subtitle={profile.habitName}
            onPress={() => setShowCommitmentEdit(true)}
          />
          <View style={styles.setRow}>
            <Text style={styles.setEmoji}>📳</Text>
            <View style={styles.setTextCol}>
              <Text style={styles.setTitle}>Titreşim</Text>
              <Text style={styles.setSub}>Tamamlama geri bildirimi</Text>
            </View>
            <Switch
              value={hapticsEnabled}
              onValueChange={setHapticsEnabled}
              trackColor={{ true: "#10B981", false: "#E2E8F0" }}
              thumbColor="#FFFFFF"
            />
          </View>
          <SettingsRow
            emoji="🗑️"
            title="Verileri sil"
            subtitle="Tüm geçmiş ve notlar"
            danger
            onPress={() => setProfileDialog("delete_all")}
          />
          <SettingsRow
            emoji="ℹ️"
            title="Hakkında"
            subtitle={`${APP_VERSION} · discipline`}
            danger={false}
            onPress={() =>
              Alert.alert("Kimlik", `${APP_VERSION} · discipline\n\nYerel ilkelerle çalışan bir alışkanlık koçu.`)
            }
          />
        </View>

        <TouchableOpacity style={styles.notifPermRow} onPress={() => void handleNotifSetup()} activeOpacity={0.85}>
          <Text style={styles.notifPermText}>Bildirim iznini sistemden kontrol et</Text>
          <Ionicons name="open-outline" size={18} color="#10B981" />
        </TouchableOpacity>

        <View style={styles.footerQuote}>
          <Text style={styles.quoteMain}>Motivasyon bir duygu değil</Text>
          <Text style={styles.quoteSub}>{APP_VERSION} · discipline</Text>
        </View>

        <View style={{ height: 28 }} />
      </ScrollView>

      <Modal
        visible={notifSheetOpen}
        animationType="slide"
        {...(Platform.OS === "ios" ? { presentationStyle: "pageSheet" as const } : {})}
        onRequestClose={() => setNotifSheetOpen(false)}
      >
        <SafeAreaView style={styles.sheetRoot} edges={["top", "bottom"]}>
          <View style={styles.sheetHeader}>
            <Text style={styles.sheetTitle}>Bildirimler</Text>
            <TouchableOpacity onPress={() => setNotifSheetOpen(false)} hitSlop={12}>
              <Text style={styles.sheetClose}>Kapat</Text>
            </TouchableOpacity>
          </View>
          <ScrollView contentContainerStyle={styles.sheetScroll} keyboardShouldPersistTaps="handled">
            <AdvancedPreferencesCard
              profile={profile}
              onPatch={applyProfilePatch}
              visibleSections={["notifications"]}
            />
            <Text style={styles.sheetHint}>
              Ana hatırlatma saati: {notifTimeLabel}. İzin için ayrıca «Bildirim iznini sistemden kontrol et» kullan.
            </Text>
          </ScrollView>
        </SafeAreaView>
      </Modal>

      <Modal
        visible={backupSheetOpen}
        animationType="slide"
        {...(Platform.OS === "ios" ? { presentationStyle: "pageSheet" as const } : {})}
        onRequestClose={() => setBackupSheetOpen(false)}
      >
        <SafeAreaView style={styles.sheetRoot} edges={["top", "bottom"]}>
          <View style={styles.sheetHeader}>
            <Text style={styles.sheetTitle}>Yedek</Text>
            <TouchableOpacity onPress={() => setBackupSheetOpen(false)} hitSlop={12}>
              <Text style={styles.sheetClose}>Kapat</Text>
            </TouchableOpacity>
          </View>
          <ScrollView contentContainerStyle={styles.sheetScroll} keyboardShouldPersistTaps="handled">
            <AdvancedPreferencesCard
              profile={profile}
              onPatch={applyProfilePatch}
              visibleSections={["backup"]}
            />
          </ScrollView>
        </SafeAreaView>
      </Modal>

      <Modal
        visible={achievementsModalOpen}
        animationType="slide"
        {...(Platform.OS === "ios" ? { presentationStyle: "pageSheet" as const } : {})}
        onRequestClose={() => setAchievementsModalOpen(false)}
      >
        <SafeAreaView style={styles.sheetRoot} edges={["top", "bottom"]}>
          <View style={styles.sheetHeader}>
            <Text style={styles.sheetTitle}>Başarımlar</Text>
            <TouchableOpacity onPress={() => setAchievementsModalOpen(false)} hitSlop={12}>
              <Text style={styles.sheetClose}>Kapat</Text>
            </TouchableOpacity>
          </View>
          <ScrollView contentContainerStyle={styles.achModalScroll} keyboardShouldPersistTaps="handled">
            {achievements.map((a) => (
              <View
                key={a.title}
                style={[styles.achModalCard, !a.unlocked && styles.achCardLocked]}
              >
                <Text style={styles.achEmoji}>{a.emoji}</Text>
                <View style={styles.achModalTextCol}>
                  <Text style={styles.achTitle}>{a.title}</Text>
                  <Text style={styles.achDesc}>{a.desc}</Text>
                  <Text style={[styles.achStatus, !a.unlocked && styles.achStatusLocked]}>
                    {a.unlocked ? "Açıldı" : "Kilitli"}
                  </Text>
                </View>
              </View>
            ))}
          </ScrollView>
        </SafeAreaView>
      </Modal>

      <PremiumGateModal visible={showGate} onClose={() => setShowGate(false)} trigger="journey" />

      <PrivacyDataModal visible={showPrivacy} onClose={() => setShowPrivacy(false)} />

      <EditCommitmentModal
        visible={showCommitmentEdit}
        onClose={() => setShowCommitmentEdit(false)}
        habitName={profile.habitName}
        habitAnchor={profile.habitAnchor}
        habitWhy={profile.habitWhy}
        onSave={async ({ habitName, habitAnchor, habitWhy }) => {
          await updateProfile({ habitName, habitAnchor, habitWhy });
          const nextProfile = useUserStore.getState().profile;
          const todayDone = getTodayCheckin()?.completed ?? false;
          if (nextProfile) {
            await setupNotifications(nextProfile, todayDone).catch(console.warn);
          }
        }}
      />

      <ConfirmDialog
        visible={profileDialog === "notif_success"}
        title="Bildirimler açık"
        message="Sabah hatırlatmaların seçtiğin saate göre planlanacak."
        tone="success"
        closeOnBackdropPress={false}
        onRequestClose={() => setProfileDialog(null)}
        actions={[
          {
            label: "Tamam",
            variant: "primary",
            onPress: async () => {
              setProfileDialog(null);
              if (profile) {
                await cancelAllMorningNotifications();
                await scheduleMorningNotifications(profile);
              }
            },
          },
        ]}
      />

      <ConfirmDialog
        visible={profileDialog === "notif_settings"}
        title="İzin gerekli"
        message="Bildirimleri zamanlayabilmemiz için sistem ayarlarından bildirim iznini açman gerekiyor."
        tone="default"
        onRequestClose={() => setProfileDialog(null)}
        actions={[
          {
            label: "Vazgeç",
            variant: "secondary",
            onPress: () => setProfileDialog(null),
          },
          {
            label: "Ayarlara git",
            variant: "primary",
            onPress: () => {
              setProfileDialog(null);
              Linking.openSettings();
            },
          },
        ]}
      />

      <ConfirmDialog
        visible={profileDialog === "delete_all"}
        title="Tüm verileri sil"
        message="Alışkanlık geçmişin, check-in kayıtların ve zihin notların bu cihazdan silinecek. Bu işlem geri alınamaz."
        tone="danger"
        onRequestClose={() => setProfileDialog(null)}
        actions={[
          {
            label: "Vazgeç",
            variant: "secondary",
            onPress: () => setProfileDialog(null),
          },
          {
            label: "Sil",
            variant: "destructive",
            onPress: async () => {
              setProfileDialog(null);
              await cancelAllMorningNotifications();
              await clearData();
              await useHabitStore.getState().resetWithJourney();
            },
          },
        ]}
      />
    </SafeAreaView>
  );
}

function SettingsRow({
  emoji,
  title,
  subtitle,
  danger = false,
  onPress,
}: {
  emoji: string;
  title: string;
  subtitle: string;
  danger?: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity style={styles.setRow} onPress={onPress} activeOpacity={0.75}>
      <Text style={styles.setEmoji}>{emoji}</Text>
      <View style={styles.setTextCol}>
        <Text style={styles.setTitle}>{title}</Text>
        <Text style={[styles.setSub, danger && styles.setSubDanger]}>{subtitle}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#CBD5E1" />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: {
    paddingBottom: Spacing.xl,
    backgroundColor: PAGE_BG,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: Spacing.sm,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: "800",
    color: "#0F172A",
  },
  statusBadge: {
    borderRadius: 12,
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  statusBadgeOk: {
    backgroundColor: "#ECFDF5",
  },
  statusBadgeRest: {
    backgroundColor: "#FEF2F2",
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#059669",
  },
  statusBadgeTextRest: {
    color: "#DC2626",
  },
  profileCard: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 16,
    marginTop: 12,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    ...cardShadow,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#ECFDF5",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarLetter: {
    fontSize: 22,
    fontWeight: "700",
    color: "#059669",
  },
  profileMain: { flex: 1, marginLeft: 14, justifyContent: "center" },
  displayName: { fontSize: 18, fontWeight: "700", color: "#0F172A" },
  nameInput: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0F172A",
    borderBottomWidth: 1,
    borderBottomColor: "#10B981",
    paddingVertical: 2,
  },
  premiumBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#FEF3C7",
    borderRadius: 8,
    paddingVertical: 2,
    paddingHorizontal: 8,
    marginTop: 6,
  },
  premiumBadgeText: {
    fontSize: 11,
    color: "#D97706",
    fontWeight: "600",
  },
  journeyMeta: {
    fontSize: 13,
    color: "#64748B",
    marginTop: 6,
  },
  editIconBtn: {
    padding: 6,
  },
  sectionLabel: {
    marginHorizontal: 16,
    marginTop: 16,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.2,
    color: "#94A3B8",
    textTransform: "uppercase",
  },
  statRow: {
    flexDirection: "row",
    marginHorizontal: 16,
    marginTop: 8,
    gap: 10,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 12,
    alignItems: "center",
    ...cardShadow,
  },
  statBig: {
    fontSize: 24,
    fontWeight: "800",
    color: "#0F172A",
  },
  statSmall: {
    fontSize: 11,
    color: "#64748B",
    marginTop: 4,
    textAlign: "center",
  },
  chartCard: {
    marginHorizontal: 16,
    marginTop: 8,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    ...cardShadow,
  },
  barsRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    gap: 6,
  },
  bar: {
    width: 8,
    borderRadius: 4,
  },
  chartCaption: {
    fontSize: 13,
    color: "#64748B",
    marginTop: 12,
    textAlign: "center",
  },
  achHeadRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
  },
  achSectionPad: {
    marginHorizontal: 0,
    marginTop: 16,
  },
  tumu: {
    color: "#10B981",
    fontWeight: "600",
    fontSize: 13,
  },
  achScroll: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 4,
  },
  achCard: {
    width: 120,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 12,
    marginRight: 10,
    ...cardShadow,
  },
  achCardLocked: { opacity: 0.45 },
  achEmoji: { fontSize: 24, marginBottom: 6 },
  achTitle: { fontSize: 13, fontWeight: "600", color: "#0F172A" },
  achDesc: { fontSize: 11, color: "#64748B", marginTop: 4 },
  achModalScroll: {
    padding: 16,
    paddingBottom: 32,
  },
  achModalCard: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    alignItems: "flex-start",
    gap: 12,
    ...cardShadow,
  },
  achModalTextCol: { flex: 1 },
  achStatus: {
    fontSize: 11,
    fontWeight: "600",
    color: "#059669",
    marginTop: 8,
  },
  achStatusLocked: { color: "#94A3B8" },
  settingsList: {
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 8,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    overflow: "hidden",
    ...cardShadow,
  },
  setRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  setEmoji: { fontSize: 18, marginRight: 12, width: 28 },
  setTextCol: { flex: 1 },
  setTitle: { fontSize: 15, fontWeight: "600", color: "#0F172A" },
  setSub: { fontSize: 12, color: "#64748B", marginTop: 2 },
  setSubDanger: { color: "#EF4444" },
  notifPermRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginHorizontal: 16,
    marginTop: 8,
  },
  notifPermText: {
    fontSize: 13,
    color: "#10B981",
    fontWeight: "600",
  },
  footerQuote: {
    marginTop: 16,
    marginBottom: 20,
    alignItems: "center",
    paddingHorizontal: 24,
  },
  quoteMain: {
    fontSize: 12,
    color: "#94A3B8",
    fontStyle: "italic",
    textAlign: "center",
  },
  quoteSub: {
    fontSize: 11,
    color: "#CBD5E1",
    marginTop: 4,
  },
  sheetRoot: { flex: 1, backgroundColor: PAGE_BG },
  sheetHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#E2E8F0",
    backgroundColor: "#FFFFFF",
  },
  sheetTitle: { fontSize: 17, fontWeight: "700", color: "#0F172A" },
  sheetClose: { fontSize: 16, color: "#10B981", fontWeight: "600" },
  sheetScroll: { padding: 16, paddingBottom: 40 },
  sheetHint: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 12,
    lineHeight: 18,
  },
  empty: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    gap: 12,
  },
  emptyTitle: { fontSize: 18, fontWeight: "700", color: "#0F172A", textAlign: "center" },
  retryBody: { fontSize: 14, color: "#64748B", textAlign: "center", lineHeight: 22 },
  retryPill: {
    marginTop: 8,
    backgroundColor: "#10B981",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
  },
  retryPillText: { color: "#FFFFFF", fontWeight: "600" },
  emptyMuted: { color: "#64748B" },
});
