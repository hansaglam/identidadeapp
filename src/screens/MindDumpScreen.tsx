import React, { useEffect, useRef, useState, useCallback, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Animated,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import { Search, X, Trash2, Lock, Sparkles, Footprints } from "lucide-react-native";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { useMindDumpStore } from "../store/mindDumpStore";
import { useUserStore } from "../store/userStore";
import {
  Colors, Spacing, Radii, FontSizes,
} from "../constants/theme";
import {
  MIND_DUMP_ENGINE_MICROCOPY,
  MIND_DUMP_FREE_LIMIT_EXPLAIN,
  MIND_DUMP_APPROACHING_LIMIT,
} from "../constants/purposeCopy";
import { MainTabParamList, MindDumpEntry } from "../types";
import PremiumGateModal from "../components/PremiumGateModal";
import ConfirmDialog from "../components/ConfirmDialog";
import { isJourneyMindContent, stripJourneyMindPrefix } from "../constants/mindDumpJourney";

type Props = BottomTabScreenProps<MainTabParamList, "MindDump">;

const WRITING_PROMPTS = [
  "Bugün kafamı en çok meşgul eden şey…",
  "Şu an içimden geçen ama sesli söylemediğim…",
  "Minnettar olduğum küçük bir detay…",
  "Yarın için tek bir net niyet…",
] as const;

export default function MindDumpScreen(_: Props) {
  const { height: windowHeight } = useWindowDimensions();
  const editorMinH = Math.round(Math.max(260, windowHeight * 0.34));
  const { entries, load, createEntry, updateEntry, deleteEntry } = useMindDumpStore();
  const profile = useUserStore((s) => s.profile);
  const isPremium = profile?.isPremium ?? false;

  const [currentId, setCurrentId] = useState<string | null>(null);
  const [text, setText] = useState("");
  const [savingLabel, setSavingLabel] = useState<"" | "kaydediliyor..." | "kaydedildi">("");
  const [searchVisible, setSearchVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showGate, setShowGate] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<MindDumpEntry | null>(null);
  const [journeyOnly, setJourneyOnly] = useState(false);
  const searchAnim = useRef(new Animated.Value(0)).current;
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => { load(); }, []);

  // ─── Auto-save with 2-second debounce ──────────────────────────────────

  const triggerAutoSave = useCallback(
    (value: string, id: string | null) => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
      setSavingLabel("kaydediliyor...");
      saveTimer.current = setTimeout(async () => {
        if (!value.trim()) { setSavingLabel(""); return; }
        if (id) {
          await updateEntry(id, value.trim());
          setSavingLabel("kaydedildi");
        } else {
          const { entry, hitLimit } = await createEntry(value.trim());
          setCurrentId(entry.id);
          setSavingLabel("kaydedildi");
          if (hitLimit && !isPremium) setShowGate(true);
        }
        setTimeout(() => setSavingLabel(""), 1500);
      }, 2000);
    },
    [createEntry, updateEntry, isPremium]
  );

  const handleTextChange = (value: string) => {
    setText(value);
    triggerAutoSave(value, currentId);
  };

  const appendPrompt = (prompt: string) => {
    const next = text.trim()
      ? `${text.trim()}\n\n${prompt} `
      : `${prompt} `;
    setText(next);
    triggerAutoSave(next, currentId);
  };

  const handleNewEntry = () => {
    if (!isPremium && entries.length >= 10) {
      setShowGate(true);
      return;
    }
    setText("");
    setCurrentId(null);
    setSavingLabel("");
    if (saveTimer.current) clearTimeout(saveTimer.current);
  };

  const handleDelete = (entry: MindDumpEntry) => {
    setDeleteTarget(entry);
  };

  const toggleSearch = () => {
    const toValue = searchVisible ? 0 : 1;
    Animated.timing(searchAnim, { toValue, duration: 250, useNativeDriver: false }).start();
    setSearchVisible(!searchVisible);
    if (searchVisible) setSearchQuery("");
  };

  const journeyMindCount = useMemo(
    () => entries.filter((e) => isJourneyMindContent(e.content)).length,
    [entries]
  );

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const searched = q
      ? entries.filter((e) => e.content.toLowerCase().includes(q))
      : entries;
    if (journeyOnly && journeyMindCount > 0) {
      return searched.filter((e) => isJourneyMindContent(e.content));
    }
    return searched;
  }, [entries, searchQuery, journeyOnly, journeyMindCount]);

  const searchHeight = searchAnim.interpolate({
    inputRange: [0, 1], outputRange: [0, 52],
  });

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: Colors.bg }]} edges={["top"]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.headerTitleBlock}>
            <Text style={styles.headerTitle}>Zihin Boşalt</Text>
            <Text style={styles.headerSubtitle}>
              Stres, uyku öncesi veya kafa doluyken bile — yazdığın sadece bu cihazda kalır.
            </Text>
            {savingLabel ? (
              <Text style={[styles.saveLabel, styles.saveLabelBelow]}>{savingLabel}</Text>
            ) : null}
          </View>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.headerBtn} onPress={toggleSearch}>
            {searchVisible
              ? <X size={18} color={Colors.textSecondary} strokeWidth={1.5} />
              : <Search size={18} color={Colors.textSecondary} strokeWidth={1.5} />}
          </TouchableOpacity>
          <TouchableOpacity style={styles.newBtn} onPress={handleNewEntry}>
            <Text style={styles.newBtnText}>+ Yeni</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Search bar (animated height) */}
      <Animated.View style={[styles.searchBar, { height: searchHeight }]}>
        <TextInput
          style={styles.searchInput}
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Notlarda ara..."
          placeholderTextColor={Colors.textTertiary}
          returnKeyType="search"
        />
      </Animated.View>

      <ScrollView
        contentContainerStyle={[styles.scroll, { backgroundColor: Colors.bg }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Current-session editor */}
        <View style={styles.editorSection}>
          {!isPremium && entries.length >= 8 && entries.length < 10 && (
            <View style={styles.approachingBanner}>
              <Text style={styles.approachingText}>{MIND_DUMP_APPROACHING_LIMIT}</Text>
            </View>
          )}
          <Text style={styles.editorDate}>
            {format(new Date(), "d MMMM yyyy, EEEE", { locale: tr })}
          </Text>
          <Text style={styles.editorHint}>
            Yazmayı bıraktığında birkaç saniye içinde otomatik kaydedilir — gün özeti de olsa,
            boşalmak için de olsa kullanır. Sadece bu cihazda; kimse okumaz.
          </Text>
          <Text style={styles.editorEngine}>{MIND_DUMP_ENGINE_MICROCOPY}</Text>
          <TextInput
            style={[styles.editor, { minHeight: editorMinH }]}
            value={text}
            onChangeText={handleTextChange}
            placeholder="Aklına ne gelirse yaz. Kimse okumayacak. Yargılanmayacaksın."
            placeholderTextColor={Colors.textTertiary}
            multiline
            textAlignVertical="top"
            autoCorrect={false}
          />
        </View>

        {entries.length === 0 && !searchQuery.trim() && (
          <View style={styles.emptyPanel}>
            <View style={styles.emptyIconWrap}>
              <Sparkles size={22} color={Colors.primary} strokeWidth={1.8} />
            </View>
            <Text style={styles.emptyTitle}>Başlamak için bir cümle yeter</Text>
            <Text style={styles.emptyBody}>
              Stres, yoğun gün uyku öncesi veya kafanın fazla yüklendiği anlar için. Bir cümleyle başla;
              yazdıkça genelde daha hafif hissedilir.
            </Text>
            <Text style={styles.promptsLabel}>Bir başlangıç cümlesi seç (veya kendi cümleni yaz)</Text>
            <View style={styles.promptChips}>
              {WRITING_PROMPTS.map((p) => (
                <TouchableOpacity
                  key={p}
                  style={styles.promptChip}
                  onPress={() => appendPrompt(p)}
                  activeOpacity={0.85}
                >
                  <Text style={styles.promptChipText}>{p}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Past entries */}
        {filtered.length > 0 && (
          <View style={styles.historySection}>
            <Text style={styles.historyLabel}>
              Önceki notlar
              {!isPremium ? ` (${entries.length}/10)` : ""}
            </Text>
            <Text style={styles.historyHint}>
              Açmak için dokun. Silmek için satıra uzun bas, sonra çöp kutusuna dokun.
            </Text>
            {journeyMindCount > 0 ? (
              <TouchableOpacity
                style={[styles.filterChip, journeyOnly && styles.filterChipOn]}
                onPress={() => setJourneyOnly((v) => !v)}
                activeOpacity={0.85}
              >
                <Footprints size={14} color={journeyOnly ? Colors.primaryDark : Colors.textSecondary} strokeWidth={2} />
                <Text style={[styles.filterChipText, journeyOnly && styles.filterChipTextOn]}>
                  Sadece Yolculuk ({journeyMindCount})
                </Text>
              </TouchableOpacity>
            ) : null}
            {filtered.map((entry) => (
              <EntryRow
                key={entry.id}
                entry={entry}
                active={currentId === entry.id}
                onSelect={() => {
                  setText(entry.content);
                  setCurrentId(entry.id);
                }}
                onDelete={() => handleDelete(entry)}
              />
            ))}
          </View>
        )}

        {/* Free limit banner */}
        {!isPremium && entries.length >= 10 && (
          <TouchableOpacity
            style={styles.limitCard}
            onPress={() => setShowGate(true)}
          >
            <Lock size={18} color={Colors.coral} strokeWidth={1.5} />
            <Text style={styles.limitText}>
              {MIND_DUMP_FREE_LIMIT_EXPLAIN}
            </Text>
          </TouchableOpacity>
        )}

        {searchQuery.trim() && filtered.length === 0 && entries.length > 0 ? (
          <Text style={styles.searchEmpty}>“{searchQuery}” için sonuç yok.</Text>
        ) : null}
        {!searchQuery.trim() && journeyOnly && filtered.length === 0 && entries.length > 0 ? (
          <Text style={styles.searchEmpty}>
            Aradığın Yolculuk satırı yok; filtreyi kapatıp tüm notlara dönebilirsin.
          </Text>
        ) : null}

        <View style={{ height: Spacing.xl }} />
      </ScrollView>

      <PremiumGateModal
        visible={showGate}
        onClose={() => setShowGate(false)}
        trigger="minddump"
      />

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
    </SafeAreaView>
  );
}

// ─── Entry row with long-press swipe to reveal delete ─────────────────────

interface EntryRowProps {
  entry: MindDumpEntry;
  active: boolean;
  onSelect: () => void;
  onDelete: () => void;
}

function EntryRow({ entry, active, onSelect, onDelete }: EntryRowProps) {
  const translateX = useRef(new Animated.Value(0)).current;
  const [swiped, setSwiped] = useState(false);
  const fromJourney = isJourneyMindContent(entry.content);

  const handleSwipe = () => {
    const toValue = swiped ? 0 : -72;
    Animated.spring(translateX, {
      toValue, useNativeDriver: true, speed: 20, bounciness: 4,
    }).start();
    setSwiped(!swiped);
  };

  const previewBody = stripJourneyMindPrefix(entry.content);
  const preview = previewBody.slice(0, 60) + (previewBody.length > 60 ? "…" : "");
  const dateStr = format(new Date(entry.createdAt), "d MMM", { locale: tr });

  return (
    <View style={entryS.wrap}>
      {/* Revealed delete button */}
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
    right: 0, top: 0, bottom: 0,
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
  container: { flex: 1, backgroundColor: Colors.bg },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  headerLeft: {
    flex: 1,
    marginRight: Spacing.sm,
  },
  headerTitleBlock: {
    gap: 4,
  },
  headerTitle: {
    fontSize: FontSizes.xl,
    fontFamily: "Inter_500Medium",
    color: Colors.textPrimary,
  },
  headerSubtitle: {
    fontSize: FontSizes.sm,
    fontFamily: "Inter_400Regular",
    color: Colors.textTertiary,
    lineHeight: 18,
    marginTop: 2,
  },
  saveLabel: {
    fontSize: FontSizes.sm,
    fontFamily: "Inter_400Regular",
    color: Colors.textTertiary,
  },
  saveLabelBelow: {
    marginTop: 4,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    paddingTop: 2,
  },
  headerBtn: {
    width: 34, height: 34,
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
  },
  scroll: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
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
  },
  emptyPanel: {
    backgroundColor: Colors.primaryLight,
    borderRadius: Radii.card,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.lg,
    marginBottom: Spacing.xl,
    gap: Spacing.sm,
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
