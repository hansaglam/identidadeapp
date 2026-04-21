/**
 * Toparlanma (Recovery) sistemi — KRİTİK.
 *
 * Kullanıcı kaçırırsa:
 *  - Streak sıfırlanmaz
 *  - Suçluluk üretilmez
 *  - Sistem en küçük aksiyonu önerir
 *
 * Mantra: "Cezalandırmıyoruz. Kopmaya da izin vermiyoruz."
 */

import { Action } from "./types";
import { ACTIONS_BY_TYPE } from "./actions";

export function isRecoveryMode(consecutiveMisses: number): boolean {
  return consecutiveMisses >= 1;
}

export function pickRecoveryAction(): Action {
  const recovery = ACTIONS_BY_TYPE.recovery;
  return recovery.find((a) => a.id === "soft-restart") ?? recovery[0]!;
}

export function getRecoveryMessage(misses: number, habitName: string): string {
  const safe = habitName.trim() || "bu davranış";
  if (misses >= 3) {
    return `${misses} gün boşluk. Cezalandırmıyoruz. Yeniden başlıyoruz: tek adım.`;
  }
  if (misses === 2) {
    return `2 gün kaçtı. Sistem seni bırakmıyor — şimdi sadece ayağa kalk.`;
  }
  return `Dün kaçtı. Sıfırdan değil, kaldığın yerden: ${safe} için tek adım.`;
}
