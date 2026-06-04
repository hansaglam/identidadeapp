"""Immediate PT fix for day-1 coach, journey phase-1, mind prompts (from EN quality copy)."""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
path = ROOT / "src/i18n/locales/pt-BR.json"
data = json.loads(path.read_text(encoding="utf-8"))

snippet = {
    "dailyPrinciples": {
        "1": {
            "principle": "Começar é centenas de vezes mais importante do que aperfeiçoar.",
            "science": "Tarefas abertas (Zeigarnik): a ação iniciada empurra a mente a fechar o ciclo.",
            "action": "Hoje, reduza o hábito à menor versão e comece apenas uma vez.",
        }
    },
    "journeyEducation": {
        "1": [
            {
                "id": "p1-1",
                "title": "Enquanto o cérebro processa a nova rotina",
                "body": "Na primeira fase, o córtex frontal fica mais ativo: o movimento costuma exigir escolha consciente. O cérebro reserva atenção para um novo padrão; isso não é fraqueza, é o custo do aprendizado. Nos primeiros dias, passos pequenos e concluíveis geram menos resistência do que planos grandes.",
            },
            {
                "id": "p1-2",
                "title": "De onde vem a resistência?",
                "body": "Enquanto o hábito ainda não é automático, o padrão nos gânglios da base não está claro; por isso o corpo às vezes diz não. Evitar é normal. O objetivo não é zero evitação — é escolher o menor retorno em vez da culpa.",
            },
            {
                "id": "p1-3",
                "title": "Pequena recompensa, longa distância",
                "body": "No início, grandes recompensas são raras; o cérebro pode buscar conforto imediato. Um pequeno passo concluído aumenta a sensação de fechamento. Reduza a vitória de hoje ao corpo ou a uma frase — prova suficiente para a jornada longa.",
            },
            {
                "id": "p1-4",
                "title": "Uma frase para a fase de instalação",
                "body": "Nesta fase vencem contexto e repetição: mesma sequência, mesma pista, mesma âncora. Mantenha a frase de identidade curta; cada repetição é um voto em você. Disciplina aqui é prática de lembrete, não desempenho.",
            },
        ]
    },
    "mindPrompts": {
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
    },
    "coachNotes": {
        "day7": "A primeira semana ficou para trás. A âncora está se instalando — agora fica mais fácil.",
        "day14": "Duas semanas. Novas conexões se formam no cérebro. Mesmo que você não perceba.",
        "day22": "Ponto crítico. Quem chega aqui em geral termina.",
        "day30": "30 dias. A pergunta já não é 'está fazendo?' e sim 'quem está se tornando?'",
        "day44": "Fase 2 terminou. Você não escolhe mais — faz.",
        "day66": "66 dias. Isso é seu agora — ninguém tira.",
    },
}


def deep_merge(base, extra):
    for k, v in extra.items():
        if k in base and isinstance(base[k], dict) and isinstance(v, dict):
            deep_merge(base[k], v)
        else:
            base[k] = v


deep_merge(data, snippet)
path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
print("Merged PT snippet")
