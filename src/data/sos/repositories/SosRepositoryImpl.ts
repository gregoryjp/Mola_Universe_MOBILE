import type { RawResult } from '@data/api/client';
import { apiClient } from '@data/api/client';
import type {
  ActivatedSosEvent,
  ActivateSosInput,
  CreateTrustedContactInput,
  SosEvent,
  TrustedContact,
} from '@domain/sos/entities/Sos';
import type { SosRepository, SosResult } from '@domain/sos/repositories/SosRepository';
import type {
  ActivatedSosEventDto,
  ActivateSosRequestDto,
  CancelSosRequestDto,
  CreateTrustedContactRequestDto,
  SosEventDto,
  TrustedContactDto,
} from '../dtos/sosDtos';
import {
  toActivatedSosEvent,
  toActivateSosRequest,
  toCancelSosRequest,
  toCreateTrustedContactRequest,
  toSosEvent,
  toTrustedContact,
} from '../mappers/sosMappers';

const toError = (raw: Extract<RawResult<unknown>, { success: false }>) => ({
  code: raw.error.code,
  message: raw.error.message,
  statusCode: raw.error.statusCode ?? raw.status,
});

const toResult = <TD, T>(raw: RawResult<TD>, map: (dto: TD) => T): SosResult<T> =>
  raw.success ? { success: true, value: map(raw.data) } : { success: false, error: toError(raw) };

export class SosRepositoryImpl implements SosRepository {
  async listContacts(): Promise<SosResult<TrustedContact[]>> {
    const raw = await apiClient.getRaw<TrustedContactDto[]>('/sos/contacts');
    return raw.success
      ? { success: true, value: raw.data.map(toTrustedContact) }
      : { success: false, error: toError(raw) };
  }

  async createContact(input: CreateTrustedContactInput): Promise<SosResult<TrustedContact>> {
    const body: CreateTrustedContactRequestDto = toCreateTrustedContactRequest(input);
    const raw = await apiClient.postRaw<TrustedContactDto>('/sos/contacts', body);
    return toResult(raw, toTrustedContact);
  }

  async deleteContact(contactId: string): Promise<SosResult<void>> {
    const raw = await apiClient.deleteRaw<void>(`/sos/contacts/${contactId}`);
    return raw.success
      ? { success: true, value: undefined }
      : { success: false, error: toError(raw) };
  }

  async activate(input: ActivateSosInput): Promise<SosResult<ActivatedSosEvent>> {
    const body: ActivateSosRequestDto = toActivateSosRequest(input);
    const raw = await apiClient.postRaw<ActivatedSosEventDto>('/sos/activate', body);
    return toResult(raw, toActivatedSosEvent);
  }

  async cancel(sosEventId: string): Promise<SosResult<SosEvent>> {
    const body: CancelSosRequestDto = toCancelSosRequest(sosEventId);
    const raw = await apiClient.postRaw<SosEventDto>('/sos/cancel', body);
    return toResult(raw, toSosEvent);
  }

  async history(): Promise<SosResult<SosEvent[]>> {
    const raw = await apiClient.getRaw<SosEventDto[]>('/sos/history');
    return raw.success
      ? { success: true, value: raw.data.map(toSosEvent) }
      : { success: false, error: toError(raw) };
  }
}

export const sosRepository: SosRepository = new SosRepositoryImpl();
