/**
 * useI18n — React hook for CEPHO internationalisation
 *
 * Provides:
 *   t(key)   — translate a key
 *   lang     — current language code ("en" | "ar")
 *   dir      — text direction ("ltr" | "rtl")
 *   setLang  — change language and persist to localStorage
 *
 * The hook also syncs the <html> element's lang and dir attributes
 * whenever the language changes, enabling native RTL layout support.
 */
import { useState, useCallback, useEffect } from "react";
import {
  type Lang,
  type TranslationKey,
  getStoredLang,
  setStoredLang,
  getLangDir,
  translate,
} from "@/lib/i18n";

export function useI18n() {
  const [lang, setLangState] = useState<Lang>(getStoredLang);

  /** Apply lang + dir to <html> element */
  useEffect(() => {
    const dir = getLangDir(lang);
    document.documentElement.setAttribute("lang", lang);
    document.documentElement.setAttribute("dir", dir);
    // Add/remove RTL class for Tailwind RTL utilities
    if (dir === "rtl") {
      document.documentElement.classList.add("rtl");
    } else {
      document.documentElement.classList.remove("rtl");
    }
  }, [lang]);

  const setLang = useCallback((newLang: Lang) => {
    setStoredLang(newLang);
    setLangState(newLang);
  }, []);

  const t = useCallback(
    (key: TranslationKey): string => translate(lang, key),
    [lang]
  );

  return {
    t,
    lang,
    dir: getLangDir(lang),
    setLang,
    isRTL: lang === "ar",
  };
}
