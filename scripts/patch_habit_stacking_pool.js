/**
 * Adds habitStacking.pool.* translations (tr/en/pt-BR) from TINY_BY_MUSCLE source.
 */
const fs = require("fs");
const path = require("path");

const localesDir = path.join(__dirname, "..", "src", "i18n", "locales");

const POOL = {
  tr: {
    karar: [
      {
        title: "Tek seçim pratiği",
        anchor: "Her sabah ilk iş olarak 2 dk tek bir mini seçim yazıp uygula.",
        reason: "Karar anlık kası için düşük sürtünmeli tekrar.",
      },
      {
        title: "Telefon öncesi nefes",
        anchor: "Telefona uzanmadan önce 3 derin nefes — sonra tek görev seç.",
        reason: "Dürtü ile karar arasına mesafe koymak.",
      },
      {
        title: "Akşam hazırlığı",
        anchor: "Yatmadan önce ertesi gün için tek madde seç (kıyafet veya çanta).",
        reason: "Ertesi günün ilk kararını hafifletmek için.",
      },
    ],
    direnc: [
      {
        title: "Beş şınav veya squat",
        anchor: "Yatağa girmeden önce 5 tekrar — say ve bitir.",
        reason: "Direnç kası: küçük fiziksel ‘hayır değil, başla’ pratiği.",
      },
      {
        title: "İlk 5 dakika",
        anchor: "Kaçındığın işte sadece 5 dakika otur; süre dolduğunda durmaya izin var.",
        reason: "Başlamak için süre kutusu — baskıyı düşürür.",
      },
      {
        title: "Bir tabak / bir mail",
        anchor: "Evi bırakmadan önce masada tek tabak/kupa topla veya tek maili cevapla.",
        reason: "Mikro tamamlama ile direnç eşiğini alçaltmak.",
      },
    ],
    baglam: [
      {
        title: "Bağlam değiştirici çift",
        anchor: "Haftada bir kez aynı alışkanlığı ‘farklı yerde’ yap (salon yerine balkon).",
        reason: "Bağlam kası: tetikleyiciyi çeşitlendirmek.",
      },
      {
        title: "Dışarı çıkış tetikleyicisi",
        anchor: "Ayakkabıyı çıkarır çıkmaz 2 dk dışarı adım.",
        reason: "Ev dışı mini ritim oturtmak.",
      },
    ],
    energi: [
      {
        title: "Düşük enerji sürümü",
        anchor: "Yorgun hissettiğinde ‘mini sürüm’ü yap (normalin %50’si süre veya yoğunluk).",
        reason: "Düşük enerji kası: koşul değişince de devam edebilmek.",
      },
      {
        title: "Işık ve su",
        anchor: "Uyanınca perdeleri aç + yarım bardak su — sonra ana alışkanlık.",
        reason: "Enerji zeminini hafifçe yükseltmek.",
      },
    ],
    sosyal: [
      {
        title: "Paylaşımlı küçük taahhüt",
        anchor: "Bir kişiye sözlü ‘bugün X’i 5 dk yapacağım’ de — karşılık bekleme.",
        reason: "Sosyal hesap verebilirlik — hafif baskı, toksik değil.",
      },
      {
        title: "Gürültüde tek tur",
        anchor: "Kalabalık / ofiste 3 dk telefonu çekmeceye koyup tek görev.",
        reason: "Sosyal çevredeki dikkat dağıtıcıları tolere etmek.",
      },
    ],
  },
  en: {
    karar: [
      {
        title: "Single-choice practice",
        anchor: "Each morning, first thing: write and do one 2-minute mini choice.",
        reason: "Low-friction reps for the decision-moment muscle.",
      },
      {
        title: "Breath before phone",
        anchor: "Three deep breaths before reaching for your phone — then pick one task.",
        reason: "Creates space between impulse and choice.",
      },
      {
        title: "Evening prep",
        anchor: "Before bed, pick one item for tomorrow (outfit or bag).",
        reason: "Lightens tomorrow's first decision.",
      },
    ],
    direnc: [
      {
        title: "Five push-ups or squats",
        anchor: "Before getting into bed, 5 reps — count and stop.",
        reason: "Resistance muscle: a small physical 'start, don't debate' rep.",
      },
      {
        title: "First five minutes",
        anchor: "On the task you avoid, sit for 5 minutes only — you're allowed to stop when time's up.",
        reason: "A time box to start — lowers pressure.",
      },
      {
        title: "One dish / one email",
        anchor: "Before leaving home, clear one plate/cup or reply to one email.",
        reason: "Micro-completion lowers the resistance threshold.",
      },
    ],
    baglam: [
      {
        title: "Context-switch pair",
        anchor: "Once a week, do the same habit in a different place (balcony instead of living room).",
        reason: "Context muscle: vary the trigger.",
      },
      {
        title: "Step-outside trigger",
        anchor: "Right after taking off shoes, 2 minutes outside.",
        reason: "A mini rhythm outside the home.",
      },
    ],
    energi: [
      {
        title: "Low-energy version",
        anchor: "When tired, do the 'mini version' (50% of normal time or intensity).",
        reason: "Energy muscle: keep going when conditions shift.",
      },
      {
        title: "Light and water",
        anchor: "On waking, open curtains + half a glass of water — then main habit.",
        reason: "Gently raises your energy baseline.",
      },
    ],
    sosyal: [
      {
        title: "Shared micro-commitment",
        anchor: "Tell one person aloud: 'Today I'll do X for 5 minutes' — no reply needed.",
        reason: "Light social accountability, not toxic pressure.",
      },
      {
        title: "One round in noise",
        anchor: "In a busy office, 3 minutes: phone in drawer, one task.",
        reason: "Tolerate social distractions around you.",
      },
    ],
  },
  "pt-BR": {
    karar: [
      {
        title: "Prática de escolha única",
        anchor: "Toda manhã, primeiro passo: escreva e faça uma mini escolha de 2 min.",
        reason: "Repetição de baixo atrito para o músculo do momento de decisão.",
      },
      {
        title: "Respiração antes do celular",
        anchor: "Três respirações profundas antes de pegar o celular — depois escolha uma tarefa.",
        reason: "Cria espaço entre impulso e escolha.",
      },
      {
        title: "Preparação noturna",
        anchor: "Antes de dormir, escolha um item para amanhã (roupa ou bolsa).",
        reason: "Alivia a primeira decisão do dia seguinte.",
      },
    ],
    direnc: [
      {
        title: "Cinco flexões ou agachamentos",
        anchor: "Antes de deitar, 5 repetições — conte e pare.",
        reason: "Músculo de resistência: um rep físico pequeno de 'comece, não debata'.",
      },
      {
        title: "Primeiros cinco minutos",
        anchor: "Na tarefa que você evita, sente por só 5 minutos — pode parar quando acabar o tempo.",
        reason: "Caixa de tempo para começar — reduz pressão.",
      },
      {
        title: "Um prato / um e-mail",
        anchor: "Antes de sair de casa, lave um prato/copo ou responda um e-mail.",
        reason: "Micro-conclusão abaixa o limiar de resistência.",
      },
    ],
    baglam: [
      {
        title: "Par de troca de contexto",
        anchor: "Uma vez por semana, faça o mesmo hábito em outro lugar (varanda em vez da sala).",
        reason: "Músculo de contexto: variar o gatilho.",
      },
      {
        title: "Gatilho de sair",
        anchor: "Logo após tirar os sapatos, 2 minutos lá fora.",
        reason: "Mini ritmo fora de casa.",
      },
    ],
    energi: [
      {
        title: "Versão de baixa energia",
        anchor: "Quando cansado, faça a 'versão mini' (50% do tempo ou intensidade normal).",
        reason: "Músculo de energia: continuar quando as condições mudam.",
      },
      {
        title: "Luz e água",
        anchor: "Ao acordar, abra as cortinas + meio copo de água — depois o hábito principal.",
        reason: "Eleva levemente a linha de base de energia.",
      },
    ],
    sosyal: [
      {
        title: "Micro-compromisso compartilhado",
        anchor: "Diga em voz alta a uma pessoa: 'Hoje farei X por 5 minutos' — sem precisar de resposta.",
        reason: "Responsabilidade social leve, sem pressão tóxica.",
      },
      {
        title: "Uma rodada no barulho",
        anchor: "No escritório movimentado, 3 min: celular na gaveta, uma tarefa.",
        reason: "Tolerar distrações sociais ao redor.",
      },
    ],
  },
};

const LANG_FILES = { tr: "tr.json", en: "en.json", "pt-BR": "pt-BR.json" };

for (const [lang, filename] of Object.entries(LANG_FILES)) {
  const file = path.join(localesDir, filename);
  const data = JSON.parse(fs.readFileSync(file, "utf8"));
  if (!data.habitStacking) data.habitStacking = {};
  data.habitStacking.pool = POOL[lang];
  fs.writeFileSync(file, JSON.stringify(data, null, 2) + "\n", "utf8");
  console.log("patched pool in", filename);
}
