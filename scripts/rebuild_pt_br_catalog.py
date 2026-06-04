"""Rebuild pt-BR catalog sections from EN using deep-translator (Google)."""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
LOCALES = ROOT / "src" / "i18n" / "locales"
SECTIONS = ["dailyPrinciples", "journeyEducation", "mindPrompts", "coachNotes"]
CACHE = Path(__file__).resolve().parent / "en_pt_deep_cache.json"


def load_cache():
    if CACHE.exists():
        return json.loads(CACHE.read_text(encoding="utf-8"))
    return {}


def save_cache(c):
    CACHE.write_text(json.dumps(c, ensure_ascii=False, indent=2), encoding="utf-8")


def get_translator():
    from deep_translator import GoogleTranslator
    return GoogleTranslator(source="en", target="pt")


def translate_text(text: str, cache: dict, tr) -> str:
    if not text or not str(text).strip():
        return text
    if text in cache:
        return cache[text]
    try:
        out = tr.translate(text)
    except Exception:
        out = text
    cache[text] = out
    save_cache(cache)
    return out


def translate_obj(obj, cache, tr):
    if isinstance(obj, str):
        return translate_text(obj, cache, tr)
    if isinstance(obj, list):
        return [translate_obj(x, cache, tr) for x in obj]
    if isinstance(obj, dict):
        return {k: translate_obj(v, cache, tr) for k, v in obj.items()}
    return obj


def deep_merge(base, extra):
    for k, v in extra.items():
        if k in base and isinstance(base[k], dict) and isinstance(v, dict):
            deep_merge(base[k], v)
        else:
            base[k] = v


def main():
    cache = load_cache()
    tr = get_translator()
    en = json.loads((LOCALES / "en.json").read_text(encoding="utf-8"))
    pt_path = LOCALES / "pt-BR.json"
    pt = json.loads(pt_path.read_text(encoding="utf-8"))

    for sec in SECTIONS:
        if sec not in en:
            continue
        print("Translating", sec, "...")
        pt[sec] = translate_obj(en[sec], cache, tr)

    pt_path.write_text(json.dumps(pt, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print("Wrote", pt_path.name)


if __name__ == "__main__":
    main()
