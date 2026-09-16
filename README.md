# Mola Universe — Mobile

MOLA is a shared-household operating system: tasks, expenses, shopping, inventory,
savings, calendar, pets, and personal journaling for 2–7+ people living together.
This repo is the mobile client (Expo / React Native), consuming the
`Mola_Universe_APP` backend as its single source of truth for API contracts and
product rules.

See `PROJECT_ROOT.md` for project identity, boundaries, and workflow.

## Stack

Expo 57, React Native, TypeScript (strict), TanStack Query, Zustand, React Navigation,
RevenueCat, `react-native-mmkv`, `expo-secure-store`, Vitest, Biome. Full details in
`PROJECT_ROOT.md` and `docs/architecture.md`.

## Setup

```bash
npm install
npm start          # expo start
npm run android     # expo start --android
npm run ios         # expo start --ios
npm run web          # expo start --web
```

Copy `.env.example` to `.env` and fill in real values before running against a live
backend.

## Verification

```bash
npm run lint         # Biome check
npm run typecheck    # tsc --noEmit
npm test             # Vitest
npm run verify        # lint + typecheck + test (run before every commit)
```

## Docs

- [`PROJECT_ROOT.md`](./PROJECT_ROOT.md) — project identity, source of truth, boundaries
- [`CONTRIBUTING.md`](./CONTRIBUTING.md) — rules for humans and AI agents
- [`docs/architecture.md`](./docs/architecture.md) — folder structure and layering
- [`docs/api-contracts.md`](./docs/api-contracts.md) — how this repo consumes the backend API
- [`docs/module-template.md`](./docs/module-template.md) — template for a new feature module
- [`design/README.md`](./design/README.md) — design assets

## Status

Governance-only phase — scaffolding and conventions are in place, no feature code yet.
Next step: M0 Setup.
