/**
 * Patch pt-BR.json actions.*.title where still English.
 * Run: node scripts/patch_ptbr_actions.js
 */
const fs = require("fs");
const path = require("path");

const PT_TITLES = {
  "shake-shoulders": "Role os ombros",
  "open-window": "Abra uma janela, respire ar fresco por 5 seg",
  "stand-tall": "Fique ereto, abra o peito por 3 seg",
  "jump-once": "Dê um pulo no lugar",
  "march-10": "Marche no lugar, conte até 10",
  "tap-desk": "Bata na mesa duas vezes e se mova",
  "wake-wrists": "Gire os pulsos em círculos por 5 seg",
  "calf-raise-3": "Suba na ponta dos pés 3 vezes",
  "light-on": "Acenda uma luz ou abra a cortina",
  "door-threshold": "Vá até a porta e dê um passo para dentro",
  "anchor-touch": "Toque sua âncora",
  "say-identity": "Diga em voz alta quem você é",
  "two-minute": "Faça a versão de 2 minutos",
  "tiny-rep": "Faça uma repetição",
  "habit-whisper": "Sussurre seu hábito de novo",
  "anchor-visualize": "Visualize sua âncora por 5 seg",
  "one-line-plan": "Escreva o passo de hoje em uma linha",
  "tool-ready": "Coloque a ferramenta na mesa (livro, tapete, água…)",
  "smallest-version-say": "Diga em voz alta a menor versão",
  "repeat-anchor-twice": "Repita sua frase-âncora duas vezes",
  "identity-nod": "Diga “sou alguém que faz isso” e acene com a cabeça",
  "habit-object-touch": "Toque seu objeto do hábito uma vez",
  "mark-done-intent": "Diga “estou fazendo agora” e vá à sua âncora",
  "count-three": "Conte até 3 e comece",
  "phone-down": "Vire o celular com a tela para baixo",
  "no-explain": "Comece sem explicar",
  "five-countdown": "Conte 5-4-3-2-1 e dê o primeiro movimento",
  "shoulders-drop": "Solte os ombros de propósito por 5 seg",
  "unclench-jaw": "Relaxe a mandíbula, língua no céu da boca",
  "stop-scroll-thumb": "Tire o polegar da tela por 3 seg",
  "say-start-now": "Diga “estou começando agora” — sem adiar",
  "box-breath-4": "Inspire 4 seg, segure 4, solte 4",
  "feet-flat-press": "Pressione os pés no chão por 5 seg",
  "timer-3-start": "Conte regressivamente 3 e se mova",
  "close-eyes": "Feche os olhos por 10 segundos",
  "one-thing": "Olhe para apenas uma coisa",
  "screen-blank": "Levante a cabeça da tela",
  "blink-reset": "Pisque 10 vezes, depois foque em um ponto",
  "mute-notifications": "Silencie notificações por 1 hora",
  "desk-clear-one": "Tire uma coisa da mesa",
  "read-one-word": "Leia a primeira palavra da sua tarefa",
  "stare-one-point": "Olhe para um ponto na parede por 10 seg",
  "headphones-on": "Coloque fones ou ative modo silencioso",
  "pen-cap-off": "Tire a tampa da caneta, pronto para escrever",
  "single-task-say": "Diga em voz alta sua única tarefa",
  "soft-restart": "Levante-se e dê 1 passo",
  "smile": "Sorria para si no espelho",
  "stretch": "Levante os braços, abra os ombros (uma vez)",
  "comeback": "Abra os dedos, mova os cotovelos levemente",
  "thank-self": "Diga “tentei hoje”",
  "slow-exhale-3": "Expire devagar 3 vezes",
  "gentle-neck-roll": "Incline o pescoço suavemente para um lado",
  "forgive-yesterday": "Diga “ontem acabou, hoje existe”",
  "hand-on-heart": "Mão no peito, respire por 5 seg",
  "step-outside": "Vá à porta, olhe lá fora por 5 seg",
  "tpl-clear-mind-write": "Reduza sua mente a uma frase",
  "tpl-clear-mind-open": "Abra a aba Mente, deixe o cursor piscar",
  "tpl-clear-breath-box": "Respiração 4-4-4, depois escreva um pensamento",
  "tpl-clear-list-one": "Escolha 1 de 3 coisas na cabeça e escreva",
  "tpl-clear-worry-out": "Jogue a preocupação no papel/nota e feche",
  "tpl-move-bounce-30": "Pule no lugar por 30 seg",
  "tpl-move-pushup-1": "Faça 1 flexão",
  "tpl-move-shoes": "Pegue seu tênis de treino",
  "tpl-move-squat-1": "Faça 1 agachamento",
  "tpl-move-stretch-arms": "Estique os braços para cima, segure 5 seg",
  "tpl-move-stairs-3": "Suba ou desça 3 degraus",
  "tpl-learn-first-line": "Abra a fonte, olhe a primeira linha",
  "tpl-learn-name": "Veja o nome da fonte e feche",
  "tpl-learn-page-turn": "Vire uma página ou role para frente",
  "tpl-learn-one-fact": "Leia uma frase de informação",
  "tpl-learn-bookmark": "Marque onde parou",
  "tpl-self-water": "Coloque um copo d'água na mesa, tome um gole",
  "tpl-self-glass": "Apenas coloque o copo na mesa",
  "tpl-self-wash-face": "Lave o rosto com água fria por 5 seg",
  "tpl-self-lotion-hand": "Passe hidratante em uma mão",
  "tpl-self-posture": "Endireite os ombros, fique ereto 5 seg",
  "tpl-creator-open": "Abra o arquivo, leve o cursor à primeira linha",
  "tpl-creator-word": "Escreva ou desenhe só uma palavra",
  "tpl-creator-idea": "Escreva a ideia na cabeça em uma frase",
  "tpl-creator-title-only": "Escreva só a linha do título",
  "tpl-creator-rough-line": "Escreva uma linha rascunho, sem editar",
  "tpl-focus-tab": "Feche todas as abas, deixe uma",
  "tpl-focus-task": "Diga em voz alta sua tarefa atual",
  "tpl-focus-timer": "Inicie timer de 25 min, vire o celular",
  "tpl-focus-notify-off": "Desligue notificações ou modo foco",
  "tpl-focus-desk-one": "Deixe só uma ferramenta de trabalho na mesa",
  "tpl-focus-5min": "Inicie um timer de foco de 5 minutos",
  "tpl-sleep-screen": "Desligue a tela, feche os olhos 10 seg",
  "tpl-sleep-phone": "Afaste o celular, vire o rosto",
  "tpl-sleep-breath": "Inspire 4, segure 4, solte 4",
  "tpl-sleep-dim-light": "Diminua ou apague a luz",
  "tpl-sleep-alarm-set": "Confira o alarme de amanhã",
  "tpl-sleep-gratitude": "Sussurre uma coisa boa de hoje",
  "tpl-social-name": "Escreva o nome de alguém em mente",
  "tpl-social-msg": "Rascunhe uma mensagem de uma linha",
  "tpl-social-smile": "Pause com intenção de sorrir na próxima pessoa",
  "tpl-social-wave-plan": "Pense em quem vai cumprimentar",
  "tpl-social-send-hi": "Digite “oi” ou “tudo bem”, enviar é opcional",
  "tpl-social-voice-draft": "Grave uma frase em nota de voz",
  "micro-clap": "Bata palmas uma vez",
  "micro-stretch-neck": "Gire o pescoço devagar esquerda-direita (uma vez)",
  "micro-feet": "Pressione os pés no chão, segure 3 seg",
  "micro-posture": "Puxe os ombros para trás, abra o peito 2 seg",
  "micro-sip": "Tome um gole se tiver água",
  "micro-window": "Olhe pela janela ou ao longe por 5 seg",
  "micro-name-habit": "Diga o nome do hábito em voz alta",
  "micro-timer-10": "Inicie um timer de 10 segundos",
  "micro-pen-paper": "Abra caneta ou notas do celular",
  "micro-one-word": "Escreva a intenção de hoje em uma palavra",
  "micro-shoes-on": "Calce ou pegue seus sapatos",
  "micro-door": "Vá até a porta, pise no limiar",
  "micro-smile-mirror": "Olhe para a câmera ou espelho por 2 seg",
  "micro-inhale": "Inspire 4 seg, solte 4 seg",
  "micro-stand-stretch": "Levante-se, estique os braços uma vez",
  "micro-phone-away": "Coloque o celular a um braço de distância",
  "micro-anchor-say": "Diga sua âncora em voz alta",
  "micro-tiny-rep-2": "Faça a menor repetição duas vezes",
  "micro-commit": "Diga “estou começando agora” e se mova",
  "micro-habit-start": "Faça a menor parte do seu hábito",
  "micro-reset-breath": "Inspire pelo nariz, solte pela boca (3 vezes)",
};

const localePath = path.join(__dirname, "../src/i18n/locales/pt-BR.json");
const data = JSON.parse(fs.readFileSync(localePath, "utf8"));

let patched = 0;
for (const [id, title] of Object.entries(PT_TITLES)) {
  if (data.actions[id]) {
    data.actions[id].title = title;
    patched++;
  }
}

// Fix journeyEducation p3-4
if (Array.isArray(data.journeyEducation?.["3"])) {
  const card = data.journeyEducation["3"].find((c) => c.id === "pág.3-4" || c.id === "p3-4");
  if (card) {
    card.id = "p3-4";
    card.title = "Uma frase para a fase de automaticidade";
    card.body =
      "O objetivo não é mais um 'dia perfeito', e sim se recuperar rápido quando escorregar. O caminho longo é a soma de pequenos reparos. Até a menor reconexão de hoje te leva adiante.";
  }
}

fs.writeFileSync(localePath, JSON.stringify(data, null, 2) + "\n", "utf8");
console.log(`Patched ${patched} action titles + journeyEducation p3-4`);
