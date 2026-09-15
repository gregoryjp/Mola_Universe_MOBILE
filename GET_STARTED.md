# Getting Started - Mola-Mobile-Universe

**Status:** ✅ Development Server Running  
**Metro Bundler:** Port 8082  
**App Ready:** For testing and development

---

## Quick Start

### 1. Server is Running
The Metro Bundler is already started on port 8082.

```
✅ http://localhost:8082 (Metro Bundler)
```

### 2. Open the App

Choose your preferred method:

#### **Option A: Web Browser** (Fastest)
```bash
# Press 'w' in the Metro Bundler terminal
# Or navigate to: http://localhost:8082
```

#### **Option B: iOS Simulator** (Mac only)
```bash
# Press 'i' in the Metro Bundler terminal
# Requires Xcode and iOS Simulator
```

#### **Option C: Android Emulator**
```bash
# Press 'a' in the Metro Bundler terminal
# Requires Android Studio and emulator running
```

#### **Option D: Expo Go (Mobile Device)**
```bash
# Download Expo Go from App Store / Google Play
# Scan the QR code shown in Metro Bundler terminal
```

---

## Testing the App

### Demo Login (No Backend Required)
1. **Click "Demo Login (No Backend)"** button
2. Automatically authenticates with demo credentials
3. Navigates to dashboard

### Features to Test

#### **Profiles** (USERS-01)
- View profile card with user info
- Edit profile (name, phone, birthdate)
- Update preferences (theme, language)
- Avatar upload

#### **Privacy** (PRIVACY-01)
- Manage consent settings
- Request data export
- Delete account option

#### **Household** (HOUSEHOLDS-01)
- Create/select household
- Invite members
- View member list

#### **Tasks** (TASKS-01) - Full Screen Example
- View task list
- Create new tasks
- Mark complete/incomplete
- Filter by status
- Priority levels

#### **Shopping** (SHOPPING-01) - Full Screen Example
- Create shopping lists
- Add items with quantities
- Track progress
- Mark items as purchased

#### **Expenses** (EXPENSES-01) - Full Screen Example
- Log expenses
- View summary
- Track pending/settled status
- Category tracking

---

## Available Routes

### Public Routes (Auth)
```
GET  /       → Login screen
GET  /(auth)/login
GET  /(auth)/register
GET  /(auth)/forgot-password
```

### Protected Routes (Authenticated)
```
GET  /(tabs)           → Dashboard (index)
GET  /(tabs)/profile   → User profile
GET  /(tabs)/tasks     → Tasks list
GET  /(tabs)/shopping  → Shopping lists
GET  /(tabs)/expenses  → Expenses tracking
```

---

## Architecture at a Glance

### Module Structure
```
src/modules/
├── auth/              (✅ Complete)
├── users/             (✅ Complete + UI)
├── privacy/           (✅ Complete + UI)
├── households/        (✅ Complete)
├── tasks/             (✅ Complete + Screen)
├── shopping/          (✅ Complete + Screen)
├── expenses/          (✅ Complete + Screen)
└── [13 more...]       (✅ Complete)
```

### Hook Pattern
Every module exports a custom hook:

```typescript
import { useTasks } from '../modules/tasks';

const { tasks, isLoading, createTask, updateTask } = useTasks(householdId);

// Use TanStack Query mutations
createTask.mutate({ title: 'New Task' });
```

### API Client
```typescript
import { apiClient } from '../shared/api/api-client';

const response = await apiClient.post('/endpoint', data);
// Automatic token refresh, request ID, error handling
```

---

## Development Workflow

### 1. Make Changes
Edit any file in `src/modules/` or `src/app/`

### 2. Hot Reload
Changes auto-reload in the running app

### 3. Check TypeScript
```bash
npx tsc --noEmit
```

### 4. Commit
```bash
git add .
git commit -m "feat: description of changes"
```

---

## Testing Examples

### Test a Module Hook
```typescript
import { useTasks } from '../modules/tasks';

// Use in any screen
function TaskScreen() {
  const { tasks, createTask } = useTasks(householdId);
  
  return (
    <View>
      {tasks.map(task => (
        <Text key={task.id}>{task.title}</Text>
      ))}
    </View>
  );
}
```

### Extend a Module
Follow `MODULE_TEMPLATE.md` to:
1. Define types in `interface/types.ts`
2. Implement hook in `hooks/useModule.ts`
3. Create screens using the hook
4. Test with the running app

---

## Troubleshooting

### Metro Bundler Won't Start
```bash
# Kill any existing process
lsof -ti:8082 | xargs kill -9

# Start fresh
npm start -- --port 8082
```

### Module Not Found Error
```bash
# Reinstall dependencies
npm install

# Clear Metro cache
npm start -- --reset-cache
```

### TypeScript Errors
```bash
# Check strict mode
npx tsc --noEmit

# All should be 0 errors
```

---

## File Structure

```
src/
├── app/                 (Expo Router pages)
├── modules/             (17 domain modules)
├── screens/             (Screen components)
├── shared/              (Infrastructure)
└── types/               (Shared types)
```

---

## Next Steps

1. **Test Features** — Use Demo Login, navigate screens
2. **Explore Modules** — Check `src/modules/*/README.md`
3. **Modify Hooks** — Edit `src/modules/*/hooks/use*.ts`
4. **Create Screens** — Use `src/screens/` examples as reference
5. **Add Tests** — Follow M3 testing plan in `FINAL_STATUS.md`

---

## Useful Commands

```bash
# Start server
npm start

# Type check
npx tsc --noEmit

# View git history
git log --oneline

# See module structure
find src/modules -type f -name "*.ts" | head -20
```

---

## Documentation

- **[FINAL_STATUS.md](./FINAL_STATUS.md)** — Complete build summary
- **[M1_FOUNDATION.md](./M1_FOUNDATION.md)** — Infrastructure details
- **[M2_ROADMAP.md](./M2_ROADMAP.md)** — Implementation timeline
- **[MODULE_TEMPLATE.md](./MODULE_TEMPLATE.md)** — How to extend modules

---

## Status

✅ **M1 Foundation** — Complete  
✅ **M2 Modules** — All 17 implemented  
✅ **TypeScript** — Strict mode, 0 errors  
✅ **Development Server** — Running  
✅ **Ready to Test** — Yes  

**Next Phase:** M3 Testing (unit, integration, E2E tests)

---

**Happy coding! 🚀**

The app is ready for development and testing. Use Demo Login to explore all features without a backend.
