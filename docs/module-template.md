# Module [NAME]

**Technical spec/implementation document**
**Status:** Draft / In Review / Approved / Open Decision / Obsolete
**Version:** 0.1
**Last reviewed:** [YYYY-MM-DD]
**Owner:** [Gregory]

Adapted from `Mola_Universe_APP/docs/modules/_TEMPLATE.md` for a mobile feature
module (domain/data/presentation vertical slice, see `docs/architecture.md`).

---

## §0 — How to read this document

Describes the design, scope, and implementation plan for the [NAME] feature module.

**For implementers:** follow section by section.
**For reviewers:** verify each section answers its question.
**For Gregory:** approve once every decision is resolved.

---

## §1 — Context and problem

Why does this feature module exist? What product need does it address? Link back to
the relevant PRD section in `Mola_Universe_APP/MOLA_UNIVERSE_PRD_v2.1.md`.

---

## §2 — Concept (if applicable)

If this module implements a non-obvious pattern, explain it here.

---

## §3 — Technical decisions

| Decision | Why | Rejected alternative |
|---|---|---|
| e.g. TanStack Query for server state | Cache invalidation, retries built in | Zustand-as-cache → manual invalidation, stale data |

---

## §4 — Exact scope

**Does:**
- ✅ [capability]

**Does NOT do (out of scope):**
- ❌ [capability] — [why / deferred to phase X]

---

## §5 — Architecture (slice layout)

**Required structure** (see `docs/architecture.md` for the layering rationale):

```
src/domain/[feature]/
├── entities/                 # Plain types/entities for this feature
├── use-cases/                 # Pure business logic, no React/RN, no I/O
└── ports/                     # Interfaces the data layer implements
src/data/[feature]/
├── api/                       # HTTP calls — verified against Mola_Universe_APP/src/openapi.ts
├── repositories/              # Implements domain ports
└── queries/                   # TanStack Query hooks (useXQuery/useXMutation)
src/presentation/[feature]/
├── screens/                   # Screen components
├── components/                # Feature-local components
├── hooks/                     # Feature-local hooks (state derivation, not effects — see reactjs.rules.md §6)
└── store/                     # Feature-local Zustand store, if the feature needs client/UI state
```

Each layer's feature folder is self-contained; cross-feature reuse goes through
`src/shared/`, never a direct import from another feature's slice.

---

## §6 — Data model (client-side)

What does this module hold in local state (Zustand) vs. server cache (TanStack
Query)? Never duplicate server data into Zustand as a cache — see
`~/.claude/rules/state-management.rules.md`.

---

## §7 — Public contracts (domain types)

What types/interfaces does `domain/[feature]/` expose for `data/` and
`presentation/` to consume?

```typescript
interface I[Entity] {
  id: string;
  // ...
}

type [Feature]Result<T> =
  | { success: true; value: T }
  | { success: false; error: [Feature]Error };
```

---

## §8 — API contract consumed

**Do not invent this section.** Every row must be verified against
`Mola_Universe_APP/src/openapi.ts` (or the runtime route, read-only, if OpenAPI
coverage is missing) — see `docs/api-contracts.md`.

| Method | Path | Description | Verified against |
|---|---|---|---|
| GET | /api/... | ... | openapi.ts L### |

---

## §9 — Integration into user flows (if applicable)

Typical sequence: who calls whom, in what order, across screens.

---

## §10 — Quotas / business limits (if applicable)

---

## §11 — Resilience and degradation

| Failure | Impact | Mitigation |
|---|---|---|
| Offline / no network | Can't sync | Show cached data + offline indicator |
| API error | Action fails | Surface via Result Pattern, retry via TanStack Query |

---

## §12 — Security and privacy

- Tokens: stored via `expo-secure-store`, never `react-native-mmkv` (mmkv is for
  non-sensitive local data only).
- No sensitive data (tokens, passwords) in logs.

---

## §13 — Observability

- What gets logged client-side, and how errors surface to the user.

---

## §14 — Testing

**Minimum required:**
- Unit: domain use-cases (pure functions, no mocking needed)
- Integration: data-layer hooks against a mocked API (MSW or equivalent)
- Component: key presentation components/screens

```bash
npm test               # all tests
npm run test:coverage  # with coverage
```

---

## §15 — Implementation phases

- [ ] Domain: entities + use-cases
- [ ] Data: API client + TanStack Query hooks
- [ ] Presentation: screens + components
- [ ] Tests (unit + integration)
- [ ] Wired into navigation

---

## §16 — Risks and mitigations

| Risk | Probability | Impact | Mitigation |
|---|---|---|---|

---

## §17 — Rejected alternatives

| Alternative | Why rejected |
|---|---|

---

## §18 — Glossary

Feature-specific terms.

---

## §19 — Related docs

- `Mola_Universe_APP/MOLA_UNIVERSE_PRD_v2.1.md`
- `Mola_Universe_APP/docs/architecture/api-contracts.md`
- `docs/architecture.md`

---

## ✅ Completeness checklist

- [ ] Every section has content (no "TBD")
- [ ] Every API row in §8 is verified against `Mola_Universe_APP/src/openapi.ts`
- [ ] Every decision has a documented reason
- [ ] Tests are described concretely
- [ ] No "Open Decision" left unresolved
- [ ] Gregory has reviewed and approved
