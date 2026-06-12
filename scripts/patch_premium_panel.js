const fs = require("fs");
const path = require("path");

const localesDir = path.join(__dirname, "..", "src", "i18n", "locales");

const premium = {
  tr: {
    headline: "Kişisel Disiplin Programı",
    tagline: "Kendine verdiğin karar — 66 günlük yolculuğu derinleştirir.",
    freeNote: "Premium şart değil. Ücretsiz devam edebilirsin.",
    panelLabel: "Premium'da",
    commitmentEffect: "Yatırım yapanlar genelde 2–3 kat daha sürdürür.",
    extensionNote: "Otomatikleşme beklenenden uzun sürerse destekten süre uzatma isteyebilirsin.",
    ctaButton: "Programı Başlat",
    ctaButtonWithPrice: "Başlat — {{price}}/ay",
    dismiss: "Şimdi değil",
    dismissSub: "Ücretsiz devam et",
    legalPrivacy: "Gizlilik",
    legalTerms: "Koşullar",
    benefitItems: [
      { title: "66 gün harita", desc: "Her güne dokun, tam özet" },
      { title: "Koç paketi", desc: "İlke · bilim · aksiyon" },
      { title: "Kimlik Aynası", desc: "Zihin notlarından yansıma" },
      { title: "SDT + faz eğitimi", desc: "Haftalık nabız · 4 kart" },
      { title: "Sınırsız Zihin", desc: "Yarın planı her zaman ücretsiz" },
    ],
    triggers: {
      journey: "Harita ve koç paketi Premium'da — yarın planın ücretsiz kalır.",
      day7: "7. gün: tam harita ve günlük özetler açılıyor.",
      day22: "22. gün: pekişme dönemi — tam harita ile bilinçli devam.",
      profile: "Harita, Kimlik Aynası ve SDT ile yolculuğu derinleştir.",
      minddump: "Ücretsiz planda günlük Zihin kotası var. Premium sınırsız not.",
    },
  },
  en: {
    headline: "Personal Discipline Programme",
    tagline: "A decision for yourself — deepens your 66-day journey.",
    freeNote: "Premium isn't required. You can keep using the app for free.",
    panelLabel: "With Premium",
    commitmentEffect: "People who invest are generally 2–3× more likely to keep going.",
    extensionNote: "If automation takes longer than expected, you can request an extension via support.",
    ctaButton: "Start Programme",
    ctaButtonWithPrice: "Start — {{price}}/mo",
    dismiss: "Not now",
    dismissSub: "Continue for free",
    legalPrivacy: "Privacy",
    legalTerms: "Terms",
    benefitItems: [
      { title: "66-day map", desc: "Tap each day, full summary" },
      { title: "Coach pack", desc: "Principle · science · action" },
      { title: "Identity Mirror", desc: "Reflection from mind notes" },
      { title: "SDT + phase training", desc: "Weekly pulse · 4 cards" },
      { title: "Unlimited Mind", desc: "Tomorrow plan always free" },
    ],
    triggers: {
      journey: "Map and coach pack are Premium — tomorrow plan stays free.",
      day7: "Day 7: full map and daily summaries unlock.",
      day22: "Day 22: consolidation phase — continue with the full map.",
      profile: "Deepen your journey with map, Identity Mirror and SDT.",
      minddump: "Free plan has a daily Mind quota. Premium is unlimited notes.",
    },
  },
  "pt-BR": {
    headline: "Programa de Disciplina Pessoal",
    tagline: "Uma decisão por você — aprofunda sua jornada de 66 dias.",
    freeNote: "Premium não é obrigatório. Você pode continuar grátis.",
    panelLabel: "Com Premium",
    commitmentEffect: "Quem investe costuma manter o hábito 2–3× mais.",
    extensionNote: "Se a automação demorar mais que o esperado, peça extensão pelo suporte.",
    ctaButton: "Iniciar programa",
    ctaButtonWithPrice: "Iniciar — {{price}}/mês",
    dismiss: "Agora não",
    dismissSub: "Continuar grátis",
    legalPrivacy: "Privacidade",
    legalTerms: "Termos",
    benefitItems: [
      { title: "Mapa 66 dias", desc: "Toque em cada dia, resumo completo" },
      { title: "Pacote coach", desc: "Princípio · ciência · ação" },
      { title: "Espelho de Identidade", desc: "Reflexo das notas mentais" },
      { title: "SDT + fase", desc: "Pulso semanal · 4 cartões" },
      { title: "Mente ilimitada", desc: "Plano de amanhã sempre grátis" },
    ],
    triggers: {
      journey: "Mapa e pacote coach são Premium — plano de amanhã continua grátis.",
      day7: "Dia 7: mapa completo e resumos diários desbloqueiam.",
      day22: "Dia 22: fase de consolidação — continue com mapa completo.",
      profile: "Aprofunde com mapa, Espelho de Identidade e SDT.",
      minddump: "Plano grátis tem cota diária de Mente. Premium é ilimitado.",
    },
  },
};

for (const [lang, file] of [
  ["tr", "tr.json"],
  ["en", "en.json"],
  ["pt-BR", "pt-BR.json"],
]) {
  const p = path.join(localesDir, file);
  const data = JSON.parse(fs.readFileSync(p, "utf8"));
  const pack = premium[lang];
  const prev = data.premium;
  data.premium = {
    ...prev,
    ...pack,
    benefits: pack.benefitItems.map((b) => `${b.title} — ${b.desc}`),
  };
  delete data.premium.benefitItems;
  data.premium.benefitItems = pack.benefitItems;
  fs.writeFileSync(p, JSON.stringify(data, null, 2) + "\n", "utf8");
  console.log("patched", file);
}
