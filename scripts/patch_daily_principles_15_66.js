/**
 * Merges dailyPrinciples days 15–66 into tr/en/pt-BR locales
 * and updates src/data/dailyPrinciples.ts (TR as source of truth).
 */
const fs = require("fs");
const path = require("path");
const CONTENT = require("./dailyPrinciples_15_66_content");

const ROOT = path.join(__dirname, "..");
const LOCALES_DIR = path.join(ROOT, "src", "i18n", "locales");
const TS_PATH = path.join(ROOT, "src", "data", "dailyPrinciples.ts");

const LANG_FILES = {
  tr: "tr.json",
  en: "en.json",
  "pt-BR": "pt-BR.json",
};

const DAY_MIN = 15;
const DAY_MAX = 66;

function escapeTs(str) {
  return str.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

function patchLocales() {
  for (const [lang, filename] of Object.entries(LANG_FILES)) {
    const file = path.join(LOCALES_DIR, filename);
    const data = JSON.parse(fs.readFileSync(file, "utf8"));
    const pack = CONTENT[lang];
    const dp = data.dailyPrinciples || (data.dailyPrinciples = {});

    for (let day = DAY_MIN; day <= DAY_MAX; day++) {
      const key = String(day);
      const fields = pack[key];
      if (!fields) {
        console.warn("missing", lang, "day", key);
        continue;
      }
      dp[key] = { ...dp[key], ...fields };
    }

    fs.writeFileSync(file, JSON.stringify(data, null, 2) + "\n", "utf8");
    console.log("patched locale", filename);
  }
}

function patchTs() {
  const tr = CONTENT.tr;
  let text = fs.readFileSync(TS_PATH, "utf8");

  for (let day = DAY_MIN; day <= DAY_MAX; day++) {
    const key = String(day);
    const { principle, science, action } = tr[key];
    const ep = escapeTs(principle);
    const es = escapeTs(science);
    const ea = escapeTs(action);

    const str = '(?:[^"\\\\]|\\\\.)*';
    const regex = new RegExp(
      `(day:\\s*${day},\\s*phase:\\s*\\d+,\\s*\\n\\s*)principle:\\s*"${str}",\\s*\\n\\s*science:\\s*"${str}",\\s*\\n\\s*action:\\s*"${str}"`,
      "m"
    );

    const replacement = `$1principle: "${ep}",\n    science: "${es}",\n    action: "${ea}"`;
    const next = text.replace(regex, replacement);
    if (next === text) {
      console.warn("TS: no match for day", day);
    } else {
      text = next;
    }
  }

  fs.writeFileSync(TS_PATH, text, "utf8");
  console.log("patched", path.relative(ROOT, TS_PATH));
}

patchLocales();
patchTs();
console.log("done: days", DAY_MIN, "–", DAY_MAX);
