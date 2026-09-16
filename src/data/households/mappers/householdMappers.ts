import type { Household } from '@domain/households/entities/Household';
import type { HouseholdDto } from '../dtos/householdDtos';

export const toHousehold = (dto: HouseholdDto): Household => ({
  id: dto.id,
  name: dto.name,
  description: dto.description ?? null,
  ownerId: dto.ownerId,
  memberCount: dto.memberCount,
  createdAt: dto.createdAt,
});
