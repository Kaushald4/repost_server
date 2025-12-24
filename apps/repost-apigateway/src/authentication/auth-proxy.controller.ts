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
import { ConfigService } from '@nestjs/config';

interface AuthService {
  register(data: RegisterRequest): Observable<any>;
  login(data: LoginRequest): Observable<LoginResponse>;
  validate(data: ValidateRequest): Observable<any>;
  refresh(data: RefreshRequest): Observable<any>;
}

@Controller('auth')
export class AuthenticationProxyController implements OnModuleInit {
  private svc: AuthService;

  constructor(
    @Inject('AUTH_SERVICE') private client: ClientGrpc,
    private configService: ConfigService,
  ) {}
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

    const cookieDomain = this.configService.get<string>('COOKIE_DOMAIN')!;
    const cookieHttpOnly = this.configService.get<string>('COOKIE_HTTP_ONLY')!;
    const cookiePath = this.configService.get<string>('COOKIE_PATH')!;
    const cookieSecure = this.configService.get<string>('COOKIE_SECURE')!;
    const cookieSameSite = this.configService.get<string>('COOKIE_SAME_SITE')!;

    const cookieExpirationTime = this.configService.get<string>(
      'COOKIE_EXPIRATION_TIME',
    )! as unknown as number;
    const refreshCookieExpirationTime = this.configService.get<string>(
      'REFRESH_COOKIE_EXPIRATION_TIME',
    )! as unknown as number;

    const options: Record<string, any> = {
      httpOnly: cookieHttpOnly === 'true',
      secure: cookieSecure === 'true',
      sameSite: cookieSameSite as 'lax' | 'strict' | 'none',
      path: cookiePath,
      domain: cookieDomain,
    };
    res.cookie('access_token', response.accessToken, {
      ...options,
      maxAge: Number(cookieExpirationTime) * 1000,
    });
    res.cookie('refresh_token', response.refreshToken, {
      ...options,
      maxAge: Number(refreshCookieExpirationTime) * 1000,
    });
    res.cookie('refresh_token_id', response.refreshTokenId, {
      ...options,
      maxAge: Number(refreshCookieExpirationTime) * 1000,
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

  @Post('refresh')
  refresh(@Body() data: RefreshRequest) {
    return this.svc.refresh(data);
  }
}
