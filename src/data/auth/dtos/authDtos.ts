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
}

export interface RegisterResponseDto extends AuthResponseDto {
  verificationToken: string;
}

export interface RefreshResponseDto {
  accessToken: string;
  refreshToken: string;
}

export interface MessageResponseDto {
  message: string;
}

export interface ForgotPasswordResponseDto {
  verificationToken: string;
  message: string;
}
