/**
 * date-fns locale helper — uygulama diline göre doğru locale döner.
 *
 * Kullanım:
 *   import { getDateFnsLocale } from "@/utils/dateFnsLocale";
 *   format(date, "d MMMM yyyy", { locale: getDateFnsLocale() })
 */
import { tr } from "date-fns/locale/tr";
import { enUS } from "date-fns/locale/en-US";
import { ptBR } from "date-fns/locale/pt-BR";
import type { Locale } from "date-fns";
import i18n from "../i18n/config";
import type { AppLocale } from "../i18n/config";

const LOCALE_MAP: Record<AppLocale, Locale> = {
  tr: tr,
  en: enUS,
  "pt-BR": ptBR,
};

/**
 * Mevcut i18n diline göre date-fns locale nesnesi döner.
 * Varsayılan: tr
 */
export function getDateFnsLocale(): Locale {
  const lang = (i18n.language ?? "tr") as AppLocale;
  return LOCALE_MAP[lang] ?? tr;
}
