/**
 * Behavior Operating System — merkezi tipler.
 *
 * Bu bir habit tracker değil; bir davranış işletim sistemi.
 * Sistem kullanıcı durumunu okur, ne yapılacağına karar verir,
 * eylem üretir ve düşüş anında geri çeker.
 */

import { CheckinRecord, MindDumpEntry } from "../types";

export type Status = "green" | "yellow" | "red";

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
  dayNumber: number;
  checkins: Record<string, CheckinRecord>;
  mindDumps: MindDumpEntry[];
  todayDone: boolean;
  muscles: Muscles;
  recentActions: RecentAction[];
  lastActionAt: string | null;
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
  /** Sistemin neden bu kararı verdiğini açıklayan tek cümle */
  reason: string;
}

export interface WidgetData {
  status: Status;
  statusLabel: string;
  statusEmoji: string;
  automationScore: number;
  predictionDays: number;
  suggestedAction: { id: string; title: string; duration: number };
}
