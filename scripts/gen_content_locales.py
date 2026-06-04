"""Merge dailyPrinciples, mindPrompts, journeyEducation, coachNotes into locale JSON."""
import json
import re
import time
import urllib.parse
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
LOCALES = ROOT / "src" / "i18n" / "locales"
CACHE_PATH = Path(__file__).resolve().parent / "translation_cache.json"

def load_cache():
    if CACHE_PATH.exists():
        return json.loads(CACHE_PATH.read_text(encoding="utf-8"))
    return {}

def save_cache(c):
    CACHE_PATH.write_text(json.dumps(c, ensure_ascii=False, indent=2), encoding="utf-8")

def translate(text: str, target: str, cache: dict) -> str:
    key = f"{target}:{text}"
    if key in cache:
        return cache[key]
    if target == "tr":
        cache[key] = text
        return text
    langpair = "tr|en" if target == "en" else "tr|pt"
    q = urllib.parse.quote(text[:450])
    url = f"https://api.mymemory.translated.net/get?q={q}&langpair={langpair}"
    try:
        with urllib.request.urlopen(url, timeout=30) as resp:
            data = json.loads(resp.read().decode())
        out = data.get("responseData", {}).get("translatedText", text)
        if out == text and target == "pt":
            time.sleep(0.35)
            with urllib.request.urlopen(url.replace("tr|pt", "tr|pt-BR"), timeout=30) as resp:
                data = json.loads(resp.read().decode())
            out = data.get("responseData", {}).get("translatedText", text)
    except Exception:
        out = text
    cache[key] = out
    save_cache(cache)
    time.sleep(0.35)
    return out

def parse_daily_principles():
    text = (ROOT / "src/data/dailyPrinciples.ts").read_text(encoding="utf-8")
    return {
        str(d): {"principle": p, "science": s, "action": a}
        for d, ph, p, s, a in re.findall(
            r'day:\s*(\d+),\s*phase:\s*(\d+),\s*principle:\s*"([^"]+)",\s*science:\s*"([^"]+)",\s*action:\s*"([^"]+)"',
            text,
            re.DOTALL,
        )
    }

def journey_education_tr():
    text = (ROOT / "src/constants/journeyPhaseEducation.ts").read_text(encoding="utf-8")
    cards = re.findall(
        r'id:\s*"([^"]+)",\s*title:\s*"([^"]+)",\s*body:\s*"([^"]+)"',
        text,
        re.DOTALL,
    )
    result = {"1": [], "2": [], "3": []}
    for cid, title, body in cards:
        phase = "1" if cid.startswith("p1") else "2" if cid.startswith("p2") else "3"
        result[phase].append({"id": cid, "title": title, "body": body})
    return result

def mind_prompts_tr():
    text = (ROOT / "src/constants/mindDumpPrompts.ts").read_text(encoding="utf-8")
    daily = re.findall(r'"([^"]+)"', text.split("MIND_DUMP_DAILY_PROMPTS")[1].split("MIND_MODAL")[0])
    modal = re.findall(r'"([^"]+)"', text.split("MIND_MODAL_START_PHRASES")[1].split("export function")[0])
    return {"daily": daily, "modal": modal}

def coach_notes_tr():
    text = (ROOT / "src/constants/identity-copy.ts").read_text(encoding="utf-8")
    block = text.split("coachNotes:")[1].split("} as Record")[0]
    return {
        m.group(1): m.group(2)
        for m in re.finditer(r'day(\d+):\s*"([^"]+)"', block)
    }

def translate_obj(obj, target, cache):
    if isinstance(obj, str):
        return translate(obj, target, cache)
    if isinstance(obj, list):
        return [translate_obj(x, target, cache) for x in obj]
    if isinstance(obj, dict):
        return {k: translate_obj(v, target, cache) for k, v in obj.items()}
    return obj

def deep_merge(base, extra):
    for k, v in extra.items():
        if k in base and isinstance(base[k], dict) and isinstance(v, dict):
            deep_merge(base[k], v)
        else:
            base[k] = v

def main():
    cache = load_cache()
    dp_tr = parse_daily_principles()
    je_tr = journey_education_tr()
    mp_tr = mind_prompts_tr()
    cn_tr = {f"day{k}": v for k, v in coach_notes_tr().items()}

    print("Translating EN...")
    dp_en = translate_obj(dp_tr, "en", cache)
    je_en = translate_obj(je_tr, "en", cache)
    mp_en = translate_obj(mp_tr, "en", cache)
    cn_en = translate_obj(cn_tr, "en", cache)

    print("Translating PT...")
    dp_pt = translate_obj(dp_tr, "pt", cache)
    je_pt = translate_obj(je_tr, "pt", cache)
    mp_pt = translate_obj(mp_tr, "pt", cache)
    cn_pt = translate_obj(cn_tr, "pt", cache)

    for loc, dp, je, mp, cn in [
        ("tr", dp_tr, je_tr, mp_tr, cn_tr),
        ("en", dp_en, je_en, mp_en, cn_en),
        ("pt-BR", dp_pt, je_pt, mp_pt, cn_pt),
    ]:
        path = LOCALES / f"{loc}.json"
        data = json.loads(path.read_text(encoding="utf-8"))
        deep_merge(data, {
            "dailyPrinciples": dp,
            "journeyEducation": je,
            "mindPrompts": mp,
            "coachNotes": cn,
        })
        path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
        print("Wrote", path.name)

if __name__ == "__main__":
    main()
