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
  welcome: {
    tagline: "వాహనాలను బుక్ చేయండి, ట్రిప్పులు నడపండి, మీ ఫ్లీట్‌ను నిర్వహించండి — మీ భాషలో.",
    bookTitle: "నిమిషాల్లో బుకింగ్",
    bookBody: "వాహనాన్ని అభ్యర్థించండి, వెంటనే నిర్ధారణ పొందండి — ఫోన్ కాల్స్ లేకుండా.",
    driveTitle: "స్పష్టతతో నడపండి",
    driveBody: "ప్రతి డ్రైవర్‌కు ట్రిప్పులు, స్థితులు, సంపాదన ఒకే చోట.",
    manageTitle: "మొత్తం ఫ్లీట్ నడపండి",
    manageBody: "యజమానులు వాహనాలు, డ్రైవర్లు, బుకింగ్‌లను ఒక్క చూపులో చూస్తారు.",
  },
  auth: {
    signInTitle: "సైన్ ఇన్ చేయండి",
    registerTitle: "ఖాతా సృష్టించండి",
    verifyTitle: "మీ ఫోన్‌ను ధృవీకరించండి",
    businessCode: "వ్యాపార కోడ్",
    name: "పేరు",
    phone: "ఫోన్ నంబర్",
    password: "పాస్‌వర్డ్",
    code: "ధృవీకరణ కోడ్",
    signIn: "సైన్ ఇన్ చేయండి",
    createAccount: "ఖాతా సృష్టించండి",
    verify: "ధృవీకరించండి",
    logout: "లాగ్ అవుట్",
    toRegister: "కొత్తవారా? ఖాతా సృష్టించండి",
    toLogin: "ఖాతా ఉందా? సైన్ ఇన్ చేయండి",
    failed: "కొనసాగలేకపోయింది. మీ వివరాలను తనిఖీ చేసి మళ్లీ ప్రయత్నించండి.",
  },
};
