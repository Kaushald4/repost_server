import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  UnauthorizedException,
  Inject,
  OnModuleInit,
} from '@nestjs/common';
import type { ClientGrpc } from '@nestjs/microservices';
import type { Request, Response } from 'express';
import { Observable, switchMap } from 'rxjs';

interface AuthService {
  refresh(data: { refreshTokenId: string }): Observable<{
    accessToken: string;
    refreshToken: string;
    refreshTokenId: string;
  }>;
  validate(data: { token: string }): Observable<{
    userId: string;
    valid: boolean;
    accessToken: string;
  }>;
}

export interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
  };
  cookies: {
    refresh_token_id?: string;
    access_token?: string;
  };
}

@Injectable()
export class RefreshInterceptor implements NestInterceptor, OnModuleInit {
  private authService!: AuthService;

  constructor(@Inject('AUTH_SERVICE') private client: ClientGrpc) {}

  onModuleInit() {
    this.authService = this.client.getService<AuthService>('AuthService');
  }

  intercept(context: ExecutionContext, next: CallHandler) {
    const http = context.switchToHttp();
    const req = http.getRequest<AuthenticatedRequest>();
    const res = http.getResponse<Response>();

    const accessToken = req.headers.authorization?.split(' ')[1];
    const refreshTokenId = req.cookies?.refresh_token_id;

    /**
     * CASE 1: Access token exists → validate
     */
    if (accessToken) {
      return this.authService.validate({ token: accessToken }).pipe(
        switchMap((result) => {
          if (!result.valid) {
            throw new UnauthorizedException();
          }

          req.user = { userId: result.userId };
          return next.handle();
        }),
      );
    }

    /**
     * CASE 2: No access token, but refresh token exists → refresh FIRST
     */
    if (!accessToken && refreshTokenId) {
      return this.authService.refresh({ refreshTokenId }).pipe(
        switchMap((refreshed) => {
          // 1️⃣ Set cookies using refreshed tokens
          res.cookie('access_token', refreshed.accessToken, {
            httpOnly: true,
            sameSite: 'lax',
            secure: false,
            path: '/',
          });

          res.cookie('refresh_token_id', refreshed.refreshTokenId, {
            httpOnly: true,
            sameSite: 'lax',
            secure: false,
            path: '/',
          });

          // Validate the NEW access token
          return this.authService
            .validate({ token: refreshed.accessToken })
            .pipe(
              // carry both values forward
              switchMap((validated) => {
                if (!validated.valid) {
                  throw new UnauthorizedException();
                }

                return [
                  {
                    accessToken: refreshed.accessToken,
                    userId: validated.userId,
                  },
                ];
              }),
            );
        }),
        switchMap(({ accessToken, userId }) => {
          req.headers.authorization = `Bearer ${accessToken}`;
          req.user = { userId };

          return next.handle();
        }),
      );
    }

    throw new UnauthorizedException();
  }
}
