# Architecture

## Folder structure

```
src/
├── core/            # App-wide wiring: navigation root, providers, app config, DI-ish composition
├── domain/          # Business logic, per feature — pure TS, no React/RN, no I/O
│   └── <feature>/
├── data/            # Data access, per feature — API clients, repositories, storage adapters
│   └── <feature>/
├── presentation/     # UI, per feature — screens, components, hooks that consume domain+data
│   └── <feature>/
└── shared/           # Cross-cutting: design tokens, generic UI primitives, utils, types
```

## Pattern: Clean Architecture shell + vertical slice per feature

This project reconciles two ideas that are easy to conflate:

- **Layered shell** (`core` / `domain` / `data` / `presentation` / `shared`) — this is
  the *outer* structure. It exists to enforce dependency direction: `presentation`
  depends on `domain` and `data`; `domain` depends on nothing (pure business logic);
  `data` implements the interfaces `domain` defines; `core` wires everything together
  at the app root; `shared` has no feature knowledge and is safe for anything to import.

- **Vertical slice per feature, inside each layer** — this is the *inner* structure.
  Each layer is subdivided by feature (`tasks`, `expenses`, `shopping`, `households`,
  …), not by technical type. A feature's domain logic lives in `domain/<feature>/`,
  its data access in `data/<feature>/`, its screens/components in
  `presentation/<feature>/`. You do **not** get one global `hooks/` or `services/`
  folder shared by every feature — each feature owns its own slice within each layer.

So for a feature `tasks`, code lives in three places, one per layer, never merged:

```
src/domain/tasks/         # entities, use-cases, ports (interfaces), pure logic
src/data/tasks/           # TanStack Query hooks, API calls, repository implementations
src/presentation/tasks/   # screens, feature-local components, feature-local Zustand stores
```

This gives feature isolation (you can find/delete/move a whole feature) *and*
architectural layering (you can't accidentally import a data-access detail directly
into a domain use-case). See `docs/module-template.md` for the concrete file layout
a new module follows.

## Dependency direction

```
presentation → domain
presentation → data
data         → domain   (implements domain-defined ports/interfaces)
domain       → (nothing feature-external; may use shared)
core         → presentation, data, domain   (composition root only)
shared       → (nothing; leaf)
```

`domain` never imports from `data` or `presentation`. `shared` never imports from a
feature folder.

## How mobile connects to the backend

- The backend (`Mola_Universe_APP`) is the single source of truth for API shape. Its
  OpenAPI document lives at `Mola_Universe_APP/src/openapi.ts`; the human-readable
  contract inventory is at
  `Mola_Universe_APP/docs/architecture/api-contracts.md`.
- All HTTP calls go through an API client layer under `src/data/<feature>/` (or a
  shared `src/data/client` for cross-feature concerns like auth headers), never
  `fetch`/HTTP calls inline in a screen or component (see
  `~/.claude/rules/reactjs.rules.md` §4).
- TanStack Query hooks wrap those calls and own server-state caching/invalidation.
  Zustand is reserved for client/UI state only, never as a parallel server-data cache.
- Before implementing any API call, verify the exact route/payload against
  `Mola_Universe_APP/src/openapi.ts` — see `docs/api-contracts.md`.
