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
  auth: {
    signInTitle: "உள்நுழைக",
    registerTitle: "கணக்கை உருவாக்கு",
    verifyTitle: "உங்கள் தொலைபேசியைச் சரிபார்க்கவும்",
    businessCode: "வணிகக் குறியீடு",
    name: "பெயர்",
    phone: "தொலைபேசி எண்",
    password: "கடவுச்சொல்",
    code: "சரிபார்ப்புக் குறியீடு",
    signIn: "உள்நுழைக",
    createAccount: "கணக்கை உருவாக்கு",
    verify: "சரிபார்",
    logout: "வெளியேறு",
    toRegister: "புதியவரா? கணக்கை உருவாக்குங்கள்",
    toLogin: "கணக்கு உள்ளதா? உள்நுழைக",
    failed: "தொடர முடியவில்லை. உங்கள் விவரங்களைச் சரிபார்த்து மீண்டும் முயற்சிக்கவும்.",
  },
};
