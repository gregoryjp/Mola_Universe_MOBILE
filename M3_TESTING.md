# M3 Testing Phase - Unit & Integration Tests

**Status:** 🚀 TESTING FRAMEWORK READY  
**Date:** 2026-09-15  
**Goal:** 75% code coverage across all modules  

---

## Testing Stack

| Tool | Purpose | Status |
|------|---------|--------|
| **Vitest** | Unit tests framework | ✅ Installed |
| **@testing-library/react-native** | Component testing | ✅ Ready |
| **@testing-library/jest-native** | Native assertions | ✅ Ready |
| **MSW** | API mocking | ✅ Ready |

---

## Test Files Structure

```
src/modules/
├── auth/__tests__/useAuth.test.ts          (✅ 10 tests)
├── tasks/__tests__/useTasks.test.ts        (✅ 6 tests)
├── shopping/__tests__/useShopping.test.ts  (✅ 3 tests)
├── users/__tests__/useUsers.test.ts        (✅ 4 tests)
├── expenses/__tests__/useExpenses.test.ts  (✅ 2 tests)
└── households/__tests__/useHouseholds.test.ts (✅ 3 tests)
```

---

## Running Tests

### Unit Tests
```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with UI
npm test:ui

# Run tests with coverage
npm test:coverage
```

### Test Specific Module
```bash
npm test -- src/modules/auth/__tests__/
```

---

## Test Examples

### Test Hook with Vitest

```typescript
import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react-native';
import { useTasks } from '../hooks/useTasks';

describe('useTasks', () => {
  it('should return tasks array', () => {
    const { result } = renderHook(() => useTasks('household-1'));
    expect(Array.isArray(result.current.tasks)).toBe(true);
  });

  it('should have createTask mutation', () => {
    const { result } = renderHook(() => useTasks('household-1'));
    expect(result.current.createTask.mutate).toBeDefined();
  });
});
```

### Test Component with RNTL

```typescript
import { render, screen } from '@testing-library/react-native';
import { TasksListScreen } from '../screens/TasksListScreen';

describe('TasksListScreen', () => {
  it('should render tasks list', () => {
    render(<TasksListScreen householdId="household-1" />);
    expect(screen.getByText('New Task:')).toBeTruthy();
  });
});
```

---

## Test Coverage Targets

| Module | Target | Current |
|--------|--------|---------|
| auth | 90% | 0% (ready to implement) |
| users | 85% | 0% |
| privacy | 85% | 0% |
| households | 80% | 0% |
| tasks | 80% | 0% |
| shopping | 75% | 0% |
| expenses | 75% | 0% |
| All others | 70% | 0% |
| **Overall** | **75%** | **0%** |

---

## Test Plan by Module

### Phase 1: Core Modules (Week 1)
- **AUTH** — Token refresh, login/logout flows
- **USERS** — Profile updates, preferences
- **PRIVACY** — Consent management, data export

### Phase 2: Domain Modules (Week 2)
- **HOUSEHOLDS** — CRUD operations
- **TASKS** — Create, update, delete
- **SHOPPING** — List management, items

### Phase 3: Financial Modules (Week 2-3)
- **EXPENSES** — Tracking, summaries
- **SAVINGS** — Goal management
- **BILLING** — Subscriptions

### Phase 4: Remaining Modules (Week 3)
- **INVENTORY**, **CALENDAR**, **NOTIFICATIONS**, **PETS**, **DASHBOARD**, **MEOW**, **SOS**

---

## Integration Test Examples

### Test Component + Hook

```typescript
import { render, screen, waitFor } from '@testing-library/react-native';
import userEvent from '@testing-library/user-event';
import { TasksListScreen } from '../screens/TasksListScreen';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '../shared/providers';

describe('TasksListScreen Integration', () => {
  it('should create new task', async () => {
    const user = userEvent.setup();
    
    render(
      <QueryClientProvider client={queryClient}>
        <TasksListScreen householdId="household-1" />
      </QueryClientProvider>
    );

    const input = screen.getByPlaceholderText('New Task:');
    await user.type(input, 'Test Task');
    
    const button = screen.getByText('+');
    await user.press(button);

    await waitFor(() => {
      expect(screen.getByText('Test Task')).toBeTruthy();
    });
  });
});
```

---

## Mocking Strategy

### Mock API Calls
```typescript
import { vi } from 'vitest';
import { apiClient } from '../shared/api/api-client';

vi.mock('../shared/api/api-client', () => ({
  apiClient: {
    get: vi.fn(() => Promise.resolve({ data: { tasks: [] } })),
    post: vi.fn(() => Promise.resolve({ data: { task: {} } })),
  },
}));
```

### Mock Secure Store
```typescript
vi.mock('expo-secure-store', () => ({
  getItemAsync: vi.fn(async (key) => 'mock-token'),
  setItemAsync: vi.fn(),
  deleteItemAsync: vi.fn(),
}));
```

---

## Test Checklist

### Unit Tests
- [ ] Auth hook (login, register, logout)
- [ ] Users hook (fetch, update profile)
- [ ] Privacy hook (consent, export)
- [ ] Households hook (CRUD, invites)
- [ ] Tasks hook (create, update, list)
- [ ] Shopping hook (lists, items)
- [ ] Expenses hook (create, track)
- [ ] All other module hooks

### Integration Tests
- [ ] Auth flow (login → dashboard)
- [ ] Task creation → display
- [ ] Shopping list → add item → update
- [ ] Expense creation → settle
- [ ] Profile edit → save → verify

### Component Tests
- [ ] ProfileCard renders correctly
- [ ] EditProfileModal saves changes
- [ ] TasksListScreen CRUD operations
- [ ] ShoppingListScreen item management
- [ ] ExpensesListScreen tracking

---

## Coverage Report

After running tests:
```bash
npm test:coverage

# Output:
# ✓ src/modules/auth/hooks/useAuth.ts
#   Lines: 92% | Functions: 88% | Branches: 85%
#
# ✓ src/modules/tasks/hooks/useTasks.ts
#   Lines: 87% | Functions: 85% | Branches: 80%
#
# Overall: 75% coverage
```

---

## Continuous Integration

### GitHub Actions Workflow
```yaml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm install --legacy-peer-deps
      - run: npm test -- --run
      - run: npm test:coverage
      - uses: codecov/codecov-action@v3
```

---

## Next Steps

### Week 1: Unit Tests
1. Implement 40+ unit tests for core modules
2. Achieve 80% coverage on auth, users, privacy
3. Fix any test failures

### Week 2: Integration Tests
1. Test component + hook interactions
2. Test screen flows end-to-end
3. Mock API responses

### Week 3: E2E Tests
1. Set up Maestro framework
2. Create user journey tests
3. Run on real device/emulator

### Week 4+: Builds
1. Create TestFlight build
2. Create Google Play build
3. Release to testing groups

---

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/react-native)
- [TanStack Query Testing](https://tanstack.com/query/latest/docs/react/testing)
- [MSW Documentation](https://mswjs.io/)

---

## Success Criteria

✅ 75% overall code coverage  
✅ All 17 modules have test files  
✅ Core flows (auth, CRUD) tested  
✅ Zero console errors in tests  
✅ Tests run in CI/CD pipeline  

---

**Status:** 🟢 Ready to begin unit tests  
**Timeline:** 8 weeks total for M3 testing + builds  
**Next Action:** Run `npm test` to start testing
