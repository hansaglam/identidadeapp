/**
 * Play Store screenshot demo yedeği üretir.
 * Uygulama koduna dokunmaz — sadece store/screenshot-demo-backup.json yazar.
 *
 * Kullanım: node store/generate-screenshot-demo-backup.mjs
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
const OUT = join(__dirname, "screenshot-demo-backup.json");

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

function buildMindDumps(startDate) {
  const start = parseISO(startDate);
  const snippets = [
    { dayOffset: 2, text: "Kafam karışık ama başlamak iyi geldi." },
    { dayOffset: 9, text: "Biraz daha düzenli hissediyorum." },
    { dayOffset: 18, text: "Kaçırdığımda suçluluk yerine küçük adım işe yarıyor." },
    { dayOffset: 28, text: "Artık çapa olmadan da aklıma geliyor." },
    { dayOffset: 35, text: "Geri dönmek normalmiş — pes etmeyen biri oluyorum." },
  ];

  return snippets.map((s, idx) => {
    const created = addDays(start, s.dayOffset);
    const ts = created.getTime() + idx;
    return {
      id: String(ts),
      content: s.text,
      createdAt: created.toISOString(),
      updatedAt: created.toISOString(),
    };
  });
}

function main() {
  const today = new Date();
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

  const payload = {
    exportedAt: new Date().toISOString(),
    schemaVersion: 2,
    profile: {
      id: "screenshot-demo-rito",
      createdAt: startIso,
      identityTagId: "moving_person",
      habitName: "Egzersiz",
      habitAnchor: "Kahvemi aldıktan sonra",
      habitWhy: "Daha enerjik ve disiplinli hissetmek istiyorum.",
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
    mindDumps: buildMindDumps(startDate),
    tomorrowPlans: {},
    habitDaily: {
      todayCheckedIn: false,
      lastCheckInDate: yesterdayKey,
      todayCheckIn: null,
    },
    habitDefinition: {
      id: "screenshot-habit-1",
      identity: "Hareket eden biri",
      identityIcon: "🏃",
      identitySlug: "moving-body",
      cue: "Kahvemi aldıktan sonra",
      timeSlot: "morning",
      why: "Daha enerjik ve disiplinli hissetmek istiyorum.",
    },
    habitReflections: [
      {
        day: 12,
        comment: "Bugün zorlandım ama küçük adım yeterli oldu.",
        date: isoDate(addDays(parseISO(startDate), 11)),
      },
      {
        day: 28,
        comment: "Daha kontrollü hissediyorum.",
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

  writeFileSync(OUT, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
  console.log(`Wrote ${OUT}`);
  console.log(`  startDate: ${startDate}  today: ${todayKey}  (~day 40)`);
  console.log(`  snapshots: ${prevWeek} -> ${currentWeek}  (direnc +4)`);
  console.log(`  Restore: Profil > Gelismis > Yedekten geri yukle`);
  console.log(`  Note: isPremium resets to false on restore — see SCREENSHOT_DEMO.md`);
}

main();
