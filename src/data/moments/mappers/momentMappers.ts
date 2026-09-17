import type {
  CreateExternalInviteInput,
  CreateMomentInput,
  InviteStatus,
  Moment,
  MomentDetail,
  MomentExternalInvite,
  MomentParticipant,
  MomentRsvp,
  MomentStatus,
  MomentType,
  ParticipantResponse,
  UpdateMomentInput,
} from '@domain/moments/entities/Moment';
import type {
  CreateExternalInviteRequestDto,
  CreateMomentRequestDto,
  MomentDetailDto,
  MomentDto,
  MomentExternalInviteDto,
  MomentParticipantDto,
  RespondToMomentRequestDto,
  UpdateMomentRequestDto,
} from '../dtos/momentDtos';

export const toMoment = (dto: MomentDto): Moment => ({
  id: dto.id,
  householdId: dto.householdId,
  createdBy: dto.createdBy,
  type: dto.type as MomentType,
  title: dto.title,
  description: dto.description ?? null,
  eventDate: dto.eventDate ?? null,
  detail: dto.detail ?? null,
  status: dto.status as MomentStatus,
  calendarEventId: dto.calendarEventId ?? null,
  createdAt: dto.createdAt,
  updatedAt: dto.updatedAt,
});

export const toMomentDetail = (dto: MomentDetailDto): MomentDetail => ({
  ...toMoment(dto),
  participants: dto.participants.map(toMomentParticipant),
});

export const toMomentParticipant = (dto: MomentParticipantDto): MomentParticipant => ({
  id: dto.id,
  momentId: dto.momentId,
  userId: dto.userId,
  response: dto.response as ParticipantResponse,
  respondedAt: dto.respondedAt ?? null,
});

export const toMomentExternalInvite = (dto: MomentExternalInviteDto): MomentExternalInvite => ({
  id: dto.id,
  momentId: dto.momentId,
  email: dto.email,
  name: dto.name ?? null,
  isMolaUser: dto.isMolaUser,
  status: dto.status as InviteStatus,
  invitedAt: dto.invitedAt,
  respondedAt: dto.respondedAt ?? null,
});

// The backend schemas are all `additionalProperties: false`, so an optional
// field is only sent when the caller actually defined it.

export const toCreateMomentRequest = (input: CreateMomentInput): CreateMomentRequestDto => ({
  type: input.type,
  title: input.title,
  ...(input.description !== undefined && { description: input.description }),
  ...(input.eventDate !== undefined && { eventDate: input.eventDate }),
  ...(input.detail !== undefined && { detail: input.detail }),
  ...(input.participantUserIds !== undefined && {
    participantUserIds: input.participantUserIds,
  }),
});

export const toUpdateMomentRequest = (input: UpdateMomentInput): UpdateMomentRequestDto => ({
  ...(input.title !== undefined && { title: input.title }),
  ...(input.description !== undefined && { description: input.description }),
  ...(input.eventDate !== undefined && { eventDate: input.eventDate }),
  ...(input.detail !== undefined && { detail: input.detail }),
  ...(input.status !== undefined && { status: input.status }),
});

export const toRespondToMomentRequest = (response: MomentRsvp): RespondToMomentRequestDto => ({
  response,
});

export const toCreateExternalInviteRequest = (
  input: CreateExternalInviteInput,
): CreateExternalInviteRequestDto => ({
  email: input.email,
  ...(input.name !== undefined && { name: input.name }),
});
