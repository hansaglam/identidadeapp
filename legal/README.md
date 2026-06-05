# Rito legal pages (GitHub Pages)

## Canlı URL'ler (Pages açıldıktan sonra)

- https://hansaglam.github.io/identidadeapp/privacy.html
- https://hansaglam.github.io/identidadeapp/terms.html
- https://hansaglam.github.io/identidadeapp/

## 404 görüyorsanız — tek seferlik GitHub ayarı

Workflow `legal/` klasörünü **gh-pages** branch'ine yazar. Sayfanın yayına girmesi için:

1. https://github.com/hansaglam/identidadeapp → **Settings** → **Pages**
2. **Build and deployment** → **Source:** **Deploy from a branch**
3. **Branch:** `gh-pages` · **Folder:** `/ (root)` → **Save**
4. 1–2 dakika bekleyin; **Actions** sekmesinde “Deploy legal pages” yeşil olmalı
5. Tarayıcıda privacy.html URL'sini açın

Workflow elle çalıştırma: **Actions** → **Deploy legal pages** → **Run workflow**

## İçerik düzenleme

`privacy.html` / `terms.html` düzenleyip `main`'e push edin; workflow otomatik yeniden deploy eder.

Uygulama linkleri: `src/constants/appLinks.ts`
