import { householdRepository } from '@data/households/repositories/HouseholdRepositoryImpl';
import type { Household } from '@domain/households/entities/Household';
import { AppError } from '@shared/errors/AppError';
import { useQuery } from '@tanstack/react-query';

export const householdsQueryKey = ['households'] as const;

/** `enabled` lets callers (e.g. the default-household bootstrap) hold the query
 * back until there is an authenticated session. */
export const useHouseholds = (options?: { enabled?: boolean }) =>
  useQuery<Household[], AppError>({
    queryKey: householdsQueryKey,
    enabled: options?.enabled ?? true,
    queryFn: async () => {
      const result = await householdRepository.listMyHouseholds();
      if (!result.success) {
        throw new AppError(result.error.code, result.error.message, result.error.statusCode);
      }
      return result.value;
    },
  });
