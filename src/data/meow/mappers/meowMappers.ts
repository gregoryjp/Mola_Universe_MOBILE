import type { MeowCapabilityResult } from '@domain/meow/entities/Meow';
import type { MeowCapabilityResponseDto } from '../dtos/meowDtos';

/** `phrase` is optional in the DTO, so it is normalised to `null` here. */
export const toMeowCapabilityResult = (dto: MeowCapabilityResponseDto): MeowCapabilityResult => ({
  capability: dto.capability,
  message: dto.message,
  data: dto.data,
  phrase: dto.phrase ?? null,
});
