/** Uygulama tek açık (light) renk kümesini kullanır. */

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
  bg: string;
  surface: string;
  border: string;
  borderStrong: string;
  textPrimary: string;
  textSecondary: string;
  textTertiary: string;
  success: string;
  error: string;
  overlay: string;
}

export const Colors: AppColors = {
  primary: "#1D9E75",
  primaryLight: "#E1F5EE",
  primaryDark: "#0F6E56",
  purple: "#534AB7",
  purpleLight: "#EEEDFE",
  coral: "#D85A30",
  coralLight: "#FAECE7",
  gold: "#D4A017",
  goldLight: "#FDF3D9",
  bg: "#FAFAF9",
  surface: "#FFFFFF",
  border: "rgba(0,0,0,0.08)",
  borderStrong: "rgba(0,0,0,0.14)",
  textPrimary: "#1A1A18",
  textSecondary: "#6B6B67",
  textTertiary: "#9E9E9A",
  success: "#1D9E75",
  error: "#D85A30",
  overlay: "rgba(0,0,0,0.5)",
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const Radii = {
  sm: 6,
  button: 8,
  card: 12,
  pill: 24,
  full: 9999,
} as const;

export const FontSizes = {
  xs: 11,
  sm: 13,
  md: 15,
  lg: 17,
  xl: 20,
  xxl: 24,
  xxxl: 30,
  hero: 38,
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
