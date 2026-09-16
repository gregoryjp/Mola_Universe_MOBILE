# API Contracts

The backend, `Mola_Universe_APP`, is the single source of truth for every API route,
payload, and error shape this app calls. This repo does not define or negotiate API
contracts — it only consumes them.

## Where to look

- **Contract inventory / migration status**:
  `Mola_Universe_APP/docs/architecture/api-contracts.md` — documents the current
  state (9 runtime modules: Auth, Users, Households, Expenses, Billing, Inventory,
  Savings, Shopping, Tasks; routes currently under the legacy `/api` prefix, with an
  `/api/v1` alias planned per ADR-0009; OpenAPI coverage is partial — not every
  runtime route has a matching OpenAPI entry yet).
- **Actual OpenAPI source of truth**: `Mola_Universe_APP/src/openapi.ts` — this is
  the authoritative, machine-checkable definition. When OpenAPI coverage and the
  written inventory disagree, or when a route isn't in either, treat it as **not
  confirmed** and go verify directly (ask, or read the backend route/controller code)
  rather than guessing the shape.

## Hard rule

**Do not invent endpoints, request/response shapes, or error codes.** Before writing
any API-calling code (a TanStack Query hook, a repository function in
`src/data/<feature>/`, a type for a DTO):

1. Check `Mola_Universe_APP/src/openapi.ts` for the exact path, method, and schema.
2. If it's missing there, check the runtime route/controller in `Mola_Universe_APP`
   directly (read-only).
3. If it still can't be confirmed, stop and ask — do not extrapolate from a similar
   endpoint or from memory of a typical REST shape.

## Response envelope

Per the backend's documented contract (ADR-0003), responses follow:

```json
{
  "success": true,
  "data": { },
  "meta": { }
}
```

Errors follow ADR-0010's Result Pattern on the backend side; the client-side
equivalent (how a failed request surfaces to a screen) is a data-layer concern
documented per module — see `docs/module-template.md` §8.
