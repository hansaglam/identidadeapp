"""Splash görselinden Gemini logosu ve alt telif satırını kaldırır."""
from __future__ import annotations

import sys
from pathlib import Path

from PIL import Image, ImageDraw

BG = (4, 13, 22)  # #040D16 — görselin koyu arka planı


def sample_bg(img: Image.Image) -> tuple[int, int, int]:
    px = img.load()
    w, h = img.size
    samples = [px[24, h - 8], px[w - 24, h - 8], px[24, h - 40], px[w // 2, h - 6]]
    r = sum(c[0] for c in samples) // len(samples)
    g = sum(c[1] for c in samples) // len(samples)
    b = sum(c[2] for c in samples) // len(samples)
    return (r, g, b)


def clone_row_fill(img: Image.Image, y_start: int, y_end: int, x_start: int, x_end: int) -> None:
    """Üst satırdan kopyalayarak alt bandı doğal doldurur."""
    px = img.load()
    w, h = img.size
    source_y = max(0, y_start - 1)
    for y in range(y_start, min(y_end, h)):
        for x in range(max(0, x_start), min(x_end, w)):
            px[x, y] = px[x, source_y]


def remove_gemini_logo(img: Image.Image, bg: tuple[int, int, int]) -> None:
    w, h = img.size
    draw = ImageDraw.Draw(img)
    px = img.load()
    # Sağ alt köşe — yıldız (progress bar'ın altında, düz arka plan)
    draw.rectangle([w - 88, h - 48, w, h], fill=bg)
    # Progress bar ile çakışan ince glow artıkları (yıldız bölgesi)
    for y in range(h - 52, h):
        for x in range(w - 88, w):
            r, g, b = px[x, y]
            if r + g + b > 55:
                px[x, y] = bg


def remove_copyright(img: Image.Image, bg: tuple[int, int, int]) -> None:
    w, h = img.size
    draw = ImageDraw.Draw(img)
    # Alt orta — "RITO © 2024" (progress bar'ın altında)
    draw.rectangle([130, h - 28, w - 130, h], fill=bg)
    clone_row_fill(img, h - 28, h, 130, w - 130)

    # Çok soluk kalan piksel artıkları
    px = img.load()
    for y in range(h - 30, h):
        for x in range(120, w - 120):
            r, g, b = px[x, y]
            if r + g + b > 44:
                px[x, y] = px[x, max(0, h - 32)]


def main() -> None:
    root = Path(__file__).resolve().parent.parent
    default_src = root / "assets" / "splash-source.png"
    src = Path(sys.argv[1]) if len(sys.argv) > 1 else default_src
    out = root / "assets" / "splash.png"
    source_copy = root / "assets" / "splash-source.png"

    img = Image.open(src).convert("RGB")
    bg = sample_bg(img)

    remove_copyright(img, bg)
    remove_gemini_logo(img, bg)

    out.parent.mkdir(parents=True, exist_ok=True)
    if not source_copy.exists():
        Image.open(src).convert("RGB").save(source_copy)
    img.save(out, format="PNG", optimize=True)
    print(f"Saved {out} ({img.size[0]}x{img.size[1]})")


if __name__ == "__main__":
    main()
