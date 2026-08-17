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
| i18n | **i18next + react-i18next + expo-localization** | English locale, device detection. |
| Secure storage | **expo-secure-store** | Tokens in Keychain/Keystore, never AsyncStorage. |

## UX principles

Utilitarian, mobile-first tool for farmers/operators/drivers. Clarity over
decoration. **Large touch targets** (≥48px, the `touch` token), **high contrast**
for bright sunlight, minimal text entry. **Status-driven** UI (green = success,
red = failure). **WCAG-AA.** Every screen renders one of
loading / empty / error / offline / content — never a blank view.

## Design tokens

Source of truth: HSL variables in `mobile/global.css` (light `:root`, dark
`.dark:root`), expanded by `mobile/tailwind.config.js` (className styling)
and mirrored as hexes by `mobile/src/theme/tokens.ts` (`palettes.light` /
`palettes.dark` + `palette(scheme)` — programmatic use: StatusBar,
navigation theme, spinners). Keep the three in sync.

| Token | Light | Dark | Use |
|---|---|---|---|
| `brand` / `brand-light` / `brand-dark` | `#0F6E56` / `#1D9E75` / `#085041` | `#1D9E75` / `#3EBD94` / `#0F6E56` | primary actions, headings |
| `success` / `danger` / `warning` (+ `-bg`) | green / red / amber 600s, pale tints | 500s (brighter), deep tints | status feedback |
| `surface` / `surface-muted` | white / `#f1f5f9` | `#0f172a` / `#1e293b` | backgrounds |
| `ink` / `ink-muted` / `ink-inverse` | `#0f172a` / `#475569` / white | `#f8fafc` / `#94a3b8` / white | text |
| `line` | `#e2e8f0` | `#334155` | borders |
| `rounded-card` | 12px | — | cards, buttons |
| `min-h-touch` / `min-w-touch` | 48px | — | touch targets |

### Theme modes (product decision 2026-07-12)

The default stays the sunlight-first light palette; **Dark** and **AMOLED
Black** are opt-in via `ThemeToggle` (`src/components/theme-toggle.tsx`,
mounted on Welcome and Home), cycling **Light → Dark → Black → System**.
State lives in `src/stores/theme-store.ts` (Zustand + AsyncStorage under
`fm.theme`; `system` clears the key and follows the OS). Black is a
variant of dark, not a third palette: NativeWind's scheme only knows
light/dark, so black rides the dark scheme and `App.tsx` re-anchors
`--surface` to true black (`#000`, unlit pixels on OLED panels) by
putting `blackThemeVars` on the root View; cards keep their dark values
and float above the canvas. Non-className surfaces (navigation
background, StatusBar style, spinner color) read the applied scheme
reactively via NativeWind's `useColorScheme()` hook, so an OS
light↔dark flip under `system` re-renders them with every className.

## Component inventory (Session 2)

- **Primitives** (`src/components/ui/`): `Button` (primary/danger/ghost),
  `TextField` (labeled input; label doubles as the a11y label).
- **States** (`src/components/states/`): `LoadingState`, `EmptyState`,
  `ErrorState`, `OfflineState`, and the shared `StateMessage`.
- **Composite**: `LanguagePicker` (first-run + settings).

## Screen list

| Screen | Feature folder | State |
|---|---|---|
| Welcome (landing: brand + tagline, one value-prop card per role — book / drive / manage, language + sign in / create account; copy under the `welcome.*` locale keys) | `src/features/welcome/` | done |
| Login (business code + phone + password) | `src/features/auth/` | done |
| Register (→ OTP) | `src/features/auth/` | done |
| Otp (verify code → session) | `src/features/auth/` | done |
| Home (authenticated placeholder + logout) | `src/features/home/` | done |

## Navigation & Auth shell

The app boot sequence (`App.tsx`) initializes i18n and the API client,
restores the secure session, and conditionally mounts either the
**auth stack** (Welcome/Login/Register/Otp) for the **app stack** (Home) by auth
status. Auth logic lives in `src/features/auth/` (`auth-client.ts` +
`use-auth.ts` TanStack mutations); the session is held in the secure auth store.
Role-based dashboards arrive from Session 5.

## Internationalization (English)

- **Locales:** English (`en`, base + fallback).
- **Structure:** `src/locales/en.ts` defines the `Translations` type. Endonyms live in `src/locales/languageNames.ts`.
- **No hard-coded strings.** Every user-facing string comes from `t("…")`.
- **Detection + switching:** `deviceLanguage()` picks `en`. The Zustand `language-store` manages language state.
- **Backend parity:** the backend localizes its own messages via Rails I18n with English locale (`docs/architecture/overview.md`).

### How to add a locale

1. `src/locales/xx.ts` exporting `export const xx: Translations = { … }`.
2. Add `xx` to `SUPPORTED_LANGUAGES` and `resources` in `src/lib/i18n.ts`.
3. Add the endonym to `src/locales/languageNames.ts`.
4. Typecheck (`npm run typecheck`) — it fails until every key is present.

## Web admin

The web admin (Session 10) reuses these tokens and the English i18next
setup with shadcn/ui + Tremor. See `web/AGENTS.md`.
