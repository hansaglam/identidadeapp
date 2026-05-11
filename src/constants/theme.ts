/**
 * Görsel dil: sakin, premium (TIDE benzeri derinlik) + kimlik/disiplin markası.
 * Tek açık tema (light); tüm ekranlar Colors / Shadows / Radii üzerinden hizalanır.
 */

import { Platform, ViewStyle } from "react-native";

export interface AppColors {
  primary: string;
  primaryLight: string;
  primaryDark: string;
  purple: string;
  purpleLight: string;
  coral: string;
  coralLight: string;
  gold: string;
  goldLight: string;
  /** Ana ekran arka planı — hafif soğuk gri-mavi */
  bg: string;
  /** Kart / modal yüzeyi */
  surface: string;
  /** İkincil bloklar (satır arka planı, çok hafif vurgu) */
  surfaceMuted: string;
  border: string;
  borderStrong: string;
  textPrimary: string;
  textSecondary: string;
  textTertiary: string;
  success: string;
  error: string;
  overlay: string;
  /** Yumuşak nötr CTA arka planı (Tide-benzeri slate) */
  ink: string;
  inkMuted: string;
}

export const Colors: AppColors = {
  primary: "#2F9C86",
  primaryLight: "#E8F5F1",
  primaryDark: "#0F6B56",
  purple: "#5C5C9A",
  purpleLight: "#F0EFFC",
  coral: "#C86B5A",
  coralLight: "#F7EEEB",
  gold: "#B8892E",
  goldLight: "#F7F0E2",
  bg: "#F3F6F9",
  surface: "#FFFFFF",
  surfaceMuted: "#F6F8FB",
  border: "rgba(20, 32, 48, 0.06)",
  borderStrong: "rgba(20, 32, 48, 0.10)",
  textPrimary: "#1C2834",
  textSecondary: "#5D6773",
  textTertiary: "#909AA5",
  success: "#2F9C86",
  error: "#C86B5A",
  overlay: "rgba(12, 22, 32, 0.45)",
  ink: "#4A6678",
  inkMuted: "#6B8294",
};

/** Kart ve yüzen bölgeler — iOS gölge / Android elevation */
export const Shadows = {
  card: Platform.select<ViewStyle>({
    ios: {
      shadowColor: "#071018",
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.055,
      shadowRadius: 24,
    },
    android: { elevation: 4 },
    default: {},
  }),
  soft: Platform.select<ViewStyle>({
    ios: {
      shadowColor: "#071018",
      shadowOffset: { width: 0, height: 5 },
      shadowOpacity: 0.04,
      shadowRadius: 16,
    },
    android: { elevation: 2 },
    default: {},
  }),
} as const;

export const Spacing = {
  xs: 4,
  sm: 10,
  md: 16,
  lg: 28,
  xl: 36,
  xxl: 48,
} as const;

export const Radii = {
  sm: 8,
  button: 12,
  card: 16,
  pill: 26,
  full: 9999,
} as const;

export const FontSizes = {
  xs: 11,
  sm: 13,
  md: 15,
  lg: 18,
  xl: 21,
  xxl: 26,
  xxxl: 32,
  hero: 40,
} as const;

export const FontWeights = {
  regular: "400" as const,
  medium: "500" as const,
} as const;

// ─── Onboarding content ───────────────────────────────────────────────────

export const HABIT_PRESETS = [
  { id: "morning", label: "Sabah rutini", emoji: "🌅" },
  { id: "exercise", label: "Egzersiz", emoji: "💪" },
  { id: "reading", label: "Okuma", emoji: "📖" },
  { id: "meditation", label: "Meditasyon", emoji: "🧘" },
  { id: "water", label: "Su içmek", emoji: "💧" },
  { id: "custom", label: "Kendi belirle", emoji: "✏️" },
] as const;

export const ANCHOR_PRESETS = [
  "Kahvemi içtikten sonra",
  "Dişlerimi fırçaladıktan sonra",
  "Telefonu elimden bıraktıktan sonra",
  "Yatağa girmeden önce",
  "Öğle yemeğinden sonra",
  "Uyandıktan hemen sonra",
] as const;

export const TIME_RANGES = [
  { id: "sabah", label: "Sabah (06–12)" },
  { id: "ogle", label: "Öğlen (12–14)" },
  { id: "ogleden-sonra", label: "Öğleden sonra (14–18)" },
  { id: "aksam", label: "Akşam (18–21)" },
  { id: "gece", label: "Gece (21–00)" },
] as const;

// Coach notes and identity language live in identity-copy.ts
// Re-export for convenience so existing imports still work
export { getCoachNote } from "./identity-copy";

// ─── SDT questions ────────────────────────────────────────────────────────

export const SDT_QUESTIONS = [
  {
    id: "autonomy",
    label: "Özerklik",
    question: "Bu hafta alışkanlığını kendi isteğinle mi yaptın?",
    low: "Zorundaydım",
    high: "Tamamen isteyerek",
  },
  {
    id: "competence",
    label: "Yetkinlik",
    question: "Bu hafta alışkanlığında kendini yetkin hissettin mi?",
    low: "Hiç yetkin değil",
    high: "Çok yetkin",
  },
  {
    id: "relatedness",
    label: "İlişki",
    question: "Bu alışkanlık seni başkalarıyla bağlantılı hissettirdi mi?",
    low: "Hiç hissettirmedi",
    high: "Çok hissettirdi",
  },
] as const;

// ─── Journey phases ───────────────────────────────────────────────────────

import { IDENTITY_MESSAGES as _copy } from "./identity-copy";

export const JOURNEY_PHASES = [
  {
    id: 1,
    label: "Kuruluş",
    days: "Gün 1–22",
    startDay: 1,
    endDay: 22,
    subtitle: _copy.phaseDescriptions.phase1,
    color: Colors.primary,
    colorLight: Colors.primaryLight,
  },
  {
    id: 2,
    label: "Pekiştirme",
    days: "Gün 23–44",
    startDay: 23,
    endDay: 44,
    subtitle: _copy.phaseDescriptions.phase2,
    color: Colors.purple,
    colorLight: Colors.purpleLight,
  },
  {
    id: 3,
    label: "Otomatikleşme",
    days: "Gün 45–66",
    startDay: 45,
    endDay: 66,
    subtitle: _copy.phaseDescriptions.phase3,
    color: Colors.coral,
    colorLight: Colors.coralLight,
  },
] as const;
