# M1 Auth — Gaps & technical debt

Companion to `logs/mobile-m1-2026-09-17.md`. These are the accepted gaps, not bugs.

## TD-008 — Logout without `sessionId` (best-effort, V2)

**Endpoint:** `POST /auth/logout` (verified in
`Mola_Universe_APP/src/modules/auth/routes/authRoutes.ts`).

**Problem:** the endpoint requires a `sessionId` in the body, but **no** auth
endpoint (`login`, `register`, `refresh`) returns a `sessionId` to the client. The
session id never leaves the backend.

**Current behaviour:** `authStore.signOut()` clears the local session
(`expo-secure-store`) and returns to Login. Server-side session revocation is
**best-effort** — the single-session `/auth/logout` cannot be called reliably.

**Proposed resolution (V2):** backend returns `sessionId` (or a session handle) in
the login/register/refresh payload, or provides a token-derived logout that needs
no body. Until then, `AuthRepository.logout(sessionId)` stays available but
unused by the store.

**Owner:** backend (`Mola_Universe_APP`). Mobile only documents it.

## Component (screen) tests — accepted option B

**Decision:** keep **partial coverage** (hooks + repositories + mappers + client).
Visual/screen behaviour is verified manually in the simulator.

**Why:** importing `react-native` under Vitest/rolldown fails while parsing the
Flow syntax of `react-native/index.js`
(`SyntaxError: Unexpected token 'typeof'` … `At file: /node_modules/react-native/index.js:1:0`).
A React Native test transform (`jest-expo` / `babel-preset-expo`) is required and
is **not** part of the current runner.

**What *is* covered:** logic-bearing hooks (React-only, via `react-test-renderer`),
repositories over mocked `fetch`, mappers and the API client. See the per-milestone
reports for counts.

**Revisit (V2):** options A (add `jest-expo` transformer) or C (migrate to Jest).
Deferred — not worth the toolchain churn before the feature slices exist.
