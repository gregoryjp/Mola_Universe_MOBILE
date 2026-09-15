import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../../shared/api/api-client';
import {
  User,
  UserPreferences,
  UpdateProfileRequest,
  UpdateProfileResponse,
  UpdatePreferencesRequest,
  UpdatePreferencesResponse,
  FetchProfileResponse,
  FetchPreferencesResponse,
  UploadAvatarRequest,
  UploadAvatarResponse,
} from '../interface/types';

const USERS_QUERY_KEY = 'users';

async function fetchProfile(): Promise<User> {
  const response = await apiClient.get<FetchProfileResponse>('/users/profile');
  return response.data.user;
}

async function updateProfile(data: UpdateProfileRequest): Promise<User> {
  const response = await apiClient.patch<UpdateProfileResponse>(
    '/users/profile',
    data
  );
  return response.data.user;
}

async function fetchPreferences(): Promise<UserPreferences> {
  const response = await apiClient.get<FetchPreferencesResponse>(
    '/users/preferences'
  );
  return response.data.preferences;
}

async function updatePreferences(
  data: UpdatePreferencesRequest
): Promise<UserPreferences> {
  const response = await apiClient.patch<UpdatePreferencesResponse>(
    '/users/preferences',
    data
  );
  return response.data.preferences;
}

async function uploadAvatar(request: UploadAvatarRequest): Promise<string> {
  const formData = new FormData();
  formData.append('file', request.file);
  formData.append('fileName', request.fileName);

  const response = await apiClient.post<UploadAvatarResponse>(
    '/users/avatar',
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );
  return response.data.url;
}

export function useUsers() {
  const queryClient = useQueryClient();

  const profileQuery = useQuery({
    queryKey: [USERS_QUERY_KEY, 'profile'],
    queryFn: fetchProfile,
  });

  const preferencesQuery = useQuery({
    queryKey: [USERS_QUERY_KEY, 'preferences'],
    queryFn: fetchPreferences,
  });

  const updateProfileMutation = useMutation({
    mutationFn: updateProfile,
    onSuccess: (updatedUser) => {
      queryClient.setQueryData([USERS_QUERY_KEY, 'profile'], updatedUser);
    },
  });

  const updatePreferencesMutation = useMutation({
    mutationFn: updatePreferences,
    onSuccess: (updatedPreferences) => {
      queryClient.setQueryData(
        [USERS_QUERY_KEY, 'preferences'],
        updatedPreferences
      );
    },
  });

  const uploadAvatarMutation = useMutation({
    mutationFn: uploadAvatar,
    onSuccess: (avatarUrl) => {
      const currentProfile = queryClient.getQueryData<User>([
        USERS_QUERY_KEY,
        'profile',
      ]);
      if (currentProfile) {
        queryClient.setQueryData([USERS_QUERY_KEY, 'profile'], {
          ...currentProfile,
          avatar: avatarUrl,
        });
      }
    },
  });

  return {
    // Profile queries
    profile: profileQuery.data,
    isLoadingProfile: profileQuery.isLoading,
    profileError: profileQuery.error,

    // Preferences queries
    preferences: preferencesQuery.data,
    isLoadingPreferences: preferencesQuery.isLoading,
    preferencesError: preferencesQuery.error,

    // Profile mutations
    updateProfile: updateProfileMutation,
    isUpdatingProfile: updateProfileMutation.isPending,

    // Preferences mutations
    updatePreferences: updatePreferencesMutation,
    isUpdatingPreferences: updatePreferencesMutation.isPending,

    // Avatar mutations
    uploadAvatar: uploadAvatarMutation,
    isUploadingAvatar: uploadAvatarMutation.isPending,

    // Combined loading state
    isLoading:
      profileQuery.isLoading ||
      preferencesQuery.isLoading ||
      updateProfileMutation.isPending ||
      updatePreferencesMutation.isPending ||
      uploadAvatarMutation.isPending,
  };
}
