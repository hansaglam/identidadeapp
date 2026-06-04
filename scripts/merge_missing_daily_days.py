"""Add missing dailyPrinciples days 3, 28, 64 to tr/en from TS; EN fields translated to pt-BR separately."""
import json
import re
import time
import urllib.parse
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
LOCALES = ROOT / "src" / "i18n" / "locales"
MISSING = ["3", "28", "64"]


def parse_all():
    text = (ROOT / "src/data/dailyPrinciples.ts").read_text(encoding="utf-8")
    return {
        str(d): {"principle": p, "science": s, "action": a}
        for d, ph, p, s, a in re.findall(
            r'day:\s*(\d+),\s*phase:\s*(\d+),\s*principle:\s*"([^"]+)",\s*science:\s*"([^"]+)",\s*action:\s*"([^"]+)"',
            text,
            re.DOTALL,
        )
    }


def tr_en(text, cache):
    key = f"tr-en:{text}"
    if key in cache:
        return cache[key]
    q = urllib.parse.quote(text[:480])
    url = f"https://api.mymemory.translated.net/get?q={q}&langpair=tr|en"
    with urllib.request.urlopen(url, timeout=45) as resp:
        out = json.loads(resp.read().decode())["responseData"]["translatedText"]
    cache[key] = out
    time.sleep(0.4)
    return out


def en_pt(text, cache):
    key = f"en-pt:{text}"
    if key in cache:
        return cache[key]
    q = urllib.parse.quote(text[:480])
    url = f"https://api.mymemory.translated.net/get?q={q}&langpair=en|pt"
    with urllib.request.urlopen(url, timeout=45) as resp:
        out = json.loads(resp.read().decode())["responseData"]["translatedText"]
    cache[key] = out
    time.sleep(0.4)
    return out


def translate_fields_tr_en(fields, cache):
    return {k: tr_en(v, cache) for k, v in fields.items()}


def translate_fields_en_pt(fields, cache):
    return {k: en_pt(v, cache) for k, v in fields.items()}


def main():
    all_days = parse_all()
    cache = {}
    for loc in ["tr", "en", "pt-BR"]:
        path = LOCALES / f"{loc}.json"
        data = json.loads(path.read_text(encoding="utf-8"))
        dp = data.setdefault("dailyPrinciples", {})
        for day in MISSING:
            src = all_days.get(day)
            if not src:
                continue
            if loc == "tr":
                dp[day] = src
            elif loc == "en":
                dp[day] = translate_fields_tr_en(src, cache)
            else:
                en_fields = dp.get(day) or translate_fields_tr_en(src, cache)
                dp[day] = translate_fields_en_pt(en_fields, cache)
            print(loc, "day", day, "ok")
        path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


if __name__ == "__main__":
    main()
