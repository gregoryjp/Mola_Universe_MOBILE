import type { Phrase } from '@domain/phrases/entities/Phrase';
import type { PhraseDto } from '../dtos/phraseDtos';

export const toPhrase = (dto: PhraseDto): Phrase => ({
  module: dto.module,
  context: dto.context,
  text: dto.text,
});
