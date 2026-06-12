# Rito legal pages (GitHub Pages)

## Canlı URL'ler (Pages açıldıktan sonra)

- https://hansaglam.github.io/identidadeapp/privacy.html
- https://hansaglam.github.io/identidadeapp/terms.html
- https://hansaglam.github.io/identidadeapp/

## 404 veya eski içerik görüyorsanız — tek seferlik GitHub ayarı

Workflow `legal/` klasörünü **gh-pages** branch'ine yazar. Canlı site güncellenmiyorsa Pages yanlış branch'ten yayınlanıyordur:

1. https://github.com/hansaglam/identidadeapp → **Settings** → **Pages**
2. **Build and deployment** → **Source:** **Deploy from a branch**
3. **Branch:** `gh-pages` · **Folder:** `/ (root)` → **Save**
4. **Actions** → **Deploy legal pages** → **Run workflow** (yeniden deploy)
5. 1–2 dakika bekleyin; privacy.html açın (Ctrl+F5)

`main` branch seçiliyse eski içerik kalır; mutlaka **gh-pages** olmalı.

Workflow elle çalıştırma: **Actions** → **Deploy legal pages** → **Run workflow**

## İçerik düzenleme

`privacy.html` / `terms.html` düzenleyip `main`'e push edin; workflow otomatik yeniden deploy eder.

Uygulama linkleri: `src/constants/appLinks.ts`
