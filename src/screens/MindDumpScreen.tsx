import React, { useEffect, useRef, useState, useCallback } from "react";
import {
  View, Text, StyleSheet, TextInput, ScrollView,
  TouchableOpacity, Alert, Animated,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import { Search, X, Trash2, Lock } from "lucide-react-native";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { useMindDumpStore } from "../store/mindDumpStore";
import { useUserStore } from "../store/userStore";
import {
  Colors, Spacing, Radii, FontSizes,
} from "../constants/theme";
import { MainTabParamList, MindDumpEntry } from "../types";
import PremiumGateModal from "../components/PremiumGateModal";

type Props = BottomTabScreenProps<MainTabParamList, "MindDump">;

export default function MindDumpScreen(_: Props) {
  const { entries, load, createEntry, updateEntry, deleteEntry } = useMindDumpStore();
  const profile = useUserStore((s) => s.profile);
  const isPremium = profile?.isPremium ?? false;

  const [currentId, setCurrentId] = useState<string | null>(null);
  const [text, setText] = useState("");
  const [savingLabel, setSavingLabel] = useState<"" | "kaydediliyor..." | "kaydedildi">("");
  const [searchVisible, setSearchVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showGate, setShowGate] = useState(false);
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
    Alert.alert("Notu Sil", "Bu not kalıcı olarak silinecek.", [
      { text: "Vazgeç", style: "cancel" },
      {
        text: "Sil",
        style: "destructive",
        onPress: async () => {
          await deleteEntry(entry.id);
          if (currentId === entry.id) {
            setText(""); setCurrentId(null);
          }
        },
      },
    ]);
  };

  const toggleSearch = () => {
    const toValue = searchVisible ? 0 : 1;
    Animated.timing(searchAnim, { toValue, duration: 250, useNativeDriver: false }).start();
    setSearchVisible(!searchVisible);
    if (searchVisible) setSearchQuery("");
  };

  const filtered = searchQuery.trim()
    ? entries.filter((e) =>
        e.content.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : entries;

  const searchHeight = searchAnim.interpolate({
    inputRange: [0, 1], outputRange: [0, 52],
  });

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerTitle}>Zihin Boşalt</Text>
          {savingLabel ? (
            <Text style={styles.saveLabel}>{savingLabel}</Text>
          ) : null}
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
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Current-session editor */}
        <View style={styles.editorSection}>
          <Text style={styles.editorDate}>
            {format(new Date(), "d MMMM yyyy, EEEE", { locale: tr })}
          </Text>
          <TextInput
            style={styles.editor}
            value={text}
            onChangeText={handleTextChange}
            placeholder="Aklına ne gelirse yaz. Kimse okumayacak. Yargılanmayacaksın."
            placeholderTextColor={Colors.textTertiary}
            multiline
            textAlignVertical="top"
            autoCorrect={false}
          />
        </View>

        {/* Past entries */}
        {filtered.length > 0 && (
          <View style={styles.historySection}>
            <Text style={styles.historyLabel}>
              Önceki notlar
              {!isPremium ? ` (${entries.length}/10)` : ""}
            </Text>
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
              10 ücretsiz notun tamamlandı. Sınırsız yazmak için premium al.
            </Text>
          </TouchableOpacity>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      <PremiumGateModal
        visible={showGate}
        onClose={() => setShowGate(false)}
        trigger="minddump"
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

  const handleSwipe = () => {
    const toValue = swiped ? 0 : -72;
    Animated.spring(translateX, {
      toValue, useNativeDriver: true, speed: 20, bounciness: 4,
    }).start();
    setSwiped(!swiped);
  };

  const preview = entry.content.slice(0, 60) + (entry.content.length > 60 ? "…" : "");
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
          <Text style={entryS.rowDate}>{dateStr}</Text>
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
  rowDate: {
    fontSize: FontSizes.xs,
    fontFamily: "Inter_500Medium",
    color: Colors.textTertiary,
    marginBottom: 4,
    textTransform: "capitalize",
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
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: Spacing.sm,
  },
  headerTitle: {
    fontSize: FontSizes.xl,
    fontFamily: "Inter_500Medium",
    color: Colors.textPrimary,
  },
  saveLabel: {
    fontSize: FontSizes.sm,
    fontFamily: "Inter_400Regular",
    color: Colors.textTertiary,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
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
    flexGrow: 1,
  },
  editorSection: { marginBottom: Spacing.xl },
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
    minHeight: 220,
    lineHeight: 28,
    textAlignVertical: "top",
  },
  historySection: {},
  historyLabel: {
    fontSize: FontSizes.xs,
    fontFamily: "Inter_500Medium",
    color: Colors.textTertiary,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: Spacing.sm,
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
