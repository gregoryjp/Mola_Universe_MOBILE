import type { Phrase, PhraseContext, PhraseModule } from '../entities/Phrase';

/** Typed error forwarded from the backend (ADR-0010). */
export interface PhraseError {
  code: string;
  message: string;
  statusCode: number;
}

export type PhraseResult<T> = { success: true; value: T } | { success: false; error: PhraseError };

/**
 * Phrase bank port. Maps 1:1 to `GET /phrases?module=&context=`
 * (modules/phrases/routes/phraseRoutes.ts, 200 with the DTO raw).
 *
 * The bank holds no LLM tokens: the backend picks an entry by day of week, so
 * the same request returns the same text within a day and needs no persistence
 * on the client.
 */
export interface PhraseRepository {
  getPhrase(module: PhraseModule, context: PhraseContext): Promise<PhraseResult<Phrase>>;
}
