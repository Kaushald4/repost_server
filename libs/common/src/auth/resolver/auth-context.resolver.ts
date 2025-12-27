import {
  Injectable,
  UnauthorizedException,
  OnModuleInit,
  Inject,
} from '@nestjs/common';
import type { ClientGrpc } from '@nestjs/microservices';
import { firstValueFrom, from } from 'rxjs';
import { AuthContext, ResolveAuthInput } from './auth-context.types';

interface AuthService {
  validate(data: { token: string }): Promise<{
    userId: string;
    valid: boolean;
    accessToken: string;
  }>;

  refresh(data: { refreshTokenId: string }): Promise<{
    accessToken: string;
    refreshTokenId: string;
  }>;
}

@Injectable()
export class AuthContextResolver implements OnModuleInit {
  private authService!: AuthService;

  constructor(
    @Inject('AUTH_SERVICE')
    private readonly client: ClientGrpc,
  ) {}

  onModuleInit() {
    this.authService = this.client.getService<AuthService>('AuthService');
  }

  async resolve(input: ResolveAuthInput): Promise<AuthContext> {
    const { accessToken, refreshTokenId, optional } = input;

    // No credentials
    if (!accessToken && !refreshTokenId) {
      if (optional) return { userId: null };
      throw new UnauthorizedException();
    }

    // Validate access token
    if (accessToken) {
      const validated = await firstValueFrom(
        from(this.authService.validate({ token: accessToken })),
      );

      if (validated.valid) {
        return {
          userId: validated.userId,
          accessToken,
        };
      }
    }

    // Try refresh token
    if (refreshTokenId) {
      const refreshed = await firstValueFrom(
        from(this.authService.refresh({ refreshTokenId })),
      );

      const validated = await firstValueFrom(
        from(this.authService.validate({ token: refreshed.accessToken })),
      );

      if (validated.valid) {
        return {
          userId: validated.userId,
          accessToken: refreshed.accessToken,
        };
      }
    }

    if (optional) {
      return { userId: null };
    }

    throw new UnauthorizedException();
  }
}
