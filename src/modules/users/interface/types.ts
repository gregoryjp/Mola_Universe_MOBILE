export interface User {
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

export interface UserPreferences {
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

export interface UpdateProfileRequest {
  name?: string;
  phone?: string;
  birthDate?: string;
  avatar?: string;
}

export interface UpdateProfileResponse {
  user: User;
}

export interface UpdatePreferencesRequest {
  theme?: 'light' | 'dark' | 'system';
  language?: 'en' | 'es' | 'fr' | 'pt';
  notifications?: Partial<UserPreferences['notifications']>;
  privacy?: Partial<UserPreferences['privacy']>;
}

export interface UpdatePreferencesResponse {
  preferences: UserPreferences;
}

export interface FetchProfileResponse {
  user: User;
}

export interface FetchPreferencesResponse {
  preferences: UserPreferences;
}

export interface UploadAvatarRequest {
  file: File | Blob;
  fileName: string;
}

export interface UploadAvatarResponse {
  url: string;
  fileName: string;
}
