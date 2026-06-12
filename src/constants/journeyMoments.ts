/** Turkish fallbacks when locale keys are missing. */
export const JOURNEY_MOMENT_BY_DAY: Record<number, string> = {
  1: "İlk gün: mükemmellik değil, başlangıç sayılır. Beyin bugün kayıt defterini açıyor — çıtayı yere indirmek en akıllı hamle.",
  23: "Faz 2 kapısı: tutarlılık baskınleşince kimlik tonu daha net duyulur.",
  45: "Faz 3: çoğu hareket hâlâ fark edilmez; yol artık senden geliyor gibi.",
};

export const JOURNEY_MOMENT_POOL: readonly string[] = [
  "Bugün küçük bir adım, yarınki seni güçlü tutar.",
  "Mükemmel gün şart değil — görünür gün yeterli.",
  "Duygu dalgalanır; sistem ve çapa kalır.",
  "Tek tekrar, zinciri koparmamak için bazen yeterlidir.",
  "Beyin bugün de kayıt tutuyor — küçük de olsa işaretle.",
  "Yavaş ilerlemek, durmaktan her zaman iyidir.",
  "Kendine şefkat, disiplinin karşıtı değil; yakıtıdır.",
  "Planlı başlangıç, rastgele motivasyondan daha güvenilir.",
  "Ortamı biraz düzenlemek, iradeyi yormadan kazandırır.",
  "Bugün 'nasıl hissediyorum?' değil, 'ne kadar küçük yapabilirim?' sorusu.",
  "Tutarlılık, yoğunluktan daha değerlidir.",
  "Eski alışkanlık hâlâ cazip olabilir — bu normal, yeni yol güçleniyor.",
  "Bir derin nefes + tek tekrar, günü kurtarabilir.",
  "Kimlik, büyük sözlerle değil; tekrar eden küçük hareketlerle inşa edilir.",
  "Kaçırma bir son değil; yarın için veri toplama anı.",
  "Stresli günlerde sürümü küçült — varlık önemli, mükemmellik değil.",
  "Çapa aynı kalsın; beyin deseni tanımak için süreklilik ister.",
  "Bugünkü sen, dünkü senden bir adım daha güçlü olabilir.",
  "Otomasyon sabırsızlık gerektirir — sıkıcılık ilerlemenin parçası.",
  "Kendini ölç, yargılama; veri ilerlemenin haritasıdır.",
  "Hedefe yaklaşırken tempo artabilir — nefesini ve ritmini koru.",
  "Tek cümlelik niyet, günün geri kalanını hafifletir.",
  "Bu yolculuk 66 gün değil; her gün yeniden seçilen bir alışkanlık.",
  "Bugün burada olman, zaten önemli bir kazanım.",
];

/** @deprecated Use getLocalizedJourneyMomentLine from localizeContent */
export function getJourneyMomentLine(dayNumber: number): string | null {
  if (JOURNEY_MOMENT_BY_DAY[dayNumber]) return JOURNEY_MOMENT_BY_DAY[dayNumber];
  if (JOURNEY_MOMENT_POOL.length === 0) return null;
  return JOURNEY_MOMENT_POOL[dayNumber % JOURNEY_MOMENT_POOL.length] ?? null;
}
