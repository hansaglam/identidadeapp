const fs = require("fs");
const path = require("path");
const { CONTENT, SLUGS } = require("./checkInConfirmationContent");

const localesDir = path.join(__dirname, "..", "src", "i18n", "locales");
const files = { tr: "tr.json", en: "en.json", "pt-BR": "pt-BR.json" };

for (const [lang, filename] of Object.entries(files)) {
  const file = path.join(localesDir, filename);
  const data = JSON.parse(fs.readFileSync(file, "utf8"));
  const pack = CONTENT[lang];

  data.checkInConfirmation.subtitle = pack.subtitle;
  data.checkInConfirmation.otherPlaceholder = pack.otherPlaceholder;
  data.checkInConfirmation.save = pack.save;

  for (const slug of SLUGS) {
    data.checkInConfirmation[slug] = pack.slugs[slug];
  }

  fs.writeFileSync(file, JSON.stringify(data, null, 2) + "\n", "utf8");
  console.log("patched", filename);
}
