import type {
  CreateHouseholdInput,
  Household,
  HouseholdMember,
} from '@domain/households/entities/Household';
import type {
  CreateHouseholdRequestDto,
  HouseholdDto,
  HouseholdMemberDto,
} from '../dtos/householdDtos';

export const toHousehold = (dto: HouseholdDto): Household => ({
  id: dto.id,
  name: dto.name,
  description: dto.description ?? null,
  ownerId: dto.ownerId,
  memberCount: dto.memberCount,
  createdAt: dto.createdAt,
});

export const toCreateHouseholdRequest = (
  input: CreateHouseholdInput,
): CreateHouseholdRequestDto => ({
  name: input.name,
  ...(input.description !== undefined && { description: input.description }),
});

export const toHouseholdMember = (dto: HouseholdMemberDto): HouseholdMember => ({
  id: dto.id,
  userId: dto.userId,
  name: dto.name,
  email: dto.email,
  role: dto.role,
  joinedAt: dto.joinedAt,
});
