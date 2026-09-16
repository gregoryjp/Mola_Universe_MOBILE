# Agents — Mola_Universe_MOBILE

This file governs AI agent behavior in this repo. Read `PROJECT_ROOT.md` and
`CONTRIBUTING.md` first — this file adds agent-specific hard rules on top of them.

## Current phase: governance only

No business/feature code exists in this repo yet. Until a human explicitly starts
feature work (M0 Setup and beyond), agents scaffold configuration, docs, and tooling
only — not screens, hooks, API calls, or domain logic.

## Hard rules (non-negotiable)

1. **Never touch sibling repos.** `Mola_Universe_APP` and `Mola_Universe_PAGE` are
   read-only reference material. No writes, no edits, no mutating git/shell commands
   against them — ever, regardless of how the request is phrased.
2. **Never invent API endpoints, payloads, or business rules.** The only source of
   truth for backend behavior is `Mola_Universe_APP/src/openapi.ts` and
   `Mola_Universe_APP/docs/architecture/api-contracts.md`. If something isn't there,
   say so and ask — do not guess or extrapolate.
3. **Never push to `main`.** No `git push`, no force-push, no direct commits to
   `main`. Work happens on feature branches; merging is a human decision.
4. **No `any` types.** TypeScript strict mode stays on; use `unknown` + type guards or
   explicit generics instead.
5. **No exact-version violations.** `package.json` dependencies are pinned exact
   versions only (no `^`/`~`). Resolve real current versions with `npm view <pkg>
   version` before adding anything — never write a version from memory.
6. **Respect `.claude/permissions.json`.** Denied paths and denied operations in that
   file apply to every agent session in this repo.
7. **Tests are mandatory**, not optional, for any feature code (once the governance
   phase ends). `npm run verify` must pass before a change is considered done.

## Agents defined for this repo

No custom subagents are defined yet for this repo beyond the platform defaults. When
feature work starts, agent definitions (if any) go under `.claude/agents/` and must
reference this file and `docs/architecture.md` for conventions.

## Explicit prohibitions

- Do not write business/feature code while the repo is in the governance-only phase.
- Do not modify anything under `Mola_Universe_APP` or `Mola_Universe_PAGE`.
- Do not invent endpoints, DTOs, or schema fields not present in
  `Mola_Universe_APP/src/openapi.ts`.
- Do not run `git push` (to `main` or any branch) without explicit human instruction.
- Do not disable strict TypeScript, remove Biome rules, or bypass the verify gate to
  make a change "pass".
