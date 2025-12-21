import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
  OnModuleInit,
} from '@nestjs/common';
import type { ClientGrpc } from '@nestjs/microservices';
import { firstValueFrom, Observable } from 'rxjs';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';

interface ValidateResponse {
  userId: string;
  valid: boolean;
}

interface AuthService {
  validate(data: { token: string }): Observable<ValidateResponse>;
}

interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
  };
}

@Injectable()
export class AuthGuard implements CanActivate, OnModuleInit {
  private authService!: AuthService;

  constructor(
    @Inject('AUTH_SERVICE') private client: ClientGrpc,
    private reflector: Reflector,
  ) {}

  onModuleInit() {
    this.authService = this.client.getService<AuthService>('AuthService');
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Check for @Public() decorator
    const isPublic = this.reflector.getAllAndOverride<boolean>('isPublic', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException('No token provided');
    }

    try {
      const response = await firstValueFrom(
        this.authService.validate({ token }),
      );

      if (!response.valid) {
        throw new UnauthorizedException('Invalid token');
      }

      // Attach user to request object
      request.user = {
        userId: response.userId,
      };

      return true;
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
