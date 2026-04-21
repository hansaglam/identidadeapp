import React, { useState, useMemo } from "react";
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, Alert, Switch, Linking, Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Pencil, Check, Bell, Vibrate, Trash2, Crown, ChevronRight, Zap,
  TrendingUp, Eye,
} from "lucide-react-native";
import { useUserStore } from "../store/userStore";
import { useCheckinsStore } from "../store/checkinsStore";
import { useMindDumpStore } from "../store/mindDumpStore";
import {
  cancelAllMorningNotifications,
  scheduleMorningNotifications,
  requestNotificationPermissions,
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
import ProfileStats from "../components/ProfileStats";
import DisciplineMusclesView from "../components/DisciplineMusclesView";
import FiveSecondTrainer, { FiveSecondScenario } from "../components/FiveSecondTrainer";
import { Colors, Spacing, Radii, FontSizes } from "../constants/theme";
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

export default function ProfileScreen() {
  const {
    profile, setName, setPremium, setHapticsEnabled, setNotificationTime, clearData,
  } = useUserStore();
  const dayNumber = useUserStore((s) => s.dayNumber());
  const checkins = useCheckinsStore((s) => s.checkins);
  const { getStreakState, completionRate } = useCheckinsStore();
  const streakState = getStreakState();
  const mindDumpEntries = useMindDumpStore((s) => s.entries);

  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(profile?.name ?? "");
  const [showGate, setShowGate] = useState(false);
  const [showTrain, setShowTrain] = useState(false);

  const isPremium = profile?.isPremium ?? false;
  const hapticsEnabled = profile?.hapticsEnabled ?? true;
  const notifHour = profile?.notificationHour ?? 9;
  const notifMin = profile?.notificationMinute ?? 0;

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

  const handleSaveName = async () => {
    if (!nameInput.trim()) return;
    await setName(nameInput.trim());
    setEditingName(false);
  };

  const handleNotifSetup = async () => {
    const granted = await requestNotificationPermissions();
    if (granted) {
      Alert.alert("Bildirimler Aktif", "Sabah bildirimleri planlanıyor...", [
        {
          text: "Tamam",
          onPress: async () => {
            if (profile) {
              await cancelAllMorningNotifications();
              await scheduleMorningNotifications(profile);
            }
          },
        },
      ]);
    } else {
      Alert.alert(
        "İzin Gerekli",
        "Ayarlar'dan bildirim iznini etkinleştir.",
        [
          { text: "Tamam" },
          { text: "Ayarlara Git", onPress: () => Linking.openSettings() },
        ]
      );
    }
  };

  const handleDeleteData = () => {
    Alert.alert(
      "Tüm Verileri Sil",
      "Tüm alışkanlık geçmişin ve notların silinecek. Bu geri alınamaz.",
      [
        { text: "Vazgeç", style: "cancel" },
        {
          text: "Sil",
          style: "destructive",
          onPress: async () => {
            await cancelAllMorningNotifications();
            await clearData();
          },
        },
      ]
    );
  };

  const notifLabel = `${String(notifHour).padStart(2, "0")}:${String(notifMin).padStart(2, "0")}`;
  const rate = profile ? completionRate(profile.startDate) : 0;

  if (!profile) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <View style={styles.empty}>
          <Text style={styles.emptyText}>Yükleniyor...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
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
          <Text style={styles.habitSummaryLabel}>Kimlik Hedefin</Text>
          <Text style={styles.habitSummaryValue}>{profile.habitName}</Text>
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

        <Text style={styles.sectionLabel}>AYARLAR</Text>
        <View style={styles.settingsCard}>
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
          "Motivasyon bir duygu. Disiplin bir beceri."
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
            onComplete={() => {}}
            onSkip={() => setShowTrain(false)}
          />
        </SafeAreaView>
      </Modal>

      <PremiumGateModal
        visible={showGate}
        onClose={() => setShowGate(false)}
        trigger="journey"
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
  empty: { flex: 1, alignItems: "center", justifyContent: "center" },
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
  habitSummaryLabel: {
    fontSize: FontSizes.xs, fontFamily: "Inter_500Medium",
    color: Colors.textTertiary, textTransform: "uppercase", letterSpacing: 0.7,
  },
  habitSummaryValue: {
    fontSize: FontSizes.lg, fontFamily: "Inter_500Medium", color: Colors.textPrimary,
  },
  habitSummaryAnchor: {
    fontSize: FontSizes.sm, fontFamily: "Inter_400Regular", color: Colors.textSecondary,
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
