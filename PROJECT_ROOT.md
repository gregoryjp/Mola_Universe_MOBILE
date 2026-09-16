# PROJECT_ROOT — Mola_Universe_MOBILE

## What this is

`Mola_Universe_MOBILE` is the mobile client of MOLA Universe: a full restart of the
mobile app, built with Expo (React Native) and TypeScript. It consumes the backend
in `Mola_Universe_APP` over HTTP — it does not own product rules, data models, or API
contracts.

## Source of truth

- **Product, rules, agents, API contracts, data model** → `Mola_Universe_APP`
  (`MOLA_UNIVERSE_PRD_v2.1.md`, `docs/architecture/api-contracts.md`, `src/openapi.ts`).
- **This repo** owns only mobile client code: UI, navigation, local state, and the API
  client layer that calls the backend described above.
- Never invent an endpoint, payload shape, or business rule here. If it isn't in
  `Mola_Universe_APP`, it doesn't exist yet — go verify there first, don't guess.

## Boundaries — what NOT to touch

- `Mola_Universe_APP` (sibling repo) — **read-only reference**. Never write, edit, or
  run mutating commands against it from this repo or its agents.
- `Mola_Universe_PAGE` (sibling repo, if present locally) — **read-only reference**,
  same rule.
- This repo only modifies files under its own root.

## Stack

- Expo 57 + React Native, TypeScript (`strict: true`)
- TanStack Query (server-state / data fetching)
- Zustand (client/UI state only — not a server-data cache)
- React Navigation
- RevenueCat (billing/subscriptions)
- `react-native-mmkv` (fast local storage), `expo-secure-store` (secrets/tokens)
- Vitest + `@testing-library/react-native` (tests)
- Biome (lint + format)
- Package manager: **npm** (this repo has `package-lock.json` — do not introduce
  `pnpm`/`yarn` lockfiles or pnpm-flavored tooling guidance here)

See `docs/architecture.md` for how these fit together.

## How to work

- **Branch**: work happens on feature branches off `main`
  (current: `ai/night-mobile-2026-09-17`). Never push directly to `main`.
- **Commits**: Conventional Commits only (`feat:`, `fix:`, `docs:`, `refactor:`,
  `test:`, `chore:`, …). See `CONTRIBUTING.md`.
- **Verify gate**: before considering any change done, run:
  ```bash
  npm run verify   # lint + typecheck + test
  ```
- **No push to `main`** from an agent session. Pushing and merging are human-owned.

## Current phase

**Governance only.** No business/feature code has been written yet — this repo has
only the Expo blank-typescript scaffold plus the governance/config files listed here
(PROJECT_ROOT.md, README.md, CONTRIBUTING.md, `.claude/AGENTS.md`, `.claude/permissions.json`,
`.gitignore`, `.env.example`, `design/README.md`, `docs/architecture.md`,
`docs/api-contracts.md`, `docs/module-template.md`, `tsconfig.json`, `biome.json`,
`package.json` scripts, the `src/`/`tests/`/`design/`/`docs/`/`scripts/`/`logs/` folder
scaffold, `scripts/verify.sh`).

`npm run verify` is **green** (lint, typecheck, 1 smoke test) as of 2026-09-17.

**Handoff (2026-09-17)**: this phase is closed. Control passes to the next agent
(Deep Copilot / DeepSeek) per `logs/handoff-to-deepseek-2026-09-17.md`. No Claude
Code agent should modify this repo further until re-engaged.

Next step: M0 Setup (see `logs/`).
