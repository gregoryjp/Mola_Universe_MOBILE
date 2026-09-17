import { momentRepository } from '@data/moments/repositories/MomentRepositoryImpl';
import type {
  CreateExternalInviteInput,
  CreateMomentInput,
  Moment,
  MomentExternalInvite,
  MomentParticipant,
  MomentRsvp,
  UpdateMomentInput,
} from '@domain/moments/entities/Moment';
import type { MomentResult } from '@domain/moments/repositories/MomentRepository';
import { AppError } from '@shared/errors/AppError';
import { useHouseholdStore } from '@shared/store/householdStore';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { momentInvitesQueryKey, momentQueryKey, momentsQueryKey } from './useMoments';

const noHousehold = (): AppError =>
  new AppError('NO_HOUSEHOLD', 'Selecciona un hogar para gestionar sus momentos', 400);

const unwrap = <T>(result: MomentResult<T>): T => {
  if (!result.success) {
    throw new AppError(result.error.code, result.error.message, result.error.statusCode);
  }
  return result.value;
};

const useInvalidateMoments = () => {
  const queryClient = useQueryClient();
  const householdId = useHouseholdStore((state) => state.activeHouseholdId);
  return () => {
    void queryClient.invalidateQueries({ queryKey: momentsQueryKey(householdId) });
  };
};

export const useCreateMoment = () => {
  const householdId = useHouseholdStore((state) => state.activeHouseholdId);
  const invalidate = useInvalidateMoments();

  return useMutation<Moment, AppError, CreateMomentInput>({
    mutationFn: async (input) => {
      if (householdId === null) throw noHousehold();
      return unwrap(await momentRepository.createMoment(householdId, input));
    },
    onSuccess: invalidate,
  });
};

export const useUpdateMoment = (momentId: string) => {
  const householdId = useHouseholdStore((state) => state.activeHouseholdId);
  const queryClient = useQueryClient();
  const invalidate = useInvalidateMoments();

  return useMutation<Moment, AppError, UpdateMomentInput>({
    mutationFn: async (input) => {
      if (householdId === null) throw noHousehold();
      return unwrap(await momentRepository.updateMoment(householdId, momentId, input));
    },
    onSuccess: () => {
      invalidate();
      void queryClient.invalidateQueries({ queryKey: momentQueryKey(momentId) });
    },
  });
};

export const useDeleteMoment = () => {
  const householdId = useHouseholdStore((state) => state.activeHouseholdId);
  const queryClient = useQueryClient();
  const invalidate = useInvalidateMoments();

  return useMutation<void, AppError, string>({
    mutationFn: async (momentId) => {
      if (householdId === null) throw noHousehold();
      const result = await momentRepository.deleteMoment(householdId, momentId);
      if (!result.success) {
        throw new AppError(result.error.code, result.error.message, result.error.statusCode);
      }
    },
    onSuccess: (_void, momentId) => {
      invalidate();
      void queryClient.removeQueries({ queryKey: momentQueryKey(momentId) });
      void queryClient.removeQueries({ queryKey: momentInvitesQueryKey(momentId) });
    },
  });
};

/** RSVP. The backend only accepts GOING and NOT_GOING. */
export const useRespondToMoment = (momentId: string) => {
  const householdId = useHouseholdStore((state) => state.activeHouseholdId);
  const queryClient = useQueryClient();

  return useMutation<MomentParticipant, AppError, MomentRsvp>({
    mutationFn: async (response) => {
      if (householdId === null) throw noHousehold();
      return unwrap(await momentRepository.respondToMoment(householdId, momentId, response));
    },
    onSuccess: () => {
      // The participants live inside the detail payload, so refresh that.
      void queryClient.invalidateQueries({ queryKey: momentQueryKey(momentId) });
    },
  });
};

export const useCreateMomentExternalInvite = (momentId: string) => {
  const householdId = useHouseholdStore((state) => state.activeHouseholdId);
  const queryClient = useQueryClient();

  return useMutation<MomentExternalInvite, AppError, CreateExternalInviteInput>({
    mutationFn: async (input) => {
      if (householdId === null) throw noHousehold();
      return unwrap(await momentRepository.createExternalInvite(householdId, momentId, input));
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: momentInvitesQueryKey(momentId) });
    },
  });
};
