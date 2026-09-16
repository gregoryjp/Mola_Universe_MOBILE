# Contributing

This file applies equally to human contributors and AI agents working in this repo.
Read `PROJECT_ROOT.md` first.

## Ground rules

1. **Source of truth is `Mola_Universe_APP`.** Never invent an API endpoint, payload,
   or business rule here — verify against `Mola_Universe_APP/src/openapi.ts` and
   `Mola_Universe_APP/docs/architecture/api-contracts.md` first. See
   `docs/api-contracts.md`.
2. **Never modify sibling repos.** `Mola_Universe_APP` and `Mola_Universe_PAGE` are
   read-only references from this repo, always.
3. **Follow the architecture.** Clean-Architecture-shell layers
   (`src/core`, `src/domain`, `src/data`, `src/presentation`, `src/shared`) with
   vertical slices by feature inside `domain/`, `data/`, and `presentation/`. See
   `docs/architecture.md` before adding a new module — use `docs/module-template.md`.
4. **No `any`.** TypeScript strict mode is non-negotiable; use generics or `unknown`
   with type guards instead.
5. **Pure functional code.** No `class`/`this` outside of a framework-mandated
   exception (e.g. a React `ErrorBoundary`).

## Commits

**Conventional Commits are required** for every commit:

```
<type>(<scope>): <subject>
```

Allowed types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`.

```bash
# correct
git commit -m "feat(tasks): add task list screen"
git commit -m "fix(auth): handle expired refresh token"

# wrong
git commit -m "updates"
```

## Tests are mandatory before merge

Every change that touches `src/` must have corresponding tests under `tests/unit/`
and/or `tests/integration/`. A PR without tests for new behavior does not merge.

## Verify gate

Run this before every commit and before opening a PR:

```bash
npm run verify   # biome check + tsc --noEmit + vitest run
```

All three must pass. If the project's Husky pre-commit hook is configured, do not
bypass it with `--no-verify` unless explicitly approved by the repo owner.

## Branching and delivery

- Work on a feature branch off `main`; never commit directly to `main`.
- No `git push` to `main` from an agent session — pushing and merging remain
  human-owned decisions.

## For AI agents specifically

See `.claude/AGENTS.md` for the full set of hard rules (governance-only phase,
no touching sibling repos, no inventing endpoints, no push to `main`).
