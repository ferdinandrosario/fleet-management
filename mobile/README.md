# Mobile — Fleet Management app

Expo (SDK 56) / React Native app in TypeScript for customers, drivers, and
owners. Talks to the [backend API](../backend/) over the shared JSON envelope.

**This file is a pointer — the real guides live in [`../docs/`](../docs/):**

- Install tools: [`docs/01-prerequisites.md`](../docs/01-prerequisites.md)
- Empty clone → running app (with expected output):
  [`docs/03-mobile-setup.md`](../docs/03-mobile-setup.md)
- Run it against the backend (daily workflow):
  [`docs/04-running-locally.md`](../docs/04-running-locally.md)
- UI, design tokens, i18n, component/screen inventory:
  [`docs/design.md`](../docs/design.md)
- Rules for changing this code: [`AGENTS.md`](AGENTS.md)

## Quickstart

```bash
npm install
npx expo start        # Metro on :8081 — press i (iOS) · a (Android) · w (web)
```

Set `EXPO_PUBLIC_API_BASE_URL` to your running backend (it differs by
simulator/emulator/device — see
[`docs/04-running-locally.md`](../docs/04-running-locally.md)).

## Quality gates

```bash
npm run typecheck     # tsc --noEmit
npm run lint          # eslint (Expo config)
npm test              # Jest + RTL across ios + android presets
npm run test:coverage # with the coverage gate
```
