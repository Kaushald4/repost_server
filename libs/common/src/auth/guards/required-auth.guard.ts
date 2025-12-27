import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

@Injectable()
export class RequiredAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context
      .switchToHttp()
      .getRequest<{ user?: { userId: string } }>();

    if (!req.user) {
      throw new UnauthorizedException('Authentication required');
    }

    return true;
  }
}
