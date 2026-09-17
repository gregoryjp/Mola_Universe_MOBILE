// Mirrors the backend moments payloads (modules/moments/services/moment*Service.ts).

export interface MomentDto {
  id: string;
  householdId: string;
  createdBy: string;
  type: string;
  title: string;
  description?: string | null;
  eventDate?: string | null;
  detail?: string | null;
  status: string;
  calendarEventId?: string | null;
  createdAt: string;
  updatedAt: string;
}

/** `GET /households/:householdId/moments/:momentId` only. */
export interface MomentDetailDto extends MomentDto {
  participants: MomentParticipantDto[];
}

export interface MomentParticipantDto {
  id: string;
  momentId: string;
  userId: string;
  response: string;
  respondedAt?: string | null;
}

export interface MomentExternalInviteDto {
  id: string;
  momentId: string;
  email: string;
  name?: string | null;
  isMolaUser: boolean;
  status: string;
  invitedAt: string;
  respondedAt?: string | null;
}

export interface CreateMomentRequestDto {
  type: string;
  title: string;
  description?: string;
  eventDate?: string;
  detail?: string;
  participantUserIds?: string[];
}

export interface UpdateMomentRequestDto {
  title?: string;
  description?: string;
  eventDate?: string;
  detail?: string;
  status?: string;
}

export interface RespondToMomentRequestDto {
  response: string;
}

export interface CreateExternalInviteRequestDto {
  email: string;
  name?: string;
}
