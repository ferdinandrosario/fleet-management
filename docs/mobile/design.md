# Design (mobile + web admin)

UI libraries, UX principles, the component/screen inventory, design tokens, and
the i18n setup. Mobile is built first (Session 2); the web admin reuses the same
tokens + locales (Session 10).

## UI libraries (justified)

| Concern | Choice | Why |
|---|---|---|
| Styling | **NativeWind v4 + Tailwind** | One styling mental model shared with the web admin; tokens live in `tailwind.config.js`. Tailwind pinned to `3.4.17` (NativeWind v4 caveat). |
| Primitives | **react-native-reusables style, owned** | We hand-shape primitives under `src/components/ui/` (composed, not a runtime component lib) so they're fully ours to extend. |
| Navigation | **React Navigation (native-stack)** | `App.tsx` is the router shell + auth gate; native-stack is the boring, idiomatic fit. |
| Server state | **TanStack Query** | Cache, pagination, lazy fetch — wraps the one shared fetch client. |
| Client state | **Zustand** | One tiny store per concern (auth session, language). No Redux. |
| i18n | **i18next + react-i18next + expo-localization** | 6 locales, device detection, runtime switching. |
| Secure storage | **expo-secure-store** | Tokens in Keychain/Keystore, never AsyncStorage. |

## UX principles

Utilitarian, mobile-first tool for farmers/operators/drivers. Clarity over
decoration. **Large touch targets** (≥48px, the `touch` token), **high contrast**
for bright sunlight, minimal text entry. **Status-driven** UI (green = success,
red = failure). **WCAG-AA.** Every screen renders one of
loading / empty / error / offline / content — never a blank view.

## Design tokens

Source of truth: `mobile/tailwind.config.js` (className styling) mirrored by
`mobile/src/theme/tokens.ts` (programmatic use — StatusBar, navigation theme).

| Token | Value | Use |
|---|---|---|
| `brand` / `brand-light` / `brand-dark` | `#0F6E56` / `#1D9E75` / `#085041` | primary actions, headings |
| `success` / `danger` / `warning` (+ `-bg`) | green / red / amber | status feedback |
| `surface` / `surface-muted` | white / `#f1f5f9` | backgrounds |
| `ink` / `ink-muted` / `ink-inverse` | `#0f172a` / `#475569` / white | text |
| `line` | `#e2e8f0` | borders |
| `rounded-card` | 12px | cards, buttons |
| `min-h-touch` / `min-w-touch` | 48px | touch targets |

## Component inventory (Session 2)

- **Primitives** (`src/components/ui/`): `Button` (primary/danger/ghost),
  `TextField` (labeled input; label doubles as the a11y label).
- **States** (`src/components/states/`): `LoadingState`, `EmptyState`,
  `ErrorState`, `OfflineState`, and the shared `StateMessage`.
- **Composite**: `LanguagePicker` (first-run + settings).

## Screen list

| Screen | Feature folder | State |
|---|---|---|
| Welcome (landing: language + sign in / create account) | `src/features/welcome/` | done |
| Login (business code + phone + password) | `src/features/auth/` | done |
| Register (→ OTP) | `src/features/auth/` | done |
| Otp (verify code → session) | `src/features/auth/` | done |
| Home (authenticated placeholder + logout) | `src/features/home/` | done |

`App.tsx` shows the loading state while the session rehydrates, then swaps the
**auth stack** (Welcome/Login/Register/Otp) for the **app stack** (Home) by auth
status. Auth logic lives in `src/features/auth/` (`auth-client.ts` +
`use-auth.ts` TanStack mutations); the session is held in the secure auth store.
Role-based dashboards arrive from Session 5.

## Internationalization (6 locales)

- **Locales:** English (`en`, base + fallback), Tamil (`ta`), Malayalam (`ml`),
  Telugu (`te`), Marathi (`mr`), Hindi (`hi`). All LTR.
- **Structure:** one file per locale in `src/locales/<lang>.ts`. `en.ts` defines
  the `Translations` type; every other locale is typed `Translations`, so **the
  compiler enforces key parity** (a missing key fails typecheck). Endonyms (each
  language's own name) live once in `src/locales/languageNames.ts`.
- **No hard-coded strings.** Every user-facing string comes from `t("…")`.
- **Detection + switching:** `deviceLanguage()` picks the device locale if
  supported, else `en`. The Zustand `language-store` switches at runtime and
  (Session 3) persists to the user's profile.
- **Backend parity:** the backend localizes its own messages via Rails I18n with
  the same six locales (`docs/security/threat-model.md`, `docs/architecture/overview.md`).
- **Non-English copy is best-effort, PENDING professional review** (deferred paid
  item) — English is authoritative.

### Indic-script fonts

Tamil/Malayalam/Telugu/Devanagari render with the **system fonts** on modern
iOS and Android (which ship full Indic coverage incl. conjuncts). `expo-font`
is installed so we can bundle Noto fonts if glyph gaps appear on older devices.
**On-device glyph/conjunct/line-break verification is a manual check** (flagged
— do before go-live, alongside the translation review).

### How to add a locale

1. `src/locales/xx.ts` exporting `export const xx: Translations = { … }`.
2. Add `xx` to `SUPPORTED_LANGUAGES` and `resources` in `src/lib/i18n.ts`.
3. Add the endonym to `src/locales/languageNames.ts`.
4. Typecheck (`npm run typecheck`) — it fails until every key is present.

## Web admin

The web admin (Session 10) reuses these tokens and the same 6-locale i18next
setup with shadcn/ui + Tremor. See `web-admin/AGENTS.md`.
