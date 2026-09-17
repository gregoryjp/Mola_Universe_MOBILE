import { sosRepository } from '@data/sos/repositories/SosRepositoryImpl';
import type {
  ActivatedSosEvent,
  ActivateSosInput,
  CreateTrustedContactInput,
  SosEvent,
  TrustedContact,
} from '@domain/sos/entities/Sos';
import type { SosResult } from '@domain/sos/repositories/SosRepository';
import { AppError } from '@shared/errors/AppError';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { sosContactsQueryKey, sosHistoryQueryKey } from './useSos';

const unwrap = <T>(result: SosResult<T>): T => {
  if (!result.success) {
    throw new AppError(result.error.code, result.error.message, result.error.statusCode);
  }
  return result.value;
};

const ensureVoid = (result: SosResult<void>): void => {
  if (!result.success) {
    throw new AppError(result.error.code, result.error.message, result.error.statusCode);
  }
};

export const useCreateTrustedContact = () => {
  const queryClient = useQueryClient();

  return useMutation<TrustedContact, AppError, CreateTrustedContactInput>({
    mutationFn: async (input) => unwrap(await sosRepository.createContact(input)),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: sosContactsQueryKey() });
    },
  });
};

export const useResendContactInvite = () => {
  const queryClient = useQueryClient();

  return useMutation<TrustedContact, AppError, string>({
    mutationFn: async (contactId) => unwrap(await sosRepository.resendContactInvite(contactId)),
    onSuccess: () => {
      // The backend rotates the verification token and its expiry, so the cached
      // list is stale in a way an optimistic patch could not express.
      void queryClient.invalidateQueries({ queryKey: sosContactsQueryKey() });
    },
  });
};

export const useDeleteTrustedContact = () => {
  const queryClient = useQueryClient();

  return useMutation<void, AppError, string>({
    mutationFn: async (contactId) => ensureVoid(await sosRepository.deleteContact(contactId)),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: sosContactsQueryKey() });
    },
  });
};

export const useActivateSos = () => {
  const queryClient = useQueryClient();

  return useMutation<ActivatedSosEvent, AppError, ActivateSosInput>({
    mutationFn: async (input) => unwrap(await sosRepository.activate(input)),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: sosHistoryQueryKey() });
    },
  });
};

export const useCancelSos = () => {
  const queryClient = useQueryClient();

  return useMutation<SosEvent, AppError, string>({
    mutationFn: async (sosEventId) => unwrap(await sosRepository.cancel(sosEventId)),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: sosHistoryQueryKey() });
    },
  });
};
