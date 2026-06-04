/**
 * LanguageContext — uygulama dili yönetimi.
 *
 * Kullanım:
 *   import { useLanguage } from "@/contexts/LanguageContext";
 *   const { currentLocale, changeAppLanguage, supportedLocales } = useLanguage();
 */
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import i18n, {
  changeLocale,
  type AppLocale,
  SUPPORTED_LOCALES,
  DEFAULT_LOCALE,
  resolveLocale,
} from "../i18n/config";

interface LanguageContextValue {
  currentLocale: AppLocale;
  supportedLocales: AppLocale[];
  isChanging: boolean;
  changeAppLanguage: (locale: AppLocale) => Promise<void>;
}

const LanguageContext = createContext<LanguageContextValue>({
  currentLocale: DEFAULT_LOCALE,
  supportedLocales: SUPPORTED_LOCALES,
  isChanging: false,
  changeAppLanguage: async () => {},
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [currentLocale, setCurrentLocale] = useState<AppLocale>(DEFAULT_LOCALE);
  const [isChanging, setIsChanging] = useState(false);

  useEffect(() => {
    const syncFromI18n = (lng: string) => {
      const resolved = SUPPORTED_LOCALES.includes(lng as AppLocale)
        ? (lng as AppLocale)
        : resolveLocale(lng);
      setCurrentLocale(resolved);
    };
    if (i18n.isInitialized) syncFromI18n(i18n.language);
    const onChanged = (lng: string) => syncFromI18n(lng);
    i18n.on("languageChanged", onChanged);
    return () => {
      i18n.off("languageChanged", onChanged);
    };
  }, []);

  const changeAppLanguage = useCallback(async (locale: AppLocale) => {
    if (locale === currentLocale) return;
    setIsChanging(true);
    try {
      await changeLocale(locale);
      setCurrentLocale(locale);
    } finally {
      setIsChanging(false);
    }
  }, [currentLocale]);

  return (
    <LanguageContext.Provider
      value={{ currentLocale, supportedLocales: SUPPORTED_LOCALES, isChanging, changeAppLanguage }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextValue {
  return useContext(LanguageContext);
}
