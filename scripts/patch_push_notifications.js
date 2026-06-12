const fs = require("fs");
const path = require("path");
const CONTENT = require("./pushNotificationContent");

const localesDir = path.join(__dirname, "..", "src", "i18n", "locales");
const files = { tr: "tr.json", en: "en.json", "pt-BR": "pt-BR.json" };

for (const [lang, filename] of Object.entries(files)) {
  const file = path.join(localesDir, filename);
  const data = JSON.parse(fs.readFileSync(file, "utf8"));
  data.notifications = data.notifications || {};
  data.notifications.push = CONTENT[lang];
  fs.writeFileSync(file, JSON.stringify(data, null, 2) + "\n", "utf8");
  console.log("patched", filename);
}
