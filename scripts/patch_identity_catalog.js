/**
 * Add recoveryAction, mirror, and tr phases to identityTemplates in locales.
 */
const fs = require("fs");
const path = require("path");

const catalog = {
  clear_mind: {
    tr: {
      recoveryAction: "Zihin sekmesini aç; imleç beklesin — yeterli.",
      phases: { phase_1: "Kuruluş — Kafandakini yaz.", phase_2: "Pekiştirme — Öncelikle ayır.", phase_3: "Otomatikleşme — Zihin sakin." },
      mirror: { lowEnergy: "Zihni berrak biri olarak bugün sadece Zihin sekmesini açman yeter. Sistem seni koruyor.", resistance: "Zihni berrak biri, direnci yazıya döker. 10 saniye, tek cümle.", identity: "Dağınıklıktan netliğe. Zihnin artık boşluğu tanıyor." },
    },
    en: {
      recoveryAction: "Open the Mind tab; let the cursor blink — that's enough.",
      phases: { phase_1: "Foundation — Write what's in your head.", phase_2: "Consolidation — Sort by priority.", phase_3: "Automaticity — A calmer mind." },
      mirror: { lowEnergy: "As someone with a clear mind, opening Mind today is enough. The system has your back.", resistance: "A clear mind turns resistance into words. Ten seconds, one sentence.", identity: "From clutter to clarity. Your mind now knows the pause." },
    },
    pt: {
      recoveryAction: "Abra a aba Mente; deixe o cursor piscar — já basta.",
      phases: { phase_1: "Fundação — Escreva o que está na cabeça.", phase_2: "Consolidação — Separe por prioridade.", phase_3: "Automaticidade — Mente mais calma." },
      mirror: { lowEnergy: "Como alguém de mente clara, abrir a Mente hoje já basta. O sistema te cobre.", resistance: "Mente clara transforma resistência em palavras. Dez segundos, uma frase.", identity: "Do caos à clareza. Sua mente já reconhece o espaço." },
    },
  },
  moving_person: {
    tr: {
      recoveryAction: "Sadece spor ayakkabılarını eline al ve 5 saniye bak.",
      phases: { phase_1: "Kuruluş — Harekete geç.", phase_2: "Pekiştirme — Süreyi büyüt.", phase_3: "Otomatikleşme — Vücut çağırır." },
      mirror: { lowEnergy: "Hareket eden biri olarak bugün ayakkabılarına tek bakış yeter.", resistance: "Direnç anı — 30 sn zıplama dirençten büyüktür. Şimdi.", identity: "Zorlanmıyorsun. Vücudun artık sıranı biliyor." },
    },
    en: {
      recoveryAction: "Just pick up your workout shoes and look at them for 5 seconds.",
      phases: { phase_1: "Foundation — Get moving.", phase_2: "Consolidation — Stretch the duration.", phase_3: "Automaticity — Your body calls the move." },
      mirror: { lowEnergy: "As someone who moves, one glance at your shoes today is enough.", resistance: "Resistance moment — 30 sec of bounce beats resistance. Now.", identity: "You're not forcing it. Your body knows its turn." },
    },
    pt: {
      recoveryAction: "Pegue o tênis de treino e olhe por 5 segundos.",
      phases: { phase_1: "Fundação — Comece a se mover.", phase_2: "Consolidação — Aumente a duração.", phase_3: "Automaticidade — O corpo pede o movimento." },
      mirror: { lowEnergy: "Como quem se move, um olhar no tênis hoje já basta.", resistance: "Momento de resistência — 30 seg de pulo vence a resistência. Agora.", identity: "Você não está forçando. O corpo já sabe a vez." },
    },
  },
  learner: {
    tr: {
      recoveryAction: "Kaynağın sadece adını gör ve 'bu bana ait' de, kapat.",
      phases: { phase_1: "Kuruluş — Sadece aç.", phase_2: "Pekiştirme — 5 dk oku/çalış.", phase_3: "Otomatikleşme — Bilgi birikiyor." },
      mirror: { lowEnergy: "Öğrenen biri olarak bugün kaynağı klasörde bile görmen yeter. Satır sonra.", resistance: "Direnç bilgiyi büyütüyor — açmak, büyümesini durdurur. Şimdi aç.", identity: "Her tuğla yerine. Artık 'öğreniyorum' değil, 'öğrenen biriyim'." },
    },
    en: {
      recoveryAction: "See only the source name, say 'this is mine', and close.",
      phases: { phase_1: "Foundation — Just open.", phase_2: "Consolidation — Five minutes of study.", phase_3: "Automaticity — Knowledge stacks up." },
      mirror: { lowEnergy: "As a learner, seeing the source in your folder today is enough. The line can wait.", resistance: "Resistance inflates the goal — opening stops that growth. Open now.", identity: "Each brick lands. You're not 'learning' — you're a learner." },
    },
    pt: {
      recoveryAction: "Veja só o nome da fonte, diga 'isso é meu' e feche.",
      phases: { phase_1: "Fundação — Só abrir.", phase_2: "Consolidação — Cinco minutos de estudo.", phase_3: "Automaticidade — O conhecimento se acumula." },
      mirror: { lowEnergy: "Como aprendiz, ver a fonte na pasta hoje já basta. A linha pode esperar.", resistance: "A resistência infla a meta — abrir interrompe isso. Abra agora.", identity: "Cada tijolo encaixa. Você não está 'aprendendo' — você é aprendiz." },
    },
  },
  self_care: {
    tr: {
      recoveryAction: "Bardağı sadece masaya koy. Yudum sonra.",
      phases: { phase_1: "Kuruluş — Su + nefes.", phase_2: "Pekiştirme — Ritüel oturuyor.", phase_3: "Otomatikleşme — Kendine saygı." },
      mirror: { lowEnergy: "Kendine bakan biri olarak bugün bardağı görmek bile yeterli.", resistance: "Bir yudum, erteleme cümlesinden kısa. Şimdi.", identity: "Kendine dönen el, alışkanlık değil — karakter." },
    },
    en: {
      recoveryAction: "Just put the glass on the desk. The sip can wait.",
      phases: { phase_1: "Foundation — Water + breath.", phase_2: "Consolidation — Ritual settles.", phase_3: "Automaticity — Self-respect." },
      mirror: { lowEnergy: "As someone who cares for yourself, seeing the glass today is enough.", resistance: "One sip is shorter than the delay sentence. Now.", identity: "The hand that returns to you isn't a habit — it's character." },
    },
    pt: {
      recoveryAction: "Só coloque o copo na mesa. O gole pode esperar.",
      phases: { phase_1: "Fundação — Água + respiração.", phase_2: "Consolidação — Ritual se instala.", phase_3: "Automaticidade — Autocuidado." },
      mirror: { lowEnergy: "Quem cuida de si, ver o copo hoje já basta.", resistance: "Um gole é mais curto que a frase de adiamento. Agora.", identity: "A mão que volta para você não é hábito — é caráter." },
    },
  },
  creator: {
    tr: {
      recoveryAction: "Kafandaki tek fikri bir kelimeyle not et, kapat.",
      phases: { phase_1: "Kuruluş — Sadece aç.", phase_2: "Pekiştirme — Her gün bir parça.", phase_3: "Otomatikleşme — Yaratıcılık kimliğin." },
      mirror: { lowEnergy: "Yaratan biri olarak bugün sadece dosyayı açman yeter.", resistance: "Direnç yaratıcılığın bir parçası. Tek kelime, dirençten daha büyük.", identity: "Küçük çıktılar birikir. Yaratan biri artık sadece fikir değilsin." },
    },
    en: {
      recoveryAction: "Note the one idea in your head in a single word, then close.",
      phases: { phase_1: "Foundation — Just open.", phase_2: "Consolidation — One piece daily.", phase_3: "Automaticity — Creativity is identity." },
      mirror: { lowEnergy: "As a creator, opening the file today is enough.", resistance: "Resistance is part of creating. One word beats resistance.", identity: "Small outputs compound. You're not just an idea anymore." },
    },
    pt: {
      recoveryAction: "Anote a ideia na cabeça em uma palavra e feche.",
      phases: { phase_1: "Fundação — Só abrir.", phase_2: "Consolidação — Um pedaço por dia.", phase_3: "Automaticidade — Criatividade é identidade." },
      mirror: { lowEnergy: "Como criador, abrir o arquivo hoje já basta.", resistance: "Resistência faz parte de criar. Uma palavra vence a resistência.", identity: "Pequenas saídas somam. Você não é só uma ideia." },
    },
  },
  focused_worker: {
    tr: {
      recoveryAction: "Şu anki tek görevini yüksek sesle söyle, 1 dk o işe bak.",
      phases: { phase_1: "Kuruluş — Sekmeleri kapat.", phase_2: "Pekiştirme — Derinlik süresi artar.", phase_3: "Otomatikleşme — Odak artık refleks." },
      mirror: { lowEnergy: "Odaklı çalışan biri olarak bugün sadece tek sekme bırakman yeter.", resistance: "Dikkat dağıtıcıları kapatmak da bir üretim hareketidir. Şimdi kapat.", identity: "Derinlik seçiyorsun. Bu artık çalışma tarzın." },
    },
    en: {
      recoveryAction: "Say your one current task out loud, look at it for 1 minute.",
      phases: { phase_1: "Foundation — Close tabs.", phase_2: "Consolidation — Depth time grows.", phase_3: "Automaticity — Focus is reflex." },
      mirror: { lowEnergy: "As a focused worker, leaving one tab today is enough.", resistance: "Closing distractions is also a production move. Close now.", identity: "You choose depth. That's your work style now." },
    },
    pt: {
      recoveryAction: "Diga em voz alta sua única tarefa atual, olhe 1 minuto.",
      phases: { phase_1: "Fundação — Feche abas.", phase_2: "Consolidação — Tempo de profundidade cresce.", phase_3: "Automaticidade — Foco é reflexo." },
      mirror: { lowEnergy: "Como trabalhador focado, deixar uma aba hoje já basta.", resistance: "Fechar distrações também é produção. Feche agora.", identity: "Você escolhe profundidade. Esse é seu estilo de trabalho." },
    },
  },
  night_owl: {
    tr: {
      recoveryAction: "Telefonu ters çevir, 4 sn nefes al — yeter.",
      phases: { phase_1: "Kuruluş — Telefonu kapat.", phase_2: "Pekiştirme — Ritüel oturuyor.", phase_3: "Otomatikleşme — Gece sinyali beyin bilir." },
      mirror: { lowEnergy: "Düzenli uyuyan biri olarak bugün sadece telefonu ters çevirmen yeter.", resistance: "Ekranı kapatmak bir kayıp değil — birikiminin korunması. Şimdi kapat.", identity: "Beynin dinlenmeyi hak ediyor. Bu artık seni tanımlar." },
    },
    en: {
      recoveryAction: "Turn your phone face down, breathe 4 sec — enough.",
      phases: { phase_1: "Foundation — Put the phone away.", phase_2: "Consolidation — Ritual settles.", phase_3: "Automaticity — Night signal is learned." },
      mirror: { lowEnergy: "As someone who protects sleep, turning the phone over today is enough.", resistance: "Closing the screen isn't loss — it protects what you built. Close now.", identity: "Your brain deserves rest. That defines you now." },
    },
    pt: {
      recoveryAction: "Vire o celular, respire 4 seg — suficiente.",
      phases: { phase_1: "Fundação — Afaste o celular.", phase_2: "Consolidação — Ritual se instala.", phase_3: "Automaticidade — Sinal noturno aprendido." },
      mirror: { lowEnergy: "Quem protege o sono, virar o celular hoje já basta.", resistance: "Fechar a tela não é perda — protege o que você construiu.", identity: "Seu cérebro merece descanso. Isso te define agora." },
    },
  },
  social_builder: {
    tr: {
      recoveryAction: "Birini düşün ve 'nasılsın' demeyi planla — yazmasan da olur.",
      phases: { phase_1: "Kuruluş — İsim yaz.", phase_2: "Pekiştirme — Mesaj gönder.", phase_3: "Otomatikleşme — Bağ kurmak refleks." },
      mirror: { lowEnergy: "Bağ kuran biri olarak bugün sadece birini düşünmen yeter.", resistance: "Mükemmel bir şey söylemek zorunda değilsin. Tek kelime, hiçbir şeyden büyük.", identity: "Her gün bir temas. Bu artık ilişki kurma biçimin." },
    },
    en: {
      recoveryAction: "Think of someone and plan to say 'how are you' — sending optional.",
      phases: { phase_1: "Foundation — Write a name.", phase_2: "Consolidation — Send a message.", phase_3: "Automaticity — Connection is reflex." },
      mirror: { lowEnergy: "As a connection builder, thinking of one person today is enough.", resistance: "You don't need the perfect line. One word beats nothing.", identity: "One touch a day. That's how you relate now." },
    },
    pt: {
      recoveryAction: "Pense em alguém e planeje um 'como vai' — enviar é opcional.",
      phases: { phase_1: "Fundação — Escreva um nome.", phase_2: "Consolidação — Envie uma mensagem.", phase_3: "Automaticidade — Conexão é reflexo." },
      mirror: { lowEnergy: "Quem constrói laços, pensar em uma pessoa hoje já basta.", resistance: "Não precisa da frase perfeita. Uma palavra vence o nada.", identity: "Um contato por dia. Assim você se relaciona agora." },
    },
  },
};

const files = {
  tr: path.join(__dirname, "../src/i18n/locales/tr.json"),
  en: path.join(__dirname, "../src/i18n/locales/en.json"),
  "pt-BR": path.join(__dirname, "../src/i18n/locales/pt-BR.json"),
};

for (const [lng, fp] of Object.entries(files)) {
  const key = lng === "pt-BR" ? "pt" : lng;
  const data = JSON.parse(fs.readFileSync(fp, "utf8"));
  if (!data.identityTemplates) continue;
  for (const [id, fields] of Object.entries(catalog)) {
    const src = fields[key];
    if (!data.identityTemplates[id]) data.identityTemplates[id] = {};
    const t = data.identityTemplates[id];
    t.recoveryAction = src.recoveryAction;
    t.mirror = src.mirror;
    if (!t.phases) t.phases = {};
    Object.assign(t.phases, src.phases);
  }
  fs.writeFileSync(fp, JSON.stringify(data, null, 2) + "\n");
  console.log("patched identityTemplates", lng);
}
