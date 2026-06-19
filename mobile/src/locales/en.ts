import { languageNames } from "./languageNames";

// English — base and fallback locale, and the authoritative key set. The
// `Translations` type is derived from this object, so every other locale must
// provide exactly these keys (the compiler enforces parity).
export const en = {
  common: {
    appName: "Fleet Management",
    retry: "Retry",
    loading: "Loading…",
    cancel: "Cancel",
  },
  states: {
    loadingTitle: "Loading…",
    emptyTitle: "Nothing here yet",
    errorTitle: "Something went wrong",
    offlineTitle: "You're offline",
    offlineBody: "Check your connection and try again.",
  },
  language: {
    title: "Choose your language",
    ...languageNames,
  },
};

export type Translations = typeof en;
