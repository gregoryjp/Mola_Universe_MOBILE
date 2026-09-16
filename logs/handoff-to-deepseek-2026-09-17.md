# Handoff: Claude → Deep Copilot (DeepSeek) — 2026-09-17

## Context

Governance/scaffolding phase for `Mola_Universe_MOBILE`, executed on branch
`ai/night-mobile-2026-09-17`. No business/feature code was written — this was
config and documentation only, per explicit scope restriction.

## Files created

- `PROJECT_ROOT.md` — identity, stack, source of truth, boundaries, how to work
- `README.md` — overview, stack, dev setup, test instructions, links
- `CONTRIBUTING.md` — human + AI agent rules, Conventional Commits, mandatory tests
- `.claude/AGENTS.md` — agents, hard rules, prohibitions
- `.claude/permissions.json` — allowed/denied repos, paths, operations
- `.env.example` — `API_URL`, `API_TIMEOUT_MS`, `REVENUECAT_API_KEY_IOS`/`_ANDROID`
  (placeholder names — no real RevenueCat key names found in the backend repo,
  confirm before wiring billing)
- `design/README.md` — purpose and structure of `design/`
- `docs/architecture.md` — folder structure, Clean Architecture shell +
  vertical-slice-per-feature pattern, backend connection model
- `docs/api-contracts.md` — points to `Mola_Universe_APP/docs/architecture/api-contracts.md`
  and `src/openapi.ts`; hard rule against inventing endpoints
- `docs/module-template.md` — mobile feature module template, adapted from the
  backend's `docs/modules/_TEMPLATE.md`
- `biome.json` — 2-space indent, single quotes, 100 cols, `noExplicitAny: error`,
  `package.json`/`tsconfig*.json` excluded from Biome
- `vitest.config.mts` — minimal Vitest config (`.mts` to avoid an ESM/CJS warning
  given this repo's CJS-default `package.json`)
- `scripts/verify.sh` — executable, mirrors `npm run verify`
- `tests/unit/smoke.test.ts` — single trivial test so `vitest run` has something to
  run in this code-free governance phase
- `.gitkeep` in every otherwise-empty scaffolded directory
  (`src/core|domain|data|presentation|shared`, `tests/integration`, `tests/e2e`,
  `design/logos|screens|colors|typography|icons|components`, `docs/`, `scripts/`, `logs/`)

## Files modified

- `.gitignore` — merged with existing content (node_modules, .expo, .env, .env.local,
  dist, build, coverage, *.log)
- `tsconfig.json` — `strict`, `noImplicitAny`, `noUnusedLocals`, `noUnusedParameters`,
  path aliases (`@/*`, `@core/*`, `@domain/*`, `@data/*`, `@presentation/*`,
  `@shared/*`) — no `baseUrl` (deprecated under installed TypeScript ~6.0.3; would
  break bare-path resolution)
- `package.json` — added `lint`, `lint:fix`, `format`, `typecheck`, `test`,
  `test:watch`, `test:coverage`, `verify` scripts; added devDependencies
  `@biomejs/biome`, `vitest`, `@testing-library/react-native`, `react-test-renderer`
  (pinned to `19.2.3` to match installed `react@19.2.3`, not npm-latest `19.3.0`,
  which requires `react@^19.3.0`) — all exact-pinned, resolved via `npm view` at
  write time
- `package-lock.json` — updated by `npm install` (104 packages added, no peer
  conflicts)

## `npm run verify` status

**GREEN** (verified independently, not just from subagent report):
- `lint`: 0 issues (`biome check --no-errors-on-unmatched src/` — `--no-errors-on-unmatched`
  used because `src/` only has placeholder scaffolding right now; the literal spec'd
  command would exit non-zero on an empty tree)
- `typecheck`: clean
- `test`: 1/1 passing

## What's missing for M0

- No runtime dependencies installed yet: TanStack Query, Zustand, React Navigation,
  RevenueCat SDK, `react-native-mmkv`, `expo-secure-store`. Deliberately out of scope
  for this governance-only phase (installing the full runtime stack now would be
  feature-code prep). Versions must be resolved fresh via `npm view` at M0 time, not
  reused from memory.
- `src/core|domain|data|presentation|shared` are empty (just `.gitkeep`) — no actual
  module code yet.
- RevenueCat env var names in `.env.example` are placeholders — confirm real key
  names before wiring billing.
- `npm audit` reports 10 moderate advisories inherited from the Expo blank-typescript
  scaffold's dependency tree (pre-existing, not introduced by this work) — flagged for
  a future explicitly-scoped task, not addressed here.

## Next exact step

M0 Setup: scaffold the first feature module under `src/domain/<feature>/`,
`src/data/<feature>/`, `src/presentation/<feature>/` following
`docs/module-template.md`, and install the runtime dependencies listed above with
freshly-resolved exact versions.

## Warnings for the next agent

- Do not touch `Mola_Universe_APP` or `Mola_Universe_PAGE` — read-only reference only.
- Do not invent API endpoints or payload shapes — verify against
  `Mola_Universe_APP/src/openapi.ts` first.
- Do not push to `main` — this branch only (`ai/night-mobile-2026-09-17`).
- `.atl/` and `.deep-copilot/` in this repo root are local agent-tooling artifacts
  (skill-registry cache, Deep Copilot logs dir) — not project governance files, left
  untracked/ignored, not part of this handoff's commit.
