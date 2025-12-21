import {
  Body,
  Controller,
  Inject,
  OnModuleInit,
  Post,
  Req,
} from '@nestjs/common';

import {
  RegisterRequest,
  LoginRequest,
  ValidateRequest,
  RefreshRequest,
} from '@app/dto';
import type { Request } from 'express';
import { Public } from '@app/common';
import type { ClientGrpc } from '@nestjs/microservices';
import { Observable } from 'rxjs';

interface AuthService {
  register(data: RegisterRequest): Observable<any>;
  login(data: LoginRequest): Observable<any>;
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
  login(@Body() data: LoginRequest, @Req() req: Request) {
    return this.svc.login({
      ...data,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'] || '',
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
