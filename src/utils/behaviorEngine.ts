/**
 * Behavior Policy Engine — Kullanıcının davranışlarını yöneten merkezi sistem.
 *
 * Olay veya periyodik tarama → koşul → eylem.
 * AI değil, deterministik + test edilebilir kural motoru.
 *
 * Katmanlar:
 *  1. Sinyal toplama (check-in geçmişi, otomatiklik, geç kalma, mind dump)
 *  2. Kullanıcı durumu hesaplama (UserBehaviorState)
 *  3. Politika değerlendirmesi (hangi nudge, hangi mesaj, hangi akış)
 *  4. Çıktı (UI kart, push metni, widget satırı)
 */

import { format, subDays, parseISO, startOfDay, differenceInCalendarDays } from "date-fns";
import { CheckinRecord, MindDumpEntry } from "../types";

// ─── 1. Sinyal Tipleri ─────────────────────────────────────────────────────

export type UserPhase = "kurulus" | "pekistirme" | "otomatiklesme";
export type RiskLevel = "green" | "yellow" | "red";
export type NudgeType =
  | "proactive_intervention"   // düşüş öncesi müdahale
  | "micro_commitment"         // küçük adım teklifi
  | "identity_reinforcement"   // kimlik pekiştirme
  | "celebration"              // kutlama
  | "comeback"                 // geri dönüş
  | "milestone"                // kilometre taşı
  | null;

export interface UserBehaviorSignals {
  dayNumber: number;
  todayDone: boolean;
  last3AvgAuto: number | null;
  last7AvgAuto: number | null;
  consecutiveLateChecks: number;
  consecutiveMisses: number;
  totalCompletedDays: number;
  completionRate: number;
  currentStreak: number;
  lastCheckinHour: number | null;
  mindDumpCountLast7: number;
  latestAutoRating: number | null;
  latestEffortRating: number | null;
}

export interface UserBehaviorState {
  phase: UserPhase;
  riskLevel: RiskLevel;
  nudge: NudgeType;
  signals: UserBehaviorSignals;
}

export interface BehaviorNudge {
  type: NudgeType;
  priority: number;         // 1 = en yüksek
  headline: string;
  body: string;
  action?: {
    label: string;
    type: "five_second" | "checkin" | "minddump" | "dismiss";
  };
  tone: "warm" | "urgent" | "celebratory";
}

// ─── 2. Sinyal Toplama ─────────────────────────────────────────────────────

function getPhase(dayNumber: number): UserPhase {
  if (dayNumber <= 22) return "kurulus";
  if (dayNumber <= 44) return "pekistirme";
  return "otomatiklesme";
}

function avg(vals: number[]): number | null {
  if (vals.length === 0) return null;
  return vals.reduce((a, b) => a + b, 0) / vals.length;
}

function getLastNDaysAutoAvg(
  n: number,
  startDate: string,
  checkins: Record<string, CheckinRecord>
): number | null {
  const start = startOfDay(parseISO(startDate));
  const vals: number[] = [];
  for (let i = 1; i <= n; i++) {
    const d = startOfDay(subDays(new Date(), i));
    if (d < start) continue;
    const key = format(d, "yyyy-MM-dd");
    const c = checkins[key];
    if (c?.completed && c.automaticityRating != null) {
      vals.push(c.automaticityRating);
    }
  }
  return avg(vals);
}

function getConsecutiveLateChecks(
  startDate: string,
  checkins: Record<string, CheckinRecord>
): number {
  const LATE_HOUR = 20;
  const start = startOfDay(parseISO(startDate));
  let streak = 0;
  for (let i = 1; i <= 7; i++) {
    const d = startOfDay(subDays(new Date(), i));
    if (d < start) break;
    const key = format(d, "yyyy-MM-dd");
    const c = checkins[key];
    if (!c?.completed || !c.completedAt) break;
    const h = new Date(c.completedAt).getHours();
    if (h >= LATE_HOUR) streak++;
    else break;
  }
  return streak;
}

function getConsecutiveMisses(
  startDate: string,
  checkins: Record<string, CheckinRecord>
): number {
  const start = startOfDay(parseISO(startDate));
  let misses = 0;
  for (let i = 1; i <= 7; i++) {
    const d = startOfDay(subDays(new Date(), i));
    if (d < start) break;
    const key = format(d, "yyyy-MM-dd");
    const c = checkins[key];
    if (!c?.completed) misses++;
    else break;
  }
  return misses;
}

function getLastCheckinHour(
  checkins: Record<string, CheckinRecord>
): number | null {
  const yesterday = format(subDays(new Date(), 1), "yyyy-MM-dd");
  const c = checkins[yesterday];
  if (!c?.completed || !c.completedAt) return null;
  return new Date(c.completedAt).getHours();
}

function getMindDumpCountLast7(
  entries: MindDumpEntry[]
): number {
  const cutoff = subDays(new Date(), 7).getTime();
  return entries.filter((e) => new Date(e.createdAt).getTime() > cutoff).length;
}

function getLatestRatings(
  checkins: Record<string, CheckinRecord>
): { auto: number | null; effort: number | null } {
  const sorted = Object.values(checkins)
    .filter((c) => c.completed && c.automaticityRating != null)
    .sort((a, b) => b.date.localeCompare(a.date));
  if (sorted.length === 0) return { auto: null, effort: null };
  return {
    auto: sorted[0].automaticityRating ?? null,
    effort: sorted[0].effortRating ?? null,
  };
}

// ─── 3. Sinyal Hesaplama ────────────────────────────────────────────────────

export function collectSignals(
  dayNumber: number,
  startDate: string,
  checkins: Record<string, CheckinRecord>,
  mindDumps: MindDumpEntry[],
  todayDone: boolean,
  totalCompletedDays: number,
  completionRate: number,
  currentStreak: number
): UserBehaviorSignals {
  const latest = getLatestRatings(checkins);
  return {
    dayNumber,
    todayDone,
    last3AvgAuto: getLastNDaysAutoAvg(3, startDate, checkins),
    last7AvgAuto: getLastNDaysAutoAvg(7, startDate, checkins),
    consecutiveLateChecks: getConsecutiveLateChecks(startDate, checkins),
    consecutiveMisses: getConsecutiveMisses(startDate, checkins),
    totalCompletedDays,
    completionRate,
    currentStreak,
    lastCheckinHour: getLastCheckinHour(checkins),
    mindDumpCountLast7: getMindDumpCountLast7(mindDumps),
    latestAutoRating: latest.auto,
    latestEffortRating: latest.effort,
  };
}

// ─── 4. Risk Seviyesi ───────────────────────────────────────────────────────

function evaluateRiskLevel(s: UserBehaviorSignals): RiskLevel {
  // Kırmızı: düşüş öncesi müdahale gerekli
  if (
    s.last3AvgAuto != null && s.last3AvgAuto < 4 &&
    s.consecutiveLateChecks >= 2
  ) return "red";
  if (s.consecutiveMisses >= 2) return "red";

  // Sarı: riskli ama henüz kritik değil
  if (s.consecutiveMisses === 1) return "yellow";
  if (s.last3AvgAuto != null && s.last3AvgAuto < 5) return "yellow";
  if (s.consecutiveLateChecks >= 1) return "yellow";
  if (s.latestEffortRating != null && s.latestEffortRating >= 8) return "yellow";

  return "green";
}

// ─── 5. Nudge Seçimi ────────────────────────────────────────────────────────

function selectNudge(
  s: UserBehaviorSignals,
  risk: RiskLevel,
  phase: UserPhase
): NudgeType {
  // Bugün tamamlandıysa: kutlama veya kimlik
  if (s.todayDone) {
    if (s.dayNumber % 11 === 0 || s.currentStreak >= 7) return "celebration";
    if (phase === "pekistirme" || phase === "otomatiklesme") return "identity_reinforcement";
    return null;
  }

  // Kırmızı: proaktif müdahale
  if (risk === "red") return "proactive_intervention";

  // Geri dönüş: kaçırmışsa
  if (s.consecutiveMisses >= 1) return "comeback";

  // Sarı: mikro taahhüt
  if (risk === "yellow") return "micro_commitment";

  // Milestone günleri
  const milestones = [7, 14, 22, 30, 44, 66];
  if (milestones.includes(s.dayNumber)) return "milestone";

  return null;
}

// ─── 6. Ana Değerlendirme ───────────────────────────────────────────────────

export function evaluateBehavior(
  dayNumber: number,
  startDate: string,
  checkins: Record<string, CheckinRecord>,
  mindDumps: MindDumpEntry[],
  todayDone: boolean,
  totalCompletedDays: number,
  completionRate: number,
  currentStreak: number
): UserBehaviorState {
  const signals = collectSignals(
    dayNumber, startDate, checkins, mindDumps,
    todayDone, totalCompletedDays, completionRate, currentStreak
  );
  const phase = getPhase(dayNumber);
  const riskLevel = evaluateRiskLevel(signals);
  const nudge = selectNudge(signals, riskLevel, phase);
  return { phase, riskLevel, nudge, signals };
}

// ─── 7. Nudge → UI Çıktısı ─────────────────────────────────────────────────

const PHASE_LABELS: Record<UserPhase, string> = {
  kurulus: "Kuruluş",
  pekistirme: "Pekiştirme",
  otomatiklesme: "Otomatikleşme",
};

export function buildNudge(
  state: UserBehaviorState,
  habitName: string
): BehaviorNudge | null {
  const { nudge, signals, phase } = state;
  const h = habitName || "alışkanlığını";

  switch (nudge) {
    case "proactive_intervention":
      return {
        type: nudge,
        priority: 1,
        headline: "Bugün riskli bir gün görünüyor.",
        body: `Otomatiklik puanın düşüyor ve geç saatlere kayıyorsun. 5 saniye antrenmanı hazır — başlatıyorum.`,
        action: { label: "5 sn Antrenman", type: "five_second" },
        tone: "urgent",
      };

    case "comeback":
      return {
        type: nudge,
        priority: 2,
        headline: "Dün yok. Bugün var.",
        body: signals.consecutiveMisses === 1
          ? `1 gün kaçırmak süreci durdurmaz. Bugün ${h} için en küçük adımı at.`
          : `${signals.consecutiveMisses} gün oldu. Mükemmellik değil, tutarlılık. Şimdi sadece başla.`,
        action: { label: "Bugünü Yap", type: "checkin" },
        tone: "warm",
      };

    case "micro_commitment":
      return {
        type: nudge,
        priority: 3,
        headline: "Bugünkü adımını küçült.",
        body: `${h} için 2 dakikalık versiyonu yeterli. Başlamak bitirmekten önemli.`,
        action: { label: "Küçük Adım", type: "checkin" },
        tone: "warm",
      };

    case "identity_reinforcement":
      return {
        type: nudge,
        priority: 5,
        headline: `${PHASE_LABELS[phase]} fazındasın.`,
        body: phase === "otomatiklesme"
          ? `Artık ${h} düşünmeden yapılıyor. Bu senin kim olduğunun parçası.`
          : `"${h} yapan biri" olmaktan "${h} olan biri"ye dönüşüyorsun.`,
        tone: "celebratory",
      };

    case "celebration":
      return {
        type: nudge,
        priority: 4,
        headline: "Bu anı fark et.",
        body: signals.currentStreak >= 7
          ? `${signals.currentStreak} gün üst üste. Disiplin kası güçleniyor.`
          : `Gün ${signals.dayNumber} tamamlandı. Her gün bir oy daha.`,
        tone: "celebratory",
      };

    case "milestone":
      return {
        type: nudge,
        priority: 2,
        headline: `Gün ${signals.dayNumber} — Kilometre taşı.`,
        body: getMilestoneBody(signals.dayNumber, h),
        tone: "celebratory",
      };

    default:
      return null;
  }
}

function getMilestoneBody(day: number, habit: string): string {
  switch (day) {
    case 7: return "İlk hafta geride kaldı. Beyin yeni bir yol açmaya başlıyor.";
    case 14: return "İki hafta. Nöral bağlantılar şekilleniyor — fark etmesen bile.";
    case 22: return "Kuruluş fazı tamamlandı. Buraya kadar gelenler genellikle bitirenler.";
    case 30: return `30 gün. Artık "${habit} yapıyor musun?" değil, "${habit} olan biri misin?" sorusu.`;
    case 44: return "Pekiştirme fazı bitti. Artık seçmiyorsun — yapıyorsun.";
    case 66: return "66 gün. Bu artık sende — kimse alamaz.";
    default: return `Gün ${day} tamamlandı.`;
  }
}

// ─── 8. Push / Bildirim Metni ───────────────────────────────────────────────

export function getNotificationCopy(
  state: UserBehaviorState,
  habitName: string
): { title: string; body: string } {
  const { riskLevel, nudge, signals } = state;
  const h = habitName || "alışkanlığın";

  if (nudge === "proactive_intervention") {
    return {
      title: "Bugünkü otomatiklik riskin: Yüksek.",
      body: "5 saniye antrenmanı hazır. Başlat?",
    };
  }
  if (nudge === "comeback") {
    return {
      title: "Dün yok. Bugün var.",
      body: `${h} için 2 dakika yeter. Mükemmellik değil, tutarlılık.`,
    };
  }
  if (riskLevel === "yellow") {
    return {
      title: `Bugün ${h} için riskli görünüyor.`,
      body: "Küçült ama bırakma. 1 dakika bile sayılır.",
    };
  }

  // Varsayılan (yeşil / normal gün)
  return {
    title: `Gün ${signals.dayNumber} seni bekliyor.`,
    body: `Bugün de ${h.toLowerCase()} sahibi gibi davranma zamanı.`,
  };
}

// ─── 9. Widget / Surface Durumu ─────────────────────────────────────────────

export type SurfaceStatus = "on_track" | "at_risk" | "needs_intervention";

export function getSurfaceStatus(risk: RiskLevel): SurfaceStatus {
  if (risk === "red") return "needs_intervention";
  if (risk === "yellow") return "at_risk";
  return "on_track";
}

export const SURFACE_EMOJI: Record<SurfaceStatus, string> = {
  on_track: "🟢",
  at_risk: "🟡",
  needs_intervention: "🔴",
};

export const SURFACE_LABEL: Record<SurfaceStatus, string> = {
  on_track: "Yoldasın",
  at_risk: "Riskli",
  needs_intervention: "Müdahale Gerekli",
};
