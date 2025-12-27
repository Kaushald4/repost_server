import type { Response } from 'express';

export function writeAuthCookies(
  res: Response,
  accessToken: string,
  refreshTokenId?: string,
) {
  res.cookie('access_token', accessToken, {
    httpOnly: true,
    sameSite: 'lax',
    secure: true,
    path: '/',
  });

  if (refreshTokenId) {
    res.cookie('refresh_token_id', refreshTokenId, {
      httpOnly: true,
      sameSite: 'lax',
      secure: true,
      path: '/',
    });
  }
}
