import { AuthRepositoryImpl } from '@data/auth/repositories/AuthRepositoryImpl';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const BASE = 'http://localhost:3000/api/v1';

const user = {
  id: 'u1',
  email: 'a@b.com',
  name: 'Ada',
  emailVerified: true,
  createdAt: '2026-01-01T00:00:00.000Z',
};
const tokens = { accessToken: 'at', refreshToken: 'rt', expiresIn: 900, tokenType: 'Bearer' };
const session = { ...tokens, sessionId: 's1' };

const jsonResponse = (body: unknown, status = 200): Response =>
  ({ status, ok: status >= 200 && status < 300, json: async () => body }) as unknown as Response;

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
    fetchMock.mockResolvedValueOnce(
      jsonResponse({ success: true, data: { user, tokens, sessionId: 's1' } }),
    );

    const result = await repo.login({ email: 'a@b.com', password: 'secret' });

    expect(fetchMock).toHaveBeenCalledWith(
      `${BASE}/auth/login`,
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ email: 'a@b.com', password: 'secret' }),
      }),
    );
    // The payload's root `sessionId` lands on the Session entity (P0-3).
    expect(result).toEqual({ success: true, value: { user, tokens: session } });
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
      jsonResponse(
        { success: true, data: { user, tokens, sessionId: 's1', verificationToken: 'challenge' } },
        201,
      ),
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
      value: { user, tokens: session, verificationToken: 'challenge' },
    });
  });

  it('refresh POSTs the refresh token and keeps the rotated session id', async () => {
    const fetchMock = vi.mocked(global.fetch);
    fetchMock.mockResolvedValueOnce(
      jsonResponse({
        success: true,
        data: { accessToken: 'new', refreshToken: 'new2', sessionId: 's2' },
      }),
    );

    const result = await repo.refresh('rt');

    expect(fetchMock).toHaveBeenCalledWith(
      `${BASE}/auth/refresh`,
      expect.objectContaining({ method: 'POST', body: JSON.stringify({ refreshToken: 'rt' }) }),
    );
    expect(result).toEqual({
      success: true,
      value: { accessToken: 'new', refreshToken: 'new2', sessionId: 's2' },
    });
  });

  it('fetchProfile GETs the raw /users/me resource (P0-1)', async () => {
    const fetchMock = vi.mocked(global.fetch);
    fetchMock.mockResolvedValueOnce(
      jsonResponse({
        id: 'u1',
        email: 'a@b.com',
        firstName: 'Ada',
        lastName: 'Lovelace',
        displayName: null,
        birthDate: null,
        countryCode: null,
        city: null,
        phoneNumber: null,
        avatar: null,
        emailVerified: true,
        createdAt: '2026-01-01T00:00:00.000Z',
      }),
    );

    const result = await repo.fetchProfile();

    expect(fetchMock).toHaveBeenCalledWith(
      `${BASE}/users/me`,
      expect.objectContaining({ method: 'GET' }),
    );
    expect(result).toEqual({
      success: true,
      value: { ...user, name: 'Ada Lovelace' },
    });
  });

  it('updateProfile PATCHes the raw /users/me resource and maps the updated profile', async () => {
    const fetchMock = vi.mocked(global.fetch);
    fetchMock.mockResolvedValueOnce(
      jsonResponse({
        id: 'u1',
        email: 'a@b.com',
        firstName: null,
        lastName: null,
        displayName: 'Ada Lovelace',
        birthDate: null,
        countryCode: null,
        city: null,
        phoneNumber: null,
        avatar: null,
        emailVerified: true,
        createdAt: '2026-01-01T00:00:00.000Z',
      }),
    );

    const result = await repo.updateProfile({ displayName: 'Ada Lovelace' });

    expect(fetchMock).toHaveBeenCalledWith(
      `${BASE}/users/me`,
      expect.objectContaining({
        method: 'PATCH',
        body: JSON.stringify({ displayName: 'Ada Lovelace' }),
      }),
    );
    expect(result).toEqual({
      success: true,
      value: { ...user, name: 'Ada Lovelace' },
    });
  });

  it('updateProfile maps a raw error envelope to a Result', async () => {
    const fetchMock = vi.mocked(global.fetch);
    fetchMock.mockResolvedValueOnce(
      jsonResponse(
        {
          success: false,
          error: { code: 'VALIDATION_ERROR', message: 'Bad date', statusCode: 400 },
        },
        400,
      ),
    );

    const result = await repo.updateProfile({ birthDate: 'not-a-date' });

    expect(result).toEqual({
      success: false,
      error: { code: 'VALIDATION_ERROR', message: 'Bad date', statusCode: 400 },
    });
  });

  it('resendVerification requests a fresh email OTP challenge and maps its expiry', async () => {
    const fetchMock = vi.mocked(global.fetch);
    fetchMock.mockResolvedValueOnce(
      jsonResponse({
        success: true,
        data: {
          verificationToken: 'fresh-challenge',
          otpExpiresAt: '2026-09-18T10:01:00.000Z',
          otpExpiresIn: 60,
          message: 'Sent',
        },
      }),
    );

    const result = await repo.resendVerification('a@b.com');

    expect(fetchMock).toHaveBeenCalledWith(
      `${BASE}/auth/resend-verification`,
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ email: 'a@b.com' }),
      }),
    );
    expect(result).toEqual({
      success: true,
      value: {
        verificationToken: 'fresh-challenge',
        otpExpiresAt: '2026-09-18T10:01:00.000Z',
        otpExpiresIn: 60,
        message: 'Sent',
      },
    });
  });

  it('fetchProfile maps a raw error envelope to a Result', async () => {
    const fetchMock = vi.mocked(global.fetch);
    fetchMock.mockResolvedValueOnce(
      jsonResponse(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Expired', statusCode: 401 } },
        401,
      ),
    );

    const result = await repo.fetchProfile();

    expect(result).toEqual({
      success: false,
      error: { code: 'UNAUTHORIZED', message: 'Expired', statusCode: 401 },
    });
  });

  it('uses the real OAuth paths /auth/google-login and /auth/apple-login', async () => {
    const fetchMock = vi.mocked(global.fetch);
    fetchMock.mockResolvedValue(
      jsonResponse({ success: true, data: { user, tokens, sessionId: 's1' } }),
    );

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
