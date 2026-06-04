"""Merge Turkish catalog content from source files into tr.json."""
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
LOCALES = ROOT / "src" / "i18n" / "locales"

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
    return {f"day{m.group(1)}": m.group(2) for m in re.finditer(r'day(\d+):\s*"([^"]+)"', block)}

def deep_merge(base, extra):
    for k, v in extra.items():
        if k in base and isinstance(base[k], dict) and isinstance(v, dict):
            deep_merge(base[k], v)
        else:
            base[k] = v

def main():
    path = LOCALES / "tr.json"
    data = json.loads(path.read_text(encoding="utf-8"))
    deep_merge(data, {
        "dailyPrinciples": parse_daily_principles(),
        "journeyEducation": journey_education_tr(),
        "mindPrompts": mind_prompts_tr(),
        "coachNotes": coach_notes_tr(),
    })
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print("Wrote tr.json catalog content")

if __name__ == "__main__":
    main()
