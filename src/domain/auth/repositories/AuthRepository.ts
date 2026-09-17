import type { RefreshedSession, Session } from '../entities/Session';
import type { User } from '../entities/User';

/** Typed error shape returned by the backend (ADR-0010 Result Pattern). */
export interface AuthError {
  code: string;
  message: string;
  statusCode: number;
}

/** Domain-level result of an auth operation — never throws across the boundary. */
export type AuthResult<T> = { success: true; value: T } | { success: false; error: AuthError };

/** Authenticated user plus the freshly issued token pair. */
export interface AuthData {
  user: User;
  tokens: Session;
}

/** Register also hands back the OTP challenge token used to verify the email. */
export interface RegisterData extends AuthData {
  verificationToken: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterPayload {
  email: string;
  name: string;
  password: string;
  passwordConfirm: string;
}

export interface ResetPasswordPayload {
  verificationToken: string;
  code: string;
  newPassword: string;
}

export interface VerifyOtpPayload {
  verificationToken: string;
  code: string;
}

export interface ForgotPasswordResult {
  verificationToken: string;
  message: string;
}

export interface MessageResult {
  message: string;
}

/**
 * Auth port. The data layer implements it; presentation depends on this
 * interface only. Every endpoint maps 1:1 to a verified backend route — see
 * logs/mobile-m1-2026-09-17.md for the openapi.ts verification table.
 */
export interface AuthRepository {
  login(credentials: LoginCredentials): Promise<AuthResult<AuthData>>;
  register(payload: RegisterPayload): Promise<AuthResult<RegisterData>>;
  refresh(refreshToken: string): Promise<AuthResult<RefreshedSession>>;
  logout(sessionId: string): Promise<AuthResult<MessageResult>>;
  /**
   * `GET /users/me`. The session survives a cold start but the user is not
   * persisted, so this is what lets the store repopulate `user` after hydration
   * (P0-1).
   */
  fetchProfile(): Promise<AuthResult<User>>;
  forgotPassword(email: string): Promise<AuthResult<ForgotPasswordResult>>;
  resetPassword(payload: ResetPasswordPayload): Promise<AuthResult<MessageResult>>;
  verifyEmail(token: string): Promise<AuthResult<MessageResult>>;
  verifyOtp(payload: VerifyOtpPayload): Promise<AuthResult<MessageResult>>;
  googleLogin(idToken: string): Promise<AuthResult<AuthData>>;
  appleLogin(idToken: string): Promise<AuthResult<AuthData>>;
}
