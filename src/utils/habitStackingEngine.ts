import type { DisciplineMuscles } from "../types/discipline";
import { MUSCLE_NAMES } from "../types/discipline";

export type DisciplineMuscleKey = keyof DisciplineMuscles;

export type TinyHabitSuggestion = {
  habitTitle: string;
  habitAnchor: string;
  targetMuscle: DisciplineMuscleKey;
  reason: string;
};

const TINY_BY_MUSCLE: Record<DisciplineMuscleKey, TinyHabitSuggestion[]> = {
  karar: [
    {
      habitTitle: "Tek seçim pratiği",
      habitAnchor: "Her sabah ilk iş olarak 2 dk tek bir mini seçim yazıp uygula.",
      targetMuscle: "karar",
      reason: "Karar anlık kası için düşük sürtünmeli tekrar.",
    },
    {
      habitTitle: "Telefon öncesi nefes",
      habitAnchor: "Telefona uzanmadan önce 3 derin nefes — sonra tek görev seç.",
      targetMuscle: "karar",
      reason: "Dürtü ile karar arasına mesafe koymak.",
    },
    {
      habitTitle: "Akşam hazırlığı",
      habitAnchor: "Yatmadan önce ertesi gün için tek madde seç (kıyafet veya çanta).",
      targetMuscle: "karar",
      reason: "Ertesi günün ilk kararını hafifletmek için.",
    },
  ],
  direnc: [
    {
      habitTitle: "Beş şınav veya squat",
      habitAnchor: "Yatağa girmeden önce 5 tekrar — say ve bitir.",
      targetMuscle: "direnc",
      reason: "Direnç kası: küçük fiziksel ‘hayır değil, başla’ pratiği.",
    },
    {
      habitTitle: "İlk 5 dakika",
      habitAnchor: "Kaçındığın işte sadece 5 dakika otur; süre dolduğunda durmaya izin var.",
      targetMuscle: "direnc",
      reason: "Başlamak için süre kutusu — baskıyı düşürür.",
    },
    {
      habitTitle: "Bir tabak / bir mail",
      habitAnchor: "Evi bırakmadan önce masada veya masada tek tabak/kupa topla veya tek maili cevapla.",
      targetMuscle: "direnc",
      reason: "Mikro tamamlama ile direnç eşiğini alçaltmak.",
    },
  ],
  baglam: [
    {
      habitTitle: "Bağlam değiştirici çift",
      habitAnchor: "Haftada bir kez aynı alışkanlığı ‘farklı yerde’ yap (salon yerine balkon).",
      targetMuscle: "baglam",
      reason: "Bağlam kası: tetikleyiciyi çeşitlendirmek.",
    },
    {
      habitTitle: "Dışarı çıkış tetikleyicisi",
      habitAnchor: "Ayakkabıyı çıkarır çıkmaz 2 dk dışarı adım.",
      targetMuscle: "baglam",
      reason: "Ev dışı mini ritim oturtmak.",
    },
  ],
  energi: [
    {
      habitTitle: "Düşük enerji sürümü",
      habitAnchor: "Yorgun hissettiğinde ‘mini sürüm’ü yap (normalin %50’si süre veya yoğunluk).",
      targetMuscle: "energi",
      reason: "Düşük enerji kası: koşul değişince de devam edebilmek.",
    },
    {
      habitTitle: "Işık ve su",
      habitAnchor: "Uyanınca perdeleri aç + yarım bardak su — sonra ana alışkanlık.",
      targetMuscle: "energi",
      reason: "Enerji zeminini hafifçe yükseltmek.",
    },
  ],
  sosyal: [
    {
      habitTitle: "Paylaşımlı küçük taahhüt",
      habitAnchor: "Bir kişiye sözlü ‘bugün X’i 5 dk yapacağım’ de — karşılık bekleme.",
      targetMuscle: "sosyal",
      reason: "Sosyal hesap verebilirlik — hafif baskı, toksik değil.",
    },
    {
      habitTitle: "Gürültüde tek tur",
      habitAnchor: "Kalabalık / ofiste 3 dk telefonu çekmeceye koyup tek görev.",
      targetMuscle: "sosyal",
      reason: "Sosyal çevredeki dikkat dağıtıcıları tolere etmek.",
    },
  ],
};

function weakestMuscle(muscles: DisciplineMuscles): DisciplineMuscleKey {
  const entries = Object.entries(muscles) as [DisciplineMuscleKey, number][];
  entries.sort((a, b) => a[1] - b[1]);
  return entries[0]![0];
}

function pickUnique(
  weakest: DisciplineMuscleKey,
  completedName: string
): TinyHabitSuggestion[] {
  const pool = TINY_BY_MUSCLE[weakest];
  const first = pool[0]!;
  const altMuscles = (Object.keys(TINY_BY_MUSCLE) as DisciplineMuscleKey[]).filter(
    (k) => k !== weakest
  );
  const secondMuscle = altMuscles[0]!;
  const thirdMuscle = altMuscles[1] ?? altMuscles[0]!;
  const second = TINY_BY_MUSCLE[secondMuscle][0]!;
  const third = TINY_BY_MUSCLE[thirdMuscle][1] ?? TINY_BY_MUSCLE[thirdMuscle][0]!;

  const withReason = (t: TinyHabitSuggestion, focus: DisciplineMuscleKey): TinyHabitSuggestion => ({
    ...t,
    reason: `${completedName} yolculuğun ${MUSCLE_NAMES[focus]} kasını güçlendirdi. Sırada: ${MUSCLE_NAMES[t.targetMuscle]} için mini bir katman.`,
  });

  return [
    withReason({ ...first }, weakest),
    withReason({ ...second }, weakest),
    withReason({ ...third }, weakest),
  ];
}

/**
 * 66. gün sonrası: en zayıf kasa odaklı 3 tiny habit + aynı meta dil.
 */
export function suggestStackedHabits(
  completedHabitName: string,
  muscles: DisciplineMuscles
): {
  weakest: DisciplineMuscleKey;
  suggestions: TinyHabitSuggestion[];
  headlineReason: string;
} {
  const weakest = weakestMuscle(muscles);
  const suggestions = pickUnique(weakest, completedHabitName.trim() || "Bu alışkanlık");
  const headlineReason = `Şu an en çok gelişime açık kasın: ${MUSCLE_NAMES[weakest]}. Üzerine kurulacak yeni küçük alışkanlık, bunu hedefleyebilir.`;

  return { weakest, suggestions, headlineReason };
}
