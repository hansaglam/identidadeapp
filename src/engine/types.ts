/**
 * Behavior Operating System — merkezi tipler.
 *
 * Bu bir habit tracker değil; bir davranış işletim sistemi.
 * Sistem kullanıcı durumunu okur, ne yapılacağına karar verir,
 * eylem üretir ve düşüş anında geri çeker.
 */

import { CheckinRecord, MindDumpEntry } from "../types";

export type Status = "green" | "yellow" | "red";

/** Kararın ana gerekçesi (UI / açıklama / analitik). */
export type DecisionTrigger =
  | "recovery"
  | "effort"
  | "mind_dump"
  | "normal"
  /** Son günlerdeki check-in eğilimi belirgin */
  | "trend"
  /** Yolculuğun ilk günleri — küçük adım önceliği */
  | "cold_start";

export type ActionIntensity = "low" | "medium" | "high";

export type UiMode = "normal" | "focus" | "interrupt";

export interface DecisionMeta {
  trigger: DecisionTrigger;
  /** Karar açıklaması için sinyal gücü (0–1, sabit kategorilere göre). */
  confidence: number;
}

export type MuscleType =
  | "activation"     // başlatma
  | "consistency"    // tekrar
  | "resistance"     // direnci kırma
  | "focus"          // odak
  | "recovery";      // toparlanma

export interface Action {
  id: string;
  title: string;
  type: MuscleType;
  /** Aksiyon süresi: 3–15 saniye (sıfır düşünme) */
  duration: number;
  /** Geri sayım süresi (varsayılan 3) */
  countdown?: number;
  /** 1–5: ne kadar “önemli” (seçim motoru için) */
  priority: number;
  /** Aksiyonun fiziksel/duygusal yükü (UI + ileride skor) */
  intensity: ActionIntensity;
  /** Kesinti / zorunlu yönlendirme için ayrılmış net aksiyon */
  isInterrupt?: boolean;
}

export interface Muscles {
  activation: number;
  consistency: number;
  resistance: number;
  focus: number;
  recovery: number;
}

export type MuscleTrend = "improving" | "stable" | "weak";

export interface MuscleInsight {
  muscle: MuscleType;
  trend: MuscleTrend;
  message: string;
}

export interface RecentAction {
  id: string;
  type: MuscleType;
  at: string; // ISO
}

export interface UserBehaviorData {
  startDate: string;
  habitName: string;
  /** Onboarding çapası — aksiyon seçimini bağlama göre yönlendirir */
  habitAnchor?: string;
  dayNumber: number;
  checkins: Record<string, CheckinRecord>;
  mindDumps: MindDumpEntry[];
  todayDone: boolean;
  muscles: Muscles;
  recentActions: RecentAction[];
  lastActionAt: string | null;
  /**
   * Kullanıcının seçtiği kimlik şablonu id'si.
   * null = şablonsuz (custom habit).
   */
  identityTagId: string | null;
  /** Ev / iş / seyahat — seçilen bağlam satırında gösterilir */
  contextPreset?: "home" | "work" | "travel" | null;
}

export interface UserState {
  status: Status;
  /** 0–100; otomatikleşme yüzdesi */
  automationScore: number;
  /** Bugünden itibaren tahmini gün */
  predictionDays: number;
  weakMuscle: MuscleType;
  suggestedAction: Action;
  insights: MuscleInsight[];
  recoveryMode: boolean;
  /** Aksiyon effort scaling (şablondan) ile küçültüldü mü? */
  scaledDown: boolean;
  /** Seçilen kimlik şablonu id'si (varsa) */
  identityTagId: string | null;
  /** Varsa şablonun o güne uygun faz odağı metni */
  phaseFocus: string | null;
  /** Sistemin neden bu kararı verdiğini açıklayan tek cümle */
  reason: string;
  /**
   * true → aksiyon zorunlu kabul edilir (kırmızı durum + düşen momentum).
   * UI bunu "atlanamaz" olarak sunabilir.
   */
  forcedAction?: boolean;
  /** Neden bu karar verildi + güven sinyali. */
  decisionMeta: DecisionMeta;
  /** Aksiyonun UI’de ne kadar “sert” sunulacağı. */
  actionIntensity: ActionIntensity;
  /** Ekran yoğunluğu / mod (normal odak, sarı vurgu, kesinti). */
  uiMode: UiMode;
  /** Bağlam seçimi (profil) — ek açıklayıcı satır */
  situationCue?: string | null;
}

export interface WidgetData {
  status: Status;
  statusLabel: string;
  statusEmoji: string;
  automationScore: number;
  predictionDays: number;
  suggestedAction: { id: string; title: string; duration: number };
}
