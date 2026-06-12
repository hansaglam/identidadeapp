# Rito legal pages (GitHub Pages)

## Canlı URL'ler (Pages açıldıktan sonra)

- https://hansaglam.github.io/identidadeapp/privacy.html
- https://hansaglam.github.io/identidadeapp/terms.html
- https://hansaglam.github.io/identidadeapp/

## 404 veya eski içerik görüyorsanız — tek seferlik GitHub ayarı

Workflow `legal/` klasörünü **GitHub Actions** ile Pages'e yazar:

1. https://github.com/hansaglam/identidadeapp → **Settings** → **Pages**
2. **Build and deployment** → **Source:** **GitHub Actions** (branch değil)
3. **Actions** → **Deploy legal pages** → son çalışma yeşil olmalı
4. 1–2 dakika bekleyin; tarayıcıda privacy.html URL'sini açın (gerekirse Ctrl+F5)

Eski ayar `Deploy from a branch` + `main` ise canlı site güncellenmez; mutlaka **GitHub Actions** seçin.

Workflow elle çalıştırma: **Actions** → **Deploy legal pages** → **Run workflow**

## İçerik düzenleme

`privacy.html` / `terms.html` düzenleyip `main`'e push edin; workflow otomatik yeniden deploy eder.

Uygulama linkleri: `src/constants/appLinks.ts`
