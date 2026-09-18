import type { RefreshedSession, Session } from '@domain/auth/entities/Session';
import type { User } from '@domain/auth/entities/User';
import type { AuthData, RegisterData } from '@domain/auth/repositories/AuthRepository';
import type {
  AuthResponseDto,
  RefreshResponseDto,
  RegisterResponseDto,
  TokensDto,
  UserDto,
  UserProfileDto,
} from '../dtos/authDtos';

export const toUser = (dto: UserDto): User => ({
  id: dto.id,
  email: dto.email,
  name: dto.name,
  emailVerified: dto.emailVerified,
  createdAt: dto.createdAt,
});

export const toSession = (dto: TokensDto, sessionId: string): Session => ({
  accessToken: dto.accessToken,
  refreshToken: dto.refreshToken,
  expiresIn: dto.expiresIn,
  tokenType: dto.tokenType,
  sessionId,
});

export const toAuthData = (dto: AuthResponseDto): AuthData => ({
  user: toUser(dto.user),
  tokens: toSession(dto.tokens, dto.sessionId),
});

export const toRegisterData = (dto: RegisterResponseDto): RegisterData => ({
  ...toAuthData(dto),
  verificationToken: dto.verificationToken,
  otpExpiresAt: dto.otpExpiresAt,
  otpExpiresIn: dto.otpExpiresIn,
});

export const toTokenPair = (dto: RefreshResponseDto): RefreshedSession => ({
  accessToken: dto.accessToken,
  refreshToken: dto.refreshToken,
  sessionId: dto.sessionId,
});

/** `"Ana Pérez"` from either part, or `''` when both are null. */
const profileFullName = (dto: UserProfileDto): string =>
  [dto.firstName, dto.lastName].filter((part): part is string => Boolean(part)).join(' ');

/**
 * `GET /users/me` returns a richer profile (`displayName`/`firstName`/`lastName`,
 * no `name`) than the auth payload. `User` keeps its original shape, so `name`
 * falls back to the most specific field available, ending at the email.
 */
export const toProfileUser = (dto: UserProfileDto): User => ({
  id: dto.id,
  email: dto.email,
  name: dto.displayName ?? (profileFullName(dto) || dto.email),
  emailVerified: dto.emailVerified,
  createdAt: dto.createdAt,
});
