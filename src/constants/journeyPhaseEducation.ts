/** Yolculuk ekranı: faz bazlı kısa öğretici kartlar (~30 sn toplam okuma). */

export interface JourneyPhaseEducationCard {
  id: string;
  title: string;
  body: string;
}

const PHASE_1: JourneyPhaseEducationCard[] = [
  {
    id: "p1-1",
    title: "Beynin yeni rutini işlerken",
    body:
      "İlk fazda frontal kabuk daha çok nöbet tutar: hareket çoğu zaman bilinçli seçim ister. Beyin yeni bir desene “dikkat” ayırır; bu yorgunluk değil, öğrenmenin bedeli. Erken günlerde küçük ve bitirilebilir adımlar, büyük planlardan daha az direnç doğurur.",
  },
  {
    id: "p1-2",
    title: "Direnç nereden geliyor?",
    body:
      "Alışkanlık henüz otomatik değilken basal ganglia deseni netleşmemiştir; bu yüzden beden bazen “hayır” der. Kaçınma normaldir. Hedef sıfır kaçınmak değil — kaç görüldüğünde suçluluk yerine en küçük geri dönüşü seçmek.",
  },
  {
    id: "p1-3",
    title: "Küçük ödül, büyük mesafe",
    body:
      "Erken fazda büyük ödül seyrek gelir; beyin kısa vadeli rahatlığa kayabilir. Tamamlanmış küçük bir adım tamamlanma hissini artırır. Bugünkü kazanımı bedene veya tek cümleye indir — bu, uzun yolculuk için yeterli bir kanıt.",
  },
  {
    id: "p1-4",
    title: "Kuruluş fazı için cümle",
    body:
      "Bu fazda bağlam ve tekrar kazanır: aynı sıra, aynı ipucu, aynı çapa. Kimlik cümlen kısa olsun; her tekrarda “kendine bir oy” vermiş olursun. Disiplin performans değil, hatırlatma pratiğidir.",
  },
];

const PHASE_2: JourneyPhaseEducationCard[] = [
  {
    id: "p2-1",
    title: "Ara dönem: sıkıcı ama değerli",
    body:
      "Pekiştirme fazında bir kısım hareket tanıdıklaşır; sıkıcı hissi artabilir. Bu genelde zayıflık değil — otomatikleşmenin yan ürünü. Sıkıcı günler, haritayı “renksiz ama istikrarlı” boyar.",
  },
  {
    id: "p2-2",
    title: "Bağlam esnekliği",
    body:
      "Koşullar değişince beyin yeni ipuçları arar. Küçük ortam değişikliklerine (yer, süre, sıra) hazırlıklı olmak, düşüş günlerinde kurtarıcı olur. Mükemmel koşul beklemeden “yeterince iyi” koşulda başla.",
  },
  {
    id: "p2-3",
    title: "Kimlik ve tekrar",
    body:
      "Bu fazda “ben bunu yapan biriyim” cümlesi tekrarlandıkça güçlenir. Davranışı kişiye bağla ama sınav gibi yükleme — nazik tekrar. Bir gün aksadıysan kimlik tek günle çökmez; geri bağlanmak da kimlik parçasıdır.",
  },
  {
    id: "p2-4",
    title: "Pekiştirme fazı için cümle",
    body:
      "İstikrar, ilhamdan uzun yaşar. Motivasyon dalgalıdır; rutin ise dalga kıran iskele. Bugün yapılan tek küçük hareket yarının devamını daha olası yapar.",
  },
];

const PHASE_3: JourneyPhaseEducationCard[] = [
  {
    id: "p3-1",
    title: "Otomatikleşmenin kapısı",
    body:
      "Son fazda daha çok tekrar ve bağlam uyumu devrededir; beynin “sonra yaparım” maliyeti bazen düşer. Bu ‘artık kolay’ demek değil — ‘az düşünerek başlama’ya yaklaşmak demektir.",
  },
  {
    id: "p3-2",
    title: "Tetikleyiciler ve tuzaklar",
    body:
      "Otomatikleşen rutin bile stres veya uyku eksiliğinde sarsılır. Bilinen tetikleyicileri yazılı tutmak koruyucu olur: yorgunluk, sıkışıklık, sosyal baskı. Plan yüksek heyecanlı değil, düşüşe hazır olsun.",
  },
  {
    id: "p3-3",
    title: "Kimlik pekiştirmesi",
    body:
      "66. güne yaklaşırken amaç sadece kutu kapatmak değil — bu davranışı ‘benlik’ taslağıyla hizalamak. Ne ölçüde ‘ben seçtim’ hissi varsa sürdürme ihtimali o kadar bağlanmış olur (SDT dilinde öznel özerklik yakını).",
  },
  {
    id: "p3-4",
    title: "Otomatikleşme fazı için cümle",
    body:
      "Artık hedef ‘mükemmel gün’ değil, sapınca hızlı toparlamak. Uzun yol küçük onarımların toplamıdır. Bugün yapılan en küçük geri bağlanış bile yolcusunu taşır.",
  },
];

export function phaseIdFromDay(dayNumber: number): 1 | 2 | 3 {
  if (dayNumber <= 22) return 1;
  if (dayNumber <= 44) return 2;
  return 3;
}

export function getJourneyEducationCards(dayNumber: number): JourneyPhaseEducationCard[] {
  const pid = phaseIdFromDay(dayNumber);
  if (pid === 1) return PHASE_1;
  if (pid === 2) return PHASE_2;
  return PHASE_3;
}
