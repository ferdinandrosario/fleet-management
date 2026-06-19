import { create } from "zustand";

import i18n, { deviceLanguage, type Language } from "../lib/i18n";

// Global language state. Starts from the device locale; the user's saved
// profile preference takes over once auth lands (Session 3). Persisting the
// choice across launches also arrives with profile sync.
type LanguageState = {
  language: Language;
  setLanguage: (language: Language) => void;
};

export const useLanguageStore = create<LanguageState>((set) => ({
  language: deviceLanguage(),
  setLanguage: (language) => {
    i18n.changeLanguage(language);
    set({ language });
  },
}));
