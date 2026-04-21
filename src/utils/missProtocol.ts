/**
 * Kaçırma anında suçluluk yaratmayan, bilimsel perspektifli mesajlar.
 * Lally çerçevesi: 66 gün bireyler arası değişir; kesinti = süreç, başarısızlık değil.
 */
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
export function getMissedDayMessage(consecutiveMisses: number): MissMessage {
  if (consecutiveMisses >= 3) {
    return {
      title: "Yeniden bağlama",
      body: "Birkaç gün koptun — bu, beynin yolu unuttuğu anlamına gelmez. Lally’nin eğrisi bireyler arası çok açılır: küçül, tetik/çapayı tazele, bir kez başla.",
      action: "Yeni çapayı düşün",
      type: "reframe",
      suggestNewCue: true,
    };
  }
  if (consecutiveMisses === 2) {
    return {
      title: "Küçültme zamanı",
      body: "Arka arkaya iki gün atlanması, büyütülmüş hedefe işaret ediyor. Davranışı 2 dakikaya indirip aynı çapayı korumak, sürekliliği geri yükler.",
      action: "Hedefi küçült",
      type: "warning",
      suggestResize: true,
    };
  }
  return {
    title: "Süreç devam ediyor",
    body: "1 gün kaçırmak, 66 günlük yolun yaklaşık %1,5’u. Nöral yol açık, bir sonraki tekrar yolu yeniden oynatır.",
    action: "Bugünkü tekrar",
    type: "neutral",
  };
}
