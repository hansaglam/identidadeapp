# Play Store screenshot demo yedeği

Uygulama koduna **dokunmaz**. Sadece test cihazına geçici veri yükler; işin bitince silebilirsin.

## Hızlı kullanım

1. **Yedeği üret** (tarihler ve ISO haftalar bugüne göre ayarlanır):

   ```bash
   cd kimlik-app
   node store/generate-screenshot-demo-backup.mjs
   ```

2. `screenshot-demo-backup.json` dosyasını telefona aktar (Drive, e-posta, USB).

3. Uygulamada: **Profil → VERİ → Verileri yedekle** → **JSON dosyasından geri yükle** (veya yapıştırarak).

4. Uygulamayı kapat-aç (veya geri yükleme sonrası otomatik yenilenir).

5. Screenshot sırası:

   | # | Sekme | Ne çek |
   |---|--------|--------|
   | 1 | Bugün | Disiplin Skoru kartı |
   | 2 | Profil | Dayanıklılık kartı |
   | 3 | Profil | Bu hafta (haftalık rapor) |
   | 4 | Bugün | Günün adımı + check-in (bugün tamamlanmamış) |
   | 5 | Yolculuk / Zihin | Yolculuk + notlar |

6. Canva’da başlık/alt metin ekle (Play listing metinleri).

## Demo veride ne var?

- ~40 günlük yolculuk
- Dayanıklılık: ~7 düşüş serisi, ~6 geri dönüş, ~%86 oran
- Haftalık kas: **+4 Direnç Yönetimi** (geçen hafta snapshot → bu hafta)
- Bugün check-in **yapılmamış** (Screenshot 4)
- İlk geri dönüş modalı **kapalı** (`firstComebackCelebrated: true`)
- 5 Mind Dump notu (Yolculuk / kimlik hikâyesi)

Skor tam 67 olmayabilir; birkaç aksiyon/check-in sonrası ~60–75 bandına gelir — screenshot için yeterli.

## Önemli: Premium

Geri yükleme güvenlik nedeniyle `isPremium: false` yapar (`restoreBackup.ts`).

**Yolculuk premium ekranı** için:

- Play Console → **License testing** → kendi Gmail’ini ekle
- Geri yüklemeden sonra uygulamada test satın alma ile Premium aç, veya
- Free Yolculuk teaser + Zihin sekmesini screenshot’la (Timeline yok — Sprint 3)

## Temizlik (sonra sil)

| Ne | Nasıl |
|----|--------|
| Telefon verisi | Profil → tüm verileri sil / uygulamayı kaldır |
| Repo dosyası | `store/screenshot-demo-backup.json` sil (isteğe bağlı) |
| Bu klasör | `generate-*.mjs` ve `SCREENSHOT_DEMO.md` kalabilir — uygulamaya girmez |

## Dosyalar

- `generate-screenshot-demo-backup.mjs` — yedeği yeniden üret
- `screenshot-demo-backup.json` — git’e commit etmek zorunda değilsin (`.gitignore`’a eklenebilir)

## Sorun giderme

| Sorun | Çözüm |
|-------|--------|
| Kas delta görünmüyor | Script’i **bugün** tekrar çalıştır (hafta anahtarları güncellenir) |
| Dayanıklılık “test edilmedi” | Geri yükleme başarısız; JSON’u tekrar seç |
| Dil İngilizce | Uygulama dilini TR yap screenshot öncesi |
