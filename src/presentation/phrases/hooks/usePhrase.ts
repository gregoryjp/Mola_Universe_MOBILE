import { phraseRepository } from '@data/phrases/repositories/PhraseRepositoryImpl';
import type { Phrase, PhraseContext, PhraseModule } from '@domain/phrases/entities/Phrase';
import { AppError } from '@shared/errors/AppError';
import { useQuery } from '@tanstack/react-query';

export const phraseQueryKey = (module: PhraseModule, context: PhraseContext) =>
  ['phrases', module, context] as const;

function fail(error: { code: string; message: string; statusCode: number }): never {
  throw new AppError(error.code, error.message, error.statusCode);
}

/**
 * Reads an encouraging line from the phrase bank. Transversal by design: the
 * module and the context are the caller's decision, so one hook serves every
 * screen instead of each module owning its own copy.
 */
export const usePhrase = (module: PhraseModule, context: PhraseContext) => {
  const query = useQuery<Phrase, AppError>({
    queryKey: phraseQueryKey(module, context),
    queryFn: async () => {
      const result = await phraseRepository.getPhrase(module, context);
      if (!result.success) fail(result.error);
      return result.value;
    },
  });

  return { ...query, phrase: query.data ?? null };
};
