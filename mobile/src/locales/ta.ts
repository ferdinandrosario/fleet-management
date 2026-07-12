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
  theme: {
    title: "தீம்",
    light: "வெளிர்",
    dark: "இருண்ட",
    black: "கருப்பு",
    system: "சிஸ்டம்",
  },
  welcome: {
    tagline: "வாகனங்களை முன்பதிவு செய்யுங்கள், பயணங்களை நடத்துங்கள், உங்கள் வாகனத் தொகுப்பை நிர்வகியுங்கள் — உங்கள் மொழியில்.",
    bookTitle: "நிமிடங்களில் முன்பதிவு",
    bookBody: "வாகனத்தைக் கோருங்கள், விரைவாக உறுதிப்படுத்தல் பெறுங்கள் — தொலைபேசி அழைப்புகள் இல்லாமல்.",
    driveTitle: "தெளிவாக ஓட்டுங்கள்",
    driveBody: "ஒவ்வொரு ஓட்டுநருக்கும் பயணங்கள், நிலைகள், வருமானம் ஒரே இடத்தில்.",
    manageTitle: "முழு தொகுப்பையும் நிர்வகியுங்கள்",
    manageBody: "உரிமையாளர்கள் வாகனங்கள், ஓட்டுநர்கள், முன்பதிவுகளை ஒரே பார்வையில் காண்பார்கள்.",
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
