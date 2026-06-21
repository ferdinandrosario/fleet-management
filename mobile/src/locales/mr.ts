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
  auth: {
    signInTitle: "साइन इन करा",
    registerTitle: "खाते तयार करा",
    verifyTitle: "तुमचा फोन सत्यापित करा",
    businessCode: "व्यवसाय कोड",
    name: "नाव",
    phone: "फोन नंबर",
    password: "पासवर्ड",
    code: "सत्यापन कोड",
    signIn: "साइन इन करा",
    createAccount: "खाते तयार करा",
    verify: "सत्यापित करा",
    logout: "लॉग आउट",
    toRegister: "नवीन आहात? खाते तयार करा",
    toLogin: "खाते आहे? साइन इन करा",
    failed: "पुढे जाता आले नाही. तुमचे तपशील तपासा आणि पुन्हा प्रयत्न करा.",
  },
};
