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
  /** ISO timestamp/seconds the OTP is valid for — drives the countdown UI. Optional for backward compatibility with older backend responses. */
  otpExpiresAt?: string;
  otpExpiresIn?: number;
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

/**
 * `PATCH /users/me`. All fields optional per the OpenAPI request schema — the
 * caller sends only what it wants to change. Onboarding only ever sends
 * `displayName` today, but the type isn't narrowed to that since the backend
 * contract accepts the full profile shape.
 */
export interface UpdateProfilePayload {
  firstName?: string;
  lastName?: string;
  displayName?: string;
  birthDate?: string;
  countryCode?: string;
  city?: string;
  phoneNumber?: string;
  avatar?: string;
}

export interface ForgotPasswordResult {
  verificationToken: string;
  message: string;
}

/**
 * `POST /auth/resend-verification`. Independent from `forgotPassword`'s OTP
 * slot (separate backend fields), same non-leaking convention: an empty
 * `verificationToken` means a nonexistent/already-verified account, still 200.
 */
export interface ResendVerificationResult {
  verificationToken: string;
  otpExpiresAt?: string;
  otpExpiresIn?: number;
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
  /**
   * `PATCH /users/me`. Returns the updated profile in the same shape as
   * `fetchProfile` (verified against the backend controller/service, which
   * both return `userToDTO(updated)` — the OpenAPI 200 response has no body
   * schema, so this was confirmed by reading the handler, not assumed).
   */
  updateProfile(payload: UpdateProfilePayload): Promise<AuthResult<User>>;
  forgotPassword(email: string): Promise<AuthResult<ForgotPasswordResult>>;
  resendVerification(email: string): Promise<AuthResult<ResendVerificationResult>>;
  resetPassword(payload: ResetPasswordPayload): Promise<AuthResult<MessageResult>>;
  verifyEmail(token: string): Promise<AuthResult<MessageResult>>;
  verifyOtp(payload: VerifyOtpPayload): Promise<AuthResult<MessageResult>>;
  googleLogin(idToken: string): Promise<AuthResult<AuthData>>;
  appleLogin(idToken: string): Promise<AuthResult<AuthData>>;
}
