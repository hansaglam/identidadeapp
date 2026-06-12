/**
 * Merges anchorGuides + action guide overrides into home.anchorStep for tr/en/pt-BR.
 */
const fs = require("fs");
const path = require("path");
const { CONTENT } = require("./anchorGuideContent");
const TPL_GUIDES = require("./tplActionGuides");

const localesDir = path.join(__dirname, "..", "src", "i18n", "locales");

const LANG_FILES = {
  tr: "tr.json",
  en: "en.json",
  "pt-BR": "pt-BR.json",
};

function patchLocale(lang) {
  const file = path.join(localesDir, LANG_FILES[lang]);
  const data = JSON.parse(fs.readFileSync(file, "utf8"));
  const pack = CONTENT[lang];

  const anchorStep = data.home.anchorStep;
  Object.assign(anchorStep.modal, pack.modalPatch);
  anchorStep.anchorGuides = pack.anchorGuides;

  const fb = anchorStep.guide._fallback;
  Object.assign(fb, pack.fallbackPatch);

  const mergedActions = { ...pack.actionGuides, ...TPL_GUIDES[lang] };
  for (const [actionId, fields] of Object.entries(mergedActions)) {
    if (!anchorStep.guide[actionId]) anchorStep.guide[actionId] = {};
    Object.assign(anchorStep.guide[actionId], fields);
  }

  fs.writeFileSync(file, JSON.stringify(data, null, 2) + "\n", "utf8");
  console.log("patched", LANG_FILES[lang]);
}

patchLocale("tr");
patchLocale("en");
patchLocale("pt-BR");
