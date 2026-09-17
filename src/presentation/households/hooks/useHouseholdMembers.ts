import { householdRepository } from '@data/households/repositories/HouseholdRepositoryImpl';
import type { HouseholdMember } from '@domain/households/entities/Household';
import type { HouseholdError } from '@domain/households/repositories/HouseholdRepository';
import { AppError } from '@shared/errors/AppError';
import { useQuery } from '@tanstack/react-query';

export const householdMembersQueryKey = (householdId: string | null) =>
  ['households', householdId, 'members'] as const;

const noHousehold = (): AppError =>
  new AppError('NO_HOUSEHOLD', 'Selecciona un hogar para ver sus miembros', 400);

function fail(error: HouseholdError): never {
  throw new AppError(error.code, error.message, error.statusCode);
}

/**
 * Household members, with the names the backend joins from `User` (backend
 * TD-032). Screens that hold a bare `userId` — the recurring-expense turn —
 * use this to show a person instead of an id.
 */
export const useHouseholdMembers = (householdId: string | null) => {
  const query = useQuery<HouseholdMember[], AppError>({
    queryKey: householdMembersQueryKey(householdId),
    enabled: householdId !== null,
    queryFn: async () => {
      if (householdId === null) throw noHousehold();
      const result = await householdRepository.listMembers(householdId);
      if (!result.success) fail(result.error);
      return result.value;
    },
  });

  return { ...query, members: query.data ?? [] };
};

/**
 * Resolves a `userId` to a display name. Returns null when the member is not in
 * the list (an archived member, or the query has not answered yet), so callers
 * fall back to neutral copy instead of showing an id.
 */
export const memberNameById = (
  members: HouseholdMember[],
  userId: string | null,
): string | null => {
  if (userId === null) return null;
  return members.find((member) => member.userId === userId)?.name ?? null;
};
