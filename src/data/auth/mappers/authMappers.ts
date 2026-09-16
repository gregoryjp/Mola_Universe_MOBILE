import type { Session, TokenPair } from '@domain/auth/entities/Session';
import type { User } from '@domain/auth/entities/User';
import type { AuthData, RegisterData } from '@domain/auth/repositories/AuthRepository';
import type {
  AuthResponseDto,
  RefreshResponseDto,
  RegisterResponseDto,
  TokensDto,
  UserDto,
} from '../dtos/authDtos';

export const toUser = (dto: UserDto): User => ({
  id: dto.id,
  email: dto.email,
  name: dto.name,
  emailVerified: dto.emailVerified,
  createdAt: dto.createdAt,
});

export const toSession = (dto: TokensDto): Session => ({
  accessToken: dto.accessToken,
  refreshToken: dto.refreshToken,
  expiresIn: dto.expiresIn,
  tokenType: dto.tokenType,
});

export const toAuthData = (dto: AuthResponseDto): AuthData => ({
  user: toUser(dto.user),
  tokens: toSession(dto.tokens),
});

export const toRegisterData = (dto: RegisterResponseDto): RegisterData => ({
  ...toAuthData(dto),
  verificationToken: dto.verificationToken,
});

export const toTokenPair = (dto: RefreshResponseDto): TokenPair => ({
  accessToken: dto.accessToken,
  refreshToken: dto.refreshToken,
});
