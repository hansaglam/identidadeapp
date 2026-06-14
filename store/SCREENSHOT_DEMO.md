# Screenshot demo yedeği (Play Store + App Store)

Uygulama koduna **dokunmaz**. Sadece test cihazına geçici veri yükler; işin bitince silebilirsin.

## Hızlı kullanım

1. **Yedeği üret** (tarihler ve ISO haftalar bugüne göre ayarlanır):

   ```bash
   cd kimlik-app
   node store/generate-screenshot-demo-backup.mjs --all
   ```

   Tek dil: `--locale tr` | `en` | `pt`

2. **Veriyi yükle**

   | Platform | Yöntem |
   |----------|--------|
   | **iOS / Mac simulator** | `store/screenshot-demo-backup*.json` → metin editöründe **Cmd+A, Cmd+C** → uygulama: **Profil → VERİ → Verileri yedekle → Yapıştırarak geri yükle** |
   | **Android** | Dosyadan geri yükle veya yapıştırarak |

3. Uygulama dilini JSON ile eşleştir (EN için `-en.json` + Profil → Dil → English).

4. Screenshot sırası:

   | # | Sekme | Ne çek |
   |---|--------|--------|
   | 1 | Bugün | Disiplin Skoru kartı |
   | 2 | Profil | Dayanıklılık kartı |
   | 3 | Profil | Bu hafta (haftalık rapor) |
   | 4 | Bugün | Günün adımı + check-in (bugün tamamlanmamış) |
   | 5 | Yolculuk / Zihin | Yolculuk + notlar |

5. **App Store:** Simulator'da **Cmd+S** → PNG'leri App Store Connect'e yükle.

6. **Play Store:** Canva'da başlık/alt metin ekle (listing metinleri).

## Demo veride ne var?

- ~40 günlük yolculuk
- Dayanıklılık: ~7 düşüş serisi, ~6 geri dönüş, ~%86 oran
- Haftalık kas: **+4 Direnç Yönetimi** (geçen hafta snapshot → bu hafta)
- Bugün check-in **yapılmamış** (Screenshot 4)
- İlk geri dönüş modalı **kapalı** (`firstComebackCelebrated: true`)
- 5 Mind Dump notu (Yolculuk / kimlik hikâyesi)

Skor tam 67 olmayabilir; birkaç aksiyon/check-in sonrası ~60–75 bandına gelir — screenshot için yeterli.

## Premium (screenshot demo)

`store/screenshot-demo-backup*.json` profil kimliği `screenshot-demo-` ile başlar. Geri yüklemede **`isPremium: true` korunur** — Yolculuk ve diğer premium ekranlar sandbox satın alma olmadan açılır.

Normal kullanıcı yedeklerinde premium yine sıfırlanır (güvenlik).

## Temizlik (sonra sil)

| Ne | Nasıl |
|----|--------|
| Telefon verisi | Profil → tüm verileri sil / uygulamayı kaldır |
| Repo dosyası | `store/screenshot-demo-backup.json` sil (isteğe bağlı) |
| Bu klasör | `generate-*.mjs` ve `SCREENSHOT_DEMO.md` kalabilir — uygulamaya girmez |

## Dosyalar

- `generate-screenshot-demo-backup.mjs` — yedeği yeniden üret
- `screenshot-demo-backup.json` — Türkçe
- `screenshot-demo-backup-en.json` — İngilizce içerik (notlar, why)
- `screenshot-demo-backup-pt.json` — Portekizce içerik

## Sorun giderme

| Sorun | Çözüm |
|-------|--------|
| Kas delta görünmüyor | Script’i **bugün** tekrar çalıştır (hafta anahtarları güncellenir) |
| Dayanıklılık “test edilmedi” | Geri yükleme başarısız; JSON’u tekrar seç |
| Dil EN/PT | İlgili JSON’u geri yükle (`-en` / `-pt`), uygulama dilini eşleştir |
| Çapa Türkçe kalıyor | Script’i `--all` ile çalıştır; `habitAnchor` artık `after_morning_drink` ID |
