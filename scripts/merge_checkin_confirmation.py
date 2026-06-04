"""Merge checkInConfirmation into tr/en/pt-BR locale files."""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
LOCALES = ROOT / "src" / "i18n" / "locales"

UI_TR = {
    "subtitle": "Hızlıca kaydet, detayları sonra düşün",
    "other": "Diğer",
    "otherPlaceholder": "Kısaca yaz...",
    "save": "Kaydet ve Tamamla",
}

UI_EN = {
    "subtitle": "Save quickly — you can think through the details later",
    "other": "Other",
    "otherPlaceholder": "Write briefly...",
    "save": "Save and complete",
}

UI_PT = {
    "subtitle": "Salve rápido — os detalhes podem vir depois",
    "other": "Outro",
    "otherPlaceholder": "Escreva em poucas palavras...",
    "save": "Salvar e concluir",
}

COPY_TR = {
    "custom": {
        "title": "Bugün bu kimlik yönünde neredeydin?",
        "options": [
            "İstediğim gibi ilerledim",
            "Kısmen yaptım, yarıda kaldı",
            "Zorlandım ama denedim",
            "Enerjim düşüktü",
            "Başka öncelikler aldı",
            "Hızlıca not almak yeterli oldu",
        ],
    },
    "mental-clarity": {
        "title": "Zihin berraklığı için bugün ne yakaladın?",
        "options": [
            "Kaygıyı/düşünceyi not ettim",
            "Zihnimi toparladım",
            "Çok kısa da olsa nefes aldım",
            "Kararsızlığı azalttım",
            "Sadece fark ettim",
            "Henüz olmadı",
        ],
    },
    "moving-body": {
        "title": "Hareket tarafında bugün ne oldu?",
        "options": [
            "Planladığım hareketi yaptım",
            "Kısa bir hareket yeterliydi",
            "Yürüyüş / esneme bile sayılır",
            "Zaman yetmedi",
            "Vücudumu dinledim",
            "Yarım kaldı",
        ],
    },
    "lifelong-learner": {
        "title": "Öğrenme rutininde bugün neresin?",
        "options": [
            "Küçük bir şey okudum/izledim",
            "Not aldım veya tekrar ettim",
            "Tek adım attım",
            "Bugün olmadı",
            "Sadece merak ettim",
            "Yarın telafi ederim",
        ],
    },
    "self-care": {
        "title": "Kendine bakım için bugün ne var?",
        "options": [
            "Küçük bir iyilik yaptım",
            "Dinlenmeye izin verdim",
            "Sınır koydum / hayır dedim",
            "Kısa mola verdim",
            "Farkındalık anı oldu",
            "Bugün zordu",
        ],
    },
    "creator": {
        "title": "Üretkenlik / yaratıcılık tarafında bugün?",
        "options": [
            "Üzerinde çalıştım",
            "Taslak veya fikir çıktı",
            "Az da olsa ilerleme",
            "Beklentimi düşürdüm",
            "Sadece başlamak yetti",
            "Olmadı",
        ],
    },
    "deep-focus": {
        "title": "Odak için bugün ne söylersin?",
        "options": [
            "Derin çalışma bloğu yaptım",
            "Tek göreve kilitlendim",
            "Dikkat dağıtıcıyı kestim",
            "Kısa blok bile işe yaradı",
            "Bugün dağınıktı",
            "Denemedim",
        ],
    },
    "night-owl": {
        "title": "Akşam rutininde bugün neresin?",
        "options": [
            "Planladığım adımı yaptım",
            "Enerji düşük ama denedim",
            "Erken pes ettim",
            "Gün yoğundu",
            "Tek küçük şey",
            "Yarına bıraktım",
        ],
    },
    "social-builder": {
        "title": "Bağlantı / iletişim tarafında bugün?",
        "options": [
            "Birine ulaştım / yazdım",
            "Minik bir etkileşim",
            "Dinledim veya destek oldum",
            "Kendime zaman ayırdım",
            "Bugün yalnız hissettim",
            "Atladım",
        ],
    },
}

COPY_EN = {
    "custom": {
        "title": "Where were you today on this identity path?",
        "options": [
            "I progressed as I wanted",
            "I did it partly, left it unfinished",
            "I struggled but tried",
            "My energy was low",
            "Other priorities took over",
            "A quick note was enough",
        ],
    },
    "mental-clarity": {
        "title": "What did you catch today for mental clarity?",
        "options": [
            "I noted the anxiety/thought",
            "I gathered my thoughts",
            "I took a breath, even briefly",
            "I reduced indecision",
            "I just noticed",
            "Not yet",
        ],
    },
    "moving-body": {
        "title": "What happened today on the movement side?",
        "options": [
            "I did the movement I planned",
            "A short movement was enough",
            "Even a walk / stretch counts",
            "I ran out of time",
            "I listened to my body",
            "Left it half-done",
        ],
    },
    "lifelong-learner": {
        "title": "Where are you in your learning routine today?",
        "options": [
            "I read/watched something small",
            "I took notes or reviewed",
            "I took one step",
            "Didn't happen today",
            "I only got curious",
            "I'll make up for it tomorrow",
        ],
    },
    "self-care": {
        "title": "What did you do for self-care today?",
        "options": [
            "I did a small kindness for myself",
            "I allowed myself to rest",
            "I set a boundary / said no",
            "I took a short break",
            "There was a moment of awareness",
            "Today was hard",
        ],
    },
    "creator": {
        "title": "How was productivity / creativity today?",
        "options": [
            "I worked on it",
            "A draft or idea came out",
            "Some progress, even small",
            "I lowered my expectations",
            "Starting was enough",
            "Didn't happen",
        ],
    },
    "deep-focus": {
        "title": "What would you say about focus today?",
        "options": [
            "I did a deep work block",
            "I locked onto one task",
            "I cut a distraction",
            "Even a short block helped",
            "Today was scattered",
            "I didn't try",
        ],
    },
    "night-owl": {
        "title": "Where are you in your evening routine today?",
        "options": [
            "I did the step I planned",
            "Energy was low but I tried",
            "I gave up early",
            "The day was busy",
            "One small thing",
            "Left it for tomorrow",
        ],
    },
    "social-builder": {
        "title": "How was connection / communication today?",
        "options": [
            "I reached out / wrote to someone",
            "A tiny interaction",
            "I listened or supported",
            "I made time for myself",
            "I felt alone today",
            "Skipped it",
        ],
    },
}

COPY_PT = {
    "custom": {
        "title": "Onde você esteve hoje nesse caminho de identidade?",
        "options": [
            "Avancei como queria",
            "Fiz em parte, ficou pela metade",
            "Foi difícil, mas tentei",
            "Minha energia estava baixa",
            "Outras prioridades tomaram conta",
            "Uma nota rápida bastou",
        ],
    },
    "mental-clarity": {
        "title": "O que você captou hoje para clareza mental?",
        "options": [
            "Anotei a ansiedade/pensamento",
            "Organizei meus pensamentos",
            "Respirei, mesmo que por pouco",
            "Reduzi a indecisão",
            "Só percebi",
            "Ainda não",
        ],
    },
    "moving-body": {
        "title": "O que aconteceu hoje no lado do movimento?",
        "options": [
            "Fiz o movimento que planejei",
            "Um movimento curto bastou",
            "Até caminhada/alongamento conta",
            "Não deu tempo",
            "Ouvir meu corpo",
            "Ficou pela metade",
        ],
    },
    "lifelong-learner": {
        "title": "Onde você está na rotina de aprendizado hoje?",
        "options": [
            "Li/assisti algo pequeno",
            "Anotei ou revisei",
            "Dei um passo",
            "Hoje não rolou",
            "Só fiquei curioso",
            "Compenso amanhã",
        ],
    },
    "self-care": {
        "title": "O que você fez por autocuidado hoje?",
        "options": [
            "Fiz um pequeno favor a mim",
            "Permiti descansar",
            "Coloquei um limite / disse não",
            "Pausa curta",
            "Houve um momento de consciência",
            "Hoje foi difícil",
        ],
    },
    "creator": {
        "title": "Como foi produtividade / criatividade hoje?",
        "options": [
            "Trabalhei nisso",
            "Saiu um rascunho ou ideia",
            "Algum progresso, mesmo pequeno",
            "Baixei expectativas",
            "Começar bastou",
            "Não aconteceu",
        ],
    },
    "deep-focus": {
        "title": "O que você diria sobre foco hoje?",
        "options": [
            "Bloco de trabalho profundo",
            "Travei em uma tarefa",
            "Cortei uma distração",
            "Até bloco curto ajudou",
            "Hoje foi disperso",
            "Não tentei",
        ],
    },
    "night-owl": {
        "title": "Onde você está na rotina noturna hoje?",
        "options": [
            "Fiz o passo planejado",
            "Energia baixa, mas tentei",
            "Desisti cedo",
            "Dia cheio",
            "Uma coisa pequena",
            "Deixei para amanhã",
        ],
    },
    "social-builder": {
        "title": "Como foi conexão / comunicação hoje?",
        "options": [
            "Falei com alguém / escrevi",
            "Interação mínima",
            "Ouvir ou apoiar",
            "Tempo para mim",
            "Me senti sozinho hoje",
            "Pulei",
        ],
    },
}


def deep_merge(base, extra):
    for k, v in extra.items():
        if k in base and isinstance(base[k], dict) and isinstance(v, dict):
            deep_merge(base[k], v)
        else:
            base[k] = v


def build(ui, copy):
    out = dict(ui)
    for slug, data in copy.items():
        out[slug] = data
    return out


def main():
    for loc, ui, copy in [
        ("tr", UI_TR, COPY_TR),
        ("en", UI_EN, COPY_EN),
        ("pt-BR", UI_PT, COPY_PT),
    ]:
        path = LOCALES / f"{loc}.json"
        data = json.loads(path.read_text(encoding="utf-8"))
        deep_merge(data, {"checkInConfirmation": build(ui, copy)})
        path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
        print("Wrote", path.name, "checkInConfirmation")


if __name__ == "__main__":
    main()
