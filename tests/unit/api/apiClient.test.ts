import { apiClient, setAccessTokenProvider, setRefreshHandler } from '@data/api/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const BASE = 'http://localhost:3000/api/v1';

const jsonResponse = (body: unknown, status = 200): Response =>
  ({ status, json: async () => body }) as unknown as Response;

beforeEach(() => {
  vi.stubGlobal('fetch', vi.fn());
});

afterEach(() => {
  vi.unstubAllGlobals();
  setAccessTokenProvider(() => null);
  setRefreshHandler(null);
});

describe('apiClient', () => {
  it('sends no Authorization header when no token provider is registered', async () => {
    const fetchMock = vi.mocked(global.fetch);
    fetchMock.mockResolvedValueOnce(jsonResponse({ success: true, data: { ok: true } }));

    await apiClient.get('/thing');

    expect(fetchMock).toHaveBeenCalledWith(
      `${BASE}/thing`,
      expect.objectContaining({ headers: { 'Content-Type': 'application/json' } }),
    );
  });

  it('attaches the bearer token from the registered provider', async () => {
    const fetchMock = vi.mocked(global.fetch);
    fetchMock.mockResolvedValueOnce(jsonResponse({ success: true }));
    setAccessTokenProvider(() => 'tok123');

    await apiClient.get('/me');

    expect(fetchMock).toHaveBeenCalledWith(
      `${BASE}/me`,
      expect.objectContaining({
        headers: { 'Content-Type': 'application/json', Authorization: 'Bearer tok123' },
      }),
    );
  });

  it('refreshes once on 401 and retries with the fresh token', async () => {
    const fetchMock = vi.mocked(global.fetch);
    const refresh = vi.fn().mockResolvedValue('fresh');
    setAccessTokenProvider(() => 'expired');
    setRefreshHandler(refresh);

    fetchMock
      .mockResolvedValueOnce(jsonResponse({ success: false }, 401))
      .mockResolvedValueOnce(jsonResponse({ success: true, data: { ok: true } }));

    const result = await apiClient.get('/me');

    expect(refresh).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(fetchMock).toHaveBeenLastCalledWith(
      `${BASE}/me`,
      expect.objectContaining({
        headers: expect.objectContaining({ Authorization: 'Bearer fresh' }),
      }),
    );
    expect(result).toEqual({ success: true, data: { ok: true } });
  });

  it('maps network failures to a NETWORK_ERROR result', async () => {
    const fetchMock = vi.mocked(global.fetch);
    fetchMock.mockRejectedValueOnce(new Error('boom'));

    const result = await apiClient.get('/x');

    expect(result).toMatchObject({ success: false, error: { code: 'NETWORK_ERROR' } });
  });

  it('preserves the HTTP status when a rate-limit response is not JSON', async () => {
    const fetchMock = vi.mocked(global.fetch);
    fetchMock.mockResolvedValueOnce({
      status: 429,
      json: async () => {
        throw new SyntaxError('Unexpected token T');
      },
    } as unknown as Response);

    const result = await apiClient.post('/auth/resend-verification', { email: 'a@b.com' });

    expect(result).toEqual({
      success: false,
      error: {
        code: 'RATE_LIMITED',
        message: 'Too many requests. Please try again later.',
        statusCode: 429,
      },
    });
  });
});
