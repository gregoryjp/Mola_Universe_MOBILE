# API client

Thin HTTP client shared by every feature's `data/` layer.

- Base URL: configurable via `EXPO_PUBLIC_API_URL` (defaults to
  `http://localhost:3000/api/v1`).
- Response shape: `ApiResponse<T>` (see `types.ts`) — matches the backend's
  ADR-0003 envelope (`{ success, data, meta }`; `error` carries the ADR-0010
  failure shape).

## Hard rules

- **Do not invent endpoints.** Verify every route/payload against
  `../Mola_Universe_APP/src/openapi.ts` before writing a call.
- Cross-check the human-readable inventory in
  `../Mola_Universe_APP/docs/architecture/api-contracts.md` (note: that document
  is known to lag behind `openapi.ts` — `openapi.ts` wins).
