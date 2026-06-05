# Rito legal pages (GitHub Pages)

Published by `.github/workflows/deploy-legal.yml` on push to `main`.

## Live URLs (after deploy)

- https://hansaglam.github.io/identidadeapp/privacy.html
- https://hansaglam.github.io/identidadeapp/terms.html
- https://hansaglam.github.io/identidadeapp/ (index)

## First-time setup on GitHub

1. Push `legal/` and `.github/workflows/deploy-legal.yml` to `main`.
2. Repo **Settings → Pages → Build and deployment → Source: GitHub Actions**.
3. Wait for the **Deploy legal pages** workflow to finish (Actions tab).
4. Open the URLs above in a browser (no login required).

## Edit content

Edit `privacy.html` and `terms.html` directly, then push to `main`. The workflow redeploys automatically.

App links: `src/constants/appLinks.ts` (`LEGAL_HOST`).
