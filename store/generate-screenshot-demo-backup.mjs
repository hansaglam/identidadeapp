/**
 * Play Store screenshot demo yedeği üretir.
 * Uygulama koduna dokunmaz — store/screenshot-demo-backup*.json yazar.
 *
 * Kullanım:
 *   node store/generate-screenshot-demo-backup.mjs           # tr (varsayılan)
 *   node store/generate-screenshot-demo-backup.mjs --locale en
 *   node store/generate-screenshot-demo-backup.mjs --locale pt
 *   node store/generate-screenshot-demo-backup.mjs --all     # tr + en + pt
 *
 * habitAnchor = after_morning_drink → dil değişince çapa etiketi i18n'den gelir.
 */
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import {
  addDays,
  differenceInCalendarDays,
  format,
  getISOWeek,
  getISOWeekYear,
  parseISO,
  subDays,
  subWeeks,
} from "date-fns";

const __dirname = dirname(fileURLToPath(import.meta.url));

/** Stable anchor ID — anchors.{id}.label ile tüm dillerde çevrilir */
const ANCHOR_ID = "after_morning_drink";

const LOCALE_COPY = {
  tr: {
    habitName: "Egzersiz",
    habitWhy: "Daha enerjik ve disiplinli hissetmek istiyorum.",
    identity: "Hareket eden biri",
    mindDumps: [
      "Kafam karışık ama başlamak iyi geldi.",
      "Biraz daha düzenli hissediyorum.",
      "Kaçırdığımda suçluluk yerine küçük adım işe yarıyor.",
      "Artık çapa olmadan da aklıma geliyor.",
      "Geri dönmek normalmiş — pes etmeyen biri oluyorum.",
    ],
    reflections: [
      "Bugün zorlandım ama küçük adım yeterli oldu.",
      "Daha kontrollü hissediyorum.",
    ],
    outFile: "screenshot-demo-backup.json",
  },
  en: {
    habitName: "Exercise",
    habitWhy: "I want to feel more energetic and disciplined.",
    identity: "Someone who moves",
    mindDumps: [
      "My head was scattered, but starting felt good.",
      "I'm feeling a bit more consistent.",
      "When I miss a day, a small step beats guilt.",
      "It comes to mind even without the anchor now.",
      "Coming back is normal — I'm becoming someone who doesn't quit.",
    ],
    reflections: [
      "Today was hard, but a small step was enough.",
      "I feel more in control.",
    ],
    outFile: "screenshot-demo-backup-en.json",
  },
  pt: {
    habitName: "Exercício",
    habitWhy: "Quero me sentir com mais energia e disciplina.",
    identity: "Alguém que se move",
    mindDumps: [
      "A cabeça estava confusa, mas começar fez bem.",
      "Estou me sentindo um pouco mais consistente.",
      "Quando falho, um passo pequeno vence a culpa.",
      "Já lembro sem precisar da âncora.",
      "Voltar é normal — estou virando alguém que não desiste.",
    ],
    reflections: [
      "Hoje foi difícil, mas um passo pequeno bastou.",
      "Me sinto mais no controle.",
    ],
    outFile: "screenshot-demo-backup-pt.json",
  },
};

function parseLocales(argv) {
  if (argv.includes("--all")) return ["tr", "en", "pt"];
  const idx = argv.indexOf("--locale");
  if (idx >= 0 && argv[idx + 1]) {
    const loc = argv[idx + 1].toLowerCase();
    if (loc === "pt-br" || loc === "pt_br") return ["pt"];
    if (LOCALE_COPY[loc]) return [loc];
    console.error(`Unknown locale: ${argv[idx + 1]}. Use tr, en, pt, or --all`);
    process.exit(1);
  }
  return ["tr"];
}

function isoWeekKey(d) {
  const week = getISOWeek(d);
  const year = getISOWeekYear(d);
  return `${year}-W${String(week).padStart(2, "0")}`;
}

function isoDate(d) {
  return format(d, "yyyy-MM-dd");
}

function completedAt(dateStr, hour = 9) {
  return `${dateStr}T${String(hour).padStart(2, "0")}:30:00.000Z`;
}

/** 7 düşüş serisi, 6 geri dönüş — dün kaçırılmış, bugün boş (Screenshot 4) */
function buildCheckins(startDate, today) {
  const start = parseISO(startDate);
  const yesterday = subDays(today, 1);
  const totalDays = differenceInCalendarDays(yesterday, start) + 1;
  const records = [];

  for (let i = 0; i < totalDays; i += 1) {
    const d = addDays(start, i);
    const dateKey = isoDate(d);
    const day = i + 1;
    let completed = false;

    if (day <= 7) {
      completed = true;
    } else {
      const offset = day - 8;
      const pos = offset % 5;
      if (pos <= 1) completed = true;
      else if (pos <= 3) completed = false;
      else completed = true;
    }

    if (day >= totalDays - 1) {
      completed = false;
    }
    if (day === totalDays - 2 && totalDays > 8) {
      completed = false;
    }

    records.push({
      date: dateKey,
      completed,
      completedAt: completed ? completedAt(dateKey, 8 + (day % 4)) : null,
      day,
      automaticityRating: completed ? 6 + (day % 3) : undefined,
      effortRating: completed ? 4 + (day % 2) : undefined,
    });
  }

  return records;
}

function buildMindDumps(startDate, texts) {
  const start = parseISO(startDate);
  const offsets = [2, 9, 18, 28, 35];

  return offsets.map((dayOffset, idx) => {
    const created = addDays(start, dayOffset);
    const ts = created.getTime() + idx;
    return {
      id: String(ts),
      content: texts[idx],
      createdAt: created.toISOString(),
      updatedAt: created.toISOString(),
    };
  });
}

function buildPayload(localeKey, today) {
  const copy = LOCALE_COPY[localeKey];
  const todayKey = isoDate(today);
  const yesterdayKey = isoDate(subDays(today, 1));
  const startDate = isoDate(subDays(today, 39));
  const startIso = `${startDate}T08:00:00.000Z`;

  const currentWeek = isoWeekKey(today);
  const prevWeek = isoWeekKey(subWeeks(today, 1));

  const disciplineMuscles = {
    karar: 1,
    direnc: 1,
    baglam: 1,
    energi: 1,
    sosyal: 1,
  };

  const disciplineMuscleXp = {
    karar: 42,
    direnc: 15,
    baglam: 22,
    energi: 12,
    sosyal: 8,
  };

  const currentScores = {
    karar: 42,
    direnc: 15,
    baglam: 22,
    energi: 12,
    sosyal: 8,
  };

  const prevScores = {
    karar: 38,
    direnc: 11,
    baglam: 20,
    energi: 12,
    sosyal: 8,
  };

  return {
    exportedAt: new Date().toISOString(),
    schemaVersion: 2,
    profile: {
      id: `screenshot-demo-rito-${localeKey}`,
      createdAt: startIso,
      identityTagId: "moving_person",
      habitName: copy.habitName,
      habitAnchor: ANCHOR_ID,
      habitWhy: copy.habitWhy,
      startDate: startIso,
      isPremium: true,
      purchaseToken: null,
      name: "Demo",
      notificationHour: 9,
      notificationMinute: 0,
      hapticsEnabled: true,
      premiumGateDay7Shown: true,
      premiumGateDay22Shown: true,
      contextPreset: "home",
      restModeUntilISO: null,
      notifyMorningEnabled: true,
      notifyEveningEnabled: true,
      notifyWeekendEnabled: true,
      notifyPhaseMilestones: true,
      firstWeekGuideDismissed: true,
      hasOpenedJourneyTab: true,
      disciplineMuscles,
      disciplineMuscleXp,
      firstComebackCelebrated: true,
      disciplineMuscleSnapshots: [
        {
          weekKey: prevWeek,
          date: isoDate(subWeeks(today, 1)),
          scores: prevScores,
        },
        {
          weekKey: currentWeek,
          date: todayKey,
          scores: currentScores,
        },
      ],
      disciplineSnapshotsInitialized: true,
      journeySequence: 0,
      completedHabits: [],
      stackingOfferPending: false,
      checkInActionGate: "soft",
    },
    checkins: buildCheckins(startDate, today),
    mindDumps: buildMindDumps(startDate, copy.mindDumps),
    tomorrowPlans: {},
    habitDaily: {
      todayCheckedIn: false,
      lastCheckInDate: yesterdayKey,
      todayCheckIn: null,
    },
    habitDefinition: {
      id: "screenshot-habit-1",
      identity: copy.identity,
      identityIcon: "🏃",
      identitySlug: "moving-body",
      cue: ANCHOR_ID,
      timeSlot: "morning",
      why: copy.habitWhy,
    },
    habitReflections: [
      {
        day: 12,
        comment: copy.reflections[0],
        date: isoDate(addDays(parseISO(startDate), 11)),
      },
      {
        day: 28,
        comment: copy.reflections[1],
        date: isoDate(addDays(parseISO(startDate), 27)),
      },
    ],
    sdtScores: [
      {
        week: prevWeek,
        autonomy: 4,
        competence: 3,
        relatedness: 3,
        answeredAt: subWeeks(today, 1).toISOString(),
      },
      {
        week: currentWeek,
        autonomy: 4,
        competence: 4,
        relatedness: 3,
        answeredAt: today.toISOString(),
      },
    ],
    behaviorState: {
      muscles: {
        activation: 12,
        consistency: 10,
        resistance: 8,
        focus: 6,
        recovery: 5,
      },
      recentActions: [],
      lastActionAt: completedAt(yesterdayKey, 10),
      totalActions: 24,
    },
  };
}

function main() {
  const locales = parseLocales(process.argv.slice(2));
  const today = new Date();
  const todayKey = isoDate(today);
  const startDate = isoDate(subDays(today, 39));
  const prevWeek = isoWeekKey(subWeeks(today, 1));
  const currentWeek = isoWeekKey(today);

  for (const localeKey of locales) {
    const copy = LOCALE_COPY[localeKey];
    const outPath = join(__dirname, copy.outFile);
    const payload = buildPayload(localeKey, today);
    writeFileSync(outPath, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
    console.log(`Wrote ${outPath} (${localeKey})`);
  }

  console.log(`  startDate: ${startDate}  today: ${todayKey}  (~day 40)`);
  console.log(`  snapshots: ${prevWeek} -> ${currentWeek}  (direnc +4)`);
  console.log(`  anchor: ${ANCHOR_ID} (localizes with app language)`);
  console.log(`  Restore: Profil > VERI > JSON dosyasindan geri yukle`);
  console.log(`  EN/PT: restore matching file, then set app language`);
}

main();
