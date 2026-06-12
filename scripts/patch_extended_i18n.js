const fs = require("fs");
const path = require("path");

const extra = {
  tr: {
    exactAlarm: {
      body:
        'Android 12 ve üzeri cihazlarda sabah/akşam bildirimlerinin doğru saatte gelmesi için "Alarmlar ve hatırlatıcılar" iznine ihtiyaç var. İzin vermezsen yaklaşık hatırlatma kullanılır (uygulama açıkken daha güvenilir).',
    },
    dataLoadBanner: {
      messageFull:
        "{{items}} bu cihazdan yüklenemedi. Yerel özete güvenemediğinden yenilemek iyi olur.",
      joinAnd: " ve ",
    },
    errorBoundary: {
      body:
        "Uygulama beklenmedik şekilde durdu. Tekrar dene; sorun sürerse uygulamayı kapatıp aç.",
    },
    mindDumpReflection: {
      bannerBodyRecovery:
        'Bugün "{{keyword}}" geçiyor; yükünü fark etmen önemli. Küçük bir adım yine ilerlemedir.',
      bannerBodyActivation:
        'Bugün "{{keyword}}" geçiyor; enerji düşük hissi genelde geçicidir — bugünkü adımı küçük tutmak yeter.',
      quote:
        'Gün {{day}}\'de "{{snippet}}" demiştin; o gün kutuyu kapattın. {{habit}} için bugün de en küçük versiyon yeter.',
      defaultHabit: "Bugünkü adımın",
    },
  },
  en: {
    exactAlarm: {
      body:
        'On Android 12+, morning and evening notifications need the "Alarms and reminders" permission to arrive on time. Without it, approximate reminders are used (more reliable when the app is open).',
    },
    dataLoadBanner: {
      messageFull:
        "{{items}} could not load from this device. Reload to trust local summaries again.",
      joinAnd: " and ",
    },
    errorBoundary: {
      body:
        "The app stopped unexpectedly. Try again; if it persists, close and reopen the app.",
    },
    mindDumpReflection: {
      bannerBodyRecovery:
        '"{{keyword}}" shows up today — noticing the load matters. A small step still counts.',
      bannerBodyActivation:
        '"{{keyword}}" shows up today — low energy is usually temporary; keep today\'s step small.',
      quote:
        'On day {{day}} you wrote "{{snippet}}"; you closed the box that day. For {{habit}}, the smallest version is enough today too.',
      defaultHabit: "today's step",
    },
  },
  pt: {
    exactAlarm: {
      body:
        'No Android 12+, notificações matinais e noturnas precisam da permissão "Alarmes e lembretes" para chegar no horário. Sem ela, lembretes aproximados são usados (mais confiáveis com o app aberto).',
    },
    dataLoadBanner: {
      messageFull:
        "{{items}} não carregou deste dispositivo. Recarregue para confiar nos resumos locais.",
      joinAnd: " e ",
    },
    errorBoundary: {
      body:
        "O app parou de forma inesperada. Tente de novo; se persistir, feche e abra o app.",
    },
    mindDumpReflection: {
      bannerBodyRecovery:
        '"{{keyword}}" aparece hoje — notar o peso importa. Um passo pequeno ainda conta.',
      bannerBodyActivation:
        '"{{keyword}}" aparece hoje — baixa energia costuma ser temporária; mantenha o passo de hoje pequeno.',
      quote:
        'No dia {{day}} você escreveu "{{snippet}}"; fechou a caixa naquele dia. Para {{habit}}, a menor versão basta hoje também.',
      defaultHabit: "passo de hoje",
    },
  },
};

for (const [lng, file] of [
  ["tr", "tr.json"],
  ["en", "en.json"],
  ["pt-BR", "pt-BR.json"],
]) {
  const fp = path.join(__dirname, "../src/i18n/locales", file);
  const data = JSON.parse(fs.readFileSync(fp, "utf8"));
  const e = lng === "pt-BR" ? extra.pt : extra[lng];
  Object.assign(data.exactAlarm, e.exactAlarm);
  Object.assign(data.dataLoadBanner, e.dataLoadBanner);
  Object.assign(data.errorBoundary, e.errorBoundary);
  Object.assign(data.mindDumpReflection, e.mindDumpReflection);
  fs.writeFileSync(fp, JSON.stringify(data, null, 2) + "\n");
}
console.log("extended i18n ok");
