import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
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
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<AuthenticatedRequest>();

    const hasAccessToken = typeof req.headers.authorization === 'string';

    const hasRefreshToken = !!req.cookies?.refresh_token_id;

    if (!hasAccessToken && !hasRefreshToken) {
      throw new UnauthorizedException('No auth credentials');
    }

    return true;
  }
}
