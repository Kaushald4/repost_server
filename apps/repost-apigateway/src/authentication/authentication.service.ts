import { Injectable, OnModuleInit, Inject } from '@nestjs/common';
import type { ClientGrpc } from '@nestjs/microservices';
import { Observable } from 'rxjs';
import {
  RegisterRequest,
  LoginRequest,
  ValidateRequest,
  RefreshRequest,
} from './dto/auth.dto';

interface AuthService {
  register(data: RegisterRequest): Observable<any>;
  login(data: LoginRequest): Observable<any>;
  validate(data: ValidateRequest): Observable<any>;
  refresh(data: RefreshRequest): Observable<any>;
}

@Injectable()
export class AuthenticationService implements OnModuleInit {
  private authService!: AuthService;

  constructor(@Inject('AUTH_SERVICE') private client: ClientGrpc) {}

  onModuleInit() {
    this.authService = this.client.getService<AuthService>('AuthService');
  }

  register(data: RegisterRequest) {
    return this.authService.register(data);
  }

  login(data: LoginRequest) {
    return this.authService.login(data);
  }

  validate(data: ValidateRequest) {
    return this.authService.validate(data);
  }

  refresh(data: RefreshRequest) {
    return this.authService.refresh(data);
  }
}
