import { sosRepository } from '@data/sos/repositories/SosRepositoryImpl';
import type { SosEvent, TrustedContact } from '@domain/sos/entities/Sos';
import type { SosError } from '@domain/sos/repositories/SosRepository';
import { AppError } from '@shared/errors/AppError';
import { useQuery } from '@tanstack/react-query';

export const sosContactsQueryKey = () => ['sos', 'contacts'] as const;
export const sosHistoryQueryKey = () => ['sos', 'history'] as const;

function fail(error: SosError): never {
  throw new AppError(error.code, error.message, error.statusCode);
}

export const useTrustedContacts = () =>
  useQuery<TrustedContact[], AppError>({
    queryKey: sosContactsQueryKey(),
    queryFn: async () => {
      const result = await sosRepository.listContacts();
      if (!result.success) fail(result.error);
      return result.value;
    },
  });

export const useSosHistory = () =>
  useQuery<SosEvent[], AppError>({
    queryKey: sosHistoryQueryKey(),
    queryFn: async () => {
      const result = await sosRepository.history();
      if (!result.success) fail(result.error);
      return result.value;
    },
  });
