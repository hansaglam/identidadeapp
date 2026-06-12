import React, { useState, useMemo, useCallback, useRef, useEffect } from "react";
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
  Animated,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Flame, Trophy, Target, TrendingUp } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import { format, parseISO, subDays, isBefore, startOfDay } from "date-fns";
import { useUserStore } from "../store/userStore";
import { useCheckinsStore } from "../store/checkinsStore";
import { useHabitStore } from "../store/habitStore";
import { useTomorrowPlanStore } from "../store/tomorrowPlanStore";
import { useBehaviorStore } from "../store/useBehaviorStore";
import { useMindDumpStore } from "../store/mindDumpStore";
import {
  cancelAllMorningNotifications,
  scheduleMorningNotifications,
  requestNotificationPermissions,
} from "../utils/notifications";
import { flushNotificationSetup } from "../utils/notificationScheduler";
import { getAverageAutomaticity } from "../utils/profileMetrics";
import PremiumGateModal from "../components/PremiumGateModal";
import ConfirmDialog from "../components/ConfirmDialog";
import PrivacyDataModal from "../components/PrivacyDataModal";
import AdvancedPreferencesCard from "../components/AdvancedPreferencesCard";
import GoalProgressCard from "../components/GoalProgressCard";
import WeeklySummaryCard from "../components/WeeklySummaryCard";
import DisciplineMusclesView from "../components/DisciplineMusclesView";
import {
  DisciplineScoreCard,
  ResilienceCard,
  WeeklyGrowthReportCard,
} from "../components/growth";
import { computeDisciplineScore } from "../utils/disciplineScore";
import { computeResilienceStats } from "../utils/resilienceStats";
import {
  DISCIPLINE_DEFAULT_LEVELS,
  DISCIPLINE_DEFAULT_XP,
} from "../utils/disciplineProgress";
import type { UserProfile } from "../types";
import {
  PRIVACY_POLICY_URL,
  TERMS_URL,
  getManageSubscriptionsUrl,
} from "../constants/appLinks";
import { useTranslation } from "react-i18next";
import { useLanguage } from "../contexts/LanguageContext";
import { getLocalizedHabitTitle } from "../i18n/localizeContent";
import type { AppLocale } from "../i18n/config";
import { Colors, Spacing, Radii, FontSizes, Shadows } from "../constants/theme";
import { useTabBarMetrics } from "../utils/tabBarInsets";
import { trackEvent } from "../utils/analytics";

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

const ENTRANCE_COUNT = 6;
const STAGGER_MS = 80;

function useEntranceAnims() {
  const opacity = useRef(
    Array.from({ length: ENTRANCE_COUNT }, () => new Animated.Value(0))
  ).current;
  const translateY = useRef(
    Array.from({ length: ENTRANCE_COUNT }, () => new Animated.Value(14))
  ).current;

  useEffect(() => {
    const anims = opacity.map((o, i) =>
      Animated.parallel([
        Animated.timing(o, { toValue: 1, duration: 280, useNativeDriver: true }),
        Animated.timing(translateY[i]!, { toValue: 0, duration: 280, useNativeDriver: true }),
      ])
    );
    Animated.stagger(STAGGER_MS, anims).start();
  }, [opacity, translateY]);

  return { opacity, translateY };
}

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
  const { t, i18n } = useTranslation();
  const { scrollPadding: tabBarScrollPad } = useTabBarMetrics();
  const { currentLocale, changeAppLanguage, supportedLocales } = useLanguage();
  const [showLangModal, setShowLangModal] = useState(false);
  const profile = useUserStore((s) => s.profile);
  const setName = useUserStore((s) => s.setName);
  const setHapticsEnabled = useUserStore((s) => s.setHapticsEnabled);
  const clearData = useUserStore((s) => s.clearData);
  const updateProfile = useUserStore((s) => s.updateProfile);
  const loadProfileAgain = useUserStore((s) => s.loadProfile);
  const profileLoadFailed = useUserStore((s) => s.profileLoadFailed);
  const dayNumber = useUserStore((s) => s.dayNumber());
  const checkins = useCheckinsStore((s) => s.checkins);
  const habit = useHabitStore((s) => s.habit);
  const getStreakState = useCheckinsStore((s) => s.getStreakState);
  const completionRate = useCheckinsStore((s) => s.completionRate);
  const getTodayCheckin = useCheckinsStore((s) => s.getTodayCheckin);
  const streakState = useMemo(() => getStreakState(), [getStreakState, checkins]);

  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(profile?.name ?? "");
  const [showGate, setShowGate] = useState(false);
  const [profileDialog, setProfileDialog] = useState<ProfileDialog>(null);
  const [showPrivacy, setShowPrivacy] = useState(false);
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

  const currentStreak = streakState.currentStreak;

  const achievements = useMemo(() => {
    if (!profile) return [];
    const list: { emoji: string; title: string; desc: string; unlocked: boolean }[] = [
      { emoji: "🌱", title: t("profile.achievements.sprout.title"), desc: t("profile.achievements.sprout.desc"), unlocked: dayNumber >= 1 },
      { emoji: "🔥", title: t("profile.achievements.streak3.title"), desc: t("profile.achievements.streak3.desc"), unlocked: currentStreak >= 3 },
      { emoji: "💪", title: t("profile.achievements.streak7.title"), desc: t("profile.achievements.streak7.desc"), unlocked: currentStreak >= 7 },
      { emoji: "🎯", title: t("profile.achievements.day21.title"), desc: t("profile.achievements.day21.desc"), unlocked: dayNumber >= 21 },
      { emoji: "⚡", title: t("profile.achievements.day30.title"), desc: t("profile.achievements.day30.desc"), unlocked: dayNumber >= 30 },
      { emoji: "🏁", title: t("profile.achievements.day66.title"), desc: t("profile.achievements.day66.desc"), unlocked: (profile.completedHabits?.length ?? 0) > 0 },
      { emoji: "⭐", title: t("profile.achievements.premiumAch.title"), desc: t("profile.achievements.premiumAch.desc"), unlocked: isPremium },
    ];
    return list;
  }, [profile, dayNumber, currentStreak, isPremium, t]);

  const last14 = useLast14Bars(profile?.startDate ?? "", checkins);

  const disciplineScore = useMemo(() => {
    if (!profile?.startDate) return null;
    return computeDisciplineScore(profile, checkins);
  }, [profile, checkins]);

  const resilienceStats = useMemo(() => {
    if (!profile?.startDate) return null;
    return computeResilienceStats(profile.startDate, checkins);
  }, [profile?.startDate, checkins]);

  const displayHabitName = useMemo(
    () => (profile ? getLocalizedHabitTitle(profile) : ""),
    [profile, i18n.language]
  );

  const applyProfilePatch = useCallback(
    async (patch: Partial<UserProfile>) => {
      await updateProfile(patch);
      const next = useUserStore.getState().profile;
      const todayDone = getTodayCheckin()?.completed ?? false;
      if (next) {
        await flushNotificationSetup({
          profile: next,
          todayDone,
          listsByDate: useTomorrowPlanStore.getState().listsByDate,
          checkins: useCheckinsStore.getState().checkins,
          immediate: true,
        });
      }
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

  const notifTimeLabel = t("profile.settings.notifTimeLabel", { h: String(notifHour).padStart(2, "0"), m: String(notifMin).padStart(2, "0") });
  const checkInGate = profile?.checkInActionGate ?? "soft";

  const { opacity: entO, translateY: entY } = useEntranceAnims();

  if (!profile) {
    if (profileLoadFailed) {
      return (
        <SafeAreaView style={[styles.safe, { backgroundColor: PAGE_BG }]} edges={["top"]}>
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>{t("profile.error.title")}</Text>
            <Text style={styles.retryBody}>
              {t("profile.error.body")}
            </Text>
            <TouchableOpacity style={styles.retryPill} onPress={() => loadProfileAgain()} activeOpacity={0.85}>
              <Text style={styles.retryPillText}>{t("profile.error.retry")}</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      );
    }
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: PAGE_BG }]} edges={["top"]}>
        <View style={styles.empty}>
          <Text style={styles.emptyMuted}>{t("profile.error.loading")}</Text>
        </View>
      </SafeAreaView>
    );
  }

  const journeyPct = Math.min(Math.round((dayNumber / 66) * 100), 100);

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: PAGE_BG }]} edges={["top"]}>
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: tabBarScrollPad }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* ── Header ── */}
        <Animated.View style={[styles.headerRow, { opacity: entO[0], transform: [{ translateY: entY[0]! }] }]}>
          <Text style={styles.headerTitle}>{t("profile.header")}</Text>
          <View style={[styles.statusBadge, restActive ? styles.statusBadgeRest : styles.statusBadgeOk]}>
            <Text style={[styles.statusBadgeText, restActive && styles.statusBadgeTextRest]}>
              {restActive ? t("profile.statusRest") : t("profile.statusActive")}
            </Text>
          </View>
        </Animated.View>

        {/* ── Profil Kartı ── */}
        <Animated.View style={{ opacity: entO[0], transform: [{ translateY: entY[0]! }] }}>
          <View style={styles.profileCard}>
            <View style={styles.avatar}>
              <Text style={styles.avatarLetter}>
                {habit?.identityIcon
                  || (profile.name || profile.habitName || "K").slice(0, 1).toUpperCase()}
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
                <Text style={styles.displayName}>{profile.name || t("profile.defaultName")}</Text>
              )}
              <Text style={styles.habitLabel}>{displayHabitName}</Text>
              <View style={styles.profileMetaRow}>
                {isPremium ? (
                  <View style={styles.premiumBadge}>
                    <Text style={styles.premiumBadgeText}>{t("profile.premiumBadge")}</Text>
                  </View>
                ) : null}
                <Text style={styles.journeyMeta}>{t("profile.dayMeta", { day: dayNumber })}</Text>
              </View>
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
                <Ionicons name="checkmark" size={20} color="#10B981" />
              ) : (
                <Ionicons name="pencil" size={18} color="#94A3B8" />
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.journeyBar}>
            <View style={styles.journeyTrack}>
              <View style={[styles.journeyFillClip, { width: `${journeyPct}%` }]}>
                <LinearGradient
                  colors={["#34D399", "#10B981"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.journeyGradient}
                />
              </View>
            </View>
            <Text style={styles.journeyBarText}>{t("profile.progressPct", { pct: journeyPct })}</Text>
          </View>

          <GoalProgressCard dayNumber={dayNumber} startDate={profile.startDate} />
        </Animated.View>

        {/* ── Gelişim: Disiplin + Dayanıklılık ── */}
        {disciplineScore || resilienceStats ? (
          <Animated.View style={{ opacity: entO[1], transform: [{ translateY: entY[1]! }] }}>
            <Text style={[styles.sectionLabel, styles.statsSectionLabel]}>
              {t("growth.sectionTitle")}
            </Text>
            {disciplineScore ? <DisciplineScoreCard result={disciplineScore} /> : null}
            {resilienceStats ? <ResilienceCard stats={resilienceStats} /> : null}
            <DisciplineMusclesView
              muscles={profile.disciplineMuscles ?? DISCIPLINE_DEFAULT_LEVELS}
              xp={profile.disciplineMuscleXp ?? DISCIPLINE_DEFAULT_XP}
            />
            <WeeklyGrowthReportCard profile={profile} checkins={checkins} />
          </Animated.View>
        ) : null}

        {/* ── Stat Kartları + Haftalık özet ── */}
        <Animated.View style={[styles.statsSection, { opacity: entO[1], transform: [{ translateY: entY[1]! }] }]}>
          <Text style={[styles.sectionLabel, styles.statsSectionLabel]}>{t("profile.stats.title")}</Text>
          <View style={styles.statRow}>
            <View style={[styles.statCard, styles.statCardStreak]}>
              <View style={[styles.statIconWrap, styles.statIconWrapStreak]}>
                <Flame size={14} color="#D97706" strokeWidth={2.5} />
              </View>
              <Text style={styles.statBigStreak} numberOfLines={1} adjustsFontSizeToFit>
                {currentStreak}
              </Text>
              <Text style={styles.statLabel} numberOfLines={2}>
                {t("profile.stats.streak")}
              </Text>
            </View>
            <View style={styles.statCard}>
              <View style={styles.statIconWrap}>
                <Target size={13} color={Colors.primary} strokeWidth={2} />
              </View>
              <Text style={styles.statBig} numberOfLines={1} adjustsFontSizeToFit>
                {dayNumber}
              </Text>
              <Text style={styles.statLabel} numberOfLines={2}>
                {t("profile.stats.daysUnit", { count: dayNumber })}
              </Text>
            </View>
            <View style={styles.statCard}>
              <View style={styles.statIconWrap}>
                <TrendingUp size={13} color={Colors.primary} strokeWidth={2} />
              </View>
              <Text style={styles.statBig} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.85}>
                {t("profile.stats.pctValue", { pct: autoPct })}
              </Text>
              <Text style={styles.statLabel} numberOfLines={2}>
                {t("profile.stats.automaticity")}
              </Text>
            </View>
            <View style={styles.statCard}>
              <View style={styles.statIconWrap}>
                <Trophy size={13} color={Colors.primary} strokeWidth={2} />
              </View>
              <Text style={styles.statBig} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.85}>
                {t("profile.stats.pctValue", { pct: Math.round(rate * 100) })}
              </Text>
              <Text style={styles.statLabel} numberOfLines={2}>
                {t("profile.stats.completion")}
              </Text>
            </View>
          </View>

          <WeeklySummaryCard startDate={profile.startDate} checkins={checkins} habitName={displayHabitName} />
        </Animated.View>

        {(profile.completedHabits?.length ?? 0) > 0 ? (
          <View style={styles.completedHabitsWrap}>
            <Text style={styles.sectionLabel}>{t("profile.completedRounds.title")}</Text>
            <View style={styles.settingsList}>
              {(profile.completedHabits ?? []).map((h, i) => (
                <View key={`${h.completedAt}-${i}`} style={styles.completedHabitRow}>
                  <Text style={styles.completedHabitName}>{h.habitName}</Text>
                  <Text style={styles.completedHabitMeta}>
                    {t("profile.completedRounds.days", { count: h.completedDaysCount })}
                    {h.avgAutomaticity != null
                      ? t("profile.completedRounds.avgAuto", { value: h.avgAutomaticity.toFixed(1) })
                      : ""}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        ) : null}

        {/* ── 14 Günlük Grafik ── */}
        <Animated.View style={{ opacity: entO[2], transform: [{ translateY: entY[2]! }] }}>
          <Text style={styles.sectionLabel}>{t("profile.chart.title")}</Text>
          <View style={styles.chartCard}>
            <View style={styles.barsRow}>
              {last14.bars.map((b, i) => {
                const h = b.beforeStart ? 14 : b.completed ? 36 : 14;
                const bg = b.beforeStart
                  ? "#E2E8F0"
                  : b.completed
                  ? "#10B981"
                  : "#F1F5F9";
                return (
                  <View key={i} style={styles.barCol}>
                    <View style={[styles.bar, { height: h, backgroundColor: bg }]} />
                  </View>
                );
              })}
            </View>
            <View style={styles.chartFooter}>
              <Text style={styles.chartCaption}>
                {t("profile.chart.caption", { count: last14.completedInWindow })}
              </Text>
              <Text style={styles.chartPct}>%{last14.pct}</Text>
            </View>
          </View>
        </Animated.View>

        {/* ── Başarımlar ── */}
        <Animated.View style={{ opacity: entO[3], transform: [{ translateY: entY[3]! }] }}>
          <View style={styles.achHeadRow}>
            <Text style={[styles.sectionLabel, styles.compactSectionLabel, styles.achSectionPad]}>
              {t("profile.achievements.title")}
            </Text>
            <TouchableOpacity activeOpacity={0.7} onPress={() => setAchievementsModalOpen(true)}>
              <Text style={styles.tumu}>{t("profile.achievements.all")}</Text>
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
        </Animated.View>

        {/* ── Koçluk akışı ── */}
        <Animated.View style={{ opacity: entO[4], transform: [{ translateY: entY[4]! }] }}>
          <Text style={[styles.sectionLabel, styles.compactSectionLabel]}>
            {t("profile.coaching.title")}
          </Text>
          <View style={styles.coachCard}>
            <Text style={styles.coachCardTitle}>{t("profile.coaching.checkInStep")}</Text>
            <View style={styles.gateChipRow}>
              {(
                [
                  { id: "soft" as const, label: t("profile.coaching.gateChips.soft") },
                  { id: "strict" as const, label: t("profile.coaching.gateChips.strict") },
                  { id: "off" as const, label: t("profile.coaching.gateChips.off") },
                ] as const
              ).map((opt) => (
                <TouchableOpacity
                  key={opt.id}
                  style={[
                    styles.gateChip,
                    checkInGate === opt.id && styles.gateChipOn,
                  ]}
                  onPress={() => void applyProfilePatch({ checkInActionGate: opt.id })}
                  activeOpacity={0.85}
                >
                  <Text
                    style={[
                      styles.gateChipText,
                      checkInGate === opt.id && styles.gateChipTextOn,
                    ]}
                  >
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </Animated.View>

        {/* ── Ayarlar ── */}
        <Animated.View style={{ opacity: entO[4], transform: [{ translateY: entY[4]! }] }}>
          <Text style={[styles.sectionLabel, styles.compactSectionLabel, styles.settingsSectionLabel]}>
            {t("profile.settings.title")}
          </Text>
          <View style={styles.settingsList}>
            <SettingsRow
              emoji="🌐"
              title={t("profile.language")}
              subtitle={t(`profile.languages.${currentLocale}`)}
              onPress={() => setShowLangModal(true)}
            />
            <SettingsRow
              emoji="🔔"
              title={t("profile.settings.notifications")}
              subtitle={notifTimeLabel}
              onPress={() => setNotifSheetOpen(true)}
            />
            <View style={styles.setRow}>
              <Text style={styles.setEmoji}>📳</Text>
              <View style={styles.setTextCol}>
                <Text style={styles.setTitle}>{t("profile.settings.haptics")}</Text>
                <Text style={styles.setSub}>{t("profile.settings.hapticsSub")}</Text>
              </View>
              <Switch
                value={hapticsEnabled}
                onValueChange={setHapticsEnabled}
                trackColor={{ true: "#10B981", false: "#E2E8F0" }}
                thumbColor="#FFFFFF"
              />
            </View>
            {!isPremium ? (
              <SettingsRow
                emoji="✨"
                title={t("profile.settings.premiumRow")}
                subtitle={t("profile.settings.premiumRowSub")}
                onPress={() => setShowGate(true)}
              />
            ) : (
              <SettingsRow
                emoji="💳"
                title={t("profile.settings.subscription")}
                subtitle={t("profile.settings.subscriptionSub")}
                onPress={() => void Linking.openURL(getManageSubscriptionsUrl())}
              />
            )}
            <SettingsRow
              emoji="📄"
              title={t("profile.settings.privacyPolicy")}
              subtitle={t("profile.settings.privacyPolicySub")}
              onPress={() => void Linking.openURL(PRIVACY_POLICY_URL)}
            />
            <SettingsRow
              emoji="📋"
              title={t("profile.settings.terms")}
              subtitle={t("profile.settings.termsSub")}
              onPress={() => void Linking.openURL(TERMS_URL)}
            />
          </View>

          <Text style={[styles.sectionLabel, { marginTop: 20 }]}>{t("profile.data.title")}</Text>
          <View style={styles.settingsList}>
            <SettingsRow
              emoji="🛡️"
              title={t("profile.data.privacy")}
              subtitle={t("profile.data.privacySub")}
              onPress={() => setShowPrivacy(true)}
            />
            <SettingsRow
              emoji="💾"
              title={t("profile.data.backup")}
              subtitle={t("profile.data.backupSub")}
              onPress={() => setBackupSheetOpen(true)}
            />
            <SettingsRow
              emoji="🗑️"
              title={t("profile.data.delete")}
              subtitle={t("profile.data.deleteSub")}
              danger
              onPress={() => setProfileDialog("delete_all")}
            />
          </View>
        </Animated.View>

        {/* ── Footer ── */}
        <Animated.View style={{ opacity: entO[5], transform: [{ translateY: entY[5]! }] }}>
          <TouchableOpacity style={styles.notifPermRow} onPress={() => void handleNotifSetup()} activeOpacity={0.85}>
            <Text style={styles.notifPermText}>{t("profile.footer.notifCheck")}</Text>
            <Ionicons name="open-outline" size={16} color="#10B981" />
          </TouchableOpacity>

          <View style={styles.footerQuote}>
            <Text style={styles.quoteMain}>{t("profile.footer.quote")}</Text>
            <Text style={styles.quoteSub}>
              {t("profile.footer.versionDay", {
                appName: t("brand.storeName"),
                version: APP_VERSION,
                day: dayNumber,
              })}
            </Text>
          </View>

          <TouchableOpacity
            style={styles.aboutRow}
            onPress={() =>
              Alert.alert(t("brand.storeName"), `${APP_VERSION}\n\n${t("profile.footer.aboutAlertMsg")}`)
            }
            activeOpacity={0.7}
          >
            <Ionicons name="information-circle-outline" size={16} color="#94A3B8" />
            <Text style={styles.aboutText}>
              {t("profile.footer.about", { appName: t("brand.storeName"), version: APP_VERSION })}
            </Text>
          </TouchableOpacity>
        </Animated.View>

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
            <Text style={styles.sheetTitle}>{t("profile.modal.notifTitle")}</Text>
            <TouchableOpacity onPress={() => setNotifSheetOpen(false)} hitSlop={12}>
              <Text style={styles.sheetClose}>{t("common.close")}</Text>
            </TouchableOpacity>
          </View>
          <ScrollView contentContainerStyle={styles.sheetScroll} keyboardShouldPersistTaps="handled">
            <AdvancedPreferencesCard
              profile={profile}
              onPatch={applyProfilePatch}
              visibleSections={["notifications"]}
            />
            <Text style={styles.sheetHint}>
              {t("profile.modal.notifHint", { time: notifTimeLabel })}
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
            <Text style={styles.sheetTitle}>{t("profile.modal.backupTitle")}</Text>
            <TouchableOpacity onPress={() => setBackupSheetOpen(false)} hitSlop={12}>
              <Text style={styles.sheetClose}>{t("common.close")}</Text>
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
            <Text style={styles.sheetTitle}>{t("profile.modal.achievementsTitle")}</Text>
            <TouchableOpacity onPress={() => setAchievementsModalOpen(false)} hitSlop={12}>
              <Text style={styles.sheetClose}>{t("common.close")}</Text>
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
                    {a.unlocked ? t("profile.achievements.unlocked") : t("profile.achievements.locked")}
                  </Text>
                </View>
              </View>
            ))}
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* ── Dil Seçici Modal ── */}
      <Modal
        visible={showLangModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowLangModal(false)}
      >
        <View style={styles.langOverlay}>
          <View style={styles.langSheet}>
            <View style={styles.langSheetHandle} />
            <Text style={styles.langSheetTitle}>{t("profile.languageTitle")}</Text>
            <Text style={styles.langSheetSub}>{t("profile.languageSubtitle")}</Text>
            <View style={styles.langList}>
              {(supportedLocales as AppLocale[]).map((locale) => {
                const active = locale === currentLocale;
                return (
                  <TouchableOpacity
                    key={locale}
                    style={[styles.langRow, active && styles.langRowActive]}
                    onPress={async () => {
                      await changeAppLanguage(locale);
                      setShowLangModal(false);
                      void trackEvent("language_changed", { locale });
                    }}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.langRowText, active && styles.langRowTextActive]}>
                      {t(`profile.languages.${locale}`)}
                    </Text>
                    {active && (
                      <Ionicons name="checkmark-circle" size={20} color={Colors.primary} />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
            <TouchableOpacity
              style={styles.langCloseBtn}
              onPress={() => setShowLangModal(false)}
              activeOpacity={0.85}
            >
              <Text style={styles.langCloseBtnText}>{t("common.close")}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <PremiumGateModal visible={showGate} onClose={() => setShowGate(false)} trigger="profile" />
      <PrivacyDataModal visible={showPrivacy} onClose={() => setShowPrivacy(false)} />

      <ConfirmDialog
        visible={profileDialog === "notif_success"}
        title={t("profile.dialog.notifSuccess.title")}
        message={t("profile.dialog.notifSuccess.msg")}
        tone="success"
        closeOnBackdropPress={false}
        onRequestClose={() => setProfileDialog(null)}
        actions={[
          {
            label: t("profile.dialog.notifSuccess.ok"),
            variant: "primary",
            onPress: async () => {
              setProfileDialog(null);
              if (profile) {
                await cancelAllMorningNotifications();
                await scheduleMorningNotifications(
                  profile,
                  30,
                  useTomorrowPlanStore.getState().listsByDate
                );
              }
            },
          },
        ]}
      />

      <ConfirmDialog
        visible={profileDialog === "notif_settings"}
        title={t("profile.dialog.notifSettings.title")}
        message={t("profile.dialog.notifSettings.msg")}
        tone="default"
        onRequestClose={() => setProfileDialog(null)}
        actions={[
          {
            label: t("profile.dialog.notifSettings.dismiss"),
            variant: "secondary",
            onPress: () => setProfileDialog(null),
          },
          {
            label: t("profile.dialog.notifSettings.goSettings"),
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
        title={t("profile.dialog.deleteAll.title")}
        message={t("profile.dialog.deleteAll.msg")}
        tone="danger"
        onRequestClose={() => setProfileDialog(null)}
        actions={[
          {
            label: t("profile.dialog.deleteAll.cancel"),
            variant: "secondary",
            onPress: () => setProfileDialog(null),
          },
          {
            label: t("profile.dialog.deleteAll.confirm"),
            variant: "destructive",
            onPress: async () => {
              setProfileDialog(null);
              await cancelAllMorningNotifications();
              await clearData();
              // Disk temizlendi; Zustand store'ları da in-memory sıfırla
              await useCheckinsStore.getState().clearAllCheckins();
              useMindDumpStore.getState().clearAll();
              await useBehaviorStore.getState().reset();
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
    flexDirection: "row",
    alignItems: "center",
    borderRadius: Radii.pill,
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
    borderRadius: Radii.card,
    padding: 16,
    ...cardShadow,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: Colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarLetter: {
    fontSize: 22,
    fontWeight: "700",
    color: Colors.primary,
  },
  profileMain: { flex: 1, marginLeft: 14, justifyContent: "center" },
  displayName: {
    fontSize: 18,
    fontFamily: "Inter_600SemiBold",
    fontWeight: "700",
    color: "#0F172A",
  },
  habitLabel: {
    fontSize: FontSizes.sm,
    fontFamily: "Inter_400Regular",
    color: Colors.textSecondary,
    marginTop: 2,
  },
  profileMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 6,
  },
  nameInput: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0F172A",
    borderBottomWidth: 1.5,
    borderBottomColor: "#10B981",
    paddingVertical: 2,
  },
  premiumBadge: {
    backgroundColor: "#FEF3C7",
    borderRadius: Radii.pill,
    paddingVertical: 2,
    paddingHorizontal: 8,
  },
  premiumBadgeText: {
    fontSize: 10,
    color: "#D97706",
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  journeyMeta: {
    fontSize: FontSizes.xs,
    fontFamily: "Inter_500Medium",
    color: Colors.textTertiary,
  },
  editIconBtn: {
    padding: 6,
  },

  journeyBar: {
    marginHorizontal: Spacing.md,
    marginTop: 6,
    marginBottom: 4,
    gap: 4,
  },
  journeyTrack: {
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.border,
    overflow: "hidden",
  },
  journeyFillClip: {
    height: "100%",
    borderRadius: 2,
    overflow: "hidden",
  },
  journeyGradient: {
    flex: 1,
    height: "100%",
  },
  journeyBarText: {
    fontSize: 10,
    fontFamily: "Inter_500Medium",
    color: Colors.textTertiary,
  },

  statsSection: {
    marginHorizontal: Spacing.md,
    marginTop: Spacing.xs,
  },
  statsSectionLabel: {
    marginTop: Spacing.sm,
    marginBottom: 6,
    fontSize: 10,
    letterSpacing: 0.8,
  },
  sectionLabel: {
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
    fontSize: FontSizes.xs,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 1,
    color: Colors.textTertiary,
    textTransform: "uppercase",
  },

  statRow: {
    flexDirection: "row",
    gap: 5,
    marginBottom: Spacing.sm,
  },
  statCard: {
    flex: 1,
    minWidth: 0,
    backgroundColor: Colors.surface,
    borderRadius: Radii.button,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingVertical: 8,
    paddingHorizontal: 4,
    alignItems: "center",
    gap: 3,
    ...Shadows.soft,
  },
  statCardStreak: {
    backgroundColor: "#FFFBEB",
    borderColor: "rgba(245, 158, 11, 0.2)",
  },
  statIconWrap: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: Colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },
  statIconWrapStreak: {
    backgroundColor: "rgba(245, 158, 11, 0.12)",
  },
  statBig: {
    fontSize: 15,
    fontFamily: "Inter_700Bold",
    color: Colors.textPrimary,
    textAlign: "center",
    width: "100%",
  },
  statBigStreak: {
    fontSize: 16,
    fontFamily: "Inter_700Bold",
    color: "#D97706",
    textAlign: "center",
    width: "100%",
  },
  statLabel: {
    fontSize: 8,
    fontFamily: "Inter_500Medium",
    color: Colors.textTertiary,
    textAlign: "center",
    lineHeight: 10,
    width: "100%",
    paddingHorizontal: 1,
  },

  chartCard: {
    marginHorizontal: 16,
    marginTop: 8,
    backgroundColor: "#FFFFFF",
    borderRadius: Radii.card,
    padding: 16,
    ...cardShadow,
  },
  barsRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
  },
  barCol: {
    flex: 1,
    alignItems: "center",
  },
  bar: {
    width: 10,
    borderRadius: 5,
  },
  chartFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 12,
  },
  chartCaption: {
    fontSize: FontSizes.sm,
    fontFamily: "Inter_500Medium",
    color: Colors.textSecondary,
  },
  chartPct: {
    fontSize: FontSizes.sm,
    fontFamily: "Inter_600SemiBold",
    color: Colors.primary,
  },

  compactSectionLabel: {
    marginHorizontal: Spacing.md,
    marginTop: Spacing.sm,
    marginBottom: 6,
    fontSize: 10,
    letterSpacing: 0.8,
  },
  settingsSectionLabel: {
    marginTop: Spacing.md,
  },
  achHeadRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.md,
  },
  achSectionPad: {
    marginHorizontal: 0,
    marginTop: 0,
    marginBottom: 0,
  },
  tumu: {
    color: Colors.primary,
    fontFamily: "Inter_600SemiBold",
    fontSize: 11,
  },
  achScroll: {
    paddingHorizontal: Spacing.md,
    paddingTop: 4,
    paddingBottom: 2,
    gap: 8,
  },
  achCard: {
    width: 88,
    backgroundColor: Colors.surface,
    borderRadius: Radii.sm,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingVertical: 8,
    paddingHorizontal: 8,
    marginRight: 8,
    ...Shadows.soft,
  },
  achCardLocked: { opacity: 0.45 },
  achEmoji: { fontSize: 18, marginBottom: 4 },
  achTitle: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
    color: Colors.textPrimary,
    lineHeight: 14,
  },
  achDesc: {
    fontSize: 9,
    fontFamily: "Inter_400Regular",
    color: Colors.textTertiary,
    marginTop: 2,
    lineHeight: 12,
  },
  achModalScroll: {
    padding: 16,
    paddingBottom: 32,
  },
  achModalCard: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: Radii.button,
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
    backgroundColor: "#FFFFFF",
    borderRadius: Radii.card,
    overflow: "hidden",
    ...cardShadow,
  },
  completedHabitsWrap: {
    marginTop: 8,
    marginBottom: 4,
  },
  completedHabitRow: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#F1F5F9",
  },
  completedHabitName: {
    fontSize: FontSizes.sm,
    fontFamily: "Inter_600SemiBold",
    fontWeight: "600",
    color: Colors.textPrimary,
  },
  completedHabitMeta: {
    marginTop: 4,
    fontSize: FontSizes.xs,
    fontFamily: "Inter_400Regular",
    color: Colors.textTertiary,
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
  setTitle: {
    fontSize: 15,
    fontFamily: "Inter_500Medium",
    fontWeight: "600",
    color: "#0F172A",
  },
  setSub: {
    fontSize: FontSizes.xs,
    fontFamily: "Inter_400Regular",
    color: "#64748B",
    marginTop: 2,
  },
  setSubDanger: { color: "#EF4444" },

  notifPermRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    marginHorizontal: 16,
    marginTop: 16,
  },
  notifPermText: {
    fontSize: FontSizes.sm,
    fontFamily: "Inter_500Medium",
    color: Colors.primary,
  },
  footerQuote: {
    marginTop: 20,
    alignItems: "center",
    paddingHorizontal: 24,
  },
  quoteMain: {
    fontSize: FontSizes.sm,
    fontFamily: "Inter_400Regular",
    color: "#94A3B8",
    fontStyle: "italic",
    textAlign: "center",
    lineHeight: 20,
  },
  quoteSub: {
    fontSize: FontSizes.xs,
    fontFamily: "Inter_400Regular",
    color: "#CBD5E1",
    marginTop: 4,
  },
  aboutRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    marginTop: 12,
    paddingVertical: 6,
  },
  aboutText: {
    fontSize: FontSizes.xs,
    fontFamily: "Inter_400Regular",
    color: "#94A3B8",
  },
  coachCard: {
    marginHorizontal: Spacing.md,
    marginTop: 0,
    marginBottom: Spacing.sm,
    backgroundColor: Colors.surface,
    borderRadius: Radii.button,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 8,
    ...Shadows.soft,
  },
  coachCardTitle: {
    fontSize: FontSizes.sm,
    fontFamily: "Inter_600SemiBold",
    color: Colors.textPrimary,
  },
  gateChipRow: {
    flexDirection: "row",
    gap: 5,
  },
  gateChip: {
    flex: 1,
    paddingVertical: 6,
    paddingHorizontal: 4,
    borderRadius: Radii.sm,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surfaceMuted,
    alignItems: "center",
  },
  gateChipOn: {
    backgroundColor: Colors.primaryLight,
    borderColor: "rgba(47, 156, 134, 0.35)",
  },
  gateChipText: {
    fontSize: 10,
    fontFamily: "Inter_500Medium",
    color: Colors.textSecondary,
  },
  gateChipTextOn: {
    color: Colors.primaryDark,
    fontFamily: "Inter_600SemiBold",
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
  sheetClose: { fontSize: 16, color: Colors.primary, fontWeight: "600" },
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
    backgroundColor: Colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: Radii.button,
  },
  retryPillText: { color: "#FFFFFF", fontWeight: "600" },
  emptyMuted: { color: "#64748B" },

  /* Language picker modal */
  langOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "flex-end",
  },
  langSheet: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.sm,
    paddingBottom: 40,
  },
  langSheetHandle: {
    alignSelf: "center",
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.border,
    marginBottom: Spacing.md,
  },
  langSheetTitle: {
    fontSize: FontSizes.lg,
    fontFamily: "Inter_500Medium",
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  langSheetSub: {
    fontSize: FontSizes.sm,
    fontFamily: "Inter_400Regular",
    color: Colors.textSecondary,
    lineHeight: 19,
    marginBottom: Spacing.lg,
  },
  langList: { gap: Spacing.xs },
  langRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.md,
    paddingVertical: 14,
    borderRadius: Radii.button,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.bg,
  },
  langRowActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryLight,
  },
  langRowText: {
    fontSize: FontSizes.md,
    fontFamily: "Inter_400Regular",
    color: Colors.textPrimary,
  },
  langRowTextActive: {
    fontFamily: "Inter_500Medium",
    color: Colors.primaryDark,
  },
  langCloseBtn: {
    marginTop: Spacing.lg,
    backgroundColor: Colors.primary,
    borderRadius: Radii.button,
    paddingVertical: 14,
    alignItems: "center",
  },
  langCloseBtnText: {
    fontSize: FontSizes.md,
    fontFamily: "Inter_500Medium",
    color: "#fff",
  },
});
