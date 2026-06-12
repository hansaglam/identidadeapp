/** Shared anchor guide + action override content for tr / en / pt-BR */

const ANCHOR_IDS = [
  "after_wake",
  "after_brush",
  "after_morning_drink",
  "after_lunch",
  "after_phone_down",
  "before_bed",
  "after_start_work",
  "after_arrive_home",
];

function anchorGuides(lang) {
  const c = CONTENT[lang].anchorGuides;
  return c;
}

const CONTENT = {
  tr: {
    modalPatch: {
      afterMove: "Çapa anında tek net hamle",
      prepareSub: "Nefes al — 3 sn sonra başlıyorsun",
    },
    anchorGuides: {
      after_wake: {
        lead: "Günün ilk anı: «{{anchor}}». Beden uyandı, zihin dağınık olabilir — {{title}} ile {{habit}} yoluna tek net adım.",
        step1: "Gözlerini aç, çapa cümlesini içinden bir kez tekrar et",
        step2: "{{title}} — yataktan kalkmadan veya hemen kalkarak yap",
        tip: "Sabah enerjisi düşükse en küçük sürüm yeter; görünür olmak mükemmellikten önemli.",
      },
      after_brush: {
        lead: "Taze bir başlangıç: «{{anchor}}» sonrası {{habit}} için {{title}} — banyo ritmi güçlü bir çapa.",
        step1: "Aynada veya lavaboda çapayı bir kez söyle",
        step2: "Fırçaladıktan hemen sonra {{title}} hareketine geç",
        tip: "Aynı noktada her gün tekrar — beyin deseni hızla tanır.",
      },
      after_morning_drink: {
        lead: "İlk yudumdan sonra zihin açılır: «{{anchor}}» anında {{title}} — {{habit}} için küçük ama net bir hamle.",
        step1: "Bardağı indir, çapa cümlesini tekrar et",
        step2: "{{title}} — mutfakta veya masada hemen yap",
        tip: "İçecek molası = beden + alışkanlık birleşimi; süreyi kısa tut.",
      },
      after_lunch: {
        lead: "Öğle sonrası enerji dalgalanır: «{{anchor}}» sonrası {{title}} ile {{habit}} yolunu canlı tut.",
        step1: "Tabağı bırak, çapayı bir kez hatırla",
        step2: "{{title}} — 5 sn yeter, sonra güne dön",
        tip: "Öğleden sonra uyku bastırıyorsa mini sürüm seç; varlık sayılır.",
      },
      after_phone_down: {
        lead: "Ekran kapandı — zihin hâlâ hızlı: «{{anchor}}» anında {{title}} ile {{habit}} için reset.",
        step1: "Telefonu bıraktığın yere bak, çapayı söyle",
        step2: "{{title}} — ekrana dönmeden önce tek hamle",
        tip: "Telefon çapası güçlüdür; her bırakışta aynı mini hareket ritmi kurar.",
      },
      before_bed: {
        lead: "Gün kapanıyor: «{{anchor}}» öncesi {{title}} — {{habit}} için sakin, küçük bir kapanış.",
        step1: "Yatağa girmeden çapayı fısılda",
        step2: "{{title}} — yavaş ve kısa, zorlama yok",
        tip: "Gece sürümü her zaman gündüzden küçük; uyku önceliğini koru.",
      },
      after_start_work: {
        lead: "Masa veya ekran hazır: «{{anchor}}» anı {{habit}} için en net başlangıç. Sonraki hamle: {{title}}.",
        step1: "Çapa cümlesini görür görmez içinden tekrar et",
        step2: "{{title}} — düşünmeden, tek seferde",
        tip: "İş moduna geçerken 5 sn beden hareketi odak devresini açar.",
      },
      after_arrive_home: {
        lead: "Eve girdin, gün modu değişti: «{{anchor}}» sonrası {{title}} — {{habit}} için ev ritmine geç.",
        step1: "Ayakkabıları çıkardıktan sonra çapayı söyle",
        step2: "{{title}} — kapı eşiğinde veya salonunda hemen yap",
        tip: "Ev çapası iş ve özel hayat arasında köprü; aynı noktada tekrarla.",
      },
    },
    fallbackPatch: {
      lead_after_wake: "«{{anchor}}» — uyanır uyanmaz {{title}}; {{habit}} için ilk sinyal.",
      lead_after_brush: "«{{anchor}}» — taze ağız sonrası {{title}}; {{habit}} yolunda.",
      lead_after_morning_drink: "«{{anchor}}» — ilk yudumdan sonra {{title}}; {{habit}} için net adım.",
      lead_after_lunch: "«{{anchor}}» — öğle sonrası {{title}}; {{habit}} ritmini koru.",
      lead_after_phone_down: "«{{anchor}}» — ekran kapandı, {{title}}; {{habit}} reseti.",
      lead_after_start_work: "«{{anchor}}» — işe başlarken {{title}}; {{habit}} için odak açılışı.",
      lead_before_bed: "«{{anchor}}» — yatmadan önce {{title}}; {{habit}} için sakin kapanış.",
      lead_after_arrive_home: "«{{anchor}}» — eve gelince {{title}}; {{habit}} ev ritmi.",
      step1_after_wake: "Çapayı yatakta veya ayakta bir kez tekrar et",
      step1_after_start_work: "Ekran açıldığında çapayı içinden söyle",
      step1_before_bed: "Yatağa girmeden önce çapayı fısılda",
      step2_after_wake: "{{title}} — günün ilk fiziksel sinyali",
      step2_after_start_work: "{{title}} — masada, tek hamle, düşünme yok",
      tip: "Küçük hamle, büyük zincir — mükemmellik arama, tekrar et.",
    },
    actionGuides: {
      "micro-posture": {
        lead_after_start_work:
          "Ekran açıldı — omuzların öne kaymış olabilir. «{{anchor}}» anında {{title}}; {{habit}} için bedeni uyandır.",
        lead_after_wake:
          "Uyandın, vücut hâlâ uykulu. «{{anchor}}» sonrası {{title}} ile omurgayı aç — {{habit}} günü başlat.",
        lead_after_phone_down:
          "Telefonu bıraktın, boyun gergin olabilir. «{{anchor}}» ile {{title}} — {{habit}} için postür reseti.",
        lead_before_bed:
          "Gün bitti, omuzlar yük taşımış olabilir. «{{anchor}}» öncesi {{title}} — yumuşak kapanış.",
        step1: "Omuzları yavaşça geriye çek, kürek kemiklerini yaklaştır",
        step2: "Göğsünü 2 sn aç, nefes al — {{habit}} zihninde canlansın",
        tip_after_start_work: "2 sn duruş düzeltmesi, saatlerce oturmaya hazırlar.",
      },
      "stand-tall": {
        lead_after_start_work:
          "Otururken göğüs kapanır. «{{anchor}}» anında dik dur, {{title}} — {{habit}} için beden sinyali.",
        step1: "Ayak tabanlarını yere bastır, omuzları geri al",
        step2: "Göğsünü 3 sn aç, başı hizala — sonra {{habit}} hamlesine geç",
      },
      "stand-up": {
        lead_after_lunch:
          "Öğle sonrası ağır hissediyorsan normal. «{{anchor}}» sonrası ayağa kalk — {{habit}} için kan dolaşımı.",
        lead_after_start_work:
          "Uzun oturuş zihni yavaşlatır. «{{anchor}}» ile ayağa kalk, {{habit}} ritmini başlat.",
        step1: "Sandalyeden kalkmadan önce çapayı tekrar et",
        step2: "Ayağa kalk, 3 sn dur — {{habit}} için hazır ol",
      },
      "shake-shoulders": {
        lead_after_wake: "Uyku tutukluğu normal. «{{anchor}}» sonrası {{title}} — {{habit}} için bedeni uyandır.",
        lead_after_start_work: "Masada gerginlik birikir. «{{anchor}}» ile omuzları silk, {{habit}} yolunu aç.",
        step1: "Omuzları kulaklara doğru kaldır",
        step2: "Bırak ve 3 kez dairesel silk — nefesle birlikte",
      },
      "drink-water": {
        lead_after_wake: "Gece susuzluk yaygın. «{{anchor}}» sonrası bir yudum — {{habit}} ve beden birlikte başlar.",
        lead_after_morning_drink: "İçecek çapası zaten var; «{{anchor}}» sonrası {{title}} ile {{habit}} ritmini pekiştir.",
        step1: "Bardağı eline al veya masaya koy",
        step2: "Bir yudum al, çapayı tekrar et — {{habit}} sırada",
      },
      "open-window": {
        lead_after_wake: "Taze hava uyanmayı hızlandırır. «{{anchor}}» sonrası {{title}} — {{habit}} için zihin açılışı.",
        lead_after_arrive_home: "Eve havasız girdin mi? «{{anchor}}» ile pencere/pencere önü — {{habit}} reseti.",
        step1: "Pencereyi veya perdeyi arala",
        step2: "5 sn temiz hava al, {{habit}} niyetini hatırla",
      },
      "screen-blank": {
        lead_after_start_work: "Sekmeler dikkati böler. «{{anchor}}» anında başını ekrandan kaldır — {{habit}} öncesi reset.",
        lead_after_phone_down: "Kaydırma sonrası zihin bulanık. «{{anchor}}» ile ekrandan uzaklaş, {{habit}} odağına dön.",
        step1: "Gözleri ekrandan ayır, uzağa bak",
        step2: "10 sn tek noktaya odaklan — sonra {{habit}}",
      },
      "phone-down": {
        lead_after_phone_down: "Çapa ve hareket aynı an: telefonu çevir, «{{anchor}}» de — {{habit}} için kesinti.",
        step1: "Telefonu yüz üstü çevir veya bir kol uzağa koy",
        step2: "Çapayı tekrar et, {{habit}} ilk hamlesine geç",
      },
      "tpl-focus-tab": {
        lead_after_start_work:
          "Çok sekme = dağınık zihin. «{{anchor}}» anında tek sekme bırak — {{habit}} için odak alanı aç.",
        step1: "Gereksiz sekmeleri kapat, tek iş sekmesi bırak",
        step2: "Çapayı söyle, o sekmede {{habit}} hamlesini başlat",
      },
      "tpl-focus-task": {
        lead_after_start_work:
          "İş günü başladı. «{{anchor}}» sonrası tek görevini sesli söyle — {{habit}} netliği.",
        step1: "Bugünkü tek önceliği bir cümleyle söyle",
        step2: "O göreve kilitlen, {{habit}} mini sürümünü yap",
      },
      "anchor-visualize": {
        lead_after_wake: "Sabah zihni dağınık. «{{anchor}}» anını 5 sn canlandır — sonra {{habit}}.",
        lead_before_bed: "Yatmadan önce yarını planla: «{{anchor}}» — 5 sn {{habit}} görselleştir.",
        step1: "Gözleri kapat veya yumuşak bak, çapayı tekrar et",
        step2: "{{habit}} ilk hamlesini zihinde tamamla",
      },
      "tiny-rep": {
        lead_after_wake: "Tek tekrar bile zinciri başlatır. «{{anchor}}» — bir {{habit}} tekrarı.",
        step1: "Çapayı hatırla, en küçük sürümü seç",
        step2: "Tek tekrarı tamamla — süre önemli değil",
      },
      "deep-breath": {
        lead_before_bed: "Günün gerginliği bedende kalır. «{{anchor}}» öncesi derin nefes — {{habit}} sakin kapanış.",
        lead_after_lunch: "Öğle sonrası yavaşlama. «{{anchor}}» ile nefes al, {{habit}} ritmine dön.",
        step1: "Burnundan 4 sn nefes al",
        step2: "Ağızdan 4 sn ver — sonra {{habit}} mini hamlesi",
      },
      "micro-anchor-say": {
        step1: "Çapa cümlesini net ve yüksek sesle söyle",
        step2: "{{title}} — söyledikten hemen sonra yap",
      },
      "micro-habit-start": {
        lead_after_start_work:
          "İş modu açıldı. «{{anchor}}» sonrası {{habit}} en küçük parçası — başlamak yeter.",
        step1: "Çapayı söyle, en küçük sürümü seç",
        step2: "Sadece başlangıç parçasını yap — bitirmek şart değil",
      },
    },
  },
  en: {
    modalPatch: {
      afterMove: "One clear move at your anchor",
      prepareSub: "Breathe — you start in 3 seconds",
    },
    anchorGuides: {
      after_wake: {
        lead: "First moment of the day: «{{anchor}}». Body is awake, mind may be scattered — {{title}} is one clear step on your {{habit}} path.",
        step1: "Open your eyes, repeat the anchor line once in your head",
        step2: "{{title}} — from bed or right after standing up",
        tip: "Low morning energy? The smallest version counts — showing up beats perfection.",
      },
      after_brush: {
        lead: "Fresh start: after «{{anchor}}», {{title}} for {{habit}} — bathroom rhythm is a strong anchor.",
        step1: "At the mirror or sink, say the anchor once",
        step2: "Right after brushing, move into {{title}}",
        tip: "Same spot every day — your brain learns the pattern fast.",
      },
      after_morning_drink: {
        lead: "After the first sip, the mind opens: at «{{anchor}}», {{title}} — a small, clear move for {{habit}}.",
        step1: "Put the cup down, repeat the anchor",
        step2: "{{title}} — do it right there in the kitchen or at your desk",
        tip: "Drink break = body + habit together; keep it short.",
      },
      after_lunch: {
        lead: "Post-lunch energy dips: after «{{anchor}}», {{title}} keeps your {{habit}} rhythm alive.",
        step1: "Put the plate aside, recall the anchor once",
        step2: "{{title}} — 5 seconds is enough, then back to your day",
        tip: "Afternoon slump? Pick the mini version — presence counts.",
      },
      after_phone_down: {
        lead: "Screen off — mind still racing: at «{{anchor}}», {{title}} resets you for {{habit}}.",
        step1: "Look where you put the phone, say the anchor",
        step2: "{{title}} — one move before returning to the screen",
        tip: "Phone anchors are powerful; same micro-move every time you put it down.",
      },
      before_bed: {
        lead: "Day is closing: before «{{anchor}}», {{title}} — a calm, small finish for {{habit}}.",
        step1: "Whisper the anchor before getting into bed",
        step2: "{{title}} — slow and short, no forcing",
        tip: "Night version is always smaller than daytime; protect your sleep.",
      },
      after_start_work: {
        lead: "Desk or screen is ready: «{{anchor}}» is the clearest start for {{habit}}. Next move: {{title}}.",
        step1: "As soon as you see the anchor moment, repeat it silently",
        step2: "{{title}} — once, without overthinking",
        tip: "5 seconds of body movement when entering work mode opens your focus circuit.",
      },
      after_arrive_home: {
        lead: "You're home, mode shifts: after «{{anchor}}», {{title}} — transition {{habit}} into home rhythm.",
        step1: "After taking off shoes, say the anchor",
        step2: "{{title}} — at the doorway or living room, right away",
        tip: "Home anchor bridges work and life — repeat at the same spot.",
      },
    },
    fallbackPatch: {
      lead_after_wake: "«{{anchor}}» — right when you wake, {{title}}; first signal for {{habit}}.",
      lead_after_brush: "«{{anchor}}» — after a fresh mouth, {{title}}; on your {{habit}} path.",
      lead_after_morning_drink: "«{{anchor}}» — after the first sip, {{title}}; clear step for {{habit}}.",
      lead_after_lunch: "«{{anchor}}» — after lunch, {{title}}; keep {{habit}} rhythm.",
      lead_after_phone_down: "«{{anchor}}» — screen down, {{title}}; {{habit}} reset.",
      lead_after_start_work: "«{{anchor}}» — starting work, {{title}}; focus opener for {{habit}}.",
      lead_before_bed: "«{{anchor}}» — before bed, {{title}}; calm close for {{habit}}.",
      lead_after_arrive_home: "«{{anchor}}» — home arrival, {{title}}; {{habit}} home rhythm.",
      step1_after_wake: "Repeat the anchor once in bed or standing",
      step1_after_start_work: "When the screen opens, say the anchor silently",
      step1_before_bed: "Whisper the anchor before getting into bed",
      step2_after_wake: "{{title}} — first physical signal of the day",
      step2_after_start_work: "{{title}} — at the desk, one move, no thinking",
      tip: "Small move, big chain — don't chase perfection, repeat.",
    },
    actionGuides: {
      "micro-posture": {
        lead_after_start_work:
          "Screen on — shoulders may have rolled forward. At «{{anchor}}», {{title}}; wake the body for {{habit}}.",
        lead_after_wake:
          "You're awake, body still sleepy. After «{{anchor}}», {{title}} opens your spine — starts the {{habit}} day.",
        lead_after_phone_down:
          "Phone down — neck may be tight. With «{{anchor}}», {{title}} — posture reset for {{habit}}.",
        lead_before_bed:
          "Day done, shoulders may carry weight. Before «{{anchor}}», {{title}} — soft close.",
        step1: "Slowly pull shoulders back, squeeze shoulder blades",
        step2: "Open chest for 2s, breathe — let {{habit}} come alive in your mind",
        tip_after_start_work: "2 seconds of posture prep you for hours of sitting.",
      },
      "stand-tall": {
        lead_after_start_work:
          "Sitting collapses the chest. At «{{anchor}}», stand tall — {{title}} for {{habit}}.",
        step1: "Press feet flat, roll shoulders back",
        step2: "Open chest 3s, align head — then {{habit}} move",
      },
      "stand-up": {
        lead_after_lunch:
          "Post-lunch heaviness is normal. After «{{anchor}}», stand up — circulation for {{habit}}.",
        lead_after_start_work:
          "Long sitting slows the mind. At «{{anchor}}», stand — start {{habit}} rhythm.",
        step1: "Repeat the anchor before leaving the chair",
        step2: "Stand up, pause 3s — ready for {{habit}}",
      },
      "shake-shoulders": {
        lead_after_wake: "Sleep stiffness is normal. After «{{anchor}}», {{title}} — wake the body for {{habit}}.",
        lead_after_start_work: "Desk tension builds. At «{{anchor}}», shake shoulders, open {{habit}} path.",
        step1: "Raise shoulders toward ears",
        step2: "Drop and circle 3 times — with your breath",
      },
      "drink-water": {
        lead_after_wake: "Night dehydration is common. After «{{anchor}}», one sip — body and {{habit}} start together.",
        lead_after_morning_drink: "Drink anchor is set; after «{{anchor}}», {{title}} reinforces {{habit}} rhythm.",
        step1: "Pick up the glass or place it on the desk",
        step2: "One sip, repeat anchor — {{habit}} is next",
      },
      "open-window": {
        lead_after_wake: "Fresh air speeds waking up. After «{{anchor}}», {{title}} — mental opener for {{habit}}.",
        lead_after_arrive_home: "Stale air at home? At «{{anchor}}», window or doorway — {{habit}} reset.",
        step1: "Open window or curtain",
        step2: "5s of fresh air, recall {{habit}} intention",
      },
      "screen-blank": {
        lead_after_start_work:
          "Tabs split attention. At «{{anchor}}», lift head from screen — reset before {{habit}}.",
        lead_after_phone_down:
          "After scrolling, mind is fuzzy. At «{{anchor}}», step from screen, return to {{habit}} focus.",
        step1: "Look away from screen, gaze into distance",
        step2: "10s on one point — then {{habit}}",
      },
      "phone-down": {
        lead_after_phone_down:
          "Anchor and move together: flip phone, say «{{anchor}}» — interrupt for {{habit}}.",
        step1: "Face phone down or place one arm away",
        step2: "Repeat anchor, start first {{habit}} move",
      },
      "tpl-focus-tab": {
        lead_after_start_work:
          "Many tabs = scattered mind. At «{{anchor}}», keep one tab — open focus for {{habit}}.",
        step1: "Close extra tabs, leave one work tab",
        step2: "Say anchor, start {{habit}} move in that tab",
      },
      "tpl-focus-task": {
        lead_after_start_work:
          "Work day started. After «{{anchor}}», say your single task — {{habit}} clarity.",
        step1: "Say today's top priority in one sentence",
        step2: "Lock on it, do {{habit}} mini version",
      },
      "anchor-visualize": {
        lead_after_wake: "Morning mind is scattered. Visualize «{{anchor}}» 5s — then {{habit}}.",
        lead_before_bed: "Plan tomorrow before bed: «{{anchor}}» — 5s {{habit}} visualization.",
        step1: "Close or soften eyes, repeat anchor",
        step2: "Complete first {{habit}} move in your mind",
      },
      "tiny-rep": {
        lead_after_wake: "One rep starts the chain. «{{anchor}}» — one {{habit}} repetition.",
        step1: "Recall anchor, pick smallest version",
        step2: "Complete one rep — duration doesn't matter",
      },
      "deep-breath": {
        lead_before_bed: "Day's tension stays in the body. Before «{{anchor}}», deep breath — calm {{habit}} close.",
        lead_after_lunch: "Post-lunch slowdown. At «{{anchor}}», breathe, return to {{habit}} rhythm.",
        step1: "Inhale 4s through nose",
        step2: "Exhale 4s through mouth — then {{habit}} micro move",
      },
      "micro-anchor-say": {
        step1: "Say the anchor line clearly out loud",
        step2: "{{title}} — right after you say it",
      },
      "micro-habit-start": {
        lead_after_start_work:
          "Work mode on. After «{{anchor}}», smallest part of {{habit}} — starting is enough.",
        step1: "Say anchor, pick smallest version",
        step2: "Do only the start piece — finishing not required",
      },
    },
  },
  "pt-BR": {
    modalPatch: {
      afterMove: "Um movimento claro na âncora",
      prepareSub: "Respire — começa em 3 segundos",
    },
    anchorGuides: {
      after_wake: {
        lead: "Primeiro momento do dia: «{{anchor}}». Corpo acordou, mente pode estar dispersa — {{title}} é um passo claro no caminho de {{habit}}.",
        step1: "Abra os olhos, repita a frase da âncora uma vez",
        step2: "{{title}} — na cama ou logo ao levantar",
        tip: "Energia baixa de manhã? A menor versão conta — aparecer vence perfeição.",
      },
      after_brush: {
        lead: "Começo fresco: após «{{anchor}}», {{title}} para {{habit}} — ritmo do banheiro é âncora forte.",
        step1: "No espelho ou pia, diga a âncora uma vez",
        step2: "Logo após escovar, vá para {{title}}",
        tip: "Mesmo ponto todo dia — o cérebro aprende rápido.",
      },
      after_morning_drink: {
        lead: "Após o primeiro gole, a mente abre: em «{{anchor}}», {{title}} — movimento pequeno e claro para {{habit}}.",
        step1: "Ponha o copo, repita a âncora",
        step2: "{{title}} — na cozinha ou na mesa, na hora",
        tip: "Pausa da bebida = corpo + hábito; mantenha curto.",
      },
      after_lunch: {
        lead: "Energia pós-almoço oscila: após «{{anchor}}», {{title}} mantém o ritmo de {{habit}}.",
        step1: "Afaste o prato, lembre a âncora uma vez",
        step2: "{{title}} — 5s bastam, volte ao dia",
        tip: "Sonolência da tarde? Escolha a mini versão — presença conta.",
      },
      after_phone_down: {
        lead: "Tela apagada — mente ainda acelerada: em «{{anchor}}», {{title}} reinicia você para {{habit}}.",
        step1: "Olhe onde pôs o celular, diga a âncora",
        step2: "{{title}} — um movimento antes de voltar à tela",
        tip: "Âncoras de celular são poderosas; mesmo micro-movimento ao largar.",
      },
      before_bed: {
        lead: "Dia fechando: antes de «{{anchor}}», {{title}} — fechamento calmo para {{habit}}.",
        step1: "Sussurre a âncora antes de deitar",
        step2: "{{title}} — lento e curto, sem forçar",
        tip: "Versão noturna sempre menor; proteja o sono.",
      },
      after_start_work: {
        lead: "Mesa ou tela pronta: «{{anchor}}» é o início mais claro para {{habit}}. Próximo: {{title}}.",
        step1: "Ao ver o momento da âncora, repita em silêncio",
        step2: "{{title}} — uma vez, sem pensar demais",
        tip: "5s de movimento corporal ao entrar no trabalho abre o circuito de foco.",
      },
      after_arrive_home: {
        lead: "Chegou em casa, modo muda: após «{{anchor}}», {{title}} — transição de {{habit}} para ritmo doméstico.",
        step1: "Após tirar os sapatos, diga a âncora",
        step2: "{{title}} — na porta ou sala, na hora",
        tip: "Âncora de casa liga trabalho e vida — repita no mesmo ponto.",
      },
    },
    fallbackPatch: {
      lead_after_wake: "«{{anchor}}» — ao acordar, {{title}}; primeiro sinal para {{habit}}.",
      lead_after_brush: "«{{anchor}}» — após escovar, {{title}}; no caminho de {{habit}}.",
      lead_after_morning_drink: "«{{anchor}}» — após o gole, {{title}}; passo claro para {{habit}}.",
      lead_after_lunch: "«{{anchor}}» — após almoço, {{title}}; mantenha ritmo de {{habit}}.",
      lead_after_phone_down: "«{{anchor}}» — celular largado, {{title}}; reset de {{habit}}.",
      lead_after_start_work: "«{{anchor}}» — ao começar trabalho, {{title}}; abertura de foco para {{habit}}.",
      lead_before_bed: "«{{anchor}}» — antes de dormir, {{title}}; fechamento calmo de {{habit}}.",
      lead_after_arrive_home: "«{{anchor}}» — ao chegar em casa, {{title}}; ritmo doméstico de {{habit}}.",
      step1_after_wake: "Repita a âncora na cama ou em pé",
      step1_after_start_work: "Ao abrir a tela, diga a âncora em silêncio",
      step1_before_bed: "Sussurre a âncora antes de deitar",
      step2_after_wake: "{{title}} — primeiro sinal físico do dia",
      step2_after_start_work: "{{title}} — na mesa, um movimento, sem pensar",
      tip: "Movimento pequeno, corrente grande — não busque perfeição, repita.",
    },
    actionGuides: {
      "micro-posture": {
        lead_after_start_work:
          "Tela ligada — ombros podem estar para frente. Em «{{anchor}}», {{title}}; acorde o corpo para {{habit}}.",
        lead_after_wake:
          "Acordou, corpo ainda sonolento. Após «{{anchor}}», {{title}} abre a coluna — inicia o dia de {{habit}}.",
        lead_after_phone_down:
          "Celular largado — pescoço pode estar tenso. Com «{{anchor}}», {{title}} — reset postural para {{habit}}.",
        lead_before_bed:
          "Dia acabou, ombros podem pesar. Antes de «{{anchor}}», {{title}} — fechamento suave.",
        step1: "Puxe ombros para trás devagar, aproxime omoplatas",
        step2: "Abra o peito 2s, respire — deixe {{habit}} ganhar vida na mente",
        tip_after_start_work: "2s de postura preparam horas sentado.",
      },
      "stand-tall": {
        lead_after_start_work:
          "Sentar fecha o peito. Em «{{anchor}}», fique ereto — {{title}} para {{habit}}.",
        step1: "Pressione pés no chão, ombros para trás",
        step2: "Abra peito 3s, alinhe cabeça — depois movimento de {{habit}}",
      },
      "stand-up": {
        lead_after_lunch:
          "Peso pós-almoço é normal. Após «{{anchor}}», levante — circulação para {{habit}}.",
        lead_after_start_work:
          "Muito tempo sentado desacelera a mente. Em «{{anchor}}», levante — inicie ritmo de {{habit}}.",
        step1: "Repita a âncora antes de sair da cadeira",
        step2: "Levante, pause 3s — pronto para {{habit}}",
      },
      "shake-shoulders": {
        lead_after_wake: "Rigidez do sono é normal. Após «{{anchor}}», {{title}} — acorde o corpo para {{habit}}.",
        lead_after_start_work: "Tensão na mesa acumula. Em «{{anchor}}», sacuda ombros, abra caminho de {{habit}}.",
        step1: "Eleve ombros em direção às orelhas",
        step2: "Solte e gire 3 vezes — com a respiração",
      },
      "drink-water": {
        lead_after_wake: "Desidratação noturna é comum. Após «{{anchor}}», um gole — corpo e {{habit}} juntos.",
        lead_after_morning_drink: "Âncora da bebida definida; após «{{anchor}}», {{title}} reforça ritmo de {{habit}}.",
        step1: "Pegue o copo ou coloque na mesa",
        step2: "Um gole, repita âncora — {{habit}} vem depois",
      },
      "open-window": {
        lead_after_wake: "Ar fresco acelera o despertar. Após «{{anchor}}», {{title}} — abertura mental para {{habit}}.",
        lead_after_arrive_home: "Ar parado em casa? Em «{{anchor}}», janela ou porta — reset de {{habit}}.",
        step1: "Abra janela ou cortina",
        step2: "5s de ar fresco, lembre intenção de {{habit}}",
      },
      "screen-blank": {
        lead_after_start_work:
          "Abas dividem atenção. Em «{{anchor}}», tire a cabeça da tela — reset antes de {{habit}}.",
        lead_after_phone_down:
          "Após rolar feed, mente confusa. Em «{{anchor}}», afaste-se da tela, volte ao foco de {{habit}}.",
        step1: "Desvie o olhar, olhe ao longe",
        step2: "10s em um ponto — depois {{habit}}",
      },
      "phone-down": {
        lead_after_phone_down:
          "Âncora e movimento juntos: vire o celular, diga «{{anchor}}» — interrupção para {{habit}}.",
        step1: "Celular virado ou um braço de distância",
        step2: "Repita âncora, inicie primeiro movimento de {{habit}}",
      },
      "tpl-focus-tab": {
        lead_after_start_work:
          "Muitas abas = mente dispersa. Em «{{anchor}}», deixe uma aba — abra foco para {{habit}}.",
        step1: "Feche abas extras, deixe uma de trabalho",
        step2: "Diga âncora, inicie movimento de {{habit}} nessa aba",
      },
      "tpl-focus-task": {
        lead_after_start_work:
          "Dia de trabalho começou. Após «{{anchor}}», diga tarefa única — clareza de {{habit}}.",
        step1: "Diga prioridade do dia em uma frase",
        step2: "Trave nela, faça mini versão de {{habit}}",
      },
      "anchor-visualize": {
        lead_after_wake: "Mente matinal dispersa. Visualize «{{anchor}}» 5s — depois {{habit}}.",
        lead_before_bed: "Planeje amanhã antes de dormir: «{{anchor}}» — 5s de visualização de {{habit}}.",
        step1: "Feche ou suavize olhos, repita âncora",
        step2: "Complete primeiro movimento de {{habit}} na mente",
      },
      "tiny-rep": {
        lead_after_wake: "Uma rep inicia a corrente. «{{anchor}}» — uma repetição de {{habit}}.",
        step1: "Lembre âncora, escolha menor versão",
        step2: "Complete uma rep — duração não importa",
      },
      "deep-breath": {
        lead_before_bed: "Tensão do dia fica no corpo. Antes de «{{anchor}}», respire fundo — fechamento calmo de {{habit}}.",
        lead_after_lunch: "Desaceleração pós-almoço. Em «{{anchor}}», respire, volte ao ritmo de {{habit}}.",
        step1: "Inspire 4s pelo nariz",
        step2: "Expire 4s pela boca — depois micro movimento de {{habit}}",
      },
      "micro-anchor-say": {
        step1: "Diga a frase da âncora em voz alta e clara",
        step2: "{{title}} — logo após dizer",
      },
      "micro-habit-start": {
        lead_after_start_work:
          "Modo trabalho ligado. Após «{{anchor}}», menor parte de {{habit}} — começar basta.",
        step1: "Diga âncora, escolha menor versão",
        step2: "Faça só o início — terminar não é obrigatório",
      },
    },
  },
};

module.exports = { CONTENT, ANCHOR_IDS, anchorGuides };
