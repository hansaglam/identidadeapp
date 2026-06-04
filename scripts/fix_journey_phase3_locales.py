"""Fix journeyEducation phase 3 cards p3-3/p3-4 + normalize card ids in en/pt-BR."""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
LOCALES = ROOT / "src" / "i18n" / "locales"

FIX_EN = {
    "p3-3": {
        "title": "Identity reinforcement",
        "body": "As you approach day 66, the goal isn't just to close a box — it's to align this behaviour with your sense of self. The more you feel 'I chose this', the more likely you are to keep going (close to subjective autonomy in SDT language).",
    },
    "p3-4": {
        "title": "A line for the automation phase",
        "body": "The goal is no longer a 'perfect day' but recovering quickly when you slip. The long road is the sum of small repairs. Even the smallest reconnection today carries you forward.",
    },
}

FIX_PT = {
    "p3-3": {
        "title": "Reforço de identidade",
        "body": "Ao se aproximar do dia 66, o objetivo não é só fechar uma caixa — é alinhar esse comportamento com o seu senso de si. Quanto mais você sentir 'eu escolhi isso', maior a chance de continuar (próximo da autonomia subjetiva na linguagem da SDT).",
    },
    "p3-4": {
        "title": "Uma frase para a fase de automatização",
        "body": "O objetivo já não é o 'dia perfeito', e sim se recuperar rápido quando escorregar. A estrada longa é a soma de pequenos reparos. Até a menor reconexão de hoje te leva adiante.",
    },
}


def normalize_ids(cards):
    for c in cards:
        c["id"] = c["id"].lower()


def apply_fix(data, fixes):
    for phase in ("1", "2", "3"):
        cards = data.get("journeyEducation", {}).get(phase, [])
        normalize_ids(cards)
        for c in cards:
            hit = fixes.get(c["id"])
            if hit:
                c["title"] = hit["title"]
                c["body"] = hit["body"]


def main():
    en = json.loads((LOCALES / "en.json").read_text(encoding="utf-8"))
    pt = json.loads((LOCALES / "pt-BR.json").read_text(encoding="utf-8"))
    apply_fix(en, FIX_EN)
    apply_fix(pt, FIX_PT)
    (LOCALES / "en.json").write_text(json.dumps(en, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    (LOCALES / "pt-BR.json").write_text(json.dumps(pt, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print("Fixed journey phase 3 + ids")


if __name__ == "__main__":
    main()
