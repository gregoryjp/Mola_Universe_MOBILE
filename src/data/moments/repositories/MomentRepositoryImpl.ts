import type { RawResult } from '@data/api/client';
import { apiClient } from '@data/api/client';
import type {
  CreateExternalInviteInput,
  CreateMomentInput,
  Moment,
  MomentDetail,
  MomentExternalInvite,
  MomentParticipant,
  MomentRsvp,
  UpdateMomentInput,
} from '@domain/moments/entities/Moment';
import type { MomentRepository, MomentResult } from '@domain/moments/repositories/MomentRepository';
import type {
  CreateExternalInviteRequestDto,
  CreateMomentRequestDto,
  MomentDetailDto,
  MomentDto,
  MomentExternalInviteDto,
  MomentParticipantDto,
  UpdateMomentRequestDto,
} from '../dtos/momentDtos';
import {
  toCreateExternalInviteRequest,
  toCreateMomentRequest,
  toMoment,
  toMomentDetail,
  toMomentExternalInvite,
  toMomentParticipant,
  toRespondToMomentRequest,
  toUpdateMomentRequest,
} from '../mappers/momentMappers';

const toError = (raw: Extract<RawResult<unknown>, { success: false }>) => ({
  code: raw.error.code,
  message: raw.error.message,
  statusCode: raw.error.statusCode ?? raw.status,
});

const toResult = <TD, T>(raw: RawResult<TD>, map: (dto: TD) => T): MomentResult<T> =>
  raw.success ? { success: true, value: map(raw.data) } : { success: false, error: toError(raw) };

const toList = <TD, T>(raw: RawResult<TD[]>, map: (dto: TD) => T): MomentResult<T[]> =>
  raw.success
    ? { success: true, value: raw.data.map(map) }
    : { success: false, error: toError(raw) };

const emptyOk = (): MomentResult<void> => ({ success: true, value: undefined });

const momentsPath = (householdId: string): string => `/households/${householdId}/moments`;

export class MomentRepositoryImpl implements MomentRepository {
  async listMoments(householdId: string): Promise<MomentResult<Moment[]>> {
    return toList(await apiClient.getRaw<MomentDto[]>(momentsPath(householdId)), toMoment);
  }

  async getMoment(householdId: string, momentId: string): Promise<MomentResult<MomentDetail>> {
    const raw = await apiClient.getRaw<MomentDetailDto>(`${momentsPath(householdId)}/${momentId}`);
    return toResult(raw, toMomentDetail);
  }

  async createMoment(householdId: string, input: CreateMomentInput): Promise<MomentResult<Moment>> {
    const body: CreateMomentRequestDto = toCreateMomentRequest(input);
    const raw = await apiClient.postRaw<MomentDto>(momentsPath(householdId), body);
    return toResult(raw, toMoment);
  }

  async updateMoment(
    householdId: string,
    momentId: string,
    input: UpdateMomentInput,
  ): Promise<MomentResult<Moment>> {
    const body: UpdateMomentRequestDto = toUpdateMomentRequest(input);
    const raw = await apiClient.patchRaw<MomentDto>(
      `${momentsPath(householdId)}/${momentId}`,
      body,
    );
    return toResult(raw, toMoment);
  }

  async deleteMoment(householdId: string, momentId: string): Promise<MomentResult<void>> {
    const raw = await apiClient.deleteRaw<void>(`${momentsPath(householdId)}/${momentId}`);
    return raw.success ? emptyOk() : { success: false, error: toError(raw) };
  }

  async respondToMoment(
    householdId: string,
    momentId: string,
    response: MomentRsvp,
  ): Promise<MomentResult<MomentParticipant>> {
    const raw = await apiClient.postRaw<MomentParticipantDto>(
      `${momentsPath(householdId)}/${momentId}/respond`,
      toRespondToMomentRequest(response),
    );
    return toResult(raw, toMomentParticipant);
  }

  async listExternalInvites(
    householdId: string,
    momentId: string,
  ): Promise<MomentResult<MomentExternalInvite[]>> {
    return toList(
      await apiClient.getRaw<MomentExternalInviteDto[]>(
        `${momentsPath(householdId)}/${momentId}/invites`,
      ),
      toMomentExternalInvite,
    );
  }

  async createExternalInvite(
    householdId: string,
    momentId: string,
    input: CreateExternalInviteInput,
  ): Promise<MomentResult<MomentExternalInvite>> {
    const body: CreateExternalInviteRequestDto = toCreateExternalInviteRequest(input);
    const raw = await apiClient.postRaw<MomentExternalInviteDto>(
      `${momentsPath(householdId)}/${momentId}/invites`,
      body,
    );
    return toResult(raw, toMomentExternalInvite);
  }
}

export const momentRepository: MomentRepository = new MomentRepositoryImpl();
