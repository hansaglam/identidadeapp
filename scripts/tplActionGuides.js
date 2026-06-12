/** tpl-* aksiyonları için çapa rehberi — anchorGuideContent'e merge edilir */

const ANCHOR_LEADS = {
  tr: {
    wake: "Sabah zihni dağınık. «{{anchor}}» sonrası {{title}} — {{habit}} için net başlangıç.",
    work: "İş modu açıldı. «{{anchor}}» anında {{title}} — {{habit}} odağını aç.",
    phone: "Ekran kapandı. «{{anchor}}» ile {{title}} — {{habit}} reseti.",
    bed: "Gün kapanıyor. «{{anchor}}» öncesi {{title}} — {{habit}} sakin kapanış.",
    lunch: "Öğle sonrası dalgalanma normal. «{{anchor}}» sonrası {{title}} — {{habit}} ritmi.",
    home: "Eve girdin. «{{anchor}}» sonrası {{title}} — {{habit}} ev ritmine geç.",
  },
  en: {
    wake: "Morning mind is scattered. After «{{anchor}}», {{title}} — a clear start for {{habit}}.",
    work: "Work mode is on. At «{{anchor}}», {{title}} — open focus for {{habit}}.",
    phone: "Screen off. With «{{anchor}}», {{title}} — a reset for {{habit}}.",
    bed: "Day is closing. Before «{{anchor}}», {{title}} — a calm finish for {{habit}}.",
    lunch: "Post-lunch dip is normal. After «{{anchor}}», {{title}} — keep {{habit}} rhythm.",
    home: "You're home. After «{{anchor}}», {{title}} — shift into {{habit}} at home.",
  },
  "pt-BR": {
    wake: "Mente da manhã dispersa. Após «{{anchor}}», {{title}} — início claro para {{habit}}.",
    work: "Modo trabalho ligado. Em «{{anchor}}», {{title}} — foco para {{habit}}.",
    phone: "Tela desligada. Com «{{anchor}}», {{title}} — reset para {{habit}}.",
    bed: "Dia fechando. Antes de «{{anchor}}», {{title}} — fechamento calmo para {{habit}}.",
    lunch: "Queda pós-almoço é normal. Após «{{anchor}}», {{title}} — ritmo de {{habit}}.",
    home: "Chegou em casa. Após «{{anchor}}», {{title}} — ritmo de {{habit}} em casa.",
  },
};

const STEPS = {
  tr: {
    do: { step1: "Çapayı bir kez tekrar et", step2: "{{title}} — hemen, düşünmeden" },
    open: { step1: "Gerekli aracı/dosyayı aç", step2: "{{title}} — tek hamle, bitirmek şart değil" },
    body: { step1: "Bedeni hazırla — nefes veya duruş", step2: "{{title}} — en küçük sürüm yeter" },
    env: { step1: "Ortamı sadeleştir (tek araç / tek sekme)", step2: "{{title}} — sonra {{habit}} hamlesi" },
  },
  en: {
    do: { step1: "Repeat the anchor once", step2: "{{title}} — now, without overthinking" },
    open: { step1: "Open the tool or file you need", step2: "{{title}} — one move; finishing isn't required" },
    body: { step1: "Prep the body — breath or posture", step2: "{{title}} — smallest version is enough" },
    env: { step1: "Simplify the environment (one tool / one tab)", step2: "{{title}} — then your {{habit}} move" },
  },
  "pt-BR": {
    do: { step1: "Repita a âncora uma vez", step2: "{{title}} — agora, sem pensar demais" },
    open: { step1: "Abra a ferramenta ou arquivo", step2: "{{title}} — um movimento; terminar não é obrigatório" },
    body: { step1: "Prepare o corpo — respiração ou postura", step2: "{{title}} — versão mínima basta" },
    env: { step1: "Simplifique o ambiente (uma ferramenta / uma aba)", step2: "{{title}} — depois o movimento de {{habit}}" },
  },
};

/** Action-specific step1/step2 — overrides generic STEPS where it helps */
const DEEP_STEPS = {
  tr: {
    "tpl-clear-mind-write": {
      step1: "Kalem veya not uygulamasını hazırla",
      step2: "3 satır boşalt — sonra {{habit}} için tek hamle",
    },
    "tpl-clear-breath-box": {
      step1: "4 sn nefes al, 4 sn tut, 4 sn ver — bir tur",
      step2: "{{title}} — beden sakin, zihin açık",
    },
    "tpl-move-pushup-1": {
      step1: "Zemin aç, eller omuz genişliğinde",
      step2: "Tek şınav — say ve kalk; {{habit}} ritmi başladı",
    },
    "tpl-move-shoes": {
      step1: "Ayakkabıları görünür yere koy",
      step2: "Giy ve kapıya yürü — {{title}} tamam",
    },
    "tpl-learn-first-line": {
      step1: "Kitabı veya dersi yer iminde aç",
      step2: "İlk satırı sesli oku — {{title}}",
    },
    "tpl-self-water": {
      step1: "Bardağı doldur, masaya koy",
      step2: "Yarım bardak iç — sonra {{habit}}",
    },
    "tpl-creator-word": {
      step1: "Boş sayfa veya dosyayı aç",
      step2: "Tek kelime yaz — düzenleme yok; {{title}}",
    },
    "tpl-focus-timer": {
      step1: "5 dk zamanlayıcı kur, bildirimleri kapat",
      step2: "{{title}} — süre bitene kadar tek görev",
    },
    "tpl-sleep-phone": {
      step1: "Telefonu şarj köşesine bırak, ekranı kapat",
      step2: "{{title}} — yatak alanında ekran yok",
    },
  },
  en: {
    "tpl-clear-mind-write": {
      step1: "Grab pen and paper or open a notes app",
      step2: "Brain-dump 3 lines — then one move for {{habit}}",
    },
    "tpl-clear-breath-box": {
      step1: "4 sec in, 4 hold, 4 out — one round",
      step2: "{{title}} — body calm, mind clear",
    },
    "tpl-move-pushup-1": {
      step1: "Clear floor space, hands shoulder-width",
      step2: "One push-up — count and stand; {{habit}} rhythm started",
    },
    "tpl-move-shoes": {
      step1: "Place shoes where you'll see them",
      step2: "Put them on and walk to the door — {{title}} done",
    },
    "tpl-learn-first-line": {
      step1: "Open book or lesson at your bookmark",
      step2: "Read the first line aloud — {{title}}",
    },
    "tpl-self-water": {
      step1: "Fill a glass and set it on the table",
      step2: "Drink half — then {{habit}}",
    },
    "tpl-creator-word": {
      step1: "Open a blank page or file",
      step2: "Write one word — no editing; {{title}}",
    },
    "tpl-focus-timer": {
      step1: "Set a 5-minute timer, silence notifications",
      step2: "{{title}} — one task until the timer ends",
    },
    "tpl-sleep-phone": {
      step1: "Leave phone at the charger, screen off",
      step2: "{{title}} — no screen in the sleep zone",
    },
  },
  "pt-BR": {
    "tpl-clear-mind-write": {
      step1: "Pegue papel e caneta ou abra o app de notas",
      step2: "Despeje 3 linhas — depois um movimento para {{habit}}",
    },
    "tpl-clear-breath-box": {
      step1: "4 seg inspira, 4 seg segura, 4 seg solta — uma rodada",
      step2: "{{title}} — corpo calmo, mente clara",
    },
    "tpl-move-pushup-1": {
      step1: "Libere espaço no chão, mãos na largura dos ombros",
      step2: "Uma flexão — conte e levante; ritmo de {{habit}} começou",
    },
    "tpl-move-shoes": {
      step1: "Deixe os tênis onde você vai ver",
      step2: "Calce e caminhe até a porta — {{title}} feito",
    },
    "tpl-learn-first-line": {
      step1: "Abra o livro ou aula no marcador",
      step2: "Leia a primeira linha em voz alta — {{title}}",
    },
    "tpl-self-water": {
      step1: "Encha um copo e deixe na mesa",
      step2: "Beba metade — depois {{habit}}",
    },
    "tpl-creator-word": {
      step1: "Abra página ou arquivo em branco",
      step2: "Escreva uma palavra — sem editar; {{title}}",
    },
    "tpl-focus-timer": {
      step1: "Programe 5 min, silencie notificações",
      step2: "{{title}} — uma tarefa até o timer acabar",
    },
    "tpl-sleep-phone": {
      step1: "Deixe o celular no carregador, tela desligada",
      step2: "{{title}} — sem tela na zona de sono",
    },
  },
};

function buildGuides(lang) {
  const L = ANCHOR_LEADS[lang];
  const S = STEPS[lang];
  const deep = DEEP_STEPS[lang] || {};
  const g = (anchors, steps, id) => {
    const o = { ...(deep[id] ? { ...steps, ...deep[id] } : steps) };
    for (const [k, v] of Object.entries(anchors)) {
      o[`lead_${k}`] = v;
    }
    return o;
  };

  return {
    "tpl-clear-mind-write": g(
      { after_wake: L.wake, after_start_work: L.work, after_phone_down: L.phone },
      S.do,
      "tpl-clear-mind-write"
    ),
    "tpl-clear-mind-open": g({ after_wake: L.wake, after_start_work: L.work }, S.open),
    "tpl-clear-breath-box": g(
      { after_wake: L.wake, before_bed: L.bed, after_lunch: L.lunch },
      S.body,
      "tpl-clear-breath-box"
    ),
    "tpl-clear-list-one": g({ after_start_work: L.work, after_phone_down: L.phone }, S.do),
    "tpl-clear-worry-out": g({ before_bed: L.bed, after_phone_down: L.phone }, S.do),

    "tpl-move-bounce-30": g({ after_wake: L.wake, after_lunch: L.lunch }, S.body),
    "tpl-move-pushup-1": g(
      { after_wake: L.wake, after_start_work: L.work },
      S.body,
      "tpl-move-pushup-1"
    ),
    "tpl-move-shoes": g({ after_wake: L.wake, after_arrive_home: L.home }, S.do, "tpl-move-shoes"),
    "tpl-move-squat-1": g({ after_wake: L.wake, after_lunch: L.lunch }, S.body),
    "tpl-move-stretch-arms": g(
      { after_wake: L.wake, after_start_work: L.work, before_bed: L.bed },
      S.body
    ),
    "tpl-move-stairs-3": g({ after_arrive_home: L.home, after_lunch: L.lunch }, S.body),

    "tpl-learn-first-line": g(
      { after_wake: L.wake, after_start_work: L.work },
      S.open,
      "tpl-learn-first-line"
    ),
    "tpl-learn-name": g({ after_morning_drink: L.wake, after_start_work: L.work }, S.open),
    "tpl-learn-page-turn": g({ after_start_work: L.work, before_bed: L.bed }, S.open),
    "tpl-learn-one-fact": g({ after_lunch: L.lunch, after_start_work: L.work }, S.open),
    "tpl-learn-bookmark": g({ before_bed: L.bed, after_start_work: L.work }, S.do),

    "tpl-self-water": g(
      { after_wake: L.wake, after_morning_drink: L.wake, after_start_work: L.work },
      S.do,
      "tpl-self-water"
    ),
    "tpl-self-glass": g({ after_wake: L.wake, after_arrive_home: L.home }, S.do),
    "tpl-self-wash-face": g({ after_wake: L.wake, after_brush: L.wake }, S.body),
    "tpl-self-lotion-hand": g({ after_brush: L.wake, before_bed: L.bed }, S.do),
    "tpl-self-posture": g({ after_start_work: L.work, after_arrive_home: L.home }, S.body),

    "tpl-creator-open": g({ after_start_work: L.work, after_wake: L.wake }, S.open),
    "tpl-creator-word": g(
      { after_start_work: L.work, after_phone_down: L.phone },
      S.do,
      "tpl-creator-word"
    ),
    "tpl-creator-idea": g({ after_wake: L.wake, after_start_work: L.work }, S.do),
    "tpl-creator-title-only": g({ after_start_work: L.work }, S.do),
    "tpl-creator-rough-line": g({ after_start_work: L.work, before_bed: L.bed }, S.do),

    "tpl-focus-timer": g(
      { after_start_work: L.work, after_phone_down: L.phone },
      S.env,
      "tpl-focus-timer"
    ),
    "tpl-focus-notify-off": g({ after_start_work: L.work, after_phone_down: L.phone }, S.env),
    "tpl-focus-desk-one": g({ after_start_work: L.work, after_arrive_home: L.home }, S.env),
    "tpl-focus-5min": g({ after_start_work: L.work, after_lunch: L.lunch }, S.env),

    "tpl-sleep-screen": g({ before_bed: L.bed, after_phone_down: L.phone }, S.do),
    "tpl-sleep-phone": g(
      { before_bed: L.bed, after_phone_down: L.phone },
      S.env,
      "tpl-sleep-phone"
    ),
    "tpl-sleep-breath": g({ before_bed: L.bed }, S.body),
    "tpl-sleep-dim-light": g({ before_bed: L.bed }, S.env),
    "tpl-sleep-alarm-set": g({ before_bed: L.bed }, S.do),
    "tpl-sleep-gratitude": g({ before_bed: L.bed }, S.do),

    "tpl-social-name": g({ after_wake: L.wake, after_arrive_home: L.home }, S.do),
    "tpl-social-msg": g({ after_lunch: L.lunch, after_start_work: L.work }, S.do),
    "tpl-social-smile": g({ after_arrive_home: L.home, after_wake: L.wake }, S.do),
    "tpl-social-wave-plan": g({ after_arrive_home: L.home }, S.do),
    "tpl-social-send-hi": g({ after_lunch: L.lunch, after_phone_down: L.phone }, S.do),
    "tpl-social-voice-draft": g({ after_start_work: L.work, after_arrive_home: L.home }, S.do),
  };
}

module.exports = {
  tr: buildGuides("tr"),
  en: buildGuides("en"),
  "pt-BR": buildGuides("pt-BR"),
};
