import { authRepository } from '@data/auth/repositories/AuthRepositoryImpl';
import type { User } from '@domain/auth/entities/User';
import type { AuthError, UpdateProfilePayload } from '@domain/auth/repositories/AuthRepository';
import { useAuthStore } from '@shared/store/authStore';
import { useMutation } from '@tanstack/react-query';

export const useUpdateProfile = () => {
  const updateUser = useAuthStore((state) => state.updateUser);

  return useMutation<User, AuthError, UpdateProfilePayload>({
    mutationFn: async (payload) => {
      const result = await authRepository.updateProfile(payload);
      if (!result.success) throw result.error;
      return result.value;
    },
    onSuccess: (user) => {
      // `toProfileUser` computes `name` from `displayName` first, so this is
      // the same string just persisted — keeps the UI consistent without a
      // refetch.
      updateUser({ name: user.name });
    },
  });
};
