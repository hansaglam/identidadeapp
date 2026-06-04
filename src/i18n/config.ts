/**
 * i18n yapılandırması — i18next + react-i18next
 *
 * Desteklenen diller : tr (varsayılan/fallback), en, pt-BR
 * Cihaz dili         : expo-localization ile ilk açılışta okunur
 * Kalıcı tercih      : AsyncStorage → "app:locale"
 *
 * Kullanım:
 *   import i18n from "@/i18n/config";          // init için
 *   import { useTranslation } from "react-i18next";
 *   const { t } = useTranslation();
 *   t("common.continue")
 */
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Localization from "expo-localization";

import tr from "./locales/tr.json";
import en from "./locales/en.json";
import ptBR from "./locales/pt-BR.json";

export type AppLocale = "tr" | "en" | "pt-BR";
export const SUPPORTED_LOCALES: AppLocale[] = ["tr", "en", "pt-BR"];
export const DEFAULT_LOCALE: AppLocale = "tr";
export const LOCALE_STORAGE_KEY = "app:locale";

/**
 * Cihaz dili → desteklenen locale eşlemesi.
 * Örn: "en-US" veya "en-GB" → "en"; "pt-BR" → "pt-BR"
 */
export function resolveLocale(raw: string): AppLocale {
  const lower = raw.toLowerCase();
  if (lower.startsWith("pt-br") || lower === "pt_br") return "pt-BR";
  if (lower.startsWith("pt")) return "pt-BR"; // genel PT → pt-BR
  if (lower.startsWith("tr")) return "tr";
  if (lower.startsWith("en")) return "en";
  return DEFAULT_LOCALE;
}

/** AsyncStorage'dan kayıtlı dili oku; yoksa cihaz dilinden çöz */
export async function getInitialLocale(): Promise<AppLocale> {
  try {
    const saved = await AsyncStorage.getItem(LOCALE_STORAGE_KEY);
    if (saved && SUPPORTED_LOCALES.includes(saved as AppLocale)) {
      return saved as AppLocale;
    }
  } catch {
    /* ignore */
  }
  const deviceLocale = Localization.getLocales()[0]?.languageTag ?? DEFAULT_LOCALE;
  return resolveLocale(deviceLocale);
}

/** Dil değiştir + AsyncStorage'a kaydet */
export async function changeLocale(locale: AppLocale): Promise<void> {
  await i18n.changeLanguage(locale);
  try {
    await AsyncStorage.setItem(LOCALE_STORAGE_KEY, locale);
  } catch {
    /* ignore */
  }
}

const RESOURCE_BUNDLES: Record<string, typeof tr> = {
  tr,
  en,
  "pt-BR": ptBR,
  pt: ptBR,
};

/** Metro HMR / eski native bundle sonrası JSON güncellemelerini yükle */
export function reloadI18nResources(): void {
  for (const [lng, bundle] of Object.entries(RESOURCE_BUNDLES)) {
    i18n.addResourceBundle(lng, "translation", bundle, true, true);
  }
}

/** i18n init (App.tsx'te bir kez await'le) */
export async function initI18n(): Promise<void> {
  const lng = await getInitialLocale();

  if (i18n.isInitialized) {
    reloadI18nResources();
    if (i18n.language !== lng) await i18n.changeLanguage(lng);
    return;
  }

  await i18n.use(initReactI18next).init({
    resources: {
      tr: { translation: tr },
      en: { translation: en },
      "pt-BR": { translation: ptBR },
      pt: { translation: ptBR },
    },
    lng,
    fallbackLng: DEFAULT_LOCALE,
    supportedLngs: ["tr", "en", "pt-BR", "pt"],
    nonExplicitSupportedLngs: true,
    interpolation: {
      escapeValue: false,
    },
    compatibilityJSON: "v4",
    returnNull: false,
  });
}

export default i18n;
