import type { RawResult } from '@data/api/client';
import { apiClient } from '@data/api/client';
import type { Phrase, PhraseContext, PhraseModule } from '@domain/phrases/entities/Phrase';
import type { PhraseRepository, PhraseResult } from '@domain/phrases/repositories/PhraseRepository';
import type { PhraseDto } from '../dtos/phraseDtos';
import { toPhrase } from '../mappers/phraseMappers';

const toError = (raw: Extract<RawResult<unknown>, { success: false }>) => ({
  code: raw.error.code,
  message: raw.error.message,
  statusCode: raw.error.statusCode ?? raw.status,
});

export class PhraseRepositoryImpl implements PhraseRepository {
  async getPhrase(module: PhraseModule, context: PhraseContext): Promise<PhraseResult<Phrase>> {
    const raw = await apiClient.getRaw<PhraseDto>(`/phrases?module=${module}&context=${context}`);
    if (!raw.success) return { success: false, error: toError(raw) };
    return { success: true, value: toPhrase(raw.data) };
  }
}

export const phraseRepository = new PhraseRepositoryImpl();
