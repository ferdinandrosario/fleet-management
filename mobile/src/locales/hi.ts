import type { Translations } from "./en";
import { languageNames } from "./languageNames";

// Hindi (Devanagari). Best-effort — PENDING professional review. English is the
// source of truth and fallback.
export const hi: Translations = {
  common: {
    appName: "Fleet Management",
    retry: "पुनः प्रयास करें",
    loading: "लोड हो रहा है…",
    cancel: "रद्द करें",
  },
  states: {
    loadingTitle: "लोड हो रहा है…",
    emptyTitle: "यहाँ अभी कुछ नहीं है",
    errorTitle: "कुछ गलत हो गया",
    offlineTitle: "आप ऑफ़लाइन हैं",
    offlineBody: "अपना कनेक्शन जाँचें और पुनः प्रयास करें।",
  },
  language: {
    title: "अपनी भाषा चुनें",
    ...languageNames,
  },
};
