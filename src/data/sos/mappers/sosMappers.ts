import type {
  ActivatedSosEvent,
  ActivateSosInput,
  CreateTrustedContactInput,
  SosEvent,
  SosEventStatus,
  TrustedContact,
} from '@domain/sos/entities/Sos';
import type {
  ActivatedSosEventDto,
  ActivateSosRequestDto,
  CancelSosRequestDto,
  CreateTrustedContactRequestDto,
  SosEventDto,
  TrustedContactDto,
} from '../dtos/sosDtos';

export const toTrustedContact = (dto: TrustedContactDto): TrustedContact => ({
  id: dto.id,
  name: dto.name,
  email: dto.email,
  phone: dto.phone ?? null,
  isMolaUser: dto.isMolaUser,
  pushEnabled: dto.pushEnabled,
  verified: dto.verified,
  createdAt: dto.createdAt,
});

export const toSosEvent = (dto: SosEventDto): SosEvent => ({
  id: dto.id,
  status: dto.status as SosEventStatus,
  message: dto.message ?? null,
  locationLat: dto.locationLat ?? null,
  locationLng: dto.locationLng ?? null,
  activatedAt: dto.activatedAt,
  dispatchedAt: dto.dispatchedAt ?? null,
  cancelledAt: dto.cancelledAt ?? null,
});

export const toActivatedSosEvent = (dto: ActivatedSosEventDto): ActivatedSosEvent => ({
  ...toSosEvent(dto),
  cancelWindowMs: dto.cancelWindowMs,
});

export const toCreateTrustedContactRequest = (
  input: CreateTrustedContactInput,
): CreateTrustedContactRequestDto => ({
  name: input.name,
  email: input.email,
  ...(input.phone !== undefined && { phone: input.phone }),
});

export const toActivateSosRequest = (input: ActivateSosInput): ActivateSosRequestDto => ({
  ...(input.message !== undefined && { message: input.message }),
  ...(input.locationLat !== undefined && { locationLat: input.locationLat }),
  ...(input.locationLng !== undefined && { locationLng: input.locationLng }),
});

export const toCancelSosRequest = (sosEventId: string): CancelSosRequestDto => ({ sosEventId });
