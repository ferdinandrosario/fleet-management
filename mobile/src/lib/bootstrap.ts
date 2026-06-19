import { configureApiClient } from "./api";
import { initI18n } from "./i18n";
import { useAuthStore } from "../stores/auth-store";
import { useLanguageStore } from "../stores/language-store";

// One-time app wiring, called from App.tsx before the first render: initialize
// i18n at the chosen language, and point the shared API client at the auth +
// language stores (so every request carries the current token, tenant, and
// Accept-Language without api.ts importing the stores — avoids a cycle).
export function bootstrap(): void {
  initI18n(useLanguageStore.getState().language);
  configureApiClient({
    getAccessToken: () => useAuthStore.getState().accessToken,
    getTenant: () => useAuthStore.getState().tenant,
    getLanguage: () => useLanguageStore.getState().language,
  });
}
