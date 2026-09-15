# M1 Foundation - Mobile Architecture

## Overview
M1 Foundation establishes the complete infrastructure for Mola-Mobile-Universe following the Master Plan V1. This phase implements secure session management, API client improvements, environment configuration, and TanStack Query for server state.

## Completed Infrastructure

### 1. Secure Session Store (`src/shared/auth/secure-session-store.ts`)
- **Purpose:** Persist auth tokens securely using `expo-secure-store`
- **Features:**
  - Async token storage (secure on native, simulated on web)
  - Hydration on app launch
  - Single-flight token refresh
  - Atomic token operations

**Usage:**
```typescript
import { useSessionStore } from '../shared/auth/secure-session-store';

const { accessToken, refreshToken, setTokens, clearTokens } = useSessionStore();
```

### 2. Advanced API Client (`src/shared/api/api-client.ts`)
- **Purpose:** Type-safe HTTP client with token management
- **Features:**
  - 30s default timeout
  - Single-flight refresh token pattern
  - Request ID + Idempotency Key headers
  - Automatic token refresh on 401
  - Error normalization (ApiClientError)
  - UUID v4 request identification

**Usage:**
```typescript
import { apiClient, ApiClientError } from '../shared/api/api-client';

const response = await apiClient.post('/endpoint', data);
```

### 3. Environment Configuration (`src/shared/config/env.ts`)
- **Purpose:** Centralized environment management
- **Environments:** development, preview, production
- **Exports:**
  - `config.API_URL` - backend endpoint
  - `config.isDevelopment`, `config.isPreview`, `config.isProduction`

**Usage:**
```typescript
import { config } from '../shared/config/env';
console.log(config.API_URL); // http://localhost:3000/api
```

### 4. TanStack Query Integration (`src/shared/providers/query-client.ts`)
- **Purpose:** Server state management with automatic caching
- **Configuration:**
  - Retry: 2 attempts with exponential backoff
  - Cache time: 5 minutes (gcTime)
  - Stale time: 1 minute
  - Mutations: no retry

**Usage:**
```typescript
import { queryClient } from '../shared/providers';
// Already provided via QueryClientProvider in _providers.tsx
```

### 5. Auth Module Foundation (`src/modules/auth/`)
**Structure:**
```
auth/
├── interface/
│   ├── types.ts       (User, AuthTokens, LoginRequest, etc.)
│   └── index.ts       (barrel export)
├── hooks/
│   ├── useAuth.ts     (TanStack Query mutations + queries)
│   └── index.ts       (barrel export)
└── index.ts           (module barrel)
```

**Core Hook - useAuth():**
```typescript
import { useAuth } from '../modules/auth';

const { 
  login,      // useMutation
  register,   // useMutation
  logout,     // useMutation
  forgotPassword,   // useMutation
  resetPassword,    // useMutation
  verifyOTP,        // useMutation
  currentUser,      // useQuery
  isAuthenticated,  // boolean
  user              // User | undefined
} = useAuth();

// Usage
login.mutate({ email, password });
if (login.isSuccess) router.replace('/(tabs)');
```

## Module Structure Template

Each M2+ module follows this pattern:

```
modules/<domain>/
├── interface/
│   ├── types.ts       (Domain types)
│   └── index.ts
├── hooks/
│   ├── use<Domain>.ts (TanStack Query mutations/queries)
│   └── index.ts
├── components/        (UI components, if any)
├── services/          (Business logic, optional)
└── index.ts           (barrel export)
```

## Providers Wrapper (`src/app/_providers.tsx`)

All children are wrapped with:
1. **SessionStore Hydration** - Loads persisted auth tokens from secure storage
2. **QueryClientProvider** - Makes TanStack Query available to all hooks

**Usage in app/_layout.tsx:**
```typescript
export default function RootLayout() {
  return (
    <Providers>
      <RootLayoutContent />
    </Providers>
  );
}
```

## Navigation Integration

Root layout (`src/app/_layout.tsx`) now:
- Uses `useSessionStore` (accessToken) to determine auth state
- Automatically routes to login or dashboard based on token presence
- No dependency on deprecated `useAuthStore`

## Planned M2 Modules

In order of implementation:
1. **Auth** ✅ (M1 Foundation)
2. **Users** - Profile, preferences, birthday sharing
3. **Privacy** - Consent, data rights
4. **Households** - Create, select, invite members
5. **Billing** - Paywall, in-app purchases
6. **Storage** - File upload, management
7. **Tasks** - Create, assign, complete
8. **Shopping** - Lists, items, sharing
9. **Inventory** - Items, quantities, movements
10. **Expenses** - Shared expenses, settlement
11. **Savings** - Goals, tracking
12. **Calendar** - Events, reminders
13. **Notifications** - Inbox, push, delivery
14. **Pets** - Pet profiles, health
15. **Dashboard** - Aggregated view
16. **Meow** - AI assistant
17. **SOS** - Emergency contact

## Key Decisions

| Decision | Reason |
|----------|--------|
| `expo-secure-store` for tokens | Platform-native secure storage (Keychain iOS, Keystore Android) |
| TanStack Query for server state | Single source of truth, automatic caching, sync across tabs |
| Zustand for UI state only | Local UI toggles, not server data (e.g., modal visibility) |
| Module-per-domain organization | Vertical slices, clear boundaries, independence |
| Barrel exports (index.ts) | Cleaner imports, easier refactoring |
| TypeScript strict mode | Compile-time safety, no `any` types |

## Testing Strategy (M3)

- **Unit:** Vitest for hooks, utilities, logic
- **Integration:** React Native Testing Library for components
- **E2E:** Maestro for user journeys across all 17 modules
- **Mock:** MSW (Mock Service Worker) for API mocking

## Next Steps (M2)

1. Implement **USERS-01** (Profile management)
2. Implement **PRIVACY-01** (Consent flows)
3. Implement **HOUSEHOLDS-01** (Household management)
4. Iterate through remaining 14 modules in order
5. Add tests (75% target coverage)
6. Set up EAS builds for TestFlight/Google Play
7. Certification gates (WCAG, performance, crash-free sessions)

## References

- [Master Plan V1](./MASTER_PLAN.md) - Complete implementation roadmap
- [Expo Router Docs](https://expo.dev/docs/routing)
- [TanStack Query Docs](https://tanstack.com/query/latest)
- [expo-secure-store](https://docs.expo.dev/versions/latest/sdk/securestore/)

---

**Status:** ✅ M1 Foundation Complete  
**Date:** 2026-09-15  
**Token Mgmt:** SecureSessionStore (expo-secure-store)  
**Server State:** TanStack Query  
**UI State:** Zustand (local only)
