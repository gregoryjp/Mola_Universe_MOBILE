import { householdRepository } from '@data/households/repositories/HouseholdRepositoryImpl';
import type { Household } from '@domain/households/entities/Household';
import { AppError } from '@shared/errors/AppError';
import { useQuery } from '@tanstack/react-query';

export const householdsQueryKey = ['households'] as const;

export const useHouseholds = () =>
  useQuery<Household[], AppError>({
    queryKey: householdsQueryKey,
    queryFn: async () => {
      const result = await householdRepository.listMyHouseholds();
      if (!result.success) {
        throw new AppError(result.error.code, result.error.message, result.error.statusCode);
      }
      return result.value;
    },
  });
