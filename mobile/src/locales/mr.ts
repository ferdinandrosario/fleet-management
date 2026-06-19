import type { Translations } from "./en";
import { languageNames } from "./languageNames";

// Marathi (Devanagari). Best-effort — PENDING professional review. English is
// the source of truth and fallback.
export const mr: Translations = {
  common: {
    appName: "Fleet Management",
    retry: "पुन्हा प्रयत्न करा",
    loading: "लोड होत आहे…",
    cancel: "रद्द करा",
  },
  states: {
    loadingTitle: "लोड होत आहे…",
    emptyTitle: "इथे अजून काहीही नाही",
    errorTitle: "काहीतरी चूक झाली",
    offlineTitle: "तुम्ही ऑफलाइन आहात",
    offlineBody: "तुमचे कनेक्शन तपासा आणि पुन्हा प्रयत्न करा.",
  },
  language: {
    title: "तुमची भाषा निवडा",
    ...languageNames,
  },
};
