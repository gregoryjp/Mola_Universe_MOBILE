// Request DTOs — mirror the backend TypeBox validators in
// Mola_Universe_APP/src/modules/auth/validators/authValidators.ts exactly.

export interface RegisterRequestDto {
  email: string;
  name: string;
  password: string;
  passwordConfirm: string;
}

export interface LoginRequestDto {
  email: string;
  password: string;
}

export interface RefreshRequestDto {
  refreshToken: string;
}

export interface LogoutRequestDto {
  sessionId: string;
}

export interface ForgotPasswordRequestDto {
  email: string;
}

export interface ResetPasswordRequestDto {
  verificationToken: string;
  code: string;
  newPassword: string;
}

export interface VerifyEmailRequestDto {
  token: string;
}

export interface VerifyOtpRequestDto {
  verificationToken: string;
  code: string;
}

export interface UpdateProfileRequestDto {
  firstName?: string;
  lastName?: string;
  displayName?: string;
  birthDate?: string;
  countryCode?: string;
  city?: string;
  phoneNumber?: string;
  avatar?: string;
}

export interface OAuthLoginRequestDto {
  idToken: string;
}

// Response DTOs — mirror the payloads sent by
// Mola_Universe_APP/src/modules/auth/controllers/authControllers.ts.

export interface UserDto {
  id: string;
  email: string;
  name: string;
  emailVerified: boolean;
  createdAt: string;
}

export interface TokensDto {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: 'Bearer';
}

export interface AuthResponseDto {
  user: UserDto;
  tokens: TokensDto;
  /** Backend session id at the payload root (`IAuthPayload.sessionId`). */
  sessionId: string;
}

export interface RegisterResponseDto extends AuthResponseDto {
  verificationToken: string;
  otpExpiresAt?: string;
  otpExpiresIn?: number;
}

export interface RefreshResponseDto {
  accessToken: string;
  refreshToken: string;
  /** A refresh creates a new session server-side, so the id is rotated too. */
  sessionId: string;
}

export interface MessageResponseDto {
  message: string;
}

export interface ForgotPasswordResponseDto {
  verificationToken: string;
  message: string;
}

export interface ResendVerificationResponseDto {
  verificationToken: string;
  otpExpiresAt?: string;
  otpExpiresIn?: number;
  message: string;
}

// `GET /users/me` mirrors the backend `IUserProfileDTO`
// (Mola_Universe_APP/src/modules/users/interface/IUserProfile.ts). The controller
// returns the resource raw (`res.json(result.data)`), not enveloped, so it is read
// through `apiClient.getRaw`.
export interface UserProfileDto {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  displayName: string | null;
  birthDate: string | null;
  countryCode: string | null;
  city: string | null;
  phoneNumber: string | null;
  avatar: string | null;
  emailVerified: boolean;
  createdAt: string;
}
