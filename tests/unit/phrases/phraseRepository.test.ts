import {
  PhraseRepositoryImpl,
  phraseRepository,
} from '@data/phrases/repositories/PhraseRepositoryImpl';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const BASE = 'http://localhost:3000/api/v1';

const phraseDto = { module: 'TASKS', context: 'DAY_START', text: 'Vamos paso a paso.' };

const jsonResponse = (body: unknown, status = 200): Response =>
  ({ status, ok: status >= 200 && status < 300, json: async () => body }) as unknown as Response;

const repo = new PhraseRepositoryImpl();

beforeEach(() => {
  vi.stubGlobal('fetch', vi.fn());
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('PhraseRepositoryImpl', () => {
  it('requests the phrase with module and context as query params', async () => {
    const fetchMock = vi.mocked(global.fetch);
    fetchMock.mockResolvedValueOnce(jsonResponse(phraseDto));

    const result = await repo.getPhrase('TASKS', 'DAY_START');

    expect(fetchMock).toHaveBeenCalledWith(
      `${BASE}/phrases?module=TASKS&context=DAY_START`,
      expect.objectContaining({ method: 'GET' }),
    );
    expect(result).toEqual({
      success: true,
      value: { module: 'TASKS', context: 'DAY_START', text: 'Vamos paso a paso.' },
    });
  });

  it('builds the query for a different module/context pair', async () => {
    const fetchMock = vi.mocked(global.fetch);
    fetchMock.mockResolvedValueOnce(
      jsonResponse({ module: 'SAVINGS', context: 'ACHIEVEMENT', text: '¡Meta alcanzada!' }),
    );

    const result = await repo.getPhrase('SAVINGS', 'ACHIEVEMENT');

    expect(fetchMock).toHaveBeenCalledWith(
      `${BASE}/phrases?module=SAVINGS&context=ACHIEVEMENT`,
      expect.objectContaining({ method: 'GET' }),
    );
    expect(result.success).toBe(true);
    if (result.success) expect(result.value.module).toBe('SAVINGS');
  });

  it('normalises the 404 the bank answers for an empty combination', async () => {
    const fetchMock = vi.mocked(global.fetch);
    fetchMock.mockResolvedValueOnce(
      jsonResponse(
        {
          success: false,
          error: {
            code: 'PHRASE_NOT_FOUND',
            message: 'No phrases defined for this module/context combination',
            statusCode: 404,
          },
        },
        404,
      ),
    );

    const result = await repo.getPhrase('DIARY', 'STREAK');

    expect(result).toEqual({
      success: false,
      error: {
        code: 'PHRASE_NOT_FOUND',
        message: 'No phrases defined for this module/context combination',
        statusCode: 404,
      },
    });
  });

  it('normalises the 400 the backend answers for an unknown module', async () => {
    const fetchMock = vi.mocked(global.fetch);
    fetchMock.mockResolvedValueOnce(
      jsonResponse(
        {
          success: false,
          error: { code: 'INVALID_INPUT', message: 'Invalid input', statusCode: 400 },
        },
        400,
      ),
    );

    const result = await repo.getPhrase('TASKS', 'STREAK');

    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.code).toBe('INVALID_INPUT');
  });

  it('exposes a ready-to-use singleton', () => {
    expect(phraseRepository).toBeInstanceOf(PhraseRepositoryImpl);
  });
});
