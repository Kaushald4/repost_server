import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { AuthServiceService } from './auth-service.service';
import {
  RegisterRequest,
  RegisterResponse,
  LoginRequest,
  LoginResponse,
  ValidateRequest,
  ValidateResponse,
  RefreshRequest,
  RefreshResponse,
} from './auth.dto';

@Controller()
export class AuthServiceController {
  constructor(private readonly authService: AuthServiceService) {}

  @GrpcMethod('AuthService', 'Register')
  register(data: RegisterRequest): Promise<RegisterResponse> {
    return this.authService.register(data);
  }

  @GrpcMethod('AuthService', 'Login')
  login(data: LoginRequest): Promise<LoginResponse> {
    return this.authService.login(data);
  }

  @GrpcMethod('AuthService', 'Validate')
  validate(data: ValidateRequest): Promise<ValidateResponse> {
    return this.authService.validate(data);
  }

  @GrpcMethod('AuthService', 'Refresh')
  refresh(data: RefreshRequest): Promise<RefreshResponse> {
    return this.authService.refresh(data);
  }
}
