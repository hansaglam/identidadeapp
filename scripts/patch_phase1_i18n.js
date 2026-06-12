/** interrupt + mind limits + notifications i18n + premium dead key cleanup */
const fs = require("fs");
const path = require("path");

const localesDir = path.join(__dirname, "..", "src", "i18n", "locales");

const packs = {
  tr: {
    interrupt: {
      prepare: "Hazırlan",
      forcedBadge: "Zorunlu adım",
      nowLabel: "{{muscle}} · ŞİMDİ",
      secondsLeft: "{{count}} sn",
      doneEarly: "Yaptım",
      doneEarlyA11y: "Aksiyonu tamamladım",
      muscleWorked: "{{muscle}} kasın çalıştı.",
      flash: ["İyi, devam.", "Kas çalıştı.", "Bir adım attın."],
    },
    mindLimits: {
      freeLimit:
        "Ücretsiz planda en fazla 10 aktif Zihin notu. Eski notu sil veya Premium ile sınırsız yaz.",
      approaching:
        "10 not sınırına yaklaşıyorsun. Bir not sil veya Premium ile sınırsız devam et.",
    },
    notifications: {
      eveningTitle: "Gün bitmeden: Bugün kartı",
      eveningBodies: [
        "{{habit}} için henüz hareket yok. En küçük sürüm yeter — akşam dürüst check-in yap.",
        "Gün bitmeden bir tur: {{habit}}. Tek net adımı seç; 10 saniye bile işe yarar.",
        "{{habit}}: hâlâ “tamam” diyebilirsin. Küçült, sonra aksiyona geç.",
        "Motivasyonu bekleme — Bugün kartındaki mikro-adım {{habit}} için şimdi yeter.",
      ],
      phaseMilestones: [
        { dayOffset: 6, title: "7 günlük kuruluş 🌱", body: "İlk hafta tamam. Beyin deseni fark etmeye başladı — bugün de devam." },
        { dayOffset: 13, title: "14 gün — Örüntü kuruluyor", body: "2 haftadır tekrar ediyorsun. Yol açılıyor — küçük adım yeter." },
        { dayOffset: 21, title: "Kuruluş fazı tamamlandı 🎯", body: "22 gün küçük tekrar + check-in. Pekiştirme başlıyor — devam et." },
        { dayOffset: 29, title: "30 gün — Yarı yoldasın", body: "66 günlük yolculuğun yarısındasın. Tutarlılık iz bıraktı." },
        { dayOffset: 43, title: "Son faz: Otomatikleşme 🚀", body: "Pekiştirme tamam. Zor günde bile küçük sürüm seçenek." },
        { dayOffset: 59, title: "60 gün — Bitiş yakın 🌟", body: "6 gün kaldı. Bu yolculuk artık seni tanımlıyor." },
        { dayOffset: 65, title: "66 gün — Tamamlandı 🎉", body: "Bu artık kimliğinin parçası. Geri dönmek de sistemin içinde." },
      ],
    },
    premiumRemove: ["narrative1", "narrative2", "narrativeEmphasis", "optOut", "ctaLabel"],
  },
  en: {
    interrupt: {
      prepare: "Get ready",
      forcedBadge: "Required step",
      nowLabel: "{{muscle}} · NOW",
      secondsLeft: "{{count}}s",
      doneEarly: "Done",
      doneEarlyA11y: "I completed the action",
      muscleWorked: "Your {{muscle}} muscle worked.",
      flash: ["Good, keep going.", "Muscle engaged.", "You took a step."],
    },
    mindLimits: {
      freeLimit:
        "Free plan: up to 10 active Mind notes. Delete an old note or go Premium for unlimited.",
      approaching:
        "Approaching the 10-note limit. Delete one or continue unlimited with Premium.",
    },
    notifications: {
      eveningTitle: "Before the day ends: Today card",
      eveningBodies: [
        "No movement yet for {{habit}}. Smallest version is enough — honest evening check-in.",
        "One more round before the day ends: {{habit}}. Pick one clear step; 10 seconds count.",
        "{{habit}}: you can still mark “done”. Shrink it, then act.",
        "Don't wait for motivation — today's micro-step for {{habit}} is enough now.",
      ],
      phaseMilestones: [
        { dayOffset: 6, title: "7-day foundation 🌱", body: "First week done. Your brain notices the pattern — keep going today." },
        { dayOffset: 13, title: "14 days — Pattern forming", body: "Two weeks of reps. The path is opening — small steps count." },
        { dayOffset: 21, title: "Foundation phase complete 🎯", body: "22 days of small reps + check-in. Reinforcement begins — continue." },
        { dayOffset: 29, title: "30 days — Halfway", body: "Half of your 66-day journey. Consistency left a trace." },
        { dayOffset: 43, title: "Final phase: Automation 🚀", body: "Reinforcement done. On hard days, the small version is still an option." },
        { dayOffset: 59, title: "60 days — Finish line near 🌟", body: "6 days left. This journey now defines you." },
        { dayOffset: 65, title: "66 days — Complete 🎉", body: "This is part of who you are. Coming back is built into the system." },
      ],
    },
    premiumRemove: ["narrative1", "narrative2", "narrativeEmphasis", "optOut", "ctaLabel"],
  },
  "pt-BR": {
    interrupt: {
      prepare: "Prepare-se",
      forcedBadge: "Passo obrigatório",
      nowLabel: "{{muscle}} · AGORA",
      secondsLeft: "{{count}}s",
      doneEarly: "Feito",
      doneEarlyA11y: "Completei a ação",
      muscleWorked: "Seu músculo {{muscle}} trabalhou.",
      flash: ["Bom, continue.", "Músculo ativado.", "Você deu um passo."],
    },
    mindLimits: {
      freeLimit:
        "Plano grátis: até 10 notas Mente ativas. Apague uma antiga ou Premium ilimitado.",
      approaching:
        "Perto do limite de 10 notas. Apague uma ou continue ilimitado com Premium.",
    },
    notifications: {
      eveningTitle: "Antes do dia acabar: cartão Hoje",
      eveningBodies: [
        "Ainda sem movimento para {{habit}}. Versão mínima basta — check-in honesto à noite.",
        "Mais uma rodada antes do fim: {{habit}}. Um passo claro; 10 segundos contam.",
        "{{habit}}: ainda dá para marcar “feito”. Encolha e aja.",
        "Não espere motivação — o micro-passo de hoje para {{habit}} basta agora.",
      ],
      phaseMilestones: [
        { dayOffset: 6, title: "7 dias de base 🌱", body: "Primeira semana. O cérebro nota o padrão — continue hoje." },
        { dayOffset: 13, title: "14 dias — Padrão se forma", body: "Duas semanas de reps. O caminho abre — passos pequenos contam." },
        { dayOffset: 21, title: "Fase base concluída 🎯", body: "22 dias de reps + check-in. Reforço começa — continue." },
        { dayOffset: 29, title: "30 dias — Metade", body: "Metade da jornada de 66 dias. Consistência deixou rastro." },
        { dayOffset: 43, title: "Fase final: Automação 🚀", body: "Reforço feito. Em dias difíceis, versão mínima ainda é opção." },
        { dayOffset: 59, title: "60 dias — Reta final 🌟", body: "6 dias restam. Esta jornada já te define." },
        { dayOffset: 65, title: "66 dias — Completo 🎉", body: "Isso faz parte de quem você é. Voltar também faz parte." },
      ],
    },
    premiumRemove: ["narrative1", "narrative2", "narrativeEmphasis", "optOut", "ctaLabel"],
  },
};

for (const [lang, file] of [
  ["tr", "tr.json"],
  ["en", "en.json"],
  ["pt-BR", "pt-BR.json"],
]) {
  const p = path.join(localesDir, file);
  const data = JSON.parse(fs.readFileSync(p, "utf8"));
  const pack = packs[lang];
  data.interrupt = pack.interrupt;
  data.mind = data.mind || {};
  data.mind.limits = pack.mindLimits;
  data.notifications = { ...(data.notifications || {}), ...pack.notifications };
  for (const k of pack.premiumRemove) {
    delete data.premium[k];
  }
  fs.writeFileSync(p, JSON.stringify(data, null, 2) + "\n", "utf8");
  console.log("patched", file);
}
