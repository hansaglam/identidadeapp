/**
 * Kaçırma anında suçluluk yaratmayan, bilimsel perspektifli mesajlar.
 * Lally çerçevesi: 66 gün bireyler arası değişir; kesinti = süreç, başarısızlık değil.
 */
import type { TFunction } from "i18next";

export type MissMessageType = "neutral" | "warning" | "reframe";

export interface MissMessage {
  title: string;
  body: string;
  action: string;
  type: MissMessageType;
  suggestResize?: boolean;
  suggestNewCue?: boolean;
}

/**
 * @param consecutiveMisses Dünden geriye, üst üste kaç gün atlandı (geçerli yol günlerinde)
 */
export function getMissedDayMessage(consecutiveMisses: number, t: TFunction): MissMessage {
  if (consecutiveMisses >= 3) {
    return {
      title: t("home.miss.day3.title"),
      body: t("home.miss.day3.body"),
      action: t("home.miss.day3.action"),
      type: "reframe",
      suggestNewCue: true,
    };
  }
  if (consecutiveMisses === 2) {
    return {
      title: t("home.miss.day2.title"),
      body: t("home.miss.day2.body"),
      action: t("home.miss.day2.action"),
      type: "warning",
      suggestResize: true,
    };
  }
  return {
    title: t("home.miss.day1.title"),
    body: t("home.miss.day1.body"),
    action: t("home.miss.day1.action"),
    type: "neutral",
  };
}
