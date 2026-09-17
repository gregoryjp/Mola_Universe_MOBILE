import {
  toAuthData,
  toProfileUser,
  toRegisterData,
  toSession,
  toTokenPair,
  toUser,
} from '@data/auth/mappers/authMappers';
import { describe, expect, it } from 'vitest';

const userDto = {
  id: 'u1',
  email: 'a@b.com',
  name: 'Ada',
  emailVerified: true,
  createdAt: '2026-01-01T00:00:00.000Z',
};

const tokensDto = {
  accessToken: 'at',
  refreshToken: 'rt',
  expiresIn: 900,
  tokenType: 'Bearer' as const,
};

const user = { ...userDto };
const session = { ...tokensDto, sessionId: 's1' };

describe('authMappers', () => {
  it('maps a user DTO to a User entity', () => {
    expect(toUser(userDto)).toEqual(user);
  });

  it('maps a tokens DTO to a Session entity carrying the session id', () => {
    expect(toSession(tokensDto, 's1')).toEqual(session);
  });

  it('maps an auth response to AuthData', () => {
    expect(toAuthData({ user: userDto, tokens: tokensDto, sessionId: 's1' })).toEqual({
      user,
      tokens: session,
    });
  });

  it('maps a register response including the verification token', () => {
    expect(
      toRegisterData({
        user: userDto,
        tokens: tokensDto,
        sessionId: 's1',
        verificationToken: 'challenge',
      }),
    ).toEqual({ user, tokens: session, verificationToken: 'challenge' });
  });

  it('maps a refresh response to a token pair carrying the rotated session id', () => {
    expect(toTokenPair({ accessToken: 'x', refreshToken: 'y', sessionId: 's2' })).toEqual({
      accessToken: 'x',
      refreshToken: 'y',
      sessionId: 's2',
    });
  });

  describe('toProfileUser (`GET /users/me`)', () => {
    const profile = {
      id: 'u1',
      email: 'a@b.com',
      firstName: null,
      lastName: null,
      displayName: null,
      birthDate: null,
      countryCode: null,
      city: null,
      phoneNumber: null,
      avatar: null,
      emailVerified: true,
      createdAt: '2026-01-01T00:00:00.000Z',
    };

    it('prefers displayName', () => {
      expect(toProfileUser({ ...profile, displayName: 'Ada Lovelace' }).name).toBe('Ada Lovelace');
    });

    it('falls back to first + last name', () => {
      expect(toProfileUser({ ...profile, firstName: 'Ada', lastName: 'Lovelace' }).name).toBe(
        'Ada Lovelace',
      );
    });

    it('falls back to the email when no name field is set', () => {
      expect(toProfileUser(profile).name).toBe('a@b.com');
    });

    it('maps the shared fields unchanged', () => {
      expect(toProfileUser(profile)).toMatchObject({
        id: 'u1',
        email: 'a@b.com',
        emailVerified: true,
        createdAt: '2026-01-01T00:00:00.000Z',
      });
    });
  });
});
