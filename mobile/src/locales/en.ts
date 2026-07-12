import { languageNames } from "./languageNames";

// English — base and fallback locale, and the authoritative key set. The
// `Translations` type is derived from this object, so every other locale must
// provide exactly these keys (the compiler enforces parity).
export const en = {
  common: {
    appName: "Fleet Management",
    retry: "Retry",
    loading: "Loading…",
    cancel: "Cancel",
  },
  states: {
    loadingTitle: "Loading…",
    emptyTitle: "Nothing here yet",
    errorTitle: "Something went wrong",
    offlineTitle: "You're offline",
    offlineBody: "Check your connection and try again.",
  },
  language: {
    title: "Choose your language",
    ...languageNames,
  },
  theme: {
    title: "Theme",
    light: "Light",
    dark: "Dark",
    black: "Black",
    system: "System",
  },
  welcome: {
    tagline: "Book vehicles, run trips, and manage your fleet — in your language.",
    bookTitle: "Book in minutes",
    bookBody: "Request a vehicle and get confirmed fast — no phone calls.",
    driveTitle: "Drive with clarity",
    driveBody: "Trips, statuses, and earnings in one place for every driver.",
    manageTitle: "Run the whole fleet",
    manageBody: "Owners see vehicles, drivers, and bookings at a glance.",
  },
  auth: {
    signInTitle: "Sign in",
    registerTitle: "Create account",
    verifyTitle: "Verify your phone",
    businessCode: "Business code",
    name: "Name",
    phone: "Phone number",
    password: "Password",
    code: "Verification code",
    signIn: "Sign in",
    createAccount: "Create account",
    verify: "Verify",
    logout: "Log out",
    toRegister: "New here? Create an account",
    toLogin: "Have an account? Sign in",
    failed: "Couldn't continue. Check your details and try again.",
  },
};

export type Translations = typeof en;
