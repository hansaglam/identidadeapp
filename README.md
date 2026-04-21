# Kimlik — Alışkanlık Takip Değil, Kimlik İnşası

> "Alışkanlık takip etmiyorsun. Yeni biri oluyorsun."

## Teknik Stack

| Katman | Teknoloji |
|---|---|
| Framework | React Native + Expo SDK 54 |
| Navigasyon | Expo Router v6 (file-based) |
| State | Zustand v5 |
| Veritabanı | expo-sqlite (SQLite — offline-first) |
| Animasyon | React Native Reanimated v4 |
| Bildirimler | expo-notifications |
| Tarih | date-fns v4 |
| Dil | TypeScript (strict) |

## Proje Yapısı

```
kimlik-app/
├── app/
│   ├── _layout.tsx           # Root layout (DB init + store bootstrap)
│   ├── index.tsx             # Onboarding/tabs yönlendirici
│   ├── onboarding.tsx        # 4-adım kimlik onboardingi
│   ├── (tabs)/
│   │   ├── _layout.tsx       # Tab bar
│   │   ├── index.tsx         # Bugün ekranı (daily habit check-in)
│   │   ├── identity.tsx      # Kimlik/ilerleme ekranı
│   │   └── settings.tsx      # Ayarlar
│   └── habit/
│       ├── new.tsx           # 4-adım alışkanlık oluşturucu
│       └── [id].tsx          # Alışkanlık detayı + 66-gün grid
├── src/
│   ├── types/index.ts        # TypeScript tipleri
│   ├── constants/theme.ts    # Renkler, spacing, kimlik mesajları
│   ├── db/database.ts        # SQLite CRUD işlemleri
│   ├── store/
│   │   ├── habitStore.ts     # Habit state + streak hesaplama
│   │   └── userStore.ts      # Kullanıcı profili
│   ├── components/
│   │   ├── HabitCard.tsx     # Günlük alışkanlık kartı
│   │   ├── ProgressRing.tsx  # SVG ilerleme halkası
│   │   ├── DayGrid.tsx       # 66-gün ısı haritası
│   │   └── EmptyState.tsx    # Boş durum bileşeni
│   └── utils/
│       ├── uuid.ts           # UUID üretici
│       └── notifications.ts  # Bildirim yardımcıları
```

## Çalıştırma

```bash
cd kimlik-app
npm install
npx expo start --android
```

EAS Build ile APK üretmek için:
```bash
npm install -g eas-cli
eas login
eas build --platform android --profile preview
```

## Öne Çıkan Özellikler

- **Kimlik tabanlı framing**: Her alışkanlık "Ben bir ___ im" kimliğine bağlı
- **Tiny Habits çapalama**: "Kahvemi aldıktan sonra..." trigger sistemi
- **66-gün ısı haritası**: Her tamamlama görsel olarak işaretlenir
- **Seri takibi**: Şimdiki + en uzun seri hesaplaması
- **Kilometre taşı mesajları**: 7, 14, 21, 30, 50, 66. günlerde özel mesajlar
- **Kimlik seviyesi**: Tohum → Filiz → Dal → Ağaç → Meşe
- **Offline-first**: Tüm veri SQLite'da, internet gerekmez
- **Dark theme**: #0A0A0F zemin üzerine mor/turkuaz aksanlar
