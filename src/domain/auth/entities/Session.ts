export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

/**
 * Fresh credentials issued by `POST /auth/refresh`. The backend creates a **new**
 * session row on every refresh (`authService.refreshTokens` → `createSession`) and
 * returns its id, so the rotated `sessionId` must replace the stored one. Keeping
 * the old id would make `POST /auth/logout` revoke a session that is no longer
 * active and leave the current one open (P0-3).
 */
export interface RefreshedSession extends TokenPair {
  sessionId: string;
}

export interface Session extends TokenPair {
  expiresIn: number;
  tokenType: 'Bearer';
  /**
   * Backend session id (`IAuthPayload.sessionId`, returned by login/register).
   * Required to revoke the session server-side on logout — without it the app
   * can only clear local state (P0-3).
   */
  sessionId: string;
}
