import { Body, Controller, Post, Req } from '@nestjs/common';
import { AuthenticationService } from './authentication.service';
import {
  RegisterRequest,
  LoginRequest,
  ValidateRequest,
  RefreshRequest,
} from './dto/auth.dto';
import type { Request } from 'express';
import { Public } from '@app/common';

@Controller('auth')
export class AuthenticationController {
  constructor(private readonly authService: AuthenticationService) {}

  @Public()
  @Post('register')
  register(@Body() data: RegisterRequest) {
    return this.authService.register(data);
  }

  @Public()
  @Post('login')
  login(@Body() data: LoginRequest, @Req() req: Request) {
    return this.authService.login({
      ...data,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'] || '',
    });
  }

  @Public()
  @Post('validate')
  validate(@Body() data: ValidateRequest) {
    return this.authService.validate(data);
  }

  @Public()
  @Post('refresh')
  refresh(@Body() data: RefreshRequest) {
    return this.authService.refresh(data);
  }
}
