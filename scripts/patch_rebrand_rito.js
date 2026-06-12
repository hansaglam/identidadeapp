/** Rito rebrand — tam mağaza adı (storeName) uygulama içi metinlerde */
const fs = require("fs");
const path = require("path");

const localesDir = path.join(__dirname, "..", "src", "i18n", "locales");

const brand = {
  tr: {
    name: "Rito",
    storeName: "Rito: Alışkanlık ve Kimlik Yolculuğu",
    tagline: "Küçük adım. Kalıcı iz.",
    hashtag: "#RitoApp",
  },
  en: {
    name: "Rito",
    storeName: "Rito: Habit & Identity Journey",
    tagline: "Tiny step. Lasting mark.",
    hashtag: "#RitoApp",
  },
  "pt-BR": {
    name: "Rito",
    storeName: "Rito: Jornada de Hábitos e Identidade",
    tagline: "Pequeno passo. Marca duradoura.",
    hashtag: "#RitoApp",
  },
};

const patches = {
  tr: {
    "profile.footer.versionDay": "{{appName}}\n{{version}} · Gün {{day}}",
    "profile.footer.about": "{{appName}} · v{{version}}",
    "profile.footer.aboutAlertTitle": "Rito: Alışkanlık ve Kimlik Yolculuğu",
    "profile.footer.aboutAlertMsg":
      "Yerel ilkelerle çalışan 66 günlük alışkanlık koçu. Veriler yalnızca cihazında.",
    "profile.data.shareFooter":
      "— Rito: Alışkanlık ve Kimlik Yolculuğu (yerel veri)",
    "profile.data.backupShareTitle":
      "Rito: Alışkanlık ve Kimlik Yolculuğu yedeğini paylaş",
    "profile.weeklySummary.shareFooter":
      "— Rito: Alışkanlık ve Kimlik Yolculuğu (yerel veri)",
    "premium.foot":
      "Premium satın alma mağazan (Apple/Google) üzerinden faturalandırılır; ödeme ayrıntıları bu uygulama tarafından tutulmaz.",
    "journey.complete66.shareMessage":
      "66 günlük kimlik yolculuğumu tamamladım.\n{{habit}} artık kimliğimin parçası.\n#RitoApp",
    "journey.share.hashtag": "#RitoApp",
  },
  en: {
    "profile.footer.versionDay": "{{appName}}\n{{version}} · Day {{day}}",
    "profile.footer.about": "{{appName}} · v{{version}}",
    "profile.footer.aboutAlertTitle": "Rito: Habit & Identity Journey",
    "profile.footer.aboutAlertMsg":
      "A local-first 66-day habit coach. Your data stays on this device.",
    "profile.data.shareFooter":
      "— Rito: Habit & Identity Journey (local data)",
    "profile.data.backupShareTitle":
      "Share Rito: Habit & Identity Journey backup",
    "profile.weeklySummary.shareFooter":
      "— Rito: Habit & Identity Journey (local data)",
    "premium.foot":
      "Premium purchases are billed via your store (Apple/Google); payment details are not stored by this app.",
    "journey.complete66.shareMessage":
      "I completed my 66-day identity journey.\n{{habit}} is now part of who I am.\n#RitoApp",
    "journey.share.hashtag": "#RitoApp",
  },
  "pt-BR": {
    "profile.footer.versionDay": "{{appName}}\n{{version}} · Dia {{day}}",
    "profile.footer.about": "{{appName}} · v{{version}}",
    "profile.footer.aboutAlertTitle": "Rito: Jornada de Hábitos e Identidade",
    "profile.footer.aboutAlertMsg":
      "Coach de hábitos local de 66 dias. Seus dados ficam neste dispositivo.",
    "profile.data.shareFooter":
      "— Rito: Jornada de Hábitos e Identidade (dados locais)",
    "profile.data.backupShareTitle":
      "Compartilhar backup do Rito: Jornada de Hábitos e Identidade",
    "profile.weeklySummary.shareFooter":
      "— Rito: Jornada de Hábitos e Identidade (dados locais)",
    "premium.foot":
      "Compras Premium são cobradas pela loja (Apple/Google); detalhes de pagamento não ficam neste app.",
    "journey.complete66.shareMessage":
      "Concluí minha jornada de identidade de 66 dias.\n{{habit}} agora faz parte de quem eu sou.\n#RitoApp",
    "journey.share.hashtag": "#RitoApp",
  },
};

function setPath(obj, dotted, value) {
  const parts = dotted.split(".");
  let cur = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    const k = parts[i];
    if (!cur[k] || typeof cur[k] !== "object") cur[k] = {};
    cur = cur[k];
  }
  cur[parts[parts.length - 1]] = value;
}

for (const [lang, file] of [
  ["tr", "tr.json"],
  ["en", "en.json"],
  ["pt-BR", "pt-BR.json"],
]) {
  const p = path.join(localesDir, file);
  const data = JSON.parse(fs.readFileSync(p, "utf8"));
  data.brand = brand[lang];
  for (const [key, val] of Object.entries(patches[lang])) {
    setPath(data, key, val);
  }
  fs.writeFileSync(p, JSON.stringify(data, null, 2) + "\n", "utf8");
  console.log("patched", file);
}
