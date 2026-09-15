# USERS-01: Profile Management

User profile management with preferences and avatar upload.

## Features

- ✅ Fetch user profile
- ✅ Update user profile (name, phone, birthDate)
- ✅ Fetch user preferences (theme, language, notifications, privacy)
- ✅ Update preferences
- ✅ Upload avatar
- ✅ Email/phone verification status

## Module Structure

```
users/
├── interface/
│   ├── types.ts       (User, UserPreferences, UpdateProfileRequest, etc.)
│   └── index.ts       (barrel export)
├── hooks/
│   ├── useUsers.ts    (TanStack Query mutations & queries)
│   └── index.ts       (barrel export)
├── components/
│   ├── ProfileCard.tsx         (Display user profile)
│   ├── EditProfileModal.tsx    (Edit profile form)
│   ├── PreferencesPanel.tsx    (Edit preferences)
│   └── index.ts                (barrel export)
└── index.ts                    (module barrel)
```

## API Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/users/profile` | Fetch current user profile |
| PATCH | `/users/profile` | Update user profile |
| GET | `/users/preferences` | Fetch user preferences |
| PATCH | `/users/preferences` | Update user preferences |
| POST | `/users/avatar` | Upload avatar image |

## Usage

### Basic Profile Display

```typescript
import { useUsers } from '../modules/users';

export function ProfileScreen() {
  const { profile, isLoadingProfile } = useUsers();

  return <ProfileCard user={profile} isLoading={isLoadingProfile} />;
}
```

### Edit Profile

```typescript
import { useUsers } from '../modules/users';
import { EditProfileModal } from '../modules/users/components/EditProfileModal';

export function EditProfileScreen() {
  const { profile, updateProfile, isUpdatingProfile } = useUsers();
  const [modalVisible, setModalVisible] = useState(false);

  return (
    <>
      <ProfileCard
        user={profile}
        onEditPress={() => setModalVisible(true)}
      />
      <EditProfileModal
        visible={modalVisible}
        user={profile}
        isLoading={isUpdatingProfile.isPending}
        onSave={(data) => {
          updateProfile.mutate(data);
          setModalVisible(false);
        }}
        onClose={() => setModalVisible(false)}
      />
    </>
  );
}
```

### Manage Preferences

```typescript
import { PreferencesPanel } from '../modules/users/components/PreferencesPanel';

export function PreferencesScreen() {
  const { preferences, updatePreferences } = useUsers();

  return (
    <PreferencesPanel
      preferences={preferences}
      onUpdate={(data) => updatePreferences.mutate(data)}
    />
  );
}
```

## Types

### User
```typescript
interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  phone?: string;
  birthDate?: string;
  emailVerified: boolean;
  phoneVerified: boolean;
  createdAt: string;
  updatedAt: string;
}
```

### UserPreferences
```typescript
interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  language: 'en' | 'es' | 'fr' | 'pt';
  notifications: {
    push: boolean;
    email: boolean;
    sms: boolean;
  };
  privacy: {
    showBirthDate: boolean;
    showPhoneNumber: boolean;
    shareActivityStatus: boolean;
  };
}
```

## Hook API (useUsers)

```typescript
const {
  // Profile
  profile: User | undefined,
  isLoadingProfile: boolean,
  profileError: Error | null,

  // Preferences
  preferences: UserPreferences | undefined,
  isLoadingPreferences: boolean,
  preferencesError: Error | null,

  // Profile mutations
  updateProfile: UseMutationResult,
  isUpdatingProfile: boolean,

  // Preferences mutations
  updatePreferences: UseMutationResult,
  isUpdatingPreferences: boolean,

  // Avatar mutations
  uploadAvatar: UseMutationResult,
  isUploadingAvatar: boolean,

  // Combined
  isLoading: boolean, // true if any query/mutation is loading
} = useUsers();
```

## Error Handling

```typescript
const { profile, profileError } = useUsers();

useEffect(() => {
  if (profileError) {
    Alert.alert('Error', profileError.message);
  }
}, [profileError]);
```

## Mutations

### Update Profile
```typescript
updateProfile.mutate({
  name: 'John Doe',
  phone: '+1-555-0123',
  birthDate: '1990-01-15',
});
```

### Update Preferences
```typescript
updatePreferences.mutate({
  theme: 'dark',
  notifications: { push: true, email: false, sms: false },
});
```

### Upload Avatar
```typescript
uploadAvatar.mutate({
  file: imageBlob,
  fileName: 'avatar.jpg',
});
```

## Testing

See `__tests__/useUsers.test.ts` for hook tests.

Run tests:
```bash
npm test useUsers
```

---

**Implementation Status:** ✅ COMPLETE (M2 Phase 1)  
**Last Updated:** 2026-09-15
