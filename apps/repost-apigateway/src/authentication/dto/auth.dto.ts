export class RegisterRequest {
  email!: string;
  password!: string;
}

export class LoginRequest {
  email!: string;
  password!: string;
  ipAddress?: string;
  userAgent?: string;
}

export class ValidateRequest {
  token!: string;
}

export class RefreshRequest {
  refreshToken!: string;
  refreshTokenId!: string;
}
