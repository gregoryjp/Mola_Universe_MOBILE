# Module Template - M2+ Implementation

Use this template when implementing a new module (USERS-01, HOUSEHOLDS-01, etc.)

## 1. Create Directory Structure

```bash
mkdir -p src/modules/<domain>/{interface,hooks,components,services}
```

## 2. Define Types (src/modules/<domain>/interface/types.ts)

```typescript
// All domain-specific types go here
export interface User {
  id: string;
  email: string;
  name: string;
}

export interface FetchUserResponse {
  user: User;
}

export interface UpdateUserRequest {
  name?: string;
  avatar?: string;
}

export interface UpdateUserResponse {
  user: User;
}
```

## 3. Create Barrel Export (src/modules/<domain>/interface/index.ts)

```typescript
export * from './types';
```

## 4. Implement Hooks (src/modules/<domain>/hooks/use<Domain>.ts)

```typescript
import { useMutation, useQuery } from '@tanstack/react-query';
import { apiClient } from '../../../shared/api/api-client';
import {
  User,
  FetchUserResponse,
  UpdateUserRequest,
  UpdateUserResponse,
} from '../interface/types';

const DOMAIN_QUERY_KEY = 'users'; // change per domain

async function fetchUser(userId: string): Promise<User> {
  const response = await apiClient.get<FetchUserResponse>(`/users/${userId}`);
  return response.data.user;
}

async function updateUser(
  userId: string,
  data: UpdateUserRequest
): Promise<User> {
  const response = await apiClient.patch<UpdateUserResponse>(
    `/users/${userId}`,
    data
  );
  return response.data.user;
}

export function useUsers() {
  const queryKey = DOMAIN_QUERY_KEY;

  const fetchQuery = useQuery({
    queryKey: [queryKey, 'fetch'],
    queryFn: () => fetchUser('me'), // or specific userId
  });

  const updateMutation = useMutation({
    mutationFn: (data: UpdateUserRequest) => updateUser('me', data),
    onSuccess: () => {
      // Invalidate queries after successful mutation
      // (optional, depends on cache strategy)
    },
  });

  return {
    user: fetchQuery.data,
    isLoading: fetchQuery.isLoading,
    error: fetchQuery.error,
    update: updateMutation,
    isUpdating: updateMutation.isPending,
  };
}
```

## 5. Create Barrel Export (src/modules/<domain>/hooks/index.ts)

```typescript
export { useUsers } from './useUsers';
export * from '../interface';
```

## 6. Add Components (if needed)

Create components in `src/modules/<domain>/components/`:

```typescript
// src/modules/<domain>/components/UserCard.tsx
import React from 'react';
import { View, Text } from 'react-native';
import { User } from '../interface';

interface UserCardProps {
  user: User;
}

export function UserCard({ user }: UserCardProps) {
  return (
    <View>
      <Text>{user.name}</Text>
      <Text>{user.email}</Text>
    </View>
  );
}
```

## 7. Module Barrel Export (src/modules/<domain>/index.ts)

```typescript
export * from './interface';
export * from './hooks';
// export { UserCard } from './components/UserCard';
```

## 8. Usage in Screens

```typescript
// In a screen component
import { useUsers } from '../modules/users';

export function ProfileScreen() {
  const { user, isLoading, update } = useUsers();

  if (isLoading) return <ActivityIndicator />;

  return (
    <View>
      <Text>{user?.name}</Text>
      <Button onPress={() => update.mutate({ name: 'New Name' })} />
    </View>
  );
}
```

## Key Rules

| Rule | Reason |
|------|--------|
| **Type definitions in `interface/`** | Single source of truth, easy to share with backend |
| **Hooks handle all API calls** | Centralized data fetching, easier testing |
| **TanStack Query for server state** | Automatic caching, invalidation, sync |
| **Zustand ONLY for UI state** | Modal visibility, active tabs, filters (local UI state) |
| **No logic in components** | Pure presentational, easier to test and reuse |
| **Barrel exports** | Cleaner imports: `import { useUsers, User }` |
| **No `any` types** | TypeScript strict mode enforced |
| **Atomic selectors in Zustand** | Use `useShallow()` if accessing multiple properties |

## Testing Template

```typescript
// src/modules/<domain>/__tests__/use<Domain>.test.ts
import { describe, it, expect, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react-native';
import { useUsers } from '../hooks/useUsers';

describe('useUsers', () => {
  it('should fetch user successfully', async () => {
    const { result } = renderHook(() => useUsers());

    await waitFor(() => {
      expect(result.current.user).toBeDefined();
    });
  });

  it('should handle update mutation', async () => {
    const { result } = renderHook(() => useUsers());

    result.current.update.mutate({ name: 'New Name' });

    await waitFor(() => {
      expect(result.current.isUpdating).toBe(false);
    });
  });
});
```

## From Here...

1. Implement all modules in M2 order (17 total)
2. Add components and screens per module
3. Wire up navigation in app/ directory
4. Add E2E tests via Maestro
5. Set up CI/CD with EAS

---

**Reference:** See `src/modules/auth/` for a complete example.
