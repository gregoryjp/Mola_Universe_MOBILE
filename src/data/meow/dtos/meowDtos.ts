import type { MeowCapability } from '@domain/meow/entities/Meow';

/** Mirrors the backend `IMeowCapabilityResponse` (modules/meow/interface/ICapability.ts). */
export interface MeowCapabilityResponseDto {
  capability: MeowCapability;
  message: string;
  data: unknown;
  phrase?: string;
}
