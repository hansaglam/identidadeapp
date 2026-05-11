import React, {
  useEffect,
  useRef,
  useState,
  useCallback,
  useMemo,
} from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Animated,
  Modal,
  Platform,
  KeyboardAvoidingView,
  Pressable,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { Trash2, Lock, Sparkles, Footprints } from "lucide-react-native";
import { format, parseISO, startOfWeek, addDays } from "date-fns";
import { tr } from "date-fns/locale";
import { useMindDumpStore } from "../store/mindDumpStore";
import { useUserStore } from "../store/userStore";
import { useCheckinsStore } from "../store/checkinsStore";
import { useBehaviorStore } from "../store/useBehaviorStore";
import { getActionById } from "../engine/actions";
import { useHabitStore, type JourneyReflection } from "../store/habitStore";
import {
  Colors,
  Spacing,
  Radii,
  FontSizes,
  Shadows,
} from "../constants/theme";
import {
  MIND_DUMP_FREE_LIMIT_EXPLAIN,
  MIND_DUMP_APPROACHING_LIMIT,
} from "../constants/purposeCopy";
import { MainTabParamList, MindDumpEntry } from "../types";
import PremiumGateModal from "../components/PremiumGateModal";
import ConfirmDialog from "../components/ConfirmDialog";
import { isJourneyMindContent, stripJourneyMindPrefix } from "../constants/mindDumpJourney";
import { buildMindDumpReflection, type MindDumpReflectionState } from "../utils/mindDumpReflection";
import FiveSecondTrainer, { type FiveSecondScenario } from "../components/FiveSecondTrainer";

const FIVE_FROM_MIND: FiveSecondScenario = {
  id: "mind-dump-nudge",
  type: "micro",
  trigger: "Şimdi tek bir net hareket seç — beş saniye içinde başlat.",
  countdownDuration: 5,
  difficulty: 2,
  disciplineMuscle: "direnc",
};

type Props = BottomTabScreenProps<MainTabParamList, "MindDump">;

const MODAL_MAX_CHARS = 500;
const MODAL_START_PHRASES = [
  "Bugün kafamı en çok meşgul eden şey...",
  "Şu an içimden geçen ama sesli söylemediğim...",
  "Minnettar olduğum küçük bir detay...",
  "Yarın için tek bir net niyet...",
] as const;

const PAGE_BG = "#F8FAFC";

const STAGGER_MS = 100;
const ENTRANCE_SECTIONS = 5;

const cardShadow = {
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.04,
  shadowRadius: 12,
  elevation: 3,
} as const;

const weekDayLabels = ["pzt", "sal", "çar", "per", "cum", "cmt", "paz"] as const;

function useEntranceAnims() {
  const opacity = useRef(
    Array.from({ length: ENTRANCE_SECTIONS }, () => new Animated.Value(0))
  ).current;
  const translateY = useRef(
    Array.from({ length: ENTRANCE_SECTIONS }, () => new Animated.Value(16))
  ).current;

  useEffect(() => {
    const perSection = opacity.map((o, i) =>
      Animated.parallel([
        Animated.timing(o, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(translateY[i]!, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ])
    );
    Animated.stagger(STAGGER_MS, perSection).start();
  }, [opacity, translateY]);

  return { opacity, translateY };
}

function useWeekProgress(checkins: Record<string, { completed?: boolean }>) {
  return useMemo(() => {
    const now = new Date();
    const monday = startOfWeek(now, { weekStartsOn: 1 });
    const weekDates = Array.from({ length: 7 }, (_, i) =>
      format(addDays(monday, i), "yyyy-MM-dd")
    );
    const doneFlags = weekDates.map((d) => checkins[d]?.completed === true);
    const completedCount = doneFlags.filter(Boolean).length;
    const pct = Math.round((completedCount / 7) * 100);
    return { weekDates, doneFlags, completedCount, pct };
  }, [checkins]);
}

function ReflectionHistoryRow({
  item,
  identityIcon,
  highlightDate,
  onAnimatedEnd,
}: {
  item: JourneyReflection;
  identityIcon: string | null;
  highlightDate: string | null;
  onAnimatedEnd: () => void;
}) {
  const slide = useRef(new Animated.Value(0)).current;
  const fade = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (highlightDate !== null && item.date === highlightDate) {
      slide.setValue(-28);
      fade.setValue(0);
      Animated.parallel([
        Animated.spring(slide, {
          toValue: 0,
          tension: 80,
          friction: 12,
          useNativeDriver: true,
        }),
        Animated.timing(fade, {
          toValue: 1,
          duration: 280,
          useNativeDriver: true,
        }),
      ]).start(() => onAnimatedEnd());
    }
  }, [highlightDate, item.date, slide, fade, onAnimatedEnd]);

  let dateLabel = item.date;
  try {
    dateLabel = format(parseISO(item.date), "d MMM yyyy", { locale: tr });
  } catch {
    /* keep raw */
  }

  return (
    <Animated.View
      style={[
        styles.reflectionCard,
        { transform: [{ translateY: slide }], opacity: fade },
      ]}
    >
      <Text style={styles.reflectionDayLabel}>Gün {item.day}</Text>
      <Text style={styles.reflectionBody}>{item.comment}</Text>
      <View style={styles.reflectionMeta}>
        <Text style={styles.reflectionDate}>{dateLabel}</Text>
        {identityIcon ? <Text style={styles.reflectionIcon}>{identityIcon}</Text> : null}
      </View>
    </Animated.View>
  );
}

export default function MindDumpScreen(_: Props) {
  const currentDay = useUserStore((s) => s.dayNumber());

  const journalScrollRef = useRef<ScrollView>(null);
  const historySectionY = useRef(0);

  const checkins = useCheckinsStore((s) => s.checkins);
  const habit = useHabitStore((s) => s.habit);
  const reflections = useHabitStore((s) => s.reflections);
  const addJourneyReflection = useHabitStore((s) => s.addJourneyReflection);

  const { weekDates, doneFlags, completedCount: weekDone, pct: weekPct } =
    useWeekProgress(checkins);

  const sortedReflections = useMemo(
    () =>
      [...reflections].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      ),
    [reflections]
  );

  const [todayReflectionDraft, setTodayReflectionDraft] = useState("");
  const [savingReflection, setSavingReflection] = useState(false);
  const [highlightDate, setHighlightDate] = useState<string | null>(null);

  const [mindModalOpen, setMindModalOpen] = useState(false);

  const { opacity: entO, translateY: entY } = useEntranceAnims();

  const canSaveToday =
    todayReflectionDraft.trim().length > 0 && !savingReflection;

  const saveTodayReflection = async () => {
    const text = todayReflectionDraft.trim();
    if (!text) return;
    setSavingReflection(true);
    try {
      const iso = new Date().toISOString();
      await addJourneyReflection({
        day: currentDay,
        comment: text,
        date: iso,
      });
      setHighlightDate(iso);
      setTodayReflectionDraft("");
    } finally {
      setSavingReflection(false);
    }
  };

  const clearHighlight = useCallback(() => setHighlightDate(null), []);

  const openMindDump = () => setMindModalOpen(true);

  return (
    <SafeAreaView style={styles.journalRoot} edges={["top"]}>
      <ScrollView
        ref={journalScrollRef}
        style={styles.journalScroll}
        contentContainerStyle={styles.journalScrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Animated.View
          style={[
            styles.journalHeaderBlock,
            {
              opacity: entO[0],
              transform: [{ translateY: entY[0]! }],
            },
          ]}
        >
          <View style={styles.journalHeaderRow}>
            <View style={styles.journalTitleCol}>
              <Text style={styles.journalTitle}>Zihin</Text>
              <Text style={styles.journalSubtitle}>Yolculuk günlüğün</Text>
              <Text style={styles.journalDayLine}>Şu an · Gün {currentDay}/66</Text>
            </View>
            <TouchableOpacity
              style={[styles.yeniBtn, mindModalOpen && styles.yeniBtnDisabled]}
              onPress={openMindDump}
              activeOpacity={0.85}
              disabled={mindModalOpen}
            >
              <Text style={[styles.yeniBtnText, mindModalOpen && styles.yeniBtnTextDisabled]}>
                📝 Yeni
              </Text>
            </TouchableOpacity>
          </View>
        </Animated.View>

        <Animated.View
          style={{
            opacity: entO[1],
            transform: [{ translateY: entY[1]! }],
          }}
        >
          <View style={styles.weekCard}>
            <Text style={styles.sectionLabelMuted}>BU HAFTA</Text>
            <Text style={styles.weekBig}>{weekDone}/7 gün</Text>
            <Text style={styles.weekPct}>%{weekPct} tamamlandı</Text>
            <View style={styles.progressTrack}>
              <View style={[styles.progressFillClip, { width: `${weekPct}%` }]}>
                <LinearGradient
                  colors={["#34D399", "#10B981"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.progressGradient}
                />
              </View>
            </View>
            <View style={styles.weekDotsRow}>
              {weekDayLabels.map((lbl, i) => (
                <View key={weekDates[i]} style={styles.weekDayCol}>
                  <View
                    style={[
                      styles.weekDot,
                      doneFlags[i] ? styles.weekDotOn : styles.weekDotOff,
                    ]}
                  />
                  <Text style={styles.weekDayText}>{lbl}</Text>
                </View>
              ))}
            </View>
          </View>
        </Animated.View>

        <Animated.View
          style={{
            opacity: entO[2],
            transform: [{ translateY: entY[2]! }],
          }}
        >
          <View style={styles.todayCard}>
            <Text style={styles.sectionLabelMuted}>BUGÜNÜN YANSIMASI</Text>
            <TextInput
              style={styles.todayInput}
              value={todayReflectionDraft}
              onChangeText={setTodayReflectionDraft}
              placeholder="Bugün için bir cümle yaz..."
              placeholderTextColor="#94A3B8"
              multiline
              textAlignVertical="top"
            />
            <TouchableOpacity
              style={[styles.saveTodayBtn, !canSaveToday && styles.saveTodayBtnDisabled]}
              onPress={() => void saveTodayReflection()}
              disabled={!canSaveToday}
              activeOpacity={0.85}
            >
              <Text
                style={[
                  styles.saveTodayBtnText,
                  !canSaveToday && styles.saveTodayBtnTextDisabled,
                ]}
              >
                Kaydet
              </Text>
            </TouchableOpacity>
          </View>
        </Animated.View>

        <Animated.View
          onLayout={(e) => {
            historySectionY.current = e.nativeEvent.layout.y;
          }}
          style={{
            opacity: entO[3],
            transform: [{ translateY: entY[3]! }],
          }}
        >
          <View style={styles.historyHeaderRow}>
            <Text style={styles.sectionLabelMuted}>GEÇMİŞ YANSIMA</Text>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => {
                const y = Math.max(0, historySectionY.current - 12);
                journalScrollRef.current?.scrollTo({ y, animated: true });
              }}
            >
              <Text style={styles.tumuLink}>Tümü →</Text>
            </TouchableOpacity>
          </View>
          {sortedReflections.length === 0 ? (
            <Text style={styles.emptyReflections}>
              Henüz yansıma yok. İlk yansımanı bugün yaz.
            </Text>
          ) : (
            <View style={styles.reflectionListWrap}>
              {sortedReflections.map((item) => (
              <ReflectionHistoryRow
                key={`${item.date}-${item.day}-${item.comment.slice(0, 12)}`}
                item={item}
                identityIcon={habit?.identityIcon ?? null}
                highlightDate={highlightDate}
                onAnimatedEnd={clearHighlight}
              />
            ))}
            </View>
          )}
        </Animated.View>

        <Animated.View
          style={{
            opacity: entO[4],
            transform: [{ translateY: entY[4]! }],
          }}
        >
          <TouchableOpacity
            style={styles.mindDumpPromo}
            onPress={openMindDump}
            activeOpacity={0.88}
          >
            <Ionicons name="leaf" size={24} color="#10B981" style={styles.mindDumpIcon} />
            <Text style={styles.mindDumpTitle}>Zihin Boşalt</Text>
            <Text style={styles.mindDumpDesc}>
              Stres, uyku öncesi veya kafa doluyken — yazdığın sadece bu cihazda kalır.
            </Text>
            <Text style={styles.mindDumpCta}>Başla →</Text>
          </TouchableOpacity>
        </Animated.View>

        <View style={{ height: 32 }} />
      </ScrollView>

      <MindDumpLegacyModal visible={mindModalOpen} onClose={() => setMindModalOpen(false)} />
    </SafeAreaView>
  );
}

/** Zihin Boşalt — alt sayfa modal; otomatik kayıt + manuel Kaydet aynı mantık. */
function MindDumpLegacyModal({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) {
  const { entries, load, createEntry, updateEntry, deleteEntry } = useMindDumpStore();
  const profile = useUserStore((s) => s.profile);
  const isPremium = profile?.isPremium ?? false;

  const [currentId, setCurrentId] = useState<string | null>(null);
  const [text, setText] = useState("");
  const [savingLabel, setSavingLabel] = useState<"" | "kaydediliyor..." | "kaydedildi">("");
  const [showGate, setShowGate] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<MindDumpEntry | null>(null);
  const [journeyOnly, setJourneyOnly] = useState(false);
  const [reflection, setReflection] = useState<MindDumpReflectionState | null>(null);
  const [showFiveSecond, setShowFiveSecond] = useState(false);
  const [inputFocused, setInputFocused] = useState(false);
  const [selectedPromptIdx, setSelectedPromptIdx] = useState<number | null>(null);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    void load();
  }, []);

  const runPersist = useCallback(
    async (raw: string, id: string | null) => {
      if (!raw.trim()) {
        setSavingLabel("");
        return;
      }
      const v = raw.trim();
      setSavingLabel("kaydediliyor...");
      try {
        if (id) {
          await updateEntry(id, v);
        } else {
          const { entry, hitLimit } = await createEntry(v);
          setCurrentId(entry.id);
          if (hitLimit && !isPremium) setShowGate(true);
          const mindAction = getActionById("tpl-clear-mind-write");
          if (mindAction) {
            void useBehaviorStore.getState().recordAction(mindAction);
          }
        }
        setSavingLabel("kaydedildi");
        const latest = useMindDumpStore.getState().entries;
        const chk = useCheckinsStore.getState().checkins;
        const prof = useUserStore.getState().profile;
        if (prof) {
          const ref = buildMindDumpReflection(v, latest, chk, prof.habitName, prof.startDate);
          setReflection(ref.showBanner ? ref : null);
        }
      } catch {
        setSavingLabel("");
        return;
      }
      setTimeout(() => setSavingLabel(""), 1500);
    },
    [createEntry, updateEntry, isPremium]
  );

  const triggerAutoSave = useCallback(
    (value: string, id: string | null) => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
      setSavingLabel("kaydediliyor...");
      saveTimer.current = setTimeout(() => {
        void runPersist(value, id);
      }, 2000);
    },
    [runPersist]
  );

  const handleTextChange = (value: string) => {
    const next = value.slice(0, MODAL_MAX_CHARS);
    setText(next);
    setSelectedPromptIdx(null);
    triggerAutoSave(next, currentId);
  };

  const applyStartPhrase = (phrase: string, idx: number) => {
    setSelectedPromptIdx(idx);
    const nextBase = text.trim()
      ? `${text.trim()}\n\n${phrase} `
      : `${phrase} `;
    const next = nextBase.slice(0, MODAL_MAX_CHARS);
    setText(next);
    triggerAutoSave(next, currentId);
  };

  const handleManualSave = () => {
    if (saveTimer.current) {
      clearTimeout(saveTimer.current);
      saveTimer.current = null;
    }
    void runPersist(text, currentId);
  };

  const handleDelete = (entry: MindDumpEntry) => {
    setDeleteTarget(entry);
  };

  const journeyMindCount = useMemo(
    () => entries.filter((e) => isJourneyMindContent(e.content)).length,
    [entries]
  );

  const filtered = useMemo(() => {
    if (journeyOnly && journeyMindCount > 0) {
      return entries.filter((e) => isJourneyMindContent(e.content));
    }
    return entries;
  }, [entries, journeyOnly, journeyMindCount]);

  const headerDate = format(new Date(), "d MMMM yyyy, EEEE", { locale: tr });

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={mindModalStyles.kbRoot}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={mindModalStyles.overlay}>
          <Pressable style={mindModalStyles.backdrop} onPress={onClose} />
          <SafeAreaView edges={["bottom"]} style={mindModalStyles.sheetOuter}>
            <View style={mindModalStyles.sheet}>
              <TouchableOpacity
                style={mindModalStyles.closeBtn}
                onPress={onClose}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                accessibilityLabel="Kapat"
              >
                <Ionicons name="close" size={24} color="#64748B" />
              </TouchableOpacity>

              <ScrollView
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
                contentContainerStyle={mindModalStyles.scrollContent}
                bounces={false}
              >
                <View style={mindModalStyles.handleWrap}>
                  <View style={mindModalStyles.handle} />
                </View>

                <Text style={mindModalStyles.modalTitle}>📝 Zihin Boşalt</Text>
                <Text style={mindModalStyles.modalSubtitle}>Yaz, kaydet, rahatla</Text>
                <Text style={mindModalStyles.modalDate}>{headerDate}</Text>

                {!isPremium && entries.length >= 8 && entries.length < 10 ? (
                  <View style={[legacyStyles.approachingBanner, mindModalStyles.bannerMargin]}>
                    <Text style={legacyStyles.approachingText}>{MIND_DUMP_APPROACHING_LIMIT}</Text>
                  </View>
                ) : null}

                <TextInput
                  style={[
                    mindModalStyles.textInput,
                    inputFocused && mindModalStyles.textInputFocused,
                  ]}
                  value={text}
                  onChangeText={handleTextChange}
                  placeholder="Aklına ne gelirse yaz. Kimse okumayacak. Yargılanmayacaksın."
                  placeholderTextColor="#94A3B8"
                  multiline
                  textAlignVertical="top"
                  autoCorrect={false}
                  onFocus={() => setInputFocused(true)}
                  onBlur={() => setInputFocused(false)}
                  maxLength={MODAL_MAX_CHARS}
                />

                <View style={mindModalStyles.saveRow}>
                  <Text style={mindModalStyles.charCount}>
                    {text.length}/{MODAL_MAX_CHARS}
                  </Text>
                  <TouchableOpacity
                    style={[
                      mindModalStyles.saveBtn,
                      !text.trim() && mindModalStyles.saveBtnDisabled,
                    ]}
                    onPress={handleManualSave}
                    disabled={!text.trim()}
                    activeOpacity={0.85}
                  >
                    <Text style={mindModalStyles.saveBtnText}>Kaydet</Text>
                  </TouchableOpacity>
                </View>

                {savingLabel ? (
                  <Text style={mindModalStyles.savingHint}>{savingLabel}</Text>
                ) : null}

                <View style={mindModalStyles.promptsBlock}>
                  <Text style={mindModalStyles.promptsLabel}>💡 BAŞLANGIÇ CÜMLELERİ</Text>
                  {MODAL_START_PHRASES.map((phrase, idx) => (
                    <TouchableOpacity
                      key={phrase}
                      style={[
                        mindModalStyles.promptCard,
                        selectedPromptIdx === idx && mindModalStyles.promptCardSelected,
                      ]}
                      onPress={() => applyStartPhrase(phrase, idx)}
                      activeOpacity={0.88}
                    >
                      <Text style={mindModalStyles.promptCardText}>{phrase}</Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <Text style={mindModalStyles.footerNote}>
                  🕐 Yazmayı bıraktığında birkaç saniye içinde otomatik kaydedilir.
                </Text>

                {reflection?.showBanner ? (
                  <View style={[legacyStyles.reflectionBanner, mindModalStyles.reflectionMargin]}>
                    <View style={legacyStyles.reflectionIconRow}>
                      <Sparkles size={20} color="#C0392B" strokeWidth={1.8} />
                      <Text style={legacyStyles.reflectionTitle}>{reflection.bannerTitle}</Text>
                    </View>
                    <Text style={legacyStyles.reflectionBody}>{reflection.bannerBody}</Text>
                    {reflection.quote ? (
                      <Text style={legacyStyles.reflectionQuote}>{reflection.quote}</Text>
                    ) : null}
                    <TouchableOpacity
                      style={legacyStyles.reflectionCta}
                      onPress={() => setShowFiveSecond(true)}
                      activeOpacity={0.88}
                    >
                      <Text style={legacyStyles.reflectionCtaText}>5 saniye kuralı ile devam et?</Text>
                    </TouchableOpacity>
                  </View>
                ) : null}

                {filtered.length > 0 ? (
                  <View style={[legacyStyles.historySection, mindModalStyles.historyMargin]}>
                    <Text style={legacyStyles.historyLabel}>
                      Önceki notlar
                      {!isPremium ? ` (${entries.length}/10)` : ""}
                    </Text>
                    <Text style={legacyStyles.historyHint}>
                      Açmak için dokun. Silmek için satıra uzun bas, sonra çöp kutusuna dokun.
                    </Text>
                    {journeyMindCount > 0 ? (
                      <TouchableOpacity
                        style={[legacyStyles.filterChip, journeyOnly && legacyStyles.filterChipOn]}
                        onPress={() => setJourneyOnly((v) => !v)}
                        activeOpacity={0.85}
                      >
                        <Footprints
                          size={14}
                          color={journeyOnly ? Colors.primaryDark : Colors.textSecondary}
                          strokeWidth={2}
                        />
                        <Text
                          style={[legacyStyles.filterChipText, journeyOnly && legacyStyles.filterChipTextOn]}
                        >
                          Sadece Yolculuk ({journeyMindCount})
                        </Text>
                      </TouchableOpacity>
                    ) : null}
                    {filtered.map((entry) => (
                      <LegacyEntryRow
                        key={entry.id}
                        entry={entry}
                        active={currentId === entry.id}
                        onSelect={() => {
                          const c = entry.content.slice(0, MODAL_MAX_CHARS);
                          setText(c);
                          setCurrentId(entry.id);
                          setSelectedPromptIdx(null);
                        }}
                        onDelete={() => handleDelete(entry)}
                      />
                    ))}
                  </View>
                ) : null}

                {!isPremium && entries.length >= 10 ? (
                  <TouchableOpacity
                    style={[legacyStyles.limitCard, mindModalStyles.limitCardMargin]}
                    onPress={() => setShowGate(true)}
                  >
                    <Lock size={18} color={Colors.coral} strokeWidth={1.5} />
                    <Text style={legacyStyles.limitText}>{MIND_DUMP_FREE_LIMIT_EXPLAIN}</Text>
                  </TouchableOpacity>
                ) : null}

                {journeyOnly && filtered.length === 0 && entries.length > 0 ? (
                  <Text style={legacyStyles.searchEmpty}>
                    Aradığın Yolculuk satırı yok; filtreyi kapatıp tüm notlara dönebilirsin.
                  </Text>
                ) : null}
              </ScrollView>
            </View>
          </SafeAreaView>
        </View>
      </KeyboardAvoidingView>

      <Modal visible={showFiveSecond} animationType="fade" onRequestClose={() => setShowFiveSecond(false)}>
        <SafeAreaView style={legacyStyles.trainerRoot} edges={["top", "bottom"]}>
          <FiveSecondTrainer
            scenario={FIVE_FROM_MIND}
            onComplete={async (_s, _ms, reward) => {
              const micro = getActionById("deep-breath");
              if (micro) {
                await useBehaviorStore.getState().recordAction(micro);
              }
              if (reward && profile) {
                await useUserStore.getState().addDisciplineMuscleXp(reward.disciplineMuscle, reward.xp);
              }
              setShowFiveSecond(false);
            }}
            onSkip={() => setShowFiveSecond(false)}
          />
        </SafeAreaView>
      </Modal>

      <PremiumGateModal visible={showGate} onClose={() => setShowGate(false)} trigger="minddump" />

      <ConfirmDialog
        visible={deleteTarget !== null}
        title="Notu sil"
        message="Bu not kalıcı olarak silinecek. Bu işlem geri alınamaz."
        tone="danger"
        onRequestClose={() => setDeleteTarget(null)}
        actions={[
          {
            label: "Vazgeç",
            variant: "secondary",
            onPress: () => setDeleteTarget(null),
          },
          {
            label: "Sil",
            variant: "destructive",
            onPress: async () => {
              if (!deleteTarget) return;
              const id = deleteTarget.id;
              setDeleteTarget(null);
              await deleteEntry(id);
              if (currentId === id) {
                setText("");
                setCurrentId(null);
              }
            },
          },
        ]}
      />
    </Modal>
  );
}

interface LegacyEntryRowProps {
  entry: MindDumpEntry;
  active: boolean;
  onSelect: () => void;
  onDelete: () => void;
}

function LegacyEntryRow({ entry, active, onSelect, onDelete }: LegacyEntryRowProps) {
  const translateX = useRef(new Animated.Value(0)).current;
  const [swiped, setSwiped] = useState(false);
  const fromJourney = isJourneyMindContent(entry.content);

  const handleSwipe = () => {
    const toValue = swiped ? 0 : -72;
    Animated.spring(translateX, {
      toValue,
      useNativeDriver: true,
      speed: 20,
      bounciness: 4,
    }).start();
    setSwiped(!swiped);
  };

  const previewBody = stripJourneyMindPrefix(entry.content);
  const preview = previewBody.slice(0, 60) + (previewBody.length > 60 ? "…" : "");
  const dateStr = format(new Date(entry.createdAt), "d MMM", { locale: tr });

  return (
    <View style={entryS.wrap}>
      <TouchableOpacity style={entryS.deleteArea} onPress={onDelete}>
        <Trash2 size={18} color="#fff" strokeWidth={1.5} />
      </TouchableOpacity>
      <Animated.View style={[entryS.row, active && entryS.rowActive, { transform: [{ translateX }] }]}>
        <TouchableOpacity
          style={entryS.rowContent}
          onPress={onSelect}
          onLongPress={handleSwipe}
          activeOpacity={0.85}
        >
          <View style={entryS.metaRow}>
            <Text style={entryS.rowDate}>{dateStr}</Text>
            {fromJourney ? (
              <View style={entryS.jBadge}>
                <Footprints size={11} color={Colors.primaryDark} strokeWidth={2} />
                <Text style={entryS.jBadgeText}>Yolculuk</Text>
              </View>
            ) : null}
          </View>
          <Text style={entryS.rowPreview} numberOfLines={2}>
            {preview || "Boş not"}
          </Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const entryS = StyleSheet.create({
  wrap: {
    marginBottom: Spacing.sm,
    borderRadius: Radii.card,
    overflow: "hidden",
    position: "relative",
  },
  deleteArea: {
    position: "absolute",
    right: 0,
    top: 0,
    bottom: 0,
    width: 72,
    backgroundColor: Colors.coral,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: Radii.card,
  },
  row: {
    backgroundColor: Colors.surface,
    borderRadius: Radii.card,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.soft,
  },
  rowActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryLight,
  },
  rowContent: {
    padding: Spacing.md,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: Spacing.xs,
    marginBottom: 4,
  },
  rowDate: {
    fontSize: FontSizes.xs,
    fontFamily: "Inter_500Medium",
    color: Colors.textTertiary,
    textTransform: "capitalize",
  },
  jBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: Radii.pill,
    borderWidth: 1,
    borderColor: "rgba(29,158,117,0.25)",
  },
  jBadgeText: {
    fontSize: FontSizes.xs,
    fontFamily: "Inter_500Medium",
    color: Colors.primaryDark,
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  rowPreview: {
    fontSize: FontSizes.sm,
    fontFamily: "Inter_400Regular",
    color: Colors.textSecondary,
    lineHeight: 19,
  },
});

const styles = StyleSheet.create({
  journalRoot: {
    flex: 1,
    backgroundColor: PAGE_BG,
  },
  journalScroll: {
    flex: 1,
    backgroundColor: PAGE_BG,
  },
  journalScrollContent: {
    paddingBottom: Spacing.lg,
  },
  journalHeaderBlock: {
    paddingHorizontal: 16,
    paddingTop: Spacing.sm,
  },
  journalHeaderRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  journalTitleCol: {
    flex: 1,
    marginRight: 12,
  },
  journalTitle: {
    fontSize: 26,
    fontWeight: "800",
    color: "#0F172A",
  },
  journalSubtitle: {
    fontSize: 14,
    color: "#64748B",
    marginTop: 4,
  },
  journalDayLine: {
    fontSize: 12,
    color: "#94A3B8",
    marginTop: 2,
    fontWeight: "600",
  },
  yeniBtn: {
    backgroundColor: "#ECFDF5",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  yeniBtnDisabled: {
    opacity: 0.45,
  },
  yeniBtnText: {
    color: "#059669",
    fontWeight: "600",
    fontSize: 14,
  },
  yeniBtnTextDisabled: {
    color: "#059669",
  },
  sectionLabelMuted: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.5,
    color: "#94A3B8",
    textTransform: "uppercase",
    marginBottom: 8,
  },
  weekCard: {
    marginHorizontal: 16,
    marginTop: 16,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    ...cardShadow,
  },
  weekBig: {
    fontSize: 28,
    fontWeight: "800",
    color: "#0F172A",
  },
  weekPct: {
    fontSize: 13,
    color: "#059669",
    fontWeight: "600",
    marginTop: 4,
    marginBottom: 12,
  },
  progressTrack: {
    height: 8,
    borderRadius: 4,
    backgroundColor: "#E2E8F0",
    overflow: "hidden",
  },
  progressFillClip: {
    height: "100%",
    borderRadius: 4,
    overflow: "hidden",
  },
  progressGradient: {
    flex: 1,
    height: "100%",
  },
  weekDotsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
    paddingHorizontal: 2,
  },
  weekDayCol: {
    alignItems: "center",
    flex: 1,
  },
  weekDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginBottom: 6,
  },
  weekDotOn: {
    backgroundColor: "#10B981",
  },
  weekDotOff: {
    backgroundColor: "#E2E8F0",
  },
  weekDayText: {
    fontSize: 10,
    color: "#64748B",
    textTransform: "lowercase",
  },
  todayCard: {
    marginHorizontal: 16,
    marginTop: 16,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    ...cardShadow,
  },
  todayInput: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    padding: 12,
    minHeight: 80,
    fontSize: 15,
    color: "#0F172A",
    backgroundColor: "#FFFFFF",
    marginBottom: 12,
  },
  saveTodayBtn: {
    alignSelf: "flex-end",
    backgroundColor: "#10B981",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  saveTodayBtnDisabled: {
    backgroundColor: "#A7F3D0",
  },
  saveTodayBtnText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 14,
  },
  saveTodayBtnTextDisabled: {
    color: "#ECFDF5",
  },
  historyHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginHorizontal: 16,
    marginTop: 16,
  },
  tumuLink: {
    color: "#10B981",
    fontWeight: "600",
    fontSize: 13,
  },
  reflectionListWrap: {
    marginTop: 8,
  },
  emptyReflections: {
    textAlign: "center",
    color: "#94A3B8",
    marginTop: 20,
    marginHorizontal: 24,
    fontSize: 14,
    lineHeight: 20,
  },
  reflectionCard: {
    marginHorizontal: 16,
    marginTop: 0,
    marginBottom: 10,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 14,
    borderLeftWidth: 3,
    borderLeftColor: "#10B981",
    ...cardShadow,
  },
  reflectionDayLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "#059669",
    marginBottom: 6,
  },
  reflectionBody: {
    fontSize: 14,
    color: "#334155",
    lineHeight: 20,
  },
  reflectionMeta: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 10,
  },
  reflectionDate: {
    fontSize: 12,
    color: "#94A3B8",
  },
  reflectionIcon: {
    fontSize: 16,
  },
  mindDumpPromo: {
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 24,
    backgroundColor: "#F0FDF4",
    borderRadius: 16,
    padding: 16,
  },
  mindDumpIcon: {
    marginBottom: 8,
  },
  mindDumpTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#065F46",
    marginBottom: 6,
  },
  mindDumpDesc: {
    fontSize: 13,
    color: "#059669",
    lineHeight: 19,
    marginBottom: 10,
  },
  mindDumpCta: {
    color: "#059669",
    fontWeight: "600",
    fontSize: 14,
  },
});

const mindModalStyles = StyleSheet.create({
  kbRoot: { flex: 1 },
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(15, 23, 42, 0.45)",
  },
  sheetOuter: {
    maxHeight: "90%",
    width: "100%",
  },
  sheet: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 20,
    maxHeight: "100%",
    position: "relative",
    ...Platform.select({
      android: { elevation: 12 },
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.12,
        shadowRadius: 16,
      },
    }),
  },
  closeBtn: {
    position: "absolute",
    top: 16,
    right: 16,
    zIndex: 10,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  handleWrap: {
    alignItems: "center",
    marginTop: 8,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#CBD5E1",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#0F172A",
    textAlign: "center",
    marginTop: 12,
    paddingHorizontal: 48,
  },
  modalSubtitle: {
    fontSize: 13,
    color: "#64748B",
    textAlign: "center",
    marginTop: 4,
    paddingHorizontal: 24,
  },
  modalDate: {
    fontSize: 12,
    color: "#94A3B8",
    textAlign: "center",
    marginTop: 4,
  },
  bannerMargin: {
    marginHorizontal: 16,
    marginTop: 12,
  },
  textInput: {
    marginHorizontal: 16,
    marginTop: 16,
    minHeight: 150,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
    backgroundColor: "#FAFAFA",
    padding: 16,
    fontSize: 15,
    lineHeight: 22,
    color: "#334155",
  },
  textInputFocused: {
    borderColor: "#10B981",
    backgroundColor: "#FFFFFF",
  },
  saveRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginHorizontal: 16,
    marginTop: 12,
  },
  charCount: {
    fontSize: 11,
    color: "#94A3B8",
  },
  saveBtn: {
    backgroundColor: "#10B981",
    borderRadius: 10,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  saveBtnDisabled: {
    opacity: 0.45,
  },
  saveBtnText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 15,
  },
  savingHint: {
    textAlign: "center",
    fontSize: 12,
    color: "#94A3B8",
    marginTop: 6,
  },
  promptsBlock: {
    marginHorizontal: 16,
    marginTop: 20,
  },
  promptsLabel: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.5,
    color: "#94A3B8",
    textTransform: "uppercase",
    marginBottom: 10,
  },
  promptCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
  },
  promptCardSelected: {
    borderColor: "#10B981",
    backgroundColor: "#ECFDF5",
  },
  promptCardText: {
    fontSize: 14,
    color: "#475569",
    fontStyle: "italic",
  },
  footerNote: {
    marginTop: 16,
    marginBottom: 20,
    textAlign: "center",
    fontSize: 12,
    color: "#94A3B8",
    paddingHorizontal: 20,
  },
  reflectionMargin: {
    marginHorizontal: 16,
  },
  historyMargin: {
    marginHorizontal: 16,
    marginTop: 8,
  },
  limitCardMargin: {
    marginHorizontal: 16,
  },
});

const legacyStyles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  modalHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border,
  },
  modalHeaderLeft: { flex: 1, marginRight: Spacing.sm },
  modalHeaderTitle: {
    fontSize: FontSizes.lg,
    fontFamily: "Inter_600SemiBold",
    color: Colors.textPrimary,
  },
  modalHeaderRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  saveLabelBelow: {
    marginTop: 4,
    fontSize: FontSizes.sm,
    fontFamily: "Inter_400Regular",
    color: Colors.textTertiary,
  },
  headerBtn: {
    width: 34,
    height: 34,
    borderRadius: Radii.button,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  newBtn: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 7,
    borderRadius: Radii.pill,
    backgroundColor: Colors.primaryLight,
  },
  newBtnText: {
    fontSize: FontSizes.sm,
    fontFamily: "Inter_500Medium",
    color: Colors.primary,
  },
  searchBar: { overflow: "hidden", paddingHorizontal: Spacing.lg },
  searchInput: {
    backgroundColor: Colors.surface,
    borderRadius: Radii.button,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
    fontSize: FontSizes.md,
    fontFamily: "Inter_400Regular",
    color: Colors.textPrimary,
    marginTop: Spacing.xs,
    ...Shadows.soft,
  },
  scroll: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.lg,
  },
  editorSection: { marginBottom: Spacing.lg },
  approachingBanner: {
    backgroundColor: Colors.goldLight,
    borderRadius: Radii.card,
    borderWidth: 1,
    borderColor: "rgba(212, 160, 23, 0.35)",
    padding: Spacing.md,
    marginBottom: Spacing.md,
    ...Shadows.soft,
  },
  approachingText: {
    fontSize: FontSizes.sm,
    fontFamily: "Inter_400Regular",
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  editorHint: {
    fontSize: FontSizes.xs,
    fontFamily: "Inter_400Regular",
    color: Colors.textTertiary,
    lineHeight: 18,
    marginBottom: Spacing.xs,
  },
  editorEngine: {
    fontSize: FontSizes.xs,
    fontFamily: "Inter_400Regular",
    color: Colors.textTertiary,
    lineHeight: 18,
    marginBottom: Spacing.sm,
    opacity: 0.92,
  },
  editorDate: {
    fontSize: FontSizes.xs,
    fontFamily: "Inter_500Medium",
    color: Colors.textTertiary,
    textTransform: "capitalize",
    marginBottom: Spacing.sm,
    letterSpacing: 0.5,
  },
  editor: {
    backgroundColor: Colors.surface,
    borderRadius: Radii.card,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    fontSize: FontSizes.lg,
    fontFamily: "Inter_400Regular",
    color: Colors.textPrimary,
    lineHeight: 28,
    textAlignVertical: "top",
    ...Shadows.soft,
  },
  reflectionBanner: {
    marginTop: Spacing.md,
    backgroundColor: "rgba(243, 156, 18, 0.14)",
    borderRadius: Radii.card,
    borderWidth: 1,
    borderColor: "rgba(230, 126, 34, 0.35)",
    padding: Spacing.md,
    gap: Spacing.sm,
    ...Shadows.soft,
  },
  reflectionIconRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  reflectionTitle: {
    fontSize: FontSizes.sm,
    fontFamily: "Inter_500Medium",
    color: Colors.textPrimary,
    flex: 1,
  },
  reflectionBody: {
    fontSize: FontSizes.sm,
    fontFamily: "Inter_400Regular",
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  reflectionQuote: {
    fontSize: FontSizes.xs,
    fontFamily: "Inter_400Regular",
    color: Colors.textPrimary,
    lineHeight: 18,
    fontStyle: "italic",
  },
  reflectionCta: {
    alignSelf: "flex-start",
    backgroundColor: Colors.primary,
    borderRadius: Radii.button,
    paddingVertical: 8,
    paddingHorizontal: Spacing.md,
    marginTop: Spacing.xs,
  },
  reflectionCtaText: {
    fontSize: FontSizes.xs,
    fontFamily: "Inter_500Medium",
    color: "#fff",
  },
  trainerRoot: { flex: 1, backgroundColor: "#141C26" },
  emptyPanel: {
    backgroundColor: Colors.primaryLight,
    borderRadius: Radii.card,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.lg,
    marginBottom: Spacing.xl,
    gap: Spacing.sm,
    ...Shadows.soft,
  },
  emptyIconWrap: {
    width: 44,
    height: 44,
    borderRadius: Radii.button,
    backgroundColor: Colors.surface,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.xs,
  },
  emptyTitle: {
    fontSize: FontSizes.md,
    fontFamily: "Inter_500Medium",
    color: Colors.textPrimary,
  },
  emptyBody: {
    fontSize: FontSizes.sm,
    fontFamily: "Inter_400Regular",
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  promptsLabel: {
    fontSize: FontSizes.xs,
    fontFamily: "Inter_500Medium",
    color: Colors.textTertiary,
    textTransform: "uppercase",
    letterSpacing: 0.6,
    marginTop: Spacing.sm,
  },
  promptChips: { flexDirection: "row", flexWrap: "wrap", gap: Spacing.sm, marginTop: Spacing.xs },
  promptChip: {
    backgroundColor: Colors.surface,
    borderRadius: Radii.pill,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingVertical: 8,
    paddingHorizontal: Spacing.md,
    maxWidth: "100%",
  },
  promptChipText: {
    fontSize: FontSizes.sm,
    fontFamily: "Inter_400Regular",
    color: Colors.textPrimary,
    lineHeight: 20,
  },
  historySection: {},
  historyLabel: {
    fontSize: FontSizes.xs,
    fontFamily: "Inter_500Medium",
    color: Colors.textTertiary,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: Spacing.xs,
  },
  historyHint: {
    fontSize: FontSizes.xs,
    fontFamily: "Inter_400Regular",
    color: Colors.textTertiary,
    lineHeight: 17,
    marginBottom: Spacing.sm,
  },
  filterChip: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: 6,
    paddingVertical: 7,
    paddingHorizontal: Spacing.sm,
    borderRadius: Radii.pill,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
    marginBottom: Spacing.sm,
  },
  filterChipOn: {
    backgroundColor: Colors.primaryLight,
    borderColor: "rgba(29,158,117,0.35)",
  },
  filterChipText: {
    fontSize: FontSizes.xs,
    fontFamily: "Inter_500Medium",
    color: Colors.textSecondary,
  },
  filterChipTextOn: {
    color: Colors.primaryDark,
  },
  searchEmpty: {
    fontSize: FontSizes.sm,
    fontFamily: "Inter_400Regular",
    color: Colors.textSecondary,
    textAlign: "center",
    marginTop: Spacing.md,
    paddingHorizontal: Spacing.md,
  },
  limitCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: Spacing.sm,
    backgroundColor: Colors.coralLight,
    borderRadius: Radii.card,
    padding: Spacing.md,
    marginTop: Spacing.md,
    borderWidth: 1,
    borderColor: "rgba(216,90,48,0.15)",
  },
  limitText: {
    flex: 1,
    fontSize: FontSizes.sm,
    fontFamily: "Inter_400Regular",
    color: Colors.coral,
    lineHeight: 19,
  },
});
