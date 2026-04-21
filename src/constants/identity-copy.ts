/**
 * All user-facing identity language lives here.
 * Copy is the product — change with intention.
 */

export const IDENTITY_MESSAGES = {
  checkInComplete: (habitName: string, day: number) => [
    `Bugün bir ${habitName} ustası gibi davrandın. ${day}. gün.`,
    `${day} gündür kendine söz veriyorsun ve tutuyorsun.`,
    `Bu artık bir alışkanlık değil. Bu artık sen.`,
    `${day}. gün. Her gün daha az çaba, daha çok sen.`,
  ],

  morningGreeting: (day: number) => [
    `Gün ${day}. Beynin değişiyor.`,
    `${day}. gün. Dün kim olduğundan biraz daha ileri.`,
    `Gün ${day} — küçük adım, büyük dönüşüm.`,
  ],

  coachNotes: {
    day7: "İlk hafta geride kaldı. Çapa yerine oturdu — şimdi kolaylaşıyor.",
    day14: "İki hafta. Beyinde yeni bağlantılar şekilleniyor. Fark etmesen bile.",
    day22: "Kritik nokta. Buraya kadar gelenler genellikle bitirenler oluyor.",
    day30: "30 gün. Artık 'yapıyor musun?' sorusu değil, 'kim oluyorsun?' sorusu geçerli.",
    day44: "Faz 2 bitti. Artık seçmiyorsun — yapıyorsun.",
    day66: "66 gün. Bu artık sende — kimse alamaz.",
  } as Record<string, string>,

  phaseDescriptions: {
    phase1: "Tiny Habits devreye giriyor. Çapayı kur, küçük kal.",
    phase2: "Kimlik dönüşümü başlıyor. 'Yapan biri' olmaktan 'olan biri' olmaya.",
    phase3: "Nöral yol tamamlanıyor. Artık enerji harcamadan yapıyorsun.",
  },

  /** Shown when streak resets (no penalty, no red). */
  streakReset: "Dün yok. Bugün var. Devam.",

  /** Shown in UI when rescue day has been used this week. */
  rescueUsed: "Bu haftaki kurtarma gününü kullandın.",

  /** Shown in UI when rescue day is still available. */
  rescueAvailable: "Hâlâ bu haftaki kurtarma gününü kullanabilirsin.",

  /**
   * Günlük disiplin ilkeleri — her fazda döngüsel olarak gösterilir.
   * Faz 1: Davranışı küçültme, çapa kurma, başlamayı kolaylaştırma.
   * Faz 2: Süreklilik > yoğunluk, kimlik dili, esneklik.
   * Faz 3: Otomatiklik farkındalığı, kimlik pekiştirme, sahiplenme.
   */
  dailyPrinciples: {
    phase1: [
      "Bugün alışkanlığını 2 dakikaya indir. Sadece yapılabilir olması önemli.",
      "Mükemmel yapmak değil, başlamak. Çıtayı yere koy.",
      "Çapanı hatırla: onu yaptıktan sonra alışkanlık otomatik gelecek.",
      "Beynin yeniliğe direnir. Küçüklük direnci kırar.",
      "Bugün tek hedefin: alışkanlığı hatırlamak. O kadar.",
      "Motivasyon gelip geçer. Sistem kalır. Sisteme güven.",
      "Dün yapmadıysan önemli değil. Bugün yeniden başla.",
      "Alışkanlığı yapmadan önce 'Ben bunu yapan biriyim' de.",
      "Zorlanıyorsan küçült. 1 sayfa, 1 mekik, 1 yudum su.",
      "Mükemmeliyetçilik düşmanın. 'Yeterince iyi' şu an en iyi.",
      "Bugün çapanı fark ettiğin an, alışkanlığı başlat. Düşünme.",
      "Her başlangıç bir oy. Bugün 'yapan biri' için oy kullan.",
      "Beynin 21 günde yeni bir yol açmaya başlar. Sabır.",
      "Küçük adım atmak, büyük adım hayal etmekten üstündür.",
      "Bu ilk fazda amaç: alışkanlığı hayatına yerleştirmek.",
    ],
    phase2: [
      "Motivasyonun %50 ise, alışkanlığı %50 küçült. Devamlılık > yoğunluk.",
      "Artık 'yapıyor musun' değil, 'kim oluyorsun' sorusu önemli.",
      "Bugün sıkıldıysan normal. Sıkıcı olan tutarlı olandır.",
      "Zorlandığın günler, kolay günlerden daha değerli. Bugün o gün.",
      "Kimliğin eylemlerin toplamı. Bugün bir eylem daha ekle.",
      "Alışkanlığı sevmek zorunda değilsin. Saygı duyman yeterli.",
      "Bazen sadece göstermek yeterli. Tam yapmasan bile başla.",
      "'Bugün geçersem bir şey olmaz' diye düşünüyorsan — o an kritik an.",
      "Tutarlılık kaslara benzer. Her tekrar onu güçlendirir.",
      "Pekiştirme fazındasın. Beynin artık bunu tanıyor. Devam et.",
      "Kötü bir gün geçiriyorsan, alışkanlığı minimuma indir ama bırakma.",
      "İlerlemeyi hissetmiyorsan bile nöronların çalışıyor. Bilim böyle diyor.",
      "Bugün kendine sor: Bunu yapan biri ne yapar? Sonra onu yap.",
      "Yoğunluk değil, frekans. Her gün az > haftada bir çok.",
      "Bu fazda en büyük risk: 'Artık öğrendim, geçebilirim' yanılgısı.",
    ],
    phase3: [
      "Bugün alışkanlığı düşünmeden yaptın mı? Evetse, bu artık senin kimliğin.",
      "Otomatikleşme: beynin artık enerji harcamadan yapıyor. Farkında ol.",
      "Artık alışkanlığı 'yapan biri' değilsin. 'Olan biri'sin.",
      "Bugün alışkanlığını atlasan ne hissedersin? Eksiklik hissi = otomatiklik.",
      "Son düzlük. 66. güne kadar her gün bir tuğla daha.",
      "Bu alışkanlık artık sana ait. Kimse alamaz.",
      "Otopilotta olman güzel. Ama bugün bir an farkında yap.",
      "Nöral yolun neredeyse tamamlandı. Her gün onu kalınlaştırıyorsun.",
      "Artık 'neden yapıyorum?' sorusu yok. 'Ben buyum' var.",
      "66 günün sonuna yaklaşıyorsun. Ama bu son değil — başlangıç.",
      "Bugün alışkanlığını birine anlat. Sahiplen. Kimliğini dışa vur.",
      "Otomatik olan şeyler seni tanımlar. Bu alışkanlık artık seni tanımlıyor.",
      "Son fazda disiplin değil, farkındalık önemli. Ne olduğunu gör.",
      "67. günde de yapacaksın. Çünkü artık sen busun.",
      "Beynin bu yolu artık varsayılan olarak kullanıyor. Tebrikler.",
    ],
  },

  /** 5 Saniye Kuralı (Mel Robbins) — geri sayım sonrası aksiyon komutları */
  fiveSecondActions: [
    "Şimdi ayağa kalk.",
    "Şimdi kitabı eline al.",
    "Şimdi su bardağını doldur.",
    "Şimdi ayakkabılarını giy.",
    "Şimdi telefonu bırak.",
    "Şimdi masana otur.",
    "Şimdi o ilk adımı at.",
    "Şimdi başla. Düşünme.",
    "Şimdi nefes al ve harekete geç.",
    "Şimdi o tek şeyi yap.",
  ],
};

/**
 * Returns the daily discipline principle for the current day's phase.
 * Principles cycle within each phase (15 per phase, repeating).
 */
export function getDailyPrinciple(dayNumber: number): { principle: string; phaseId: number } | null {
  const { dailyPrinciples } = IDENTITY_MESSAGES;
  let pool: string[];
  let phaseId: number;
  let dayInPhase: number;

  if (dayNumber >= 1 && dayNumber <= 22) {
    pool = dailyPrinciples.phase1;
    phaseId = 1;
    dayInPhase = dayNumber - 1;
  } else if (dayNumber >= 23 && dayNumber <= 44) {
    pool = dailyPrinciples.phase2;
    phaseId = 2;
    dayInPhase = dayNumber - 23;
  } else if (dayNumber >= 45 && dayNumber <= 66) {
    pool = dailyPrinciples.phase3;
    phaseId = 3;
    dayInPhase = dayNumber - 45;
  } else {
    return null;
  }

  return { principle: pool[dayInPhase % pool.length], phaseId };
}

/**
 * Returns a pseudo-random action prompt for the 5 Second Rule countdown.
 */
export function getFiveSecondAction(dayNumber: number): string {
  const actions = IDENTITY_MESSAGES.fiveSecondActions;
  return actions[dayNumber % actions.length];
}

/**
 * Returns the coach note for the nearest milestone day.
 * Returns null if no note applies yet.
 */
export function getCoachNote(dayNumber: number): string | null {
  const milestones = [7, 14, 22, 30, 44, 66];
  const notes = IDENTITY_MESSAGES.coachNotes;

  // Exact match first
  const exactKey = `day${dayNumber}`;
  if (notes[exactKey]) return notes[exactKey];

  // Show the most recent milestone's note for a window of days after it
  const WINDOW = 3; // show milestone note for N days after it
  for (let i = milestones.length - 1; i >= 0; i--) {
    const m = milestones[i];
    if (dayNumber > m && dayNumber <= m + WINDOW) {
      return notes[`day${m}`] ?? null;
    }
  }
  return null;
}

/**
 * Picks a pseudo-random message from a list based on the current day.
 * Same day → same message (stable, no flickering on re-render).
 */
export function pickMessage(messages: string[], seed: number): string {
  return messages[seed % messages.length];
}
