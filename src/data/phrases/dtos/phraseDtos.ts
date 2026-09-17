import type { PhraseContext, PhraseModule } from '@domain/phrases/entities/Phrase';

/** Mirrors the backend `IPhraseDTO` (modules/phrases/interface/IPhrase.ts). */
export interface PhraseDto {
  module: PhraseModule;
  context: PhraseContext;
  text: string;
}
