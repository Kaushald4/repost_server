export interface AuthContext {
  userId: string | null;
  accessToken?: string;
}

export interface ResolveAuthInput {
  accessToken?: string;
  refreshTokenId?: string;
  optional: boolean;
}
