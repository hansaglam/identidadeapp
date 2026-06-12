/**
 * Yolculuk sekmesinde gün başına bilimsel prensip + kaynak + mikro-aksiyon.
 * Faz 1: 1–22, Faz 2: 23–44, Faz 3: 45–66
 */

export interface DailyPrinciple {
  day: number;
  /** Ana cümle */
  principle: string;
  /** Araştırma / kavram dayanağı (küçük, gri) */
  science: string;
  /** Bugünkü net aksiyon */
  action: string;
  phase: 1 | 2 | 3;
}

export const DAILY_PRINCIPLES: DailyPrinciple[] = [
  // ─── Faz 1 — Kuruluş (1–22) ───
  {
    day: 1, phase: 1,
    principle: "Başlamak, mükemmelleşmekten yüzlerce kez daha önemlidir.",
    science: "Başladığın iş zihinde açık kalır (Zeigarnik) — kapatma dürtüsü seni tekrar masaya getirir.",
    action: "Alışkanlığı bugünün en küçük sürümüne indir; sadece bir kez başlat.",
  },
  {
    day: 2, phase: 1,
    principle: "Motivasyon bir duygudur; duygular geçer, sistem ve çapa kalır.",
    science: "Öz-Belirleme Kuramı: sürdürülebilir davranış özerklik ve anlam ister (Deci & Ryan).",
    action: "Nedenini 10 saniyede yaz, sonra sadece tetik anında başla.",
  },
  {
    day: 3, phase: 1,
    principle: "Beyin mükemmel hisle değil, tekrarla öğrenir.",
    science: "Hebb kuralı: birlikte ateşleyen nöronlar birbirine bağlanır — her çapa tekrarı yolu güçlendirir.",
    action: "Aynı çapayı aynı saatte bir kez daha yap.",
  },
  {
    day: 4, phase: 1,
    principle: "Küçük davranış, büyük direnci sessizce aşar.",
    science: "Uygulama niyetleri, planlı tetik-eylem çiftlerini iki kat daha güvenilir kılar (Gollwitzer).",
    action: "If-then cümlesini yüksek sesle söyle: \"X olunca, Y yapacağım.\"",
  },
  {
    day: 5, phase: 1,
    principle: "Dağılmak içgüdü; çözüm ortamı tasarlamaktır.",
    science: "Sürtünme azalınca zorluk düşer — davranış tasarımı iradeden verimli (Thaler & Sunstein).",
    action: "Alet veya hazırlığı bu akşam 30 saniyede önceden hazırla.",
  },
  {
    day: 6, phase: 1,
    principle: "Kimlik önce bir cümle, sonra tekrar eden hareketle büyür.",
    science: "Öz-şema: tutarlı davranış hikâyesi kimliği pekiştirir (Bem / kimlik yansıması).",
    action: "Bugün şunu söyle: \"Ben başlayan biriyim\" — ardından tek tekrar.",
  },
  {
    day: 7, phase: 1,
    principle: "Yedi gün, beyne yeni bir yol açmak için güçlü bir ilk sinyaldir.",
    science: "Sinaptik plastisite tekrarla güçlenir; süre kişiden kişiye değişir (Lally).",
    action: "İlk günkü mini sürüme dön ve bir tur daha tamamla.",
  },
  {
    day: 8, phase: 1,
    principle: "Vazgeçme düşüncesi, beynin eski yolu korumasıdır — normal ve geçicidir.",
    science: "Eski alışkanlık: bazal ganglion-dopamin döngüsü; yeni yol henüz ince (araştırma özeti).",
    action: "Dünkü tek kazanımı sesli söyle — pozitif ayrıntı yeni yolu besler.",
  },
  {
    day: 9, phase: 1,
    principle: "Bazen en iyi ödül, sadece 'bitirdim' hissidir.",
    science: "Küçük tamamlama ödülleri dopamini dengeli pekiştirir; abartı iç motivasyonu zayıflatır.",
    action: "Tamamladıktan hemen sonra minik, sağlıklı bir 'işaret ödülü' ver.",
  },
  {
    day: 10, phase: 1,
    principle: "İstikrar, yoğunluktan daha güvenilirdir.",
    science: "Başlama eşiği: küçük tekrar büyüme için yeter; atlama motivasyonu kırar.",
    action: "Süre veya hacim yerine sadece 'bugün yaptım mı?' kutusuna odaklan.",
  },
  {
    day: 11, phase: 1,
    principle: "Zihin dağılsa bile tek tekrar günü kurtarır.",
    science: "Bilişsel yük doluyken prosedürel bellek baskılanır — mini sürüm yükü azaltır.",
    action: "Bugün en küçük sürümü seç; varlık, mükemmellikten önce gelir.",
  },
  {
    day: 12, phase: 1,
    principle: "Aynı çapa, aynı saat — desen tanınmaya başlar.",
    science: "Tekrar, prosedürel öğrenmeyi güçlendirir; 21 gün sihir değil, sinyal birikimi (Lally).",
    action: "Çapayı değiştirme; sadece bir kez daha aynı noktada başla.",
  },
  {
    day: 13, phase: 1,
    principle: "İki haftaya bir adım: sabır, hızdan değerlidir.",
    science: "Otomatiklik eğrisi yavaş ve dalgalıdır — sıkıcılık sürecin parçası (Lally, 2009).",
    action: "Bugün sadece görünür ol; süreyi değil varlığı işaretle.",
  },
  {
    day: 14, phase: 1,
    principle: "On dört gün: artık deneme değil, günlük bir iz bırakıyorsun.",
    science: "Öz-takip ve kayıt, davranışı anlamlı ölçüde iyileştirir (Harkin meta-analizi).",
    action: "Bugünkü tekrarı işaretle — veri, ilerlemenin haritasıdır.",
  },
  {
    day: 15, phase: 1,
    principle: "Birine söylediğinde, yalnız kalmayı bırakırsın.",
    science: "Destek veya izleyici varlığı, orta zorlukta motivasyonu hafifçe artırır (Zajonc).",
    action: "Bugün birine tek cümleyle niyetini söyle.",
  },
  {
    day: 16, phase: 1,
    principle: "Saat belirlemeden, zaman havada uçuşur.",
    science: "Ne zaman yapacağını önceden planlamak, gerçekleştirmeyi yaklaşık ikiye katlar (Gollwitzer).",
    action: "Takvime 5 dakikalık bir yuva koy — bildirim aç veya birine hatırlat.",
  },
  {
    day: 17, phase: 1,
    principle: "Ertelemek tembellik değil; bazen beynin yorgun sinyalidir.",
    science: "Kendine sert davranmak ertelemeyi uzatır; yumuşak başlamak daha işe yarar (Neff).",
    action: "Yargılamadan önce 30 saniyelik minik bir adım at.",
  },
  {
    day: 18, phase: 1,
    principle: "Belirsizlikte beynin ertelemeyi seçer — net plan kurtarır.",
    science: "If-then planları, ani dürtüleri otomatik yönlendirir (Gollwitzer).",
    action: "Bugünkü tetik anını tek cümleyle yeniden yaz: 'X olunca, Y.'",
  },
  {
    day: 19, phase: 1,
    principle: "Sıkıldığın an, yolun otomasyona döndüğünü gösterir.",
    science: "Otomatiklik yavaş ve dalgalı gelir; sıkıcılık sürecin normal parçasıdır (Lally).",
    action: "Aynı tekrarı yap — sadece ortamı küçükçe değiştir (farklı oda, aynı hareket).",
  },
  {
    day: 20, phase: 1,
    principle: "Sınır koymak özgürlüğü kısmaz; karar yükünü hafifletir.",
    science: "Az seçenek, zihinsel yorgunluğu düşürür ve ısrarı kolaylaştırır (Baumeister).",
    action: "Bugünkü üst sınırı 2 dakikada belirle — ne kadar sürdüğün değil, ne zaman biteceği önemli.",
  },
  {
    day: 21, phase: 1,
    principle: "Üçüncü hafta: 'Ben bunu yapıyorum' artık sadece niyet değil.",
    science: "Tekrar, prosedürel öğrenmeyi güçlendirir — 21 gün sihir değil, sinyal birikimidir (Lally).",
    action: "Bugüne kadar kaç tekrar yaptığını gerçek bir sayıyla yaz.",
  },
  {
    day: 22, phase: 1,
    principle: "Kurulum bitti: şimdi büyütmek değil, aynı küçüklükte kalmak kazandırır.",
    science: "Faz geçişlerinde motivasyon dalgalanır; tutarlılık korumak asıl iş (alışkanlık araştırması).",
    action: "Yarın da ilk günkü mini sürümle veya daha küçükle devam et — söz ver.",
  },

  // ─── Faz 2 — Pekiştirme (23–44) ───
  {
    day: 23, phase: 2,
    principle: "Motivasyon düşecek — bu arıza değil, yolun parçası.",
    science: "Otomatiklik eğrisi yavaş ve dalgalıdır; inişler normaldir (Lally, 2009).",
    action: "Motivasyonu ölçme; sadece bugünkü tek tekrarı koru.",
  },
  {
    day: 24, phase: 2,
    principle: "Kimlik önce bir cümle, sonra her gün küçük bir kanıt.",
    science: "Davranışın öz-kavramını günceller — cümle ve hareket birlikte işler (öz-şema).",
    action: "'Ben … olan biriyim' cümlesini bir adım büyüt, hareket mini kalsın.",
  },
  {
    day: 25, phase: 2,
    principle: "Görünür olan devam eder; görünmez olan kaybolur.",
    science: "Kendini izlemek davranışı anlamlı ölçüde iyileştirir (Harkin).",
    action: "Bugünkü eylem için tek satır onay bırak: tarih + küçük bir işaret.",
  },
  {
    day: 26, phase: 2,
    principle: "Dirence direnmek, dur deme kasını güçlendirir — ama dinlenmeyi unutma.",
    science: "İnhibisyon kontrolü çalışır ama tükenir; dinlenme şart (Baumeister).",
    action: "Tetik anında bir derin nefes al, sonra tek tekrar — düşünmeyi atla.",
  },
  {
    day: 27, phase: 2,
    principle: "Takdiri dünkü senden değil, bugün yapan senden iste.",
    science: "Yetkinlik hissi iç motivasyonu besler — küçük ilerlemeyi fark et (Deci & Ryan).",
    action: "Dünkü eforunu 1–10 arası yaz; yargı yok, sadece veri.",
  },
  {
    day: 28, phase: 2,
    principle: "Aynı hareket, farklı yerde — alışkanlığın gerçekten senin olduğunu gösterir.",
    science: "Bağlam değişince kalıbın ne kadar sağlam olduğu ortaya çıkar (genelleme).",
    action: "Aynı mikro-eylemi alışılmadık ama güvenli bir yerde dene.",
  },
  {
    day: 29, phase: 2,
    principle: "Büyük ödül bazen içgüdüyü söndürür — ölçülü kal.",
    science: "Aşırı dış ödül, iç motivasyonu zayıflatabilir (Lepper).",
    action: "Ödülü küçük ve hemen olsun: tamamladın mı, işaretle.",
  },
  {
    day: 30, phase: 2,
    principle: "Otuz gün: artık 'yaptın mı?' değil, 'hangi sürümdeyim?' sorusu.",
    science: "Kimlik cümlesi davranışla hizalanınca yürütme kolaylaşır (öz-algı).",
    action: "Alışkanlık adınla bugün üçüncü kez aynı mini varyasyonu yap.",
  },
  {
    day: 31, phase: 2,
    principle: "Stres kötü mazeret değil; iyi fırsat — sürümü küçült, devam et.",
    science: "Stres otomatiği bozar; önceden planlı küçük sürüm toparlar (coping).",
    action: "Stres 7+ ise yarım sürüm yap — yoklama kaydı kalsın, bu yeter.",
  },
  {
    day: 32, phase: 2,
    principle: "Kaçırdığın gün başarısızlık değil; toparlanma penceresi.",
    science: "Kısa analiz + küçük plan, sonraki denemeyi öngörülebilir kılar (Dweck).",
    action: "Kaçırdıysan sebep değil, 'yarın 30 sn' planını tek cümleyle yaz.",
  },
  {
    day: 33, phase: 2,
    principle: "Zihin ertelemeyi 'şimdi acı vermez' diye satar — kendine küçük bir bağ koy.",
    science: "Anlık ödül gelecek kazancı küçük gösterir; taahhüt cihazı yardım eder (Mischel).",
    action: "Birine veya görünür bir yere mini bir taahhüt bırak.",
  },
  {
    day: 34, phase: 2,
    principle: "Birinin 'yaptın mı?' demesi, hatırlatmanın ötesine geçer.",
    science: "Hesap verebilirlik başarı oranlarını artırır (Aşçı & Jackson).",
    action: "Bugün birinden tek cümleyle 'sorar mısın?' beklentisi al.",
  },
  {
    day: 35, phase: 2,
    principle: "Direniş kas gibidir — dinlenmezsen delik açarsın.",
    science: "Öz-düzenleme sınırlıdır; uyku ve tükeniş engel olur (Galliot).",
    action: "Tükeniş sinyalinde hedefi 10 sn veya 1 tekrara indir — uyku önce gelir.",
  },
  {
    day: 36, phase: 2,
    principle: "İç sesin nasıl konuştuğu, yapıp yapmayacağını belirler.",
    science: "Öz-söylem duygudurumu ve yürütmeyi yönetir (SDT).",
    action: "İç sesi üçüncü şahısla sakinleştir, sonra tek eylem yap.",
  },
  {
    day: 37, phase: 2,
    principle: "İlerleme çizgisi: algı, ölçüm ve tutarlılık birlikte büyür.",
    science: "Bitişe yaklaştıkça tempo artar — küçük bayraklar ivme verir (Hull).",
    action: "Küçük bir bayrak koy: 37/44 pekiştirmedeyim, bugün tek tekrar.",
  },
  {
    day: 38, phase: 2,
    principle: "İç çelişki büyürken hareket küçük olsa bile hafifletir.",
    science: "Tutarsızlık rahatsız eder; tek adım uyumu geri getirir (Festinger).",
    action: "Şunu söyle: 'Bunu yapan ben, şunu da bir kez denerim.'",
  },
  {
    day: 39, phase: 2,
    principle: "Zor gün bile 10 saniye sayılır — zinciri tamamen koparma.",
    science: "Kesintiden sonra en küçük tekrar bile yolu canlı tutar (kesinti psikolojisi).",
    action: "Hafif gün: tek eylem, 10 saniyeden fazla olmasın.",
  },
  {
    day: 40, phase: 2,
    principle: "Ortam kötü gidiyorsa ceza değil, ipucu değişimi vardır.",
    science: "Yeni ipuçları yeni cevap üretir — ortamı ayarlamak işe yarar (davranış analizi).",
    action: "Kötü giden ortam değişkenini bir tane listele, yarına bir tane odakla.",
  },
  {
    day: 41, phase: 2,
    principle: "İç ödül dışarıdan gelmez; her tamamlamada öğrenilir.",
    science: "İçsel pekiştirme uzun vadeli motivasyonu taşır (Deci & Ryan).",
    action: "Bitince içinden söyle: 'Bu, beni tanımlayan küçük bir an.'",
  },
  {
    day: 42, phase: 2,
    principle: "Ertelemek ile bırakmak farklı cepler — karıştırma.",
    science: "Niyet ile eylem arasındaki boşluğu görmek müdahaleyi mümkün kılar (Prochaska).",
    action: "Ertelediysen 'bıraktım' deme; sadece saati sınırla ve mini sürüme dön.",
  },
  {
    day: 43, phase: 2,
    principle: "Pekiştirme son hafta: darboğaz senin çapan — onu yeniden adlandır.",
    science: "Otomatiğe varış 18–254 gün arasında değişir; 66 ortalama, seninki farklı olabilir (Lally).",
    action: "En çok kaçırdığın tetik için tek cümleyle yeni bir isim ver — tetik aynı kalsın.",
  },
  {
    day: 44, phase: 2,
    principle: "Faz iki bitti: kimlik cümlen artık fiille bağlı — sırada otomasyon.",
    science: "Alışkanlık otomatikleşince bilinç yükü düşer (Wood).",
    action: "10 saniyede cevapla: 'Bunu fark etmeden nerede yapıyorum?'",
  },

  // ─── Faz 3 — Otomatikleşme (45–66) ───
  {
    day: 45, phase: 3,
    principle: "Kırk beş gün: artık karar vermiyorsun, hatırlıyorsun.",
    science: "Otomatik yürütme bazal gangliaya kayar; prefrontal yük azalır (Willingham).",
    action: "Tetik anında 2 saniyelik sessiz fark et — yargı yok.",
  },
  {
    day: 46, phase: 3,
    principle: "Otopilot suçluluk değil; zihnine kazandırdığın tasarruf.",
    science: "Otomasyon bilişsel yükü serbest bırakır, üst hedeflere yer açar (dual-process).",
    action: "Bugün şunu söyle: 'Bunu bana bırakıyorum' — kutla, suçlanma.",
  },
  {
    day: 47, phase: 3,
    principle: "66 gün ortalama; senin hızın farklıysa bu normal.",
    science: "Kişiden kişiye 18–66+ gün arasında geniş dağılım vardır (Lally).",
    action: "Bugün puan değil fark kaydet: kafasızlık/akıcılık 1–5.",
  },
  {
    day: 48, phase: 3,
    principle: "Sıkıcılık disiplin eksikliği değil; sistemin 'çalışıyorum' sesi.",
    science: "Rutin, dopamin dalgasından çok kesintisiz tekrarın çizgisidir (habituation).",
    action: "Sıkıldığında içinden söyle: 'Sıkıcılık, otomasyona girdim demek.'",
  },
  {
    day: 49, phase: 3,
    principle: "Kimliğe dokunan şey, unutulmayan küçük hareketle ölçülür.",
    science: "Tutarlı deney öz-şemayı günceller (öz-kavram araştırması).",
    action: "Aynada veya birine 5 saniye sesli söyle: 'Bunu yapan benim.'",
  },
  {
    day: 50, phase: 3,
    principle: "Yeniden tasarlamak durmak değil; aynı çekirdeği ileri taşımak.",
    science: "Bağlam değişince alışkanlık esner — bu yeniden ayarlama fırsatıdır (habit-discontinuity).",
    action: "Bir bağlam değişkeni dene: farklı saat, aynı mikro-eylem.",
  },
  {
    day: 51, phase: 3,
    principle: "Otomatiğe güvenmek kontrolü bırakmak değil; yedek plan taşımak.",
    science: "If-then yedekleri kayma riskini keser (Gollwitzer).",
    action: "Bir yedek yaz: 'Kayıt düşerse, aynı gün 30 sn aynı çapa.'",
  },
  {
    day: 52, phase: 3,
    principle: "Toparlayıcı gün başarısız gün değil; sistemin sinyal günü.",
    science: "Kayma önleme, tetik ve duyguyu anlayıp planı küçültmeyi içerir (Marlatt).",
    action: "Bozulma ihtimali varsa tetik + duygu tek cümle; çözüm mini if-then.",
  },
  {
    day: 53, phase: 3,
    principle: "Disiplin ceza değil; küçük ödülü doğru zamana taşımaktır.",
    science: "Gecikmiş ödül öz-kontrolü güçlendirir (Mischel).",
    action: "Büyük ödül yok: bitince 10 sn sakin bir hareket (esneme vb.).",
  },
  {
    day: 54, phase: 3,
    principle: "66'yı sen doldurursun; 66 seni sınırlamaz.",
    science: "Hedef sonrası yeni eşik veya zincirleme alışkanlık sürdürür (habit stacking).",
    action: "67+ için tek cümle taslak: 'Aynı çapa, bir üst 2 dk.' — bugün sadece yaz.",
  },
  {
    day: 55, phase: 3,
    principle: "Elli beş gün: hızın ortalamadan farklıysa yavaş yolculuk da geçerli.",
    science: "Kişisel varyasyon olağanüstü değil, beklenen bir dağılımdır (Lally).",
    action: "Ağır hissediyorsan 'ben yavaş yolculuğum' de — eylem yine 2 dk altı.",
  },
  {
    day: 56, phase: 3,
    principle: "Otomatik uykuda değil; bilinç dışı yürütme.",
    science: "Prosedürel öğrenme çoğu zaman fark etmeden pekişir (Willingham).",
    action: "Eylem bitince 3 sn sessiz sor: 'Ne oldu?' — yargısız.",
  },
  {
    day: 57, phase: 3,
    principle: "Bağlam sızıntısı, yeni çapa denemesi için son hafta sinyali olabilir.",
    science: "Ortam değişince eski ipucu geri dönebilir; planlı yeniden çapalama kapatır (renewal).",
    action: "5 sn'de küçük yeni çapa tasarla — bugün sadece deneme, tam performans yok.",
  },
  {
    day: 58, phase: 3,
    principle: "Seni taşıyan sistem; egonu dinlendir, kalıbı hizala.",
    science: "Sistem-1 otomatiği kazanır; sistem-2 çevreyi ayarlar (Kahneman).",
    action: "Ortamda bir varsayılanı kalıcı düzelt: ışık, kapı veya çanta yeri.",
  },
  {
    day: 59, phase: 3,
    principle: "66'ya yedi kala kayıt övünme değil; ayna tutar.",
    science: "Kendini izlemek yürütmeyi kör etmez, görünür kılar (Harkin).",
    action: "47'den beri fark 1–5 trendini tek cümleyle özetle — yoksa 'henüz veri' yaz.",
  },
  {
    day: 60, phase: 3,
    principle: "Alışkanlık bitiş değil; bir sonraki kapıyı açan anahtar.",
    science: "Önceki alışkanlık sonrakini tetikleyebilir — zincir kolaylaştırır (Clear).",
    action: "Mevcut hattın üstüne +1 halka: 5 sn'lik küçük 'sonrası' planı yaz.",
  },
  {
    day: 61, phase: 3,
    principle: "Topluluk seni taşıdıysa, 67'de bilinçli seç: açık bırak veya sınırla.",
    science: "Sosyal kıyaslama dış motivasyonu artırır; içseli zayıfça etkileyebilir (SDT).",
    action: "Hesabı paylaş veya gizle — hangisi sürdürücü, bugünkü tercihini işaretle.",
  },
  {
    day: 62, phase: 3,
    principle: "Son beşte ruh değil ritim: bitiş çizgisi ritmi bozmaz, taşır.",
    science: "Hedefe yaklaşırken ivme artar ama tükenme riski de yükselir (goal-gradient).",
    action: "Bugün her zamanki saat, her zamanki yer — minimum varyasyon, maksimum sadakat.",
  },
  {
    day: 63, phase: 3,
    principle: "Altmış üç: unutmak değil, sadeleşmek kazanır.",
    science: "Otomasyonda fazla plan bilişsel yükü artırır; minimalizm hızlandırır.",
    action: "Plandan bir maddeyi sessizce çıkar — hiçbir şey olmamış gibi devam et.",
  },
  {
    day: 64, phase: 3,
    principle: "Bitiş zafer günü değil; verdiğin sözün yerine getirilme günü.",
    science: "Bitişe yakın son if-then planı kayıp riskini keser (Gollwitzer).",
    action: "Son 3 gün için tek cümle söz ver — bir tanık (kişi veya not) ile.",
  },
  {
    day: 65, phase: 3,
    principle: "Altmış beş: yeni 66'yı ertelemek değil, aynı çekirdekle devam.",
    science: "Süreklilik büyük sıçramayla değil, aynı çekirdeğin genişlemesiyle sürer.",
    action: "Aynı çapa + yarın sadece 1 dakika — fark yok, devam vurgusu.",
  },
  {
    day: 66, phase: 3,
    principle: "Bu biten bir koşu değil; otomasyona verdiğin sözleşmeyi imzalamak.",
    science: "66 sembolik bir köprüdür — otomatiklik kişiden kişiye değişir ama ritüel bağlar (Lally).",
    action: "67'den itibaren 'aynı / mini / art' seçimini tek cümleyle işaretle — bugün imza at.",
  },
];

/** 1–66 arası gün; geçersiz gün `undefined` */
export function getPrincipleByDay(day: number): DailyPrinciple | undefined {
  if (day < 1 || day > 66) return undefined;
  return DAILY_PRINCIPLES[day - 1];
}
