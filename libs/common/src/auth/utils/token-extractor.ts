import type { Request } from 'express';
import * as cookie from 'cookie';

export function extractTokens(req: Request): {
  accessToken?: string;
  refreshTokenId?: string;
} {
  const parsedCookies = req.headers.cookie
    ? cookie.parse(req.headers.cookie)
    : {};

  const accessToken =
    req.headers.authorization?.split(' ')[1] ?? parsedCookies.access_token;

  const refreshTokenId = parsedCookies.refresh_token_id;

  return { accessToken, refreshTokenId };
}
