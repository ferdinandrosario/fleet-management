import type { Translations } from "./en";
import { languageNames } from "./languageNames";

// Malayalam. Best-effort — PENDING professional review. English is the source.
export const ml: Translations = {
  common: {
    appName: "Fleet Management",
    retry: "വീണ്ടും ശ്രമിക്കുക",
    loading: "ലോഡ് ചെയ്യുന്നു…",
    cancel: "റദ്ദാക്കുക",
  },
  states: {
    loadingTitle: "ലോഡ് ചെയ്യുന്നു…",
    emptyTitle: "ഇവിടെ ഇതുവരെ ഒന്നുമില്ല",
    errorTitle: "എന്തോ കുഴപ്പം സംഭവിച്ചു",
    offlineTitle: "നിങ്ങൾ ഓഫ്‌ലൈനാണ്",
    offlineBody: "നിങ്ങളുടെ കണക്ഷൻ പരിശോധിച്ച് വീണ്ടും ശ്രമിക്കുക.",
  },
  language: {
    title: "നിങ്ങളുടെ ഭാഷ തിരഞ്ഞെടുക്കുക",
    ...languageNames,
  },
};
