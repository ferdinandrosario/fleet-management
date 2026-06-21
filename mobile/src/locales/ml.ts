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
  auth: {
    signInTitle: "സൈൻ ഇൻ ചെയ്യുക",
    registerTitle: "അക്കൗണ്ട് ഉണ്ടാക്കുക",
    verifyTitle: "നിങ്ങളുടെ ഫോൺ പരിശോധിക്കുക",
    businessCode: "ബിസിനസ് കോഡ്",
    name: "പേര്",
    phone: "ഫോൺ നമ്പർ",
    password: "പാസ്‌വേഡ്",
    code: "പരിശോധനാ കോഡ്",
    signIn: "സൈൻ ഇൻ ചെയ്യുക",
    createAccount: "അക്കൗണ്ട് ഉണ്ടാക്കുക",
    verify: "പരിശോധിക്കുക",
    logout: "ലോഗ് ഔട്ട്",
    toRegister: "പുതിയ ആളാണോ? അക്കൗണ്ട് ഉണ്ടാക്കുക",
    toLogin: "അക്കൗണ്ട് ഉണ്ടോ? സൈൻ ഇൻ ചെയ്യുക",
    failed: "തുടരാനായില്ല. നിങ്ങളുടെ വിവരങ്ങൾ പരിശോധിച്ച് വീണ്ടും ശ്രമിക്കുക.",
  },
};
