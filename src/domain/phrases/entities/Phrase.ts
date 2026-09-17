/**
 * Mirrors the backend `PhraseModule` / `PhraseContext` unions
 * (modules/phrases/interface/IPhrase.ts).
 *
 * `MOVE`, `ENGLISH`, `DIARY` and `SOS` are mirrored for contract fidelity: the
 * bank is populated for all six modules, but Mobile only has screens for
 * `TASKS` and `SAVINGS` today.
 */
export type PhraseModule = 'TASKS' | 'SAVINGS' | 'MOVE' | 'ENGLISH' | 'DIARY' | 'SOS';

export type PhraseContext = 'DAY_START' | 'DAY_END' | 'STREAK' | 'ACHIEVEMENT' | 'RELAPSE';

export interface Phrase {
  module: PhraseModule;
  context: PhraseContext;
  text: string;
}
