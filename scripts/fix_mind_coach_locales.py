"""Fix mindPrompts + coachNotes in en.json and pt-BR.json (were Turkish)."""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
LOCALES = ROOT / "src" / "i18n" / "locales"

MIND_EN = {
    "daily": [
        "What single thing occupied your mind most today?",
        "What are you thinking but haven't said out loud?",
        "One small detail you're grateful for today?",
        "One clear intention sentence for tomorrow?",
        "Which thought kept you stuck today?",
        "What's the smallest step you promised yourself today?",
        "What do you feel in your body right now — one word?",
        "What did you put off today, and why?",
        "One sentence that reminds you who you are today?",
        "Your energy is 1–10 today; if low, what can you shrink?",
        "The moment you're proudest of today (even if small)?",
        "One load you want to let go of right now?",
        "When did you notice your anchor (trigger) today?",
        "What will you do in the first 2 minutes tomorrow morning?",
    ],
    "modal": [
        "What occupied my mind most today...",
        "What I'm thinking but haven't said out loud...",
        "A small detail I'm grateful for...",
        "One clear intention for tomorrow...",
        "What I actually put off today...",
        "The smallest step I promised myself...",
    ],
}

MIND_PT = {
    "daily": [
        "Qual é a única coisa que mais ocupa sua mente hoje?",
        "O que passa pela sua cabeça agora e você não disse em voz alta?",
        "Um pequeno detalhe pelo qual você é grato hoje?",
        "Uma frase clara de intenção para amanhã?",
        "Qual pensamento te deixou parado hoje?",
        "Qual é o menor passo que você prometeu a si mesmo hoje?",
        "O que você sente no corpo agora — uma palavra?",
        "O que você adiou hoje e por quê?",
        "Uma frase que lembra quem você é hoje?",
        "Sua energia hoje é 1–10; se estiver baixa, o que pode diminuir?",
        "O momento de maior orgulho hoje (mesmo pequeno)?",
        "Qual é a única carga que você quer soltar agora?",
        "Quando você percebeu sua âncora (gatilho) hoje?",
        "O que você fará nos primeiros 2 minutos de amanhã?",
    ],
    "modal": [
        "O que mais ocupa minha mente hoje...",
        "O que passa pela minha cabeça e não disse em voz alta...",
        "Um pequeno detalhe pelo qual sou grato...",
        "Uma intenção clara para amanhã...",
        "O que na verdade adiei hoje...",
        "O menor passo que prometi a mim mesmo...",
    ],
}

COACH_EN = {
    "day7": "The first week is behind you. The anchor is settling in — it gets easier now.",
    "day14": "Two weeks. New connections are forming in the brain. Even if you don't feel it.",
    "day22": "Critical point. Those who reach here usually finish.",
    "day30": "30 days. The question is no longer 'are you doing it?' but 'who are you becoming?'",
    "day44": "Phase 2 is done. You're not choosing anymore — you're doing.",
    "day66": "66 days. This is yours now — no one can take it.",
}

COACH_PT = {
    "day7": "A primeira semana ficou para trás. A âncora está se instalando — agora fica mais fácil.",
    "day14": "Duas semanas. Novas conexões se formam no cérebro. Mesmo que você não perceba.",
    "day22": "Ponto crítico. Quem chega aqui em geral termina.",
    "day30": "30 dias. A pergunta já não é 'está fazendo?' e sim 'quem está se tornando?'",
    "day44": "A fase 2 terminou. Você não escolhe mais — faz.",
    "day66": "66 dias. Isso é seu agora — ninguém tira.",
}


def main():
    for loc, mind, coach in [
        ("en", MIND_EN, COACH_EN),
        ("pt-BR", MIND_PT, COACH_PT),
    ]:
        path = LOCALES / f"{loc}.json"
        data = json.loads(path.read_text(encoding="utf-8"))
        data["mindPrompts"] = mind
        data["coachNotes"] = coach
        path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
        print("Fixed", path.name)


if __name__ == "__main__":
    main()
