# Gobernanza Mobile — 2026-09-17

Scaffolding pass on `Mola_Universe_MOBILE`, branch `ai/night-mobile-2026-09-17`.
Governance/configuration only — no business/feature code written.

## Files created / modified

**Created:**
- `PROJECT_ROOT.md`, `README.md`, `CONTRIBUTING.md`
- `.claude/AGENTS.md`, `.claude/permissions.json`
- `.env.example`
- `design/README.md`
- `docs/architecture.md`, `docs/api-contracts.md`, `docs/module-template.md`
- `biome.json`, `vitest.config.mts`
- `scripts/verify.sh` (executable)
- `tests/unit/smoke.test.ts`
- `.gitkeep` in `src/{core,domain,data,presentation,shared}`,
  `tests/{integration,e2e}`, `design/{logos,screens,colors,typography,icons,components}`

**Modified:**
- `.gitignore` (merged: added `.env`, `build/`, `coverage/`, `*.log`; existing entries
  preserved, no duplicates)
- `tsconfig.json` (added `noImplicitAny`, `noUnusedLocals`, `noUnusedParameters`, and
  `@/*`, `@core/*`, `@domain/*`, `@data/*`, `@presentation/*`, `@shared/*` path
  aliases; kept `expo/tsconfig.base` extension)
- `package.json` (added `lint`, `lint:fix`, `format`, `typecheck`, `test`,
  `test:watch`, `test:coverage`, `verify` scripts; added devDependencies below;
  existing scripts/deps untouched)

## Configuration summary (16 deliverables)

1. **PROJECT_ROOT.md** — identity, stack, source of truth (`Mola_Universe_APP`),
   sibling-repo boundaries, branch/commit/verify workflow.
2. **README.md** — overview, setup (`npm install`, `expo start`), test commands,
   doc links.
3. **CONTRIBUTING.md** — Conventional Commits, mandatory tests, `npm run verify` gate,
   rules for humans and agents.
4. **.claude/AGENTS.md** — governance-only phase, hard prohibitions (no sibling-repo
   writes, no invented endpoints, no push to `main`).
5. **.claude/permissions.json** — exact shape requested, valid JSON.
6. **.gitignore** — merged, no duplication.
7. **.env.example** — `API_URL`, `API_TIMEOUT_MS`, `REVENUECAT_API_KEY_IOS/ANDROID`
   (no existing RevenueCat key names found in `Mola_Universe_APP`; used clearly-named
   placeholders per instructions).
8. **design/README.md** — folder purpose/structure, "reference not duplicate" rule.
9. **docs/architecture.md** — Clean-Architecture shell (`core/domain/data/
   presentation/shared`) with vertical slice per feature inside each layer;
   dependency direction; backend connection via API client layer.
10. **docs/api-contracts.md** — points to `Mola_Universe_APP/src/openapi.ts` as
    authoritative source; explicit no-invented-endpoints rule.
11. **docs/module-template.md** — adapted from backend's 22-section
    `_TEMPLATE.md` to the mobile domain/data/presentation slice layout.
12. **tsconfig.json** — strict flags added, path aliases added (no `baseUrl`; this
    TypeScript version requires `paths` to be `./`-relative without it — a real,
    verified constraint, not a design choice).
13. **biome.json** — 2-space, single quotes, 100 cols, `noExplicitAny: error`;
    `package.json`/`tsconfig*.json` excluded from formatting/linting via
    `files.includes` negation globs (Biome 2.x schema).
14. **package.json** — scripts added as specified; devDependencies added with
    real resolved versions (`@biomejs/biome@2.5.14`, `vitest@5.0.1`,
    `@testing-library/react-native@14.0.1`, `@vitest/coverage-v8@5.0.1`,
    `jsdom@30.0.1`, `react-test-renderer@19.2.3` — pinned to match the installed
    `react@19.2.3` exactly, since the npm-latest `react-test-renderer@19.3.0`
    requires `react@^19.3.0` and would have broken the peer contract). `npm install`
    run successfully (104 packages added, no peer conflicts).
15. **Folder structure** — all 16 directories created, `.gitkeep` added to every
    otherwise-empty one (`tests/unit/` holds the smoke test instead).
16. **scripts/verify.sh** — mirrors `npm run verify`, executable.

## Deviations from spec (with reasons)

- **`lint`/`lint:fix` scripts** use `biome check --no-errors-on-unmatched src/`
  instead of the literally-specified `biome check src/`. With `src/` currently
  containing only `.gitkeep` placeholders (governance phase, no feature code),
  plain `biome check src/` exits non-zero ("No files were processed"), which would
  make `npm run verify` permanently red until the first feature file lands. The
  `--no-errors-on-unmatched` flag is Biome's documented mechanism for exactly this
  case.
- **`tsconfig.json` path aliases** omit `baseUrl` (present in the task's mental
  model of "path aliases" but not required): this TypeScript version (`~6.0.3`)
  deprecates `baseUrl` (`TS5101`), and without it, `paths` values must be
  `./`-relative (`TS5090`) rather than bare (`src/*`). Verified directly against the
  real installed compiler, not assumed.
- **`vitest.config.ts` → `vitest.config.mts`**: the `.ts` extension combined with
  this repo's CommonJS-default `package.json` produced a Vite/Vitest deprecation
  warning (ESM syntax loaded as CJS). Renaming to `.mts` makes Node treat it as ESM
  unambiguously, with no config-shape change.
- **Mobile planning reference docs** — the task referenced
  `Mola_Universe_APP/docs/planning/mobile-plan-v2.md` and
  `.../mobile-restart-decision.md`; neither exists in the sibling repo (verified: that
  directory only contains `fase-0.*.md`, `roadmap.md`, `sprints.md`,
  `tests-baseline.md`, `FASE-0.5-GATE.md`). Grounded the architecture/stack content
  instead in `MOLA_UNIVERSE_PRD_v2.1.md` §1.1 (three-repo structure, mobile stack),
  `docs/architecture/api-contracts.md`, `src/openapi.ts`, and
  `docs/modules/_TEMPLATE.md`, all of which do exist and were read.
- **No RevenueCat/TanStack Query/Zustand/React Navigation/mmkv/secure-store package
  installs**: the task's deliverable 14 only specified devDependencies needed for
  lint/typecheck/test scripts to work. Installing the full runtime stack now would be
  feature-code preparation, out of scope for a governance-only phase per the task's
  own hard rules ("no business/feature code"). The stack choice itself is documented
  in `PROJECT_ROOT.md`, `README.md`, and `docs/architecture.md` as instructed.

## `npm run verify` result: GREEN

```
> lint     → biome check --no-errors-on-unmatched src/     → Checked 0 files, no issues
> typecheck → tsc --noEmit                                  → no errors
> test      → vitest run                                    → Test Files 1 passed (1), Tests 1 passed (1)
```

`npm audit` reports 10 moderate advisories inherited from the Expo blank scaffold's
existing dependency tree (pre-existing, not introduced by this pass) — left
unaddressed as out of scope for a governance-only change; flagging for a future,
explicitly-scoped dependency-audit task.

**Next step: M0 Setup.**
