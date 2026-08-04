# Mobile setup

From a fresh clone to the running Expo app + green test suite. All commands run
from `mobile/`. Node is pinned to 26.5.1 (root `.mise.toml`); see
[`getting-started/prerequisites.md`](../getting-started/prerequisites.md).

## 1. Install dependencies

```bash
cd mobile
npm install
# => added N packages, and audited N packages
```

## 2. Configure the API base URL

The app reads `EXPO_PUBLIC_API_BASE_URL` (only `EXPO_PUBLIC_*` vars reach the
bundle). Default is `http://localhost:3000`. `localhost` inside a simulator
means the simulated device, so set it per target:

| Target | API base |
|---|---|
| iOS Simulator | `http://localhost:3000` |
| Android emulator | `http://10.0.2.2:3000` |
| Physical device (same Wi-Fi) | `http://<LAN_IP>:3000`, and run Rails with `bin/rails s -b 0.0.0.0` |

Put overrides in `mobile/.env` (e.g. `EXPO_PUBLIC_API_BASE_URL=http://10.0.2.2:3000`)
and restart Metro with `--clear`.

## 3. Run the app

```bash
npx expo start
# => Metro waiting on exp://… ; press i (iOS) · a (Android) · w (web)
```

The app opens on the **Welcome** screen (brand + tagline, three persona
value-prop cards, language picker, sign in / create account) when signed
out, or **Home** when a session is restored from secure storage.

## 4. Quality gates (what CI runs)

```bash
npm run typecheck
# => (no output — clean)

npm run lint
# => (no output — clean)

npm test
# => Test Suites: 22 passed, 22 total
# => Tests:       78 passed, 78 total   (run against ios + android presets)

npm run test:coverage
# => All files | 100 | 95 | 100 | 100   (lines | branches | functions | statements)
```

## What's wired (Session 2 foundation)

- **NativeWind v4** styling + design tokens (`tailwind.config.js`,
  `src/theme/tokens.ts`) — see [design.md](design.md).
- **i18n** — English locale (en), device detection, language picker.
- **Typed API client** (`src/lib/api.ts`) — one fetch transport, standard
  envelope, auth + `X-Tenant` + `Accept-Language` headers, wired to the stores
  by `src/lib/bootstrap.ts`.
- **Secure session** (`src/stores/auth-store.ts`) — tokens in
  Keychain/Keystore via expo-secure-store, never AsyncStorage.
- **TanStack Query** provider + **React Navigation** auth gate in `App.tsx`.
- **Jest + RTL** harness across ios + android presets, 100%/95% coverage pins.

## Testing notes

- `render` from `@testing-library/react-native` is **async** (React 19) — always
  `await render(...)`.
- Native modules are mocked in `jest.setup.ts` (expo-secure-store in-memory,
  expo-localization → en). Set `EXPO_PUBLIC_*` env there (read at module load).
- Screens using `SafeAreaView` render via `renderWithProviders`
  (`src/test/test-utils.tsx`).
