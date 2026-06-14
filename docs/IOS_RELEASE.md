# Rito — iOS App Store release (Mac)

Bundle ID: `com.kimlik.app`  
Subscription SKU: `discipline_pro_monthly`  
Privacy: https://hansaglam.github.io/identidadeapp/privacy.html  
Support: ethemsincarbusiness@gmail.com

`ios/` is gitignored — generate it on Mac with `expo prebuild`.

---

## 1. Prerequisites

- Apple Developer Program ($99/year)
- App ID registered: `com.kimlik.app` (developer.apple.com → Identifiers)
- Mac with Xcode + Command Line Tools
- Node.js 20+

---

## 2. Clone and install

```bash
git clone https://github.com/hansaglam/identidadeapp.git
cd identidadeapp   # or kimlik-app if repo root differs
npm install
```

---

## 3. Generate native iOS project

```bash
npx expo prebuild --platform ios --clean
cd ios && pod install && cd ..
```

---

## 4. Xcode signing

```bash
open ios/*.xcworkspace
```

1. Select the app target → **Signing & Capabilities**
2. **Team:** your Apple Developer team
3. **Bundle Identifier:** `com.kimlik.app`
4. Enable **Automatically manage signing**

---

## 5. Run on simulator or device

```bash
npx expo run:ios
```

Or press **Run (▶)** in Xcode.

---

## 6. App Store Connect (web)

Before first upload:

| Item | Value |
|------|--------|
| App name | Rito: Habit & Identity Journey |
| Bundle ID | com.kimlik.app |
| Privacy URL | https://hansaglam.github.io/identidadeapp/privacy.html |
| Subscription | `discipline_pro_monthly` (auto-renewable) |
| App Privacy | No ads / no tracking; data stays on device |
| Paid Apps Agreement | Bank + tax info required for subscriptions |

Store copy: `store/STORE_LISTING.md` (TR / EN / pt-BR).

Suggested prices (match Play): TR ₺79,99 · US $2.99 · BR R$9,99 · UK £2.49 · CA CA$3.99 · AU A$4.49 · EU €2.99.

Screenshots: 6.7" iPhone required; reuse Play art resized if needed.

---

## 7. Archive and upload

1. Xcode scheme: **Any iOS Device (arm64)**
2. **Product → Archive**
3. **Distribute App → App Store Connect → Upload**

For each new upload, bump `ios.buildNumber` in `app.json`, then:

```bash
npx expo prebuild --platform ios
```

Re-archive in Xcode.

---

## 7b. App Store screenshots (paste restore)

App Store Connect accepts **PNG only**, not JSON.

1. Generate demo backup: `node store/generate-screenshot-demo-backup.mjs --locale en` (or `tr` / `pt`)
2. Open `store/screenshot-demo-backup-en.json` on Mac → **Cmd+A, Cmd+C**
3. Simulator: **Profile → DATA → Back up data → Restore by pasting** → paste → Apply (premium unlocked for screenshot demo JSON)
4. Match app language (Profile → Language) to the JSON locale
5. **iPhone 15 Pro Max** simulator → screenshot screens → **Cmd+S**
6. Upload PNGs to App Store Connect → **6.7" Display**

See `store/SCREENSHOT_DEMO.md` for screen order.

---

## 8. Test before review

- **TestFlight** internal testing
- **Sandbox Apple ID** → test `discipline_pro_monthly` purchase
- Notification permission flow (Profile / Journey toggles)
- Quick Actions (long-press app icon)

---

## 9. Submit for review

App Store Connect → your build → **Submit for Review**.

Review notes (suggested):

> No login. All data stored locally on device. Premium is an auto-renewable subscription (discipline_pro_monthly). Notifications are local reminders only.

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Pod install fails | `cd ios && pod repo update && pod install` |
| Signing error | Match bundle ID in portal + Xcode |
| IAP product not found | Create subscription in App Store Connect; wait ~1h |
| Build number rejected | Increment `ios.buildNumber` in `app.json` |

---

## Android vs iOS IDs

| Platform | ID |
|----------|-----|
| iOS | `com.kimlik.app` |
| Android | `com.kimlik.app` |

Same subscription product ID on both stores: `discipline_pro_monthly`.
