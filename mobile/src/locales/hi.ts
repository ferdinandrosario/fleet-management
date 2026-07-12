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
  theme: {
    title: "थीम",
    light: "हल्का",
    dark: "गहरा",
    black: "काला",
    system: "सिस्टम",
  },
  welcome: {
    tagline: "वाहन बुक करें, ट्रिप चलाएँ और अपना फ़्लीट संभालें — आपकी भाषा में।",
    bookTitle: "मिनटों में बुकिंग",
    bookBody: "वाहन का अनुरोध करें और तुरंत पुष्टि पाएँ — बिना फ़ोन कॉल के।",
    driveTitle: "हर ट्रिप साफ़-साफ़",
    driveBody: "हर ड्राइवर के लिए ट्रिप, स्थिति और कमाई एक ही जगह।",
    manageTitle: "पूरा फ़्लीट संभालें",
    manageBody: "मालिक वाहन, ड्राइवर और बुकिंग एक नज़र में देखें।",
  },
  auth: {
    signInTitle: "साइन इन करें",
    registerTitle: "खाता बनाएं",
    verifyTitle: "अपना फ़ोन सत्यापित करें",
    businessCode: "व्यवसाय कोड",
    name: "नाम",
    phone: "फ़ोन नंबर",
    password: "पासवर्ड",
    code: "सत्यापन कोड",
    signIn: "साइन इन करें",
    createAccount: "खाता बनाएं",
    verify: "सत्यापित करें",
    logout: "लॉग आउट",
    toRegister: "नए हैं? खाता बनाएं",
    toLogin: "खाता है? साइन इन करें",
    failed: "जारी नहीं रह सका। अपना विवरण जांचें और पुनः प्रयास करें।",
  },
};
