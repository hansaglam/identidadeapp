/**
 * Behavior Operating System — orkestratör.
 *
 *   getUserState(data) → UserState
 *
 * Bu fonksiyon sistemin "beynidir":
 *  1. Status'ü hesaplar  (yeşil / sarı / kırmızı)
 *  2. Otomatikleşme skorunu çıkarır
 *  3. Tahmini günü hesaplar
 *  4. Toparlanma gerekiyor mu kontrol eder
 *  5. Mind dump sinyali var mı bakar
 *  6. Zayıf kasa göre tek aksiyon seçer
 *  7. İçgörü üretir
 */

import {
  UserBehaviorData,
  UserState,
  Action,
  MuscleInsight,
} from "./types";
import { calculateStatus } from "./status";
import { calculateAutomationScore } from "./automationScore";
import { calculatePredictionDays } from "./prediction";
import {
  isRecoveryMode,
  pickRecoveryAction,
  getRecoveryMessage,
} from "./recovery";
import { findWeakestMuscle, getInsights } from "./muscles";
import { pickAction } from "./actions";
import { analyzeRecentMindDumps } from "./mindDumpAnalyzer";

export function getUserState(data: UserBehaviorData): UserState {
  const status = calculateStatus(data);
  const automationScore = calculateAutomationScore(data);
  const predictionDays = calculatePredictionDays(data);
  const recovery = isRecoveryMode(status.consecutiveMisses);
  const weakMuscle = findWeakestMuscle(data.muscles);

  let suggestedAction: Action;
  let reason = status.reason;

  if (recovery) {
    suggestedAction = pickRecoveryAction();
    reason = getRecoveryMessage(status.consecutiveMisses, data.habitName);
  } else {
    const md = analyzeRecentMindDumps(data.mindDumps.slice(0, 5));
    if (md && md.matchedKeyword) {
      suggestedAction = md.suggestedAction;
      reason = `"${md.matchedKeyword}" yansıdı — ${suggestedAction.title}.`;
    } else {
      const recentIds = data.recentActions.slice(0, 3).map((a) => a.id);
      suggestedAction = pickAction(weakMuscle, recentIds);
    }
  }

  const insights: MuscleInsight[] = getInsights(data.muscles, null);

  return {
    status: status.status,
    automationScore,
    predictionDays,
    weakMuscle,
    suggestedAction,
    insights,
    recoveryMode: recovery,
    reason,
  };
}
