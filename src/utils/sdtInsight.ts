import type { SDTScore } from "../types";

export interface SdtInsight {
  summary: string;
  tip: string;
}

export function buildSdtInsight(score: SDTScore, habitName: string): SdtInsight {
  const h = habitName.trim() || "alışkanlığın";
  const { autonomy, competence, relatedness } = score;

  const avg = (autonomy + competence + relatedness) / 3;

  if (avg >= 4) {
    return {
      summary: `${h} bu hafta içsel motivasyonla uyumlu görünüyor. Özerklik, yetkinlik ve bağ hissi güçlü.`,
      tip: "Aynı tempoda devam et; hedefi büyütmeden sıklığı koru.",
    };
  }

  if (autonomy <= 2) {
    return {
      summary: `Özerklik düşük: ${h} bazen “yapmalıyım” gibi hissedilmiş olabilir.`,
      tip: "Küçük seçim alanı aç — ne zaman, nerede, hangi 2 dk sürümü sen seç.",
    };
  }

  if (competence <= 2) {
    return {
      summary: `Yetkinlik düşük: ${h} sana zor veya belirsiz gelmiş olabilir.`,
      tip: "Hedefi bir seviye küçült; “yaptım” hissini 10 saniyede yakala.",
    };
  }

  if (relatedness <= 2) {
    return {
      summary: `Bağlanma düşük: ${h} yalnız bir çaba gibi duruyor olabilir.`,
      tip: "Birine tek cümleyle söyle veya sessiz ortak ritim (aynı saat, aynı mekan) dene.",
    };
  }

  if (autonomy >= 4 && competence < 3) {
    return {
      summary: `İstek var ama beceri hissi zayıf — ${h} için “nasıl” netleştir.`,
      tip: "Çapayı ve ilk 2 dk adımı yaz; motor sana küçük adım önerecek.",
    };
  }

  return {
    summary: `Bu hafta ${h} orta bantta: küçük düzenlemelerle sürdürülebilirlik artar.`,
    tip: "Bugün kartındaki tek adımı tamamla; haftaya tekrar bak.",
  };
}
