import type { PhraseDto } from '@data/phrases/dtos/phraseDtos';
import { toPhrase } from '@data/phrases/mappers/phraseMappers';
import { describe, expect, it } from 'vitest';

describe('toPhrase', () => {
  it('maps the three fields the contract defines', () => {
    const dto: PhraseDto = { module: 'TASKS', context: 'DAY_END', text: 'Buen trabajo hoy.' };

    expect(toPhrase(dto)).toEqual({
      module: 'TASKS',
      context: 'DAY_END',
      text: 'Buen trabajo hoy.',
    });
  });

  it('drops anything the backend adds beyond the contract', () => {
    const dto = {
      module: 'SAVINGS',
      context: 'STREAK',
      text: 'Sigue así.',
      createdAt: '2026-09-17T09:00:00.000Z',
      internalId: 42,
    } as unknown as PhraseDto;

    const phrase = toPhrase(dto);

    expect(Object.keys(phrase).sort()).toEqual(['context', 'module', 'text']);
    expect(phrase).not.toHaveProperty('internalId');
  });
});
