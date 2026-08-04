import i18n from "i18next";
import { getLocales } from "expo-localization";
import { initReactI18next } from "react-i18next";

import { en } from "../locales/en";

export const SUPPORTED_LANGUAGES = ["en"] as const;
export type Language = (typeof SUPPORTED_LANGUAGES)[number];

export const resources = {
  en: { translation: en },
};

export function isSupported(code: string | null | undefined): code is Language {
  // Widen the readonly tuple to compare against an arbitrary code.
  return (SUPPORTED_LANGUAGES as readonly string[]).includes(code ?? "");
}

// The device's preferred language if we support it, else English.
export function deviceLanguage(): Language {
  const code = getLocales()[0]?.languageCode;
  return isSupported(code) ? code : "en";
}

// Idempotent — safe to call more than once (the singleton initializes once).
export function initI18n(language: Language): typeof i18n {
  if (!i18n.isInitialized) {
    // `i18n.use` is the correct call on the default instance (i18next also has a
    // named `use` export, which the linter flags as ambiguous — it isn't here).
    // eslint-disable-next-line import/no-named-as-default-member
    i18n.use(initReactI18next).init({
      resources,
      lng: language,
      fallbackLng: "en",
      interpolation: { escapeValue: false },
      returnNull: false,
    });
  }
  return i18n;
}

export default i18n;
