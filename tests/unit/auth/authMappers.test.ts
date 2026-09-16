import { describe, expect, it } from 'vitest';
import {
  toAuthData,
  toRegisterData,
  toSession,
  toTokenPair,
  toUser,
} from '@data/auth/mappers/authMappers';

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
const session = { ...tokensDto };

describe('authMappers', () => {
  it('maps a user DTO to a User entity', () => {
    expect(toUser(userDto)).toEqual(user);
  });

  it('maps a tokens DTO to a Session entity', () => {
    expect(toSession(tokensDto)).toEqual(session);
  });

  it('maps an auth response to AuthData', () => {
    expect(toAuthData({ user: userDto, tokens: tokensDto })).toEqual({ user, tokens: session });
  });

  it('maps a register response including the verification token', () => {
    expect(
      toRegisterData({ user: userDto, tokens: tokensDto, verificationToken: 'challenge' }),
    ).toEqual({ user, tokens: session, verificationToken: 'challenge' });
  });

  it('maps a refresh response to a token pair', () => {
    expect(toTokenPair({ accessToken: 'x', refreshToken: 'y' })).toEqual({
      accessToken: 'x',
      refreshToken: 'y',
    });
  });
});
