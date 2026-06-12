/**
 * Merge fiveSecondTrainer, proactiveIntervention, stackingModal, habitStacking into locales.
 * Run: node scripts/patch_modal_i18n.js
 */
const fs = require("fs");
const path = require("path");

const blocks = {
  tr: {
    fiveSecondTrainer: {
      badge: "Mini görev",
      scienceKicker:
        "Net tetik + kısa süre, hedefi fiile taşımayı kolaylaştırır — her tur sinir yolunu bir kez daha işler.",
      phase: { ready: "Hazır", counting: "Sayım", action: "GO!", result: "Sonuç" },
      tier: { "0": "Çılgın refleks", "1": "Hızlı tepki", "2": "Tamamlandı" },
      difficultyA11y: "Zorluk {{n}} üzerinden 5",
      taskKicker: "Görev metni",
      rulesTitle: "Nasıl oynanır",
      rule1: "Başla → geri sayım bitene kadar hazır ol",
      rule2: "GO! çıkınca alışkanlığı gerçekten yap",
      rule3: "Bitince “Yaptım”a bas — hızın bonus XP kazandırır",
      startGame: "Oyuna başla",
      countdown: "Geri sayım",
      seconds: "saniye",
      actionHint:
        "Şimdi tek net hareketi yap. Bitince aşağıya dokun — ne kadar çabuk, o kadar çok yıldız.",
      done: "Yaptım",
      roundDone: "Tur tamam",
      reactionTime: "Tepki süresi: {{sec}} sn",
      baseXp: "Temel XP",
      speedBonus: "Hız bonusu",
      total: "Toplam",
      growthText:
        "Tekrarlar bağlantıyı güçlendirir — oyun gibi düşün: her tur bir antrenman seti.",
      continue: "Devam",
      skip: "Şimdi oynamak istemiyorum",
      skipA11y: "Mini görevi atla",
      secondsShort: "{{count}} sn",
      muscle: {
        karar: "Karar anlığı",
        direnc: "Direnç",
        baglam: "Bağlam",
        energi: "Enerji",
        sosyal: "Sosyal baskı",
      },
      flavor: {
        karar: "Tek bir net hareket — düşünme süresini kısalt.",
        direnc: "Ertelemeyi değil, başlatmayı oyna.",
        baglam: "Ortam değişse de tetik aynı kalabilir.",
        energi: "Enerji düşükken minimum doz bile sayılır.",
        sosyal: "Dış onay beklemeden kendi başlat düğmene bas.",
      },
    },
    proactiveIntervention: {
      title: "Bugün riskli bir gün görünüyor",
      body:
        "Son günlerde otomatiklik düşmüş veya tutarlılıkta küçük bir kesinti olmuş olabilir. Bu, 66 günlük yolun normal bir parçası; çoğu insan bu aşamada dalgalanır. Küçük bir müdahale işe yarayabilir.",
      cta: "5 saniye antrenmanını başlat",
      dismiss: "Kendi başıma hallederim",
    },
    stackingModal: {
      defaultHabit: "bu alışkanlık",
      evoTitle: "Bu turda içeriden ne oldu?",
      stackTitle: "Şimdi? Bu kimliğin üzerine küçük bir katman ekleyelim.",
      sameHabit: "Aynı alışkanlık — yeni 66 gün",
      sameHabitHint:
        "Aynı kimlik hedefiyle taze tur; günlük işaretler sıfırlanır, kas seviyelerin ve notların korunur.",
      share: "Bu ana özel paylaş",
      shareMessage:
        "66 günlük yolculuğu tamamladım: “{{habit}}”. Bu artık kimliğimde bir katman. Şimdi üzerine yenisini ekliyorum. {{hashtag}}",
      later: "Daha sonra hatırlat",
      variant: {
        celebrate: {
          title: "66. gün — Sen bunu inşa ettin",
          lead:
            "“{{habit}}” artık sadece yaptığın bir şey değil; zihninin “böyle biriyim” dediği bir katman.\n\n66 günde beyin bu yolu tekrar tekrar kullandı — görünmeyen bir inşaat. Bugün o yapı fiilen teslim: bu yol senin için hatırı sayılır ölçüde hazır.",
          chartTitle: "66 gün · otomatiklik izi",
          chartSubtitle: "Değerlendirme verdiğin günler — her nokta küçük bir oy",
        },
        resume: {
          title: "66. günün arkanda — sıradaki katman",
          lead:
            "66. gününü tamamladın; bir sonraki 66 günlük tur için seçimini erteleyebilirsin — bu da sürecin parçası.\n\nHazır olduğunda aynı kimlik çizgisinde yeni bir katman seç: küçük olsun, net olsun, “{{habitLower}}” ile uyumlu olsun.",
          chartTitle: "Bu tur · otomatiklik izi",
          chartSubtitle: "Değerlendirme yaptığın günler bu eğride",
        },
        late: {
          title: "Bir nefes al — hâlâ tam zamanındasın",
          lead:
            "Arada zaman geçmiş olabilir; yine de yeni bir tur için geç kalmış sayılmazsın. “{{habit}}” hâlâ kimliğinde duruyor.\n\nİstersen şimdi taze bir 66’ya adım at — küçük bir üzerine ekleme bile büyük fark yaratır.",
          chartTitle: "Bu tur · otomatiklik izi",
          chartSubtitle: "Değerlendirme yaptığın günler bu eğride",
        },
        strong_nudge: {
          title: "Burada olman iyi bir işaret",
          lead:
            "Bir süredir seçimi ertelemiş olabilirsin; bu, çoğu insanın düştüğü ara değil, bekleme salonu.\n\nHenüz bir şey kaybetmedin. “{{habit}}” için kazandığın katman duruyor — bir sonraki adımı küçük seç, yeniden başla.",
          chartTitle: "Bu tur · otomatiklik izi",
          chartSubtitle: "Değerlendirme yaptığın günler bu eğride",
        },
      },
      evolutionIntro:
        "Zihin notlarında {{count}} iz bıraktın — kelimelerin tonu da yavaş yavaş kaymış olabilir. Bazen fark etmeden “zorlanıyorum” ile “oluyor” arasındaki mesafe kapanır.",
      evolutionCelebrate:
        "İlk satırlarında şunu hissettiren bir şey vardı: “{{first}}” Son notlarında ise daha çok şuna yaklaşıyorsun: “{{last}}” Bu süre sadece kutucuklar değil, iç söylemin de değişti.",
      evolutionOther:
        "İlk notundan bir kesit: “{{first}}” Son notundan: “{{last}}” Aynı sen; farklı bir iç mesafe.",
      evolutionClosingCelebrate:
        "Bir zamanlar \"epey bilinçli yapıyorum\" dediğin şey, bugün çoğu zaman düşünmeden gelen bir yön olmaya yaklaştı. Bu dönüş, disiplinin en sessiz zaferi.",
    },
    habitStacking: {
      defaultHabit: "Bu alışkanlık",
      headlineReason:
        "Şu an en çok gelişime açık kasın: {{muscle}}. Üzerine kurulacak yeni küçük alışkanlık, bunu hedefleyebilir.",
      suggestionReason:
        "{{completed}} yolculuğun {{focus}} kasını güçlendirdi. Sırada: {{target}} için mini bir katman.",
      muscleNames: {
        karar: "Karar anlığı",
        direnc: "Direnç",
        baglam: "Bağlam",
        energi: "Enerji",
        sosyal: "Sosyal baskı",
      },
    },
    exactAlarm: {
      title: "Tam saatte hatırlatma",
      body:
        "Android 12+ cihazlarda sabah hatırlatıcısının tam saatinde çalması için sistem izni gerekir. Ayarlardan Rito için “Alarmlar ve hatırlatıcılar”ı açabilirsin.",
      openSettings: "Ayarlara git",
      skip: "Şimdilik atla",
    },
    dataLoadBanner: {
      checkins: "Bugün kayıtları",
      mind: "Zihin notları",
      message: "{{items}} yüklenemedi.",
      retry: "Yeniden yükle",
    },
    errorBoundary: {
      title: "Bir şeyler ters gitti",
      body: "Uygulama beklenmedik bir hatayla karşılaştı. Verilerin cihazında duruyor; yeniden deneyebilirsin.",
      retry: "Yeniden dene",
      unknown: "Bilinmeyen hata",
    },
    mindDumpReflection: {
      bannerTitle: "Notunu burada okuduk",
      bannerBodyKeyword:
        "Bugün “{{keyword}}” geçiyor; bu, direnç kası antrenmanında olabileceğin anlamına gelebilir.",
      bannerBodyDefault:
        "Yazdığın satır kayıt altında — küçük bir iç ses, büyük bir desen olabilir.",
    },
  },
};

// EN translations
blocks.en = JSON.parse(JSON.stringify(blocks.tr));
Object.assign(blocks.en.fiveSecondTrainer, {
  badge: "Mini quest",
  scienceKicker:
    "A clear trigger + short window makes action easier — each round rehearses the neural path.",
  phase: { ready: "Ready", counting: "Count", action: "GO!", result: "Result" },
  tier: { "0": "Lightning reflex", "1": "Quick response", "2": "Completed" },
  difficultyA11y: "Difficulty {{n}} of 5",
  taskKicker: "Task line",
  rulesTitle: "How to play",
  rule1: "Start → stay ready until the countdown ends",
  rule2: "When GO! appears, actually do the habit move",
  rule3: "Tap “Done” when finished — speed earns bonus XP",
  startGame: "Start game",
  countdown: "Countdown",
  seconds: "seconds",
  actionHint:
    "Make one clear move now. Tap below when done — faster means more stars.",
  done: "Done",
  roundDone: "Round complete",
  reactionTime: "Reaction time: {{sec}} sec",
  baseXp: "Base XP",
  speedBonus: "Speed bonus",
  total: "Total",
  growthText: "Reps strengthen the path — think of each round as one training set.",
  continue: "Continue",
  skip: "Not in the mood to play",
  skipA11y: "Skip mini quest",
  secondsShort: "{{count}} sec",
  muscle: {
    karar: "Decision moment",
    direnc: "Resistance",
    baglam: "Context",
    energi: "Energy",
    sosyal: "Social pressure",
  },
  flavor: {
    karar: "One clear move — shorten the thinking gap.",
    direnc: "Play for starting, not postponing.",
    baglam: "The trigger can stay even when the setting shifts.",
    energi: "A minimum dose still counts on low-energy days.",
    sosyal: "Press your own start button without waiting for approval.",
  },
});
blocks.en.proactiveIntervention = {
  title: "Today looks like a risky day",
  body:
    "Automaticity may have dipped lately or consistency wobbled a bit. That's normal on a 66-day path — most people fluctuate here. A small intervention can help.",
  cta: "Start the 5-second trainer",
  dismiss: "I'll handle it myself",
};
blocks.en.stackingModal = {
  defaultHabit: "this habit",
  evoTitle: "What shifted inside this round?",
  stackTitle: "Now? Let's add a small layer on this identity.",
  sameHabit: "Same habit — new 66 days",
  sameHabitHint:
    "Fresh round with the same identity goal; daily marks reset, muscle levels and notes stay.",
  share: "Share this moment",
  shareMessage:
    "I completed my 66-day journey: “{{habit}}”. It's now a layer of who I am. Building the next one on top. {{hashtag}}",
  later: "Remind me later",
  variant: {
    celebrate: {
      title: "Day 66 — You built this",
      lead:
        "“{{habit}}” isn't just something you do anymore; it's a layer your mind calls “this is who I am”.\n\nFor 66 days your brain rehearsed this path — quiet construction. Today that structure is largely in place.",
      chartTitle: "66 days · automaticity trace",
      chartSubtitle: "Days you rated — each point is a small vote",
    },
    resume: {
      title: "Past day 66 — the next layer",
      lead:
        "You finished day 66; you can postpone the next 66-day round — that's part of the process.\n\nWhen ready, pick a new layer on the same identity line: small, clear, aligned with “{{habitLower}}”.",
      chartTitle: "This round · automaticity trace",
      chartSubtitle: "Days you rated on this curve",
    },
    late: {
      title: "Take a breath — you're still on time",
      lead:
        "Time may have passed; you're not late for a new round. “{{habit}}” still lives in your identity.\n\nStep into a fresh 66 when you want — even a tiny add-on makes a difference.",
      chartTitle: "This round · automaticity trace",
      chartSubtitle: "Days you rated on this curve",
    },
    strong_nudge: {
      title: "Showing up here is a good sign",
      lead:
        "You may have delayed the choice — that's the waiting room, not a dead end.\n\nYou haven't lost the layer you earned with “{{habit}}”. Pick a small next step and begin again.",
      chartTitle: "This round · automaticity trace",
      chartSubtitle: "Days you rated on this curve",
    },
  },
  evolutionIntro:
    "You left {{count}} traces in Mind notes — the tone of your words may have shifted too. Sometimes the gap between “I'm struggling” and “it's happening” closes without you noticing.",
  evolutionCelebrate:
    "Early on you wrote something like: “{{first}}” Lately you're closer to: “{{last}}” This wasn't just checkboxes — your inner voice moved too.",
  evolutionOther: "From your first note: “{{first}}” From your latest: “{{last}}” Same you; different inner distance.",
  evolutionClosingCelebrate:
    "What once felt very deliberate now often arrives with less friction. That's discipline's quietest win.",
};
blocks.en.habitStacking = {
  defaultHabit: "This habit",
  headlineReason:
    "Your muscle most open to growth right now: {{muscle}}. The next tiny habit can target that.",
  suggestionReason:
    "Your {{completed}} journey strengthened {{focus}}. Next: a mini layer for {{target}}.",
  muscleNames: {
    karar: "Decision moment",
    direnc: "Resistance",
    baglam: "Context",
    energi: "Energy",
    sosyal: "Social pressure",
  },
};
blocks.en.exactAlarm = {
  title: "On-time reminders",
  body:
    "On Android 12+, morning reminders at the exact time need system permission. You can enable “Alarms & reminders” for Rito in settings.",
  openSettings: "Open settings",
  skip: "Skip for now",
};
blocks.en.dataLoadBanner = {
  checkins: "Today's records",
  mind: "Mind notes",
  message: "Couldn't load {{items}}.",
  retry: "Reload",
};
blocks.en.errorBoundary = {
  title: "Something went wrong",
  body: "The app hit an unexpected error. Your data is still on this device — you can try again.",
  retry: "Try again",
  unknown: "Unknown error",
};
blocks.en.mindDumpReflection = {
  bannerTitle: "We read your note here",
  bannerBodyKeyword:
    "“{{keyword}}” shows up today — you may be in a resistance-muscle moment.",
  bannerBodyDefault: "Your line is logged — a small inner voice can reveal a bigger pattern.",
};

// PT-BR - deep clone from EN and translate key UI
blocks.pt = JSON.parse(JSON.stringify(blocks.en));
Object.assign(blocks.pt.fiveSecondTrainer, {
  badge: "Mini missão",
  scienceKicker:
    "Gatilho claro + janela curta facilita agir — cada rodada ensaia o caminho neural.",
  phase: { ready: "Pronto", counting: "Contagem", action: "VAI!", result: "Resultado" },
  tier: { "0": "Reflexo relâmpago", "1": "Resposta rápida", "2": "Concluído" },
  difficultyA11y: "Dificuldade {{n}} de 5",
  taskKicker: "Texto da tarefa",
  rulesTitle: "Como jogar",
  rule1: "Comece → fique pronto até o fim da contagem",
  rule2: "Quando aparecer VAI!, faça o movimento de verdade",
  rule3: "Toque em “Fiz” ao terminar — velocidade dá XP bônus",
  startGame: "Começar jogo",
  countdown: "Contagem regressiva",
  seconds: "segundos",
  actionHint: "Faça um movimento claro agora. Toque abaixo ao terminar — mais rápido, mais estrelas.",
  done: "Fiz",
  roundDone: "Rodada concluída",
  reactionTime: "Tempo de reação: {{sec}} seg",
  baseXp: "XP base",
  speedBonus: "Bônus de velocidade",
  total: "Total",
  growthText: "Repetições fortalecem o caminho — cada rodada é um set de treino.",
  continue: "Continuar",
  skip: "Não quero jogar agora",
  skipA11y: "Pular mini missão",
  secondsShort: "{{count}} seg",
  muscle: {
    karar: "Momento de decisão",
    direnc: "Resistência",
    baglam: "Contexto",
    energi: "Energia",
    sosyal: "Pressão social",
  },
  flavor: {
    karar: "Um movimento claro — encurte o tempo de pensar.",
    direnc: "Jogue para começar, não para adiar.",
    baglam: "O gatilho pode permanecer mesmo quando o ambiente muda.",
    energi: "Dose mínima ainda conta em dias de baixa energia.",
    sosyal: "Aperte seu próprio botão de início sem esperar aprovação.",
  },
});
blocks.pt.proactiveIntervention = {
  title: "Hoje parece um dia de risco",
  body:
    "A automaticidade pode ter caído ou a consistência oscilou um pouco. Isso é normal nos 66 dias — a maioria flutua aqui. Uma pequena intervenção pode ajudar.",
  cta: "Iniciar treino de 5 segundos",
  dismiss: "Eu mesmo resolvo",
};
blocks.pt.stackingModal = {
  defaultHabit: "este hábito",
  evoTitle: "O que mudou por dentro nesta rodada?",
  stackTitle: "Agora? Vamos acrescentar uma camada pequena a esta identidade.",
  sameHabit: "Mesmo hábito — novos 66 dias",
  sameHabitHint:
    "Nova rodada com o mesmo objetivo de identidade; marcas diárias zeram, níveis e notas ficam.",
  share: "Compartilhar este momento",
  shareMessage:
    "Completei minha jornada de 66 dias: “{{habit}}”. Agora é uma camada de quem sou. Construindo a próxima. {{hashtag}}",
  later: "Lembrar depois",
  variant: blocks.en.stackingModal.variant,
};
// PT variant translations
blocks.pt.stackingModal.variant = {
  celebrate: {
    title: "Dia 66 — Você construiu isso",
    lead:
      "“{{habit}}” não é só algo que você faz; é uma camada que sua mente chama de “sou assim”.\n\nPor 66 dias seu cérebro repetiu este caminho — construção silenciosa. Hoje essa estrutura está em grande parte pronta.",
    chartTitle: "66 dias · traço de automaticidade",
    chartSubtitle: "Dias que você avaliou — cada ponto é um pequeno voto",
  },
  resume: {
    title: "Depois do dia 66 — próxima camada",
    lead:
      "Você terminou o dia 66; pode adiar a próxima rodada de 66 dias — faz parte do processo.\n\nQuando estiver pronto, escolha uma nova camada na mesma linha de identidade: pequena, clara, alinhada com “{{habitLower}}”.",
    chartTitle: "Esta rodada · traço de automaticidade",
    chartSubtitle: "Dias avaliados nesta curva",
  },
  late: {
    title: "Respire — ainda está na hora",
    lead:
      "O tempo pode ter passado; não está atrasado para uma nova rodada. “{{habit}}” ainda vive na sua identidade.\n\nEntre em um novo 66 quando quiser — até uma adição pequena faz diferença.",
    chartTitle: "Esta rodada · traço de automaticidade",
    chartSubtitle: "Dias avaliados nesta curva",
  },
  strong_nudge: {
    title: "Estar aqui já é um bom sinal",
    lead:
      "Você pode ter adiado a escolha — isso é sala de espera, não beco sem saída.\n\nVocê não perdeu a camada que ganhou com “{{habit}}”. Escolha um próximo passo pequeno e recomece.",
    chartTitle: "Esta rodada · traço de automaticidade",
    chartSubtitle: "Dias avaliados nesta curva",
  },
};
blocks.pt.stackingModal.evolutionIntro =
  "Você deixou {{count}} rastros nas notas da Mente — o tom das palavras também pode ter mudado.";
blocks.pt.stackingModal.evolutionCelebrate =
  "No começo você escreveu algo como: “{{first}}” Agora está mais perto de: “{{last}}” Não foram só caixinhas — sua voz interior também se moveu.";
blocks.pt.stackingModal.evolutionOther =
  "Da primeira nota: “{{first}}” Da mais recente: “{{last}}” O mesmo você; distância interior diferente.";
blocks.pt.stackingModal.evolutionClosingCelebrate =
  "O que antes parecia muito deliberado agora muitas vezes chega com menos atrito. Essa é a vitória mais silenciosa da disciplina.";
blocks.pt.habitStacking = {
  defaultHabit: "Este hábito",
  headlineReason:
    "Músculo mais aberto a crescimento agora: {{muscle}}. O próximo micro-hábito pode mirar nele.",
  suggestionReason:
    "Sua jornada com {{completed}} fortaleceu {{focus}}. Próximo: uma mini camada para {{target}}.",
  muscleNames: {
    karar: "Momento de decisão",
    direnc: "Resistência",
    baglam: "Contexto",
    energi: "Energia",
    sosyal: "Pressão social",
  },
};
blocks.pt.exactAlarm = {
  title: "Lembretes no horário exato",
  body:
    "No Android 12+, lembretes matinais no horário exato precisam de permissão do sistema. Ative “Alarmes e lembretes” para o Rito nas configurações.",
  openSettings: "Abrir configurações",
  skip: "Pular por agora",
};
blocks.pt.dataLoadBanner = {
  checkins: "Registros de hoje",
  mind: "Notas da Mente",
  message: "Não foi possível carregar {{items}}.",
  retry: "Recarregar",
};
blocks.pt.errorBoundary = {
  title: "Algo deu errado",
  body: "O app encontrou um erro inesperado. Seus dados ainda estão no dispositivo — tente de novo.",
  retry: "Tentar de novo",
  unknown: "Erro desconhecido",
};
blocks.pt.mindDumpReflection = {
  bannerTitle: "Lemos sua nota aqui",
  bannerBodyKeyword:
    "“{{keyword}}” aparece hoje — você pode estar num momento do músculo de resistência.",
  bannerBodyDefault: "Sua linha foi registrada — uma voz interior pequena pode revelar um padrão maior.",
};

// habitStacking suggestions - use TR source translated for EN/PT in separate patch
// For now keep suggestions in engine with i18n keys per muscle index

const localeFiles = {
  tr: path.join(__dirname, "../src/i18n/locales/tr.json"),
  en: path.join(__dirname, "../src/i18n/locales/en.json"),
  "pt-BR": path.join(__dirname, "../src/i18n/locales/pt-BR.json"),
};

const blockMap = { tr: blocks.tr, en: blocks.en, "pt-BR": blocks.pt };

for (const [lng, file] of Object.entries(localeFiles)) {
  const data = JSON.parse(fs.readFileSync(file, "utf8"));
  const b = blockMap[lng];
  Object.assign(data, {
    fiveSecondTrainer: b.fiveSecondTrainer,
    proactiveIntervention: b.proactiveIntervention,
    stackingModal: b.stackingModal,
    habitStacking: b.habitStacking,
    exactAlarm: b.exactAlarm,
    dataLoadBanner: b.dataLoadBanner,
    errorBoundary: b.errorBoundary,
    mindDumpReflection: b.mindDumpReflection,
  });
  fs.writeFileSync(file, JSON.stringify(data, null, 2) + "\n", "utf8");
  console.log("Merged modal i18n into", lng);
}
