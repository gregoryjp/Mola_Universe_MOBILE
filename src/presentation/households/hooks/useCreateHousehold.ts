import { householdRepository } from '@data/households/repositories/HouseholdRepositoryImpl';
import type { CreateHouseholdInput, Household } from '@domain/households/entities/Household';
import { AppError } from '@shared/errors/AppError';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { householdsQueryKey } from './useHouseholds';

export const useCreateHousehold = () => {
  const queryClient = useQueryClient();
  return useMutation<Household, AppError, CreateHouseholdInput>({
    mutationFn: async (input) => {
      const result = await householdRepository.createHousehold(input);
      if (!result.success) {
        throw new AppError(result.error.code, result.error.message, result.error.statusCode);
      }
      return result.value;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: householdsQueryKey });
    },
  });
};
