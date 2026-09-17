import { MeowRepositoryImpl } from '@data/meow/repositories/MeowRepositoryImpl';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const BASE = 'http://localhost:3000/api/v1';
const repo = new MeowRepositoryImpl();

const jsonResponse = (body: unknown, status = 200): Response =>
  ({ status, ok: status >= 200 && status < 300, json: async () => body }) as unknown as Response;

/** Body of the last fetch call, parsed back from the request. */
const lastBody = (fetchMock: ReturnType<typeof vi.mocked<typeof fetch>>): unknown => {
  const calls = fetchMock.mock.calls;
  const init = calls[calls.length - 1]?.[1] as RequestInit | undefined;
  return init?.body === undefined ? undefined : JSON.parse(init.body as string);
};

beforeEach(() => {
  vi.stubGlobal('fetch', vi.fn());
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('MeowRepositoryImpl', () => {
  it('posts the capability with structured params', async () => {
    const fetchMock = vi.mocked(global.fetch);
    fetchMock.mockResolvedValueOnce(
      jsonResponse({
        capability: 'CREATE_TASK',
        message: 'Tarea creada: "Comprar pan".',
        data: { id: 't1' },
      }),
    );

    const result = await repo.executeCapability('CREATE_TASK', {
      title: 'Comprar pan',
      dueDate: '2026-09-20',
    });

    expect(fetchMock).toHaveBeenCalledWith(
      `${BASE}/meow/capabilities/CREATE_TASK`,
      expect.objectContaining({ method: 'POST' }),
    );
    expect(lastBody(fetchMock)).toEqual({
      params: { title: 'Comprar pan', dueDate: '2026-09-20' },
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.value.capability).toBe('CREATE_TASK');
      expect(result.value.message).toBe('Tarea creada: "Comprar pan".');
      // The DTO omits `phrase` for most capabilities.
      expect(result.value.phrase).toBeNull();
    }
  });

  it('keeps the phrase when the capability attaches one', async () => {
    const fetchMock = vi.mocked(global.fetch);
    fetchMock.mockResolvedValueOnce(
      jsonResponse({
        capability: 'COMPLETE_TASK',
        message: 'Tarea completada.',
        data: { id: 't1' },
        phrase: 'Buen trabajo.',
      }),
    );

    const result = await repo.executeCapability('COMPLETE_TASK', { taskId: 't1' });

    expect(result.success).toBe(true);
    if (result.success) expect(result.value.phrase).toBe('Buen trabajo.');
  });

  it('sends an empty params object for a capability that takes none', async () => {
    const fetchMock = vi.mocked(global.fetch);
    fetchMock.mockResolvedValueOnce(
      jsonResponse({ capability: 'VIEW_MY_DAY', message: 'Hoy tienes 2 tareas.', data: {} }),
    );

    await repo.executeCapability('VIEW_MY_DAY', {});

    expect(lastBody(fetchMock)).toEqual({ params: {} });
  });

  it('forwards the backend error instead of collapsing it', async () => {
    const fetchMock = vi.mocked(global.fetch);
    fetchMock.mockResolvedValueOnce(
      jsonResponse(
        { error: { code: 'INVALID_INPUT', message: 'Faltan datos', statusCode: 400 } },
        400,
      ),
    );

    const result = await repo.executeCapability('CREATE_TASK', {});

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.code).toBe('INVALID_INPUT');
      expect(result.error.message).toBe('Faltan datos');
      expect(result.error.statusCode).toBe(400);
    }
  });
});
