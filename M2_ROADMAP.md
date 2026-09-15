# M2 Implementation Roadmap - 17 Functional Modules

## Overview
M2 implements the 17 functional modules defined in Master Plan V1, building on M1 Foundation infrastructure. Each module follows the template in `MODULE_TEMPLATE.md`.

## Phase 1: Core Identity (Weeks 1-3)

### USERS-01: Profile Management
**Scope:** User profile CRUD, preferences, birthday sharing
**Endpoints:** ~8
**Features:**
- Fetch/update user profile
- Store preferences (theme, language, notifications)
- Birthday sharing with household members
- Avatar upload (integrates with STORAGE-01)

**File Structure:**
```
src/modules/users/
├── interface/types.ts (User, UpdateUserRequest, etc.)
├── hooks/useUsers.ts (useUserProfile, useUpdateProfile)
├── components/ProfileCard.tsx
└── index.ts
```

### PRIVACY-01: Consent & Data Rights
**Scope:** User consent management, GDPR/privacy compliance
**Endpoints:** ~6
**Features:**
- Consent status (marketing, analytics, third-party)
- Data export request
- Account deletion request
- Privacy policy versioning

## Phase 2: Households (Weeks 4-5)

### HOUSEHOLDS-01: Household Management
**Scope:** Create households, invite members, roles
**Endpoints:** ~10
**Features:**
- Create household
- Invite members (email-based)
- Accept/reject invites
- Member roles (Owner, Admin, Member)
- Leave household
- Delete household

### BILLING-01: Subscription & Entitlements
**Scope:** Paywall, in-app purchases, subscription management
**Endpoints:** ~8
**Features:**
- Fetch subscription plans
- Create checkout session (Stripe integration)
- Handle webhook (subscription.created, .updated, .deleted)
- Fetch current subscription
- Cancel subscription
- Household capacity based on subscription tier

## Phase 3: Data Management (Weeks 6-8)

### STORAGE-01: File Upload & Management
**Scope:** Upload, store, retrieve files (avatars, attachments)
**Endpoints:** ~6
**Features:**
- Pre-signed upload URLs (S3/Cloudinary)
- List files
- Delete file
- Update metadata

### INVENTORY-01: Inventory Tracking
**Scope:** Items, quantities, movements
**Endpoints:** ~10
**Features:**
- Create item
- Log movement (add/remove quantity)
- Movement history
- Quantity precision (units, fractions)
- Export as CSV

### TASKS-01: Task Management
**Scope:** Create, assign, track tasks
**Endpoints:** ~8
**Features:**
- Create task
- Assign to member
- Mark complete
- Comments/attachments
- Priority levels
- Due dates

### SHOPPING-01: Shopping Lists
**Scope:** Shared shopping lists, item management
**Endpoints:** ~12
**Features:**
- Create list
- Add items with quantity/unit
- Mark items as purchased
- Suggest duplicates
- Share with members
- Export as checklist

## Phase 4: Financial Tracking (Weeks 9-10)

### EXPENSES-01: Shared Expenses
**Scope:** Track, split, settle expenses
**Endpoints:** ~9
**Features:**
- Create expense
- Auto-calculate splits (equal, by percentage, custom)
- Settle expenses
- Balance tracking
- Export statement

### SAVINGS-01: Savings Goals
**Scope:** Track savings progress toward goals
**Endpoints:** ~10
**Features:**
- Create savings goal (target amount, deadline)
- Log contribution
- Goal progress tracking
- Achieved goals history
- Reverse contribution (undo)

## Phase 5: Calendar & Notifications (Weeks 11-12)

### CALENDAR-01: Event Management
**Scope:** Shared events, reminders
**Endpoints:** ~8
**Features:**
- Create event
- Recurring events (daily, weekly, monthly)
- RSVP status
- Reminders (push, in-app)
- iCal export

### NOTIFICATIONS-01: Inbox & Push
**Scope:** In-app notifications, push delivery
**Endpoints:** ~6
**Features:**
- Fetch notifications
- Mark as read
- Delete notification
- Push token registration
- Notification preferences per type

### PETS-01: Pet Management
**Scope:** Pet profiles, health tracking
**Endpoints:** ~8
**Features:**
- Create pet profile (name, type, birthdate)
- Log health events (vet visit, vaccination)
- Medical history
- Dietary notes
- Photo gallery

## Phase 6: Intelligence & Support (Weeks 13-14)

### DASHBOARD-01: Home Screen
**Scope:** Aggregated view of household data
**Endpoints:** ~4 (custom endpoints per data type)
**Features:**
- Upcoming expenses summary
- Recent tasks
- Grocery list status
- Family stats (net balance, completions)
- Quick add widgets

### MEOW-01: AI Assistant
**Scope:** Conversational assistant (powered by Claude API)
**Endpoints:** ~4
**Features:**
- Chat interface
- Expense categorization suggestion
- Task decomposition
- Household budget advice
- Emergency contact support (SOS integration)

### SOS-01: Emergency Contact
**Scope:** Emergency contact information, SOS mode
**Endpoints:** ~4
**Features:**
- Add emergency contact
- SOS mode (quick call/SMS)
- Location sharing (opt-in)
- Medical info card
- Emergency contacts from household members

## Implementation Order

| Week | Module | Reason | Prerequisite |
|------|--------|--------|--------------|
| 1 | USERS-01 | Every user has a profile | Auth (M1) |
| 2 | PRIVACY-01 | GDPR compliance required | USERS-01 |
| 3 | HOUSEHOLDS-01 | Foundation for multi-user | USERS-01 |
| 4 | BILLING-01 | Monetization gate | HOUSEHOLDS-01 |
| 5 | STORAGE-01 | Avatars, file uploads | BILLING-01 |
| 6 | INVENTORY-01 | Simple item tracking | HOUSEHOLDS-01 |
| 7 | TASKS-01 | Task assignment | HOUSEHOLDS-01 |
| 8 | SHOPPING-01 | Common household use case | HOUSEHOLDS-01 |
| 9 | EXPENSES-01 | Core sharing feature | HOUSEHOLDS-01 |
| 10 | SAVINGS-01 | Financial tracking | EXPENSES-01 |
| 11 | CALENDAR-01 | Household coordination | HOUSEHOLDS-01 |
| 12 | NOTIFICATIONS-01 | Push/delivery | All modules |
| 13 | PETS-01 | Family feature | HOUSEHOLDS-01 |
| 14 | DASHBOARD-01 | Home screen aggregation | Most modules |
| 15 | MEOW-01 | AI enhancement | Dashboard |
| 16 | SOS-01 | Safety feature | USERS-01 |

## Testing per Module

Each module requires:
- **Unit tests:** Hook logic, type transformations (Vitest)
- **Integration tests:** API calls, mutations (React Testing Library)
- **E2E tests:** Full user journey (Maestro)
- **Target coverage:** 75% minimum

## CI/CD Setup

- **Pre-commit:** typecheck + lint + test
- **On PR:** Same + E2E on preview build
- **On main:** Build + test + push to EAS

## Certification Gates (Post-M2)

- **Mobile Release:** 
  - All 17 modules functionally complete
  - Contracts synced with backend
  - Journeys complete for all 17 modules
  - WCAG 2.2 AA accessibility
  - Crash-free sessions ≥99.5%
  - Build + deploy to TestFlight/Google Play

- **Backend Release:**
  - All 17 endpoints CERTIFIED
  - OpenAPI 100% sync
  - Zero Critical/High vulnerabilities
  - Staging TLS in EU
  - Tests ≥80% coverage

## Success Criteria

✅ Module Complete when:
1. Types & hooks defined and tested
2. All endpoints (happy path + errors) implemented
3. E2E journeys passing
4. Documentation updated (README in module)
5. No TypeScript/lint errors
6. Contracts match backend OpenAPI

---

**Timeline:** 16 weeks (4 months)  
**Starting:** 2026-09-15  
**Target Completion:** 2026-12-30  
**Team:** Gregory (solo contributor)

**Next Step:** Implement USERS-01 following `MODULE_TEMPLATE.md`
