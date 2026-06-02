# Kimlik — Alışkanlık Takip Değil, Kimlik İnşası

> "Alışkanlık takip etmiyorsun. Yeni biri oluyorsun."

## Teknik Stack

| Katman | Teknoloji |
|---|---|
| Framework | React Native + Expo SDK 54 |
| Navigasyon | React Navigation 7 (`App.tsx` → `AppNavigator`) |
| State | Zustand v5 |
| Veri | AsyncStorage (offline-first; SQLite yok) |
| Animasyon | React Native Reanimated v4 |
| Bildirimler | expo-notifications |
| Tarih | date-fns v4 |
| Dil | TypeScript (strict) |

## Giriş noktası

- **Kök:** [`App.tsx`](App.tsx) — fontlar, store bootstrap, bildirimler
- **Navigasyon:** [`src/navigation/AppNavigator.tsx`](src/navigation/AppNavigator.tsx) — Auth + 4 tab (Bugün, Zihin, Yolculuk, Profil)
- **`app/` klasörü:** Opsiyonel Expo Router re-export (ör. `app/(tabs)/yolculuk.tsx`); aktif yönlendirme burada değil

## Store'lar

| Store | Açıklama |
|---|---|
| `userStore` | Profil, premium, bildirim saati |
| `checkinsStore` | Günlük check-in + otomatiklik/çaba |
| `habitStore` | Alışkanlık tanımı, günlük bayrak |
| `tomorrowPlanStore` | Yarının küçük listesi (max 3 madde) |
| `mindDumpStore` | Zihin notları |
| `useBehaviorStore` | Davranış motoru sayaçları |
| `sdtStore` | Haftalık SDT anketi |
| `iapStore` | Abonelik |

## Yedekleme

Profil → Gelişmiş tercihler → JSON yedek.

- **v1:** profil, check-in, mind dump (davranış sayacı sıfırlanır)
- **v2:** v1 + yarın planları, habit, SDT, behavior state

Şema: [`src/utils/exportBackup.ts`](src/utils/exportBackup.ts), geri yükleme: [`src/utils/restoreBackup.ts`](src/utils/restoreBackup.ts)

## Çalıştırma

```bash
cd kimlik-app
npm install
npx expo start --android
```

EAS Build:

```bash
npm install -g eas-cli
eas login
eas build --platform android --profile preview
```

## Öne çıkan özellikler

- 66 günlük kimlik yolculuğu (premium harita + faz eğitimi)
- Yarının küçük listesi (free) → ertesi gün Bugün ekranında check-in
- Check-in: hızlı teyit + otomatiklik/çaba değerlendirmesi
- Zihin dump + davranış motoru (engine)
- Offline analitik buffer + JSON yedek
