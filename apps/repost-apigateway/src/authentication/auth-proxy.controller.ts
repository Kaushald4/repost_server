import {
  Body,
  Controller,
  Inject,
  OnModuleInit,
  Post,
  Req,
  Res,
} from '@nestjs/common';

import {
  RegisterRequest,
  LoginRequest,
  ValidateRequest,
  RefreshRequest,
  LoginResponse,
} from '@app/dto';
import type { Request, Response } from 'express';
import { Public } from '@app/common';
import type { ClientGrpc } from '@nestjs/microservices';
import { Observable, firstValueFrom } from 'rxjs';

interface AuthService {
  register(data: RegisterRequest): Observable<any>;
  login(data: LoginRequest): Observable<LoginResponse>;
  validate(data: ValidateRequest): Observable<any>;
  refresh(data: RefreshRequest): Observable<any>;
}

@Controller('auth')
export class AuthenticationProxyController implements OnModuleInit {
  private svc: AuthService;

  constructor(@Inject('AUTH_SERVICE') private client: ClientGrpc) {}
  onModuleInit() {
    this.svc = this.client.getService<AuthService>('AuthService');
  }

  @Public()
  @Post('register')
  register(@Body() data: RegisterRequest) {
    return this.svc.register(data);
  }

  @Public()
  @Post('login')
  async login(
    @Body() data: LoginRequest,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const response = await firstValueFrom(
      this.svc.login({
        ...data,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'] || '',
      }),
    );
    const options: Record<string, any> = {
      httpOnly: true,
      secure: true,
      sameSite: 'none' as const,
      path: '/',
      domain: undefined,
    };
    res.cookie('access_token', response.accessToken, {
      ...options,
      maxAge: 20,
    });
    res.cookie('refresh_token', response.refreshToken, {
      ...options,
      maxAge: 7 * 24 * 60 * 60,
    });
    res.cookie('refresh_token_id', response.refreshTokenId, {
      ...options,
      maxAge: 7 * 24 * 60 * 60,
    });
    return res.json({
      userId: response.userId,
      refreshTokenId: response.refreshTokenId,
      accessToken: response.accessToken,
    });
  }

  @Public()
  @Post('validate')
  validate(@Body() data: ValidateRequest) {
    return this.svc.validate(data);
  }

  @Public()
  @Post('refresh')
  refresh(@Body() data: RefreshRequest) {
    return this.svc.refresh(data);
  }
}
