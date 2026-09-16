export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export interface Session extends TokenPair {
  expiresIn: number;
  tokenType: 'Bearer';
}
