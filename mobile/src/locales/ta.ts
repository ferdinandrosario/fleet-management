import type { Translations } from "./en";
import { languageNames } from "./languageNames";

// Tamil. Best-effort — PENDING professional review. English is the source.
export const ta: Translations = {
  common: {
    appName: "Fleet Management",
    retry: "மீண்டும் முயற்சிக்கவும்",
    loading: "ஏற்றுகிறது…",
    cancel: "ரத்துசெய்",
  },
  states: {
    loadingTitle: "ஏற்றுகிறது…",
    emptyTitle: "இங்கே இன்னும் எதுவும் இல்லை",
    errorTitle: "ஏதோ தவறு நடந்தது",
    offlineTitle: "நீங்கள் ஆஃப்லைனில் உள்ளீர்கள்",
    offlineBody: "உங்கள் இணைப்பைச் சரிபார்த்து மீண்டும் முயற்சிக்கவும்.",
  },
  language: {
    title: "உங்கள் மொழியைத் தேர்ந்தெடுக்கவும்",
    ...languageNames,
  },
};
