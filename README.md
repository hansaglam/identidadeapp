# Rito — Habit & Identity Journey

> **Rito** (*Alışkanlık ve Kimlik Yolculuğu*) — "Alışkanlık takip etmiyorsun. Yeni biri oluyorsun."

Mağaza adı (EN): **Rito: Habit & Identity Journey**

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
- **Marka sabitleri:** [`src/constants/brand.ts`](src/constants/brand.ts)
- **`app/` klasörü:** Opsiyonel Expo Router re-export (ör. `app/(tabs)/yolculuk.tsx`); aktif yönlendirme burada değil

## Store'lar

| Store | Açıklama |
|---|---|
| `userStore` | Profil, premium, bildirim saati |
| `checkinsStore` | Günlük check-in + otomatiklik/çaba |
| `habitStore` | Alışkanlık tanımı, günlük bayrak |

## Yayın notları

- **Bundle ID:** `com.kimlik.app` (iOS + Android)
- iOS App Store: Mac adımları → [`docs/IOS_RELEASE.md`](docs/IOS_RELEASE.md)
- Paket kimliği değişikliği sonrası native rebuild gerekir: `npx expo prebuild --clean` veya `npx expo run:android` / `run:ios`
- Hukuki metinler: [`PRIVACY.md`](PRIVACY.md), [`TERMS.md`](TERMS.md) — yayın öncesi URL'leri [`src/constants/appLinks.ts`](src/constants/appLinks.ts) içinde güncelle
