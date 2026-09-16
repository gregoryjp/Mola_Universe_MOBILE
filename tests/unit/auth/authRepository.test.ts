import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthRepositoryImpl } from '@data/auth/repositories/AuthRepositoryImpl';

const BASE = 'http://localhost:3000/api/v1';

const user = {
  id: 'u1',
  email: 'a@b.com',
  name: 'Ada',
  emailVerified: true,
  createdAt: '2026-01-01T00:00:00.000Z',
};
const tokens = { accessToken: 'at', refreshToken: 'rt', expiresIn: 900, tokenType: 'Bearer' };

const jsonResponse = (body: unknown, status = 200): Response =>
  ({ status, json: async () => body }) as unknown as Response;

const repo = new AuthRepositoryImpl();

beforeEach(() => {
  vi.stubGlobal('fetch', vi.fn());
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('AuthRepositoryImpl', () => {
  it('login POSTs to /auth/login and maps the response', async () => {
    const fetchMock = vi.mocked(global.fetch);
    fetchMock.mockResolvedValueOnce(jsonResponse({ success: true, data: { user, tokens } }));

    const result = await repo.login({ email: 'a@b.com', password: 'secret' });

    expect(fetchMock).toHaveBeenCalledWith(
      `${BASE}/auth/login`,
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ email: 'a@b.com', password: 'secret' }),
      }),
    );
    expect(result).toEqual({ success: true, value: { user, tokens } });
  });

  it('surfaces backend errors as a Result instead of throwing', async () => {
    const fetchMock = vi.mocked(global.fetch);
    fetchMock.mockResolvedValueOnce(
      jsonResponse(
        {
          success: false,
          error: {
            code: 'AUTH_INVALID_CREDENTIALS',
            message: 'Invalid email or password',
            statusCode: 401,
          },
        },
        401,
      ),
    );

    const result = await repo.login({ email: 'a@b.com', password: 'bad' });

    expect(result).toEqual({
      success: false,
      error: {
        code: 'AUTH_INVALID_CREDENTIALS',
        message: 'Invalid email or password',
        statusCode: 401,
      },
    });
  });

  it('register POSTs to /auth/register and returns the verification token', async () => {
    const fetchMock = vi.mocked(global.fetch);
    fetchMock.mockResolvedValueOnce(
      jsonResponse({ success: true, data: { user, tokens, verificationToken: 'challenge' } }, 201),
    );

    const result = await repo.register({
      email: 'a@b.com',
      name: 'Ada',
      password: 'p',
      passwordConfirm: 'p',
    });

    expect(fetchMock).toHaveBeenCalledWith(
      `${BASE}/auth/register`,
      expect.objectContaining({ method: 'POST' }),
    );
    expect(result).toEqual({
      success: true,
      value: { user, tokens, verificationToken: 'challenge' },
    });
  });

  it('refresh POSTs the refresh token', async () => {
    const fetchMock = vi.mocked(global.fetch);
    fetchMock.mockResolvedValueOnce(
      jsonResponse({ success: true, data: { accessToken: 'new', refreshToken: 'new2' } }),
    );

    const result = await repo.refresh('rt');

    expect(fetchMock).toHaveBeenCalledWith(
      `${BASE}/auth/refresh`,
      expect.objectContaining({ method: 'POST', body: JSON.stringify({ refreshToken: 'rt' }) }),
    );
    expect(result).toEqual({ success: true, value: { accessToken: 'new', refreshToken: 'new2' } });
  });

  it('uses the real OAuth paths /auth/google-login and /auth/apple-login', async () => {
    const fetchMock = vi.mocked(global.fetch);
    fetchMock.mockResolvedValue(jsonResponse({ success: true, data: { user, tokens } }));

    await repo.googleLogin('google-id');
    await repo.appleLogin('apple-id');

    expect(fetchMock).toHaveBeenCalledWith(
      `${BASE}/auth/google-login`,
      expect.objectContaining({ body: JSON.stringify({ idToken: 'google-id' }) }),
    );
    expect(fetchMock).toHaveBeenCalledWith(
      `${BASE}/auth/apple-login`,
      expect.objectContaining({ body: JSON.stringify({ idToken: 'apple-id' }) }),
    );
  });

  it('posts to the verified forgot/reset/verify/logout paths', async () => {
    const fetchMock = vi.mocked(global.fetch);
    fetchMock.mockResolvedValue(jsonResponse({ success: true, data: { message: 'ok' } }));

    await repo.forgotPassword('a@b.com');
    await repo.resetPassword({ verificationToken: 't', code: '123456', newPassword: 'p' });
    await repo.verifyEmail('token');
    await repo.verifyOtp({ verificationToken: 't', code: '123456' });
    await repo.logout('session-1');

    expect(fetchMock).toHaveBeenCalledWith(`${BASE}/auth/forgot-password`, expect.anything());
    expect(fetchMock).toHaveBeenCalledWith(`${BASE}/auth/reset-password`, expect.anything());
    expect(fetchMock).toHaveBeenCalledWith(`${BASE}/auth/verify-email`, expect.anything());
    expect(fetchMock).toHaveBeenCalledWith(`${BASE}/auth/verify-otp`, expect.anything());
    expect(fetchMock).toHaveBeenCalledWith(
      `${BASE}/auth/logout`,
      expect.objectContaining({ body: JSON.stringify({ sessionId: 'session-1' }) }),
    );
  });

  it('falls back to UNKNOWN_ERROR when the envelope has no error body', async () => {
    const fetchMock = vi.mocked(global.fetch);
    fetchMock.mockResolvedValueOnce(jsonResponse({ success: false }));

    const result = await repo.login({ email: 'a@b.com', password: 'x' });

    expect(result).toEqual({
      success: false,
      error: { code: 'UNKNOWN_ERROR', message: 'Unexpected error', statusCode: 500 },
    });
  });
});
