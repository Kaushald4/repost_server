import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';

interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
  };
  cookies: {
    refresh_token_id?: string;
    access_token?: string;
  };
}

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<AuthenticatedRequest>();

    const isPublic = this.reflector.getAllAndOverride<boolean>('isPublic', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const hasAccessToken =
      req.headers.authorization !== null || req.cookies?.access_token !== null;

    const hasRefreshToken = !!req.cookies?.refresh_token_id;

    if (!hasAccessToken && !hasRefreshToken) {
      throw new UnauthorizedException('No auth credentials');
    }

    return true;
  }
}
