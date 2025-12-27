import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Request, Response } from 'express';
import { AuthContextResolver } from '../resolver/auth-context.resolver';
import { extractTokens } from '../utils/token-extractor';
import { writeAuthCookies } from '../utils/cookie-writer';
import { OPTIONAL_AUTH_KEY } from '../decorators/optional-auth.decorator';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class AuthContextInterceptor implements NestInterceptor {
  constructor(
    private readonly resolver: AuthContextResolver,
    private readonly reflector: Reflector,
  ) {}

  async intercept(context: ExecutionContext, next: CallHandler) {
    const http = context.switchToHttp();
    const req = http.getRequest<Request & { user?: any }>();
    const res = http.getResponse<Response>();

    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return next.handle();
    }

    const isOptional = this.reflector.getAllAndOverride<boolean>(
      OPTIONAL_AUTH_KEY,
      [context.getHandler(), context.getClass()],
    );

    const { accessToken, refreshTokenId } = extractTokens(req);

    try {
      const authContext = await this.resolver.resolve({
        accessToken,
        refreshTokenId,
        optional: !!isOptional,
      });

      if (authContext.accessToken) {
        writeAuthCookies(res, authContext.accessToken);
      }

      if (authContext.userId) {
        req.user = { userId: authContext.userId };
      }

      return next.handle();
    } catch (error) {
      console.log(error);
      res.clearCookie('access_token', {
        httpOnly: true,
        sameSite: 'lax',
        secure: true,
        path: '/',
      });

      res.clearCookie('refresh_token_id', {
        httpOnly: true,
        sameSite: 'lax',
        secure: true,
        path: '/',
      });

      return next.handle();
    }
  }
}
