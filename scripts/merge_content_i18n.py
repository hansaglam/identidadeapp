import json
from pathlib import Path

LOCALES = Path(__file__).resolve().parents[1] / "src" / "i18n" / "locales"

EXTRA = {
  "tr": {
    "behavior": {
      "reason": {
        "interrupt": "Düşüş yakalandı. Tek hareket yeter: {{title}}",
        "mindDumpMulti": "Son notlarında \"{{hint}}\" yankılanıyor — şimdi: {{title}}.",
        "mindDumpSingle": "\"{{keyword}}\" yansıdı — şimdi: {{title}}.",
        "highEffort": "Dün {{effort}}/10 zorlandın. Bugün küçültüyoruz: {{title}}",
        "coldStart": "İlk günler: küçük ve net bir adım. {{title}}",
        "declining": "Son günlerde yol zorlandı. Yumuşak bir sıçrama: {{title}}",
        "improving": "Son günler iyi gidiyor. Bu ritmi koru: {{title}}",
        "momentumDown": "Son 2 gündür düştün. Şimdi tekrar başlıyoruz: {{title}}",
        "momentumUp": "İyi gidiyorsun. Devam et: {{title}}"
      },
      "situation": {
        "home": "Bağlam · ev: en küçük sürüm bile yeter.",
        "work": "Bağlam · iş arası: 1–2 dk net hareket.",
        "travel": "Bağlam · seyahat: ortama uyan tek mikro-adım."
      }
    },
    "journey": {
      "tomorrowPlan": {
        "bridgeTitle": "Yarını bugünden planla",
        "bridgeBody": "Ana ekrandaki check-in ve mikro adımlar bu listeyle uyumlu. Yarın sabah net bir çapa bırak.",
        "sectionLabel": "YARININ KÜÇÜK LİSTESİ",
        "kicker": "Yarın otomatikleşsin diye",
        "action": "1 ana adımı netleştir",
        "statusTomorrow": "Yarın",
        "addMeta": "Saat veya tetikleyici ekleyebilirsin",
        "addSupport": "Küçük madde ekle",
        "limitHint": "3 madde yeterli — basit tut.",
        "resetList": "Listeyi sıfırla",
        "emptyTitle": "Yarın için küçük liste kur",
        "emptySub": "Tek ana mikro adımı seç. Sabah hatırlatma gelir, check-in Bugün ekranından yapılır.",
        "addFirst": "İlk maddeyi ekle"
      },
      "mapTeaser": {
        "sectionLabel": "66 GÜN · ÖNİZLEME",
        "hint": "Yarın planın ücretsiz. Aktif faza dokun — kısa önizleme; tam gün özeti ve harita premium.",
        "badgeActive": "Şu an · Faz {{id}}",
        "stats": "Bu fazda {{done}}/{{total}} gün tamamlandı",
        "unlockCta": "Tam haritayı aç"
      },
      "phases": {
        "1": {"label": "Kuruluş", "days": "Gün 1–22", "subtitle": "Tiny Habits devreye giriyor. Çapayı kur, küçük kal."},
        "2": {"label": "Pekiştirme", "days": "Gün 23–44", "subtitle": "Kimlik dönüşümü başlıyor. 'Yapan biri' olmaktan 'olan biri' olmaya."},
        "3": {"label": "Otomatikleşme", "days": "Gün 45–66", "subtitle": "Nöral yol tamamlanıyor. Artık enerji harcamadan yapıyorsun."}
      }
    },
    "identityTemplates": {
      "clear_mind": {
        "title": "Zihni berrak biri",
        "identityStatement": "Ben, zihni berrak ve önceliklerini bilen biriyim.",
        "mirror": {
          "lowEnergy": "Zihni berrak biri olarak bugün sadece Zihin sekmesini açman yeter. Sistem seni koruyor.",
          "resistance": "Zihni berrak biri, direnci yazıya döker. 10 saniye, tek cümle.",
          "identity": "Dağınıklıktan netliğe. Zihnin artık boşluğu tanıyor."
        },
        "phases": {
          "phase_1": "Kuruluş — Kafandakini yaz.",
          "phase_2": "Pekiştirme — Öncelikle ayır.",
          "phase_3": "Otomatikleşme — Zihin sakin."
        }
      },
      "moving_person": {
        "title": "Hareket eden biri",
        "identityStatement": "Ben, vücuduna saygı duyan ve her gün hareket eden biriyim.",
        "mirror": {
          "lowEnergy": "Hareket eden biri olarak bugün sadece ayakkabını giy veya 10 adım at.",
          "resistance": "Direnç geldiğinde hareket eden biri küçülür — 1 tekrar yeter.",
          "identity": "Hareket artık kimliğinin parçası. Vücut bekliyor."
        },
        "phases": {
          "phase_1": "Kuruluş — Harekete geç.",
          "phase_2": "Pekiştirme — Ritmi bul.",
          "phase_3": "Otomatikleşme — Beden hatırlıyor."
        }
      }
    }
  },
  "en": {
    "behavior": {
      "reason": {
        "interrupt": "Drop detected. One move is enough: {{title}}",
        "mindDumpMulti": "In recent notes \"{{hint}}\" keeps echoing — now: {{title}}.",
        "mindDumpSingle": "\"{{keyword}}\" showed up — now: {{title}}.",
        "highEffort": "Yesterday was {{effort}}/10 tough. Today we scale down: {{title}}",
        "coldStart": "First days: a small, clear step. {{title}}",
        "declining": "The path felt hard lately. A soft jump: {{title}}",
        "improving": "Recent days went well. Keep this rhythm: {{title}}",
        "momentumDown": "Down for 2 days. We restart now: {{title}}",
        "momentumUp": "You're doing well. Keep going: {{title}}"
      },
      "situation": {
        "home": "Context · home: even the smallest version counts.",
        "work": "Context · work break: 1–2 min clear move.",
        "travel": "Context · travel: one micro-step that fits where you are."
      }
    },
    "journey": {
      "tomorrowPlan": {
        "bridgeTitle": "Plan tomorrow from today",
        "bridgeBody": "Today's check-in and micro steps align with this list. Leave a clear anchor for tomorrow morning.",
        "sectionLabel": "TOMORROW'S SHORT LIST",
        "kicker": "So tomorrow runs itself",
        "action": "Clarify 1 main step",
        "statusTomorrow": "Tomorrow",
        "addMeta": "You can add a time or trigger",
        "addSupport": "Add a small item",
        "limitHint": "3 items is enough — keep it simple.",
        "resetList": "Reset list",
        "emptyTitle": "Build a short list for tomorrow",
        "emptySub": "Pick one main micro-step. Morning reminder arrives; check-in on the Today screen.",
        "addFirst": "Add first item"
      },
      "mapTeaser": {
        "sectionLabel": "66 DAYS · PREVIEW",
        "hint": "Tomorrow plan is always free. Tap the active phase — short preview; full day summary and map are premium.",
        "badgeActive": "Now · Phase {{id}}",
        "stats": "{{done}}/{{total}} days completed in this phase",
        "unlockCta": "Open full map"
      },
      "phases": {
        "1": {"label": "Foundation", "days": "Day 1–22", "subtitle": "Tiny Habits kick in. Set your anchor, stay small."},
        "2": {"label": "Consolidation", "days": "Day 23–44", "subtitle": "Identity shift begins. From 'someone who does' to 'someone who is'."},
        "3": {"label": "Automaticity", "days": "Day 45–66", "subtitle": "The neural path completes. You do it without spending willpower."}
      }
    },
    "identityTemplates": {
      "clear_mind": {
        "title": "Someone with a clear mind",
        "identityStatement": "I am someone with a clear mind who knows their priorities.",
        "mirror": {
          "lowEnergy": "As someone with a clear mind, opening the Mind tab today is enough. The system has your back.",
          "resistance": "Someone with a clear mind turns resistance into writing. 10 seconds, one sentence.",
          "identity": "From clutter to clarity. Your mind now recognizes space."
        },
        "phases": {
          "phase_1": "Foundation — Write what's in your head.",
          "phase_2": "Consolidation — Separate priorities.",
          "phase_3": "Automaticity — A calmer mind."
        }
      },
      "moving_person": {
        "title": "Someone who moves",
        "identityStatement": "I am someone who respects their body and moves every day.",
        "mirror": {
          "lowEnergy": "As someone who moves, put on your shoes or take 10 steps today.",
          "resistance": "When resistance hits, someone who moves scales down — 1 rep is enough.",
          "identity": "Movement is part of who you are. Your body is waiting."
        },
        "phases": {
          "phase_1": "Foundation — Get moving.",
          "phase_2": "Consolidation — Find your rhythm.",
          "phase_3": "Automaticity — The body remembers."
        }
      },
      "learner": {
        "title": "Lifelong learner",
        "identityStatement": "I am someone who learns a little every day.",
        "phases": {"phase_1": "Foundation — Open the source.", "phase_2": "Consolidation — One page at a time.", "phase_3": "Automaticity — Learning is default."}
      },
      "self_care": {
        "title": "Someone who takes care of themselves",
        "identityStatement": "I am someone who takes small care of themselves every day.",
        "phases": {"phase_1": "Foundation — Water + breath.", "phase_2": "Consolidation — Gentle routine.", "phase_3": "Automaticity — Care is automatic."}
      },
      "creator": {
        "title": "Creator",
        "identityStatement": "I am someone who creates, even in small doses.",
        "phases": {"phase_1": "Foundation — Open the file.", "phase_2": "Consolidation — Ship small.", "phase_3": "Automaticity — Create without friction."}
      },
      "focused_worker": {
        "title": "Deep focus person",
        "identityStatement": "I am someone who protects focus and does one thing at a time.",
        "phases": {"phase_1": "Foundation — Close tabs.", "phase_2": "Consolidation — Protect blocks.", "phase_3": "Automaticity — Focus is habit."}
      },
      "night_owl": {
        "title": "Night rest person",
        "identityStatement": "I am someone who winds down and protects sleep.",
        "phases": {"phase_1": "Foundation — Screen off.", "phase_2": "Consolidation — Evening ritual.", "phase_3": "Automaticity — Rest is identity."}
      },
      "social_builder": {
        "title": "Connection builder",
        "identityStatement": "I am someone who nurtures connection in small ways.",
        "phases": {"phase_1": "Foundation — Write a name.", "phase_2": "Consolidation — One message.", "phase_3": "Automaticity — Connection is natural."}
      }
    }
  }
}

# pt-BR: copy en structure with PT translations for key sections
EXTRA["pt-BR"] = json.loads(json.dumps(EXTRA["en"]))
EXTRA["pt-BR"]["journey"]["tomorrowPlan"] = {
  "bridgeTitle": "Planeje amanhã a partir de hoje",
  "bridgeBody": "Check-in e micro passos de hoje alinham com esta lista. Deixe uma âncora clara para amanhã de manhã.",
  "sectionLabel": "LISTA CURTA DE AMANHÃ",
  "kicker": "Para amanhã fluir sozinho",
  "action": "Defina 1 passo principal",
  "statusTomorrow": "Amanhã",
  "addMeta": "Você pode adicionar hora ou gatilho",
  "addSupport": "Adicionar item pequeno",
  "limitHint": "3 itens bastam — mantenha simples.",
  "resetList": "Zerar lista",
  "emptyTitle": "Monte uma lista curta para amanhã",
  "emptySub": "Escolha um micro-passo principal. Lembrete de manhã chega; check-in na aba Hoje.",
  "addFirst": "Adicionar primeiro item"
}
EXTRA["pt-BR"]["journey"]["mapTeaser"] = {
  "sectionLabel": "66 DIAS · PRÉVIA",
  "hint": "Plano de amanhã sempre grátis. Toque na fase ativa — prévia curta; resumo completo e mapa são premium.",
  "badgeActive": "Agora · Fase {{id}}",
  "stats": "{{done}}/{{total}} dias concluídos nesta fase",
  "unlockCta": "Abrir mapa completo"
}
EXTRA["pt-BR"]["identityTemplates"]["clear_mind"] = {
  "title": "Alguém com mente clara",
  "identityStatement": "Sou alguém com mente clara que conhece suas prioridades.",
  "mirror": {
    "lowEnergy": "Como alguém com mente clara, abrir a aba Mente hoje já basta. O sistema te protege.",
    "resistance": "Quem tem mente clara transforma resistência em escrita. 10 segundos, uma frase.",
    "identity": "Do caos à clareza. Sua mente agora reconhece espaço."
  },
  "phases": {"phase_1": "Fundação — Escreva o que está na cabeça.", "phase_2": "Consolidação — Separe prioridades.", "phase_3": "Automaticidade — Mente mais calma."}
}

def deep_merge(base, extra):
    for k, v in extra.items():
        if k in base and isinstance(base[k], dict) and isinstance(v, dict):
            deep_merge(base[k], v)
        else:
            base[k] = v

for loc, patch in EXTRA.items():
    path = LOCALES / f"{loc}.json"
    data = json.loads(path.read_text(encoding="utf-8"))
    deep_merge(data, patch)
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print("merged", loc)
