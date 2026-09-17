import { momentRepository } from '@data/moments/repositories/MomentRepositoryImpl';
import type { Moment, MomentDetail, MomentExternalInvite } from '@domain/moments/entities/Moment';
import { AppError } from '@shared/errors/AppError';
import { useHouseholdStore } from '@shared/store/householdStore';
import { useQuery } from '@tanstack/react-query';

export const momentsQueryKey = (householdId: string | null) =>
  ['moments', 'list', householdId] as const;
export const momentQueryKey = (momentId: string) => ['moments', 'detail', momentId] as const;
export const momentInvitesQueryKey = (momentId: string) =>
  ['moments', 'invites', momentId] as const;

const noHousehold = (): AppError =>
  new AppError('NO_HOUSEHOLD', 'Selecciona un hogar para ver sus momentos', 400);

/** The backend returns a flat array with no pagination (verified in momentService). */
export const useMoments = () => {
  const householdId = useHouseholdStore((state) => state.activeHouseholdId);

  return useQuery<Moment[], AppError>({
    queryKey: momentsQueryKey(householdId),
    enabled: householdId !== null,
    queryFn: async () => {
      if (householdId === null) throw noHousehold();
      const result = await momentRepository.listMoments(householdId);
      if (!result.success) {
        throw new AppError(result.error.code, result.error.message, result.error.statusCode);
      }
      return result.value;
    },
  });
};

export const useMoment = (momentId: string) => {
  const householdId = useHouseholdStore((state) => state.activeHouseholdId);

  return useQuery<MomentDetail, AppError>({
    queryKey: momentQueryKey(momentId),
    enabled: householdId !== null && momentId.length > 0,
    queryFn: async () => {
      if (householdId === null) throw noHousehold();
      const result = await momentRepository.getMoment(householdId, momentId);
      if (!result.success) {
        throw new AppError(result.error.code, result.error.message, result.error.statusCode);
      }
      return result.value;
    },
  });
};

export const useMomentExternalInvites = (momentId: string) => {
  const householdId = useHouseholdStore((state) => state.activeHouseholdId);

  return useQuery<MomentExternalInvite[], AppError>({
    queryKey: momentInvitesQueryKey(momentId),
    enabled: householdId !== null && momentId.length > 0,
    queryFn: async () => {
      if (householdId === null) throw noHousehold();
      const result = await momentRepository.listExternalInvites(householdId, momentId);
      if (!result.success) {
        throw new AppError(result.error.code, result.error.message, result.error.statusCode);
      }
      return result.value;
    },
  });
};
