import type { RawResult } from '@data/api/client';
import { apiClient } from '@data/api/client';
import type {
  MeowCapability,
  MeowCapabilityParams,
  MeowCapabilityResult,
} from '@domain/meow/entities/Meow';
import type { MeowRepository, MeowResult } from '@domain/meow/repositories/MeowRepository';
import type { MeowCapabilityResponseDto } from '../dtos/meowDtos';
import { toMeowCapabilityResult } from '../mappers/meowMappers';

const toError = (raw: Extract<RawResult<unknown>, { success: false }>) => ({
  code: raw.error.code,
  message: raw.error.message,
  statusCode: raw.error.statusCode ?? raw.status,
});

export class MeowRepositoryImpl implements MeowRepository {
  async executeCapability(
    capability: MeowCapability,
    params: MeowCapabilityParams,
  ): Promise<MeowResult<MeowCapabilityResult>> {
    const raw = await apiClient.postRaw<MeowCapabilityResponseDto>(
      `/meow/capabilities/${capability}`,
      { params },
    );
    if (!raw.success) return { success: false, error: toError(raw) };
    return { success: true, value: toMeowCapabilityResult(raw.data) };
  }
}

export const meowRepository = new MeowRepositoryImpl();
