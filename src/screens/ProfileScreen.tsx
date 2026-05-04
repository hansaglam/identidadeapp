import React, { useState, useMemo, useCallback } from "react";
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, Switch, Linking, Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Pencil, Check, Bell, Vibrate, Trash2, Crown, ChevronRight, Zap,
  TrendingUp, Eye, Shield,
} from "lucide-react-native";
import { useUserStore } from "../store/userStore";
import { useCheckinsStore } from "../store/checkinsStore";
import { useMindDumpStore } from "../store/mindDumpStore";
import {
  cancelAllMorningNotifications,
  scheduleMorningNotifications,
  requestNotificationPermissions,
  setupNotifications,
} from "../utils/notifications";
import {
  getAverageAutomaticity,
  getLast14AutoTrendPercent,
  getLast14ConsistencyPercent,
  estimateAutomationFromFirst14Linear,
} from "../utils/profileMetrics";
import { buildIdentityMirrorReport } from "../utils/identityMirror";
import {
  evaluateBehavior,
  getSurfaceStatus,
  SURFACE_EMOJI,
  SURFACE_LABEL,
} from "../utils/behaviorEngine";
import PremiumGateModal from "../components/PremiumGateModal";
import ConfirmDialog from "../components/ConfirmDialog";
import PrivacyDataModal from "../components/PrivacyDataModal";
import EditCommitmentModal from "../components/EditCommitmentModal";
import AdvancedPreferencesCard from "../components/AdvancedPreferencesCard";
import ProfileStats from "../components/ProfileStats";
import AutomaticityTrendChart from "../components/AutomaticityTrendChart";
import { buildAutomaticitySeriesLastDays } from "../utils/automaticityChart";
import DisciplineMusclesView from "../components/DisciplineMusclesView";
import FiveSecondTrainer, { FiveSecondScenario } from "../components/FiveSecondTrainer";
import { Colors, Spacing, Radii, FontSizes } from "../constants/theme";
import { APP_PROMISE_PROFILE_TAGLINE } from "../constants/purposeCopy";
import { getIdentityTemplate } from "../constants/identityTemplates";
import type { UserProfile } from "../types";
import type { DisciplineMuscles } from "../types/discipline";



const FIVE_TRAIN: FiveSecondScenario = {
  id: "profile-manual",
  type: "micro",
  trigger: "Şimdi omuzlarını bırak, derin nefes al, sonra alışkanlık için en küçük adımı at.",
  countdownDuration: 5,
  difficulty: 2,
  disciplineMuscle: "karar",
};

const DEFAULT_MUSCLES: DisciplineMuscles = {
  karar: 1, direnc: 1, baglam: 1, energi: 1, sosyal: 1,
};

const DEFAULT_XP: DisciplineMuscles = {
  karar: 0, direnc: 0, baglam: 0, energi: 0, sosyal: 0,
};

type ProfileDialog = null | "notif_success" | "notif_settings" | "delete_all";

export default function ProfileScreen() {

  const {
    profile,
    setName,
    setPremium,
    setHapticsEnabled,
    setNotificationTime,
    clearData,
    addDisciplineMuscleXp,
    updateProfile,
  } = useUserStore();
  const loadProfileAgain = useUserStore((s) => s.loadProfile);
  const profileLoadFailed = useUserStore((s) => s.profileLoadFailed);
  const dayNumber = useUserStore((s) => s.dayNumber());
  const checkins = useCheckinsStore((s) => s.checkins);
  const { getStreakState, completionRate, getTodayCheckin } = useCheckinsStore();
  const streakState = getStreakState();
  const mindDumpEntries = useMindDumpStore((s) => s.entries);

  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(profile?.name ?? "");
  const [showGate, setShowGate] = useState(false);
  const [showTrain, setShowTrain] = useState(false);
  const [profileDialog, setProfileDialog] = useState<ProfileDialog>(null);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showCommitmentEdit, setShowCommitmentEdit] = useState(false);

  const isPremium = profile?.isPremium ?? false;
  const hapticsEnabled = profile?.hapticsEnabled ?? true;
  const notifHour = profile?.notificationHour ?? 9;
  const notifMin = profile?.notificationMinute ?? 0;
  const identityTemplate = getIdentityTemplate(profile?.identityTagId ?? null);

  const stats = useMemo(() => {
    if (!profile) {
      return {
        cons14: 0,
        avgAuto: null as number | null,
        trend14: null as number | null,
      };
    }
    return {
      cons14: getLast14ConsistencyPercent(profile.startDate, checkins),
      avgAuto: getAverageAutomaticity(checkins),
      trend14: getLast14AutoTrendPercent(profile.startDate, checkins),
    };
  }, [profile, checkins]);

  const automaticitySeries = useMemo(
    () =>
      profile
        ? buildAutomaticitySeriesLastDays(profile.startDate, checkins, 30)
        : [],
    [profile, checkins]
  );

  // Lally regresyon tahmini
  const linearEstimate = useMemo(() => {
    if (!profile || dayNumber < 14) return null;
    return estimateAutomationFromFirst14Linear(profile.startDate, checkins);
  }, [profile, checkins, dayNumber]);

  // Kimlik Aynası
  const mirrorReport = useMemo(() => {
    if (!profile) return null;
    return buildIdentityMirrorReport(
      profile.startDate,
      mindDumpEntries,
      profile.habitName
    );
  }, [profile, mindDumpEntries]);

  // Behavior Engine — surface status
  const surfaceStatus = useMemo(() => {
    if (!profile) return "on_track" as const;
    const todayDone = checkins[new Date().toISOString().slice(0, 10)]?.completed ?? false;
    const state = evaluateBehavior(
      dayNumber, profile.startDate, checkins, mindDumpEntries,
      todayDone, streakState.totalDays66,
      completionRate(profile.startDate), streakState.currentStreak
    );
    return getSurfaceStatus(state.riskLevel);
  }, [profile, checkins, dayNumber, mindDumpEntries, streakState]);

  const muscles = useMemo(
    () => (profile?.disciplineMuscles
      ? { ...DEFAULT_MUSCLES, ...profile.disciplineMuscles }
      : DEFAULT_MUSCLES),
    [profile?.disciplineMuscles]
  );
  const muscleXp = useMemo(
    () => (profile?.disciplineMuscleXp
      ? { ...DEFAULT_XP, ...profile.disciplineMuscleXp }
      : DEFAULT_XP),
    [profile?.disciplineMuscleXp]
  );

  const applyProfilePatch = useCallback(
    async (patch: Partial<UserProfile>) => {
      await updateProfile(patch);
      const next = useUserStore.getState().profile;
      const todayDone = getTodayCheckin()?.completed ?? false;
      if (next) await setupNotifications(next, todayDone).catch(console.warn);
    },
    [updateProfile, getTodayCheckin],
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

  const handleDeleteData = () => {
    setProfileDialog("delete_all");
  };

  const notifLabel = `${String(notifHour).padStart(2, "0")}:${String(notifMin).padStart(2, "0")}`;
  const rate = profile ? completionRate(profile.startDate) : 0;

  if (!profile) {
    if (profileLoadFailed) {
      return (
        <SafeAreaView style={[styles.container, { backgroundColor: Colors.bg }]} edges={["top"]}>
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>Profil okunamadı</Text>
            <Text style={styles.retryBody}>
              Depolama veya izin kaynaklı geçici bir sorun olabilir. Tekrar deneyerek profili yeniden yükleyebilirsin.
            </Text>
            <TouchableOpacity
              style={styles.retryPill}
              onPress={() => loadProfileAgain()}
              activeOpacity={0.85}
            >
              <Text style={styles.retryPillText}>Tekrar dene</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      );
    }
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: Colors.bg }]} edges={["top"]}>
        <View style={styles.empty}>
          <Text style={styles.emptyText}>Yükleniyor...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: Colors.bg }]} edges={["top"]}>
      <ScrollView
        contentContainerStyle={[styles.scroll, { backgroundColor: Colors.bg }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Profil</Text>
          <View style={styles.statusPill}>
            <Text style={styles.statusEmoji}>{SURFACE_EMOJI[surfaceStatus]}</Text>
            <Text style={styles.statusLabel}>{SURFACE_LABEL[surfaceStatus]}</Text>
          </View>
        </View>

        {/* User card */}
        <View style={styles.userCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarLetter}>
              {(profile.name || profile.habitName || "K").slice(0, 1).toUpperCase()}
            </Text>
          </View>
          <View style={styles.userInfo}>
            {editingName ? (
              <TextInput
                style={styles.nameInput}
                value={nameInput}
                onChangeText={setNameInput}
                autoFocus
                returnKeyType="done"
                onSubmitEditing={handleSaveName}
              />
            ) : (
              <Text style={styles.userName}>
                {profile.name || "Kahraman"}
              </Text>
            )}
            {isPremium && (
              <View style={styles.premiumBadge}>
                <Crown size={12} color={Colors.gold} strokeWidth={1.5} />
                <Text style={styles.premiumBadgeText}>Premium</Text>
              </View>
            )}
          </View>
          <TouchableOpacity
            style={styles.editBtn}
            onPress={() => {
              if (editingName) { handleSaveName(); }
              else { setEditingName(true); setNameInput(profile.name ?? ""); }
            }}
          >
            {editingName
              ? <Check size={16} color={Colors.primary} strokeWidth={2} />
              : <Pencil size={16} color={Colors.textTertiary} strokeWidth={1.5} />}
          </TouchableOpacity>
        </View>

        {/* Habit summary */}
        <View style={styles.habitSummary}>
          <View style={styles.habitSummaryHeader}>
            <Text style={styles.habitSummaryLabel}>Kimlik Hedefin</Text>
            <TouchableOpacity
              hitSlop={8}
              onPress={() => setShowCommitmentEdit(true)}
              style={styles.inlineEditTap}
              activeOpacity={0.85}
            >
              <Text style={styles.inlineEditLabel}>Düzenle</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.habitSummaryValue}>
            {identityTemplate ? `${identityTemplate.emoji} ` : ""}
            {profile.habitName}
          </Text>
          {identityTemplate && (
            <Text style={styles.habitSummaryStatement}>
              “{identityTemplate.identityStatement}”
            </Text>
          )}
          <Text style={styles.habitSummaryAnchor}>📌 {profile.habitAnchor}</Text>
        </View>

        {/* Stats row */}
        <View style={styles.statsRow}>
          <StatTile label="Aktif gün" value={String(dayNumber)} />
          <StatTile label="Tutarlılık" value={`${stats.cons14}%`} />
          <StatTile label="Tamamlama" value={`%${Math.round(rate * 100)}`} />
        </View>

        <ProfileStats
          consistency14={stats.cons14}
          averageAutomaticity={stats.avgAuto}
          autoTrend14={stats.trend14}
        />

        <AutomaticityTrendChart series={automaticitySeries} />

        {/* Lally Linear Regression Card */}
        {dayNumber >= 14 && linearEstimate && (
          <View style={styles.regressionCard}>
            <View style={styles.regressionHeader}>
              <TrendingUp size={18} color={Colors.primary} strokeWidth={1.5} />
              <Text style={styles.regressionTitle}>Kişisel Otomatikleşme Tahmini</Text>
            </View>
            <Text style={styles.regressionBody}>
              Ortalama insan 66 günde otomatikleşir.{"\n"}
              Senin eğrinin eğimi: <Text style={styles.regressionBold}>+{linearEstimate.slopePerDay.toFixed(1)}/gün</Text>.{"\n"}
              {linearEstimate.predictedDayAt7 ? (
                <>Tahmini otomatikleşmen: <Text style={styles.regressionBold}>Gün {linearEstimate.predictedDayAt7}</Text>.</>
              ) : (
                <>Eğimin henüz yeterli değil — tutarlılığını artır.</>
              )}
            </Text>
            <Text style={styles.regressionNote}>
              İlk 14 gün otomatiklik puanlarına dayalı doğrusal regresyon. ({linearEstimate.sampleSize} veri noktası)
            </Text>
          </View>
        )}

        {/* Identity Mirror Card */}
        {mirrorReport && (
          <View style={styles.mirrorCard}>
            <View style={styles.mirrorHeader}>
              <Eye size={18} color={Colors.purple} strokeWidth={1.5} />
              <Text style={styles.mirrorTitle}>Kimlik Aynası</Text>
            </View>
            <Text style={styles.mirrorBody}>{mirrorReport}</Text>
            <Text style={styles.mirrorNote}>
              Zihin Boşaltma notlarındaki kelimelerden otomatik oluşturuldu.
            </Text>
          </View>
        )}

        {/* 66-day progress */}
        {streakState.totalDays66 > 0 && (
          <View style={styles.totalDaysBanner}>
            <Text style={styles.totalDaysText}>
              66 günlük yolculukta {streakState.totalDays66} gün tamamlandı
            </Text>
          </View>
        )}

        <DisciplineMusclesView muscles={muscles} xp={muscleXp} />

        {!isPremium && (
          <TouchableOpacity
            style={styles.upgradeCard}
            onPress={() => setShowGate(true)}
            activeOpacity={0.85}
          >
            <View style={styles.upgradeLeft}>
              <Crown size={20} color={Colors.gold} strokeWidth={1.5} />
              <View>
                <Text style={styles.upgradeTitle}>Kişisel Disiplin Programı</Text>
                <Text style={styles.upgradeSub}>
                  Otomatikleşme tahmini, müdahale sistemi, kimlik raporu
                </Text>
              </View>
            </View>
            <ChevronRight size={18} color={Colors.textTertiary} strokeWidth={1.5} />
          </TouchableOpacity>
        )}

        <AdvancedPreferencesCard profile={profile} onPatch={applyProfilePatch} />

        <Text style={styles.sectionLabel}>AYARLAR</Text>
        <View style={styles.settingsCard}>
          <SettingRow
            iconBg={Colors.surface}
            icon={<Shield size={18} color={Colors.textSecondary} strokeWidth={1.5} />}
            title="Veri ve gizlilik"
            subtitle="Bu cihazda ne tutuluyor — kısa özet"
            action={(
              <TouchableOpacity
                style={styles.pillBtn}
                onPress={() => setShowPrivacy(true)}
              >
                <Text style={styles.pillBtnText}>Aç</Text>
              </TouchableOpacity>
            )}
          />
          <View style={styles.divider} />
          <SettingRow
            iconBg={Colors.primaryLight}
            icon={<Zap size={18} color={Colors.primary} strokeWidth={1.5} />}
            title="Disiplin antrenmanı"
            subtitle="5 saniye kuralı — hızlı karar pratiği"
            action={(
              <TouchableOpacity
                style={styles.pillBtn}
                onPress={() => setShowTrain(true)}
              >
                <Text style={styles.pillBtnText}>Başlat</Text>
              </TouchableOpacity>
            )}
          />
          <View style={styles.divider} />
          <SettingRow
            iconBg={Colors.primaryLight}
            icon={<Bell size={18} color={Colors.primary} strokeWidth={1.5} />}
            title="Bildirimler"
            subtitle={`Sabah ${notifLabel} müdahale bildirimi`}
            action={(
              <TouchableOpacity style={styles.pillBtn} onPress={handleNotifSetup}>
                <Text style={styles.pillBtnText}>Ayarla</Text>
              </TouchableOpacity>
            )}
          />
          <View style={styles.divider} />
          <SettingRow
            iconBg={Colors.purpleLight}
            icon={<Vibrate size={18} color={Colors.purple} strokeWidth={1.5} />}
            title="Titreşim"
            subtitle="Tamamlama geri bildirimi"
            action={(
              <Switch
                value={hapticsEnabled}
                onValueChange={setHapticsEnabled}
                trackColor={{ true: Colors.primary, false: Colors.border }}
                thumbColor={Colors.surface}
              />
            )}
          />
          <View style={styles.divider} />
          <SettingRow
            iconBg={Colors.coralLight}
            icon={<Trash2 size={18} color={Colors.coral} strokeWidth={1.5} />}
            title="Verileri Sil"
            subtitle="Tüm geçmiş ve notlar"
            action={(
              <TouchableOpacity onPress={handleDeleteData}>
                <Text style={styles.deleteLink}>Sil</Text>
              </TouchableOpacity>
            )}
          />
        </View>

        <Text style={styles.tagline}>
          {APP_PROMISE_PROFILE_TAGLINE}
        </Text>
        <Text style={styles.version}>v1.0.0 · discipline</Text>

        {__DEV__ && (
          <View style={styles.devPanel}>
            <Text style={styles.devPanelTitle}>Geliştirici · Premium testi</Text>
            <Text style={styles.devPanelHint}>
              Sadece debug build'de görünür. Yolculuk ve sınırsız Mind Dump'ı dene.
            </Text>
            <View style={styles.devRow}>
              <Text style={styles.devLabel}>Premium önizleme</Text>
              <Switch
                value={isPremium}
                onValueChange={(v) => setPremium(v, v ? "dev_preview" : undefined)}
                trackColor={{ true: Colors.purple, false: Colors.border }}
                thumbColor={Colors.surface}
              />
            </View>
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      <Modal visible={showTrain} animationType="fade" onRequestClose={() => setShowTrain(false)}>
        <SafeAreaView style={styles.trainerRoot} edges={["top", "bottom"]}>
          <FiveSecondTrainer
            scenario={FIVE_TRAIN}
            onComplete={async (_ok, _ms, reward) => {
              if (reward) {
                await addDisciplineMuscleXp(reward.disciplineMuscle, reward.xp);
              }
            }}
            onSkip={() => setShowTrain(false)}
          />
        </SafeAreaView>
      </Modal>

      <PremiumGateModal
        visible={showGate}
        onClose={() => setShowGate(false)}
        trigger="journey"
      />

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
            },
          },
        ]}
      />
    </SafeAreaView>
  );
}

function StatTile({ label, value }: { label: string; value: string }) {
  return (
    <View style={tileS.box}>
      <Text style={tileS.value}>{value}</Text>
      <Text style={tileS.label}>{label}</Text>
    </View>
  );
}

function SettingRow({
  icon, iconBg, title, subtitle, action,
}: {
  icon: React.ReactNode; iconBg: string;
  title: string; subtitle?: string; action?: React.ReactNode;
}) {
  return (
    <View style={rowS.row}>
      <View style={[rowS.iconWrap, { backgroundColor: iconBg }]}>{icon}</View>
      <View style={rowS.text}>
        <Text style={rowS.title}>{title}</Text>
        {subtitle && <Text style={rowS.sub}>{subtitle}</Text>}
      </View>
      {action}
    </View>
  );
}

const tileS = StyleSheet.create({
  box: {
    flex: 1, backgroundColor: Colors.surface,
    borderRadius: Radii.card, borderWidth: 1, borderColor: Colors.border,
    padding: Spacing.md, alignItems: "center", gap: 4,
  },
  value: { fontSize: FontSizes.xl, fontFamily: "Inter_500Medium", color: Colors.textPrimary },
  label: {
    fontSize: FontSizes.xs, fontFamily: "Inter_400Regular",
    color: Colors.textTertiary, textAlign: "center",
  },
});

const rowS = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: Spacing.md, paddingVertical: Spacing.sm },
  iconWrap: {
    width: 34, height: 34, borderRadius: Radii.button,
    alignItems: "center", justifyContent: "center", flexShrink: 0,
  },
  text: { flex: 1, gap: 2 },
  title: { fontSize: FontSizes.md, fontFamily: "Inter_400Regular", color: Colors.textPrimary },
  sub: { fontSize: FontSizes.sm, fontFamily: "Inter_400Regular", color: Colors.textTertiary },
});

const styles = StyleSheet.create({
  empty: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: Spacing.lg,
    gap: Spacing.md,
  },
  emptyTitle: {
    fontSize: FontSizes.lg,
    fontFamily: "Inter_500Medium",
    color: Colors.textPrimary,
    textAlign: "center",
  },
  retryBody: {
    fontSize: FontSizes.sm,
    fontFamily: "Inter_400Regular",
    color: Colors.textSecondary,
    textAlign: "center",
    lineHeight: 22,
    maxWidth: 320,
  },
  retryPill: {
    marginTop: Spacing.sm,
    backgroundColor: Colors.primary,
    borderRadius: Radii.button,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
  },
  retryPillText: {
    fontSize: FontSizes.md,
    fontFamily: "Inter_500Medium",
    color: "#fff",
  },
  emptyText: { color: Colors.textSecondary },
  container: { flex: 1, backgroundColor: Colors.bg },
  scroll: { paddingHorizontal: Spacing.lg, flexGrow: 1 },
  header: {
    paddingTop: Spacing.md, marginBottom: Spacing.lg,
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
  },
  title: { fontSize: FontSizes.xxl, fontFamily: "Inter_500Medium", color: Colors.textPrimary },
  statusPill: {
    flexDirection: "row", alignItems: "center", gap: 4,
    backgroundColor: Colors.primaryLight, borderRadius: Radii.pill,
    paddingHorizontal: Spacing.sm, paddingVertical: 4,
  },
  statusEmoji: { fontSize: 10 },
  statusLabel: { fontSize: FontSizes.xs, fontFamily: "Inter_500Medium", color: Colors.primary },
  userCard: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: Colors.surface, borderRadius: Radii.card,
    borderWidth: 1, borderColor: Colors.border,
    padding: Spacing.md, gap: Spacing.md, marginBottom: Spacing.md,
  },
  avatar: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: Colors.primaryLight,
    alignItems: "center", justifyContent: "center", flexShrink: 0,
  },
  avatarLetter: { fontSize: FontSizes.xl, fontFamily: "Inter_500Medium", color: Colors.primary },
  userInfo: { flex: 1, gap: 4 },
  userName: { fontSize: FontSizes.lg, fontFamily: "Inter_500Medium", color: Colors.textPrimary },
  nameInput: {
    fontSize: FontSizes.lg, fontFamily: "Inter_500Medium", color: Colors.textPrimary,
    borderBottomWidth: 1, borderBottomColor: Colors.primary, paddingBottom: 2,
  },
  premiumBadge: {
    flexDirection: "row", alignItems: "center", gap: 4,
    alignSelf: "flex-start", backgroundColor: Colors.goldLight,
    borderRadius: Radii.pill, paddingHorizontal: Spacing.sm, paddingVertical: 3,
  },
  premiumBadgeText: { fontSize: FontSizes.xs, fontFamily: "Inter_500Medium", color: Colors.gold },
  editBtn: {
    width: 32, height: 32, borderRadius: Radii.button,
    borderWidth: 1, borderColor: Colors.border,
    alignItems: "center", justifyContent: "center", flexShrink: 0,
  },
  habitSummary: {
    backgroundColor: Colors.surface, borderRadius: Radii.card,
    borderWidth: 1, borderColor: Colors.border,
    padding: Spacing.md, gap: 4, marginBottom: Spacing.md,
  },
  habitSummaryHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 2,
  },
  habitSummaryLabel: {
    fontSize: FontSizes.xs, fontFamily: "Inter_500Medium",
    color: Colors.textTertiary, textTransform: "uppercase", letterSpacing: 0.7,
    flexShrink: 1,
  },
  inlineEditTap: {
    flexShrink: 0,
    paddingVertical: 2,
    paddingHorizontal: Spacing.sm,
    borderRadius: Radii.sm,
    backgroundColor: Colors.primaryLight,
  },
  inlineEditLabel: {
    fontSize: FontSizes.sm,
    fontFamily: "Inter_500Medium",
    color: Colors.primary,
  },
  habitSummaryValue: {
    fontSize: FontSizes.lg, fontFamily: "Inter_500Medium", color: Colors.textPrimary,
  },
  habitSummaryAnchor: {
    fontSize: FontSizes.sm, fontFamily: "Inter_400Regular", color: Colors.textSecondary,
  },
  habitSummaryStatement: {
    fontSize: FontSizes.sm,
    fontFamily: "Inter_400Regular",
    color: Colors.primaryDark,
    fontStyle: "italic",
    marginTop: 2,
  },
  statsRow: { flexDirection: "row", gap: Spacing.sm, marginBottom: Spacing.md },
  // ── Regression Card ───────────────────────────────────────────────────
  regressionCard: {
    backgroundColor: Colors.primaryLight,
    borderRadius: Radii.card,
    borderWidth: 1,
    borderColor: "rgba(29, 158, 117, 0.2)",
    padding: Spacing.md,
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  regressionHeader: { flexDirection: "row", alignItems: "center", gap: Spacing.sm },
  regressionTitle: {
    fontSize: FontSizes.md, fontFamily: "Inter_500Medium", color: Colors.primary,
  },
  regressionBody: {
    fontSize: FontSizes.sm, fontFamily: "Inter_400Regular",
    color: Colors.textPrimary, lineHeight: 22,
  },
  regressionBold: { fontFamily: "Inter_500Medium", color: Colors.primary },
  regressionNote: {
    fontSize: FontSizes.xs, fontFamily: "Inter_400Regular",
    color: Colors.textTertiary, lineHeight: 16,
  },
  // ── Identity Mirror Card ──────────────────────────────────────────────
  mirrorCard: {
    backgroundColor: Colors.purpleLight,
    borderRadius: Radii.card,
    borderWidth: 1,
    borderColor: "rgba(83, 74, 183, 0.2)",
    padding: Spacing.md,
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  mirrorHeader: { flexDirection: "row", alignItems: "center", gap: Spacing.sm },
  mirrorTitle: {
    fontSize: FontSizes.md, fontFamily: "Inter_500Medium", color: Colors.purple,
  },
  mirrorBody: {
    fontSize: FontSizes.sm, fontFamily: "Inter_400Regular",
    color: Colors.textPrimary, lineHeight: 22, fontStyle: "italic",
  },
  mirrorNote: {
    fontSize: FontSizes.xs, fontFamily: "Inter_400Regular",
    color: Colors.textTertiary,
  },
  // ── Rest ───────────────────────────────────────────────────────────────
  totalDaysBanner: {
    backgroundColor: Colors.primaryLight,
    borderRadius: Radii.card,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    alignItems: "center",
    gap: Spacing.xs,
  },
  totalDaysText: {
    fontSize: FontSizes.sm, fontFamily: "Inter_500Medium", color: Colors.primary,
    textAlign: "center",
  },
  upgradeCard: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    backgroundColor: Colors.goldLight, borderRadius: Radii.card,
    borderWidth: 1, borderColor: "rgba(212,160,23,0.2)",
    padding: Spacing.md, marginBottom: Spacing.lg,
  },
  upgradeLeft: { flexDirection: "row", alignItems: "center", gap: Spacing.md, flex: 1 },
  upgradeTitle: { fontSize: FontSizes.md, fontFamily: "Inter_500Medium", color: Colors.textPrimary },
  upgradeSub: {
    fontSize: FontSizes.sm, fontFamily: "Inter_400Regular",
    color: Colors.textSecondary, marginTop: 2,
  },
  sectionLabel: {
    fontSize: FontSizes.xs, fontFamily: "Inter_500Medium",
    color: Colors.textTertiary, textTransform: "uppercase",
    letterSpacing: 0.8, marginBottom: Spacing.sm,
  },
  settingsCard: {
    backgroundColor: Colors.surface, borderRadius: Radii.card,
    borderWidth: 1, borderColor: Colors.border,
    padding: Spacing.md, marginBottom: Spacing.lg,
  },
  divider: { height: 1, backgroundColor: Colors.border, marginVertical: 2 },
  pillBtn: {
    backgroundColor: Colors.primaryLight, borderRadius: Radii.pill,
    paddingHorizontal: Spacing.md, paddingVertical: 6,
  },
  pillBtnText: { fontSize: FontSizes.sm, fontFamily: "Inter_500Medium", color: Colors.primary },
  deleteLink: { fontSize: FontSizes.sm, fontFamily: "Inter_500Medium", color: Colors.coral },
  tagline: {
    fontSize: FontSizes.sm, fontFamily: "Inter_400Regular",
    color: Colors.textTertiary, fontStyle: "italic",
    textAlign: "center", marginBottom: Spacing.xs,
  },
  version: {
    fontSize: FontSizes.xs, fontFamily: "Inter_400Regular",
    color: Colors.textTertiary, textAlign: "center",
  },
  devPanel: {
    marginTop: Spacing.lg,
    padding: Spacing.md,
    borderRadius: Radii.card,
    borderWidth: 1,
    borderColor: Colors.purple,
    borderStyle: "dashed",
    backgroundColor: Colors.purpleLight,
    gap: Spacing.sm,
  },
  devPanelTitle: {
    fontSize: FontSizes.sm,
    fontFamily: "Inter_500Medium",
    color: Colors.purple,
  },
  devPanelHint: {
    fontSize: FontSizes.xs,
    fontFamily: "Inter_400Regular",
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  devRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: Spacing.xs,
  },
  devLabel: {
    fontSize: FontSizes.md,
    fontFamily: "Inter_400Regular",
    color: Colors.textPrimary,
  },
  trainerRoot: { flex: 1, backgroundColor: "#1a1a2e" },
});
