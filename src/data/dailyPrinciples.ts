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
    science: "Açık görevler (Zeigarnik): başlanan eylem zihni kapatmaya iter.",
    action: "Bugün alışkanlığı en küçük sürüme indirip sadece bir kez başlat.",
  },
  {
    day: 2, phase: 1,
    principle: "Motivasyon duygudur; duygular geçer, sistem kalır.",
    science: "Öz-Belirleme Kuramı: sürdürülebilir davranış özerklik ve anlam ister (Deci & Ryan).",
    action: "Nedenini 10 saniye yaz, sonra sadece tetik anında başla.",
  },
  {
    day: 3, phase: 1,
    principle: "Beyin tekrarla öğrenir, mükemmel hisle değil.",
    science: "Hebb: birlikte ateşleyen sinir hücreleri birbirine bağlanır (\"çapa\" tekrarları).",
    action: "Aynı çapayı aynı saatte 1 tekrar yap.",
  },
  {
    day: 4, phase: 1,
    principle: "Küçük davranış, büyük direnci aşar.",
    science: "Uygulama niyetleri, planlanmış tetik-eylem çifti başarısını artırır (Gollwitzer).",
    action: "If-then: \"O zaman... şunu yap\" cümlesini yüksek sesle söyle.",
  },
  {
    day: 5, phase: 1,
    principle: "İçgüdü: dağılmak. Çözüm: çevreyi tasarlamak.",
    science: "Davranışsal irade: zorluk, ortamda sürtünmeyi azaltınca düşer (Thaler & Sunstein eğilimleri).",
    action: "Aleti/hazırlığı akşam önceden 30 saniyede hazırla.",
  },
  {
    day: 6, phase: 1,
    principle: "Kimlik, önce cümle, sonra harekettir.",
    science: "Öz-şema: davranışlar hakkında tutarlı hikâye kimliği pekiştirir (Bem / kimlik yansıması).",
    action: "Bugün cümle: \"Ben başlayan biriyim\" ve tek tekrar.",
  },
  {
    day: 7, phase: 1,
    principle: "Yaklaşık 7 gün, beyne yeni yol açmaya yeterli ilk sinyaldir.",
    science: "Sinaptik plastisite, tekrarla güçlenir; süre bireyler arası değişir (Lally varyasyonu).",
    action: "İlk günkü mini sürüme dön, bir tur daha tamamla.",
  },
  {
    day: 8, phase: 1,
    principle: "Vazgeçme düşüncesi, beynin eski yolu savunmasıdır.",
    science: "Eski alışkanlık: basal ganglia-dopamin döngüsü; yeni yol henüz zayıf (habit research).",
    action: "Pozitif ayrıntı: dünkü 1 kazanımı sesli söyle.",
  },
  {
    day: 9, phase: 1,
    principle: "Ödül, bazen sadece 'bitirdim' hissidir.",
    science: "Pekiştirme: tamamlayıcı küçük ödüller, dopaminle birliği güçlendirir; abartma.",
    action: "Kendine tamamlamadan hemen sonra minik, sağlıklı bir 'işaret ödülü' ver.",
  },
  {
    day: 10, phase: 1,
    principle: "İstikrar, yoğunluktan daha güvenlidir.",
    science: "Başlama sınırı efekti: büyüme için küçük tekrar yeter; atlamar motivasyonu kırar.",
    action: "Süre veya hacim yerine sadece 'var mı' kutusuna odaklan.",
  },
  {
    day: 11, phase: 1,
    principle: "Stres, iyi niyet değil, sistemi aşan taleptir.",
    science: "Bilişsel yük: çalışan belleği doldurunca prosedürel hafıza baskılanır (baddeley modelleri).",
    action: "Bugünkü sürümü 2 dakikayı geçmeyecek şekilde kesin.",
  },
  {
    day: 12, phase: 1,
    principle: "İlk çeyrek, en pahalı; ücret artık ödeme.",
    science: "Geç başlama, düşen öz-yeterliliği geri yüklemek için daha pahalıdır.",
    action: "Bugünkü eylem için tam zaman sınırı koy: timer.",
  },
  {
    day: 13, phase: 1,
    principle: "Sürtünme, kötü irade değil, kötü tasarımdır.",
    science: "Ortam mühendisliği, varsayılanları iyi tasarlayan davranış değiştirir (choice architecture).",
    action: "Kötü tetikleyicileri 1 adım uzağa al (ör. telefon başka oda).",
  },
  {
    day: 14, phase: 1,
    principle: "Tekrara maruz kalmak, ilginin açılmasına yol açar.",
    science: "Sırf maruz etki (mere exposure) tanıdık şeyi seçilebilir kılar.",
    action: "Aynı mikro-eylemi, bilerek sıkıcı hale getir: monotonluk, otomasyona geçer.",
  },
  {
    day: 15, phase: 1,
    principle: "Topluluk, tek başınalıktan farklı bir beyin modudur.",
    science: "Sosyal fasilitasyon, orta zorluklarda güdüyü hafif artırabilir; izleyici/destek fark yaratır.",
    action: "Bir cümleyle birine niyetini söyle (mikro-hesap verebilirlik).",
  },
  {
    day: 16, phase: 1,
    principle: "Zaman, kaynak değil, çapa bağlıdır.",
    science: "İmlementasyon niyetleri, zamanı sabitleyerek yürütmeyi ikiye katlar (meta-analizler).",
    action: "Takvime 5 dakikalık yuva koy, çınlasın (bildirim veya eş).",
  },
  {
    day: 17, phase: 1,
    principle: "Erteleme, tembellik değil; gecikmiş iyileşmedir.",
    science: "Düzenleme zorlukları bilişsel engel yaratır; kendinize etiket şiddetlendirmez (self-compassion).",
    action: "Ertelemeyi yargılamadan, sadece 'şimdi 30 sn' eylem.",
  },
  {
    day: 18, phase: 1,
    principle: "İki arada bir yok: ya tetik, ya ertele.",
    science: "If-then planları, istemsiz cevapları yönlendirir (Gollwitzer, implementation intentions).",
    action: "Bugünkü 'o zaman' anını 1 cümleyle tekrar yaz.",
  },
  {
    day: 19, phase: 1,
    principle: "Sıkılmak, otomasyona giden tüneldir.",
    science: "Otomatiklik eğrisi, ortalama 66+ gün varyasyon; sıkıcılık bir süreçtir (Lally).",
    action: "Aynı tekrar; varyasyon sadece ortam (ör. farklı odada 1 tekrar).",
  },
  {
    day: 20, phase: 1,
    principle: "Sınırlar, özgürlüğe çit değil, çerçevedir.",
    science: "Kısıtlanabilir alan, karar yorgunluğunu düşürür; öz-yönetleme sınıfta ısrar (Baumeister).",
    action: "Bugünkü maksimum süreyi 2 dakikada tavanla (harcanan süre değil, bitişi bil).",
  },
  {
    day: 21, phase: 1,
    principle: "Üçüncü hafta, 'ben yapıyorum' cümlesini taşımaya başlar.",
    science: "Tekrar, prosedürel öğrenmeyi güçlendirir; 21 gün sihri yok, ama sinyal birikir (popüler mit vs bilim: süre bireyde değişir).",
    action: "Listeye 'bugüne kadar toplam X tekrar' ekle, gerçekten bir sayı yaz.",
  },
  {
    day: 22, phase: 1,
    principle: "Kurulum fazı bittiğinde, mesele büyütmek değil, aynada kalmak.",
    science: "Faz geçişi, motivasyon fırtınası yaratır; tutarlılık korunmalı (habit research).",
    action: "Küçüklüğe yemin et: yarın 1. fazdan 1. günkü sürüme eşit veya altında kal.",
  },

  // ─── Faz 2 — Pekiştirme (23–44) ───
  {
    day: 23, phase: 2,
    principle: "Motivasyon düşecek; bu planın parçası, arıza değil.",
    science: "Otomatiklik eğrisi yavaş ve dalgalıdır (Lally ve takım, 2009).",
    action: "Motivasyonu ölçme; sadece bugünkü 1 yinelemeyi korumaya odaklan.",
  },
  {
    day: 24, phase: 2,
    principle: "Kimlik, önce cümle; sonra, birçok gün tekrar.",
    science: "Identity-based habits (Clear) sinirbilimle uyumlu: öz-kavram, davranış yöneltir (öz-şemalar).",
    action: "'Ben ... olan biriyim' cümlesini 1 adım büyüt, ama hareket mini kalsın.",
  },
  {
    day: 25, phase: 2,
    principle: "Tutarlılık, mizaçtan çok, görünürlükten gelir.",
    science: "İzlenebilirlik ve kayıt, self-monitoring, davranışı % düzeyinde iyileştirir (Harkin meta-analiz).",
    action: "Bugünkü eylem için tek satır onay (tarih + simge) bırak.",
  },
  {
    day: 26, phase: 2,
    principle: "Dirence direnmek, inhibisyon kasını güçlendirir.",
    science: "İnhibisyon kontrolü, egzersizle güçlendirilir, ama tükenir (ego depletion tartışmaları; dinlenmeyi unutma).",
    action: "Tetik anında 1 derin nefes + 1 tekrar; düşünmeyi kısa devre dışı bırak.",
  },
  {
    day: 27, phase: 2,
    principle: "Takdiri, geçen sen değil, yapan sensin.",
    science: "Yetkinlik hissi, iç motivasyonu besler; ölç, iyileşme gör (SDT).",
    action: "Dünkü hafif veya ağır eforu 1-10 yaz; yargı yok, sadece veri.",
  },
  {
    day: 28, phase: 2,
    principle: "Aynı şey, farklı bağlam: genelleme cebidir.",
    science: "Bağlam farkı, kalıbın \"şartlı\" mı yoksa \"genel\" mi olduğunu söyler (genelleme, bağlamsal faktörler).",
    action: "Aynı mikro-eylemi normal olmayan bir yerde dene (kısa, güvenli).",
  },
  {
    day: 29, phase: 2,
    principle: "Dışsal ödül, içgüdüyü söndürebilir; ölçü kaçmaz.",
    science: "Aşırı-just etme riski, kontrolsüz dış pekiştirme (Lepper).",
    action: "Ödülü, tamamlandı sinyaline dön: küçük, somut, hemen.",
  },
  {
    day: 30, phase: 2,
    principle: "Artık soru: 'Yaptın mı?' değil, 'Hangi sürümdeyim?'",
    science: "Kimlik tabanlı yürütme, özsöylem cümleleriyle hizaya gelir (self-perception, kognitif uyum).",
    action: "Gün 30'da alışkanlık adıyla 3. kez aynı mini varyasyon.",
  },
  {
    day: 31, phase: 2,
    principle: "Stres, iyi fırsat, kötü mazeret: seçim sizin.",
    science: "Stres, otomatiği bozabilir; toparlayıcı planlar fark yaratır (coping, implementation).",
    action: "Stres 7+ ise sürümü yarım yap, yoklama kaydı kalsın.",
  },
  {
    day: 32, phase: 2,
    principle: "Toparlanma, başarısızlık değil, öğrenme penceresidir.",
    science: "Eksik sürüm + kısa analiz, sonraki denemeyi öngörülebilir kılar (growth mindset, Dweck; ölçümle).",
    action: "Kaçırma olduysa 1 cümle: sebep değil, 'yarın 30 sn' planı.",
  },
  {
    day: 33, phase: 2,
    principle: "Zihin, ertelemeyi 'şimdi acı vermez' diye satar.",
    science: "Anlık indirimleme, gelecek ödülleri küçük görür; commitment device yardım eder.",
    action: "Birine veya yere, sosyal/bağlayıcı bir mini taahhüt bırak.",
  },
  {
    day: 34, phase: 2,
    principle: "Grup, bencilliği kırar; sorumluluk, hatırlatmanın ötesine geçer.",
    science: "Hesap verebilirlik, başarı oranlarını artırır (Aşçı & Jackson destek çalışmaları).",
    action: "Bugün, bir kişiden 'sordum' veya 'yaptın mı' beklentisini 1 cümleyle al.",
  },
  {
    day: 35, phase: 2,
    principle: "Direniş, kas gibi: dinlenmeyi reddet, delik açarsın.",
    science: "İnhibisyon ve öz-düzenleme sınırlı; uyku ve biliş tükenişi engeller (Galliot glukoz, tartışmalar; özet: tükenme gerçeği).",
    action: "Bir tükeniş sinyalinde, hedefi 10 sn/1 tekrar, uyku/şeker önceliği yok (uyku önce).",
  },
  {
    day: 36, phase: 2,
    principle: "Aynalama, değil; hatırlatma: siz, kendinizle konuşursunuz.",
    science: "Öz-söylem, duygudurum ve yürütmeyi yönetir; iyileştirici dil SDT ile uyumlu.",
    action: "Bugün, iç sesi 3. şahıs cümleyle sakinleştir, sonra 1 eylem.",
  },
  {
    day: 37, phase: 2,
    principle: "İlerleme çizgisi, algı, ölçüm ve tutarlılık üçlüsündür.",
    science: "Goal-gradient: bitişe yaklaşınca hız; küçük mil taşlar momentum (Hull, 1932 — modern yorumlama).",
    action: "Araya 1 küçük bayrak koy: 37/44 pekiştirme içindeyim, bugünkü 1 yineleme.",
  },
  {
    day: 38, phase: 2,
    principle: "İç çelişki, aynalarda çözülür, kaçlarda büyür.",
    science: "Bilişsel çelişki, tutarsızlık azaltma ihtiyacı, davranış yöneltir (Festinger, ölçülü yorumlama).",
    action: "Bir cümle: 'Bunu yapan ben, şunu da 1 kere denerim' (çelişkiyi 1 hareketle hafiflet).",
  },
  {
    day: 39, phase: 2,
    principle: "Zaman çizgisi, duygudan uzun; tutarlılık kısadır, birikir.",
    science: "Tükenmiş gün, bir sonraki yolda 0,5 sn bile tekrar anlam ifade eder (kesinti psikolojisi).",
    action: "Hafif gün, yine de 1 eylem: süre 10 sn'den fazla olmasın.",
  },
  {
    day: 40, phase: 2,
    principle: "Bağlam, ceza değil, ipucu değişimidir.",
    science: "Stimulus control, yeni ipuçlarıyla yeni cevap; davranış analizi.",
    action: "Kötü giden ortam değişkeni 1 tane listele, yarın 1 tane odağa alın.",
  },
  {
    day: 41, phase: 2,
    principle: "İç ödüller, dışa bağımlı değil; öğrenilmiş tatmindir.",
    science: "İçsel pekiştirme, ileri düzeyde yürütme, uzun vadeli motivasyonu taşır (SDT).",
    action: "Tamamlandıktan sonra, net bir iç cümle: 'Bu, beni tanımlayan küçük bir an.'",
  },
  {
    day: 42, phase: 2,
    principle: "Sadece ertelemek değil, erken bırakmak; ikisi ayrı cepler.",
    science: "Aşama modeli, niyet-eylem ayrımı; farkı kaydetmek müdahale eder (Prochaska, özetle).",
    action: "Eğer ertelendiyse, 'bırakma' cümlesini yasakla; sadece saat sınırla.",
  },
  {
    day: 43, phase: 2,
    principle: "Pekiştirme son hafta: darboğaz, sadece sizin çapanız.",
    science: "Lally, otomatiğe varış 18–254 gün aralığı; 66, ortalama, senin hızın farklı (Lally).",
    action: "En çok kaçırdığın tetik: 1 cümleyle yeniden adlandır (isim değiştir, tetik aynı).",
  },
  {
    day: 44, phase: 2,
    principle: "Faz 2, kimlik cümlelerinizi fiile bağladı; faz 3, otomatiği cilalar.",
    science: "Alışkanlık otomatikleşince bilinç yükü düşer (Wood).",
    action: "44. gün: 10 sn'de, 'bunu farketmeden nerede yapıyorum?' 1 cevap.",
  },

  // ─── Faz 3 — Otomatikleşme (45–66) ───
  {
    day: 45, phase: 3,
    principle: "Artık 'karar vermiyor', hatırlıyor ve fark ediyor olursunuz.",
    science: "Basal ganglia, otomatiği; prefrontal, üst yönetimi devreder (Willingham, prosedürel hafıza).",
    action: "Bugün, tetik anında 1 anlık fark et (sessiz, 2 sn).",
  },
  {
    day: 46, phase: 3,
    principle: "Otopilot, suçluluk değil, tasarrufftur.",
    science: "Otomasyon, bilişsel yük serbest bırakır; odak, üst hedeflere kayar (dual-process).",
    action: "Otomatiği kutla: 1 cümle, 'Bunu bana bıraktım' değil, 'Bunu bana bırakıyorum'.",
  },
  {
    day: 47, phase: 3,
    principle: "66 gün, ortalama; senin sürren farklı olabilir, bu normal.",
    science: "Lally varyasyon: medyan/ortalama 18–66+ hafta arası dağılır; kişi özeli.",
    action: "Faz 3'te her gün: 'şu an puan'ı değil, 'fark'ı kaydet: kafasızlık/akıcılık 1-5.",
  },
  {
    day: 48, phase: 3,
    principle: "Sıkıcılık, disiplin değil, sistemin tıslaması.",
    science: "Rutin, dopaminin dalgasından çok, kesintisiz tekrarın çizgisidir (habitization).",
    action: "Sıkılan zihninde 1 cümle: 'Sıkıcılık, sinyal: otomasyona girdim.'",
  },
  {
    day: 49, phase: 3,
    principle: "Kimliğe dokunan şey, unutulmayan hareketle ölçülür.",
    science: "Öz-şema güncellemeleri, tutarlı deneyle birleşir (bilissel-kişiler arası kabul).",
    action: "Birine veya aynada, 5 sn'lik sesli: 'Bunu yapan benim.'",
  },
  {
    day: 50, phase: 3,
    principle: "Yeniden tasarlamak, durdurmak değil; ileri taşımaktır.",
    science: "Habit-discontinuity hipotez: bağlam değişirse, alışkanlık zayıf noktada esner (krizde müdahale fırsatı).",
    action: "1 bağlam değişkeni test et: farklı saat, aynı mikro-eylem.",
  },
  {
    day: 51, phase: 3,
    principle: "Otomatiğe güven, denetimi bırakma değil.",
    science: "Hedef çizgileri, meta-düzlemde ince oynama, slip önleme (Gollwitzer, if-then).",
    action: "1 if-then yedek: 'Kayıt düşerse, 30 sn’de aynı gün aynı çapa.'",
  },
  {
    day: 52, phase: 3,
    principle: "Toparlayıcı gün, başarısız gün değil; sinyal günü.",
    science: "Relapse prevention, tetiği açıklayıp, planı küçülterek sürer (Marlatt).",
    action: "Bozulma olasılığı: tetik+duygu 1 cümle; çözüm: mini if-then.",
  },
  {
    day: 53, phase: 3,
    principle: "Disiplin, ceza değil; ertelenmiş ödül yönetimidir.",
    science: "Zaman tercihleri, erteleme ve öz-kontrol (Mischel, bisküvi, özet: gecikmiş ödül).",
    action: "Büyük ödül yok, küçük: bugün, tamamlayınca 10 sn'lik sakin hareket (stretch vb.).",
  },
  {
    day: 54, phase: 3,
    principle: "Siz 66’yı doldurursunuz; 66, sizi sınırlamaz.",
    science: "Uyarlanma: hedef sonrası yeni eşik, habit stacking/goal hierarchy.",
    action: "67+ için 1 cümle hedef taslak: 'Aynı çapa, bir üst 2 dk.' (bugün taslak).",
  },
  {
    day: 55, phase: 3,
    principle: "55. gün: sinyal, sizin hız veriniz, ortalamadan ayrılabilirsiniz.",
    science: "Lally dağılımı: kişi özeli varyasyon, ortalamadan sapma olağanüstü değil.",
    action: "Eğer ağır: 'ben yavaş yolculuğum' 1 cümle; 1 eylem yine 2 dk ve altı.",
  },
  {
    day: 56, phase: 3,
    principle: "Otomatik, uykuda değil: bilinç dışı yürütme.",
    science: "Implicit vs explicit prosedürel öğrenme; idrak dışı tekrar (Willingham).",
    action: "Eylem bitince 3 sn'lik sessiz 'ne oldu?' sorusu, yargısız.",
  },
  {
    day: 57, phase: 3,
    principle: "Bağlamsal sızı, son hafta yeni çapa denemesi için sinyal olabilir.",
    science: "Kontekst-uyarıcılık (renewal) risk, yine de planlı yeniden-çaplayış kapanır (özet).",
    action: "1 yeni, küçük çapa denemesini 5 sn'de tasarla, bugün sadece deneme, tam performans yok.",
  },
  {
    day: 58, phase: 3,
    principle: "Siz değil, sistem taşır: egonuzu dinlendirin, kalıbı hizaya getirin.",
    science: "Sistem-1 otomatiği, sistem-2 planlaması, çakışmada sistem-1 kazanır, sistem-2 çevreyi ayarlar (Stanovich).",
    action: "Ortamda 1 varsayılanı kalıcı düzelt (ör. ışık, kapı, çanta yeri).",
  },
  {
    day: 59, phase: 3,
    principle: "66’ya 7 kala, kayıt, övünme değil, ayna tutar.",
    science: "Self-monitoring, yürütmeyi kör etmez; ters, göz açar (Harkin).",
    action: "47’den bu yana fark-1-5 trendini 1 cümleyle özetle (yoksa, 'henüz veri' yaz).",
  },
  {
    day: 60, phase: 3,
    principle: "Alışkanlık, bitişi değil, bir sonraki kapıyı açan anahtar.",
    science: "Habit stacking, zincir, öncekini tetik; Clear + davranış zinciri (Lally, otomasyona geçince kolay).",
    action: "1 kısa, yeni, küçük 'sonrası' 5 sn'lik plan: mevcut hat üstüne +1 halka.",
  },
  {
    day: 61, phase: 3,
    principle: "Topluluk, 66'da sizi taşıdıysa, onu 67'de açık bırakın veya sınırlayın—bilinçli.",
    science: "Sosyal kıyaslama, dışa özgü motivasyon, içseli zayıfça etkiler (tartışmalar, ölçü).",
    action: "Hesabı, paylaş veya 1 cümleyle gizlilik: hangisi sürdürücü, bugünkü tercih.",
  },
  {
    day: 62, phase: 3,
    principle: "Son 5'te, ruh değil, ritim: bitiş, ritmi çalmaz, taşır.",
    science: "Kapanış etkileri, hedef yaklaşımında ivme (goal-gradient) ve tükenme riski; ritim, koruyucu.",
    action: "Bugün, her zamanki saat, her zamanki yer, minimum varyasyon, maksimum sadakat.",
  },
  {
    day: 63, phase: 3,
    principle: "63'te, unutulmak değil, sadeleşmek kazanır.",
    science: "Bilişsel sadeleştirme, otomasyonda aşırı planı düşürür; minimalizm yürütmeyi hızlandırır (özet).",
    action: "Planda 1 madde gizlice çıkar, hiç bir şey olmamış gibi devam (en az sürücüyü bırak).",
  },
  {
    day: 64, phase: 3,
    principle: "Bitiş, zafer günü değil, bir sözün yerine getirilme günüdür.",
    science: "Implementation intentions, bitişe yakın, son \"if-then\" ile kayıp riskini keser (Gollwitzer).",
    action: "Son 3 gün için 1 cümle söz, bir tanık (kişi veya not) ile.",
  },
  {
    day: 65, phase: 3,
    principle: "65'te, bir sonraki 66'ya ertelemeyi değil, devamlılığı bırakın.",
    science: "Süreklilik, büyük yeni hedeflerle değil, aynı çekirdekle genişleme (expansion) ile sürer.",
    action: "Aynı çapa + 1 zorunluk: yarın, sadece 1 dakika, fark yok, devam vurgusu.",
  },
  {
    day: 66, phase: 3,
    principle: "Bu, biten bir koşu değil, otomasyona söz veren bir sözleşmeyi tamamlamaktır.",
    science: "Lally, otomasyonda bireysel varyasyon; 66, sembol, bilim kişi özeli 66 olmayı reddeder—ama ritüel, köprü kurar.",
    action: "1 sayfa veya 1 cümle: 67'den itibaren 'aynı/mini/art' seçimini işaretle, bugün sadece imza.",
  },
];

/** 1–66 arası gün; geçersiz gün `undefined` */
export function getPrincipleByDay(day: number): DailyPrinciple | undefined {
  if (day < 1 || day > 66) return undefined;
  return DAILY_PRINCIPLES[day - 1];
}
