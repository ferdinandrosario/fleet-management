import type { Translations } from "./en";
import { languageNames } from "./languageNames";

// Telugu. Best-effort — PENDING professional review. English is the source.
export const te: Translations = {
  common: {
    appName: "Fleet Management",
    retry: "మళ్లీ ప్రయత్నించండి",
    loading: "లోడ్ అవుతోంది…",
    cancel: "రద్దు చేయండి",
  },
  states: {
    loadingTitle: "లోడ్ అవుతోంది…",
    emptyTitle: "ఇక్కడ ఇంకా ఏమీ లేదు",
    errorTitle: "ఏదో తప్పు జరిగింది",
    offlineTitle: "మీరు ఆఫ్‌లైన్‌లో ఉన్నారు",
    offlineBody: "మీ కనెక్షన్‌ను తనిఖీ చేసి మళ్లీ ప్రయత్నించండి.",
  },
  language: {
    title: "మీ భాషను ఎంచుకోండి",
    ...languageNames,
  },
};
